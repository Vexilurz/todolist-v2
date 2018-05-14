import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { Todo, Project, Area, Category, ChecklistItem, Heading, LayoutItem, Item, Store, Databases } from './../types'; 
import { 
    contains, isNil, prepend, isEmpty, last, not, 
    when, flatten, map, compose, cond, remove, any,
    complement, equals, prop, groupBy, path, reject,
    ifElse, identity, reduce, curry, where, intersection,
    all 
} from 'ramda'; 
import { isDev } from './isDev';
import { ipcRenderer } from 'electron';
import { UpdateCheckResult } from 'electron-updater';
import { globalErrorHandler } from './globalErrorHandler';
import { generateId } from './generateId';
import { assert }  from './assert';
import { daysRemaining } from './daysRemaining'; 
import { filter } from 'lodash';
import { stringToLength } from './stringToLength';
import { 
    isItem,isArray,isDate,isFunction,isString,  
    isCategory,bySomeday,isTodo,isArrayOfTodos, 
    isProject,isArrayOfProjects,isArea,isNotNil, 
    isArrayOfAreas,isArrayOfStrings,isNotDate, isToday
} from './isSomething';
import { generateEmptyTodo } from './generateEmptyTodo';
import { noteFromText } from './draftUtils';
import { requestFromMain } from './requestFromMain';
import { inPast, fiveMinutesLater, onHourLater, oneDayMore } from './time'; 
const PHE = require("print-html-element");
const domtoimage = require('retina-dom-to-image');



export let selectFolder = () => requestFromMain('selectFolder', [], (event,folder) => folder);



export let selectJsonDatabase = () => requestFromMain('selectJsonDatabase', [], (event,folder) => folder);



export let closeClonedWindows = () : void => ipcRenderer.send('closeClonedWindows');

  

export let correctFormat : (database:Databases) => boolean = 
    where({
        todos:isArray,
        projects:isArray,
        areas:isArray,
        calendars:isArray
    });



export let removeRev = (item) => {
    delete item["_rev"];
    item["_rev"] = undefined;
    return item;
};


 
export let anyTrue = any(identity);



export let limit = (down:number,up:number) => 
            (value:number) => value<down ? down :
                              value>up ? up : 
                              value;


                              
export let limitInput = limit(1,1000); 



export let limitDate = (date:Date) : Date => {
    let end = new Date(2022, 12, 0);
    let start = new Date();

    return date.getTime() > end.getTime() ? end :
           date.getTime() < start.getTime() ? start :
           date;  
};



export let log = (append:string) => (load:any) : any => {
    console.log(append,load); 
    return load;
};



export let sideEffect = (f:Function) => (data:any) : any => {
    f(data);
    return data;
};



export let different = complement(equals);



export let differentBy = curry(
    (by:Function, first:any, last:any) => different(...map(by,[first,last]))
);



export let isNotNan = (n) => not(isNaN(n));



export let isNotEmpty = complement(isEmpty);



let getDateUpperLimit = (projects:Project[], todos:Todo[], currentLimit:Date) : Date => {

    let getDates : (projects:Project[]) => Date[] = compose(
        reject(isNil),
        map(prop('attachedDate')),
        (ids) => filter(todos, (todo:Todo) => contains(todo._id)(ids)),
        flatten,
        map( (p:Project) => p.layout.filter(isString) )
    );

    let result : Date =  compose(
        reduce(
            ifElse(
                gtDate,
                identity,
                (acc:Date,attachedDate:Date) => attachedDate
            ), 
            currentLimit
        ),
        getDates
    )(projects);

    return result;
};



let selectTodosByLimit = (limit:Date) => (projects:Project[], todos:Todo[]) : Todo[] => {
    
    let limitByProjects : Date = getDateUpperLimit(projects, todos, limit); 

    return reject(
        compose(
            (date:Date) => gtDate(date,limitByProjects), //reject if attached date above limit
            prop('attachedDate')
        ),
        todos
    );
};
 


export let addDates = (one:Date, two:Date) : Date => {
    if(isNil(one) || isNil(two)){ return new Date() }

    let first = new Date(one);
    let second = new Date(two);

    return new Date(first.getTime() + second.getTime()); 
};



export let typeEquals = (type:string) => compose(equals(type), prop(`type`))



