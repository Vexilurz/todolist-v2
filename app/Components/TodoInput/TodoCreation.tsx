import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron'; 
import IconButton from 'material-ui/IconButton';   
import { Component } from "react";  
import { Provider, connect } from "react-redux";
import Chip from 'material-ui/Chip';  
import Star from 'material-ui/svg-icons/toggle/star';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import CheckBoxEmpty from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import CheckBox from 'material-ui/svg-icons/toggle/check-box'; 
import BusinessCase from 'material-ui/svg-icons/places/business-center';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import Checked from 'material-ui/svg-icons/navigation/check';
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
import List from 'material-ui/svg-icons/action/list';
import Reorder from 'material-ui/svg-icons/action/reorder';  
let uniqid = require("uniqid");  
import Popover from 'material-ui/Popover';
import { TextField } from 'material-ui';  
import { DateCalendar, DeadlineCalendar } from '.././ThingsCalendar';
import {  
    daysRemaining, todoChanged, daysLeftMark, generateTagElement, uppercase, 
    generateEmptyTodo, isToday, getMonthName, stringToLength, debounce, 
    fiveMinutesLater, onHourLater, oneDayAhead, getCompletedWhen 
} from '../../utils'; 
import { insideTargetArea } from '../../insideTargetArea';
import { Todo, removeTodo, updateTodo, Project, generateId } from '../../database';
import { Checklist, ChecklistItem } from './TodoChecklist';
import { Category } from '../MainContainer'; 
import { TagsPopup, TodoTags } from './TodoTags';
import { TodoInputLabel } from './TodoInputLabel'; 
import { uniq, isEmpty, contains, isNil, not, multiply, remove, cond } from 'ramda';
import Restore from 'material-ui/svg-icons/content/undo';
 import AutosizeInput from 'react-input-autosize'; 
import { isString } from 'util';
import { AutoresizableText } from '../AutoresizableText';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import ResizeObserver from 'resize-observer-polyfill';
import { Observable } from 'rxjs/Rx';
import { googleAnalytics, globalErrorHandler } from '../../app';
import { TodoInput } from './TodoInput';
let moment = require("moment");


interface TodoCreationProps{
    selectedCategory:Category,
    dispatch:Function,
    selectedProjectId:string,
    selectedAreaId:string, 
    todos:Todo[], 
    projects:Project[],
    rootRef:HTMLElement 
}


interface TodoCreationState{
    todo:Todo 
}


export class TodoCreation extends Component<TodoCreationProps,TodoCreationState>{

    constructor(props){
        super(props);
        let {selectedCategory} = this.props;
        this.state = { todo:generateEmptyTodo(generateId(),selectedCategory,0) }
    }

    reset = () => {
        let {selectedCategory} = this.props;
        this.setState({todo:generateEmptyTodo(generateId(),selectedCategory,0)});
    }

    //on open create empty todo
    //

    /*
    addTodo = () => {
            this.submitCreationEvent(Math.round(new Date().getTime() / 1000));
            let {todo,todos,selectedCategory,dispatch} = this.props;
            let props : any = {};
            
            if(not(isEmpty(todos))){ 
            let sortedTodos = [...todos].sort((a:Todo,b:Todo) => a.priority-b.priority);
            props.priority = todos[0].priority - 1;
            }  
            
            if(selectedCategory==="today" || selectedCategory==="evening"){
            props.attachedDate = new Date(); 
            }
                
            dispatch({type:"updateTodo", load:{...props,...todo}}); 

            if(selectedCategory==="project"){ 
                dispatch({
                    type:"attachTodoToProject",
                    load:{ projectId:this.props.selectedProjectId, todoId:todo._id }
                });    
            }else if(selectedCategory==="area"){
                dispatch({
                    type:"attachTodoToArea", 
                    load:{ areaId:this.props.selectedAreaId, todoId:todo._id }
                });  
            }
        };  
    */


    render(){
        let {
            selectedCategory,dispatch,selectedProjectId,selectedAreaId,todos,projects,rootRef
        } = this.props;
        let {todo} = this.state;

        return <div>
            <TodoInput   
                id={todo._id} 
                key={"todo-creation-form"} 
                dispatch={dispatch}  
                selectedCategory={selectedCategory}    
                moveCompletedItemsToLogbook={"immediately"}
                selectedProjectId={selectedProjectId}
                selectedAreaId={selectedAreaId} 
                todos={todos} 
                projects={projects}  
                rootRef={rootRef}  
                todo={todo} 
            />  
        </div>
    }
}