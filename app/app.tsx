import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, 
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, 
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, groupBy, concat 
} from 'ramda';
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import CircularProgress from 'material-ui/CircularProgress'; 
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
import AutoComplete from 'material-ui/AutoComplete';
import './assets/styles.css';  
import { ipcRenderer } from 'electron';
import Dialog from 'material-ui/Dialog';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Divider from 'material-ui/Divider';
import AppBar from 'material-ui/AppBar'; 
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import DropDownMenu from 'material-ui/DropDownMenu'; 
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton'; 
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import { Component } from "react"; 
import Paper from 'material-ui/Paper';
import { DraggableCore, DraggableEventHandler, DraggableData } from 'react-draggable';
import * as Draggable from 'react-draggable'; 
import { wrapMuiThemeLight, wrapMuiThemeDark, attachDispatchToProps, getTagsFromTodos} from "./utils"; 
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import { createStore, combineReducers } from "redux"; 
import { Provider, connect } from "react-redux";
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
import Plus from 'material-ui/svg-icons/content/add';
import Trash from 'material-ui/svg-icons/action/delete';
import Search from 'material-ui/svg-icons/action/search'; 
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Calendar from 'material-ui/svg-icons/action/date-range';
import Logbook from 'material-ui/svg-icons/av/library-books';
import { LeftPanel } from './LeftPanel';
import { MainContainer } from './MainContainer';
import PouchDB from 'pouchdb-browser';  



export let todos_db = new PouchDB('todos');
 
 
 
let uniqid = require('uniqid');
let path = require("path");

injectTapEventPlugin(); 
     
 
(() => {     
    let app=document.createElement('div'); 
    app.id='application';    
    document.body.appendChild(app);  
})();  
 
  


export class App extends Component<any,any>{

    constructor(props){  
        super(props);  
    }
 
    componentDidMount(){} 

    render(){    

        return wrapMuiThemeLight(
            <div style={{
                backgroundColor:"white",
                width:"100%",
                height:"100%",
                borderRadius:"1%", 
                scroll:"none",
                zIndex:2001,  
            }}>  
                <div style={{
                    display:"flex", 
                    width:"inherit",   
                    height:"inherit" 
                }}>    
    
                    <div className="drag"
                            style={{
                                pointerEvents:"none",   
                                position : "absolute", 
                                top:0,
                                left:0,   
                                width:"100%",
                                height:"10%" 
                            }}  
                    >   
                    </div> 
 
                    <LeftPanel /> 

                    <MainContainer />  

                </div> 
            </div>      
        );   

    }            
            
};           
 
 

ipcRenderer.on( 
    'loaded',    
    (event) => ReactDOM.render(
        <Provider store={store}>  
            <App />    
        </Provider>,
        document.getElementById('application')
    )  
);    


          
export let defaultStoreItems = {
    selectedCategory : "inbox",
    selectedTodoId : null,
    selectedTag : "All",
    
    openNewProjectAreaPopover : false,
    openTodoInput : false,
    showRightClickMenu : false,

    rightClickedTodoId : null,
    rightClickMenuX : 0,
    rightClickMenuY : 0,
 
    todos:[],
    tags:[] 
};   
  
 

let reducer = (state, action) => { 
    
    let newState = clone(state); 
    //{...state}; 
     
    switch(action.type){
        case "selectedCategory":
            newState["selectedCategory"] = action.load;
            break;
             
        case "selectedTag":  
            newState["selectedTag"] = action.load; 
            break; 
        
        case "openNewProjectAreaPopover":
            newState["openNewProjectAreaPopover"] = action.load;
            break;     

        case "openRightClickMenu":
            newState["showRightClickMenu"] = action.load.showRightClickMenu;
            newState["rightClickedTodoId"] = action.load.rightClickedTodoId;
            newState["rightClickMenuX"] = action.load.rightClickMenuX;
            newState["rightClickMenuY"] = action.load.rightClickMenuY;
            break;

        case "openTodoInput":
            newState["openTodoInput"] = action.load;
            if(action.load){ 
               newState["selectedTodoId"] = false; 
               newState["showRightClickMenu"] = false; 
            }  
            break;      
 
        case "showRightClickMenu":
            newState["showRightClickMenu"] = action.load;
            break;
     
        case "rightClickedTodoId" :
            newState["rightClickedTodoId"] = action.load;
            break;
 
        case "rightClickMenuX" :
            newState["rightClickMenuX"] = action.load;
            break;
 
        case "rightClickMenuY" :
            newState["rightClickMenuY"] = action.load;
            break;
          
        case "selectedTodoId":
            newState["selectedTodoId"] = action.load;
            break;     
        
        case "todos":  
            newState["todos"] = action.load;
            newState["showRightClickMenu"] = false;  
            newState["tags"] = getTagsFromTodos(action.load);    
    }  
  
    return newState;  
};      
  
  
export let store = createStore(reducer, defaultStoreItems); 
  



   