export let printElement = (selectedCategory:Category, list:HTMLElement) : Promise<void> => {
    const clone = list.cloneNode(true) as HTMLElement;
    document.body.appendChild(clone);
    clone.style.width="100%";
    clone.style.zoom="0.7";
    
    //clone.style.display="flex";
    //clone.style.justifyContent="center"; 
    //clone.style.alignItems="center";  
    
    let hide = clone.getElementsByClassName('no-print');

    while(hide[0]){ hide[0].parentNode.removeChild(hide[0]) }
 
    return domtoimage
    .toPng(clone, { quality: 1 })
    .then((dataUrl) => {
        document.body.removeChild(clone); 

        let img = document.createElement("img");
        img.src = dataUrl;
        return PHE.printElement(img);
    })
    .catch((error) => globalErrorHandler(error));
}; 


 
export let measureTime = (f:(...args) => any, name?:string) => 
    (...args) => {
        let start : number = performance.now();
        let data = f.apply(null,args); 
        let finish : number = performance.now();
        if(isDev()){
           console.log(`${name ? name : f.name} - time of execution : ${finish - start} ms`);
        } 
        return data; 
    }; 

 

export let measureTimePromise = (f:(...args) => Promise<any>, name?:string) => 
    (...args) : Promise<any> => {
        let start : number = performance.now();

        return f.apply(null,args)
                .then((data) => {
                    let finish : number = performance.now();
                    if(isDev()){
                       console.log(`${name ? name : f.name} - time of execution : ${finish - start} ms`);
                    } 
                    return data;
                }); 
    }; 



export let byScheduled = (item : Todo) : boolean => {
    if(isNil(item)){ return false } 
    return !isNil(item.deadline) || !isNil(item.attachedDate); 
}; 



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
}; 



export let getRangeYearRepetitions = (start:Date,endsAfter:number,repeatEveryN:number) : Date[] => {
    let dates = [];
    
    for(let i = 1; i<=endsAfter; i++){
        let next = new Date(start.getTime());
        let year = next.getFullYear();
        next.setFullYear(year + (i*repeatEveryN));
        dates.push(next);
    }

    return dates;
}; 



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
};



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
            () => oneDayMore(date)
        ],
        [
            () => true, 
            () => date,
        ]
    ])(moveCompletedItemsToLogbook);
};



export let getRangeMonthRepetitions = (start:Date, endsAfter:number, repeatEveryN:number) : Date[] => {
    let dayOfTheMonth : number = start.getDate();
    let initialMonth : number = start.getMonth();
    let dates = [];

    for(let i=1; i<=endsAfter; i++){
        let next = new Date(start.getTime());
        next.setDate(1);

        let nextMonth : number = (i*repeatEveryN) + initialMonth;

        next.setMonth(nextMonth);

        let daysInNextMonth = daysInMonth(next);

        if(dayOfTheMonth>daysInNextMonth){
           next.setDate(daysInNextMonth);
        }else{
           next.setDate(dayOfTheMonth);
        }     

        dates.push(next);
    }

    return dates;
};



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
};
 


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
};


 
export let dateInputUpperLimit = (limit = 2030) : string => {
    let now = new Date();  
    let month = now.getUTCMonth() + 1; 
    let d = now.getUTCDate();
    let year = now.getUTCFullYear();

    d = d < 10 ? `0${d}` : d.toString() as any;
    month = month < 10 ? `0${month}` : month.toString() as any;
    let end = String(limit) + "-" + month + "-" + d; 

    return end;
}; 



export let daysInMonth = (date:Date) : number => {
    if(isNotDate(date)){ return 0 }

    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};



export let dateToYearMonthDay = (date:Date) => {
    if(isNotDate(date)){ return date }

    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
};



export let monthFromDate = (date:Date) : Date => {
    if(isNotDate(date)){ return date }

    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;   
    }
      
    return date["addDays"](31);
};
 


export let yearFromDate = (date:Date) : Date => {
    if(isNotDate(date)){ return date }

    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;   
    }
      
    return date["addDays"](365);
};



export let yearFromNow = () => {
    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;   
    }
      
    return new Date()["addDays"](365);
};



export let nDaysFromNow = (n:number) => {
    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;   
    }
      
    return new Date()["addDays"](n);
};



export let initDate = (date:Date) => {
    if(isString(date)){
       return new Date(date); 
    }else{
       return date;
    }
}; 



export let dateToDateInputValue = (date:Date) : string => {
    let month = date.getUTCMonth() + 1; 
    let d = date.getUTCDate();
    let year = date.getUTCFullYear();

    d = d < 10 ? `0${d}` : d.toString() as any;
    month = month < 10 ? `0${month}` : month.toString() as any;

    return year + "-" + month + "-" + d;
};



