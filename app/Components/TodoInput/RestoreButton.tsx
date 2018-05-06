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


interface RestoreButtonProps{
    deleted:boolean,
    open:boolean, 
    onClick:Function 
}
export class RestoreButton extends Component<RestoreButtonProps,{}>{
    constructor(props){
        super(props); 
    } 



    shouldComponentUpdate(nextProps:RestoreButtonProps){
        return nextProps.deleted!==this.props.deleted ||
               nextProps.open!==this.props.open; 
    }


 
    render(){ 
        let {deleted,open,onClick} = this.props;

        if(isNil(deleted)){ return null } 
        if(open){ return null }  

        return <div   
            style={{display:"flex",cursor:"pointer",alignItems:"center",height:"14px"}}           
            onClick={(e) => {
                e.stopPropagation(); 
                onClick(); 
            }}
        > 
            <Restore style={{width:"20px",height:"20px"}}/> 
        </div> 
    }
};
 