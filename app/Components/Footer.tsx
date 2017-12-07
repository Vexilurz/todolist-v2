import '../assets/styles.css';  
import '../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, uniq,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, any,
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, 
    groupBy, concat, flatten, toPairs, adjust, prepend, fromPairs 
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
import { Component, SyntheticEvent } from "react"; 
import Paper from 'material-ui/Paper';
import { DraggableCore, DraggableEventHandler, DraggableData } from 'react-draggable';
import * as Draggable from 'react-draggable'; 
import { 
    wrapMuiThemeLight, 
    wrapMuiThemeDark, 
    attachDispatchToProps, 
    uppercase, 
    insideTargetArea 
} from "../utils"; 
import { createStore, combineReducers } from "redux"; 
import { Provider, connect } from "react-redux";
//import Chip from 'material-ui-next/Chip';
import Chip from 'material-ui/Chip'; 
//icons 
import ClearArrow from 'material-ui/svg-icons/content/backspace';   
import Menu from 'material-ui/Menu';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import Inbox from 'material-ui/svg-icons/content/inbox';
import Star from 'material-ui/svg-icons/toggle/star';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import CheckBoxEmpty from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import CheckBox from 'material-ui/svg-icons/toggle/check-box'; 
import BusinessCase from 'material-ui/svg-icons/places/business-center';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import Layers from 'material-ui/svg-icons/maps/layers';
import Adjustments from 'material-ui/svg-icons/image/tune';
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Flag from 'material-ui/svg-icons/image/assistant-photo'; 
 
import NewProjectIcon from 'material-ui/svg-icons/image/timelapse';
import NewAreaIcon from 'material-ui/svg-icons/action/tab';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz'; 
import Plus from 'material-ui/svg-icons/content/add';
import Trash from 'material-ui/svg-icons/action/delete';
import Search from 'material-ui/svg-icons/action/search'; 
import List from 'material-ui/svg-icons/action/list'; 
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Moon from 'material-ui/svg-icons/image/brightness-3';
import Logbook from 'material-ui/svg-icons/av/library-books';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc'; 
import { queryToTodos, getTodos, updateTodo, Todo, removeTodo } from '../databaseCalls';
let uniqid = require("uniqid");
import DayPicker from 'react-day-picker';
//import Popover from 'material-ui-next/Popover';
import Popover from 'material-ui/Popover';
import Button from 'material-ui-next/Button';
import { TodoCreationForm } from '../Components/TodoCreationForm';
import { SortableTodosUpdateList } from '../Components/SortableTodosUpdateList';
import { ThingsCalendarSmall } from '../Components/thingsCalendarSmall';



export type ButtonName = "NewTodo" | "Calendar" | "Arrow" | "Search" | "More" | "Trash";  


 
interface FooterProps{
    buttonsNamesToDispaly:ButtonName[],
    onNewTodoClick:Function, 
    onCalendarClick:Function, 
    onArrowClick:Function, 
    onSearchClick:Function, 
    onMoreClick:Function, 
    onTrashClick:Function  
}



export class Footer extends Component<FooterProps,{}>{

    constructor(props){
      super(props);
    }    
 
    shouldComponentUpdate(nextProps){
      //may fail 
      return this.props.buttonsNamesToDispaly.length!==nextProps.buttonsNamesToDispaly.length; 
    } 
    
    render(){
        return <div style={{    
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            position: "absolute",
            bottom: 0,
            backgroundColor: "white", 
            width: "70%",
            height: "60px"      
        }}>

            {  
                !contains("NewTodo")(this.props.buttonsNamesToDispaly as any) ? null :
                <IconButton  
                    onClick = {this.props.onNewTodoClick}
                    tooltip="New To-Do"
                    tooltipPosition="top-center"
                    iconStyle={{ 
                        color:"rgb(79, 79, 79)", 
                        width:"25px", 
                        height:"25px"  
                    }}
                >      
                    <Plus />
                </IconButton> 

            }


            {  
                !contains("Calendar")(this.props.buttonsNamesToDispaly as any) ? null :
                <div>
                    <IconButton 
                        onClick = {this.props.onCalendarClick}
                        iconStyle={{ 
                            color:"rgb(79, 79, 79)",
                            width:"25px",  
                            height:"25px" 
                        }} 
                    >     
                        <CalendarIco />
                    </IconButton> 
                </div>
            }


            {
                !contains("Arrow")(this.props.buttonsNamesToDispaly as any) ? null :
                <IconButton 
                    onClick = {this.props.onArrowClick}
                    iconStyle={{ 
                        color:"rgb(79, 79, 79)",
                        width:"25px", 
                        height:"25px" 
                    }} 
                >     
                    <Arrow />
                </IconButton>  
            }
            

            {
                !contains("Search")(this.props.buttonsNamesToDispaly as any) ? null :
                        <IconButton 
                            onClick = {this.props.onTrashClick}
                            iconStyle={{ 
                                color:"rgb(79, 79, 79)",
                                width:"25px", 
                                height:"25px" 
                            }}
                        >      
                            <Arrow />
                        </IconButton> 
            }


            {
                !contains("More")(this.props.buttonsNamesToDispaly as any) ? null :
                        <IconButton 
                            onClick = {this.props.onSearchClick}
                            iconStyle={{  
                                color:"rgb(79, 79, 79)",
                                width:"25px", 
                                height:"25px" 
                            }}
                        >     
                            <Search />
                        </IconButton> 
            }

  
            {
                !contains("Trash")(this.props.buttonsNamesToDispaly as any) ? null :
                        <IconButton 
                            onClick = {this.props.onMoreClick}
                            iconStyle={{  
                                color:"rgb(79, 79, 79)",
                                width:"25px", 
                                height:"25px" 
                            }}
                        >     
                            <ThreeDots />
                        </IconButton> 
            }
            
        </div>
    }

} 