export function onErrorWindow(msg:any, url, lineNo, columnNo, error){
    let string = msg.toLowerCase();
    let message = [ 
        'Message:' + msg, 
        'URL:' + url,
        'Line:' + lineNo,
        'Column:' + columnNo,
        'Error object:' + JSON.stringify(error)
    ].join(' - ');  

    globalErrorHandler(message);
    
    if(isDev()){ 
       return false; 
    }

    return true;
}; 



export let wrapArray = (item:any) => [item];


 
export let layoutOrderChanged = (before:(Heading|Todo)[], after:(Heading|Todo)[]) : boolean => {
    
        if(before.length!==after.length){ return true }
    
        for(let i=0; i<before.length; i++){
            let beforeItem : Heading|Todo = before[i];
            let afterItem : Heading|Todo = after[i];
            
            if(isDev()){
               assert(!isNil(beforeItem),`beforeItem isNil ${beforeItem}. layoutOrderChanged.`);
               assert(!isNil(afterItem), `afterItem isNil ${afterItem}. layoutOrderChanged.`);
            }
           
            if(beforeItem._id !== afterItem._id){
                return true;
            }else{  
                continue;   
            }
        }
        return false;   
};
    
 

export let getTagsFromItems = (items:Item[]) : string[] => {

    let tags = []; 
 
    for(let i = 0; i<items.length; i++){

        let item : Item = items[i];
  
        let attachedTags : string[] = item.attachedTags;

        for(let j = 0; j<attachedTags.length; j++){

            let tag : string = attachedTags[j];

            if(tags.indexOf(item.attachedTags[j])===-1){
               tags.push(item.attachedTags[j])
            }
        }  
    } 
    
    return tags; 
}; 



export let turnedOff = (was:boolean, now:boolean) : boolean => was && !now;



export let turnedOn = (was:boolean, now:boolean) : boolean => !was && now;
        


export let attachDispatchToProps = (dispatch:Function,props) => ({...props, dispatch});



export let byNotSomeday = (t:Todo) : boolean => t.category!=="someday"; 


export let byHaveAttachedDate = (t:Todo) : boolean => {
    if(isDev()){
       assert(isTodo(t), `t is not of type Todo ${t}`);
    }

    return not(isNil(t.attachedDate));
}; 


export let byNotDeleted = (item:Item) : boolean => not(byDeleted(item));


export let byDeleted = (item:Item) : boolean => { 
    if(isDev()){
       assert(isItem(item), `item have incorrect type. ${item}. byDeleted`);
    }

    return !!item.deleted;
};  


export let byCompleted = (item) : boolean => { 
    if(isDev()){
       assert(isProject(item as Project) || isTodo(item),`item have incorrect type. ${item}. byCompleted`);
    }

    let date = isNil(item) ? null :
               isTodo(item) ? item.completedWhen :
               isProject(item) ? item.completed : null;

    return isNil(date) ? false : inPast(date);
};  


export let byNotCompleted = (item:Project & Todo) : boolean => not(byCompleted(item));

   
export let byTags = (selectedTags:string[]) => (item:Todo) : boolean => { 
    if(contains("All")(selectedTags)){ return true };

    if(isNil(item)){ return false };  
 
    if(isTodo(item)){
        return all( selected => contains(selected)(item.attachedTags) )(selectedTags);
    }else{
        return true;
    } 
}; 

    
export let byCategory = (selectedCategory:Category) => (item:Todo) : boolean => { 
    if(isDev()){
       assert(isCategory(selectedCategory), `selectedCategory is not of type Category. ${selectedCategory}. byCategory.`);
    }

    return item.category===selectedCategory;
}; 


export let hideChildrens = (elem:HTMLElement) : void => {
    let children = [].slice.call(elem.children);
    
    for(let i=0; i<children.length; i++){ 
        children[i].style.visibility = 'hidden';
        children[i].style.opacity = 0; 
    }
}; 

 
export let makeChildrensVisible = (elem:HTMLElement) : void => {
    let children = [].slice.call(elem.children);
    
    for(let i=0; i<children.length; i++){
        children[i].style.visibility = '';
        children[i].style.opacity = 1;
    };
};

    
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
     
    counter.id=`${id}-counter`;
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
};


