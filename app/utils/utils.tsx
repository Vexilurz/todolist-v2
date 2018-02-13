import './assets/styles.css';     
import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import {  
  cyan500, cyan700,   
  pinkA200,  
  grey100, grey300, grey400, grey500,
  white, darkBlack, fullBlack,   
} from 'material-ui/styles/colors'; 
import {fade} from 'material-ui/utils/colorManipulator';
import spacing from 'material-ui/styles/spacing'; 
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import Inbox from 'material-ui/svg-icons/content/inbox';
import Star from 'material-ui/svg-icons/toggle/star';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import CheckBoxEmpty from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import CheckBox from 'material-ui/svg-icons/toggle/check-box'; 
import BusinessCase from 'material-ui/svg-icons/places/business-center';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz'; 
import Layers from 'material-ui/svg-icons/maps/layers'; 
import Adjustments from 'material-ui/svg-icons/image/tune';
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Flag from 'material-ui/svg-icons/image/assistant-photo'; 
import NewProjectIcon from 'material-ui/svg-icons/image/timelapse';
import NewAreaIcon from 'material-ui/svg-icons/maps/layers'; 
import Plus from 'material-ui/svg-icons/content/add';
import Trash from 'material-ui/svg-icons/action/delete';
import Search from 'material-ui/svg-icons/action/search'; 
import List from 'material-ui/svg-icons/action/list'; 
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Logbook from 'material-ui/svg-icons/av/library-books';
import Audiotrack from 'material-ui/svg-icons/image/audiotrack';
import { 
    getTodos, queryToTodos, Todo, updateTodo, Project, Area, 
    removeTodos, removeProjects, removeAreas, updateProjects, updateTodos, 
    updateAreas, Heading, LayoutItem, Calendar } from './../database';
import { Category } from '.././Components/MainContainer';
import { ChecklistItem } from '.././Components/TodoInput/TodoChecklist';
let moment = require("moment");
import Moon from 'material-ui/svg-icons/image/brightness-3';
import { 
    contains, isNil, all, prepend, isEmpty, last,
    not, assoc, flatten, toPairs, map, compose, allPass, uniq, cond 
} from 'ramda'; 
import { isDev, Store } from '.././app';
import { setRepeatedTodos, repeat } from '.././Components/RepeatPopup';
import { ipcRenderer, remote } from 'electron';
let Promise = require('bluebird');
let ical = require('ical.js');
import axios from 'axios';
import { Table } from '.././Components/Categories/Next';
const storage = remote.require('electron-json-storage');
import { UpdateInfo, UpdateCheckResult } from 'electron-updater';
const os = remote.require('os'); 
import printJS from 'print-js'; 
import { globalErrorHandler } from './globalErrorHandler';
var PHE = require("print-html-element"); 
import {generateId} from './generateId';
import {assert}  from './assert';
import {daysRemaining} from './daysRemaining'; 
import {stringToLength} from './stringToLength';
import {isItem,isArray,isDate,isFunction,isString,  
 isCategory,bySomeday,isTodo,isArrayOfTodos, 
 isProject,isArrayOfProjects,isArea, 
 isArrayOfAreas,isArrayOfStrings,Item
} from './isSomething';
import {generateEmptyTodo} from './generateEmptyTodo';

export let isMainWindow = () => { 
    return remote.getCurrentWindow().id===1; 
}


export let printElement = (selectedCategory:Category, list:HTMLElement) => {
    let opts = {
        printMode: "iframe", //iframe (default), or popup
        pageTitle: selectedCategory,
        templateString: '{{printBody}}',
        popupProperties: '', //such as menubar, scrollbars
        stylesheets: '', 
        styles: ''
    };  
    
    PHE.printElement( list, opts ); // Prints a DOM Element
    //PHE.printHtml( list, opts ); // Prints an HTML string
}



export let printTodos = (todos:Todo[]) : void => { 
    printJS({printable:todos, type:'json', properties:[]});  
} 


export let measureTime = (f:() => void) => {
    let start : number = performance.now();
    f(); 
    let finish : number = performance.now();
    return finish - start; 
} 



export let byScheduled = (item : Todo) : boolean => {
    if(isNil(item)){ return false } 
    return !isNil(item.deadline) || !isNil(item.attachedDate); 
} 



export let selectNeverTodos = (todos:Todo[]) : Todo[] => {
    return todos.filter( 
        (todo:Todo) => isNil(todo.group) ? false :
                       todo.group.type!=="never" ? false :
                       (
                           todo.group.last &&
                           !isNil(todo.group.options)
                       )
    );
} 



export let updateNeverTodos = (dispatch:Function,never:Todo[],limit:Date) => {

    if(isEmpty(never)){ return }

    for(let i=0; i<never.length; i++){
        let todo :Todo = never[i];
        let {options} = todo.group; 
        let repeatedTodos : Todo[] = repeat(options, todo);

        setRepeatedTodos({dispatch,todo,repeatedTodos,options,limit});
    }
}
 


export let getRangeYearUntilDate = (start:Date,endsDate:Date,repeatEveryN:number) : Date[] => {
    //what if leap year? TODO 
    let last = start;
    let dates = [];

    for(let i = 1; last.getTime() < endsDate.getTime(); i++){
        let next = new Date(start.getTime());
        let year = next.getFullYear();
        next.setFullYear(year + (i*repeatEveryN));
        last = next;
        if(next.getTime()<=endsDate.getTime()){ dates.push(next) }
    }   
    return dates;  
} 



export let getRangeYearRepetitions = (start:Date,endsAfter:number,repeatEveryN:number) : Date[] => {
    let dates = [];
    
    for(let i = 1; i<=endsAfter; i++){
        let next = new Date(start.getTime());
        let year = next.getFullYear();
        next.setFullYear(year + (i*repeatEveryN));
        dates.push(next);
    }

    return dates;
} 



