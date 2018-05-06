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
import { TodoInputTopLevel } from './TodoInputTopLevel';
let moment = require("moment"); 

const linkifyPlugin = createLinkifyPlugin({
    component:(props) => {
      const {contentState, ...rest} = props;
      return <a {...rest} style={{cursor:"pointer"}} onClick={() => shell.openExternal(rest.href)}/>
    }
});  



interface TodoInputMiddleLevelProps{
    onNoteChange:Function, 
    updateChecklist:Function, 
    closeChecklist:() => void,
    closeTags:() => void,
    open:boolean,
    editorState:any,
    onAttachTag:(tag:string) => void,
    onRemoveTag:(tag:string) => void,
    showChecklist:boolean,
    showTags:boolean,
    _id:string,
    checklist:ChecklistItem[],
    attachedTags:string[]
} 

interface TodoInputMiddleLevelState{}
 
export class TodoInputMiddleLevel extends Component<TodoInputMiddleLevelProps,TodoInputMiddleLevelState>{
    
    constructor(props){ super(props) }

    render(){
        let {
            open,
            closeTags,
            closeChecklist,
            updateChecklist,
            showChecklist,
            onAttachTag,
            onRemoveTag,
            _id,
            checklist,
            attachedTags,
            showTags
        } = this.props;

        return <div style={{
            transition:"opacity 0.2s ease-in-out", 
            opacity:open ? 1 : 0, 
            paddingLeft:"25px", 
            paddingRight:"25px"
        }}>    
            <div style={{
                display:"flex",
                paddingTop:"10px", 
                fontSize:'14px',
                color:'rgba(10,10,10,0.9)',
                paddingBottom:"10px"
            }}>
                <Editor
                    editorState={this.props.editorState}
                    onChange={this.props.onNoteChange as any} 
                    plugins={[linkifyPlugin]} 
                    keyBindingFn={(e) => { if(e.keyCode===13){ e.stopPropagation(); } }}
                    placeholder="Notes"
                />
            </div> 
            {    
                not(showChecklist) ? null : 
                <Checklist 
                    checklist={checklist} 
                    closeChecklist={closeChecklist}
                    updateChecklist={updateChecklist as any}
                /> 
            }    
            {  
                not(showTags) ? null :
                <div style={{display:"flex",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <TriangleLabel />
                    </div>
                    <TodoTags 
                        attachTag={onAttachTag} 
                        removeTag={onRemoveTag} 
                        tags={attachedTags}
                        closeTags={closeTags}
                    /> 
                </div>
            } 
        </div>   
    } 
};  










