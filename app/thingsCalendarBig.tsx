import './assets/styles.css';  
import './assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, uniq,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, 
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, 
    groupBy, concat, flatten, toPairs, adjust, prepend 
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
import { wrapMuiThemeLight, wrapMuiThemeDark, attachDispatchToProps, uppercase, insideTargetArea} from "./utils"; 
import { createStore, combineReducers } from "redux"; 
import { Provider, connect } from "react-redux";
//import Chip from 'material-ui-next/Chip';
import Chip from 'material-ui/Chip';
import { reducer } from "./reducer"; 
//icons 
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
import Plus from 'material-ui/svg-icons/content/add';
import Trash from 'material-ui/svg-icons/action/delete';
import Search from 'material-ui/svg-icons/action/search'; 
import List from 'material-ui/svg-icons/action/list'; 
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Moon from 'material-ui/svg-icons/image/brightness-3';
import Logbook from 'material-ui/svg-icons/av/library-books';
import { TodoCreationForm } from './TodoCreationForm'; 
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc'; 
import { queryToTodos, getTodos, updateTodo, Todo } from './databaseCalls';
let uniqid = require("uniqid");
import DayPicker from 'react-day-picker';
//import Popover from 'material-ui-next/Popover';
import Popover from 'material-ui/Popover';
import Button from 'material-ui-next/Button';
import { TodoUpdateForm } from './TodoUpdateForm';
  
interface ThingsCalendarBigProps{ 
  close : Function, 
  open : boolean,
  origin : any, 
  anchorEl : HTMLElement,
  point : any
}  

export class ThingsCalendarBig extends Component<ThingsCalendarBigProps,any>{

    constructor(props){
        super(props);
    }  

    render(){ 
        return <Popover 
            open={this.props.open}
            anchorEl={this.props.anchorEl}
            style={{
                backgroundColor:"rgba(0,0,0,0)",
                background:"rgba(0,0,0,0)",
                borderRadius:"20px"
            }}  
            //anchorReference={anchorReference}
            //anchorPosition={{ top: positionTop, left: positionLeft }}
            onRequestClose={() => this.props.close()}
            anchorOrigin={this.props.origin} 
            //transformOrigin={this.props.point}
            targetOrigin={this.props.point}
        >   
            <div style={{  
                display:"flex",
                flexDirection:"column",
                backgroundColor:"rgb(39,43,53)",
                borderRadius: "20px"
            }}>   
                <div style={{
                    color: "dimgray",
                    textAlign: "center",
                    padding: "5px",
                    cursor: "default"
                }}>When</div>

                <div className="hoverDateType"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        color: "white",
                        marginLeft: "20px",
                        marginRight: "20px",
                        cursor: "default",
                        WebkitUserSelect:"none" 
                    }}  
                >
                    <Star style={{
                        color:"gold", 
                        width:"15px",
                        height:"15px",
                        cursor:"default" 
                    }}/> 
                    <div style={{marginLeft:"15px"}}>Today</div>
                </div>

                <div className="hoverDateType"
                style={{
                    display: "flex",
                    alignItems: "center",
                    color: "white",
                    cursor: "default",
                    marginLeft: "20px",
                    marginRight: "20px",
                    WebkitUserSelect:"none"  
                }}>
                    <Moon style={{ 
                        transform:"rotate(145deg)", 
                        color:"rgb(192,192,192)", 
                        width:"15px",
                        height:"15px",
                        cursor:"default" 
                    }}/>
                    <div style={{marginLeft:"15px"}}>This Evening</div>
                </div>


                <div style={{
                    zoom: "0.8",
                    display: "flex",
                    justifyContent: "center" 
                }}>
                    <DayPicker />
                </div> 
 
                <div style={{display:"flex",alignItems:"center"}}>  
                    <IconButton   
                      onClick = {() => console.log("Add new list")} 
                      iconStyle={{    
                        color:"rgb(79, 79, 79)",
                        width:"25px",
                        height:"25px"    
                      }} 
                    >        
                        <Plus /> 
                    </IconButton>
                    <div style={{
                        fontFamily: "sans-serif",
                        fontWeight: 600, 
                        color: "rgba(100,100,100,0.7)",
                        fontSize:"15px",  
                        cursor: "default",
                        WebkitUserSelect: "none" 
                    }}> 
                        Add reminder 
                    </div>    
                </div> 

                <Button raised dense style={{
                    margin:"15px", 
                    color:"white", 
                    backgroundColor:"rgb(49,53,63)"
                }}>
                    Clear
                </Button>
            </div>  
        </Popover> 
    } 

}
