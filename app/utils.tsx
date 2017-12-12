import './assets/styles.css';     
import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { map, range, merge, isEmpty, curry, cond, compose, contains, and, or,
    find, defaultTo, split, filter, clone, take, drop, splitAt, last, isNil, toUpper, prepend, uniq, flatten, prop, toPairs } from 'ramda';
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
import { getTodos, queryToTodos, Todo, updateTodo } from './databaseCalls';
import { Category } from './MainContainer';
let moment = require("moment");


export let daysRemaining = (date) => {
    var eventdate = moment(date);
    var todaysdate = moment();
    return eventdate.diff(todaysdate, 'days');
}


export let chooseIcon = (selectedCategory:Category) => {
    switch(selectedCategory){
        case "inbox":
            return <Inbox style={{ 
                color:"dodgerblue", 
                width:"50px",
                height:"50px" 
            }} /> 

        case "today":
            return <Star style={{
                color:"gold", 
                width:"50px",
                height:"50px" 
            }}/>

        case "upcoming":
            return <CalendarIco style={{
                color:"crimson", 
                width:"50px",
                height:"50px"
            }}/>

        case "anytime":
            return <Layers style={{
                color:"darkgreen", 
                width:"50px",
                height:"50px"
            }}/>

        case "someday":
            return <BusinessCase  style={{
                color:"burlywood", 
                width:"50px",
                height:"50px"
            }}/> 

        case "logbook":
            return <Logbook style={{
                color:"limegreen", 
                width:"50px",
                height:"50px"
            }}/>  

        case "trash":
            return <Trash style={{
                color:"darkgray", 
                width:"50px",
                height:"50px" 
            }}/>

        case "project":  
            return <div style={{ 
                width:"30px",    
                height:"30px", 
                borderRadius:"100px",
                border:"5px solid rgba(108, 135, 222, 0.8)",
                boxSizing:"border-box",
                marginRight:"10px" 
            }}> 
            </div>

        case "area":
            return <NewAreaIcon 
                style={{
                    color:"lightblue", 
                    width:"50px",
                    height:"50px"
                }}
            />    
             
        default:
            return <Inbox style={{ 
                color:"dodgerblue", 
                width:"50px",
                height:"50px"
            }}/>; 
    }
}






export let applyDropStyle = (elem:Element, {x,y}) => {
    let arr = [].slice.call(elem.children);
    arr.map( c => elem.removeChild(c));

    let numb = document.createElement("div");
    numb.innerText = "1";

    let parentStyle = {
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        width: "60px",
        height: "20px",
        background: "cadetblue"
    }

    let childStyle = {
        background: "brown",
        width: "20px",
        height: "20px",
        alignItems: "center",
        textAlign: "center",
        color: "aliceblue",
        borderRadius: "30px",
        marginBottom: "-20px" 
    }
    
    map((pair) => {
        numb["style"][pair[0]]=pair[1];
    })(toPairs(childStyle))

    map((pair) => {
        elem["style"][pair[0]]=pair[1];
    })(toPairs(parentStyle))
        
    elem.appendChild(numb);  
    elem["style"].transform = "none";
    elem["style"].position = "absolute"; 
    elem["style"].left = (x-60)+'px';
    elem["style"].top = y+'px';
}   







export let getTagsFromTodos = (todos:Todo[]) : string[] => compose(
    uniq,    
    flatten, 
    prepend([
      "All", "Work", "Home",
      "Priority", "High", "Medium","Low"
    ]),
    map(prop("attachedTags")), 
    filter((v)  => !!v)
)(todos) as any;
  

 







export let attachDispatchToProps = (dispatch,props) => merge({dispatch},props);  






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
    if( typeof s !== "string" )
        throw new Error("Input is not a string.");

    if(s.length>length){  
        let splitted = splitAt(length,s);
        return splitted[0] + "..."; 
    }else 
        return s;
}; 
   




export let uppercase = (str:string) => {
   return toUpper(str.substring(0,1)) + str.substring(1,str.length);
};
 




export let wrapMuiThemeDark = (component : JSX.Element) : JSX.Element =>  
    <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
        {component}  
    </MuiThemeProvider>;  
  
 


export let wrapMuiThemeLight = (component : JSX.Element) : JSX.Element =>  
    <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        {component} 
    </MuiThemeProvider>;   




export let wrapCustomMuiTheme = (component : JSX.Element) : JSX.Element =>  
    <MuiThemeProvider muiTheme={muiTheme}>  
        {component} 
    </MuiThemeProvider>;  


 

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







export let insideTargetArea = (target) => (x,y) => {
    let react = target.getBoundingClientRect();
     
    if(x>react.left && x<react.right)
        if(y>react.top && y<react.bottom)
              return true;
   
    return false;
};




  
