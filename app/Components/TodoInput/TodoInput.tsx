import 'react-tippy/dist/tippy.css'
import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
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
import { daysLeftMark, isToday, getMonthName, getCompletedWhen, getTime, setTime, isNotNil, different, isNotEmpty } from '../../utils/utils'; 
import { Todo, Project, Group } from '../../database';
import { Checklist, ChecklistItem } from './TodoChecklist';
import { Category } from '../MainContainer'; 
import { TodoTags } from './TodoTags';
import { TagsPopup } from './TagsPopup';
import { TodoInputLabel } from './TodoInputLabel'; 
import { uniq, isEmpty, contains, isNil, not, multiply, remove, cond, equals, any, complement } from 'ramda';
import Restore from 'material-ui/svg-icons/content/undo';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { Observable } from 'rxjs/Rx';
import { insideTargetArea } from '../../utils/insideTargetArea';
import { googleAnalytics } from '../../analytics';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { isFunction, isDate, isString } from '../../utils/isSomething';
import { daysRemaining } from '../../utils/daysRemaining';
import Alert from 'material-ui/svg-icons/alert/add-alert';
import { stringToLength } from '../../utils/stringToLength';
import { assert } from '../../utils/assert';
import { debounce } from 'lodash';    
import TextareaAutosize from 'react-autosize-textarea';
let moment = require("moment"); 
let Promise = require('bluebird'); 
import {Tooltip,withTooltip} from 'react-tippy';


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


export interface TodoInputState{  
    open : boolean,
    tag : string, 
    translateX : number,
    display : string,
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
    title : string,
    note : string
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
         
        let {checklist,attachedDate,deadline,category,reminder,title,note,attachedTags} = this.props.todo;

