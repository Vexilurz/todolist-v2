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
import BusinessCase from 'material-ui/svg-icons/content/archive';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import Checked from 'material-ui/svg-icons/navigation/check';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz'; 
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
 todoChanged, daysLeftMark, generateTagElement, isToday, getMonthName, fiveMinutesLater, 
 onHourLater, oneDayAhead, getCompletedWhen, findWindowByTitle
} from '../../utils/utils'; 
import { Todo, removeTodo, updateTodo, Project} from '../../database';
import { Checklist, ChecklistItem } from './TodoChecklist';
import { Category } from '../MainContainer'; 
import { TagsPopup, TodoTags } from './TodoTags';
import { TodoInputLabel } from './TodoInputLabel'; 
import { uniq, isEmpty, contains, isNil, not, multiply, remove, cond, equals, any } from 'ramda';
import Restore from 'material-ui/svg-icons/content/undo';
let moment = require("moment"); 
import AutosizeInput from 'react-input-autosize'; 
import { isString } from 'util';
import { AutoresizableText } from '../AutoresizableText';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import ResizeObserver from 'resize-observer-polyfill';
import { Observable } from 'rxjs/Rx';
import { insideTargetArea } from '../../utils/insideTargetArea';
import { googleAnalytics } from '../../analytics';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { isFunction, isDate } from '../../utils/isSomething';
import { daysRemaining } from '../../utils/daysRemaining';
import { stringToLength } from '../../utils/stringToLength';
import { assert } from '../../utils/assert';
import { setCallTimeout } from '../../utils/setCallTimeout';
import { debounce } from 'lodash'; 
let Promise = require('bluebird');


interface AutosizeInputComponentProps{
    title:string,
    onTitleChange:Function
}

interface AutosizeInputComponentState{}

class AutosizeInputComponent extends Component<AutosizeInputComponentProps,AutosizeInputComponentState>{  

    
    constructor(props){
        super(props);    
    };


    shouldComponentUpdate(nextProps:AutosizeInputComponentProps){
        return nextProps.title!==this.props.title
    };


    render(){
        let {title,onTitleChange} = this.props;

        return <div>
            <AutosizeInput 
                type="text"
                name="form-field-name"   
                style={{display:"flex", alignItems:"center", cursor:"default"}}            
                inputStyle={{                
                    color:"black",  
                    fontSize:"16px",  
                    cursor:"default", 
                    boxSizing:"content-box", 
                    backgroundColor:"rgba(0,0,0,0)",
                    border:"none", 
                    outline:"none"   
                }} 
                value={title} 
                placeholder="New To-Do" 
                onChange={onTitleChange} 
            /> 
        </div>
    }
}





export interface TodoInputState{  
    open : boolean,
    tag : string, 
    translateX : number,
    display : string,
    animatingSlideAway : boolean,
    showAdditionalTags : boolean, 
    showDateCalendar : boolean,  
    showTagsSelection : boolean,
    showChecklist : boolean,   
    showDeadlineCalendar : boolean
}   
   
    
export interface TodoInputProps{ 
    dispatch : Function,  
    groupTodos : boolean,  
    selectedTodo : Todo,
    moveCompletedItemsToLogbook : string, 
    selectedCategory : Category,
    selectedProjectId : string,
    selectedAreaId : string,
    todos : Todo[],
    projects : Project[], 
    todo : Todo,  
    rootRef : HTMLElement,  
    id : string, 
    onOpen? : Function,
    onClose? : Function,
    showCompleted? : boolean
}    
 
   
export class TodoInput extends Component<TodoInputProps,TodoInputState>{
    
    calendar:HTMLElement; 
    deadline:HTMLElement;
    tags:HTMLElement;
    ref:HTMLElement; 
    inputRef:HTMLElement; 
    subscriptions:Subscription[]; 
 
    constructor(props){

        super(props);  

        this.subscriptions = [];
         
        let {checklist} = this.props.todo;

        this.state={   
            open:false,
            tag:'', 
            translateX:0,
            animatingSlideAway:false,
            display:"flex",
            showAdditionalTags:false, 
            showDateCalendar:false,  
            showTagsSelection:false, 
            showChecklist:checklist.length>0,  
            showDeadlineCalendar:false
        };       
    };


