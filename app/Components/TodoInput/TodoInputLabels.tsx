import 'react-tippy/dist/tippy.css'
import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import { debounce } from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import IconButton from 'material-ui/IconButton';   
import { Component } from "react";  
import Star from 'material-ui/svg-icons/toggle/star';
import BusinessCase from 'material-ui/svg-icons/content/archive';
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import Checked from 'material-ui/svg-icons/navigation/check';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Calendar from 'material-ui/svg-icons/action/date-range';
import List from 'material-ui/svg-icons/action/list';
import Popover from 'material-ui/Popover';
import ChecklistIcon from 'material-ui/svg-icons/action/assignment-turned-in'; 
import NotesIcon from 'material-ui/svg-icons/action/subject'; 
import { DateCalendar, DeadlineCalendar } from '.././ThingsCalendar';
import { 
    daysLeftMark, getMonthName, getCompletedWhen, different, 
    isNotEmpty, log, anyTrue, attachDispatchToProps 
} from '../../utils/utils'; 
import { Todo, Project, Group, ChecklistItem, Category, RawDraftContentState } from '../../types';
import { Checklist } from './TodoChecklist';
import { TodoTags } from './TodoTags';
import { TagsPopup } from './TagsPopup';
import { TodoInputLabel } from './TodoInputLabel'; 
import {  
    uniq, isEmpty, contains, isNil, not, multiply, remove, cond, ifElse,
    equals, any, complement, compose, defaultTo, path, prop, always,
    identity, when
} from 'ramda';
import Restore from 'material-ui/svg-icons/content/undo';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { Observable } from 'rxjs/Rx';
import { insideTargetArea } from '../../utils/insideTargetArea';
import { googleAnalytics } from '../../analytics';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { isFunction, isDate, isString, isNotNil, isToday } from '../../utils/isSomething';
import { daysRemaining } from '../../utils/daysRemaining';
import Alert from 'material-ui/svg-icons/alert/add-alert';
import { stringToLength } from '../../utils/stringToLength';
import TextareaAutosize from 'react-autosize-textarea';
import {Tooltip,withTooltip} from 'react-tippy';
import {shell} from 'electron'; 
import Editor from 'draft-js-plugins-editor';
import {
    convertToRaw,
    convertFromRaw,
    CompositeDecorator,
    ContentState,
    EditorState,
    RichUtils
} from 'draft-js';
import createLinkifyPlugin from 'draft-js-linkify-plugin';
import 'draft-js/dist/Draft.css';
import { noteToState, noteFromState, getNotePlainText } from '../../utils/draftUtils';
import { getTime, setTime } from '../../utils/time';
import { RelatedProjectLabel } from './RelatedProjectLabel';
let moment = require("moment"); 



const icon = <div style={{
    zoom:"0.7", 
    position:"relative", 
    height:"28px"
}}>
    <Alert style={{color:"black",WebkitUserSelect:"none"}}/>
    <div style={{
        width: "10px",
        height: "14px",
        top: "8px",
        left: "7px",
        position: "absolute", 
        backgroundColor: "black"
    }}> 
    </div>
</div>



interface TodoInputLabelsProps{
    onRemoveTodayLabel:Function,
    onRemoveSomedayLabel:Function,
    onRemoveUpcomingLabel:Function,
    onRemoveDeadlineLabel:Function,
    reminder:Date,
    todayCategory:boolean,
    open:boolean,
    category:Category,
    attachedDate:Date,
    deadline:Date 
}



interface TodoInputLabelsState{}



export class TodoInputLabels extends Component<TodoInputLabelsProps,TodoInputLabelsState>{

    constructor(props){
        super(props);
    }

    
    
    shouldComponentUpdate(nextProps:TodoInputLabelsProps){
        let { 
            todayCategory,
            open,
            category,
            attachedDate,
            deadline,
            reminder
        } = nextProps; 

        return different(reminder,this.props.reminder) ||
               different(deadline,this.props.deadline) ||
               different(attachedDate,this.props.attachedDate) ||
               category!==this.props.category ||
               open!==this.props.open ||
               todayCategory!==this.props.todayCategory;
    };



    getTodayLabelContent = () => {
        let { reminder } = this.props;
        let title = this.props.category==="evening" ? `This Evening` : `Today`;
        let opt = {hour: '2-digit', minute:'2-digit'};
        

        if(isNil(reminder)){
            return <div>{title}</div>;
        }else{
            return <div style={{
                display:"flex",
                justifyContent:"center",
                alignItems:"center"
            }}>
                <div>{title}</div>
                <div style={{paddingLeft:"5px",paddingRight:"5px"}}>{icon}</div>
                <div>{reminder.toLocaleTimeString([], opt)}</div>
            </div>    
        }
    };



    getWhenLabelContent = () => {
        let { reminder } = this.props;
        let title = <div>When : {moment(this.props.attachedDate).format('MMMM D')}</div>;
        let opt = {hour: '2-digit', minute:'2-digit'};
        

        if(isNil(reminder)){
            return title;
        }else{
            return <div style={{
                display:"flex",
                justifyContent:"center",
                alignItems:"center"
            }}>
                <div>{title}</div>
                <div style={{paddingLeft:"5px",paddingRight:"5px"}}>{icon}</div>
                <div>{reminder.toLocaleTimeString([], opt)}</div>
            </div>    
        }
    };



    render(){ 
        return <div style={{
            display:"flex",
            flexDirection:"column",
            paddingLeft:"10px",
            transform:"scale(0.9,0.9)",
            paddingRight:"10px"
        }}>   
            {    
                !this.props.todayCategory ? null :
                <div style={{
                    transition:"opacity 0.4s ease-in-out",
                    opacity:open ? 1 : 0
                }}>      
                    <TodoInputLabel 
                        onRemove={this.props.onRemoveTodayLabel}
                        category={this.props.category==="evening" ? "evening" : "today"} 
                        content={ 
                            <div style={{marginLeft:"5px"}}>
                                { this.getTodayLabelContent() }   
                            </div>   
                        }  
                    />   
                </div>  
            } 
            {   
                this.props.category!=="someday" ? null :
                <div style={{
                    transition:"opacity 0.4s ease-in-out",
                    opacity:open ? 1 : 0
                }}>      
                    <TodoInputLabel 
                        onRemove={this.props.onRemoveSomedayLabel}
                        category={this.props.category}
                        content={
                            <div style={{marginLeft:"5px"}}>
                                Someday
                            </div>
                        }  
                    />   
                </div>  
            }   
            { 
                isNil(this.props.attachedDate) || this.props.todayCategory ? null :
                <div style={{
                    transition:"opacity 0.4s ease-in-out",
                    opacity:open ? 1 : 0
                }}>    
                    <TodoInputLabel 
                        onRemove={this.props.onRemoveUpcomingLabel}
                        category={"upcoming"}
                        content={
                            <div style={{marginLeft:"5px", color:"black"}}>
                                { this.getWhenLabelContent() }
                            </div>    
                        }  
                    />    
                </div>   
            } 
            { 
                isNil(this.props.deadline) ? null : 
                <div style={{
                    transition:"opacity 0.4s ease-in-out", 
                    opacity:open ? 1 : 0
                }}>
                    <TodoInputLabel  
                        onRemove={this.props.onRemoveDeadlineLabel}
                        category={"deadline"} 
                        content={ 
                            <div style={{marginLeft:"5px", color:"black"}}>
                                Deadline: {moment(this.props.deadline).format('MMMM D')}
                            </div>
                        }
                    />     
                </div>  
            } 
        </div>
    }
};