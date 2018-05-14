import { objectsByDate, Todo, Project, CalendarEvent } from "../types";
import { keyFromDate } from "./time";
import { isDate } from "./isSomething";
import { isNil } from 'ramda';


export let generateCalendarObjectsFromRange = ( 
    range:Date[], 
    objectsByDate:objectsByDate   
) : {date:Date, todos:Todo[], projects:Project[], events:CalendarEvent[]}[] => {

    let objects = [];

    for(let i = 0; i<range.length; i++){
        let object = {
            date : range[i], 
            todos : [], 
            projects : [],
            events : [] 
        }

        let key : string = keyFromDate(range[i]);
        let entry : any = objectsByDate[key];

        if(isNil(entry)){ 
           objects.push(object);
        }else{
           object.todos = entry.filter((el:Todo) => el.type==="todo"); 
           object.projects = entry.filter((el:Project) => el.type==="project"); 
           object.events = entry.filter((el:CalendarEvent) => isDate(el.start)); 
           objects.push(object);  
        }
    } 
     
    return objects; 
};