    shouldComponentUpdate(nextProps:TodoInputProps,nextState:TodoInputState){
        if(
            not(equals(this.state,nextState)) ||
            not(equals(this.props.todo,nextProps.todo)) ||
            this.props.groupTodos!==nextProps.groupTodos || 
            this.props.showCompleted!==nextProps.showCompleted ||
            this.props.moveCompletedItemsToLogbook!==nextProps.moveCompletedItemsToLogbook ||
            this.props.selectedCategory!==nextProps.selectedCategory ||
            this.props.selectedProjectId!==nextProps.selectedProjectId ||
            this.props.selectedAreaId!==nextProps.selectedAreaId ||
            this.props.projects!==nextProps.projects ||
            this.props.selectedTodo!==nextProps.selectedTodo
        ){
            return true;
        }

        return false;
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
        .then((e) => console.log(`Todo completed`))  
        .catch(err => this.onError(err));
    };


    onError = (error) => globalErrorHandler(error);


    componentDidMount(){   
        let { todo, selectedTodo } = this.props;

        if(
            not(isNil(selectedTodo)) && 
            selectedTodo._id===todo._id
        ){ 
            this.updateState({open:true})
            .then(
                () => isNil(this.ref) ? null : this.ref.scrollIntoView()
            )
        };

        let click = Observable.fromEvent(window,"click").subscribe(this.onOutsideClick);
        this.subscriptions.push(click);
    };        

 
    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = []; 
    }; 


    componentDidUpdate(prevProps:TodoInputProps,prevState:TodoInputState){
        let { open } = this.state; 
        let { todo, selectedTodo } = this.props;

        if(this.inputRef && isEmpty(todo.title) && open){ 
           this.inputRef.focus(); 
        }; 

        if(isEmpty(todo.title) || open){ 
            this.preventDragOfThisItem(); 
        }else{ 
            this.enableDragOfThisItem(); 
        }  
    };   


    onFieldsContainerClick = (e) => {    
        e.stopPropagation();     
        this.preventDragOfThisItem();
        let {open} = this.state;
        let {dispatch, onOpen} = this.props;

        if(not(open)){    
            this.setState(
                {open:true, showAdditionalTags:false}, 
                () => isFunction(onOpen) ? onOpen() : null
            );   
            dispatch({type:"showRepeatPopup", load:false});
            dispatch({type:"showRightClickMenu", load:false});
        };   
    };  
    

    onWindowEnterPress = (e) => {  
        if(e.keyCode!==13){ return }
        let {open} = this.state;
        let {onClose} = this.props;
        if(open){ 
            this.setState({open:false}, () => isFunction(onClose) ? onClose() : null); 
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
           this.setState({open:false}, () => isFunction(onClose) ? onClose() : null); 
        }   
    };


    update = (props) : void => {
        let {todo,dispatch} = this.props;
        dispatch({type:"updateTodo",load:{...todo,...props}});
    };


    onTitleChange = (event) : void => this.update({title:event.target.value});
    

    onNoteChange = (event,newValue:string) : void => this.update({note:newValue});


    updateChecklist = (checklist:ChecklistItem[]) : void => this.update({checklist});


    onAttachTag = (tag:string) : void => {
        if(isEmpty(tag)){ return };

        let {todo} = this.props;

        this.setState(
            {tag:''}, 
            () => this.update({attachedTags:uniq([...todo.attachedTags, tag])})
        );
    }; 


    onCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        e.stopPropagation(); 
        let {todo} = this.props;
        this.update({attachedDate:day, category:isToday(day) ? "today" : todo.category}); 
        this.closeDateCalendar();
    };


    onDeadlineCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        e.stopPropagation();
        this.update({deadline:day});
        this.closeDeadlineCalendar();
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


    animateSlideAway = () : Promise<void> => new Promise(resolve => {
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
    }) 
      
    
    onRightClickMenu = (e) => {  
        let {open} = this.state;
        let {dispatch,todo,rootRef} = this.props;

        if(not(open)){
            dispatch({ 
                type:"openRightClickMenu",  
                load:{   
                   showRightClickMenu:true, 
                   rightClickedTodoId:todo._id, 
                   rightClickMenuX:e.clientX-rootRef.offsetLeft,
                   rightClickMenuY:e.clientY+rootRef.scrollTop 
                } 
            });  

            dispatch({type:"showRepeatPopup", load:false});
        }     
    };  

    
    onRemoveSelectedCategoryLabel = () => {
        let {selectedCategory, todo} = this.props;

        if(
            selectedCategory!==todo.category &&
            (todo.category==="today" || todo.category==="evening")
        ){
            this.update({category:selectedCategory,attachedDate:null}); 
        }else if( 
            selectedCategory!==todo.category &&
            todo.category==="someday"
        ){
            this.update({category:selectedCategory});    
        }
    };   

 
    onChecklistButtonClick = (e) => {
        e.stopPropagation();
        this.setState({showChecklist:true});
    }; 
      

    onFlagButtonClick = (e) => {
        e.stopPropagation();
        this.setState({showDeadlineCalendar:true});
    };


    closeDeadlineCalendar = () => {
        this.setState({showDeadlineCalendar:false});
    };
 

    onCalendarButtonClick = (e) => {
        e.stopPropagation();
        this.setState({showDateCalendar:true});
    };
    

    closeDateCalendar = () => {
        this.setState({showDateCalendar:false});
    };
    

    onTagsButtonClick = (e) => { 
        e.stopPropagation();
        this.setState({showTagsSelection:true});
    };   


    closeTagsSelection = (e) => {
        this.setState({showTagsSelection:false});
    };


    onDeadlineCalendarClear = (e:any) : void => {
        e.stopPropagation();
        this.update({deadline:null});
        this.closeDeadlineCalendar(); 
    }
    

    onRemoveAttachedDateLabel = () => {
        let {selectedCategory} = this.props;
        let today = selectedCategory==="today" || selectedCategory==="evening";
        this.update({attachedDate:null, category:today ? "next" : selectedCategory});  
    };  
    

    onCalendarSomedayClick = (e) => {
        e.stopPropagation();
        this.update({category:"someday"});
        this.closeDateCalendar();
    };


    onCalendarTodayClick = (e) => {
        e.stopPropagation();
        this.update({category:"today", attachedDate:new Date()});
        this.closeDateCalendar();
    }; 


    onCalendarThisEveningClick = (e) => {
        e.stopPropagation();
        this.update({category:"evening", attachedDate:new Date()});
        this.closeDateCalendar();
    }; 


    onCalendarAddReminderClick = (reminder:Date) : void => {
        let {dispatch} = this.props;
        this.update({reminder, attachedDate:reminder}); 
        dispatch({type:"resetReminders"});
        this.closeDateCalendar();
    };

    
    onRemoveReminderClick = () : void => {
        let {dispatch} = this.props;
        this.update({reminder:null}); 
        dispatch({type:"resetReminders"});
    };
 

    onCalendarClear = (e) => {
        e.stopPropagation();
        let {todo} = this.props;
        this.update({category:todo.category,attachedDate:null,reminder:null}); 
        this.closeDateCalendar();
    };
  

    onRestoreButtonClick = debounce(() => this.update({deleted:undefined}), 50);
     

    onRepeatTodo = (top:number, left:number) => {   
        let {rootRef,todo} = this.props;
        let containerClientRect = rootRef.getBoundingClientRect();

        this.props.dispatch({
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

  
    render(){   
        let { open, showChecklist, showDateCalendar, animatingSlideAway } = this.state;
        let { selectedCategory, id, todo, rootRef } = this.props; 

        let attachedDateToday = isToday(todo.attachedDate);
        let deadlineToday = isToday(todo.deadline);
        let todayCategory : boolean = attachedDateToday || deadlineToday;
         
        let relatedProjectName = this.getRelatedProjectName();
        let removePadding = isNil(relatedProjectName) || selectedCategory==="project";
        let padding = open ? "20px" : removePadding ? "0px" : "5px";
        let canRepeat = isNil(todo.group); 
        let flagColor = "rgba(100,100,100,0.7)";
        let daysLeft = 0;

        if(!isNil(todo.deadline)){      
            daysLeft = daysRemaining(todo.deadline);        
            flagColor = daysLeft <= 1 ? "rgba(200,0,0,0.7)" : "rgba(100,100,100,0.7)";
        }    

        return <div       
            id={id}    
            onKeyDown={this.onWindowEnterPress}  
            onContextMenu={this.onRightClickMenu}
            style={{    
                marginTop:"5px", 
                marginBottom:"5px",  
                width:"100%",   
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
                maxHeight:open ? "1000px" : "70px",
                boxShadow:open ? "rgba(156, 156, 156, 0.3) 0px 0px 20px" : "", 
                borderRadius:"5px", 
            }}     
        >        
            <div 
                className={open ? "" : "tasklist"}
                style={{    
                    paddingLeft:"20px", 
                    paddingRight:"20px",   
                    transition:"max-height 0.2s ease-in-out", 
                    paddingTop:padding,
                    paddingBottom:padding, 
                    caretColor:"cornflowerblue",   
                    display:"flex"
                }}        
                onClick={this.onFieldsContainerClick} 
            >          
            <div style={{display:"flex",flexDirection:"column",padding:"2px",width:"100%"}}>
                <TodoInputTopLevel 
                    onAdditionalTagsHover={(e) => {}}
                    onAdditionalTagsOut={(e) => {}}
                    onAdditionalTagsPress={(e) => {}}
                    groupTodos={this.props.groupTodos}
                    setInputRef={e => {this.inputRef=e;}}
                    onRestoreButtonClick={this.onRestoreButtonClick}
                    onCheckBoxClick={this.onCheckBoxClick}
                    onTitleChange={this.onTitleChange}
                    open={open}
                    animatingSlideAway={animatingSlideAway}
                    rootRef={rootRef} 
                    selectedCategory={selectedCategory}
                    todo={todo}
                    showAdditionalTags={false}
                    relatedProjectName={relatedProjectName}
                    flagColor={flagColor}   
                />  
                {    
                    not(open) ? null :    
                    <TodoInputMiddleLevel 
                        onNoteChange={this.onNoteChange}
                        onAttachTag={this.onAttachTag}
                        onRemoveTag={this.onRemoveTag}
                        updateChecklist={this.updateChecklist}
                        open={open} 
                        showChecklist={showChecklist}
                        todo={todo}
                    /> 
                }  
            </div>   
        </div>   
        {
            not(open) ? null :  
            <TodoInputLabels 
                onRemoveSelectedCategoryLabel={this.onRemoveSelectedCategoryLabel}
                onRemoveAttachedDateLabel={this.onRemoveAttachedDateLabel}
                onRemoveDeadlineLabel={() => this.update({deadline:null})}
                todayCategory={todayCategory}
                open={open} 
                category={todo.category}
                attachedDate={todo.attachedDate}
                deadline={todo.deadline}
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
                <div ref={(e) => { this.calendar=e; }}>  
                    <IconButton 
                        onClick = {this.onCalendarButtonClick} 
                        iconStyle={{   
                            transition: "opacity 0.2s ease-in-out",
                            opacity: this.state.open ? 1 : 0,
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
                        onClick = {this.onTagsButtonClick}
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
                    onClick = {this.onChecklistButtonClick}
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
                        onClick = {this.onFlagButtonClick} 
                        iconStyle={{   
                          transition: "opacity 0.2s ease-in-out",
                          opacity: this.state.open ? 1 : 0,
                          color:"rgb(207,206,207)",
                          width:25, 
                          height:25 
                        }}
                    >     
                        <Flag />  
                    </IconButton> 
                </div>  
            }  
            <DateCalendar 
                close = {this.closeDateCalendar}
                open = {showDateCalendar}
                origin = {{vertical: "center", horizontal: "right"}} 
                point = {{vertical: "center", horizontal: "right"}}  
                anchorEl = {this.calendar}
                rootRef = {this.props.rootRef}
                reminder = {todo.reminder} 
                attachedDate = {todo.attachedDate}
                onDayClick = {this.onCalendarDayClick}
                onSomedayClick = {this.onCalendarSomedayClick}
                onTodayClick = {this.onCalendarTodayClick} 
                onRepeatTodo = {canRepeat ? this.onRepeatTodo : null}
                onThisEveningClick = {this.onCalendarThisEveningClick}
                onAddReminderClick = {this.onCalendarAddReminderClick}
                onRemoveReminderClick = {this.onRemoveReminderClick}
                onClear = {this.onCalendarClear}  
            />  
            <TagsPopup
                {  
                ...{
                    attachTag:this.onAttachTag,
                    close:this.closeTagsSelection,
                    open:this.state.showTagsSelection,   
                    anchorEl:this.tags,
                    origin:{vertical: "center", horizontal: "right"},
                    point:{vertical: "center", horizontal: "right"},
                    rootRef:rootRef
                } as any
                } 
            /> 
            <DeadlineCalendar  
                close={this.closeDeadlineCalendar}
                onDayClick={this.onDeadlineCalendarDayClick}
                open={this.state.showDeadlineCalendar}
                origin={{vertical:"center", horizontal:"right"}} 
                point={{vertical:"center", horizontal:"right"}} 
                anchorEl={this.deadline}
                onClear={this.onDeadlineCalendarClear}
                rootRef={this.props.rootRef}
            />       
            </div>   
        }     
        </div>
    </div> 
  } 
}   
  


interface TodoInputTopLevelProps{
    onAdditionalTagsHover:Function,
    onAdditionalTagsOut:Function, 
    onAdditionalTagsPress:Function, 
    setInputRef:(e:any) => void  
    groupTodos:boolean,
    onRestoreButtonClick:Function,
    onCheckBoxClick:Function,
    onTitleChange:Function, 
    open:boolean,
    selectedCategory:Category,
    todo:Todo,
    showAdditionalTags:boolean,
    relatedProjectName:string,
    rootRef:HTMLElement,
    flagColor:string,
    animatingSlideAway?:boolean   
}


interface TodoInputTopLevelState{}


export class TodoInputTopLevel extends Component <TodoInputTopLevelProps,TodoInputTopLevelState>{

    ref:HTMLElement; 
    inputRef:HTMLElement;
    labelRef:HTMLElement;

    constructor(props){
        super(props);
    } 
 
    render(){

        let {
            open,
            selectedCategory,
            todo,
            showAdditionalTags,
            relatedProjectName,
            flagColor,  
            rootRef,
            groupTodos,
            animatingSlideAway
        } = this.props;

 
        return <div  
            ref={(e) => {this.ref=e;}} 
            style={{display:"flex", flexDirection:"column"}}  
        >  
            <div style={{
              display:"flex",    
              alignItems:"flex-start", 
              flexDirection:"column",
              overflow:"hidden"
            }}>    
                <div  
                  ref={(e) => {this.inputRef=e;}}
                  style={{display:"flex", alignItems:"center"}}  
                >
                    {
                        isNil(todo.deleted) ? null :      
                        <div
                            onClick={(e) => {e.stopPropagation();}} 
                            onMouseUp={(e) => {e.stopPropagation();}} 
                            onMouseDown={(e) => {e.stopPropagation();}} 
                        > 
                            <RestoreButton  
                                deleted={not(isNil(todo.deleted))}
                                open={open}   
                                onClick={this.props.onRestoreButtonClick}  
                            />    
                        </div>   
                    }   
                    <div   
                        onClick={(e) => {
                            e.stopPropagation();
                            e.nativeEvent.stopImmediatePropagation();
                        }} 
                        style={{paddingLeft:"5px", paddingRight:"5px"}}
                    > 
                        <Checkbox  
                          checked={animatingSlideAway ? true : !!todo.completedSet}  
                          onClick={this.props.onCheckBoxClick}
                        />
                    </div>   
                    {
                        open ? null :       
                        <DueDate  
                            category={todo.category} 
                            date={todo.attachedDate} 
                            completed={todo.completedWhen} 
                            selectedCategory={selectedCategory}
                        />
                    } 
                    {   
                        isNil(todo.group) ? null :
                        <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}> 
                            <Refresh 
                              style={{     
                                width:18,   
                                height:18, 
                                marginLeft:"3px", 
                                color:"black", 
                                cursor:"default", 
                                marginRight:"5px"  
                              }} 
                            />
                        </div>
                    } 
                    <div key="form-field" ref={this.props.setInputRef}>  
                        <AutosizeInputComponent   
                            title={todo.title} 
                            onTitleChange={this.props.onTitleChange} 
                        /> 
                    </div>
                </div> 
                {   
                    open ? null :
                    isEmpty(todo.attachedTags) && isNil(todo.deadline) ? null :
                    <div style={{
                        height:"25px",
                        display:"flex",
                        alignItems:"center",
                        zIndex:1001,   
                        justifyContent:"flex-start",
                        zoom:0.8, 
                        flexGrow:1   
                    }}>        
                        {  
                            isEmpty(todo.attachedTags) ? null :
                            <AdditionalTags   
                                attachedTags={todo.attachedTags}      
                                showAdditionalTags={showAdditionalTags}
                                open={open}  
                                onMouseOver={this.props.onAdditionalTagsHover as any}
                                onMouseOut={this.props.onAdditionalTagsOut as any} 
                                onMouseDown={this.props.onAdditionalTagsPress as any}  
                            />   
                        } 
                        {    
                            isNil(todo.deadline) ? null :   
                            <div 
                                ref = {e => {this.labelRef=e;}}
                                style={{
                                    display:"flex", 
                                    cursor:"default",    
                                    pointerEvents:"none", 
                                    alignItems:"center",   
                                    height:"100%",
                                    flexGrow:1,  
                                    justifyContent:"flex-end" 
                                }} 
                            > 
                                <div style={{paddingRight:"5px", paddingTop:"5px"}}> 
                                    <Flag style={{color:flagColor,cursor:"default",width:16,height:16}}/>      
                                </div>   
                                {daysLeftMark(open, todo.deadline)}
                            </div>  
                        } 
                    </div>
                }
            </div>
            {
                open ? null :  
                isNil(relatedProjectName) ? null :
                isEmpty(relatedProjectName) ? null :
                <RelatedProjectLabel 
                    name={relatedProjectName} 
                    groupTodos={groupTodos} 
                    selectedCategory={selectedCategory}
                />   
            }   
    </div>  
  } 
}



interface TodoInputMiddleLevelProps{
    onNoteChange:Function, 
    updateChecklist:Function, 
    open:boolean,
    onAttachTag:(tag:string) => void,
    onRemoveTag:(tag:string) => void,
    showChecklist:boolean, 
    todo:Todo
} 

interface TodoInputMiddleLevelState{}
 
export class TodoInputMiddleLevel extends Component<TodoInputMiddleLevelProps,TodoInputMiddleLevelState>{
    
    constructor(props){ super(props) }

    render(){
        let {open,showChecklist,todo,onAttachTag,onRemoveTag} = this.props;

        return <div style={{
          transition:"opacity 0.2s ease-in-out", 
          opacity:open ? 1 : 0, 
          paddingLeft:"25px", 
          paddingRight:"25px"  
        }}>    
            <TextField   
                id={`${todo._id}note`}  
                value={todo.note} 
                hintText="Notes"
                onKeyDown={(e) => { if(e.keyCode===13){ e.stopPropagation(); } }}
                multiLine={true}   
                rows={1} 
                fullWidth={true} 
                onChange={this.props.onNoteChange} 
                inputStyle={{fontSize:"14px"}} 
                underlineFocusStyle={{borderColor:"rgba(0,0,0,0)"}} 
                underlineStyle={{borderColor:"rgba(0,0,0,0)"}}
            />    
            {    
                not(showChecklist) ? null : 
                <div> 
                    <Checklist 
                        checklist={todo.checklist} 
                        updateChecklist={this.props.updateChecklist as any}
                    /> 
                </div>
            }   
            {  
                isEmpty(todo.attachedTags) ? null :
                <TodoTags 
                    attachTag={onAttachTag} 
                    removeTag={onRemoveTag} 
                    tags={todo.attachedTags}
                /> 
            } 
        </div>   
    } 
}
  

 
interface TransparentTagProps{tag:string}
class TransparentTag extends Component<TransparentTagProps,{}>{

    constructor(props){
        super(props); 
    }
    
    render(){
        return <div  
            style={{  
                height:"20px",
                borderRadius:"15px",
                display:'flex',
                alignItems:"center",
                justifyContent:"center",  
                border:"1px solid rgba(200,200,200,0.5)"
            }}
        >  
            <div style={{ 
                color:"rgba(200,200,200,1)", 
                fontSize:"13px", 
                cursor:"default",
                padding:"5px", 
                WebkitUserSelect:"none"
            }}> 
                {this.props.tag} 
            </div>  
        </div>    
    }
} 




interface DueDateProps{
    date:Date,
    selectedCategory:Category,
    category:Category,
    completed:Date
}
 
export class DueDate extends Component<DueDateProps,{}>{

    constructor(props){
        super(props); 
    }

    render(){   
        let {date,category,selectedCategory,completed} = this.props;
        let showSomeday : boolean = selectedCategory!=="someday" && category==="someday";

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
        }

        let Someday = <div style={{height:"18px"}}><BusinessCase style={{...style,color:"burlywood"}}/></div>;
        let Today = <div style={{height:"18px"}}><Star style={{...style,color:"gold"}}/></div>;
        


        if(isNil(date) && isNil(completed)){
           return showSomeday ? Someday : null 
        }else if(
            not(isNil(date)) && 
            selectedCategory!=="logbook" &&
            selectedCategory!=="upcoming"
        ){
            let month = getMonthName(date); 
            let day = date.getDate();  

            return isToday(date) && selectedCategory!=="today" ? Today :
                   <div style={{paddingRight:"5px"}}>
                    <div style={containerStyle}>     
                        <div style={{ 
                            display:"flex",    
                            padding:"5px", 
                            alignItems:"center", 
                            fontSize:"11px"
                        }}>      
                            <div style={{paddingRight:"5px"}}>{month.slice(0,3)+'.'}</div>  
                            <div>{day}</div>
                        </div> 
                    </div>
                   </div> 

        }else if(not(isNil(completed)) && selectedCategory==="logbook"){

            let month = getMonthName(completed);
            let day = completed.getDate(); 

            return <div style={{paddingRight:"5px"}}>
                <div style={{
                    backgroundColor:"rgba(0, 0, 0,0)",
                    cursor:"default", 
                    WebkitUserSelect:"none", 
                    display:"flex",
                    alignItems:"center",  
                    justifyContent:"center", 
                    paddingLeft:"5px",
                    paddingRight:"5px", 
                    borderRadius:"15px",
                    color:"rgb(0, 60, 250)",
                    fontWeight:"bold",
                    height:"20px" 
                }}>      
                    <div style={{ 
                        display:"flex",   
                        padding:"5px", 
                        alignItems:"center", 
                        fontSize:"12px"
                    }}>      
                        {
                          isToday(completed) ? 
                          <div>Today</div> :  
                          <div style={{
                            display:"flex",   
                            padding:"5px", 
                            alignItems:"center", 
                            fontSize:"12px" 
                          }}>    
                            <div style={{paddingRight:"5px"}}>{month.slice(0,3)+'.'}</div>  
                            <div>{day}</div>
                          </div>
                        }  
                    </div>  
                </div>
            </div> 
        }else{
            return null;
        }
    }
} 




interface RelatedProjectLabelProps{
    name:string,
    selectedCategory:Category,
    groupTodos:boolean 
} 
 
interface RelatedProjectLabelState{}

class RelatedProjectLabel extends Component<RelatedProjectLabelProps,RelatedProjectLabelState>{

    
    render(){
        let {selectedCategory,groupTodos} = this.props;
        let disable : Category[] = groupTodos ?
                                    ["search", "project","someday","today","next","area"] : 
                                    ["project","area"];
        
        if(contains(selectedCategory)(disable)){ return null }

        if(isNil(this.props.name)){ return null }    

        return <div 
            style={{ 
                fontSize:"12px",   
                paddingLeft:"5px", 
                cursor:"default", 
                WebkitUserSelect:"none", 
                color:"rgba(0,0,0,0.6)"
            }}   
        > 
            {stringToLength(this.props.name,15)}
        </div>    
    }
} 



interface CheckboxProps{
    checked:boolean,
    onClick:Function  
}


export class Checkbox extends Component<CheckboxProps,{}>{
    ref:HTMLElement; 

    constructor(props){
        super(props); 
    } 

    componentDidMount(){
        if(this.ref){
           this.ref["preventDrag"] = true; 
        }
    }  
    
    componentWillReceiveProps(){
        if(this.ref){
           this.ref["preventDrag"] = true; 
        }
    }

    render(){
        return <div    
            ref={(e) => {this.ref=e;}} 
            onClick = {(e) => {
                e.stopPropagation(); 
                e.nativeEvent.stopImmediatePropagation();
                this.props.onClick();
            }}
            onMouseDown= {(e) => { 
                e.stopPropagation(); 
                e.nativeEvent.stopImmediatePropagation();
            }} 
            style={{   
                width:"14px",   
                borderRadius:"3px",  
                backgroundColor:this.props.checked ? "rgb(32, 86, 184)" : "",
                border:this.props.checked ? "" : "1px solid rgba(100,100,100,0.5)",
                height:"14px",
                boxSizing:"border-box",
                display:"flex",
                alignItems:"center"    
            }}  
        >      
            { this.props.checked ? <Checked style={{color:"white"}}/> : null }
        </div> 
    }
}

 

interface RestoreButtonProps{
    deleted:boolean,
    open:boolean, 
    onClick:Function 
}
 
 
class RestoreButton extends Component<RestoreButtonProps,{}>{

    constructor(props){
        super(props); 
    } 
 
    render(){ 
        return !this.props.deleted ? null :   
        this.props.open ? null :  
        <div             
            onClick={(e) => {
                e.stopPropagation(); 
                this.props.onClick(); 
            }}
            style={{  
                display:"flex",
                cursor:"pointer", 
                alignItems:"center",
                height:"14px"
            }} 
        > 
            <Restore style={{width:"20px", height:"20px"}}/> 
        </div> 
    }
}




interface AdditionalTagsProps{
    attachedTags:string[],
    showAdditionalTags:boolean, 
    open:boolean,
    onMouseOver:(e) => void,
    onMouseOut:(e) => void,
    onMouseDown:(e) => void 
}
 

class AdditionalTags extends Component<AdditionalTagsProps,{}>{

    constructor(props){
        super(props); 
    }   
    
    render(){
        return isEmpty(this.props.attachedTags) ? null :  
        this.props.open ? null : 
        <div   
            onMouseOver={this.props.onMouseOver}
            onMouseOut={this.props.onMouseOut} 
            onMouseDown={this.props.onMouseDown} 
            style={{ 
                paddingLeft:"5px",   
                paddingRight:"5px", 
                display: "flex",   
                position:"relative", 
                alignItems: "center"
            }} 
            key={this.props.attachedTags[0]}
        >
            {   
                this.props.attachedTags.length<=1 ? null : 
                <div style={{ 
                    position: "absolute",
                    right: "40px",
                    display: "flex",
                    zIndex:50000,
                    bottom: "30px",  
                    pointerEvents:"none",  
                    background:"white",  
                    flexWrap: "wrap",
                    padding: "10px",   
                    width: "200px",
                    border: "1px solid rgba(100,100,100,0.2)",
                    borderRadius: "10px",
                    transition: "opacity 0.2s ease-in-out",
                    opacity: this.props.showAdditionalTags ? 1 : 0
                }}>      
                    {    
                        this.props.attachedTags
                        .slice(1,this.props.attachedTags.length)
                        .map((tag:string) => <div 
                                key={tag} 
                                style={{padding:"5px"}}
                            > 
                                <TransparentTag tag={tag}/>
                            </div>
                        ) 
                    }             
                </div> 
            }
            <TransparentTag 
                tag={
                    this.props.attachedTags.length>1 ? 
                    `${this.props.attachedTags[0]}...` :
                    this.props.attachedTags[0]
                } 
            /> 
        </div>   
    }
}




interface TodoInputLabelsProps{
    onRemoveSelectedCategoryLabel
    onRemoveAttachedDateLabel
    onRemoveDeadlineLabel 
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


    render(){ 
        let {todayCategory,open,category,attachedDate,deadline} = this.props;

        return <div style={{display:"flex",flexDirection:"column",paddingLeft:"10px",paddingRight:"10px"}}>   
            {    
                not(todayCategory) ? null :
                <div style={{transition:"opacity 0.4s ease-in-out",opacity:open ? 1 : 0,paddingLeft:"5px"}}>      
                    <TodoInputLabel 
                        onRemove={this.props.onRemoveSelectedCategoryLabel}
                        category={category==="evening" ? "evening" : "today"}
                        content={ 
                            <div style={{marginLeft:"15px"}}>
                                {category==="evening" ? "This Evening" : "Today"}   
                            </div>   
                        }  
                    />   
                </div>  
            }  
            {   
                category!=="someday" ? null :
                <div style={{transition:"opacity 0.4s ease-in-out",opacity:open ? 1 : 0,paddingLeft:"5px"}}>      
                    <TodoInputLabel 
                        onRemove={this.props.onRemoveSelectedCategoryLabel}
                        category={"someday"}
                        content={<div style={{marginLeft:"15px"}}>Someday</div>}  
                    />   
                </div>  
            }   
            { 
                isNil(attachedDate) || todayCategory ? null :
                <div style={{transition: "opacity 0.4s ease-in-out",opacity:open ? 1 : 0}}>    
                    <TodoInputLabel 
                        onRemove={this.props.onRemoveAttachedDateLabel}
                        category={"upcoming"}
                        content={
                            <div style={{marginLeft:"15px", color:"black"}}>
                                When : {moment(attachedDate).format('MMMM D')} 
                            </div>    
                        }  
                    />    
                </div>   
            } 
            { 
                isNil(deadline) ? null : 
                <div style={{transition : "opacity 0.4s ease-in-out",opacity : open ? 1 : 0}}>
                    <TodoInputLabel  
                        onRemove={this.props.onRemoveDeadlineLabel}
                        category={"deadline"} 
                        content={ 
                            <div style={{marginLeft:"15px", color:"black"}}>
                                Deadline: {moment(deadline).format('MMMM D')}
                            </div>
                        }
                    />     
                </div>  
            } 
        </div>
    }
}