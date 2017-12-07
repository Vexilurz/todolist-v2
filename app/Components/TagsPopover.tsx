import '../assets/styles.css';  
import '../assets/calendarStyle.css'; 
import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, 
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, 
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, groupBy, concat, flatten, ifElse, uniq 
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
import { 
    wrapMuiThemeLight, wrapMuiThemeDark, attachDispatchToProps
} from "../utils"; 
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import { createStore, combineReducers } from "redux"; 
import { Provider, connect } from "react-redux";
//import Chip from 'material-ui-next/Chip';
import Chip from 'material-ui/Chip';
//icons
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
import Clear from 'material-ui/svg-icons/content/clear';
import PouchDB from 'pouchdb-browser';   
import List from 'material-ui/svg-icons/action/list'; 
import { getTodos, queryToTodos, Todo, updateTodo, generateID, addTodo } from '../databaseCalls';
let uniqid = require("uniqid"); 
//import Popover from 'material-ui-next/Popover'; 
import Popover from 'material-ui/Popover';
import { ThingsCalendarSmall } from './thingsCalendarSmall';



 
interface TagsPopoverProps{
    tags:string[], 
    close : Function,
    open : boolean,
    attachTag:(tag:string) => void,
    origin : any,  
    anchorEl : HTMLElement,
    point : any
}  

export class TagsPopover extends Component<any,any>{
     
        constructor(props){
            super(props); 
        }  
    
        render(){ 
            return <Popover 
                className="nocolor"
                style={{
                    backgroundColor:"rgba(0,0,0,0)",
                    background:"rgba(0,0,0,0)",
                    borderRadius:"10px"
                }}   
                open={this.props.open}
                anchorEl={this.props.anchorEl}
                //anchorReference={anchorReference}
                //anchorPosition={{ top: positionTop, left: positionLeft }}
                onRequestClose={() => this.props.close()}
                anchorOrigin={this.props.origin} 
                targetOrigin={this.props.point} 
                //transformOrigin={this.props.point}
            >   
                <div  
                className={"darkscroll"}
                style={{  
                    backgroundColor: "rgb(39, 43, 53)",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    borderRadius: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    maxHeight:"150px",
                    cursor:"pointer" 
                }}>   
                   { 
                    map((tag:string) => 
                        <div  
                            key={tag}
                            onClick={() => this.props.attachTag(tag)} 
                            className={"tagItem"} style={{display:"flex", height:"auto"}}
                        >  
                            <TriangleLabel style={{color:"skyblue"}}/> 
                            <div style={{color:"skyblue", marginLeft:"5px", marginRight:"5px"}}>
                                {tag}   
                            </div>     
                        </div>
                    )(this.props.tags)
                    } 
                </div>  
            </Popover> 
        } 
      
    }
