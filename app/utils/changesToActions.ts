import { singleItem } from './singleItem';
import { DatabaseChanges, action } from './../types';
import { reject, isNil, compose, isEmpty, values, mapObjIndexed, evolve, prop, map, when, ifElse, anyPass } from 'ramda';
import { actionsSets } from './actionsSets'; 
import { isArray } from './isSomething';


export let changesToActions = (dbname:string) => (change:DatabaseChanges<any>) : action[] => {
    const actionsSet = actionsSets[dbname];
    /*
        actionsSet
        { 
            add: {withOne:"addTodo", withMany:"addTodos"}, 
            remove: {withOne:"removeTodo", withMany:"removeTodos"}, 
            update: {withOne:"updateTodo", withMany:"updateTodos"}
        }
    */
 
    
    return compose(
        map(action => ({...action,kind:"sync"})),
        reject(anyPass([isNil, isEmpty])),
        values,
        evolve({ remove:evolve({ load:ifElse( isArray, map(prop('_id')), prop('_id') ) }) }), 
        mapObjIndexed(
            (list:any[],changeType:string) : action => {
                let actionTypes = actionsSet[changeType];
               
                if(isEmpty(list)){ 
                    return null;  
                }else if(singleItem(list)){ 
                    return { type:actionTypes["withOne"], load:list[0] }
                }else{
                    return { type:actionTypes["withMany"], load:list }
                }
            }    
        )
    )(change)
};
