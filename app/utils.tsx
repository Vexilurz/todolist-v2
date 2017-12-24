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
import NewAreaIcon from 'material-ui/svg-icons/action/tab';
import Plus from 'material-ui/svg-icons/content/add';
import Trash from 'material-ui/svg-icons/action/delete';
import Search from 'material-ui/svg-icons/action/search'; 
import List from 'material-ui/svg-icons/action/list'; 
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Logbook from 'material-ui/svg-icons/av/library-books';
import Audiotrack from 'material-ui/svg-icons/image/audiotrack';
import { getTodos, queryToTodos, Todo, updateTodo, generateId, Project, Area } from './database';
import { Category } from './Components/MainContainer';
import { ChecklistItem } from './Components/TodoInput/TodoChecklist';
let moment = require("moment");
import Moon from 'material-ui/svg-icons/image/brightness-3';
import { TodoInput } from './Components/TodoInput/TodoInput';


 
export let daysRemaining = (date) : number => {

    var eventdate = moment(date);

    var todaysdate = moment();

    return eventdate.diff(todaysdate, 'days');

}


 
export let swap = (array:any[], fromIdx:number, toIdx:number) : any[] => {
        let copy = [...array];

        let temp = copy[fromIdx];
        copy[fromIdx] = copy[toIdx]; 
        copy[toIdx] = copy[fromIdx]; 
  
        return copy;
}



export let chooseIcon = (
    size : { width:string, height:string }, 
    selectedCategory : Category
) : JSX.Element => {

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


        case "anytime":
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
            }}/>    
 
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
    //Priority:
    "Low",
    //Priority:
    "Medium",
    //Priority: 
    "High",
    //Location:
    "Home",
    //Location:
    "Office",
    //Location:
    "Everywhere",
    //Status:
    "Waiting",
    //Time:
    "5min",
    //Time:
    "15min",
    //Time:
    "1h",
    //Energy:
    "Easy",
    //Energy:   
    "Hard",
    "Errand",
    "Private",
    "Work"
];



export let getTagsFromItems = (items:Item[]) : string[] => {

    let tags = []; 

    for(let i = 0; i<items.length; i++){

        let item : Item = items[i];

        for(let j = 0; j<item.attachedTags.length; j++){

            if(tags.indexOf(item.attachedTags[j])===-1)
               tags.push(item.attachedTags[j])
 
        }
        
    } 

    return tags; 

}




export let attachDispatchToProps = (dispatch,props) => ({...props, dispatch});




export let debounce = (fun, mil=50) => {
    let timer; 
    return function(...load){
        clearTimeout(timer); 
        timer = setTimeout(function(){
            fun(...load); 
        }, mil); 
    };  
}; 
 



export let allPass = (funcs : Function[], item) : boolean => {

    if(funcs.length===0)
       return true;  

    for(let i=0; i<funcs.length; i++)
        if(!funcs[i](item))
            return false; 

    return true;
} 
  


export let stringToLength = (s : string, length : number) : string => {

    if( typeof s !== "string" )
        return '';

    if(s.length>length)  
        return s.substring(0, length) + "..."; 
    else 
        return s;
        
}; 
   

 
export let diffDays = (dateA : Date, dateB : Date) : number => {
    var a = moment(dateA); 
    var b = moment(dateB);
    return b.diff(a, 'days');
};






export let uppercase = (str:string) : string => { 

    if(str.length===0)
       return str; 

    return str.substring(0,1).toUpperCase() + str.substring(1,str.length);

};
 

   



export let wrapMuiThemeDark = (component : JSX.Element) : JSX.Element => { 
 
    return <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
        
        {component}  
    
    </MuiThemeProvider>

}
  
 


export let wrapMuiThemeLight = (component : JSX.Element) : JSX.Element =>  {

    return <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        
        {component} 
    
    </MuiThemeProvider>

}   