export let removeHeading = (headingId:string,project:Project) : Project => {
    let layout = project.layout;
    let idx = layout.findIndex((i:any) => isString(i) ? false : i._id===headingId);
    return when(
        () => idx!==-1,
        () => ({...project,layout:remove(idx,1,layout)})
    )(project);
}; 


export let todoChanged = (oldTodo:Todo,newTodo:Todo) : boolean => {

    if(isDev()){
        assert(oldTodo.type==="todo",`oldTodo is not todo ${oldTodo}. todoChanged.`);
        assert(newTodo.type==="todo",`newTodo is not todo ${newTodo}. todoChanged.`);
        assert(isString(oldTodo._id),`oldTodo._id is not string ${oldTodo._id}. todoChanged.`);
        assert(isString(newTodo._id),`newTodo._id is not string ${newTodo._id}. todoChanged.`);
    }

    if(oldTodo._id!==newTodo._id){ return true }
        
    if(isDev()){
        assert(isString(oldTodo.title), `oldTodo.title is not string ${oldTodo.title}. todoChanged.`);
        assert(isString(newTodo.title), `newTodo.title is not string ${newTodo.title}. todoChanged.`);
        assert(isString(oldTodo.note),`oldTodo.note is not string ${oldTodo.title}. todoChanged.`);
        assert(isString(newTodo.note),`newTodo.note is not string ${newTodo.title}. todoChanged.`);
    }
    
    if(oldTodo.title!==newTodo.title){ return true }
    if(oldTodo.note!==newTodo.note){ return true }  

    if(isDev()){
        assert(!isNaN(oldTodo.priority), `oldTodo.priority is not number ${oldTodo.priority}. todoChanged.`);
        assert(!isNaN(newTodo.priority), `newTodo.priority is not number ${newTodo.priority}. todoChanged.`);
    }
    
    if(oldTodo.priority!==newTodo.priority){ return true }
    
    if(isDev()){
        assert(isCategory(oldTodo.category), `oldTodo.category is not of type Category ${oldTodo.category}. todoChanged.`);
        assert(isCategory(newTodo.category), `newTodo.category is not of type Category ${newTodo.category}. todoChanged.`);
    }

    if(oldTodo.category!==newTodo.category){ return true }
    
    if(isDev()){
        assert(isArray(oldTodo.checklist), `oldTodo.checklist is not an Array. ${oldTodo.checklist}. todoChanged.`);
        assert(isArray(newTodo.checklist), `newTodo.checklist is not an Array. ${newTodo.checklist}. todoChanged.`);
        assert(isArray(oldTodo.attachedTags), `oldTodo.attachedTags is not an Array. ${oldTodo.attachedTags}. todoChanged.`);
        assert(isArray(newTodo.attachedTags), `newTodo.attachedTags is not an Array. ${newTodo.attachedTags}. todoChanged.`);
    }
    
    if(oldTodo.checklist.length!==newTodo.checklist.length){ return true }
    if(oldTodo.attachedTags.length!==newTodo.attachedTags.length){ return true }

    if(isDev()){
        assert(isDate(oldTodo.created),`oldTodo.created is not date ${oldTodo.created}. todoChanged.`);
        assert(isDate(newTodo.created),`newTodo.created is not date ${newTodo.created}. todoChanged.`);
    }
    

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

        if(isDev()){
            assert(isString(oldItem.text), `oldItem.text is not a string ${oldItem.text}. todoChanged.`);
            assert(isString(newItem.text), `newItem.text is not a string ${newItem.text}. todoChanged.`);
            assert(isString(oldItem.key), `oldItem.key is not a string ${oldItem.key}. todoChanged.`);
            assert(isString(newItem.key), `newItem.key is not a string ${newItem.key}. todoChanged.`);
        }
        
        if(oldItem.checked!==newItem.checked){ return true } 
        if(oldItem.idx!==newItem.idx){ return true }  
        if(oldItem.text!==newItem.text){ return true }
        if(oldItem.key!==newItem.key){ return true } 
    }


    for(let i=0; i<newTodo.attachedTags.length; i++){
        if(isDev()){
            assert(isString(oldTodo.attachedTags[i]), `oldTodo.attachedTags[${i}] is not a string ${oldTodo.attachedTags[i]}. todoChanged.`);
            assert(isString(newTodo.attachedTags[i]), `newTodo.attachedTags[${i}] is not a string ${newTodo.attachedTags[i]}. todoChanged.`);
        }

        if(oldTodo.attachedTags[i]!==newTodo.attachedTags[i]){ return true }
    }
};



