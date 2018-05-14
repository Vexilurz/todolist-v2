import { Todo,Project, Area, Calendar, Category, CalendarEvent, RepeatOptions, objectsByDate } from './../types';
import { 
    byTags, getDayName, getDatesRange, byNotCompleted, byNotDeleted,
    getTagsFromItems, getMonthName, yearFromDate, convertTodoDates,
    getRangeDays, isNotEmpty, typeEquals, compareByDate, monthFromDate,
    log, anyTrue, different, initDate, nDaysFromNow
} from './utils';  
import {
    allPass, uniq, isNil, cond, compose, not, last, isEmpty, adjust,and, contains, where,
    map, flatten, prop, uniqBy, groupBy, defaultTo, all, pick, evolve, or, sortBy, any,
    mapObjIndexed, forEachObjIndexed, path, values, equals, append, reject, anyPass
} from 'ramda';
import { keyFromDate, inPast } from './time';
import { isNotNil, isDate } from './isSomething';
import { filter } from 'lodash';
import { assert } from './assert';
import { isDev } from './isDev';


let haveDate = (item : Project | Todo) : boolean => {  
    if(item.type==="project"){  
        return isNotNil(item.deadline); 
    }else if(item.type==="todo"){ 
        return or(
           isNotNil(item["attachedDate"]), 
           isNotNil(item.deadline)
        );
    }
};



type Item = Project | Todo | CalendarEvent;



export let objectsToHashTableByDate = (props) : objectsByDate => {  
    let {showCalendarEvents,todos,projects} = props;
    let filters = [haveDate, byTags(props.selectedTags), byNotCompleted, byNotDeleted];    
    let todayKey = keyFromDate(new Date());
    let items = filter([...todos, ...projects], i => allPass(filters)(i));
    
    if(showCalendarEvents && isNotNil(props.calendars)){
        compose(
            (events) => items.push(...events), 
            (events) => {
                
                if(isDev()){
                    assert(
                       all(event => isDate(event.start) && isDate(event.end),events),
                       'Error: Events - incorrect type.'
                    ) 
                } 

                return events;
            },
            flatten,
            map(prop('events')),
            (calendars) => filter(calendars, (calendar:Calendar) => calendar.active)
        )(props.calendars)
    };    

    let objectsByDate : objectsByDate = {};

    if(items.length===0){  
       return {objectsByDate:[],tags:[]};
    }
  
    for(let i=0; i<items.length; i++){
        let item = items[i] as any; 
        let keys = [];
        
        if(isDate(item.attachedDate)){
            if(inPast(item.attachedDate)){
               keys.push(todayKey)
            }else{ 
               keys.push(keyFromDate(item.attachedDate));
            }
        }   

        if(isDate(item.deadline)){ 
           keys.push(keyFromDate(item.deadline));
        } 

        if(isDate(item.start)){
           keys.push(keyFromDate(item.start));
        }  

        uniq(keys)
        .map(  
            (key:string) => {
                if(isNil(objectsByDate[key])){
                   objectsByDate[key] = [items[i]];
                }else{
                   objectsByDate[key].push(items[i]);
                }
            } 
        )
    }    
    
    return objectsByDate; 
};   