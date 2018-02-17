import {assert} from './assert';
import {isDate} from './isSomething';
import { setCallTimeout } from './setCallTimeout';
import { findWindowByTitle } from './utils';

export let scheduleReminder = (todo) : number => { 
    let reminder = todo.reminder; 
    
    assert(isDate(reminder),`reminder is not of type Date. scheduleReminder. ${reminder}.`);

    let schedule = () => {
        let notification : any = findWindowByTitle('Notification');
        notification.webContents.send('remind', {message:todo.title,reminder,todo});
    };

    return setCallTimeout(() => schedule(), reminder ); 
};