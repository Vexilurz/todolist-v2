
import { Todo, Project, RepeatOptions } from './../types';
import { compareByDate, initDate } from './utils';  
import {
    isNil, compose, map, flatten, prop, uniqBy, groupBy, 
    defaultTo, all, evolve, path, values, equals, anyPass
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
                    
                    if(projectId){
                       project = projects.find(p => p._id===projectId);
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


