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
import { TodoInputMiddleLevel } from './TodoInputMiddleLevel';

let moment = require("moment"); 

const linkifyPlugin = createLinkifyPlugin({
    component:(props) => {
      const {contentState, ...rest} = props;
      return <a {...rest} style={{cursor:"pointer"}} onClick={() => shell.openExternal(rest.href)}/>
    }
});  




export interface TodoInputProps{ 
    dispatch : Function,  
    groupTodos : boolean,  
    scrolledTodo : Todo,
    moveCompletedItemsToLogbook : string, 
    selectedCategory : Category,
    selectedProjectId : string,
    selectedAreaId : string,
    projects : Project[], 
    todo : Todo,  
    rootRef : HTMLElement,  
    id : string,  
    onOpen? : Function,
    onClose? : Function,
    showCompleted? : boolean
}    



export interface TodoInputState{  
    open : boolean,
    tag : string, 
    translateX : number,
    display : string,
    editorState : any,
    animatingSlideAway : boolean,
    showAdditionalTags : boolean, 
    showDateCalendar : boolean,  
    showTagsSelection : boolean,
    showTags : boolean,
    showChecklist : boolean,   
    showDeadlineCalendar : boolean,
    attachedDate : Date,
    deadline : Date,
    category : Category,
    checklist : ChecklistItem[],
    title : string
}   
 


export class TodoInput extends Component<TodoInputProps,TodoInputState>{
    calendar:HTMLElement; 
    deadline:HTMLElement;
    tags:HTMLElement;
    ref:HTMLElement; 
    inputRef:HTMLElement; 
    subscriptions:Subscription[]; 


    shouldComponentUpdate(nextProps:TodoInputProps,nextState:TodoInputState){
        let {
            groupTodos, 
            scrolledTodo,
            moveCompletedItemsToLogbook, 
            selectedCategory, 
            selectedProjectId, 
            selectedAreaId, 
            projects,
            todo,
            rootRef, 
            id, 
            showCompleted
        } = nextProps;


        if(different(this.state,nextState)){ 
           return true; 
        }

        let should = 
            groupTodos!==this.props.groupTodos ||
            scrolledTodo!==this.props.scrolledTodo ||
            moveCompletedItemsToLogbook!==this.props.moveCompletedItemsToLogbook ||
            showCompleted!==this.props.showCompleted || 
            different(todo,this.props.todo) ||
            projects!==this.props.projects; 
            
        return should;
    }


    constructor(props){
        super(props);  

        this.subscriptions = [];
         
        let {
            checklist,
            attachedDate,
            deadline,
            category,
            reminder,
            title,
            note,
            attachedTags
        } = this.props.todo;

        this.state={   
            open:false,
            tag:'', 
            translateX:0,
            editorState:noteToState(note),
            animatingSlideAway:false,
            display:"flex",
            showAdditionalTags:false, 
            showDateCalendar:false,  
            showTags:attachedTags.length>0, 
            showTagsSelection:false, 
            showChecklist:checklist.length>0,  
            checklist,
            showDeadlineCalendar:false,
            attachedDate,
            deadline,
            category,
            title
        };        
    };
 


    componentWillReceiveProps(nextProps:TodoInputProps){
        let notEquals = complement(equals);
        let { open } = this.state;
        let closed = not(open);

        if(notEquals(nextProps.todo, this.props.todo) && closed){
            let {attachedDate,deadline,category,checklist,title, note} = nextProps.todo;
            this.setState({
                attachedDate, 
                deadline, 
                category, 
                checklist, 
                title, 
                editorState:noteToState(note)
            });
        }
    };



    onClose = () => {
        let {dispatch,onClose,todo} = this.props;
        let {attachedDate,deadline,category,title,editorState,checklist} = this.state;

        this.update({
            attachedDate,
            deadline,
            category,
            title,
            note:noteFromState(editorState),
            checklist
        });

        if(isFunction(onClose)){ onClose() } 
    };

     

    update = (props) : void => {
        this.props.dispatch({
            type:"multiple",
            load:[
                {
                    type:"updateTodo",
                    load:{...this.props.todo,...props}
                },
                {
                    type: "openRightClickMenu",
                    load: {
                        showRightClickMenu:false,
                        rightClickedTodoId:null,
                        rightClickMenuX:0,
                        rightClickMenuY:0
                    }
                }
            ]
        }); 
    };



    onCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        e.stopPropagation(); 
        let {todo,dispatch} = this.props;
        let {category} = this.state;