export let attachEmptyTodo = (selectedCategory:Category) => (todos:Todo[]) => {
    let sorted = todos.sort((a:Todo,b:Todo) => a.priority-b.priority);
    let priority = sorted[0] ? sorted[0].priority - 1 : 0;
    let emptyTodo = generateEmptyTodo(generateId(),selectedCategory,priority);  
    return prepend(emptyTodo)(todos);
};



export let findAttachedProject = (projects:Project[]) => (t:Todo) : Project => {
    for(let i=0; i<projects.length; i++){
        let attachedTodosIds = projects[i].layout.filter(isString) as string[];
        if(contains(t._id)(attachedTodosIds)){ return projects[i] }
    } 
    return undefined;     
};  



export let byAttachedToProject = (projects:Project[]) => (t:Todo) : boolean => {

    for(let i=0; i<projects.length; i++){
        let attachedTodosIds = projects[i].layout.filter(isString) as string[];

        if(isDev()){
           assert(isArrayOfStrings(attachedTodosIds),`attachedTodosIds is not an array of strings ${attachedTodosIds}.`); 
        }

        if(contains(t._id)(attachedTodosIds)){ 
           return true; 
        }
    }  

    return false;     
};  



export let byAttachedToCompletedProject = (projects:Project[]) => (t:Todo) : boolean => {

    for(let i=0; i<projects.length; i++){
        let project = projects[i];
        let attachedTodosIds = project.layout.filter(isString) as string[];

        if(isDev()){
           assert(isArrayOfStrings(attachedTodosIds),`attachedTodosIds is not an array of strings ${attachedTodosIds}.`); 
        }

        if(contains(t._id)(attachedTodosIds)){ 
           let yes = isDate(project.completed); 
           return yes;
        }
    }   

    return false;     
};   



let byNotAttachedToProject = (projects:Project[]) => (t:Todo) : boolean => {
    return compose(not,byAttachedToProject(projects))(t);
};


 
let byNotAttachedToCompletedProject = (projects:Project[]) => (t:Todo) : boolean => {
    return compose(not, byAttachedToCompletedProject(projects))(t);
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

    if(isDev()){
       assert(isDate(d),`d is not a Date ${d}. getMonthName.`);
    }

    let monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
 
    return monthNames[d.getMonth()];
};


 
export let getDayName = (d:Date) : string => { 

    if(isDev()){
       assert(isDate(d), `d is not a Date ${d}. getDayName.`);
    }

    if(isToday(d)){ return "Today" }
    //idx===1 ? "Tomorrow" :

    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return days[d.getDay()];
};

   

export let daysLeftMark = (hide:boolean, deadline:Date, fontSize=13)  => {
    if(hide){ return null } 
     
    if(isDev()){
       assert(not(isNil(deadline)), `deadline undefined. ${deadline}. daysLeftMark.`);
       assert(isDate(deadline), `deadline not a Date. ${deadline}. daysLeftMark.`);
    }

    let daysLeft = daysRemaining(deadline);      
    let flagColor = daysLeft <= 1  ? "rgba(200,0,0,0.7)" : "rgba(100,100,100,0.7)";
       
    let style : any = { 
        display: "flex",
        alignItems: "center",
        paddingBottom: "5px", 
        color:flagColor,
        margin:"0px",
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
}; 



//Returns true if the first argument is greater than the second (first in future)
export let gtDate = (first:Date,second:Date) : boolean => {
    if(isNotDate(first) || isNotDate(second)){ return false }

    return first.getTime() > second.getTime();
};



export let compareByDate = (getDateFromObject:Function) => (i:Todo | Project, j:Todo | Project) => {

    if(isDev()){
       assert(isFunction(getDateFromObject), `getDateFromObject is not a function. ${getDateFromObject}. compareByDate.`);
    }

    let iDate = getDateFromObject(i); 
    let jDate = getDateFromObject(j);

    if(isNil(iDate) || isNil(jDate)){ return 1 }; 
           
    if(isDev()){
       assert(isDate(iDate), `iDate is not a Date. ${getDateFromObject}. compareByDate.`);
       assert(isDate(jDate), `jDate is not a Date. ${getDateFromObject}. compareByDate.`);
    }

    if(iDate.getTime() < jDate.getTime()){ return 1 }
    else{ return -1 }   
};



export let oneMinuteBefore = (date:Date) : Date => {
    let minuteInMs = 1000 * 60;
    return new Date(date.getTime() - minuteInMs); 
};



export let nextMidnight = () : Date => {
    let d = new Date()
    d.setHours(24,0,0,0); // next midnight
    return d;
};


     
export let getDatesRange = (
    start : Date,  
    days : number, 
    includeStart : boolean, 
    includeEnd : boolean,
    stop? : Date
) : Date[] => {
    if(isDev()){
       assert(isDate(start), `start is not Date ${start}. getDatesRange`);
    }
         
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
        let next = new Date(start.getTime())["addDays"](i);
        
        if(stop){
            if(stop.getTime() < next.getTime()){ 
               break 
            }
        }

        dates.push(next);
    }
    
    return dates;   
}; 



