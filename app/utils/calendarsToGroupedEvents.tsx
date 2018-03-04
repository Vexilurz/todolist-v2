import {
    allPass, uniq, isNil, cond, compose, not, last, isEmpty, adjust,
    map, flatten, prop, uniqBy, groupBy, defaultTo, all, pick, evolve
} from 'ramda';
import {  
    byTags, 
    getDayName, 
    getDatesRange, 
    keyFromDate, 
    byNotCompleted,
    byNotDeleted,
    getTagsFromItems,
    getMonthName,
    yearFromDate,
    convertTodoDates,
    getRangeDays,
    timeDifferenceHours,
    isNotNil,
    setTime,
} from './utils';  
import { CalendarEvent } from '../Components/Calendar';
import { Calendar } from '../database';
import { isDate } from './isSomething';


let sameDay = (event:CalendarEvent) : boolean => {
    return timeDifferenceHours(event.start,event.end) < 23;
};


let fullDay = (event:CalendarEvent) : boolean => {
    return Math.round( timeDifferenceHours(event.start,event.end) ) === 24;
};


let multipleDays = (event:CalendarEvent) : boolean => {
    return timeDifferenceHours(event.start,event.end) > 25;
};


let splitLongEvents = (events:CalendarEvent[]) : CalendarEvent[] => {
    if(isNil(events) || isEmpty(events)){ return [] }

    return compose(
        flatten,
        map(
            (event:CalendarEvent) => compose( 
               (range) => adjust(
                   (event) => ({
                       ...event,
                       end:setTime(event.end, {minutes:0,hours:0})
                    }), 
                    range.length-1, 
                    range
                ), 
                map((date:Date) => ({...event,start:date})),
                () => getRangeDays(event.start,event.end,1,true),
            )()
        ) 
    )(events) as CalendarEvent[];  
};


export let calendarsToGroupedEvents = (calendars:Calendar[]) => {
    let calendarEvents : {
        sameDayEvents:CalendarEvent[], 
        fullDayEvents:CalendarEvent[], 
        multipleDaysEvents:CalendarEvent[]
    } = compose(

        evolve({
            sameDayEvents:map((event) => ({...event,type:'sameDayEvents'})),
            fullDayEvents:map((event) => ({...event,type:'fullDayEvents'})),
            multipleDaysEvents:compose(
                map((event) => ({...event,type:'fullDayEvents'})),
                splitLongEvents
            )
        }),
        
        groupBy(
            cond(
                [
                    [sameDay, () => 'sameDayEvents'],
                    [fullDay, () => 'fullDayEvents'],
                    [multipleDays, () => 'multipleDaysEvents']
                ]
            )
        ), 

        (events) => events.filter((event) => all(isDate, [event.end,event.start])),

        flatten, 

        map( compose( defaultTo([]), prop('events') ) ), 

        (calendars) => calendars.filter((c:Calendar) => c.active)
    )(calendars);

    return calendarEvents;
}