export let getRangeMonthUntilDate = (start:Date, ends:Date, repeatEveryN:number) : Date[] => { 

    let dates = [];
    let last = new Date(start.getTime());
    let dayOfTheMonth : number = start.getDate();
    let initialMonth : number = start.getMonth();

    for(let i = 1; last.getTime() < ends.getTime(); i++){

        let next = new Date(start.getTime());
        next.setDate(1);

        let nextMonth : number = (i*repeatEveryN) + initialMonth;

        next.setMonth(nextMonth);

        let daysInNextMonth : number = daysInMonth(next);

        if(dayOfTheMonth>daysInNextMonth){
           next.setDate(daysInNextMonth);
        }else{
           next.setDate(dayOfTheMonth);
        }     

        last = new Date(next.getTime());  

        if(next.getTime()<=ends.getTime()){ dates.push(next) }
    }
    return dates;
}


export let getCompletedWhen = (moveCompletedItemsToLogbook:string,date:Date) => {
    return cond([
        [
            (value:string) => value==="immediately",
            () => date,
        ],
        [
            (value:string) => value==="min",
            () => fiveMinutesLater(date),
        ],
        [
            (value:string) => value==="hour",
            () => onHourLater(date)
        ],
        [
            (value:string) => value==="day",
            () => oneDayAhead(date)
        ]
    ])(moveCompletedItemsToLogbook);
}


export let getRangeMonthRepetitions = (start:Date, endsAfter:number, repeatEveryN:number) : Date[] => {
    let dayOfTheMonth : number = start.getDate();
    let initialMonth : number = start.getMonth();
    let dates = [];

    for(let i=1; i<=endsAfter; i++){
        let next = new Date(start.getTime());
        next.setDate(1);

        let nextMonth : number = (i*repeatEveryN) + initialMonth;

        next.setMonth(nextMonth);

        let daysInNextMonth : number = daysInMonth(next);

        if(dayOfTheMonth>daysInNextMonth){
           next.setDate(daysInNextMonth);
        }else{
           next.setDate(dayOfTheMonth);
        }     

        dates.push(next);
    }

    return dates;
}



export let getRangeDays = (start:Date, endDate:Date, step:number, includeStart=false) : Date[] => {

    Date.prototype["addDays"] = function(days) {
      let date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
    }
   
    let dates = [];
    let last = dateToYearMonthDay(start);
    let end = dateToYearMonthDay(endDate); 

    if(includeStart){ dates.push(last) }; 
    
    while(last.getTime() < end.getTime()){
      let next = new Date(last.getTime())["addDays"]( step );

      if(next.getTime()<=end.getTime()){ dates.push(next) }
      last = dateToYearMonthDay(next); 
    } 

    return dates; 
}
 


export let getRangeRepetitions = (start:Date, repetitions:number, step:number) : Date[] => {

    Date.prototype["addDays"] = function(days){
      let date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
    }
   
    let dates = [];

    for(let i=1; i <=repetitions; i++){
        let next = new Date(start.getTime())["addDays"]( step*i );
        dates.push(next);
    }

    return dates;
}


 
export let dateInputUpperLimit = (limit = 2050) : string => {
    let now = new Date();  
    let month = now.getUTCMonth() + 1; 
    let d = now.getUTCDate();
    let year = now.getUTCFullYear();

    d = d < 10 ? `0${d}` : d.toString() as any;
    month = month < 10 ? `0${month}` : month.toString() as any;
    let end = String(limit) + "-" + month + "-" + d; 

    return end;
} 



export let daysInMonth = (date:Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();



export let dateToYearMonthDay = (date:Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);



export let yearFromDate = (date:Date) => {
    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;   
    }
      
    return date["addDays"](365);
}



export let isNewVersion = (current:string, next:string) => cmpVersions(current, next)<0;



let cmpVersions = (current:string, next:string) => {
    let i, diff;
    let regExStrip0 = /(\.0+)+$/;
    let segmentsA = current.replace(regExStrip0, '').split('.');
    let segmentsB = next.replace(regExStrip0, '').split('.');
    let l = Math.min(segmentsA.length, segmentsB.length);

    for (i = 0; i < l; i++) {
        diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
        if(diff){ return diff }
    }

    return segmentsA.length - segmentsB.length;
}



export let yearFromNow = () => {
    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;   
    }
      
    return new Date()["addDays"](365);
}



export let threeDaysLater = (date:Date) : Date => { 

    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;   
    }
      
    return new Date(date.getTime())["addDays"](3);
} 



export let oneDayAhead = (date:Date) : Date => { 

    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;   
    }
      
    return new Date(date.getTime())["addDays"](1);
} 



export let fiveMinutesLater = (date:Date) : Date => { 
    let fiveMinutesMs = 1000 * 60 * 5;
    return new Date(date.getTime() + fiveMinutesMs);
} 



export let onHourLater = (date:Date) : Date => {  
    let oneHourMs = 1000 * 60 * 60; 
    return new Date(date.getTime() + oneHourMs);
} 



export let oneDayBehind = () : Date => { 

    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;   
    } 
      
    return new Date()["addDays"](-1);
} 



export let dateToDateInputValue = (date:Date) : string => {
    let month = date.getUTCMonth() + 1; 
    let d = date.getUTCDate();
    let year = date.getUTCFullYear();

    d = d < 10 ? `0${d}` : d.toString() as any;
    month = month < 10 ? `0${month}` : month.toString() as any;

    return year + "-" + month + "-" + d;
}






