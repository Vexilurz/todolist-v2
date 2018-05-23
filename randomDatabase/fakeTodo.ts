import { 
    uniq, splitEvery, contains, isNil, not, and, 
    evolve, when, map, reject, range, flatten, 
    isEmpty, complement, equals, compose, ifElse, anyPass 
} from 'ramda';
import { parseCalendar } from '../app/Components/Calendar';
import { isToday, isString } from '../app/utils/isSomething';
import { keyFromDate, getTime, setTime, fiveMinutesBefore, fiveMinutesLater, onHourLater } from '../app/utils/time';
import { Project, Calendar, Area, Todo, Category, ChecklistItem, Heading, LayoutItem, IcalData } from '../app/types';
import { generateId } from '../app/utils/generateId';
import { noteFromText } from '../app/utils/draftUtils';
import { randomDate, randomInteger, randomCategory } from './utils';
let randomWords = require('random-words');
const randomWord = () => randomWords();//require('random-word');
let uniqid = require("uniqid"); 
let ical = require('ical-generator');
let different = complement(equals);
const fs = require('fs');
const path = require('path');



Date.prototype["addDays"] = function(days){
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat; 
}; 



let fakeCheckListItem = (idx) : ChecklistItem => { 

    let words : string[] = [];
    let k = randomInteger(3) + 2;


    for(let i=0; i<k; i++)
        words.push(randomWord());  
    

    return {  
        text : words.join(' '), 
        checked : Math.random() > 0.5 ? true : false,
        idx : idx, 
        key : generateId(),
        _id : generateId()  
    } 
};
  


export let fakeTodo = (tags:string[], withReminder:number) : Todo => {
    let checked = Math.random() > 0.5 ? true : false;
    
    let title : string[] = ['todo'];
    let note : string[] = [];
    let checklist = []; 

    let k = randomInteger(3) + 2;
    let n = randomInteger(6) + 2;
    let c = randomInteger(5) + 2;
    
    for(let i=0; i<k; i++){
        title.push(randomWord()); 
    } 

    for(let i=0; i<n; i++){ 
        note.push(randomWord());  
    }

    for(let i=0; i<c; i++){ 
        checklist.push(fakeCheckListItem(i));  
    }

    let attachedDate = Math.random() < 0.3 ? null :
                       Math.random() > 0.5 ? 
                       randomDate(new Date(), new Date()["addDays"](50)) : 
                       new Date();

    let deleted = Math.random() < 0.2 ? randomDate(new Date(), new Date()["addDays"](-50)) : undefined; 
    
    let completedSet = checked ? new Date() : null;
    
    let completedWhen = checked ? randomDate(new Date(), new Date()["addDays"](-50)) : null;                

    /*let reminder = isToday(attachedDate) && isNil(deleted) && not(checked) ?  
                   randomDate(new Date(), fiveMinutesBefore(new Date())) : 
                   null; */

    let reminder = (isToday(attachedDate) && isNil(deleted) && not(checked)) ?  
                   randomDate(fiveMinutesBefore(new Date()), onHourLater(new Date())) :  
                   null; //onHourLater(date) //fiveMinutesLater(date);
     
    //reminder = randomDate(new Date(), new Date()["addDays"](-50)); 
    let category = randomCategory();


    return {   
        _id:generateId(),     
        type:"todo",
        category, 
        title:title.join(' '), 
        priority:Math.random()*999999999,
        note:noteFromText(note.join(' ')), 
        checklist:checklist,   
        reminder, //:null,  
        attachedTags:tags,   
        deadline:category==="someday" ? null :
                 Math.random() < 0.3 ? null :
                 Math.random() > 0.5 ?
                 randomDate(new Date(), new Date()["addDays"](50)) : 
                 new Date(), 
        created:randomDate(new Date(), new Date()["addDays"](50)),
        deleted,
        attachedDate:category==="someday" ? null : attachedDate,
        completedSet,
        completedWhen 
    };   
};