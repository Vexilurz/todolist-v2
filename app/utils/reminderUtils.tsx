import { 
    isNil, not, map, isEmpty, compose, contains,
    prop, when, evolve, ifElse, applyTo, allPass,
    flatten, reject                 
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


let scheduleReminder = (todo) : number => {
    if(isDev()){
        assert(
           isDate(todo.reminder),
           `reminder is not of type Date. scheduleReminder. ${todo.reminder}.`
        );
    }
    
    return setCallTimeout(
        () => {
            ipcRenderer.send('remind',[todo]); 
            if(isDev()){ console.log(`1) emit:${todo.title}`); }
        },
        todo.reminder
    ); 
};



let clearScheduledReminders = (store:Store) : Store => {
    let scheduledReminders = store.scheduledReminders;
    scheduledReminders.forEach(t => {
        assert(isNumber(t),`Error:clearScheduledReminders.`);
        clearTimeout(t);
    }); 
    return {...store,scheduledReminders:[]};
};



export let refreshReminders = (prevState:Store, newState:Store) : Store => {
    if(
        isNil(prevState) || 
        isNil(newState) || 
        prop('clone',newState) ||
        prevState.todos===newState.todos
    ){ return newState }

 
    return compose(
        (scheduledReminders:number[]) : Store => ({...newState,scheduledReminders}),

        (scheduledReminders:number[]) => {
           let timers = filter(scheduledReminders, isNotNil);
           if(isDev()){ console.log(`scheduled reminders : ${timers.length}`) }
           return timers;
        },     

        map((todo) : number => scheduleReminder(todo)), //create timeout for each reminder

        (todos:Todo[]) => filter(
            todos, 
            allPass([byNotCompleted,byNotDeleted,compose(isDate,prop('reminder'))])
        ), //only todos with reminder left
        
        prop('todos'), //get todos from current state   

        clearScheduledReminders //suspend existing timeouts
    )(newState);
};
