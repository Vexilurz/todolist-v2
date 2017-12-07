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
import { wrapMuiThemeLight, wrapMuiThemeDark, attachDispatchToProps, uppercase, insideTargetArea, applyDropStyle} from "../utils"; 
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
import { queryToTodos, getTodos, updateTodo, Todo, removeTodo } from '../databaseCalls';
let uniqid = require("uniqid");
import DayPicker from 'react-day-picker';
//import Popover from 'material-ui-next/Popover';
import Popover from 'material-ui/Popover';
import Button from 'material-ui-next/Button';
import { InboxBlock } from '../MainBlocks/InboxBlock';
import { UpcomingBlock } from '../MainBlocks/UpcomingBlock';
import { TodayBlock } from '../MainBlocks/TodayBlock';
import { AnytimeBlock } from '../MainBlocks/AnytimeBlock';
import { SomedayBlock } from '../MainBlocks/SomedayBlock';
import { LogbookBlock } from '../MainBlocks/LogbookBlock';
import { TrashBlock } from '../MainBlocks/TrashBlock';
import { ProjectBlock } from '../MainBlocks/ProjectBlock';
import { AreaBlock } from '../MainBlocks/AreaBlock';
import { RightClickMenu } from './RightClickMenu';
import { TodoUpdateForm } from './TodoUpdateForm';

 


 

interface SortableTodosUpdateListProps{
    dispatch:Function,
    selectedTodoId:string,
    selectedTag:string,
    showRightClickMenu:boolean,  
    onSortEnd:Function,
    rootRef:HTMLElement, 
    todos:Todo[]    
 }    
 
 interface SortableTodosUpdateListState{}
    
 
export class SortableTodosUpdateList extends Component<SortableTodosUpdateListProps, SortableTodosUpdateListState>{
     
     constructor(props){ 
         super(props);
     }
       
     createSortableTodoItem = () => SortableElement(({value}) => this.getTodoElem(value)); 
       
     getTodoElem = (value:Todo) => 
         <div  
             style={{
                 width: "100%",  
                 display: "flex", 
                 alignItems: "center", 
                 justifyContent: "center"
             }}>        
             <TodoUpdateForm    
                 rootRef={this.props.rootRef}
                 dispatch={this.props.dispatch} 
                 todo={value}
                 todos={this.props.todos}
                 selectedTodoId={this.props.selectedTodoId} 
             />     
         </div>    
      
 
     getTodosList = (items:Todo[]) => !items ? null :
         <ul    
             className="unselectable" 
             onClick={(e) => { e.stopPropagation(); }}
             style={{padding:0,margin:0}}
         > 
             {      
                 items  
                 .map(   
                     (todo:Todo, index) => {
                         let SortableItem = this.createSortableTodoItem(); 
                         return <SortableItem  key={`item-${index}`} index={index} value={todo} />
                     }
                 )  
             } 
         </ul>;    
         
     
     byTags = (todo:Todo) : boolean => { 
         if(isNil(todo))
             return false;
         if(this.props.selectedTag==="All") 
             return true;    
 
         return contains(this.props.selectedTag,todo.attachedTags);
     } 
 
 
     onItemDrag = (e) => { 
         let target = document.getElementById("projects"); 
         let ref = document.body.children[document.body.children.length-1];
         let x = e.clientX;
         let y = e.clientY;   
 
         if(insideTargetArea(target)(x,y))
            applyDropStyle(ref,{x,y});  
     } 
           
     
     createSortableTodosList = (elem:HTMLElement) => (list : Todo[]) => { 
         let SortableList = SortableContainer(({items}) => this.getTodosList(items),{withRef:true}); 
 
         return <SortableList    
             getContainer={(e) => elem ? elem : document.body} 
             shouldCancelStart={(e) => { 
                 let disableDrag = compose(any(equals(true)),map(prop("disableDrag")))(e.path); 
                 return disableDrag || this.props.showRightClickMenu; 
             }}     
             distance={5}         
             //pressDelay={100}   
             items={list}       
             axis='xy'       
             onSortEnd={this.props.onSortEnd}    
             onSortMove={this.onItemDrag}    
         />   
     }  
  
    
     render(){ 
         return <div style={{overflowX:"hidden", WebkitUserSelect: "none"}}>
             {       
             compose( 
                 this.createSortableTodosList(this.props.rootRef),
                 filter(this.byTags)
             )(this.props.todos)  
             }   
             <RightClickMenu /> 
         </div> 
     } 
 } 
 