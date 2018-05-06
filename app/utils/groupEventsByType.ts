import {
    allPass, uniq, isNil, cond, compose, not, last, isEmpty, adjust,and, contains, where,
    map, flatten, prop, uniqBy, groupBy, defaultTo, all, pick, evolve, or, sortBy, any,
    mapObjIndexed, forEachObjIndexed, path, values, equals, append, reject, anyPass
} from 'ramda';
import { typeEquals } from './utils';
import { CalendarEvent } from '../types';



export let groupEventsByType = (events:CalendarEvent[]) : { 
    sameDayEvents:CalendarEvent[], 
    fullDayEvents:CalendarEvent[]
} => compose(
    ({sameDayEvents,fullDayEvents}) => ({
        sameDayEvents:defaultTo([],sameDayEvents), 
        fullDayEvents:defaultTo([],fullDayEvents) 
    }),
    groupBy( 
        cond(
            [
                [typeEquals('sameDayEvents'), () => 'sameDayEvents'],
                [typeEquals('fullDayEvents'), () => 'fullDayEvents'],
                [
                    typeEquals('multipleDaysEvents'), 
                    cond([
                        [prop('sequenceEnd'), () => 'sameDayEvents'],
                        [prop('sequenceStart'), () => 'sameDayEvents'],
                        [() => true, () => 'fullDayEvents'],
                    ])
                ]
            ]
        )
    )
)(events);
 