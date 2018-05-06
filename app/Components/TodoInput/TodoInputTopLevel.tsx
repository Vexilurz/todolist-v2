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
import { DueDate } from './DueDate';
let moment = require("moment"); 



interface TodoInputTopLevelProps{ 
    onWindowEnterPress:Function,
    setInputRef:(e:any) => void  
    groupTodos:boolean,
    onRestoreButtonClick:Function,
    onCheckBoxClick:Function,
    onTitleChange:Function, 
    open:boolean,
    selectedCategory:Category,
    relatedProjectName:string,
    flagColor:string,

    deleted:Date,
    completedSet:Date,
    category:Category,
    attachedDate:Date,
    completedWhen:Date,
    title:string,
    reminder:Date,
    checklist:ChecklistItem[],
    group:Group, 
    attachedTags:string[],
    haveNote:boolean, 
    deadline:Date,
    rootRef:HTMLElement,

    animatingSlideAway?:boolean   
}

interface TodoInputTopLevelState{}


export class TodoInputTopLevel extends Component<TodoInputTopLevelProps,TodoInputTopLevelState>{
    ref:HTMLElement;

    constructor(props){
        super(props);
    } 
 
    render(){
        let {
            onRestoreButtonClick,
            onWindowEnterPress,
            onCheckBoxClick,
            open,
            selectedCategory,
            relatedProjectName,
            flagColor,  
            groupTodos, 
            animatingSlideAway,
            rootRef,
            deleted,
            completedSet,
            category,
            attachedDate,
            completedWhen,
            title,
            reminder,
            checklist,
            group, 
            attachedTags,
            deadline,
            haveNote
        } = this.props;  

        return <div 
            ref={e => {this.ref=e;}} 
            style={{
                display:"flex",
                alignItems:"flex-start",
                width:"100%",
                //overflow:"hidden"
            }}
        >  
                        {  
                            isNil(deleted) ? null :      
                            <div
                                style={{paddingRight:"5px"}}
                                onClick={(e) => {e.stopPropagation();}} 
                                onMouseUp={(e) => {e.stopPropagation();}} 
                                onMouseDown={(e) => {e.stopPropagation();}}  
                            > 
                                <RestoreButton  
                                    deleted={isNotNil(deleted)}
                                    open={open}   
                                    onClick={onRestoreButtonClick}  
                                />    
                            </div>   
                        }    
                        <div 
                            onClick={(e) => {
                                e.stopPropagation(); 
                                e.nativeEvent.stopImmediatePropagation();
                            }} 
                            style={{paddingLeft:"5px",paddingRight:"5px"}}
                        > 
                            <Checkbox 
                                checked={animatingSlideAway ? true : isDate(completedSet)} 
                                onClick={onCheckBoxClick}
                            />
                        </div>   
                        {
                            open ? null :       
                            <DueDate  
                                category={category} 
                                date={attachedDate} 
                                completed={completedWhen} 
                                selectedCategory={selectedCategory}
                            />
                        }
                        <div 
                            style={
                                open ? 
                                {width:"100%", marginTop:"-4px"} : 
                                {minWidth:0, marginTop:"-4px"}
                            } 
                            key="form-field"
                        >  
                            {   
                                open ?      
                                <div> 
                                    <TextareaAutosize 
                                        placeholder="New Task"
                                        innerRef={ref => this.props.setInputRef(ref)}
                                        onChange={this.props.onTitleChange as any} 
                                        style={{
                                            resize:"none",
                                            width:"100%",
                                            fontSize:"inherit",
                                            padding:"0px",
                                            cursor:"default",
                                            position:"relative",
                                            border:"none",  
                                            outline:"none",
                                            backgroundColor:"rgba(0, 0, 0, 0)",
                                            color:"rgba(0, 0, 0, 0.87)" 
                                        }}
                                        onKeyDown={(event) => { 
                                            if( event.which===13 || event.keyCode===13 ){
                                                event.stopPropagation(); 
                                                event.preventDefault();
                                                onWindowEnterPress();
                                            }      
                                        }} 
                                        value={title}
                                    /> 
                                </div>
                                :
                                <div style={{cursor:"default"}}>  
                                    <div style={{display:'flex'}}>  
                                        <div style={{display:'flex',flexWrap:`wrap`}}>
                                        {
                                            isEmpty(title) ? 
                                            <div style={{paddingRight:"4px", color:"rgba(100,100,100,0.4)"}}>New Task</div> 
                                            : 
                                            title
                                            .split(' ')
                                            .map((c:string,index:number) => 
                                                <div style={{paddingRight:"4px"}} key={`letter-${index}`}>{c}</div>
                                            )
                                        }
                                        {    
                                            isNil(group) ? null :
                                            <div style={{display:"flex",alignItems:"center",paddingRight:"4px"}}> 
                                                <Refresh style={{     
                                                    width:16,   
                                                    height:16,   
                                                    color:"rgba(200,200,200,1)", 
                                                    cursor:"default"
                                                }}/>
                                            </div>
                                        }  
                                        { 
                                            isNil(reminder) ? null :
                                            <div style={{
                                                paddingRight:"4px", 
                                                paddingTop:"2px",
                                                height:"18px",
                                                position:"relative"
                                            }}>
                                                <Alert style={{width:15,height:15,color:"rgba(200,200,200,1)"}}/>
                                                <div style={{
                                                    top:"8px",
                                                    left:"5px",
                                                    width:"5px",
                                                    height:"7px",
                                                    position:"absolute",
                                                    backgroundColor:"rgba(200,200,200,1)"
                                                }}>
                                                </div>
                                            </div>
                                        }
                                        {   
                                            isNil(checklist) || isEmpty(checklist) ? null : 
                                            <div style={{
                                                paddingRight:"4px",
                                                paddingTop:"1px",
                                                display:"flex",
                                                alignItems:"center",
                                                height:"20px"
                                            }}>
                                                <ChecklistIcon style={{width:15,height:15,color:"rgba(200,200,200,1)"}}/>
                                            </div>
                                        } 
                                        {
                                            not(haveNote) ? null :
                                            <div style={{paddingRight:"4px",height:"18px"}}>  
                                                <NotesIcon style={{width:18,height:18,paddingTop:"2px",color:"rgba(200,200,200,1)"}}/>  
                                            </div>
                                        }
                                        </div>
                                    </div>  
                                    <div style={{display:"flex"}}>
                                        {
                                            isNil(relatedProjectName) ? null : 
                                            <RelatedProjectLabel 
                                                name={relatedProjectName} 
                                                groupTodos={groupTodos} 
                                                selectedCategory={selectedCategory}
                                            />   
                                        } 
                                        {  
                                            isEmpty(attachedTags) ? null :    
                                            <AdditionalTags 
                                                selectedCategory={this.props.selectedCategory}
                                                open={open} 
                                                rootRef={this.ref} 
                                                attachedTags={attachedTags}
                                            />  
                                        }
                                    </div>
                                </div>
                            }
                        </div>
                        {        
                            isNil(deadline) || open ? null : 
                            <div style={{
                                display:"flex",
                                cursor:"default",
                                pointerEvents:"none",
                                alignItems:"center",
                                height:"20px",
                                flexGrow:1,
                                justifyContent:"flex-end"
                            }}> 
                                <div style={{paddingRight:"5px"}}> 
                                    <Flag style={{color:flagColor,cursor:"default",width:16,height:16}}/>      
                                </div>   
                                    {daysLeftMark(open, deadline)}
                            </div>  
                        } 
                    </div>
    } 
};