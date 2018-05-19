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
import { TodoInputLabels } from './TodoInputLabels';
import { AdditionalTags } from './AdditionalTags';
import { RestoreButton } from './RestoreButton';
import { Checkbox } from './Checkbox';
let moment = require("moment"); 



interface DueDateProps{
    date:Date,
    selectedCategory:Category,
    onClick:Function,
    category:Category,
    completed:Date,
    showDueDate?:boolean
}



export class DueDate extends Component<DueDateProps,{}>{
    constructor(props){
        super(props); 
    }



    shouldComponentUpdate(nextProps:DueDateProps){
        return  different(nextProps.date,this.props.date) ||
                different(nextProps.completed,this.props.completed) ||
                nextProps.selectedCategory!==this.props.selectedCategory ||
                nextProps.category!==this.props.category;
    };



    getContent = () : JSX.Element => {
        let containerStyle= {  
            backgroundColor:"rgb(235, 235, 235)",
            cursor:"default", 
            WebkitUserSelect:"none", 
            display:"flex",
            alignItems:"center",  
            justifyContent:"center", 
            paddingLeft:"5px",
            paddingRight:"5px", 
            borderRadius:"15px",
            color:"rgb(100,100,100)",
            fontWeight:"bold",
            height:"15px" 
        } as any;
 
        let style = {    
            width:18,  
            height:18, 
            marginLeft:"3px",
            color:"gold", 
            cursor:"default", 
            marginRight:"5px" 
        };

        let {date,category,selectedCategory,completed,showDueDate} = this.props;

        let showSomeday : boolean = selectedCategory!=="someday" && category==="someday";


        if(isNil(completed) && showSomeday){
            return <div style={{height:"18px",marginTop:"-2px"}}>
                <BusinessCase style={{...style,color:"burlywood"}}/>
            </div>;

        //if has date and not completed    
        }else if(
            showDueDate ||
            (
                isNotNil(date) && isNil(completed) &&
                (
                    selectedCategory==="next" ||
                    selectedCategory==="someday" ||
                    selectedCategory==="trash" ||
                    selectedCategory==="project" ||
                    selectedCategory==="area" ||
                    selectedCategory==="search" 
                ) 
            )
        ){

            let month = getMonthName(date); 
            let day = date.getDate();  

            return isToday(date) ? 
            <div style={{height:"18px",marginTop:"-2px"}}> 
                <Star style={{...style,color:"gold"}}/> 
            </div> 
            :
            <div style={{paddingRight:"5px",minWidth:"70px"}}>
                <div style={containerStyle}>     
                    <div style={{display:"flex",padding:"5px",alignItems:"center",fontSize:"11px"}}>      
                        <div style={{paddingRight:"5px"}}>{month.slice(0,3)+'.'}</div>  
                        <div>{day}</div>
                    </div> 
                </div>
            </div>; 
 
        //if completed    
        }else if(isNotNil(completed) && ( selectedCategory==="logbook" || selectedCategory==="search" )){ 
            let month = getMonthName(completed);
            let day = completed.getDate(); 

            return <div style={{paddingRight:"5px",minWidth:"70px"}}> 
                <div style={{
                    backgroundColor:"rgba(0,0,0,0)",
                    cursor:"default", 
                    WebkitUserSelect:"none", 
                    display:"flex",
                    paddingLeft:"5px", 
                    paddingRight:"5px", 
                    borderRadius:"15px",
                    color:"rgb(0, 60, 250)",
                    fontWeight:"bold",
                    height:"15px" 
                }}>      
                    <div style={{display:"flex",alignItems:"center",fontSize:"12px"}}>      
                        {
                            isToday(completed) ? 
                            <div style={{display:"flex",padding:"5px",alignItems:"center",fontSize:"12px"}}>Today</div> :  
                            <div style={{display:"flex",padding:"5px",alignItems:"center",fontSize:"12px"}}>    
                                <div style={{paddingRight:"5px"}}>{month.slice(0,3)+'.'}</div>  
                                <div>{day}</div>
                            </div>
                        }   
                    </div>  
                </div> 
            </div>;
        }else{
            return null;
        }
    };



    render(){   
        let content = this.getContent();
        
        return isNil(content) ? null :
        <div onClick = {(e) => {
            e.stopPropagation(); 
            e.nativeEvent.stopImmediatePropagation();
            this.props.onClick(e);
        }}>
            {content}
        </div>
    }
};