import './assets/styles.css';     
import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
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
let ical = require('ical');
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
    getTodos, queryToTodos, Todo, updateTodo, generateId, Project, Area, 
    removeTodos, removeProjects, removeAreas, updateProjects, updateTodos, 
    updateAreas, Heading, LayoutItem, Calendar } from './database';
import { Category } from './Components/MainContainer';
import { ChecklistItem } from './Components/TodoInput/TodoChecklist';
let moment = require("moment");
import Moon from 'material-ui/svg-icons/image/brightness-3';
import { TodoInput } from './Components/TodoInput/TodoInput';
import { 
    contains, isNil, all, prepend, isEmpty, last,
    not, assoc, flatten, toPairs, map, compose, allPass, uniq 
} from 'ramda'; 
import { isDev, Store } from './app';
import { setRepeatedTodos, repeat } from './Components/RepeatPopup';
import { ipcRenderer, remote } from 'electron';
let Promise = require('bluebird');
 


export let measureTime = (f:() => void) => {
    let start : number = performance.now();
    f(); 
    let finish : number = performance.now();
    return finish - start; 
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



export let updateNeverTodos = (dispatch:Function,never:Todo[]) => {

    if(isEmpty(never)){ return }

    for(let i=0; i<never.length; i++){
        let todo :Todo = never[i];
        let {options} = todo.group; 
        let repeatedTodos : Todo[] = repeat(options, todo);

        setRepeatedTodos({dispatch,todo,repeatedTodos,options});
 
        console.log("request additional items...");     
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


export let getRangeDays = (start:Date, endDate:Date, step:number) : Date[] => {

    Date.prototype["addDays"] = function(days) {
      let date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
    }
   
    let dates = [];
    let last = dateToYearMonthDay(start);
    let end = dateToYearMonthDay(endDate); 

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


export let oneDayAhead = () : Date => { 

    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;   
    }
      
    return new Date()["addDays"](1);
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


export function arrayMove(arr, previousIndex, newIndex) {
    const array = arr.slice(0);
    if (newIndex >= array.length) {
      let k = newIndex - array.length;
      while (k-- + 1) {
        array.push(undefined);
      }
    }
    array.splice(newIndex, 0, array.splice(previousIndex, 1)[0]);
    return array;
} 


export type Item = Area | Project | Todo; 

export let isItem = (item:Item) : boolean => item.type==="project" || item.type==="area" || item.type==="todo";

export let isArray = (item:any[]) : boolean => Array.isArray(item); 
 
export let isDate = (date) : boolean => (date instanceof Date) && !isNaN( date.getTime() ); 
 
export let isFunction = (item) : boolean => typeof item==="function"; 

export let isString = (item) : boolean => typeof item==="string"; 

export let isCategory = (category : Category) : boolean => { 

    let categories : Category[] = [
        "inbox" , "today" , "upcoming" , "next" , "someday" , 
        "logbook" , "trash" , "project" , "area" , "evening" , 
        "deadline"
    ]; 

    let yes = contains(category,categories);
 
    return yes; 
}     

export let bySomeday = (todo:Todo) : boolean => todo.category==="someday";

export let byScheduled = (todo:Todo) : boolean => not(isNil(todo.attachedDate));
 
export let isTodo = (todo:any) : boolean => { 
    if(isNil(todo)){
        return false;
    } 

    return todo.type==="todo";
}

export let isArrayOfTodos = (array:any[]) : boolean => {
    return all((todo:Todo) => isTodo(todo), array );
} 

export let isProject = (project:Project) : boolean => {
    if(isNil(project)){
        return false;
    }

    return project.type==="project"; 
} 
 
export let isArrayOfProjects = (array:any[]) : boolean => {
   return all((project:Project) => isProject(project), array );
} 
 
export let isArea = (area:Area) : boolean => {
    if(isNil(area)){ return false }
    return area.type==="area"; 
}
     
  
export let isArrayOfAreas = (array:any[]) : boolean => {
    return all((area:Area) => isArea(area), array );
}


export let isArrayOfStrings = (array:any[]) : boolean => {
    if(!isArray(array))
       return false;

    for(let i=0; i<array.length; i++){
        if(!isString(array[i]))
           return false;   
    }

    return true; 
}
 
export let assert = (condition:boolean , error:string) : void => {
    if(not(condition) && isDev()){ 
       throw new Error(error);
    }  
} 


export let keyFromDate = (date:Date) : string => { 
    
    assert(isDate(date), `keyFromDate. input is not a date. ${JSON.stringify(date)}`);
    
    let year = date.getFullYear();
    let day = date.getDate(); 
    let month = date.getMonth();
    return [year,month+1,day].join('-'); 
}


export let getIcalData = (url:string) => new Promise( 
    resolve => {
        ical.fromURL( 
            url, 
            {}, 
            (err, data) => {
                if(!isNil(err)){ resolve(err); } 
                else{ resolve(data) } 
            }
        ) 
    }
);

 
export let updateCalendars = (calendars:Calendar[]) : Promise<Calendar[]> => {
    return Promise.all(
        calendars.map(
            (c:Calendar) => getIcalData(c.url)
                            .then(compose(map(pair => pair[1]), toPairs)) 
                            .then((events:any[]) : Calendar => ({...c,events}))    
        )
    )
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
 

    if(deleted.length>0)
        updateDB(deleted);
    
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
  
 

export let chooseIcon = (
    size : { width:string, height:string }, 
    selectedCategory : Category
) => {

    assert(isString(size.width),`Width is not a string. ${size.width}. chooseIcon.`);
    assert(isString(size.height), `Height is not a string. ${size.height}. chooseIcon.`);
    assert(isCategory(selectedCategory), `selectedCategory is not a category. ${size.height}. chooseIcon.`);
   
    switch(selectedCategory){  

        case "inbox":
            return <Inbox style={{
                ...size,
                ...{ 
                    color:"dodgerblue", 
                    cursor:"default" 
                }
            }} /> 

        case "today":
            return <Star style={{
                ...size,
                ...{
                    color:"gold", 
                    cursor:"default" 
                }
            }}/>

        case "upcoming":
            return <CalendarIco style={{
                ...size,
                ...{  
                    color:"crimson", 
                    cursor:"default"
                }
            }}/>

        case "next":
            return <Layers style={{
                ...size,
                ...{
                    color:"darkgreen", 
                    cursor:"default"
                } 
            }}/>

        case "someday":
            return <BusinessCase  style={{
                ...size,
                ...{
                    color:"burlywood", 
                    cursor:"default"
                }
            }}/>  
 
        case "logbook":
            return <Logbook style={{
                ...size,    
                ...{
                    color:"limegreen", 
                    cursor:"default"
                }
            }}/>  

        case "trash":
            return <Trash style={{
                ...size,
                ...{
                    color:"darkgray", 
                    cursor:"default" 
                }
            }}/>

        case "evening":
            return <Moon style={{
                ...size,
                ...{  
                    transform:"rotate(145deg)", 
                    color:"cornflowerblue", 
                    cursor:"default" 
                }
            }}/>;    
 
        case "deadline":
            return <Flag style={{
                ...size,
                ...{   
                    color:"black",  
                    cursor:"default"  
                }
            }}/>
            
        case "area":
            return <NewAreaIcon style={{
                ...size,
                ...{
                    color:"lightblue"
                }
            }}/>       
 
        case "project":
            return <div>          
                <div style={{
                    ...size,
                    ...{ 
                        display: "flex",
                        borderRadius: "50px",
                        border: "3px solid rgb(10, 100, 240)",
                        justifyContent: "center",
                        position: "relative" 
                    }  
                }}>   
                </div>
            </div>    
 
        default:
            return <Inbox style={{  
                ...size,
                ...{  
                    color:"dodgerblue", 
                    cursor:"default"
                }   
            }}/> 
    }
}



export let defaultTags = [ 
    "Priority:Low", 
    "Priority:Medium",
    "Priority:High",
    "Location:Home",
    "Location:Office",
    "Location:Everywhere",
    "Status:Waiting",
    "Time:5min",
    "Time:15min",
    "Time:1h",
    "Energy:easy",
    "Energy:hard",
    "Errand", 
    "Private",  
    "Work" 
];



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
    
    return uniq(tags); 
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
 

export let stringToLength = (s : string, length : number) : string => {

    assert(isString(s),`s is not a string ${s}. stringToLength.`);
    assert(!isNaN(length),`length is not a number ${length}. stringToLength.`);

    return s.length<=length ? s : s.substring(0, length) + "...";
}    
      

export let uppercase = (str:string) : string => { 

    assert(isString(str),`str is not a string ${str}. uppercase.`);
    
    if(str.length===0)
       return str; 
    
    return str.substring(0,1).toUpperCase() + str.substring(1,str.length);
}
 
 
export let wrapMuiThemeDark = (component) => { 
 
    return <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
        
        {component}  
    
    </MuiThemeProvider>

}
  

export let wrapMuiThemeLight = (component) =>  {

    return <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        
        {component} 
    
    </MuiThemeProvider>

}   




export let wrapCustomMuiTheme = (component) =>  {
    
    return <MuiThemeProvider muiTheme={muiTheme}>  
    
        {component} 
    
    </MuiThemeProvider> 

}


 

export const muiTheme = getMuiTheme({ 
  spacing: spacing,  
  fontFamily: 'Roboto, serif', 
  palette: {  
    primary1Color: cyan500, 
    primary2Color: cyan700, 
    primary3Color: grey400,
    accent1Color: pinkA200,
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: cyan700, 
    alternateTextColor: white,
    canvasColor: white,    
    borderColor: grey300,
    disabledColor: fade(darkBlack, 0.3),
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: fullBlack, 
  } 
});  


export let byNotSomeday = (t:Todo) : boolean => {
    return t.category!=="someday"; 
}

export let byHaveAttachedDate = (t:Todo) : boolean => {
    
    assert(isTodo(t), `t is not of type Todo ${JSON.stringify(t)}`);

    return not(isNil(t.attachedDate));
} 


export let byNotDeleted = (item:Item) : boolean => { 

    if(!isItem(item)){
        if(isDev()){ 
           throw new Error(`item have incorrect type. ${JSON.stringify(item)}. byNotDeleted`); 
        }
    }
    
    return !item.deleted;
  
}  



export let byDeleted = (item:Item) : boolean => { 

    if(!isItem(item))
       throw new Error(`item have incorrect type. ${JSON.stringify(item)}. byDeleted`); 

    return !!item.deleted;
 
}  



export let byNotCompleted = (item:Project | Todo) : boolean => { 

    if(item.type!=="project" && item.type!=="todo"){
        if(isDev()){ 
           throw new Error(`item have incorrect type. ${JSON.stringify(item)}. byNotCompleted`); 
        }
    }

    return !item.completed;
 
}   
  




export let byCompleted = (item:Project | Todo) : boolean => { 

    if(item.type!=="project" && item.type!=="todo"){
        if(isDev()){ 
           throw new Error(`item have incorrect type. ${JSON.stringify(item)}. byCompleted`);
        } 
    }

    return !!item.completed;
 
}  

 
   
export let byTags = (selectedTag:string) => (item:Item) : boolean => { 

    if(!isString(selectedTag)){
        if(isDev()){ 
           throw new Error(`selectedTag is not a string. ${selectedTag}. byTags.`); 
        }
    }
     
    if(selectedTag.length===0){
        if(isDev()){ 
           throw new Error(`selectedTag is empty. byTags.`); 
        }
    }

    if(selectedTag==="All") 
       return true;    

    if(item===undefined || item===null)
       return false;   
  
    return item.attachedTags.indexOf(selectedTag)!==-1;

}  
    
 
     
export let byCategory = (selectedCategory:Category) => (item:Todo) : boolean => { 
 
    if(!isCategory(selectedCategory)){
        if(isDev()){ 
           throw new Error(`selectedCategory is not of type Category. ${selectedCategory}. byCategory.`);
        }
    }
 

    return item.category===selectedCategory;

} 
 
 

export let insideTargetArea = (
    scrollableContainer:HTMLElement, target:HTMLElement,
    x:number,y:number
) : boolean => {

    if(target===null || target===undefined){ return false }

    if(!isFunction(target.getBoundingClientRect)){
        if(isDev()){ 
           throw new Error(`target is not an HTMLElement. ${JSON.stringify(target)}. insideTargetArea`); 
        }
    }  
 
    let {left,right,top,bottom} = target.getBoundingClientRect();
    let scrolledLeft = left;
    let scrolledTop = top;
    
    /*if(!isNil(scrollableContainer)){
        scrolledLeft = left + scrollableContainer.scrollLeft;
        scrolledTop = top + scrollableContainer.scrollTop;
    }*/  

    if(x>scrolledLeft && x<right)
       if(y>scrolledTop && y<bottom){ return true }
       
    return false;
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

     
    if(oldTodo.type!=="todo"){
        if(isDev()){ 
           throw new Error(`oldTodo is not todo ${JSON.stringify(oldTodo)}. todoChanged.`);
        }
    }

    if(newTodo.type!=="todo"){
        if(isDev()){ 
           throw new Error(`newTodo is not todo ${JSON.stringify(newTodo)}. todoChanged.`);
        }
    }



    if(typeof oldTodo._id!=="string"){
        if(isDev()){ 
           throw new Error(`oldTodo._id is not string ${oldTodo._id}. todoChanged.`);
        }
    }

    if(typeof newTodo._id!=="string"){
        if(isDev()){ 
           throw new Error(`newTodo._id is not string ${newTodo._id}. todoChanged.`);
        }
    }



    if(oldTodo._id!==newTodo._id)
       return true;
        


    if(typeof oldTodo.title!=="string"){
        if(isDev()){ 
            throw new Error(`oldTodo.title is not string ${oldTodo.title}. todoChanged.`);
        }
    }
    if(typeof newTodo.title!=="string"){
        if(isDev()){ 
            throw new Error(`newTodo.title is not string ${newTodo.title}. todoChanged.`);
        }
    }


    if(typeof oldTodo.note!=="string"){
        if(isDev()){ 
            throw new Error(`oldTodo.note is not string ${oldTodo.title}. todoChanged.`);
        }
    }
    if(typeof newTodo.note!=="string"){
        if(isDev()){ 
            throw new Error(`newTodo.note is not string ${newTodo.title}. todoChanged.`);
        }
    }



    if(oldTodo.title!==newTodo.title)
       return true;
 
    if(oldTodo.note!==newTodo.note)
       return true;  



    if(isNaN(oldTodo.priority)){
        if(isDev()){ 
           throw new Error(`oldTodo.priority is not number ${oldTodo.priority}. todoChanged.`);
        }
    }
    if(isNaN(newTodo.priority)){
        if(isDev()){ 
           throw new Error(`newTodo.priority is not number ${newTodo.priority}. todoChanged.`);
        }
    }
         
  

    if(oldTodo.priority!==newTodo.priority)
       return true;
    


    if(!isCategory(oldTodo.category)){
        if(isDev()){ 
           throw new Error(`oldTodo.category is not of type Category ${oldTodo.category}. todoChanged.`);
        }
    }
    if(!isCategory(newTodo.category)){
        if(isDev()){ 
           throw new Error(`newTodo.category is not of type Category ${newTodo.category}. todoChanged.`);
        }
    }
         


    if(oldTodo.category!==newTodo.category)
        return true;


    if(oldTodo.checked!==newTodo.checked)
        return true;   
    


    if(!isArray(oldTodo.checklist)){ 
        if(isDev()){ 
           throw new Error(`oldTodo.checklist is not an Array. ${oldTodo.checklist}. todoChanged.`);
        }
    }
    if(!isArray(newTodo.checklist)){
        if(isDev()){ 
           throw new Error(`newTodo.checklist is not an Array. ${newTodo.checklist}. todoChanged.`);
        }
    }
    

    if(!isArray(oldTodo.attachedTags)){ 
        if(isDev()){ 
           throw new Error(`oldTodo.attachedTags is not an Array. ${oldTodo.attachedTags}. todoChanged.`);
        }
    }
    if(!isArray(newTodo.attachedTags)){
        if(isDev()){ 
           throw new Error(`newTodo.attachedTags is not an Array. ${newTodo.attachedTags}. todoChanged.`);
        }
    }
         
    
    if(oldTodo.checklist.length!==newTodo.checklist.length)
        return true;
        
    if(oldTodo.attachedTags.length!==newTodo.attachedTags.length)
        return true;


    if(!isDate(oldTodo.created)){ 
        if(isDev()){ 
           throw new Error(`oldTodo.created is not date ${oldTodo.created}. todoChanged.`);
        }
    }

    if(!isDate(newTodo.created)){
        if(isDev()){ 
           throw new Error(`newTodo.created is not date ${newTodo.created}. todoChanged.`);
        }
    }
     
    if(oldTodo.created.getTime()!==newTodo.created.getTime())
        return true; 



    if(isDate(newTodo.deadline) && isDate(oldTodo.deadline)){
        if(oldTodo.deadline.getTime()!==newTodo.deadline.getTime())
            return true;  
    }else{
        if(oldTodo.deadline!==newTodo.deadline)
            return true;  
    }



    if(isDate(newTodo.deleted) && isDate(oldTodo.deleted)){
        if(oldTodo.deleted.getTime()!==newTodo.deleted.getTime())
            return true;  
    }else{
        if(oldTodo.deleted!==newTodo.deleted)
            return true;  
    }



    if(isDate(newTodo.attachedDate) && isDate(oldTodo.attachedDate)){
        if(oldTodo.attachedDate.getTime()!==newTodo.attachedDate.getTime())
            return true; 
    }else{
        if(oldTodo.attachedDate!==newTodo.attachedDate)
            return true;  
    }



    if(isDate(newTodo.completed) && isDate(oldTodo.completed)){
        if(oldTodo.completed.getTime()!==newTodo.completed.getTime())
            return true;    
    }else{ 
        if(oldTodo.completed!==newTodo.completed)
            return true;  
    }



    if(isDate(newTodo.reminder) && isDate(oldTodo.reminder)){
        if(oldTodo.reminder.getTime()!==newTodo.reminder.getTime())
            return true;    
    }else{ 
        if(oldTodo.reminder!==newTodo.reminder)
            return true;  
    }




    for(let i=0; i<oldTodo.checklist.length; i++){

        let oldItem : ChecklistItem = oldTodo.checklist[i];
        let newItem : ChecklistItem = newTodo.checklist[i];


        if(!isString(oldItem.text)){
            if(isDev()){ 
               throw new Error(`oldItem.text is not a string ${oldItem.text}. todoChanged.`);
            }
        }

        if(!isString(newItem.text)){
            if(isDev()){ 
               throw new Error(`newItem.text is not a string ${newItem.text}. todoChanged.`);
            }
        }
        
        if(!isString(oldItem.key)){
            if(isDev()){ 
               throw new Error(`oldItem.key is not a string ${oldItem.key}. todoChanged.`);
            }
        }

        if(!isString(newItem.key)){
            if(isDev()){ 
               throw new Error(`newItem.key is not a string ${newItem.key}. todoChanged.`);
            }
        }
        
            
        if(oldItem.checked!==newItem.checked)
           return true; 

        if(oldItem.idx!==newItem.idx)
           return true;  
        
        if(oldItem.text!==newItem.text)
           return true; 
        
        if(oldItem.key!==newItem.key)
           return true; 

    }


    for(let i=0; i<newTodo.attachedTags.length; i++){

        if(!isString(oldTodo.attachedTags[i])){
            if(isDev()){ 
               throw new Error(`oldTodo.attachedTags[${i}] is not a string ${oldTodo.attachedTags[i]}. todoChanged.`);
            }
        }

        if(!isString(newTodo.attachedTags[i])){
            if(isDev()){ 
               throw new Error(`newTodo.attachedTags[${i}] is not a string ${newTodo.attachedTags[i]}. todoChanged.`);
            }
        }
        

        if(oldTodo.attachedTags[i]!==newTodo.attachedTags[i])
           return true; 
    }
    


}
  


export let attachEmptyTodo = (selectedCategory:Category) => (todos:Todo[]) => {
    let sorted = todos.sort((a:Todo,b:Todo) => a.priority-b.priority);
    let priority = sorted[0] ? sorted[0].priority - 1 : 0;
    let emptyTodo = generateEmptyTodo(generateId(),selectedCategory,priority);  

    return prepend(emptyTodo)(todos);
}
  


export let findAttachedArea = (areas:Area[]) => (t:Todo) : Area => {
    for(let i=0; i<areas.length; i++)
        if(contains(t._id)(areas[i].attachedTodosIds))
           return areas[i];

    return undefined;             
}; 
 

export let findAttachedProject = (projects:Project[]) => (t:Todo) : Project => {
    for(let i=0; i<projects.length; i++){
        let attachedTodosIds = projects[i].layout.filter(isString) as string[];
         
        if(contains(t._id)(attachedTodosIds))
           return projects[i];
    } 

    return undefined;     
};  




export let byAttachedToArea = (areas:Area[]) => (t:Todo) : boolean => {
    for(let i=0; i<areas.length; i++)
        if(contains(t._id)(areas[i].attachedTodosIds))
           return true;
    return false;             
}; 


export let byAttachedToProject = (projects:Project[]) => (t:Todo) : boolean => {

    for(let i=0; i<projects.length; i++){
        let attachedTodosIds = projects[i].layout.filter(isString) as string[];

        assert(
          isArrayOfStrings(attachedTodosIds), 
         `attachedTodosIds is not an array of strings ${JSON.stringify(attachedTodosIds)}.`
        ); 
         
        if(contains(t._id)(attachedTodosIds)){
           return true;
        }
    }   

    return false;     
};  



 
export let generateEmptyTodo = (
    _id:string,
    selectedCategory:Category,
    priority:number
) : Todo => ({    
    _id,
    type:"todo", 
    category : selectedCategory,  
    title : '', 
    priority, 
    reminder : null, 
    checked : false,  
    note : '',
    checklist : [],   
    attachedTags : [],
    attachedDate : null,
    deadline : null,
    created : new Date(),  
    deleted : null, 
    completed : null
}  )


  
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
}



export let getMonthName = (d:Date) : string => {

    if(!isDate(d)){ 
        if(isDev()){ 
           throw new Error(`d is not a Date ${d}. getMonthName.`); 
        } 
    }

    let monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
 
    return monthNames[d.getMonth()];
 
}

 
 
export let getDayName = (d:Date) : string => { 

    if(!isDate(d)){ 
        if(isDev()){ 
           throw new Error(`d is not a Date ${d}. getDayName.`); 
        }
    } 

    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return days[d.getDay()];

}



     
    
export let addDays = (date:Date, days:number) => {
 
    if(!isDate(date)){    
        if(isDev()){ 
           throw new Error(`date is not a Date. ${date}. addDays.`);
        }
    }
 
    if(isNaN(days)){
        if(isDev()){ 
           throw new Error(`days is not a number. ${days}. addDays.`);
        }
    }

     
    let next = new Date();
        
    next.setDate(date.getDate() + days);

    return next; 

}
 


export let daysLeftMark = (hide:boolean, deadline:Date, fontSize=13)  => {
 
    if(hide){   
       return null; 
    }
     
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
    if(isNil(date))
       return false; 
  
    return daysRemaining(date)===0;
}    




export let compareByDate = (getDateFromObject:Function) => (i:Todo | Project, j:Todo | Project) => {

    if(typeof getDateFromObject !== "function"){
        if(isDev()){ 
           throw new Error(`getDateFromObject is not a function. ${getDateFromObject}. compareByDate.`);
        }
    }
    
    let iDate = getDateFromObject(i); 
    let jDate = getDateFromObject(j);


    if(iDate===null || iDate===undefined || !iDate)
        return -1;
        
    if(jDate===null || jDate===undefined || !jDate)
        return -1;  
            
    
    if( !isDate(iDate) ){
        if(isDev()){ 
           throw new Error(`iDate is not a Date. ${getDateFromObject}. compareByDate.`);
        }
    }


    if( !isDate(jDate) ){
        if(isDev()){ 
           throw new Error(`jDate is not a Date. ${getDateFromObject}. compareByDate.`);
        }
    }
    
        

    if(iDate.getTime() < jDate.getTime())
        return 1;
    else 
        return -1;   

}
 


export let daysRemaining = (date:Date) : number => {
    if(isNil(date)){
        if(isDev()){ 
           throw new Error(`Date is Nil. daysRemaining.`);
        }
    }

    return dateDiffInDays(new Date(), date); 
} 
 
   

export let dateDiffInDays = (A : Date, B : Date) : number  => {

    if(isNil(A) || isNil(B)){
        if(isDev()){ 
           throw new Error(`Date is Nil. dateDiffInDays.`);
        }
    }

    if(!isDate(A) || !isDate(B)){
        if(isDev()){ 
           throw new Error(`Not a date. dateDiffInDays.`); 
        }
    } 

   
    let _MS_PER_DAY = 1000 * 60 * 60 * 24;

    let utc1 = Date.UTC(A.getFullYear(), A.getMonth(), A.getDate());

    let utc2 = Date.UTC(B.getFullYear(), B.getMonth(), B.getDate());
 
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}
    

     
export let getDatesRange = (
    start : Date,  
    days : number, 
    includeStart : boolean, 
    includeEnd : boolean
) : Date[] => {
 
    if(!isDate(start)){
        if(isDev()){ 
           throw new Error(`start is not Date ${start}. getDatesRange`); 
        }
    } 
         
    Date.prototype["addDays"] = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }
 
    let dates = [];
    
    let from = 1; 
    let to = days-1;


    if(includeStart){
        from -= 1; 
    }

    if(includeEnd){
        to += 1;
    }
        
        
    for(let i=from; i<=to; i++)
        dates.push( new Date(start.getTime())["addDays"]( i ) );
    
    return dates; 
      
} 




export let randomInteger = (n:number) : number => {
    
    return Math.round(Math.random() * n);

} 
    

    

export let randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
 


    
export let randomArrayMember = (array : any[]) => {

    if(array.length===0){ 
        if(isDev()){ 
           throw new Error(`randomArrayMember. array empty.`)
        }
    }

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
    
 
export let setToJsonStorage = (key:string,json:any) : Promise<void> => new Promise(
    resolve => {
        ipcRenderer.removeAllListeners("setStorage"); 

        ipcRenderer.send("setStorage",{key, json});
        ipcRenderer.on(
            "setStorage",
            (event) => resolve()
        );
    } 
) 

export let getFromJsonStorage = (key:string) : Promise<any> => new Promise(
    resolve => {
        ipcRenderer.removeAllListeners("getStorage"); 

        ipcRenderer.send("getStorage",key); 
        ipcRenderer.on(
            "getStorage",
            (event, data) => resolve(data)
        );
    }
)




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
    
    completed : !t.completed ? undefined : 
                typeof t.completed==="string" ? new Date(t.completed) : 
                t.completed
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


export let convertDates = ([todos, projects, areas]) => [ 
    todos.map(convertTodoDates),
    projects.map(convertProjectDates),
    areas.map(convertAreaDates)     
]  


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

 
export let clearStorage = () : Promise<void> => { 
    return new Promise( 
        (resolve) => { 
           ipcRenderer.removeAllListeners("clearStorage"); 
           ipcRenderer.send("clearStorage");
           ipcRenderer.on("clearStorage", (event) => resolve());
        }
    )
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

 
export let isTodayOrPast = (date:Date) : boolean => 
                            isNil(date) ?    
                            false :  
                            daysRemaining(date)<=0;  

 
export let areaToKeywords = (a:Area) : string[] => {
    let description : string[] = a.description.split(",").filter( s => s.length>0 );
    let name : string[] = a.name.split(",").filter( s => s.length>0 );
    return [].concat.apply([], [ name, description ]);
}  


export let projectToKeywords = (p:Project) : string[] => {
    let headings : string[][] = p
                                .layout           
                                .filter((i) => not(isString(i)))
                                .map((h:Heading) => h.title.split(" ").filter( s => s.length>0 )); 
    let description : string[] = p.description.split(",").filter( s => s.length>0 );
    let name : string[] = p.name.split(",").filter( s => s.length>0 );
    let layout : string [] = [].concat.apply([], headings);
    return [].concat.apply([], [ name, description, layout ]);
}


export let todoToKeywords = (t:Todo) : string[] => {
    let category = t.category;
    let title : string [] = t.title.split(",").filter( s => s.length>0 );
    let note : string [] = t.note.split(",").filter( s => s.length>0 );
    let tags : string[] = t.attachedTags;  
    let checklist : string[] = t.checklist.map( c => c.text ).filter( s => s.length>0 );
    return [].concat.apply([], [ title, note, tags, checklist ]);
}