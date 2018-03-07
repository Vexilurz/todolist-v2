import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { 
  getTodos, queryToTodos, Todo, updateTodo, Project, Area, 
  removeTodos, removeProjects, removeAreas, updateProjects, 
  updateTodos, updateAreas, Heading, LayoutItem, Calendar 
} from './../database';
import Moon from 'material-ui/svg-icons/image/brightness-3';
import { 
  contains, isNil, all, prepend, isEmpty, last, not, values, 
  assoc, flatten, toPairs, map, compose, allPass, uniq, path,
  reject, prop, pick, evolve, when, ifElse
} from 'ramda'; 
import { Store } from './../app';
import { ipcRenderer, remote } from 'electron';
let Promise = require('bluebird');
import axios from 'axios';
import { isNotNil } from '../utils/utils'; 
let ical = require('ical.js'); 
let RRule = require('rrule')
import * as icalR from '../ical/index.js'; 


type vcalPropsInitial = [string,Object,string,string];


interface vcalProps{
    name:string,
    object:Object,
    type:string,
    value:string
}


export interface CalendarEvent{ 
    name:string,
    start:Date,
    end:Date, 
    description:string,
    type?:string
}


export interface CalendarProps{ 
    name:string,
    description:string,
    timezone:string
} 


let parseEvent = (vevent:any) : CalendarEvent => { 

    if(isNil(vevent)){ 
        return {
           name:null, 
           start:null, 
           end:null, 
           description:null
        }  
    }  

    let start = vevent.getFirstPropertyValue("dtstart");
    let end = vevent.getFirstPropertyValue("dtend");
    
    return { 
      name:vevent.getFirstPropertyValue("summary"), 
      start:isNil(start) ? null : start.toJSDate(),
      end:isNil(end) ? null : end.toJSDate(),
      description:vevent.getFirstPropertyValue("description")
    }
};


let log = (msg) => (item) => {
    console.log(msg,item);
    return item;
};


interface rrule{
    options:{
        byeaster:any,
        byhour:any,
        byminute:any,
        bymonth:any,
        bymonthday:any,
        bynmonthday:any,
        bynweekday:any,
        bysecond:any,
        bysetpos:any,
        byweekday:any,
        byweekno:any,
        byyearday:any,
        count:any,
        dtstart:Date,
        freq:number,
        interval:number,
        until:Date,
        wkst:0
    },
    origOptions:any
    timeset:any[]
    _cache:any
};


let parseCalendar = (limit:Date, icalData:string) : {calendar:CalendarProps, events:CalendarEvent[]} => {
    let jcal : any[] = ical.parse(icalData); 

    // name : RRule object
    let recurrentByName : {name:string, rrule:any, ends:any}[] = compose(
        map( 
            (e) : {name:string, rrule:any, ends:any} => ({
                name:e.summary,
                rrule:compose(
                    (options) => new RRule(options),
                    evolve({ 
                        dtstart:when(isNotNil,(date) => new Date(date)),
                        until:when(isNotNil,(date) => new Date(date))
                    }),
                    pick([
                        'byeaster','byhour','byminute','bymonth',
                        'bymonthday','bynmonthday','bynweekday','bysecond',
                        'bysetpos','byweekday','byweekno','byyearday',
                        'count','dtstart','freq','interval',
                        'until','wkst'
                    ]),
                    path(['rrule','options'])
                )(e), 
                ends:path(['rrule','options','until'],e)
            }),
        ),
        reject( (e) => isNil(e.rrule) ),
        values,
        (data) => icalR.parseICS(data)
    )(icalData);

    debugger; 

    let toDates =  map(
        ifElse(
            (event:{name:string, rrule:any, ends:any}) => isNil(event.ends),
            (event:{name:string, rrule:any, ends:any}) => {
                let rule = event.rrule;
                let dates = rule.between(new Date(),limit);
                return {...event, dates}; 
            },
            (event:{name:string, rrule:any, ends:any}) => {
                let rule = event.rrule;
                let dates = rule.all();//event.ends
                return {...event, dates};
            },
        )
    )(recurrentByName);

    debugger;

    if(isEmpty(jcal)){ return null }

    let vcalendarProps : vcalProps[] = map(
       (d:vcalPropsInitial) => ({
            name:d[0],
            object:d[1],
            type:d[2], 
            value:d[3]
        })  
    )(jcal[1]);

    const calendarName = "x-wr-calname";
    const calendarTimezone = "x-wr-timezone";
    const calendarDescription = "x-wr-caldesc";
     
    let name : vcalProps = vcalendarProps.find( (el) => el.name===calendarName );
    let description : vcalProps = vcalendarProps.find( (el) => el.name===calendarDescription );
    let timezone : vcalProps = vcalendarProps.find( (el) => el.name===calendarTimezone );

    let calendar = {
        name:isNil(name) ? "" : name.value,
        description:isNil(description) ? "" : description.value,
        timezone:isNil(timezone) ? "" : timezone.value
    };
    
    let vcal = new ical.Component(jcal);
    let vevents = vcal.getAllSubcomponents("vevent");
    let events = map(
        compose(
           parseEvent
        ),
        vevents
    );  
 
    return {calendar, events};
};
  

export interface AxiosError{
    name:string,
    message:string 
}


export type IcalData = {
    calendar : CalendarProps, 
    events : CalendarEvent[],
    error? : AxiosError
} 
 

export let getIcalData = (limit:Date,url:string) : Promise<IcalData> => 
    axios.get(url)
    .then((response) => {
        let data : string = response.data;
        let {calendar,events} = parseCalendar(limit,data);
        if(isNil(calendar.name) || isEmpty(calendar.name)){ calendar.name = url }
        return {calendar,events} 
    }) 
    .catch((error) => ({error}) as any); 
    

export let updateCalendars = (limit:Date, calendars:Calendar[], onError:Function) : Promise<Calendar[]> => {
    return Promise.all(
        calendars.map((c:Calendar) => 
            getIcalData(limit, c.url)
            .then( 
                (data:IcalData)=> {
                    let {calendar,events,error} = data as IcalData;

                    if(isNotNil(error)){  
                        onError(error);
                        return c; 
                    }   
 
                    return {
                        url:c.url,  
                        name:calendar.name,
                        description:calendar.description,
                        timezone:calendar.timezone,
                        active:c.active,
                        events,
                        type:c._id, 
                        _id:c._id
                    };
                }
            )    
        )
    )
}; 
