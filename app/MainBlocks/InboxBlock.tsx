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
import { Footer } from '../Components/Footer';
import { Tags } from '../Components/Tags';

  


@connect((store,props) => merge(store,props), attachDispatchToProps) 
export class InboxBlock extends Component<any,{}>{

    constructor(props){ 
        super(props); 
    }
 

    openTodoInput = (e) => { 
        e.stopPropagation();
        if(this.props.selectedTodoId) 
            this.props.dispatch({type:"openTodoInput",load:true}); 
        if(this.props.rootRef) 
            this.props.rootRef.scrollTop = 0; 
 
    };    

     
    closeTodoInput = () => {

        if(this.props.selectedTodoId) 
            this.props.dispatch({type:"openTodoInput",load:false}); 
        if(this.props.rootRef) 
            this.props.rootRef.scrollTop = 0; 
    
    };    
     

    render(){
        return <div>
            
            <Tags 
                selectTag={(tag) => this.props.dispatch({type:"selectedTag",load:tag})}
                tags={this.props.tags}
                selectedTag={this.props.selectedTag}
            /> 

            {     
                !this.props.openTodoInput ? 

                <div onClick={this.openTodoInput} style={{width:"100%",height:"50px"}}></div> 

                :  

                <div style={{paddingTop:"20px", paddingBottom:"10px"}}>     
                    <TodoCreationForm  
                        dispatch={this.props.dispatch}  
                        tags={this.props.tags}  
                        todos={this.props.todos}
                        open={this.props.openTodoInput}
                        showTags={true}
                    />     
                </div>    
            }     
    

            <div className="unselectable" id="todos" style={{marginBottom: "100px"}}>
                <SortableTodosUpdateList
                    dispatch={this.props.dispatch}  
                    showRightClickMenu={this.props.showRightClickMenu}
                    selectedTodoId={this.props.selectedTodoId}
                    selectedTag={this.props.selectedTag} 
                    onSortEnd={({oldIndex, newIndex}) => {
                        this.props.dispatch({
                            type:"todos",
                            load:arrayMove(this.props.todos, oldIndex, newIndex)
                        })   
                    }}
                    rootRef={this.props.rootRef}
                    todos={this.props.todos} 
                /> 
            </div> 




        <div style={{ 
              height: "60px",
              width: "74%", 
              position: "fixed", 
              zIndex:1500,
              display: "flex",
              justifyContent: "center",
              backgroundColor: "white",
              bottom: "0px",
              borderTop: "1px solid rgba(100, 100, 100, 0.2)" 
        }}>   
             
            <Footer  
                buttonsNamesToDispaly={["NewTodo" , "Calendar" , "Arrow" , "Search"]}
 
                onNewTodoClick={ this.openTodoInput}

                onCalendarClick={(e) => {

                }} 
                onArrowClick={(e) => {

                }}  
                onSearchClick={(e) => {

                }} 
                onMoreClick={(e) => {

                }} 
                onTrashClick={(e) => {

                }}  
            />  

        </div> 


        </div>
    }


}