        this.state={   
            open:false,
            tag:'', 
            translateX:0,
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
            title, 
            note
        };        
    };

 

    update = (props) : void => {
        let {todo,dispatch} = this.props;
        dispatch({type:"updateTodo",load:{...todo,...props}});
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

    
    componentWillReceiveProps(nextProps:TodoInputProps){
        let notEquals = complement(equals);
        let { open } = this.state;
        let closed = not(open);

        if(notEquals(nextProps.todo, this.props.todo) && closed){
           let {attachedDate,deadline,category,checklist,title,note} = nextProps.todo;
           this.setState({attachedDate, deadline, category, checklist, title, note});
        }
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


  
    onClose = () => {
        let {dispatch,onClose,todo} = this.props;
        let {attachedDate,deadline,category,title,note,checklist} = this.state;
        this.update({attachedDate,deadline,category,title,note,checklist});

        if(isFunction(onClose)){ onClose() } 
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
        .then((e) => console.log(`Todo completed`))  
        .catch(err => this.onError(err));
    };



    onError = (error) => globalErrorHandler(error);



    componentDidMount(){   
        let { todo, selectedTodo } = this.props;


        if(isNotNil(selectedTodo) && selectedTodo._id===todo._id){ 
            this.updateState({open:true})
            .then(
                () => isNil(this.ref) ? null : this.ref.scrollIntoView()
            )
        };


        this.subscriptions.push(
            Observable
            .fromEvent(window,"click") 
            .subscribe(this.onOutsideClick),
            
            Observable
            .fromEvent(window,"beforeunload")
            .do(() => console.log('unload'))
            .subscribe(this.saveOnUnmount)
        ); 
    };        
 


    componentWillUnmount(){
        this.saveOnUnmount();
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = []; 
    }; 



    saveOnUnmount = () => {
        let {dispatch,todo} = this.props;
        let {attachedDate,deadline,category,title,note,checklist} = this.state;
        let shouldSave = false;

        if(
            any(
                (t:boolean) => t,
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
        let { todo, selectedTodo } = this.props;

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
        let {dispatch, onOpen} = this.props;

        if(not(open)){    
           this.setState({open:true, showAdditionalTags:false}, () => isFunction(onOpen) ? onOpen() : null);   
           dispatch({type:"showRepeatPopup", load:false});
           dispatch({type:"showRightClickMenu", load:false});
        };   
    };  



    onTitleChange = (event) : void => this.updateState({title:event.target.value});
    


    onNoteChange = (event) : void => this.updateState({note:event.target.value});
    


    updateChecklist = (checklist:ChecklistItem[]) : void => this.updateState({checklist});



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


  
    render(){   
        let {selectedCategory, id, rootRef, todo} = this.props; 
        let { 
            open,showChecklist,showDateCalendar,animatingSlideAway,showTags, 
            category,deadline,checklist,attachedDate,title,note
        } = this.state;

        
        let relatedProjectName = this.getRelatedProjectName();
        let canRepeat = isNil(todo.group); 

        let flagColor = "rgba(100,100,100,0.7)";
        let daysLeft = 0;  

        if(isDate(deadline)){      
           daysLeft = daysRemaining(deadline);        
           flagColor = daysLeft <= 1 ? "rgba(200,0,0,0.7)" : "rgba(100,100,100,0.7)";
        }     

        return <div        
            id={id}    
            onKeyDown={this.onWindowEnterPress}  
            onContextMenu={this.onRightClickMenu}
            style={{    
                marginTop:"0px", 
                marginBottom:"0px",  
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
                maxHeight:open ? "1000px" : "200px",
                boxShadow:open ? "rgba(156, 156, 156, 0.3) 0px 0px 20px" : "", 
                borderRadius:"5px"
            }}     
        >         
            <div 
                className={open ? "" : "tasklist"}
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
                    note={note} 
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
                        note={note}
                        checklist={checklist}
                        attachedTags={todo.attachedTags}
                    /> 
                }  
            </div>   
        </div>   
        {
            not(open) ? null :  
            <TodoInputLabels 
                onRemoveTodayLabel={() => {
                    let {selectedCategory, todo, dispatch} = this.props;
                    let {attachedDate} = this.state; 

                    if(isToday(deadline) && isToday(attachedDate)){
                        this
                        .updateState({category:"next", attachedDate:null, deadline:null})
                        .then(() => this.onRemoveReminderClick()); 
                    }else if(isToday(deadline)){
                        this
                        .updateState({category:"next", deadline:null})
                        .then(() => this.onRemoveReminderClick()); 
                    }else if(isToday(attachedDate)){
                        this
                        .updateState({category:"next", attachedDate:null})
                        .then(() => this.onRemoveReminderClick()); 
                    }
                }}
                onRemoveUpcomingLabel={() => {
                    let {selectedCategory, todo, dispatch} = this.props;
                    let {attachedDate} = this.state; 

                    if(isDate(deadline)){
                        this.updateState({attachedDate:null})
                        .then(() => this.onRemoveReminderClick());
                     }else{
                        this.updateState({category:"next", attachedDate:null})
                        .then(() => this.onRemoveReminderClick());
                     }
                }}
                onRemoveSomedayLabel={() => {
                    let {selectedCategory, todo, dispatch} = this.props;

                    this
                    .updateState({category:"next", attachedDate:null})
                    .then(() => this.onRemoveReminderClick()); 
                }}
                onRemoveDeadlineLabel={() => {
                    let {deadline,attachedDate} = this.state;

                    if(isDate(attachedDate)){
                        this.updateState({deadline:null});
                     }else{
                        this.updateState({category:"next", deadline:null});
                     }
                }}
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
            <DateCalendar 
                close = {() => this.setState({showDateCalendar:false})}
                open = {showDateCalendar}
                origin = {{vertical: "center", horizontal: "right"}} 
                point = {{vertical: "center", horizontal: "right"}}  
                anchorEl = {this.calendar}
                rootRef = {this.props.rootRef}
                reminder = {todo.reminder} 
                attachedDate = {attachedDate}
                onDayClick = {this.onCalendarDayClick}
                onSomedayClick = {(e) => {
                    e.stopPropagation();
                    this.updateState({ 
                        category:"someday",
                        deadline:null,
                        attachedDate:null,
                        showDateCalendar:false
                    });
                }}
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
                        close:(e) => this.setState({showTagsSelection:false}),
                        open:this.state.showTagsSelection,   
                        anchorEl:this.tags,
                        origin:{vertical:"center",horizontal:"right"},
                        point:{vertical:"center",horizontal:"right"},
                        rootRef:rootRef
                    } as any
                } 
            /> 
            <DeadlineCalendar  
                close={() => this.setState({showDeadlineCalendar:false})}
                onDayClick={this.onDeadlineCalendarDayClick}
                open={this.state.showDeadlineCalendar}
                origin={{vertical:"center",horizontal:"right"}} 
                point={{vertical:"center",horizontal:"right"}} 
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
    note:string, 
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
            note, 
            deadline
        } = this.props;  

        return <div 
            ref={e => {this.ref=e;}} 
            style={{display:"flex",alignItems:"flex-start",width:"100%",overflow:"hidden"}}
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
                        <div style={open ? {width:"100%"} : {minWidth:0}} key="form-field">  
                            {   
                                open ?      
                                <div> 
                                    <TextareaAutosize 
                                        placeholder="New Task"
                                        innerRef={ref => this.props.setInputRef(ref)}
                                        onChange={this.props.onTitleChange as any} 
                                        style={{
                                            resize:"none",
                                            marginTop:"-4px",
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
                                <div style={{marginTop:'-4px', cursor:"default"}}>  
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
                                                    color:"rgba(100, 100, 100, 0.7)", 
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
                                                <Alert style={{width:15,height:15,color:"rgb(200, 200, 200)"}}/>
                                                <div style={{
                                                    top:"8px",
                                                    left:"5px",
                                                    width:"5px",
                                                    height:"7px",
                                                    position:"absolute",
                                                    backgroundColor:"rgb(200, 200, 200)"
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
                                                <ChecklistIcon style={{width:15,height:15,color:"rgba(100,100,100,0.3)"}}/>
                                            </div>
                                        } 
                                        {
                                            isNil(note) || isEmpty(note) ? null :
                                            <div style={{paddingRight:"4px",height:"18px"}}>  
                                                <NotesIcon style={{width:18,height:18,paddingTop:"2px",color:"rgba(100,100,100,0.3)"}}/>  
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
}









interface TodoInputMiddleLevelProps{
    onNoteChange:Function, 
    updateChecklist:Function, 
    closeChecklist:() => void,
    closeTags:() => void,
    open:boolean,
    onAttachTag:(tag:string) => void,
    onRemoveTag:(tag:string) => void,
    showChecklist:boolean,
    showTags:boolean,
    _id:string,
    note:string,
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
            note,
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
            <div style={{display:"flex",paddingTop:"10px",paddingBottom:"10px"}}>
                <TextareaAutosize
                    id={`note-${_id}`}  
                    placeholder="Notes"
                    onChange={this.props.onNoteChange as any} 
                    style={{
                        resize:"none",
                        marginTop:"-4px",
                        width:"100%",
                        fontSize:"14px",
                        padding:"0px",
                        cursor:"default", 
                        position:"relative", 
                        border:"none",
                        outline:"none",
                        backgroundColor:"rgba(0, 0, 0, 0)",
                        color:"rgba(0, 0, 0, 0.87)" 
                    }}
                    onKeyDown={(e) => { if(e.keyCode===13){ e.stopPropagation(); } }}
                    value={note} 
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
        };


        if(isNil(completed) && showSomeday){

            return <div style={{height:"18px",marginTop:"-2px"}}>
                <BusinessCase style={{...style,color:"burlywood"}}/>
            </div>

        }else if(
            isNotNil(date) && 
            selectedCategory!=="logbook" && 
            selectedCategory!=="upcoming" &&
            selectedCategory!=="today"
        ){

            let month = getMonthName(date); 
            let day = date.getDate();  

            return isToday(date) ? 
            <div style={{height:"18px",marginTop:"-2px"}}> 
                <Star style={{...style,color:"gold"}}/> 
            </div> 
            :
            <div style={{paddingRight:"5px"}}>
                <div style={containerStyle}>     
                    <div style={{display:"flex",padding:"5px",alignItems:"center",fontSize:"11px"}}>      
                        <div style={{paddingRight:"5px"}}>{month.slice(0,3)+'.'}</div>  
                        <div>{day}</div>
                    </div> 
                </div>
            </div>  

        }else if(isNotNil(completed) && selectedCategory==="logbook"){

            let month = getMonthName(completed);
            let day = completed.getDate(); 

            return <div style={{paddingRight:"5px"}}>
                <div style={{
                    backgroundColor:"rgba(0, 0, 0,0)",
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
                          <div>Today</div> :  
                          <div style={{display:"flex",padding:"5px",alignItems:"center",fontSize:"12px"}}>    
                                <div style={{paddingRight:"5px"}}>{month.slice(0,3)+'.'}</div>  
                                <div>{day}</div>
                          </div>
                        }  
                    </div>  
                </div>
            </div> 
        }else{
            return null
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
        let {selectedCategory,groupTodos,name} = this.props;
        let disable : Category[] = groupTodos ?
                                   ["search","project","someday","today","next","area"] : 
                                   ["project","area"];
        
        if(contains(selectedCategory)(disable)){ return null }
        if(isNil(name)){ return null }    

        return <div 
            style={{ 
               paddingRight:"4px",   
               fontSize:"12px",   
               whiteSpace:"nowrap", 
               cursor:"default", 
               WebkitUserSelect:"none", 
               color:"rgba(0,0,0,0.6)"
            }}   
        > 
            {isEmpty(name) ? `New Project` : name}
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
};

 





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
 


interface AdditionalTagsProps{
    attachedTags:string[],
    open:boolean,
    rootRef:HTMLElement
}

interface AdditionalTagsState{
    showMoreTags:boolean
}

class AdditionalTags extends Component<AdditionalTagsProps,AdditionalTagsState>{
    ref:HTMLElement;

    constructor(props){
        super(props); 
        this.state={ showMoreTags:false };
    }   
    
    render(){
        let {attachedTags,open,rootRef} = this.props;
        let {showMoreTags} = this.state;

        if(isNil(attachedTags)){ return null }  
        if(isEmpty(attachedTags)){ return null }
        if(open){ return null } 

        let moreTags = attachedTags.slice(3,attachedTags.length);


        return  <Tooltip 
                size={"small"} //small regular big
                disabled={isEmpty(moreTags)}
                position="bottom"
                /*style={{ 
                    border:"1px solid rgba(200,200,200,0.5)", 
                    background:"rgba(255,255,255,1)",
                    backgroundColor:"rgba(255,255,255,1)" 
                }}*/ 
                animateFill={false}  
                transitionFlip={false}
                theme="light"   
                delay={200}
                trigger="mouseenter"
                duration={40}
                animation="fade" 
                html={ 
                    <div style={{
                        zoom:0.8, 
                        display:"flex",  
                        flexWrap:"wrap",
                        alignItems:"center",
                        justifyContent:"center", 
                        maxWidth:"150px", 
                        background:"rgba(255,255,255,1)"
                    }}>
                        { 
                            moreTags
                            .map((tag:string,index:number) => 
                                <div 
                                    key={`${tag}-${index}`} 
                                    style={{padding:"2px"}}
                                >
                                    <div style={{    
                                        height:"20px",
                                        borderRadius:"15px",
                                        display:'flex', 
                                        alignItems:"center",
                                        justifyContent:"center",  
                                        border:"1px solid rgba(200,200,200,0.5)" 
                                    }}>  
                                        <div style={{ 
                                            color:"rgba(200,200,200,1)", 
                                            fontSize:"13px", 
                                            cursor:"default",
                                            padding:"5px",   
                                            WebkitUserSelect:"none"
                                        }}> 
                                            {tag} 
                                        </div>  
                                    </div>   
                                </div>
                            ) 
                        } 
                    </div>
                }
            >
            <div 
            ref={e => {this.ref=e;}}
            style={{
                height:"25px",
                display:"flex",
                alignItems:"center",
                zIndex:1001,   
                justifyContent:"flex-start",
                zoom:0.8, 
                flexGrow:1    
            }}>
                <div   
                    style={{paddingRight:"5px",display:"flex",position:"relative",alignItems:"center"}} 
                    key={`AdditionalTags-${attachedTags[0]}`} 
                >     
                    { 
                        attachedTags
                        .slice(0,3) 
                        .map((tag:string,index:number) => 
                            <div key={`${tag}-${index}`} style={{paddingRight:"2px"}}>
                                <div style={{  
                                    height:"20px",
                                    borderRadius:"15px",
                                    display:'flex',
                                    alignItems:"center",
                                    justifyContent:"center",  
                                    border:"1px solid rgba(200,200,200,0.5)" 
                                }}>  
                                    <div style={{ 
                                        color:"rgba(200,200,200,1)", 
                                        fontSize:"13px", 
                                        cursor:"default",
                                        padding:"5px", 
                                        WebkitUserSelect:"none"
                                    }}> 
                                        {tag} 
                                    </div>  
                                </div>    
                            </div>
                        ) 
                    }  
                </div> 
            </div>
        </Tooltip>
    }
};






interface TodoInputLabelsProps{

    onRemoveTodayLabel:Function
    onRemoveSomedayLabel:Function
    onRemoveUpcomingLabel:Function
    onRemoveDeadlineLabel:Function

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
        let {
            onRemoveTodayLabel,
            onRemoveSomedayLabel,
            onRemoveUpcomingLabel,
            onRemoveDeadlineLabel,

            todayCategory,
            open,
            category,
            attachedDate,
            deadline
        } = this.props;

        return <div style={{display:"flex",flexDirection:"column",paddingLeft:"10px",paddingRight:"10px"}}>   
            {    
                not(todayCategory) ? null :
                <div style={{transition:"opacity 0.4s ease-in-out",opacity:open ? 1 : 0,paddingLeft:"5px"}}>      
                    <TodoInputLabel 
                        onRemove={onRemoveTodayLabel}
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
                        onRemove={onRemoveSomedayLabel}
                        category={category}
                        content={<div style={{marginLeft:"15px"}}>Someday</div>}  
                    />   
                </div>  
            }   
            { 
                isNil(attachedDate) || todayCategory ? null :
                <div style={{transition:"opacity 0.4s ease-in-out",opacity:open ? 1 : 0,paddingLeft:"5px"}}>    
                    <TodoInputLabel 
                        onRemove={onRemoveUpcomingLabel}
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
                <div style={{transition:"opacity 0.4s ease-in-out", opacity:open ? 1 : 0}}>
                    <TodoInputLabel  
                        onRemove={onRemoveDeadlineLabel}
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