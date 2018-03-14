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
  reject, prop, pick, evolve, when, ifElse, groupBy, and, adjust,
  cond, defaultTo, find
} from 'ramda'; 
import { Store } from './../app';
import { ipcRenderer } from 'electron';
let Promise = require('bluebird');
import axios from 'axios';
import { 
    isNotNil, fiveMinutesLater, addTime, inPast, distanceInOneDay, 
    fromMidnightToMidnight, timeDifferenceHours, differentDays,
    sameDay, timeIsMidnight, oneMinutesBefore, oneDayBehind, log, inPastRelativeTo 
} from '../utils/utils'; 
let ical = require('ical.js'); 
let RRule = require('rrule');
import * as icalR from '../ical/index.js'; 
import { isDate, isEvent } from '../utils/isSomething';
import { assert } from '../utils/assert';


type vcalPropsInitial = [string,Object,string,string];


type rcal = {dates:Date[],ends:Date,name:string,rrule:any}[];


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
    sequenceEnd?:boolean, 
    sequenceStart?:boolean
}


export interface CalendarProps{ 
    name:string,
    description:string,
    timezone:string
} 


export interface AxiosError{
    name:string,
    message:string 
}


export type IcalData = {
    calendar : CalendarProps, 
    events : CalendarEvent[],
    error? : AxiosError
} 


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



let eventInPast = (event:CalendarEvent) : boolean => inPast(event.start) && inPast(event.end);



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
    };
};



let sameDayEvent = (event:CalendarEvent) : boolean => {
    //assert(isEvent(event), `event is not of type CalendarEvent. sameDayEvents. ${event}`);

    let start = event.start ? new Date(event.start) : event.start;
    let end = event.end ? new Date(event.end) : event.end;

    let t = timeDifferenceHours(start,end) < 24;
    let s = sameDay(start,end);

    return and(t,s);
};



let fullDayEvent = (event:CalendarEvent) : boolean => {
    //assert(isEvent(event), `event is not of type CalendarEvent. fullDayEvents. ${event}`);
    let start = event.start ? new Date(event.start) : new Date();
    let end = event.end ? new Date(event.end) : new Date();

    let d = distanceInOneDay(start,end);
    let m = fromMidnightToMidnight(start, end);
    let t = Math.round( timeDifferenceHours(start,end) )===24;

    return d && m && t; 
};



let multipleDaysEvent = (event:CalendarEvent) : boolean => {
    //assert(isEvent(event), `event is not of type CalendarEvent. multipleDaysEvents. ${event}`);
    let start = event.start ? new Date(event.start) : new Date();
    let end = event.end ? new Date(event.end) : new Date();
    let f = fullDayEvent(event);

    if(f){ 
       return false; 
    }else{ 
       return differentDays(start,end); 
    } 
};



let splitLongEvents = (events:CalendarEvent[]) : CalendarEvent[] => {
    if(isNil(events) || isEmpty(events)){ return [] }

    return compose( 
        flatten, 
        map(
            (event:CalendarEvent) => compose( 

                (range) => adjust(assoc('sequenceEnd', true), range.length-1, range), 

                adjust(assoc('sequenceStart', true), 0 ),
 
                map((date:Date) => ({...event,start:date})),

                () => {
                    //getRangeDays(event.start,event.end,1,true)
                    let rule = new RRule({
                        freq:RRule.DAILY,
                        interval:1,
                        dtstart:event.start,
                        until:event.end
                    });

                    return rule.all(); 
                }, 
            )()
        ) 
    )(events) as CalendarEvent[];  
};

export let convertEventDate = (event:CalendarEvent) : CalendarEvent => {
    let start = event.start ? new Date(event.start) : new Date();
    let end = event.end ? new Date(event.end) : new Date();
    
    return {...event, start, end};
};


let groupEvents = (events:CalendarEvent[]) : CalendarEvent[] => 
    compose( 
        flatten,

        values,

        evolve({
            sameDayEvents:map((event) =>  convertEventDate({ ...event, type:'sameDayEvents' })),

            fullDayEvents:map((event) =>  convertEventDate({ ...event, type:'fullDayEvents' })),

            multipleDaysEvents:compose(
                map((event) =>  convertEventDate({ ...event, type:'multipleDaysEvents' })), 
                splitLongEvents,
                map((event) =>  convertEventDate({ ...event, end:when(timeIsMidnight, oneMinutesBefore)(event.end) })),
            )  
        }),  
        /*
        evolve({
            sameDayEvents:(events) => {
                events.forEach((event) => console.log(`${event.name} - sameDayEvents, ${event}`))
                return events;
            },
            fullDayEvents:(events) => {
                events.forEach((event) => console.log(`${event.name} - fullDayEvents, ${event}`))
                return events;
            },
            multipleDaysEvents:(events) => {
                events.forEach((event) => console.log(`${event.name} - multipleDaysEvents, ${event}`))
                return events;
            }
        }),
        */
        groupBy(
            cond(
                [
                    [sameDayEvent, () => 'sameDayEvents'],
                    [fullDayEvent, () => 'fullDayEvents'],
                    [multipleDaysEvent, () => 'multipleDaysEvents']
                ]
            )
        )
    )(events);
 

