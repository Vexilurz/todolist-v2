import { 
    isNil, not, map, isEmpty, compose, contains,
    prop, when, evolve, ifElse, applyTo, allPass,
    flatten, reject, all, concat, identity                 
} from 'ramda';
import { isString, isDate, isNumber, isNotNil } from './isSomething';
import { requestFromMain } from './requestFromMain';
import { assert } from './assert';
import { setCallTimeout } from './setCallTimeout';
import { filter } from 'lodash';
import { Store,Todo } from '../types';
import { byNotCompleted, byNotDeleted } from './utils';
import { isDev } from './isDev';
import { ipcRenderer } from 'electron';
import { inFuture, inPast } from './time';
import { globalErrorHandler } from './globalErrorHandler';



let scheduleReminder = (todo:Todo) : number => {
    if(isNil(todo)){ return null }

    if(isDev()){
       assert(isDate(todo.reminder), `reminder is not of type Date. scheduleReminder. ${todo.reminder}.`);
    }
    
    return setCallTimeout(
        () => {
            if(isDev()){ console.log(`1) emit - ${todo.title}`) }
            ipcRenderer.send('remind',todo);
        }, 
        todo.reminder
    ); 
};



let clearScheduledReminders = (store:Store) : Store => {
    let scheduledReminders = store.scheduledReminders;

    scheduledReminders.forEach(
        t => {
            if(isDev()){
               assert(isNumber(t),`t is not of type Number. ${t}. clearScheduledReminders.`);
            }

            clearTimeout(t);
        }
    ); 

    return {...store,scheduledReminders:[]};
};



export let refreshReminders = (prevState:Store, newState:Store) : Store => {

    if(
        isNil(prevState) || 
        isNil(newState)
    ){ 
        return newState; 
    }

    //dont emit reminders from cloned lists
    if(
        prop('clone',prevState) || 
        prop('clone',newState)
    ){ 
        return newState; 
    }
    
    //if todos and settings left unchanged do nothing
    if(
        prevState.todos===newState.todos && 
        prevState.disableReminder===newState.disableReminder
    ){  
        return newState; 
    }
    
    //if reminder disabled - clear possible scheduled reminders
    if(newState.disableReminder){ return clearScheduledReminders(newState); }



    let state = compose(
        (scheduledReminders:number[]) : Store => ({...newState,scheduledReminders}),

        (scheduledReminders:number[]) => {
           let timers = filter(scheduledReminders, isNotNil);
           if(isDev()){ console.log(`scheduled reminders : ${timers.length}`) }
           return timers;
        },     

        map((todo) : number => scheduleReminder(todo)), //create timeout for each reminder

        (todos:Todo[]) => filter(
            todos, 
            allPass([ 
                byNotCompleted,   
                byNotDeleted, 
                compose(inFuture,prop('reminder')) //only reminders from future
            ])
        ), //only todos with reminder left
        
        prop('todos'), //get todos from current state  

        clearScheduledReminders //suspend existing timeouts
    )(newState);


    
    return state;
};