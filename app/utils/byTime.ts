import { CalendarEvent } from "../types";
import { isDate } from "./isSomething";

export let byTime = (a:CalendarEvent,b:CalendarEvent) => { 
    let aTime = 0;
    let bTime = 0;

    if(isDate(a.start)){
        aTime = a.start.getTime(); 
    }

    if(isDate(b.start)){
        bTime = b.start.getTime(); 
    }
    
    return aTime-bTime;
};