let parseRecEvents = (
    limit:Date,
    icalData:string
) : {
    dates:Date[],
    ends:Date,
    name:string,
    rrule:any
}[] => compose( 
    map(
        ifElse(
            (event:{name:string, rrule:any, ends:any}) => isNil(event.ends),
            (event:{name:string, rrule:any, ends:any}) => {
                let rule = event.rrule; 
                let count : number = path(['options','count'],rule);

                if(isNil(count)){ //never ends -> slice
                   let dates = rule.between(oneDayBehind(),new Date(limit));
                   return {...event, dates}; 
                }else{ 
                   let dates = rule.all(); 
                   return {...event, dates};
                }
            },
            (event:{name:string, rrule:any, ends:any}) => {
                let rule = event.rrule;
                let dates = rule.all();
                return {...event, dates};
            },
        )
    ), 
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
                    'until'//,'wkst' 
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



let parseCalendar = (limit:Date, icalData:string) : {calendar:CalendarProps, events:CalendarEvent[]} => {
    const calendarName = "x-wr-calname";
    const calendarTimezone = "x-wr-timezone";
    const calendarDescription = "x-wr-caldesc";
    const empty = {calendar:{name:null,description:'',timezone:''}, events:[]};

    let jcal = ical.parse(icalData);
    let rcal : rcal = parseRecEvents(limit,icalData);

    let setRecurrent = (event:CalendarEvent) => {
        let target = rcal.find((e) => e.name===event.name);
        if(isNotNil(target)){
            let {dates, ends, name, rrule} = target;
            let {start, end} = event;
            let interval = end.getTime() - start.getTime();
            return map( (date:Date) => ({...event,start:date,end:addTime(date,interval) }), dates );
        }else{
            return event;
        }
    };

    let findByName = (list:any[],prop:string) => compose(
        (item) => item ? item.value : '', 
        find((el) => el.name===prop)
    )(list); 

    // -> jcal
    let getCalendar = compose(
        (vcalProps:vcalProps[]) => ({
            name:findByName(vcalProps,calendarName),
            description:findByName(vcalProps,calendarDescription),
            timezone:findByName(vcalProps,calendarTimezone)
        }),
        map(
            (d:vcalPropsInitial) : vcalProps => ({
                name:d[0],
                object:d[1],
                type:d[2], 
                value:d[3]
            })  
        ), 
        defaultTo([]),
        prop('1')
    );

    // -> jcal
    let getEvents = compose(  
        groupEvents, 
        reject(inPastRelativeTo(oneDayBehind())),
        map(convertEventDate),
        flatten, 
        map(compose(setRecurrent,parseEvent)), 
        (component) => component.getAllSubcomponents("vevent"), 
        (data) => new ical.Component(data)
    );

    return ifElse(
        isNil,
        (jcal) => empty, 
        (jcal) => ({ calendar:getCalendar(jcal),events:getEvents(jcal) })
    )(jcal);
};   
  


export let getIcalData = (limit:Date,url:string) : Promise<IcalData> => 
    axios.get(url)
    .then((response) => {
        let data : string = response.data;
        let {calendar,events} = parseCalendar(limit,data);
        
        if(isNil(calendar.name) || isEmpty(calendar.name)){ calendar.name = url }

        return {calendar,events}; 
    }) 
    .catch((error) => ({error}) as any); 
     


export let updateCalendars = (limit:Date, calendars:Calendar[], onError:Function) : Promise<Calendar[]> => {
    
    return Promise.all(
        calendars.map((c:Calendar) =>  
            getIcalData(limit, c.url)
            .then(
                (data:IcalData) => {
                    let {calendar,events,error} = data as IcalData;

                    if(isNotNil(error)){  
                       onError(error);
                       return c; 
                    }   
 
                    return{
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
    );
}; 