export let timeOfTheDay = (date:Date) : string => {
    assert(isDate(date), `input is not a date. ${JSON.stringify(date)}. timeOfTheDay.`);

    let hours = String(date.getHours());
    let minutes = String(date.getMinutes());
    
    hours = hours.length === 1 ? `0${hours}` : hours;
    minutes = minutes.length === 1 ? `0${minutes}` : minutes;                                                                                         
    
    return `${hours}:${minutes}`;
}  



export let sameDay = (a:Date,b:Date) => { return keyFromDate(a)===keyFromDate(b) }
   


export let keyFromDate = (date:Date) : string => {  
    
    assert(isDate(date), `keyFromDate. input is not a date. ${JSON.stringify(date)}`);
    
    let year = date.getFullYear();
    let day = date.getDate(); 
    let month = date.getMonth();
    return [year,month+1,day].join('-'); 
}



export type ItemWithPriority = Area | Project | Todo | Heading; 


let removeDeleted = (objects : Item[], updateDB : Function) : Item[] => {
 
    if(!objects){
        if(isDev()){ 
           throw new Error(`objects undefined. ${JSON.stringify(objects)} removeDeleted.`);
        }
    }

    if(!updateDB){
        if(isDev()){ 
           throw new Error(`updateDB undefined. ${JSON.stringify(updateDB)} removeDeleted.`); 
        }
    }   

    if(!isFunction(updateDB)){ 
        if(isDev()){   
           throw new Error(`updateDB is not a function. ${JSON.stringify(updateDB)} removeDeleted.`);  
        }
    }  
    
 
    let deleted = [];
    let remainder = [];


    for(let i=0; i<objects.length; i++){ 

        let object = objects[i];
        
        assert(isItem(object), `object has incorrect type ${JSON.stringify(object)} ${i} ${JSON.stringify(objects)}`);

        if(!!objects[i]["deleted"]){
            deleted.push(objects[i]);
        }else{
            remainder.push(objects[i]);  
        } 

    } 
 

    if(deleted.length>0){ updateDB(deleted) }
    
    return remainder;
    
}
 

 
export let layoutOrderChanged = (before:(Heading|Todo)[], after:(Heading|Todo)[]) : boolean => {
    
        if(before.length!==after.length) 
           return true;
    
        for(let i=0; i<before.length; i++){
            let beforeItem : Heading|Todo = before[i];
            let afterItem : Heading|Todo = after[i];
    
            assert(!isNil(beforeItem),`beforeItem isNil ${beforeItem}. layoutOrderChanged.`);
            assert(!isNil(afterItem), `afterItem isNil ${afterItem}. layoutOrderChanged.`);
           
            if(beforeItem._id !== afterItem._id){
                return true;
            }else{  
                continue;   
            }
        }
        return false;   
}
    
 
        
export let removeDeletedTodos = (todos:Todo[]) : Todo[] => {
    return removeDeleted(todos, removeTodos) as Todo[]
}  

 

export let removeDeletedProjects = (projects:Project[]) : Project[] => {
    return removeDeleted(projects, removeProjects) as Project[]
} 

 

export let removeDeletedAreas = (areas:Area[]) : Area[] => { 
    return removeDeleted(areas, removeAreas) as Area[] 
}
  
 



export let getTagsFromItems = (items:Item[]) : string[] => {

    let tags = []; 
 
    for(let i = 0; i<items.length; i++){

        let item : Item = items[i];

        if(!item){
            if(isDev()){ 
               throw new Error(`item undefined ${JSON.stringify(item)}. getTagsFromItems.`);
            }
        }
            
        if(!isItem(item)){
            if(isDev()){ 
               throw new Error(`item is not Item ${JSON.stringify(item)}. getTagsFromItems.`);
            }
        } 
  
        let attachedTags : string[] = item.attachedTags;

        if(!isArray(attachedTags)){
            if(isDev()){ 
                throw new Error(
                    `attachedTags is not array. ${attachedTags} ${JSON.stringify(item)} getTagsFromItems.`
                ) 
            }
        } 


        for(let j = 0; j<attachedTags.length; j++){

            let tag : string = attachedTags[j];

            if(!isString(tag)){
                if(isDev()){ 
                    throw new Error(
                        `tag is not a string ${tag} ${JSON.stringify(attachedTags)}.getTagsFromItems.`
                    );
                }
            }
 
            if(tags.indexOf(item.attachedTags[j])===-1){
               tags.push(item.attachedTags[j])
            }
        }  
    } 
    
    return tags; 
} 



export let attachDispatchToProps = (dispatch:Function,props) => ({...props, dispatch});
 

 
export let debounce = (fun, mil=50) => {
    let timer; 
    return function(...load){
        clearTimeout(timer); 
        timer = setTimeout(function(){
            fun(...load); 
        }, mil); 
    };  
} 






let inPast = (date:Date) : boolean => {
    assert(isDate(date),'inPast');
    return new Date().getTime()>date.getTime();
}



let inFuture =  (date:Date) : boolean => {
    assert(isDate(date),'inFuture');
    return new Date().getTime()<date.getTime();
} 


export let byNotSomeday = (t:Todo) : boolean => { return t.category!=="someday"; }


export let byHaveAttachedDate = (t:Todo) : boolean => {
    assert(isTodo(t), `t is not of type Todo ${JSON.stringify(t)}`);
    return not(isNil(t.attachedDate));
} 


export let byNotDeleted = (item:Item) : boolean => not(byDeleted(item));


export let byDeleted = (item:Item) : boolean => { 
    assert(isItem(item), `item have incorrect type. ${JSON.stringify(item)}. byDeleted`);
    return !!item.deleted;
}  