export let wrapCustomMuiTheme = (component : JSX.Element) : JSX.Element =>  {
    
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




export let getMousePositionX = (container : HTMLElement, event:any) => event.pageX - container.offsetLeft;  



export let arrayContainsItem = (array) => (item) : boolean => array.includes(item); 






type Item = Area | Project | Todo;


export let byNotDeleted = (item:Item) : boolean => { 
    
    return !item.deleted;
  
}  

export let byDeleted = (item:Project | Todo) : boolean => { 

    if(item.type==="area")
       return true; 
    
    return !!item.deleted;
 
}  

export let byNotCompleted = (item:Project | Todo) : boolean => { 

    if(item.type==="area")
       return true; 
    
    return !item.completed;
 
}   
 


export let byCompleted = (item:Project | Todo) : boolean => { 

    if(item.type==="area")
       return true; 
    
    return !!item.completed;
 
}  



   
export let byTags = (selectedTag:string) => (item:Item) : boolean => { 
    
    if(selectedTag==="All" || selectedTag==="") 
       return true;    

    if(item===undefined || item===null)
       return false; 
  
    return item.attachedTags.indexOf(selectedTag)!==-1;

}  
    

     
export let byCategory = (selectedCategory:string) => (item:Todo) : boolean => { 

    if(item===undefined || item===null)
       return false; 
      
    if(item.type==="area" || item.type==="project")   
       return true;    

    if(selectedCategory==="anytime")
        return true;  
   
    return item.category===selectedCategory;

} 



 
 
export let showTags = (selectedCategory:Category) : boolean => 
    selectedCategory!=="inbox" && 
    selectedCategory!=="someday" &&
    selectedCategory!=="area" &&
    selectedCategory!=="project";



export let insideTargetArea = (target) => (x,y) : boolean => {
    if(target===null || target===undefined)
       return false;  

    let react = target.getBoundingClientRect();
     
    if(x>react.left && x<react.right)
        if(y>react.top && y<react.bottom)
              return true;
   
    return false;
};





export let insert = (array:any[], item:any, idx:number) : any[] => {
    
        return [
            ...array.slice(0,idx),
            item,
            ...array.slice(idx),
        ] 
 
}  



export let replace = (array:any[], item:any, idx:number) : any[] => {
    
        return [
            ...array.slice(0,idx),
            item,
            ...array.slice(idx+1),
        ]
 
}  



export let remove = (array:any[], idx:number) : any[] => {
    
        return [
            ...array.slice(0,idx),
            ...array.slice(idx+1),
        ]
  
}  


export let unique = (array:string[]) : string[] => {
 
    let values = [];

    for(var i=0; i<array.length; i++)
        if(values.indexOf(array[i]) === -1)
           values.push(array[i]);

    return values;

}



export let hideChildrens = (elem) => {
    
        let children = [].slice.call(elem.children);
        
        for(let i=0; i<children.length; i++){ 
            children[i].style.visibility = 'hidden';
            children[i].style.opacity = 0; 
        }
        
    }
    

export let makeChildrensVisible = (elem) => {

    let children = [].slice.call(elem.children);
    
    for(let i=0; i<children.length; i++){
        children[i].style.visibility = '';
        children[i].style.opacity = 1;
    }

}
     
    
export let generateDropStyle = (id): HTMLElement => {
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
    
    if(oldTodo.checklist.length!==newTodo.checklist.length)
        return true;
        
 
    if(oldTodo.attachedTags.length!==newTodo.attachedTags.length)
        return true;


    if(oldTodo.category!==newTodo.category)
        return true;

    if(oldTodo.title!==newTodo.title)
        return true;

    if(oldTodo.checked!==newTodo.checked)
        return true;   

    if(oldTodo.note!==newTodo.note)
        return true;   


    if(oldTodo.deadline instanceof Date  &&  newTodo.deadline instanceof Date){

        if(oldTodo.deadline.getTime()!==newTodo.deadline.getTime())
            return true;  

    }else{

        if(oldTodo.deadline!==newTodo.deadline)
            return true;  

    }  
    

    if(oldTodo.attachedDate instanceof Date  &&  newTodo.attachedDate instanceof Date){
        
        if(oldTodo.attachedDate.getTime()!==newTodo.attachedDate.getTime())
            return true;  

    }else{

        if(oldTodo.attachedDate!==newTodo.attachedDate)
            return true;  

    }   


    for(let i=0; i<oldTodo.checklist.length; i++){

        let oldItem : ChecklistItem = oldTodo.checklist[i];
        let newItem : ChecklistItem = newTodo.checklist[i];
 
        if(oldItem.checked!==newItem.checked)
           return true; 

        if(oldItem.idx!==newItem.idx)
           return true;  
        
        if(oldItem.text!==newItem.text)
           return true; 
        
        if(oldItem.key!==newItem.key)
           return true; 

    }


    for(let i=0; i<newTodo.attachedTags.length; i++)
        if(oldTodo.attachedTags[i]!==newTodo.attachedTags[i])
           return true; 
    
}
 



     
 
export let generateTagElement = (tag:string,idx:number) : JSX.Element => {

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
            {tag.substring(0, 25) + (tag.length > 25 ? "..." : '')}  
            </div>
        </div>
    </div>

}



export let getMonthName = (d:Date) : string => {

  let monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  return monthNames[d.getMonth()];

}


 
export let getDayName = (d:Date) => { 
    
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let dayName = days[d.getDay()];

    return dayName;

}



     
    
export let addDays = (date:Date, days:number) => {
    
    let next = new Date();
        
    next.setDate(date.getDate() + days);

    return next; 

}
 


export let daysLeftMark = (open:boolean, deadline, showFlag:boolean) : JSX.Element => {
 
    if(open)
       return null;
    
    if(deadline === null || deadline===undefined)
       return null;   

    let daysLeft = daysRemaining(deadline);      

    let flagColor = (daysLeft === 1 || daysLeft === 0) ? "rgba(200,0,0,0.7)" : "rgba(100,100,100,0.7)";
       
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
    let clone = new Date(date.getTime());
    let today = new Date();
    today.setHours(0,0,0,0);
    clone.setHours(0,0,0,0);
    return today.getTime() == clone.getTime();
}    



export let getDateFromObject = (i) => {
    
    if(i.type==="todo"){
            
        if(typeof i.attachedDate === "string")
            return new Date(i.attachedDate)
        else 
            return i.attachedDate;

    }else if(i.type==="project"){ 

        if(typeof i.deadline === "string")
            return new Date(i.deadline)
        else 
            return i.deadline;

    }

    return false;  

}



export let compareByDate = (getDateFromObject:Function) => (i, j) => {

    let iDate = getDateFromObject(i); 
    let jDate = getDateFromObject(j);

    if(iDate===null || iDate===undefined || iDate===false)
        return -1;
        
    if(jDate===null || jDate===undefined || jDate===false)
        return -1;  
            

    if(iDate.getTime() > jDate.getTime())
        return 1;
    else 
        return -1;   

}





export let dateDiffInDays = (a : Date, b : Date) : number  => {
    
    let _MS_PER_DAY = 1000 * 60 * 60 * 24;

    let utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());

    let utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);

}
    


    
export let getDatesRange = (start : Date, days : number, includeStart : boolean, includeEnd : boolean) : Date[] => {
    
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




export let keyFromDate = (date:Date) : string => date.toISOString().split('T')[0];




export let splitEvery = (n, array)  => {

    if(n===0 || array.length===0 || array.length<=n){
        return [array];
    }

    let result = [];
    let acc = [];
    let counter = 0;

    for(let i=0; i<array.length; i++){
        
        acc.push(array[i]);
        counter++;

        if(counter===n){
            result.push(acc);
            acc = []; 
            counter=0; 
        }
 
    }
 
    if(acc.length>0)
       result.push(acc);

    return result; 
}


export let randomInteger = (n:number) : number => {
    
    return Math.round(Math.random() * n);

}
     
    
export let randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    
    
export let randomArrayMember = (array : any[]) => {

    let range = array.length - 1;
    
    let idx = randomInteger(range);

    let member = array[idx]; 

    return member;
 
} 
    


export let generateEmptyProject = () : Project => ({
    _id : generateId(), 
    type : "project", 
    name : "New project",
    description : "Project description...",
    layout : [], 
    priority : Math.random() * 9999999999,
    deleted : undefined,
    created : new Date(), 
    deadline : null,
    completed : null, 
    attachedTodosIds : [], 
    attachedTags : []
});
  
 
  
export let generateEmptyArea = () : Area => ({
    _id : generateId(),
    name : "New area",
    priority : Math.random() * 9999999999,
    deleted : undefined, 
    type : "area",
    description : "Area description",
    attachedTags : [], 
    attachedTodosIds : [],  
    attachedProjectsIds : [],
});
  