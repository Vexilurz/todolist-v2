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
import {fade} from 'material-ui/utils/colorManipulator';
import FlatButton from 'material-ui/FlatButton'; 
import spacing from 'material-ui/styles/spacing'; 
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AutoComplete from 'material-ui/AutoComplete';
import '../assets/styles.css';  
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
import { wrapMuiThemeLight, wrapMuiThemeDark, attachDispatchToProps} from "../utils"; 
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import { createStore, combineReducers } from "redux"; 
import { Provider, connect } from "react-redux";
import Menu from 'material-ui/Menu';
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
import Inbox from 'material-ui/svg-icons/content/inbox';
import Trash from 'material-ui/svg-icons/action/delete';
import Search from 'material-ui/svg-icons/action/search'; 
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Calendar from 'material-ui/svg-icons/action/date-range';
import Logbook from 'material-ui/svg-icons/av/library-books';
import { ListItemIcon, ListItemText } from 'material-ui-next/List';
import { MenuList, MenuItem } from 'material-ui-next/Menu';
import NewProjectIcon from 'material-ui/svg-icons/image/timelapse';
import NewAreaIcon from 'material-ui/svg-icons/action/tab';
import Popover from 'material-ui/Popover';
let uniqid = require("uniqid"); 




interface NewProjectAreaPopoverProps{
    anchor:HTMLElement,
    open:boolean,
    close:Function,
    onNewProjectClick: (e:any) => void,
    onNewAreaClick: (e:any) => void
 }
  
 
 export class NewProjectAreaPopover extends Component<NewProjectAreaPopoverProps,{}>{
 
     constructor(props){ 
         super(props);
     }
 
     render(){
         return <Popover  
         style={{
             backgroundColor:"rgba(0,0,0,0)",
             background:"rgba(0,0,0,0)",
             borderRadius:"10px"
         }}     
         open={this.props.open}
         anchorEl={this.props.anchor}
         onRequestClose={() => this.props.close()}
         anchorOrigin={{   
             vertical: "top",
             horizontal: "left"
         }}  
         targetOrigin={{      
             vertical: "bottom",
             horizontal: "left"
         }}  
     >   
         <div style={{  
             backgroundColor: "rgb(39, 43, 53)",
             padding: "5px 10px",
             borderRadius: "10px",
             maxHeight: "250px",
             width: "370px",
             cursor: "pointer" 
         }}>    
 
         <div 
         onClick = {this.props.onNewProjectClick}
         className="newprojectitem" 
         style={{
             display:"flex", 
             alignItems: "flex-start", 
             padding:"7px"
         }}> 
             <NewProjectIcon style={{color:"lightblue"}}/> 
             <div style={{
                 display: "flex",
                 flexDirection: "column",
                 alignItems: "flex-start",
                 paddingLeft: "5px",
                 paddingTop: "3px" 
             }}>    
                 <div style={{  
                     color: "aliceblue",
                     fontFamily: "sans-serif",
                     fontSize: "15px"
                 }}>
                     New Project
                 </div>
                 <p style={{
                     margin: "0px",
                     paddingTop: "10px",
                     color: "rgba(190,190,190,0.5)",
                     fontFamily: "sans-serif" 
                 }}>
                     Define a goal, 
                     then work towards it 
                     one to-do at a time.  
                 </p> 
             </div> 
         </div>
 
 
         <div style={{
                 border:"1px solid rgba(200,200,200,0.1)",
                 marginTop: "5px",
                 marginBottom: "5px"
         }}>
         </div> 
 
         <div   
         onClick = {this.props.onNewAreaClick}
         className="newprojectitem" 
         style={{
             display:"flex", 
             alignItems: "flex-start", 
             padding:"7px"
         }}> 
             <NewAreaIcon style={{color:"lightblue", width:"34px"}}/>
             <div style={{
                 display: "flex",
                 flexDirection: "column",
                 alignItems: "flex-start",
                 paddingLeft: "5px",
                 paddingTop: "3px" 
             }}>    
                 <div style={{  
                     color: "aliceblue",
                     fontFamily: "sans-serif", 
                     fontSize: "15px"
                 }}>
                     New Area
                 </div>
                 <p style={{
                     margin: "0px",
                     paddingTop: "10px",
                     color: "rgba(190,190,190,0.5)",
                     fontFamily: "sans-serif",
                     width:"85%"  
                 }}>
                     Group your projects and to-dos
                     based on different responsibilities,
                     such as Family or Work. 
                 </p> 
             </div> 
         </div>
          
         </div>   
     </Popover> 
     }
 
 }