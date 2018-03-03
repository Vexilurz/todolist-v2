  
import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { 
    getTodos, queryToTodos, Todo, updateTodo, Project, Area, 
    removeTodos, removeProjects, removeAreas, updateProjects, updateTodos, 
    updateAreas, Heading, LayoutItem, Calendar } from './../database';
import Moon from 'material-ui/svg-icons/image/brightness-3';
import { 
    contains, isNil, all, prepend, isEmpty, last,
    not, assoc, flatten, toPairs, map, compose, allPass, uniq 
} from 'ramda'; 
import { Store } from './../app';
import { ipcRenderer, remote } from 'electron';
let Promise = require('bluebird');
let ical = require('ical.js'); 
import axios from 'axios';


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
}


let parseCalendar = (icalData:string) : {calendar : CalendarProps, events : CalendarEvent[]} => {

    let jcal : any[] = ical.parse(icalData);

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
    }
    
    let vcal = new ical.Component(jcal);
    let vevents = vcal.getAllSubcomponents("vevent");
    let events = map(parseEvent,vevents);  
 
    return {calendar, events}
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
 

export let getIcalData = (url:string) : Promise<IcalData> => 
    axios.get(url)
    .then((response) => {
        let data : string = response.data;
        let {calendar,events} = parseCalendar(data);
        if(isNil(calendar.name) || isEmpty(calendar.name)){ calendar.name = url }
        return {calendar,events} 
    }) 
    .catch((error) => ({error}) as any); 
    

export let updateCalendars = (calendars:Calendar[], onError:Function) : Promise<Calendar[]> => {
    return Promise.all(
        calendars.map((c:Calendar) => 
            getIcalData(c.url)
            .then( 
                (data:IcalData)=> {
                    let {calendar,events,error} = data as IcalData;

                    if(!isNil(error)){  
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
                    }
                }
            )    
        )
    )
} 
