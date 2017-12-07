import './assets/styles.css';  
import './assets/calendarStyle.css';  
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
import { wrapMuiThemeLight, wrapMuiThemeDark, attachDispatchToProps, uppercase, insideTargetArea, selectCategoryBlock, chooseIcon} from "./utils"; 
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
import Moon from 'material-ui/svg-icons/image/brightness-3';
import Logbook from 'material-ui/svg-icons/av/library-books';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc'; 
import { queryToTodos, getTodos, updateTodo, Todo, removeTodo } from './databaseCalls';
let uniqid = require("uniqid");
import DayPicker from 'react-day-picker';
//import Popover from 'material-ui-next/Popover';
import Popover from 'material-ui/Popover';
import Button from 'material-ui-next/Button';
import { InboxBlock } from './MainBlocks/InboxBlock';
import { UpcomingBlock } from './MainBlocks/UpcomingBlock';
import { TodayBlock } from './MainBlocks/TodayBlock';
import { AnytimeBlock } from './MainBlocks/AnytimeBlock';
import { SomedayBlock } from './MainBlocks/SomedayBlock';
import { LogbookBlock } from './MainBlocks/LogbookBlock';
import { TrashBlock } from './MainBlocks/TrashBlock';
import { ProjectBlock } from './MainBlocks/ProjectBlock';
import { AreaBlock } from './MainBlocks/AreaBlock';
   


export type Category = 
"inbox" | "today" | "upcoming" | "anytime" | "someday" | 
"logbook" | "trash" | "project" | "area";



@connect((store,props) => store, attachDispatchToProps) 
export class MainContainer extends Component<any,any>{
    rootRef:HTMLElement; 
 
    constructor(props){
        super(props); 
    } 

    onError = (e) => console.log(e);
       
    componentDidMount(){
        let onError = (e) => console.log(e);
        let getTodosCatch = getTodos(onError);

        getTodosCatch(true,Infinity)
        .then(queryToTodos) 
        .then( 
            (todos:Todo[]) => 
                this.props.dispatch({type:"todos", load:todos})
        )     
    }    
        
    toggleWindowSize = () => 
        () => this.setState({ fullsize:not(this.state.fullsize) }, 
        () => ipcRenderer.send("size", this.state.fullsize)
    ); 
     
    onBodyClick = (e) => {   
        e.stopPropagation();   
        this.props.dispatch({type:"showRightClickMenu",load:false});   
        if(this.props.selectedTodoId) 
           this.props.dispatch({type:"selectedTodoId",load:null});  
    };
      
    render(){ 

        return <div ref={(e) => { this.rootRef=e }}
            className="scroll"  
            style={{    
                width: "74%",
                position:"relative", 
                display: "flex",
                borderRadius:"1%", 
                backgroundColor: "rgba(209, 209, 209, 0.1)", 
                overflow: "scroll",  
                flexDirection: "column" 
            }}
        >      
            <div onClick={this.onBodyClick}  style={{padding:"60px"}}>
                    <div className="no-drag" style={{position: "fixed", top: 0, right: 0}}>  
                        <IconButton   
                            onClick = {this.toggleWindowSize}     
                            iconStyle={{color:"cadetblue",width:"20px",height:"20px"}}
                        >     
                            <OverlappingWindows />
                        </IconButton> 
                    </div>  

                    <div style={{ width: "100%"}}> 

                        <div style={{display:"flex",alignItems:"center",marginBottom:"20px"}}>  

                            {chooseIcon(this.props.selectedCategory)}

                            <div style={{ 
                                    fontFamily: "sans-serif",
                                    fontSize: "xx-large",
                                    fontWeight: 600,
                                    paddingLeft: "10px",
                                    WebkitUserSelect: "none",
                                    cursor:"default" 
                            }}>   
                                {uppercase(this.props.selectedCategory)}
                            </div> 

                        </div>

                    </div>  
  
                    <div>  
                        {  
                            selectCategoryBlock(
                                this.props.selectedCategory,
                                this.rootRef
                            ) 
                        }
                    </div>
                  
            </div> 
        </div> 
 
  }
}

