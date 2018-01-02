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
import { getTodos, queryToTodos, Todo, updateTodo, generateId, Project, Area, removeTodos, removeProjects, removeAreas, updateProjects, updateTodos, updateAreas, Heading, LayoutItem } from './database';
import { Category } from './Components/MainContainer';
import { ChecklistItem } from './Components/TodoInput/TodoChecklist';
let moment = require("moment");
import Moon from 'material-ui/svg-icons/image/brightness-3';
import { TodoInput } from './Components/TodoInput/TodoInput';
import { contains, isNil, all, prepend } from 'ramda';
 

export type Item = Area | Project | Todo; 

export let isItem = (item:Item) : boolean => item.type==="project" || item.type==="area" || item.type==="todo";

export let isArray = (item:any[]) : boolean => Array.isArray(item); 

export let isDate = (date) : boolean => date instanceof Date; 

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



export let keyFromDate = (date:Date) : string => {
    
    if(!isDate(date))
       throw new Error(`keyFromDate. input is not a date. ${JSON.stringify(date)}`); 
    
    let year = date.getFullYear();
    let day = date.getDate();
    let month = date.getMonth();
    return [year,month+1,day].join('-');
         
}
     

export type ItemWithPriority = Area | Project | Todo | Heading; 


let removeDeleted = (objects : Item[], updateDB : Function) : Item[] => {
 
    if(!objects)
        throw new Error(`objects undefined. ${JSON.stringify(objects)} removeDeleted.`);

    if(!updateDB)
        throw new Error(`updateDB undefined. ${JSON.stringify(updateDB)} removeDeleted.`);    

    if(!isFunction(updateDB))   
        throw new Error(`updateDB is not a function. ${JSON.stringify(updateDB)} removeDeleted.`);    
    
 
    let deleted = [];
    let remainder = [];


    for(let i=0; i<objects.length; i++){

        let object = objects[i];
        
        if(!isItem(object))
           throw new Error(`object has incorrect type ${JSON.stringify(object)} ${i} ${JSON.stringify(objects)}`);

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


export let layoutOrderChanged = (before:LayoutItem[], after:LayoutItem[]) : boolean => {
    
        if(before.length!==after.length)
           return true;
    
        for(let i=0; i<before.length; i++){
            let beforeItem : LayoutItem = before[i];
            let afterItem : LayoutItem = after[i];
    
            if(isNil(beforeItem)){
               throw new Error(`beforeItem isNil ${beforeItem}. layoutOrderChanged.`); 
            }

            if(isNil(afterItem)){
               throw new Error(`afterItem isNil ${afterItem}. layoutOrderChanged.`); 
            }


            if(typeof beforeItem !== typeof afterItem)
               return true;
    
            if(typeof beforeItem === "string"){
    
                if(beforeItem !== afterItem)
                   return true;
                else 
                   continue;
            }else if(beforeItem.type==="heading"){
     
                if(beforeItem["_id"] !== afterItem["_id"])
                   return true;
                else  
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

    if(!isString(size.width))
        throw new Error(`Width is not a string. ${size.width}. chooseIcon.`);

    if(!isString(size.height))
        throw new Error(`Height is not a string. ${size.height}. chooseIcon.`);
    
    if(!isCategory(selectedCategory))
        throw new Error(`selectedCategory is not a category. ${size.height}. chooseIcon.`);
    
    switch(selectedCategory){  

        case "inbox":
            return <Inbox style={{
                ...size,
                ...{ 
                    color:"dodgerblue", 
                    cursor:"default" 
                }
            }} />; 

        case "today":
            return <Star style={{
                ...size,
                ...{
                    color:"gold", 
                    cursor:"default" 
                }
            }}/>;

        case "upcoming":
            return <CalendarIco style={{
                ...size,
                ...{  
                    color:"crimson", 
                    cursor:"default"
                }
            }}/>;

        case "next":
            return <Layers style={{
                ...size,
                ...{
                    color:"darkgreen", 
                    cursor:"default"
                }
            }}/>;

        case "someday":
            return <BusinessCase  style={{
                ...size,
                ...{
                    color:"burlywood", 
                    cursor:"default"
                }
            }}/>;  
 
        case "logbook":
            return <Logbook style={{
                ...size,    
                ...{
                    color:"limegreen", 
                    cursor:"default"
                }
            }}/>;  

        case "trash":
            return <Trash style={{
                ...size,
                ...{
                    color:"darkgray", 
                    cursor:"default" 
                }
            }}/>; 

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
            }}/>;
            
        case "area":
            return <NewAreaIcon style={{
                ...size,
                ...{
                    color:"lightblue"
                }
            }}/>;        
 
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
            </div>;    
 
        default:
            return <Inbox style={{  
                ...size,
                ...{  
                    color:"dodgerblue", 
                    cursor:"default"
                }   
            }}/>; 
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
           throw new Error(`item undefined ${JSON.stringify(item)}. getTagsFromItems.`);
        }
            
        if(!isItem(item)){
           throw new Error(`item is not Item ${JSON.stringify(item)}. getTagsFromItems.`);
        } 
  
        let attachedTags : string[] = item.attachedTags;

        if(!isArray(attachedTags)){
            throw new Error(
                `attachedTags is not array. ${attachedTags} ${JSON.stringify(item)} getTagsFromItems.`
            ) 
        } 


        for(let j = 0; j<attachedTags.length; j++){

            let tag : string = attachedTags[j];

            if(!isString(tag)){
                throw new Error(
                   `tag is not a string ${tag} ${JSON.stringify(attachedTags)}.getTagsFromItems.`
                );
            }
 
            if(tags.indexOf(item.attachedTags[j])===-1)
               tags.push(item.attachedTags[j]); 
 
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
}; 
 


export let stringToLength = (s : string, length : number) : string => {

    if(!isString(s))
       throw new Error(`s is not a string ${s}. stringToLength.`);

    if(isNaN(length))
       throw new Error(`length is not a number ${length}. stringToLength.`);

    return s.substring(0, length) + "...";

}; 
   






export let uppercase = (str:string) : string => { 

    if(!isString(str))
       throw new Error(`str is not a string ${str}. uppercase.`); 

    if(str.length===0)
       return str; 

    return str.substring(0,1).toUpperCase() + str.substring(1,str.length);

};
 

   



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




export let byNotDeleted = (item:Item) : boolean => { 

    if(!isItem(item))
       throw new Error(`item have incorrect type. ${JSON.stringify(item)}. byNotDeleted`); 
    
    return !item.deleted;
  
}  



export let byDeleted = (item:Item) : boolean => { 

    if(!isItem(item))
       throw new Error(`item have incorrect type. ${JSON.stringify(item)}. byDeleted`); 

    return !!item.deleted;
 
}  



export let byNotCompleted = (item:Project | Todo) : boolean => { 

    if(item.type!=="project" && item.type!=="todo")
       throw new Error(`item have incorrect type. ${JSON.stringify(item)}. byNotCompleted`); 

    return !item.completed;
 
}   
  




export let byCompleted = (item:Project | Todo) : boolean => { 

    if(item.type!=="project" && item.type!=="todo")
       throw new Error(`item have incorrect type. ${JSON.stringify(item)}. byCompleted`); 

    return !!item.completed;
 
}  


   
export let byTags = (selectedTag:string) => (item:Item) : boolean => { 

    if(!isString(selectedTag))
       throw new Error(`selectedTag is not a string. ${selectedTag}. byTags.`); 
     
    if(selectedTag.length===0)
       throw new Error(`selectedTag is empty. byTags.`); 

    if(selectedTag==="All") 
       return true;    

    if(item===undefined || item===null)
       return false;   
  
    return item.attachedTags.indexOf(selectedTag)!==-1;

}  
    
 
     
export let byCategory = (selectedCategory:Category) => (item:Todo) : boolean => { 
 
    if(!isCategory(selectedCategory)){
        throw new Error(`selectedCategory is not of type Category. ${selectedCategory}. byCategory.`);
    }
 
    if(item.type!=="todo"){
        throw new Error(`item is not of type Todo. ${JSON.stringify(item)}. ${selectedCategory}. byCategory.`);
    }

    return item.category===selectedCategory;

} 
 


export let insideTargetArea = (target:HTMLElement,x:number,y:number) : boolean => {

    if(target===null || target===undefined)
       return false;   

    if(!isFunction(target.getBoundingClientRect))
        throw new Error(`target is not an HTMLElement. ${JSON.stringify(target)}. insideTargetArea`);   
 
    let react = target.getBoundingClientRect();
     
    if(x>react.left && x<react.right)
       if(y>react.top && y<react.bottom)
          return true; 
    
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
    
    container.style.width="60px";
    container.style.height="30px";
    container.style.backgroundColor="cadetblue";
    container.style.position="relative";
    container.style.display="flex";
    container.style.justifyContent="center";
    container.style.textAlign="center";
    container.style.zIndex = "1000000"; 

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
    counter.innerHTML="1";  

    container.appendChild(counter);
    rectangle.appendChild(container);

    return rectangle; 
}





export let todoChanged = (oldTodo:Todo,newTodo:Todo) : boolean => {

     
    if(oldTodo.type!=="todo")
        throw new Error(`oldTodo is not todo ${JSON.stringify(oldTodo)}. todoChanged.`);

    if(newTodo.type!=="todo")
        throw new Error(`newTodo is not todo ${JSON.stringify(newTodo)}. todoChanged.`);



    if(typeof oldTodo._id!=="string")
        throw new Error(`oldTodo._id is not string ${oldTodo._id}. todoChanged.`);
    if(typeof newTodo._id!=="string")
        throw new Error(`newTodo._id is not string ${newTodo._id}. todoChanged.`);



    if(oldTodo._id!==newTodo._id)
       return true;
        


    if(typeof oldTodo.title!=="string")
        throw new Error(`oldTodo.title is not string ${oldTodo.title}. todoChanged.`);
    if(typeof newTodo.title!=="string")
        throw new Error(`newTodo.title is not string ${newTodo.title}. todoChanged.`);


    if(typeof oldTodo.note!=="string")
        throw new Error(`oldTodo.note is not string ${oldTodo.title}. todoChanged.`);
    if(typeof newTodo.note!=="string")
        throw new Error(`newTodo.note is not string ${newTodo.title}. todoChanged.`);



    if(oldTodo.title!==newTodo.title)
       return true;
 
    if(oldTodo.note!==newTodo.note)
       return true;  



    if(isNaN(oldTodo.priority))
        throw new Error(`oldTodo.priority is not number ${oldTodo.priority}. todoChanged.`);
    if(isNaN(newTodo.priority))
        throw new Error(`newTodo.priority is not number ${newTodo.priority}. todoChanged.`);
         
  

    if(oldTodo.priority!==newTodo.priority)
       return true;
    


    if(!isCategory(oldTodo.category))
        throw new Error(`oldTodo.category is not of type Category ${oldTodo.category}. todoChanged.`);
    if(!isCategory(newTodo.category))
        throw new Error(`newTodo.category is not of type Category ${newTodo.category}. todoChanged.`);
         


    if(oldTodo.category!==newTodo.category)
        return true;


    if(oldTodo.checked!==newTodo.checked)
        return true;   
    


    if(!isArray(oldTodo.checklist)) 
        throw new Error(`oldTodo.checklist is not an Array. ${oldTodo.checklist}. todoChanged.`);
    if(!isArray(newTodo.checklist))
        throw new Error(`newTodo.checklist is not an Array. ${newTodo.checklist}. todoChanged.`);
    

    if(!isArray(oldTodo.attachedTags)) 
        throw new Error(`oldTodo.attachedTags is not an Array. ${oldTodo.attachedTags}. todoChanged.`);
    if(!isArray(newTodo.attachedTags))
        throw new Error(`newTodo.attachedTags is not an Array. ${newTodo.attachedTags}. todoChanged.`);
         
    
    if(oldTodo.checklist.length!==newTodo.checklist.length)
        return true;
        
    if(oldTodo.attachedTags.length!==newTodo.attachedTags.length)
        return true;


    if(!isDate(oldTodo.created)) 
        throw new Error(`oldTodo.created is not date ${oldTodo.created}. todoChanged.`);

    if(!isDate(newTodo.created))
        throw new Error(`newTodo.created is not date ${newTodo.created}. todoChanged.`);
     
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


        if(!isString(oldItem.text))
            throw new Error(`oldItem.text is not a string ${oldItem.text}. todoChanged.`);

        if(!isString(newItem.text))
            throw new Error(`newItem.text is not a string ${newItem.text}. todoChanged.`);
        
        if(!isString(oldItem.key))
            throw new Error(`oldItem.key is not a string ${oldItem.key}. todoChanged.`);

        if(!isString(newItem.key))
            throw new Error(`newItem.key is not a string ${newItem.key}. todoChanged.`);
        
            
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

        if(!isString(oldTodo.attachedTags[i]))
            throw new Error(`oldTodo.attachedTags[${i}] is not a string ${oldTodo.attachedTags[i]}. todoChanged.`);

        if(!isString(newTodo.attachedTags[i]))
            throw new Error(`newTodo.attachedTags[${i}] is not a string ${newTodo.attachedTags[i]}. todoChanged.`);
        

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
  



export let byNotAttachedToAreaFilter = (areas:Area[]) => (t:Todo) : boolean => {
    for(let i=0; i<areas.length; i++)
        if(contains(t._id)(areas[i].attachedTodosIds))
           return false;
    return true;             
}; 


export let byNotAttachedToProjectFilter = (projects:Project[]) => (t:Todo) : boolean => {
    for(let i=0; i<projects.length; i++){
        let attachedTodosIds = projects[i].layout.filter(isString) as string[];
         
        if(contains(t._id)(attachedTodosIds))
           return false;
    } 
    return true;     
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

    if(!isDate(d)) 
        throw new Error(`d is not a Date ${d}. getMonthName.`);  

    let monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
 
    return monthNames[d.getMonth()];
 
}

 
 
export let getDayName = (d:Date) : string => { 

    if(!isDate(d)) 
        throw new Error(`d is not a Date ${d}. getDayName.`);  

    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return days[d.getDay()];

}



     
    
export let addDays = (date:Date, days:number) => {
 
    if(!isDate(date))    
        throw new Error(`date is not a Date. ${date}. addDays.`);
 
    if(isNaN(days))
        throw new Error(`days is not a number. ${days}. addDays.`);

     
    let next = new Date();
        
    next.setDate(date.getDate() + days);

    return next; 

}
 


export let daysLeftMark = (hide:boolean, deadline:Date, showFlag:boolean)  => {
 
    if(hide)  
       return null; 
     
    if(isNil(deadline))
       throw new Error(`deadline undefined. ${deadline}. daysLeftMark.`);
 
    if(!isDate(deadline) )    
        throw new Error(`deadline not a Date. ${deadline}. daysLeftMark.`);

    let daysLeft = daysRemaining(deadline);      

    let flagColor = daysLeft <= 1  ? "rgba(200,0,0,0.7)" : "rgba(100,100,100,0.7)";
       
    let style : any = { 
        display: "flex",
        alignItems: "center",
        justifyContent:"flex-end", 
        color:flagColor,
        fontSize:"13px", 
        fontWeight:"900",  
        textAlign: "center",
        width: "240px",  
        fontFamily: "sans-serif"
    };   

    let iconStyle = {
        width:"18px",  
        height:"18px",
        marginLeft:"3px",
        color: flagColor, 
        marginRight:"5px" 
    };
       
    let attachedText = "";
 
    if(daysLeft < 0){

       attachedText = " days ago";

    }else if(daysLeft === 1){

       attachedText = " day left"; 

    }else{ 

       attachedText = " days left";

    }

    return <p style={style}>
               { showFlag ? <Flag style={iconStyle}/> : null }  
               { Math.abs(daysLeft) }{ attachedText }
           </p>  

}   


 
export let isToday = (date : Date) => {
    if(isNil(date))
       return false; 
    
    if(!isDate(date))  
        throw new Error(`date is not a Date. ${date}. isToday.`);
    
    return dateDiffInDays(new Date(), date)===0;
}    



export let getDateFromObject = (i) : Date => {
    if(i.type!=="todo" && i.type!=="project")
       throw new Error(`Input value have incorrect type. ${i}. getDateFromObject.`);

    if(i.type==="todo"){ 
        return i.attachedDate;
    }else if(i.type==="project"){ 
        return i.deadline;
    } 
}



export let compareByDate = (getDateFromObject:Function) => (i:Todo | Project, j:Todo | Project) => {

    if(typeof getDateFromObject !== "function")
       throw new Error(`getDateFromObject is not a function. ${getDateFromObject}. compareByDate.`);
    
    let iDate = getDateFromObject(i); 
    let jDate = getDateFromObject(j);


    if(iDate===null || iDate===undefined || !iDate)
        return -1;
        
    if(jDate===null || jDate===undefined || !jDate)
        return -1;  
            
    
    if( !isDate(iDate) )
        throw new Error(`iDate is not a Date. ${getDateFromObject}. compareByDate.`);


    if( !isDate(jDate) )
        throw new Error(`jDate is not a Date. ${getDateFromObject}. compareByDate.`);
    
        

    if(iDate.getTime() > jDate.getTime())
        return 1;
    else 
        return -1;   

}
 


export let daysRemaining = (date:Date) : number => {
    if(isNil(date)){
        throw new Error(`Date is Nil. daysRemaining.`);
     }

    return dateDiffInDays(new Date(), date); 
} 
 
   

export let dateDiffInDays = (A : Date, B : Date) : number  => {

    if(isNil(A) || isNil(B)){
       throw new Error(`Date is Nil. dateDiffInDays.`);
    }

    if(!isDate(A) || !isDate(B)){
        throw new Error(`Not a date. dateDiffInDays.`); 
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
 
    if(!isDate(start))
       throw new Error(`start is not Date ${start}. getDatesRange`);  
         
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

    if(array.length===0) 
       throw new Error(`randomArrayMember. array empty.`)

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
   