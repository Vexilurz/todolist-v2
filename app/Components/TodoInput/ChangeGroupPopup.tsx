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
  todoChanged, daysLeftMark, generateTagElement, 
  isToday, getMonthName, attachDispatchToProps, 
  byNotDeleted, byNotCompleted
} from '../../utils/utils'; 
import { Todo, removeTodo, updateTodo, Project } from '../../database';
import { Checklist, ChecklistItem } from './TodoChecklist';
import { Category } from '../MainContainer'; 
import { TagsPopup, TodoTags } from './TodoTags';
import { TodoInputLabel } from './TodoInputLabel';
import { uniq, isEmpty, contains, isNil, remove, allPass } from 'ramda';
import Restore from 'material-ui/svg-icons/content/undo';
let moment = require("moment"); 
import AutosizeInput from 'react-input-autosize'; 
import { isString } from 'util'; 
import { Store } from '../../app';
import { TodoInput, Checkbox } from './TodoInput';
import Inbox from 'material-ui/svg-icons/content/inbox';
import { SimplePopup } from '../SimplePopup';
import PieChart from 'react-minimal-pie-chart';
import { AutoresizableText } from '../AutoresizableText';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import CalendarIco from 'material-ui/svg-icons/action/date-range';


interface ChangeGroupPopupProps extends Store{} 
            
interface ChangeGroupPopupState{}
  
@connect((store,props) => ({...store, ...props}), attachDispatchToProps) 
export class ChangeGroupPopup extends Component<ChangeGroupPopupProps,ChangeGroupPopupState>{

    ref:HTMLElement; 

    constructor(props){
       super(props); 
    }   
 
    onClose = () => {
       let { dispatch } = this.props;     
       dispatch({type:"openChangeGroupPopup", load:false}); 
    }   
      
    onCancel = (e) => {
       this.onClose();  
    }  
 
    onDeleteSingleItem = (e) => {
        let {rightClickedTodoId, dispatch, todos} = this.props; 
        let todo : Todo = todos.find( (todo) => todo._id===rightClickedTodoId );
        dispatch({type:"updateTodo", load:{...todo,deleted:new Date()}});
        this.onClose(); 
    } 

    onDeleteGroup = () => {
        let {rightClickedTodoId, dispatch, todos} = this.props; 
        let todo : Todo = todos.find( (todo) => todo._id===rightClickedTodoId );
        dispatch({type:"removeGroup", load:todo.group._id});
        this.onClose();   
    }
 
    render(){ 
    
        let { openChangeGroupPopup } = this.props; 
       
        return <SimplePopup    
          show={openChangeGroupPopup}
          onOutsideClick={this.onClose} 
        >   
            <div style={{
                backgroundColor:"rgba(0,0,0,0)",  
                zIndex:40000,  
                display:"flex",   
                alignItems:"center",  
                justifyContent:"center", 
                flexDirection:"column"   
            }}>  
                <div style={{   
                    borderRadius:"10px",
                    boxShadow:"0 0 18px rgba(0,0,0,0.5)", 
                    width:`${window.innerWidth/4}px`,   
                    minWidth:"180px",  
                    backgroundColor:"white" 
                }}> 
                    <div style={{display:"flex", alignItems:"center"}}>  
                        <div style={{  
                            display:"flex",
                            flexDirection:"column",
                            justifyContent:"flex-start",
                            padding:"10px",
                            cursor:"default",
                            userSelect:"none" 
                        }}>
                            <div style={{ 
                                paddingBottom:"10px", 
                                fontWeight:"bold", 
                                fontSize:"15px", 
                                color:"rgba(0,0,0,1)",
                                textAlign:"center"
                            }}>    
                                Delete Todo
                            </div>
                            <div style={{
                                fontSize:"14px", 
                                color:"rgba(0,0,0,1)",
                                textAlign:"center" 
                            }}>
                                This todo is part of a group, 
                                do you want to remove only this Todo or a group ? 
                            </div>   
                        </div>
                    </div> 
                    <div style={{  
                        display:"flex",  
                        alignItems:"center", 
                        flexDirection:"column", 
                        justifyContent:"flex-end",
                        padding:"10px"
                    }}>
                        <div style={{padding: "2px"}}>
                            <div     
                                onClick={this.onDeleteSingleItem} 
                                style={{       
                                    width:"150px",
                                    display:"flex",
                                    alignItems:"center",
                                    cursor:"pointer",
                                    justifyContent:"center", 
                                    borderRadius:"5px",
                                    height:"25px",  
                                    border:"1px solid rgba(100,100,100,0.7)",
                                    backgroundColor:"rgb(10, 90, 250)"  
                                }}  
                            > 
                                <div style={{color:"white", fontSize:"16px"}}>      
                                    Delete single item 
                                </div>    
                            </div>
                        </div> 
                        <div style={{padding: "2px"}}>
                            <div    
                                onClick={this.onDeleteGroup} 
                                style={{       
                                    width:"150px",
                                    display:"flex",
                                    alignItems:"center",
                                    cursor:"pointer",
                                    justifyContent:"center",
                                    borderRadius:"5px",
                                    height:"25px",  
                                    border:"1px solid rgba(100,100,100,0.7)",
                                    backgroundColor:"rgb(10, 90, 250)"   
                                }}   
                            > 
                                <div style={{color:"white", fontSize:"16px"}}>      
                                    Delete group
                                </div>  
                            </div>
                        </div> 
                        <div style={{padding:"2px"}}>
                            <div     
                                onClick={this.onCancel} 
                                style={{      
                                    width:"150px", 
                                    display:"flex",
                                    alignItems:"center",
                                    cursor:"pointer",
                                    justifyContent:"center",
                                    borderRadius:"5px",
                                    height:"25px",  
                                    border:"1px solid rgba(100,100,100,0.5)",
                                    backgroundColor:"white" 
                                }}  
                            >   
                                <div style={{color:"rgba(0,0,0,0.9)", fontSize:"16px"}}>  
                                    Cancel
                                </div>    
                            </div>  
                        </div> 
                    </div> 
                </div>   
            </div>  
        </SimplePopup>    
    }
} 
 
   