export let byCompleted = (item:Project & Todo) : boolean => { 
    assert(
        isProject(item as Project) || isTodo(item), 
        `item have incorrect type. ${JSON.stringify(item)}. byCompleted`
    );

    let date = isNil(item) ? null :
               isTodo(item) ? item.completedWhen :
               isProject(item) ? item.completed : null;

    return isNil(date) ? false : inPast(date);
}  


export let byNotCompleted = (item:Project & Todo) : boolean => not(byCompleted(item));

   
export let byTags = (selectedTag:string) => (item:Item) : boolean => { 
    assert(isString(selectedTag), `selectedTag is not a string. ${selectedTag}. byTags.`); 
    assert(selectedTag.length!==0, `selectedTag is empty. byTags.`);

    if(selectedTag==="All"){ return true }

    if(item===undefined || item===null){ return false }  
  
    return item.attachedTags.indexOf(selectedTag)!==-1;
}  


    
export let byCategory = (selectedCategory:Category) => (item:Todo) : boolean => { 
    assert(isCategory(selectedCategory), `selectedCategory is not of type Category. ${selectedCategory}. byCategory.`);
    return item.category===selectedCategory;
} 




export let hideChildrens = (elem:HTMLElement) : void => {
    
    let children = [].slice.call(elem.children);
    
    for(let i=0; i<children.length; i++){ 
        children[i].style.visibility = 'hidden';
        children[i].style.opacity = 0; 
    }
}  
  

 
export let makeChildrensVisible = (elem:HTMLElement) : void => {

    let children = [].slice.call(elem.children);
    
    for(let i=0; i<children.length; i++){
        children[i].style.visibility = '';
        children[i].style.opacity = 1;
    }

}
    

    
export let generateDropStyle = (id:string) : HTMLElement => {

    let rectangle = document.createElement("div");
    let container = document.createElement("div");
    let counter = document.createElement("div");
    
    rectangle.id = id;
    rectangle.style.zIndex = "1000000";   
    
    rectangle.style.width="60px";
    rectangle.style.height="30px"; 
    rectangle.style.backgroundColor="cadetblue";
    rectangle.style.position="absolute";
    rectangle.style.top=0+"px";   
    rectangle.style.left=0+"px";
    rectangle.style.pointerEvents = 'none';
    
    container.style.width="60px";
    container.style.height="30px";
    container.style.backgroundColor="cadetblue";
    container.style.position="relative";
    container.style.display="flex";
    container.style.justifyContent="center"; 
    container.style.textAlign="center";
    container.style.zIndex = "1000000";
    container.style.pointerEvents = 'none';
     
    
    counter.style.borderRadius="50px";
    counter.style.width="25px";
    counter.style.height="25px";
    counter.style.marginTop="15px";
    counter.style.zIndex="1000000";
    counter.style.backgroundColor="brown";
    counter.style.color="white";
    counter.style.alignItems="center";
    counter.style.textAlign="center";
    counter.style.display="flex";   
    counter.style.justifyContent="center";
    counter.style.pointerEvents = 'none';
    counter.innerHTML="1";   

    container.appendChild(counter);
    rectangle.appendChild(container);

    return rectangle; 
}





