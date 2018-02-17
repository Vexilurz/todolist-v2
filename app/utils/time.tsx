import {assert} from './assert';
import {isDate} from './isSomething';

export let timeOfTheDay = (date:Date) : string => {
    assert(isDate(date), `input is not a date. ${date}. timeOfTheDay.`);

    let hours = String(date.getHours());
    let minutes = String(date.getMinutes());
    
    hours = hours.length === 1 ? `0${hours}` : hours;
    minutes = minutes.length === 1 ? `0${minutes}` : minutes;                                                                                         
    
    return `${hours}:${minutes}`;
}  