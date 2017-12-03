import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { map, range, merge, isEmpty, curry, cond, compose, contains, and, or,
    find, defaultTo, split, filter, clone, take, drop, splitAt, last, isNil } from 'ramda';
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import {
  cyan500, cyan700,   
  pinkA200,
  grey100, grey300, grey400, grey500,
  white, darkBlack, fullBlack, 
} from 'material-ui/styles/colors'; 
import {fade} from 'material-ui/utils/colorManipulator';
import FlatButton from 'material-ui/FlatButton';
import spacing from 'material-ui/styles/spacing'; 
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ActionFavorite from 'material-ui/svg-icons/action/favorite';
import ActionFavoriteBorder from 'material-ui/svg-icons/action/favorite-border';
import AutoComplete from 'material-ui/AutoComplete';
import './assets/styles.css';     
import { ipcRenderer } from 'electron';
import Dialog from 'material-ui/Dialog';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentClear from 'material-ui/svg-icons/content/clear';
import Menu from 'material-ui/svg-icons/navigation/menu';
import Divider from 'material-ui/Divider';
import AppBar from 'material-ui/AppBar'; 
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import DropDownMenu from 'material-ui/DropDownMenu'; 
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton'; 
import Play from 'material-ui/svg-icons/av/play-circle-outline';
import Pause from 'material-ui/svg-icons/av/pause-circle-outline';
import Clear from 'material-ui/svg-icons/content/clear';
import Remove from 'material-ui/svg-icons/content/remove'; 
import Face from 'material-ui/svg-icons/social/sentiment-very-satisfied';   
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import { Component } from "react"; 
import { DraggableCore, DraggableEventHandler, DraggableData } from 'react-draggable';
import FullScreen from 'material-ui/svg-icons/image/crop-square';
import SmallScreen from 'material-ui/svg-icons/image/filter-none';
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import { Observable } from 'rxjs/Rx';
import Audiotrack from 'material-ui/svg-icons/image/audiotrack';
let path = require("path");
var uniqid = require('uniqid');    
   
    
export let attachDispatchToProps = (dispatch,props) => merge({dispatch},props);  


export let debounce = (fun, mil=1000) => {
    let timer; 
    return function(load){
        clearTimeout(timer); 
        timer = setTimeout(function(){
            fun(load); 
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




  
