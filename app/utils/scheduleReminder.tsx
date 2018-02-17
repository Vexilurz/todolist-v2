import {assert} from './assert';
import {isDate} from './isSomething';
import { setCallTimeout } from './setCallTimeout';
import { findWindowByTitle } from './utils';

export let scheduleReminder = (todo) : number => { 
    
    assert(isDate(todo.reminder),`reminder is not of type Date. scheduleReminder. ${todo.reminder}.`);

    let schedule = () => {
        let notification : any = findWindowByTitle('Notification');
        notification.webContents.send('remind', todo);
    };  

    return setCallTimeout(() => schedule(), todo.reminder); 
};