export let todoChanged = (oldTodo:Todo,newTodo:Todo) : boolean => {

    assert(oldTodo.type==="todo",`oldTodo is not todo ${JSON.stringify(oldTodo)}. todoChanged.`);
    assert(newTodo.type==="todo",`newTodo is not todo ${JSON.stringify(newTodo)}. todoChanged.`);
    assert(isString(oldTodo._id),`oldTodo._id is not string ${oldTodo._id}. todoChanged.`);
    assert(isString(newTodo._id),`newTodo._id is not string ${newTodo._id}. todoChanged.`);

    if(oldTodo._id!==newTodo._id){ return true }
        
    assert(isString(oldTodo.title), `oldTodo.title is not string ${oldTodo.title}. todoChanged.`);
    assert(isString(newTodo.title), `newTodo.title is not string ${newTodo.title}. todoChanged.`);
    assert(isString(oldTodo.note),`oldTodo.note is not string ${oldTodo.title}. todoChanged.`);
    assert(isString(newTodo.note),`newTodo.note is not string ${newTodo.title}. todoChanged.`);
    
    if(oldTodo.title!==newTodo.title){ return true }
    if(oldTodo.note!==newTodo.note){ return true }  

    assert(!isNaN(oldTodo.priority), `oldTodo.priority is not number ${oldTodo.priority}. todoChanged.`);
    assert(!isNaN(newTodo.priority), `newTodo.priority is not number ${newTodo.priority}. todoChanged.`);
    
    if(oldTodo.priority!==newTodo.priority){ return true }
    
    assert(isCategory(oldTodo.category), `oldTodo.category is not of type Category ${oldTodo.category}. todoChanged.`);
    assert(isCategory(newTodo.category), `newTodo.category is not of type Category ${newTodo.category}. todoChanged.`);

    if(oldTodo.category!==newTodo.category){ return true }
    
    assert(isArray(oldTodo.checklist), `oldTodo.checklist is not an Array. ${oldTodo.checklist}. todoChanged.`);
    assert(isArray(newTodo.checklist), `newTodo.checklist is not an Array. ${newTodo.checklist}. todoChanged.`);
    assert(isArray(oldTodo.attachedTags), `oldTodo.attachedTags is not an Array. ${oldTodo.attachedTags}. todoChanged.`);
    assert(isArray(newTodo.attachedTags), `newTodo.attachedTags is not an Array. ${newTodo.attachedTags}. todoChanged.`);

    
    if(oldTodo.checklist.length!==newTodo.checklist.length){ return true }
    if(oldTodo.attachedTags.length!==newTodo.attachedTags.length){ return true }


    assert(isDate(oldTodo.created),`oldTodo.created is not date ${oldTodo.created}. todoChanged.`);
    assert(isDate(newTodo.created),`newTodo.created is not date ${newTodo.created}. todoChanged.`);
    

    if(oldTodo.created.getTime()!==newTodo.created.getTime()){ return true }


    if(isDate(newTodo.deadline) && isDate(oldTodo.deadline)){
        if(oldTodo.deadline.getTime()!==newTodo.deadline.getTime()){ return true } 
    }else{
        if(oldTodo.deadline!==newTodo.deadline){ return true }
    }


    if(isDate(newTodo.deleted) && isDate(oldTodo.deleted)){
        if(oldTodo.deleted.getTime()!==newTodo.deleted.getTime()){ return true } 
    }else{
        if(oldTodo.deleted!==newTodo.deleted){ return true } 
    }


    if(isDate(newTodo.attachedDate) && isDate(oldTodo.attachedDate)){
        if(oldTodo.attachedDate.getTime()!==newTodo.attachedDate.getTime()){ return true }
    }else{
        if(oldTodo.attachedDate!==newTodo.attachedDate){ return true }  
    }


    if(isDate(newTodo.completedWhen) && isDate(oldTodo.completedWhen)){
        if(oldTodo.completedWhen.getTime()!==newTodo.completedWhen.getTime()){ return true }   
    }else{ 
        if(oldTodo.completedWhen!==newTodo.completedWhen){ return true }
    }


    if(isDate(newTodo.reminder) && isDate(oldTodo.reminder)){
        if(oldTodo.reminder.getTime()!==newTodo.reminder.getTime()){ return true }   
    }else{ 
        if(oldTodo.reminder!==newTodo.reminder){ return true } 
    }


    for(let i=0; i<oldTodo.checklist.length; i++){

        let oldItem : ChecklistItem = oldTodo.checklist[i];
        let newItem : ChecklistItem = newTodo.checklist[i];

        assert(isString(oldItem.text), `oldItem.text is not a string ${oldItem.text}. todoChanged.`);
        assert(isString(newItem.text), `newItem.text is not a string ${newItem.text}. todoChanged.`);
        assert(isString(oldItem.key), `oldItem.key is not a string ${oldItem.key}. todoChanged.`);
        assert(isString(newItem.key), `newItem.key is not a string ${newItem.key}. todoChanged.`);
        
        if(oldItem.checked!==newItem.checked){ return true } 
        if(oldItem.idx!==newItem.idx){ return true }  
        if(oldItem.text!==newItem.text){ return true }
        if(oldItem.key!==newItem.key){ return true } 
    }


    for(let i=0; i<newTodo.attachedTags.length; i++){

        assert(isString(oldTodo.attachedTags[i]), `oldTodo.attachedTags[${i}] is not a string ${oldTodo.attachedTags[i]}. todoChanged.`);

        assert(isString(newTodo.attachedTags[i]), `newTodo.attachedTags[${i}] is not a string ${newTodo.attachedTags[i]}. todoChanged.`);
     
        if(oldTodo.attachedTags[i]!==newTodo.attachedTags[i]){ return true }
    }
};
  


export let attachEmptyTodo = (selectedCategory:Category) => (todos:Todo[]) => {
    let sorted = todos.sort((a:Todo,b:Todo) => a.priority-b.priority);
    let priority = sorted[0] ? sorted[0].priority - 1 : 0;
    let emptyTodo = generateEmptyTodo(generateId(),selectedCategory,priority);  

    return prepend(emptyTodo)(todos);
}
  


export let findAttachedArea = (areas:Area[]) => (t:Todo) : Area => {
    for(let i=0; i<areas.length; i++){
        if(contains(t._id)(areas[i].attachedTodosIds)){ return areas[i] }
    }

    return undefined;             
}; 
 

export let findAttachedProject = (projects:Project[]) => (t:Todo) : Project => {
    for(let i=0; i<projects.length; i++){
        let attachedTodosIds = projects[i].layout.filter(isString) as string[];
        if(contains(t._id)(attachedTodosIds)){ return projects[i] }
    } 

    return undefined;     
};  


export let byAttachedToArea = (areas:Area[]) => (t:Todo) : boolean => {
    for(let i=0; i<areas.length; i++){
        if(contains(t._id)(areas[i].attachedTodosIds)){ return true }
    }
    return false;             
}; 


export let byAttachedToProject = (projects:Project[]) => (t:Todo) : boolean => {

    for(let i=0; i<projects.length; i++){
        let attachedTodosIds = projects[i].layout.filter(isString) as string[];

        assert(
          isArrayOfStrings(attachedTodosIds), 
         `attachedTodosIds is not an array of strings ${JSON.stringify(attachedTodosIds)}.`
        ); 
         
        if(contains(t._id)(attachedTodosIds)){ return true }
    }   

    return false;     
};  


  
export let generateTagElement = (tag:string,idx:number) => {

    return <div key={String(idx)}>  
        <div style={{ 
                transition:"opacity 0.4s ease-in-out", 
                opacity:1,
                width:"auto",  
                height:"24px", 
                alignItems:"center",
                display:"flex",
                color:"rgba(74,136,114,0.9)",
                cursor:"pointer",
                marginRight:"5px",
                marginTop:"5px", 
                backgroundColor:"rgb(171,212,199)",
                borderRadius:"100px",
                fontWeight:700,
                fontFamily:"sans-serif" 
            }}
        >      
            <div style={{padding:"10px"}}>  
                {stringToLength(tag,25)}  
            </div>
        </div>
    </div>
};