export let generateEmptyProject = () : Project => ({
    _id : generateId(), 
    type : "project", 
    name : "", 
    description : undefined,
    layout : [], 
    priority : Math.random() * 9999999999,
    deleted : undefined,
    created : new Date(), 
    deadline : null, 
    completed : null, 
    attachedTags : [],
    showCompleted : false,
    showScheduled : true
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
    attachedProjectsIds : [],
});



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
};



export let convertTodoDates = (t:Todo) : Todo => ({
    ...t, 
    reminder : isNil(t.reminder) ? null : new Date(t.reminder),
    deadline : isNil(t.deadline) ? null : new Date(t.deadline), 
    created : isNil(t.created) ? null : new Date(t.created),
    deleted : isNil(t.deleted) ? null: new Date(t.deleted),
    attachedDate : isNil(t.attachedDate) ? null : new Date(t.attachedDate),
    completedSet : isNil(t.completedSet) ? null : new Date(t.completedSet),
    completedWhen : isNil(t.completedWhen) ? null : new Date(t.completedWhen)
});



export let convertProjectDates = (p:Project) : Project => ({
    ...p,
    created : isNil(p.created) ? null : new Date(p.created),
    deadline : isNil(p.deadline) ? null : new Date(p.deadline),
    deleted :  isNil(p.deleted) ? null : new Date(p.deleted),
    completed :  isNil(p.completed) ? null : new Date(p.completed)
});



export let convertAreaDates = (a:Area) : Area => ({
    ...a, 
    created:isNil(a.created) ? null : new Date(a.created),
    deleted:isNil(a.deleted) ? null : new Date(a.deleted)
});

 

export let createHeading = (e, props:Store) : Project => {
    let id : string = props.selectedProjectId;

    if(isDev()){
        assert(
            props.selectedCategory==="project",   
            `Attempt to create heading outside of project template. 
            ${props.selectedCategory}. 
            createHeading.`
        );

        assert(!isNil(id), `selectedProjectId undefined ${id}. createHeading.`);
    }

    let project = props.projects.find( (p:Project) => p._id===id );

    if(isDev()){
        assert( 
            isProject(project),   
            `this.props.selectedProjectId ${props.selectedProjectId} do not correspond to existing project.
            ${props.projects}. createHeading`
        );
    }

    let priority = 0; 

    if(isNotEmpty(project.layout)){
        let item : LayoutItem = last(project.layout);

        if(isString(item)){ 
           let todo = props.todos.find( (t:Todo) => t._id===item );

           if(isDev()){
              assert(isTodo(todo), `todo is not of type Todo. todo : ${todo}. item : ${item}. createHeading.`);
           }

           priority = todo.priority + 1; 
        }else if(item["type"]==="heading"){
           let heading : Heading = item as Heading; 
           priority = heading.priority + 1;
        } 
    };

    let heading : Heading = {
        type : "heading", 
        priority,
        title : '',   
        _id : generateId(), 
        key : generateId()
    }; 

    return {...project, layout:[heading,...project.layout]};
};



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
}; 



export let convertDates = (object) => 
    cond([
        [
            isNil,
            () => object
        ],
        [
            typeEquals("todo"),
            (object:Todo) => convertTodoDates(object)
        ],
        [
            typeEquals("project"),
            (object:Project) => convertProjectDates(object)
        ],
        [
            typeEquals("area"),
            (object:Area) => convertAreaDates(object)
        ],
        [
            () => true,
            () => object
        ]
    ])(object);
 


export let checkForUpdates = () : Promise<UpdateCheckResult> => 
           requestFromMain(
               'checkForUpdates',
               [],
               (event,updateCheckResult) => updateCheckResult
           );



export let downloadUpdates = () : Promise<string> => 
           requestFromMain(
               'downloadUpdates',
               [],
               (event,path) => path
           );

