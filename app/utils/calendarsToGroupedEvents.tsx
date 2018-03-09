import {
    allPass, uniq, isNil, cond, compose, not, last, isEmpty, adjust,
    map, flatten, prop, uniqBy, groupBy, defaultTo, all, pick, when,
    evolve, and, assoc
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
    oneMinutesBefore,
    sameDay,
    fromMidnightToMidnight,
    differentDays,
    distanceInOneDay,
    timeIsMidnight
} from './utils';  
import { CalendarEvent } from '../Components/Calendar';
import { Calendar } from '../database';
import { isDate, isEvent } from './isSomething';
import { assert } from './assert';


let sameDayEvent = (event:CalendarEvent) : boolean => {
    assert(isEvent(event), `event is not of type CalendarEvent. sameDayEvents. ${event}`);
    return and(
        timeDifferenceHours(event.start,event.end) < 24,
        sameDay(event.start,event.end)
    );
};


let fullDayEvent = (event:CalendarEvent) : boolean => {
    assert(isEvent(event), `event is not of type CalendarEvent. fullDayEvents. ${event}`);
    return distanceInOneDay(event.start,event.end) &&
           fromMidnightToMidnight(event.start, event.end) &&
           Math.round( timeDifferenceHours(event.start,event.end) )===24;
};


let multipleDaysEvent = (event:CalendarEvent) : boolean => {
    assert(isEvent(event), `event is not of type CalendarEvent. multipleDaysEvents. ${event}`);
    
    if(fullDayEvent(event)){ return false }
    else{ return differentDays(event.start,event.end) }
};


let log = (msg) => (item) => {
    console.log(msg,item);
    return item;
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
                    map((event) => ({...event, type:'multipleDaysEvents' })), 
                    splitLongEvents,
                    map((event) => ({...event, end:when(timeIsMidnight, oneMinutesBefore)(event.end)})),
                )    
            }),  
            groupBy(
                cond(
                    [
                        [sameDayEvent, () => 'sameDayEvents'],
                        [fullDayEvent, () => 'fullDayEvents'],
                        [multipleDaysEvent, () => 'multipleDaysEvents']
                    ]
                )
            ), 
            (events) => events.filter((event) => all(isDate, [event.end,event.start])),
            flatten, 
            map( compose( defaultTo([]), prop('events') ) ), 
            (calendars) => calendars.filter((c:Calendar) => c.active)
        )(calendars);
    
    return calendarEvents;
}; 