export let getMonthName = (d:Date) : string => {

    assert(isDate(d),`d is not a Date ${d}. getMonthName.`);

    let monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
 
    return monthNames[d.getMonth()];
}

 
 
export let getDayName = (d:Date) : string => { 

    assert(isDate(d), `d is not a Date ${d}. getDayName.`);

    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return days[d.getDay()];
}

   
    
export let addDays = (date:Date, days:number) => {
 
    assert(isDate(date), `date is not a Date. ${date}. addDays.`);

    assert(!isNaN(days), `days is not a number. ${days}. addDays.`);

    let next = new Date();
        
    next.setDate(date.getDate() + days);

    return next; 
}
 


export let daysLeftMark = (hide:boolean, deadline:Date, fontSize=13)  => {
 
    if(hide){ return null } 
     
    assert(not(isNil(deadline)), `deadline undefined. ${deadline}. daysLeftMark.`);
    assert(isDate(deadline), `deadline not a Date. ${deadline}. daysLeftMark.`);

    let daysLeft = daysRemaining(deadline);      
    let flagColor = daysLeft <= 1  ? "rgba(200,0,0,0.7)" : "rgba(100,100,100,0.7)";
       
    let style : any = { 
        display: "flex",
        alignItems: "center",
        color:flagColor,
        fontSize:`${fontSize}px`, 
        whiteSpace:"nowrap", 
        fontWeight:"600",  
        textAlign: "center"
    };
       
    let attachedText = "";
 
    if(daysLeft < 0){
       attachedText = " days ago";
    }else if(daysLeft === 1){
       attachedText = " day left"; 
    }else{ 
       attachedText = " days left";
    }

    return <p style={style}>{ Math.abs(daysLeft) }{ attachedText }</p>  
} 


 
export let isToday = (date : Date) => {
    if(isNil(date)){ return false }; 
  
    return daysRemaining(date)===0;
}    



export let compareByDate = (getDateFromObject:Function) => (i:Todo | Project, j:Todo | Project) => {

    assert(isFunction(getDateFromObject), `getDateFromObject is not a function. ${getDateFromObject}. compareByDate.`);

    let iDate = getDateFromObject(i); 
    let jDate = getDateFromObject(j);

    if(iDate===null || iDate===undefined || !iDate){ return -1 }; 
    if(jDate===null || jDate===undefined || !jDate){ return -1 };  
            
    assert(isDate(iDate), `iDate is not a Date. ${getDateFromObject}. compareByDate.`);
    assert(isDate(jDate), `jDate is not a Date. ${getDateFromObject}. compareByDate.`);

    if(iDate.getTime() < jDate.getTime()){ return 1 }
    else{ return -1 }   
}



export let oneMinuteBefore = (date:Date) : Date => {
    let minuteInMs = 1000 * 60;
    return new Date(date.getTime() - minuteInMs); 
}



export let nextMidnight = () : Date => {
    let d = new Date()
    d.setHours(24,0,0,0); // next midnight
    return d;
}


     
export let getDatesRange = (
    start : Date,  
    days : number, 
    includeStart : boolean, 
    includeEnd : boolean
) : Date[] => {
 
    assert(isDate(start), `start is not Date ${start}. getDatesRange`);
         
    Date.prototype["addDays"] = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }
 
    let dates = [];
    let from = 1; 
    let to = days-1;

    if(includeStart){ from -= 1; }

    if(includeEnd){ to += 1; }
        
    for(let i=from; i<=to; i++){
        dates.push( new Date(start.getTime())["addDays"]( i ) );
    }
    
    return dates; 
      
} 



export let randomInteger = (n:number) : number => {
    return Math.round(Math.random() * n);
} 
  


export let randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));


    
export let randomArrayMember = (array : any[]) => {

    assert(!isEmpty(array), `randomArrayMember. array empty.`);

    let range = array.length - 1;
    
    let idx = randomInteger(range);

    let member = array[idx]; 

    return member;
} 
    


export let generateEmptyProject = () : Project => ({
    _id : generateId(), 
    type : "project", 
    name : "", 
    description : "",
    layout : [], 
    priority : Math.random() * 9999999999,
    deleted : undefined,
    created : new Date(), 
    deadline : null, 
    completed : null, 
    attachedTags : []
});
   


export let generateEmptyArea = () : Area => ({
    _id : generateId(),
    name : "",
    priority : Math.random() * 9999999999,
    deleted : undefined, 
    type : "area", 
    created : new Date(), 
    description : "",
    attachedTags : [], 
    attachedTodosIds : [],  
    attachedProjectsIds : [],
});
  


export let timeDifferenceHours = (from:Date,to:Date) : number => {
    let first = isString(from) ? new Date(from).getTime() : from.getTime();
    let second = isString(to) ? new Date(to).getTime() : to.getTime();
    let diff = (second - first)/(1000*60*60);
    return Math.abs(diff);  
}    



export let clearStorage = (onError:Function) : Promise<void> => {
    return new Promise( 
        (resolve) => { 
            storage.clear(
                (error) => {
                    if(!isNil(error)){ onError(error) }
                    resolve()
                }
            )
        }
    )
}



export let transformLoadDates = (load) : any => {

    let converted = load;

    if(isTodo(load)){
        converted = convertTodoDates(load);
    }else if(isProject(load)){
        converted = convertProjectDates(load);
    }else if(isArea(load)){
        converted = convertAreaDates(load); 
    }else if(isArray(load)){
        if(isArrayOfAreas(load)){
            converted = load.map(convertAreaDates);
        }else if(isArrayOfProjects(load)){
            converted = load.map(convertProjectDates);
        }else if(isArrayOfTodos(load)){
            converted = load.map(convertTodoDates);
        }   
    }    

    if(!isNil(load.todos)){
        if(isArrayOfTodos(load.todos)){
           load.todos = load.todos.map(convertTodoDates);
        } 
    }

    if(!isNil(load.projects)){
        if(isArrayOfProjects(load.projects)){
           load.projects = load.projects.map(convertProjectDates);
        }
    }

    if(!isNil(load.areas)){
        if(isArrayOfAreas(load.areas)){
           load.areas = load.areas.map(convertAreaDates);
        } 
    }
 
    return  converted;  
}