        let attachedDate = new Date(day.getTime());
        let reminder = todo.reminder;

        if(isDate(reminder)){
           let time = getTime(reminder);
           attachedDate = setTime(attachedDate,time); 
           reminder = new Date(attachedDate.getTime());
        }

        this.updateState({
            attachedDate,
            category:isToday(attachedDate) ? "today" : category,
            showDateCalendar:false
        })
        .then( 
            () => this.update({reminder}) 
        )
    };



    onCalendarTodayClick = (e) => {
        e.stopPropagation();
        let {todo,dispatch} = this.props;

        let attachedDate = new Date();
        let reminder = todo.reminder;

        if(isDate(reminder)){
           let time = getTime(reminder);
           attachedDate = setTime(attachedDate,time); 
           reminder = new Date(attachedDate.getTime());
        }

        this
        .updateState({category:"today",attachedDate,showDateCalendar:false})
        .then(() => this.update({reminder})); 
    }; 


    
    onCalendarThisEveningClick = (e) => {
        e.stopPropagation();
        let {todo,dispatch} = this.props;

        let attachedDate = new Date();
        let reminder = todo.reminder;

        if(isDate(reminder)){
           let time = getTime(reminder);
           attachedDate = setTime(attachedDate,time); 
           reminder = new Date(attachedDate.getTime());
        }
        
        this
        .updateState({category:"evening",attachedDate,showDateCalendar:false})
        .then(() => this.update({reminder}));
    }; 



    onCalendarAddReminderClick = (reminder:Date) : void => {
        let {dispatch} = this.props;

        this
        .updateState({attachedDate:reminder, showDateCalendar:false}) 
        .then(() => this.update({reminder})); 
    };



    onCalendarClear = (e) => {
        e.stopPropagation();
        let {todo,dispatch} = this.props;
        let {deadline,category} = this.state;

        let nextState = {
            category:isDate(deadline) ? category : "next", 
            showDateCalendar:false, 
            attachedDate:null
        };

        this
        .updateState(nextState)
        .then(() => this.onRemoveReminderClick()); 
    };



    onRemoveReminderClick = () : void => {
        let {dispatch, todo} = this.props;
        if(isNil(todo.reminder)){ return }
        this.update({reminder:null}); 
    };

    

    onWindowEnterPress = (e) => {  
        if(e){ if(e.keyCode!==13){ return } }

        let {open} = this.state;
        let {onClose} = this.props;

        if(open){ 
           this.setState({open:false},() => this.onClose()); 
        } 
    };      



    onOutsideClick = (e) => {
        let { rootRef, dispatch, onClose } = this.props;
        let { open } = this.state;

        if(isNil(this.ref) || not(open)){ return }

        let x = e.pageX;
        let y = e.pageY; 

        let inside = insideTargetArea(rootRef,this.ref,x,y);
     
        if(not(inside)){ 
           this.setState({open:false},() => this.onClose()); 
        }   
    };



    onDeadlineCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        e.stopPropagation();
        this.updateState({deadline:day,showDeadlineCalendar:false});
    };



    onDeadlineCalendarClear = (e:any) : void => {
        e.stopPropagation();
        let {attachedDate,category} = this.state;
        this.updateState({
            deadline:null,
            showDeadlineCalendar:false,
            category:isDate(attachedDate) ? "next" : category
        });
    };



    updateState = (props) => new Promise(resolve => this.setState(props, () => resolve()));



    timeout = (ms:number) => new Promise(resolve => setTimeout(() => resolve(),ms));



    submitCompletedEvent = (timeSeconds:number) => {
        googleAnalytics.send(    
            'event',  
            {   
                ec:'TodoCompleted', 
                ea:`Todo Completed ${new Date().toString()}`, 
                el:`Todo Completed`, 
                ev:timeSeconds 
            }
        )  
        .catch(err => this.onError(err));
    };

      

    onError = (error) => globalErrorHandler(error);



    componentDidMount(){   
        let idEquals = (id:string) => compose(equals(id), prop('_id'));
        let { todo, scrolledTodo, dispatch } = this.props;

        ifElse(
            isNil,
            identity,
            when(
                idEquals(todo._id), 
                () => this.setState(
                    {open:true}, 
                    () => {
                        if(isNotNil(this.ref)){ this.ref.scrollIntoView(); }
                        dispatch({type:"scrolledTodo",load:null});
                    }
                )
            ) 
        )(scrolledTodo)

        this.subscriptions.push( 
            
            Observable.fromEvent(window,"click").subscribe(this.onOutsideClick),

            Observable.fromEvent(window,'beforeunload').subscribe(this.saveOnUnmount) 
        
        ); 
    };        
 


    componentWillUnmount(){
        this.saveOnUnmount();
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = []; 
    }; 



    saveOnUnmount = () => {
        let {dispatch,todo} = this.props;
        let {attachedDate,deadline,category,title,editorState,checklist} = this.state;
        let note = noteFromState(editorState);
        let shouldSave = false;

        if(
            any(
                identity,
                [
                    different(todo.attachedDate,attachedDate),
                    different(todo.deadline,deadline),
                    different(todo.category,category),
                    different(todo.title,title),
                    different(todo.note,note),
                    different(todo.checklist,checklist)
                ]
            )
        ){
            dispatch({
                type:"updateTodoById",  
                load:{
                    id:todo._id,
                    props:{ 
                        attachedDate,
                        deadline,
                        category,
                        title,
                        note,
                        checklist
                    }
                }
            })
        }
    };



    componentDidUpdate(prevProps:TodoInputProps,prevState:TodoInputState){
        let { open, title } = this.state; 
        let { todo } = this.props;

        if(this.inputRef && isEmpty(title) && open){ 
           this.inputRef.focus(); 
        }; 

        if(isEmpty(title) || open){ 
           this.preventDragOfThisItem(); 
        }else{ 
           this.enableDragOfThisItem(); 
        }   
    };   
  


    onFieldsContainerClick = (e) => {    
        e.stopPropagation();     
        this.preventDragOfThisItem();
        let {open} = this.state;
        let {dispatch, onOpen, todo} = this.props;

        if(not(open)){    
            this.setState({open:true, showAdditionalTags:false}, () => isFunction(onOpen) ? onOpen() : null);  
            dispatch({
                type:"multiple",
                load:[
                    {type:"showRepeatPopup", load:false},
                    {type:"showWhenCalendar", load:false},
                    {type:"showRightClickMenu", load:false},
                    {type:"selectedTodo", load:todo}
                ]
            });  
        };   
    };     



    onTitleChange = (event) => this.updateState({title:event.target.value});
    


    onNoteChange = (editorState) => this.updateState({editorState}); 
      
    

    updateChecklist = (checklist:ChecklistItem[]) => this.updateState({checklist}).then(() => this.update({checklist}));



    onAttachTag = (tag:string) : void => {
        if(isEmpty(tag)){ return };
        let {todo} = this.props;
        this.setState({tag:''},() => this.update({attachedTags:uniq([...todo.attachedTags, tag])}));
    }; 



    onCheckBoxClick = () => {  
        let {todo, selectedCategory, showCompleted, moveCompletedItemsToLogbook} = this.props;
        let { open } = this.state; 

        if(isNil(todo.completedSet)){
           this.submitCompletedEvent(Math.round((new Date().getTime())/1000));
        }
        
        let preventSlideAway = selectedCategory==="project" && showCompleted;

        let shouldAnimateSlideAway = isNil(todo.completedSet) && 
                                     selectedCategory!=="logbook" &&  
                                     selectedCategory!=="trash" &&
                                     selectedCategory!=="search" &&
                                     moveCompletedItemsToLogbook==="immediately" &&
                                     not(preventSlideAway);  
            
        let completedWhen = getCompletedWhen(moveCompletedItemsToLogbook,new Date());

        if(shouldAnimateSlideAway){
            this.updateState({animatingSlideAway:true})
            .then(() => this.timeout(100)) 
            .then(() => this.animateSlideAway())
            .then(() => this.updateState({animatingSlideAway:false}))
            .then(() => this.update({ 
                completedSet:isNil(todo.completedSet) ? new Date() : null, 
                completedWhen:isNil(todo.completedSet) ? completedWhen : null,
            }))
        }else{
            this.update({ 
              completedSet:isNil(todo.completedSet) ? new Date() : null, 
              completedWhen:isNil(todo.completedSet) ? completedWhen : null,
            });
        }
    };



    enableDragOfThisItem = () => {
        if(this.ref){
           this.ref["preventDrag"] = false;  
        }
    };



    preventDragOfThisItem = () => {
        if(this.ref){
           this.ref["preventDrag"] = true; 
        }
    }; 



    onRemoveTag = (tag:string) => {
        if(isEmpty(tag)){ return } 
        let {todo} = this.props;
        
        let idx = todo.attachedTags.findIndex(v => v===tag);

        if(idx!==-1){ 
           this.update({attachedTags:remove(idx,1,todo.attachedTags)});
        }
    }; 



    animateSlideAway = () : Promise<void> => {
        return new Promise(
            resolve => {
                let {rootRef} = this.props;
                let width = window.innerWidth; 

                if(rootRef){
                    width = rootRef.getBoundingClientRect().width;
                }  

                let step = () => {    
                    let translateX = this.state.translateX-25;
                    if(translateX<=-width){
                        this.setState({translateX:-width, display:"none"}, () => resolve());
                    }else{
                        this.setState({translateX}, () => requestAnimationFrame(step)); 
                    }    
                };    
                    
                step();  
            }
        ); 
    };
        
    

    onRightClickMenu = (e) => {  
        let {open} = this.state;
        let {dispatch,todo,rootRef} = this.props;

        if(not(open)){
            dispatch({
                type:"multiple",
                load:[
                    {
                        type:"showRepeatPopup", 
                        load:false
                    },
                    {
                        type:"openWhenCalendar",
                        load:{
                            showWhenCalendar : false, 
                            whenTodo : null,
                            whenCalendarPopupX : 0, 
                            whenCalendarPopupY : 0
                        }
                    },
                    { 
                        type:"openRightClickMenu",  
                        load:{   
                           showRightClickMenu:true, 
                           rightClickedTodoId:todo._id, 
                           rightClickMenuX:e.clientX-rootRef.offsetLeft,
                           rightClickMenuY:e.clientY+rootRef.scrollTop 
                        } 
                    }
                ] 
            }); 
        }     
    };  


    
    onRestoreButtonClick = debounce(() => this.update({deleted:undefined}), 50);



    onRepeatTodo = (top:number, left:number) => {   
        let {rootRef,todo,dispatch} = this.props;
        let containerClientRect = rootRef.getBoundingClientRect();

        dispatch({
            type : "openRepeatPopup",
            load : {  
              showRepeatPopup : true, 
              repeatTodo : todo, 
              repeatPopupX : left - containerClientRect.left,    
              repeatPopupY : top + rootRef.scrollTop 
            }    
        });  
    };



    getRelatedProjectName = () : string => { 
        let {todo, projects} = this.props;

        let related : Project = projects.find(
            (project:Project) : boolean => contains(todo._id, project.layout.filter(isString))
        );

        if(related){
           return related.name; 
        }else{  
           return undefined;  
        }; 
    }; 



    onRemoveTodayLabel = () => {
        let {selectedCategory, todo, dispatch} = this.props;
        let {attachedDate} = this.state; 

        if(isToday(this.state.deadline) && isToday(attachedDate)){
            this
            .updateState({category:"next", attachedDate:null, deadline:null})
            .then(() => this.onRemoveReminderClick()); 
        }else if(isToday(this.state.deadline)){
            this
            .updateState({category:"next", deadline:null})
            .then(() => this.onRemoveReminderClick()); 
        }else if(isToday(attachedDate)){
            this
            .updateState({category:"next", attachedDate:null})
            .then(() => this.onRemoveReminderClick()); 
        }
    };



    onRemoveUpcomingLabel = () => {
        let {selectedCategory, todo, dispatch} = this.props;
        let {attachedDate} = this.state; 

        if(isDate(this.state.deadline)){
            this.updateState({attachedDate:null})
            .then(() => this.onRemoveReminderClick());
         }else{
            this.updateState({category:"next", attachedDate:null})
            .then(() => this.onRemoveReminderClick());
         }
    };



    onRemoveSomedayLabel = () => {
        let {selectedCategory, todo, dispatch} = this.props;

        this
        .updateState({category:"next", attachedDate:null})
        .then(() => this.onRemoveReminderClick()); 
    };



    onRemoveDeadlineLabel = () => {
        let {deadline,attachedDate} = this.state;

        if(isDate(attachedDate)){
            this.updateState({deadline:null});
         }else{
            this.updateState({category:"next", deadline:null});
         }
    };

    
  
    render(){   
        let {selectedCategory, id, rootRef, todo} = this.props; 
        let { 
            open,showChecklist,showDateCalendar,animatingSlideAway,showTags, 
            category,deadline,checklist,attachedDate,title
        } = this.state;

        let relatedProjectName = this.getRelatedProjectName();
        let canRepeat = isNil(todo.group); 

        let flagColor = "rgba(100,100,100,0.7)";
        let daysLeft = 0;  

        if(isDate(deadline)){      
           daysLeft = daysRemaining(deadline);        
           flagColor = daysLeft <= 1 ? "rgba(200,0,0,0.7)" : "rgba(100,100,100,0.7)";
        }     

        let shouldHighlightOnHover = not(open); // && selectedCategory!=="logbook" && selectedCategory!=="trash";

        return <div        
            id={id}    
            onKeyDown={this.onWindowEnterPress}  
            onContextMenu={this.onRightClickMenu}
            style={{    
                marginTop:"0px", 
                width:"100%",   
                marginBottom:open ? "10px":"0px",  
                backgroundColor:"rgba(255,255,255,1)", 
                WebkitUserSelect:"none", 
                display:this.state.display,     
                transform:`translateX(${this.state.translateX}%)`,  
                alignItems:"center",    
                justifyContent:"center"  
            }}   
        >     
        <div      
            ref={(e) => {this.ref=e;}}   
            style={{             
                width:"100%",   
                display:"inline-block", 
                transition:"box-shadow 0.2s ease-in-out, max-height 0.2s ease-in-out", 
                maxHeight:open ? "1000px" : "200px",
                boxShadow:open ? "rgba(156, 156, 156, 0.3) 0px 0px 20px" : "", 
                borderRadius:"5px"
            }}     
        >         
            <div 
                className={shouldHighlightOnHover ? "tasklist" : ""}
                style={{    
                    paddingLeft:"20px", 
                    paddingRight:"20px",   
                    transition:"max-height 0.2s ease-in-out", 
                    paddingTop:open ? "20px":"5px",
                    alignItems:"center", 
                    minHeight:"30px",
                    paddingBottom:open ? "20px":"5px", 
                    caretColor:"cornflowerblue",   
                    display:"flex"
                }}        
                onClick={this.onFieldsContainerClick}  
            >          
            <div style={{display:"flex",flexDirection:"column",paddingTop:"4px",width:"100%"}}>
                <TodoInputTopLevel 
                    onWindowEnterPress={this.onWindowEnterPress}
                    groupTodos={this.props.groupTodos}
                    setInputRef={e => {this.inputRef=e;}}
                    onRestoreButtonClick={this.onRestoreButtonClick}
                    onCheckBoxClick={this.onCheckBoxClick}
                    onTitleChange={this.onTitleChange}
                    open={open}
                    animatingSlideAway={animatingSlideAway}
                    selectedCategory={selectedCategory}
                    relatedProjectName={relatedProjectName}
                    flagColor={flagColor}   
                    rootRef={rootRef}
                    deleted={todo.deleted}
                    completedSet={todo.completedSet}
                    completedWhen={todo.completedWhen}
                    reminder={todo.reminder}
                    checklist={checklist}
                    group={todo.group} 
                    attachedTags={todo.attachedTags}
                    category={category}
                    attachedDate={attachedDate}
                    deadline={deadline}
                    title={title}
                    haveNote={compose(isNotEmpty, getNotePlainText)(this.state.editorState)}
                />  
                {    
                    not(open) ? null :    
                    <TodoInputMiddleLevel 
                        onNoteChange={this.onNoteChange}
                        onAttachTag={this.onAttachTag}
                        onRemoveTag={this.onRemoveTag}
                        updateChecklist={this.updateChecklist}
                        open={open} 
                        closeChecklist={() => this.setState({showChecklist:false})}
                        closeTags={() => this.setState({showTags:false})}
                        showChecklist={showChecklist}
                        showTags={showTags}
                        _id={todo._id} 
                        checklist={checklist}
                        attachedTags={todo.attachedTags}
                        editorState={this.state.editorState}
                    /> 
                }  
            </div>   
        </div>   
        {
            not(open) ? null :  
            <TodoInputLabels 
                onRemoveTodayLabel={this.onRemoveTodayLabel}
                onRemoveUpcomingLabel={this.onRemoveUpcomingLabel}
                onRemoveSomedayLabel={this.onRemoveSomedayLabel}
                onRemoveDeadlineLabel={this.onRemoveDeadlineLabel} 
                reminder={todo.reminder}
                todayCategory={isToday(attachedDate) || isToday(deadline)}
                open={open} 
                category={category}
                attachedDate={attachedDate}
                deadline={deadline}
            />
        }
        {        
            not(open) ? null :
            <div style={{
                display:"flex", 
                alignItems:"center",
                justifyContent:"flex-end",
                bottom:0, 
                padding:"5px",  
                right:0, 
                zIndex:30001    
            }}>  
            {     
                <div ref={(e) => {this.calendar=e;}}>  
                    <IconButton 
                        onClick={(e) => {
                            e.stopPropagation();
                            this.setState({showDateCalendar:true});
                        }} 
                        iconStyle={{   
                            transition:"opacity 0.2s ease-in-out",
                            opacity:this.state.open ? 1 : 0,
                            color:"rgb(207,206,207)",
                            width:25,   
                            height:25 
                        }}
                    >      
                        <Calendar /> 
                    </IconButton>  
                </div> 
            } 
            {
                <div ref={(e) => { this.tags=e;}} > 
                    <IconButton   
                        onClick={(e) => { 
                            e.stopPropagation();
                            this.setState({showTagsSelection:true,showTags:true});
                        }}
                        iconStyle={{ 
                            transition:"opacity 0.2s ease-in-out",
                            opacity:open ? 1 : 0, 
                            color:"rgb(207,206,207)",
                            width:25,  
                            height:25  
                        }} 
                    >         
                        <TriangleLabel />
                    </IconButton>    
                </div> 
            }
            {   
                this.state.showChecklist ? null :     
                <IconButton      
                    onClick={(e) => {
                        e.stopPropagation();
                        this.setState({showChecklist:true});
                    }}
                    iconStyle={{ 
                       transition:"opacity 0.2s ease-in-out",
                       opacity:open ? 1 : 0, 
                       color:"rgb(207,206,207)",
                       width:25, 
                       height:25 
                    }} 
                >        
                    <List />
                </IconButton>  
            }  
            {     
                <div ref={(e) => {this.deadline=e;}}>  
                    <IconButton 
                        onClick = {(e) => {
                            e.stopPropagation();
                            this.setState({showDeadlineCalendar:true});
                        }} 
                        iconStyle={{   
                            transition: "opacity 0.2s ease-in-out",
                            opacity: open ? 1 : 0,
                            color:"rgb(207,206,207)",
                            width:25, 
                            height:25  
                        }}
                    >     
                        <Flag />  
                    </IconButton> 
                </div>  
            }  
            {
                not(open) ? null :
                <DateCalendar 
                    close={() => this.setState({showDateCalendar:false})}
                    open={showDateCalendar}
                    origin={{vertical: "center", horizontal: "right"}} 
                    point={{vertical: "center", horizontal: "right"}}  
                    anchorEl={this.calendar}
                    rootRef={this.props.rootRef}
                    reminder={todo.reminder} 
                    attachedDate={attachedDate}
                    onDayClick={this.onCalendarDayClick}
                    onSomedayClick={(e) => {
                        e.stopPropagation();
                        this.updateState({ 
                            category:"someday",
                            deadline:null,
                            attachedDate:null,
                            showDateCalendar:false
                        });
                    }}
                    onTodayClick={this.onCalendarTodayClick} 
                    onRepeatTodo={canRepeat ? this.onRepeatTodo : null}
                    onThisEveningClick={this.onCalendarThisEveningClick}
                    onAddReminderClick={this.onCalendarAddReminderClick}
                    onRemoveReminderClick={this.onRemoveReminderClick}
                    onClear={this.onCalendarClear}  
                />  
            }
            { 
                not(open) ? null :
                <TagsPopup
                    attachTag={this.onAttachTag}
                    close={(e) => this.setState({showTagsSelection:false})}
                    open={this.state.showTagsSelection} 
                    anchorEl={this.tags}
                    origin={{vertical:"center",horizontal:"right"}}
                    point={{vertical:"center",horizontal:"right"}}
                    rootRef={rootRef}
                /> 
            }
            {
                not(open) ? null :
                <DeadlineCalendar  
                    close={() => this.setState({showDeadlineCalendar:false})}
                    onDayClick={this.onDeadlineCalendarDayClick}
                    open={this.state.showDeadlineCalendar}
                    origin={{vertical:"center",horizontal:"right"}} 
                    point={{vertical:"center",horizontal:"right"}} 
                    anchorEl={this.deadline} 
                    deadline={this.state.deadline}
                    onClear={this.onDeadlineCalendarClear}
                    rootRef={this.props.rootRef}
                />       
            } 
            </div>  
        }     
        </div>
    </div> 
  } 
};   



