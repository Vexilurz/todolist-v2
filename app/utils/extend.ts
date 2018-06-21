
import { 
    Todo, Project, Area, 
    Calendar, Category, CalendarEvent, 
    RepeatOptions, objectsByDate 
} from './../types';
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
import { filter } from 'lodash'; 
import { repeat } from '../Components/RepeatPopup';
import { assert } from './assert';
import { isDev } from './isDev';
import { isDate, isArrayOfTodos } from './isSomething';



export let extend = (projects:Project[], limit:Date, todos:Todo[]) : Todo[] => {
    let compareByAttachedDate = compareByDate((todo:Todo) => todo.attachedDate);
    let groupButNotAfter = compose(anyPass([equals('never'),equals('on')]), path(['group','type']));
    let repeated = compose( 
        flatten, 
        values,
        map(
            compose(
               (todo:Todo) => {
                    if(isNil(todo)){ return [] }
                    let group = todo.group;
                    let projectId = group.projectId;
                    let project = undefined;

                    console.log(`extend recent projectId:${projectId}`, todo);
                    
                    if(projectId){
                       project = projects.find(p => p._id===projectId);
                       console.log(`target project`, project);
                    }
                    
                    let options : RepeatOptions = compose( evolve({until:initDate}), prop('options') )(group);
                    let start = defaultTo(new Date())(todo.attachedDate);
                    let todos = repeat(options, todo, start, limit, group._id, project);

                    if(isDev()){
                        let withStart = [...todos.map(t => t.attachedDate), start];
                        let by = uniqBy(d => d.toString(), withStart);
            
                        assert(
                            by.length===withStart.length, 
                            `
                            dates repeat. extend. ${options.selectedOption}. 
                            length - ${withStart.length}; 
                            by - ${by.length};
                            `
                        ); 
                    }
                    return todos; 
                },   
               (todos) => todos[0],
               (todos) => todos.sort(compareByAttachedDate) /*.filter(t => isDate(t.attachedDate))*/
            )
        ),
        groupBy(path(['group','_id'])),
        (todos) => filter(todos, groupButNotAfter)
    )(todos);


    if(isDev()){
       assert(isArrayOfTodos(repeated),`repeated is not of type array of todos. extend.`);
       assert(all(t => isDate(t.attachedDate),repeated),`not all repeated have date. extend.`);
    }  

    return repeated;
};