export let convertTodoDates = (t:Todo) : Todo => ({
    ...t, 
    reminder : !t.reminder ? undefined :  
                typeof t.reminder==="string" ? new Date(t.reminder) : 
                t.reminder,
    deadline : !t.deadline ? undefined : 
                typeof t.deadline==="string" ? new Date(t.deadline) : 
                t.deadline,
    created : !t.created ? undefined : 
               typeof t.created==="string" ? new Date(t.created) : 
               t.created,
    deleted : !t.deleted ? undefined : 
               typeof t.deleted==="string" ? new Date(t.deleted) : 
               t.deleted,
    attachedDate : !t.attachedDate ? undefined : 
                    typeof t.attachedDate==="string" ? new Date(t.attachedDate) : 
                    t.attachedDate,
    completedSet : !t.completedSet ? undefined : 
                    typeof t.completedSet==="string" ? new Date(t.completedSet) : 
                    t.completedSet,
    completedWhen : !t.completedWhen ? undefined : 
                    typeof t.completedWhen==="string" ? new Date(t.completedWhen) : 
                    t.completedWhen           
})



export let convertProjectDates = (p:Project) : Project => ({
    ...p,
    created : !p.created ? undefined : 
               typeof p.created==="string" ? new Date(p.created) : 
               p.created,

    deadline : !p.deadline ? undefined : 
                typeof p.deadline==="string" ? new Date(p.deadline) : 
                p.deadline,

    deleted : !p.deleted ? undefined : 
               typeof p.deleted==="string" ? new Date(p.deleted) : 
               p.deleted,

    completed : !p.completed ? undefined : 
                 typeof p.completed==="string" ? new Date(p.completed) : 
                 p.completed  
})



export let convertAreaDates = (a:Area) : Area => ({
    ...a, 
    created : !a.created ? undefined : 
               typeof a.created==="string" ? new Date(a.created) : 
               a.created,

    deleted : !a.deleted ? undefined : 
               typeof a.deleted==="string" ? new Date(a.deleted) : 
               a.deleted,
})



export let createHeading = (e, props:Store) : void => {
     
    let id : string = props.selectedProjectId;


    assert(
        props.selectedCategory==="project",   
        `Attempt to create heading outside of project template. 
        ${props.selectedCategory}. 
        createHeading.`
    )

    assert(not(isNil(id)), `selectedProjectId undefined ${id}. createHeading.`);

  
    let project = props.projects.find( (p:Project) => p._id===id );


    assert( 
        isProject(project),   
        `this.props.selectedProjectId ${props.selectedProjectId} do not correspond to existing project.
        ${JSON.stringify(props.projects)}. createHeading`
    )


    let priority = 0; 


    if(!isEmpty(project.layout)){
        let item : LayoutItem = last(project.layout);

        if(isString(item)){ 

            let todo = props.todos.find( (t:Todo) => t._id===item );
            assert(
                isTodo(todo), 
                `todo is not of type Todo. 
                 todo : ${JSON.stringify(todo)}. 
                 item : ${JSON.stringify(item)}. 
                 createHeading.`
            )
        
            priority = todo.priority + 1; 
             
        }else if(item["type"]==="heading"){
 
            let heading : Heading = item as Heading; 
            priority = heading.priority + 1;

        } 
    }


    let heading : Heading = {
        type : "heading", 
        priority,
        title : '',   
        _id : generateId(), 
        key : generateId()
    }; 

    let load = {...project, layout:[heading,...project.layout]};
    
    props.dispatch({ type:"updateProject", load });
}



interface ItemsAmount{  
    inbox:number,
    today:number,  
    hot:number,
    trash:number,
    logbook:number  
}


export let isDeadlineTodayOrPast = (deadline:Date) : boolean => isNil(deadline) ? 
                                                                false : 
                                                                daysRemaining(deadline)<=0;


 
export let isTodayOrPast = (date:Date) : boolean => isNil(date) ?    
                                                    false :  
                                                    daysRemaining(date)<=0;  

 


export let todoToKeywords = (t:Todo) : string[] => {
    let toWords = (s:string) => s.trim()
                                 .toLowerCase()
                                 .split(' ')
                                 .filter(compose( not,isEmpty ));

    let keywords : string[] = toWords(t.title);
     
    let attachedTags = flatten( t.attachedTags.map((tag) => toWords(tag)) );                                 
      
    return [].concat.apply([], [ keywords, attachedTags ]);
} 



let collectProjects = (projects:Project[], projectsFilters, table:Table) : Table => {
    for(let i=0;  i<projects.length; i++){
        let project : Project = projects[i]; 

        if( allPass(projectsFilters)(project) ){
           table[project._id] = [];
           table.projects.push(project);  
        }
    };
    return table;
}  



let collectAreas = (areas:Area[], areasFilters, table:Table) : Table => {
    for(let i=0; i<areas.length; i++){
        let area : Area = areas[i]; 
        
        if( allPass(areasFilters)(area) ){
           table[area._id] = [];
           table.areas.push(area);
        }
    };
    return table;
}



export let groupObjects = (
    projects:Project[],areas:Area[],todos:Todo[],
    projectsFilters,areasFilters,todosFilters,
    selectedTag:string 
) : Table => { 

    let table : Table = {  
        projects : [],
        areas : [],
        todos : [],
        detached : []   
    };  

    table = collectProjects(projects,projectsFilters,table);
    table = collectAreas(areas,areasFilters,table);

    for(let i = 0; i<todos.length; i++){
        let todo : Todo = todos[i]; 

        if(!allPass([byTags(selectedTag), ...todosFilters])(todo)){ continue }  
          
        table.todos.push(todo);  

        let attached = false;

        let project : Project = table.projects.find( (p:Project) => contains(todo._id)(p.layout as any) )    
        
        if(!isNil(project)){  
            table[project._id].push(todo);
            attached = true; 
        } 
      
        let area : Area = table.areas.find( (a:Area) => contains(todo._id)(a.attachedTodosIds) )  
        
        if(!isNil(area)){
            table[area._id].push(todo);
            attached = true; 
        }

        if(not(attached)){ table.detached.push(todo) }; 
    }

    return table; 
} 



export let convertDates = (object) => {
    if(isNil(object)){ return object }
    switch(object.type){
        case "todo":
            return convertTodoDates(object as Todo)
        case "project":
            return convertProjectDates(object as Project)
        case "area":
            return convertAreaDates(object as Area)  
    }
    return object    
} 



export let checkForUpdates = () : Promise<UpdateCheckResult> => {
    return new Promise( 
        resolve => {
            ipcRenderer.removeAllListeners("checkForUpdates");  
            ipcRenderer.send("checkForUpdates");
            ipcRenderer.on("checkForUpdates", (event,updateCheckResult) => resolve(updateCheckResult))
        }  
    )
} 



export let downloadUpdates = () : Promise<string> => {
    return new Promise( 
        resolve => {
            ipcRenderer.removeAllListeners("downloadUpdates");  
            ipcRenderer.send("downloadUpdates");
            ipcRenderer.on("downloadUpdates", (event,path) => resolve(path)) 
        } 
    )
}



export let addIntroList = (dispatch:Function) => {

    let layout = introListLayout.map((item) => item.type==="todo" ? item._id : item);

    dispatch({type:"addTodos",load:introListLayout.filter(isTodo)});

    dispatch({
        type:"addProject", 
        load:{    
            _id : generateId(),    
            type : "project", 
            name : "Intro List",  
            priority : 1,
            deleted : undefined,
            description : `
            This project shows you everything you need to know to hit the ground running.
            Don't hesistate to play around in it - you can always create a new one from the help menu.
            `, 
            created : new Date(),
            deadline : null,
            completed : null,
            layout,     
            attachedTags : [] 
        }
    })
}        



export const introListLayout = [
    {
        type : "heading", 
        priority:1,
        title : "Learn the basics", 
        _id : generateId(), 
        key : generateId()
    }, 
    {
        type:"todo",
        category:"project",
        title:"Click this to-do",
        priority:2,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    },
    {
        type:"todo",
        category:"project",
        title:"Create a new to-do",
        priority:3,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    },
    {
        type:"todo",
        category:"project",
        title:"Plan this to-do for later",
        priority:4,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    },
    {
        type:"todo",
        category:"project",
        title:"Create new heading ",
        priority:5,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    },
    {
        type:"todo",
        category:"project",
        title:"Create a project",
        priority:6,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    },
    {
        type:"todo",
        category:"project",
        title:"You're done",
        priority:7,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    },
    {
        type : "heading", 
        priority:8,
        title : "Tune your setup", 
        _id : generateId(), 
        key : generateId()
    }, 
    {
        type:"todo",
        category:"project",
        title:"Show your calendar events",
        priority:9,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    },
    {
        type:"todo",
        category:"project",
        title:"Enable the today widget",
        priority:10,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    },
    {
        type:"todo",
        category:"project",
        title:"Sync your devices",
        priority:11,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    },
    {
        type : "heading", 
        priority:12,
        title : "Boost your productivity", 
        _id : generateId(), 
        key : generateId()
    },
    {
        type:"todo",
        category:"project",
        title:"Add to-dos from anywhere",
        priority:13,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    }, 
    {
        type:"todo",
        category:"project",
        title:"Link to emails, files, and web pages",
        priority:14,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    }, 
    {
        type:"todo",
        category:"project",
        title:"Search and navigate with Quick Find",
        priority:15,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    },
    {
        type:"todo",
        category:"project",
        title:"Tag your to-dos",
        priority:16,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    },
    {
        type:"todo",
        category:"project",
        title:"Go step by step with checklists",
        priority:17,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    },
    {
        type:"todo",
        category:"project",
        title:"Add a reminder so you won't forget",
        priority:18,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    },
    {
        type:"todo",
        category:"project",
        title:"Plan your evening",
        priority:19,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    },
    {
        type:"todo",
        category:"project",
        title:"Hide the sidebar to focus on your work",
        priority:20,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    },
    {
        type:"todo",
        category:"project",
        title:"Open multiple windows",
        priority:21,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    },
    {
        type:"todo",
        category:"project",
        title:"Convert a to-do into a project",
        priority:22,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    },
    {
        type:"todo",
        category:"project",
        title:"Make your to-dos repeat",
        priority:23,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    },            
    {
        type : "heading", 
        priority:24,
        title : "Before you go...", 
        _id : generateId(), 
        key : generateId()
    },
    {
        type:"todo",
        category:"project",
        title:"Any questions ? We're here to help!",
        priority:25,
        note:"",
        checklist:[],
        reminder:null,
        attachedTags:[],
        deadline:null,
        created:new Date(),
        deleted:null,
        attachedDate:null,
        completed:null,
        checked:false,
        _id:generateId()
    }
];