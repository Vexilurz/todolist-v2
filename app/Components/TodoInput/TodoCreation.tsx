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
    todoChanged, daysLeftMark, generateTagElement,  
    isToday, getMonthName, debounce, fiveMinutesLater, 
    onHourLater, oneDayAhead 
} from '../../utils/utils'; 
import { Todo, removeTodo, updateTodo, Project } from '../../database';
import { Checklist, ChecklistItem } from './TodoChecklist';
import { Category } from '../MainContainer'; 
import { TagsPopup, TodoTags } from './TodoTags';
import { TodoInputLabel } from './TodoInputLabel'; 
import { uniq, isEmpty, contains, isNil, not, multiply, remove, cond, equals } from 'ramda';
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
import { TodoInputLabels, TodoInputTopLevel, TodoInputMiddleLevel } from './TodoInput';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { generateEmptyTodo } from '../../utils/generateEmptyTodo';
import { generateId } from '../../utils/generateId';
import { insideTargetArea } from '../../utils/insideTargetArea';
import { googleAnalytics } from '../../analytics';
  

export interface TodoCreationFormState{  
    open : boolean,
    category : Category,
    title : string,  
    note : string,
    completedWhen : Date,
    completedSet : Date,
    reminder : Date,
    deadline : Date,
    deleted : Date,
    attachedDate : Date,  
    attachedTags : string[],
    tag : string, 
    translateX : number,
    display : string,
    opacity:number,
    checklist : ChecklistItem[],
    showAdditionalTags : boolean, 
    showDateCalendar : boolean,  
    showTagsSelection : boolean,
    showChecklist : boolean,   
    showDeadlineCalendar : boolean
}   
  
    
export interface TodoCreationFormProps{ 
    dispatch:Function,  
    selectedCategory:Category, 
    selectedProjectId:string,
    selectedAreaId:string,
    todos:Todo[],
    projects:Project[], 
    todo:Todo,  
    rootRef:HTMLElement
}    
  
  
export class TodoCreationForm extends Component<TodoCreationFormProps,TodoCreationFormState>{
    
    calendar:HTMLElement; 
    deadline:HTMLElement;
    tags:HTMLElement;
    ref:HTMLElement; 
    inputRef:HTMLElement; 
    subscriptions:Subscription[]; 
 

    constructor(props){

        super(props);  

        this.subscriptions = [];
         
        let {
            category, 
            title,  
            note, 
            completedWhen,
            completedSet,
            reminder,
            deadline,
            deleted,
            attachedDate, 
            attachedTags, 
            checklist 
        } = this.props.todo;

        this.state={   
            open : false,
            tag : '',
            category, 
            title,
            note,  
            display:"flex",
            translateX:0,
            opacity:1,
            completedWhen,
            completedSet,
            reminder, 
            deadline, 
            deleted, 
            attachedDate, 
            attachedTags, 
            checklist, 
            showAdditionalTags : false, 
            showDateCalendar : false,  
            showTagsSelection : false, 
            showChecklist : checklist.length>0,  
            showDeadlineCalendar : false
        }       
    }

    shouldComponentUpdate(nextProps:TodoCreationFormProps,nextState:TodoCreationFormState){

        let {todo,selectedCategory,selectedProjectId,selectedAreaId} = this.props;

        if(!equals(this.state,nextState)){ 
            return true;
        }

        if(selectedCategory!==nextProps.selectedCategory){
            return true;
        }

        if(selectedProjectId!==nextProps.selectedProjectId){
            return true; 
        }

        if(selectedAreaId!==nextProps.selectedAreaId){
            return true;
        }

        return false;
    }


    onError = (error) => globalErrorHandler(error);
    

    componentDidMount(){  
        let click = Observable.fromEvent(window,"click").subscribe(this.onOutsideClick); 
        this.subscriptions.push(click);
        this.resetCreationForm(false);
        this.preventDragOfThisItem(); 
    }          
 

    componentDidUpdate(prevProps:TodoCreationFormProps,prevState:TodoCreationFormState){
        let { title, open } = this.state; 
        if(this.inputRef && isEmpty(title) && open){ this.inputRef.focus() } 
        this.preventDragOfThisItem(); 
    }   


    resetCreationForm = (open) => {
        let emptyTodo = generateEmptyTodo(generateId(), this.props.selectedCategory, 0);
        let newState = {
            ...this.stateFromTodo(this.state,emptyTodo as any),
            open, 
            showDateCalendar:false,     
            showTagsSelection:false, 
            showAdditionalTags:false, 
            showChecklist:false,   
            showDeadlineCalendar:false 
        };
        this.setState(newState);     
    }   
 

    onFieldsContainerClick = (e) => {    
        e.stopPropagation();     
        let {open} = this.state;
        this.preventDragOfThisItem();

        if(not(open)){    
            this.setState({open:true, showAdditionalTags:false});   
            this.props.dispatch({type:"showRepeatPopup", load:false});
            this.props.dispatch({type:"showRightClickMenu", load:false});
        }   
    }  
     

    onWindowEnterPress = (e) => {   
        if(e.keyCode===13 && this.state.open){
            this.addTodo();
            this.resetCreationForm(true);
        }
    }        
    

    onOutsideClick = (e) => {
        let { rootRef, dispatch } = this.props;
        let { open } = this.state;

        if(isNil(this.ref)){ return }
        if(not(open)){ return }

        let x = e.pageX;
        let y = e.pageY; 

        let inside = insideTargetArea(rootRef,this.ref,x,y);
     
        if(!inside){  
            this.setState(
                {open:false}, 
                () => {
                   this.addTodo(); 
                   this.resetCreationForm(false); 
                }
            ); 
        }   
    }    


    addTodo = () => {
        let todo : Todo = this.todoFromState();  

        if(!isEmpty(todo.title)){
            let timeSeconds = Math.round(new Date().getTime() / 1000);

            googleAnalytics.send(  
                'event', 
                { 
                   ec:'TodoCreation', 
                   ea:`Todo Created ${new Date().toString()}`, 
                   el:'Todo Created', 
                   ev:timeSeconds 
                }
            )  
            .then(() => console.log('Todo created')) 
            .catch(err => this.onError(err)); 
    
            let todos = [...this.props.todos].sort((a:Todo,b:Todo) => a.priority-b.priority);
        
            if(!isEmpty(todos)){ 
                todo.priority = todos[0].priority - 1;
            }  
            
            if(
                this.props.selectedCategory==="today" || 
                this.props.selectedCategory==="evening"
            ){
                todo = {...todo, attachedDate:new Date()}; 
            }
            
            this.props.dispatch({type:"addTodo", load:todo}); 

            if(this.props.selectedCategory==="project"){ 

                this.props.dispatch({ 
                    type:"attachTodoToProject", 
                    load:{ projectId:this.props.selectedProjectId, todoId:todo._id }
                });    
            }else if(this.props.selectedCategory==="area"){
            
                this.props.dispatch({
                    type:"attachTodoToArea", 
                    load:{ areaId:this.props.selectedAreaId, todoId:todo._id }
                });  
            }
        }
    }  


    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = []; 
    } 

  
    stateFromTodo = (state:TodoCreationFormState,todo:Todo) : TodoCreationFormState => ({   
        ...state,
        category:todo.category, 
        title:todo.title,
        note:todo.note,  
        completedWhen:todo.completedWhen,
        completedSet:todo.completedSet,
        reminder:todo.reminder, 
        deadline:todo.deadline, 
        deleted:todo.deleted, 
        attachedDate:todo.attachedDate, 
        attachedTags:todo.attachedTags, 
        checklist:todo.checklist  
    }) 
    

    todoFromState = () : Todo => ({
        _id : this.props.todo._id,
        category : this.state.category, 
        type : "todo",
        title : this.state.title,
        priority : this.props.todo.priority,
        note : this.state.note,  
        checklist : this.state.checklist,
        reminder : this.state.reminder,  
        deadline : this.state.deadline,
        created : this.props.todo.created,
        deleted : this.state.deleted, 
        attachedDate : this.state.attachedDate,  
        attachedTags : this.state.attachedTags, 
        completedWhen:this.state.completedWhen,
        completedSet:this.state.completedSet,
        group:this.props.todo.group   
    }) 
     

    enableDragOfThisItem = () => {
        if(this.ref){
           this.ref["preventDrag"] = false;  
        }
    }

    
    preventDragOfThisItem = () => {
        if(this.ref){
           this.ref["preventDrag"] = true; 
        }
    } 

    onAttachTag = (tag:string) => {
        if(isEmpty(tag)){ return };
        this.setState({tag:'', attachedTags:uniq([...this.state.attachedTags, tag])});
    } 

    onRemoveTag = (tag:string) => {
        let {attachedTags} = this.state;
        if(tag.length===0){ return } 
        let idx = attachedTags.findIndex( v => v===tag );
        if(idx===-1){ return }
        this.setState({attachedTags:remove(idx,1,attachedTags)});
    } 

    onNoteChange = (event,newValue:string) : void => this.setState({note:newValue});

    onTitleChange = (event) :void => this.setState({title:event.target.value});
   
    onRightClickMenu = (e) => {  
        if(!this.state.open){
            this.props.dispatch({ 
                type:"openRightClickMenu",  
                load:{   
                   showRightClickMenu:true, 
                   rightClickedTodoId:this.props.todo._id, 
                   rightClickMenuX:e.clientX-this.props.rootRef.offsetLeft,
                   rightClickMenuY:e.clientY+this.props.rootRef.scrollTop 
                } 
            });     

            this.props.dispatch({type:"showRepeatPopup", load:false});
        }     
    }  

    
    onRemoveSelectedCategoryLabel = () => {
        if(
            this.props.selectedCategory!==this.state.category &&
            (this.state.category==="today" || this.state.category==="evening")
        ){
            this.setState({category:this.props.selectedCategory,attachedDate:null});   
        }else if( 
            this.props.selectedCategory!==this.state.category &&
            this.state.category==="someday"
        ){
            this.setState({category:this.props.selectedCategory});    
        }
    }   

 
    onChecklistButtonClick = (e) => {
        e.stopPropagation();
        this.setState({showChecklist:true});
    } 
      

    onFlagButtonClick = (e) => {
        e.stopPropagation();
        this.setState({showDeadlineCalendar:true});
    }


    closeDeadlineCalendar = () => {
        this.setState({showDeadlineCalendar:false});
    }
 

    onCalendarButtonClick = (e) => {
        e.stopPropagation();
        this.setState({showDateCalendar:true});
    }
    

    closeDateCalendar = () => {
        this.setState({showDateCalendar:false});
    }
    

    onTagsButtonClick = (e) => { 
        e.stopPropagation();
        this.setState({showTagsSelection:true});
    }   


    closeTagsSelection = (e) => {
        this.setState({showTagsSelection:false});
    }


    onDeadlineCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        e.stopPropagation();
        this.setState({deadline:day});
    }

 
    onDeadlineCalendarClear = (e:any) : void => {
        e.stopPropagation();
        this.setState({deadline:null});
    }
    

    onCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        e.stopPropagation(); 
        this.setState({attachedDate:day, category:isToday(day) ? "today" : "next"});   
    }
    

    onRemoveAttachedDateLabel = () => {
        let today = this.props.selectedCategory==="today" || 
                    this.props.selectedCategory==="evening";

        this.setState({ 
          attachedDate:null,  
          category:today ? "next" : this.props.selectedCategory
        });  
    }  
    

    onCalendarSomedayClick = (e) => {
        e.stopPropagation();
        this.setState({category:"someday", attachedDate:null});
    }


    onCalendarTodayClick = (e) => {
        e.stopPropagation();
        this.setState({category:"today", attachedDate:new Date()});
    } 


    onCalendarThisEveningClick = (e) => {
        e.stopPropagation();
        this.setState({category:"evening", attachedDate:new Date()});
    } 


    onCalendarAddReminderClick = (reminder:Date) : void => this.setState({reminder, attachedDate:reminder});


    onCalendarClear = (e) => {
        e.stopPropagation();
        this.setState({  
            category:this.props.todo.category as Category,
            attachedDate:null, 
            reminder:null  
        }) 
    }
  
  
    render(){  
        let {
            open, deleted, attachedDate, title, showAdditionalTags, 
            attachedTags, note, deadline, showChecklist, completedWhen,
            checklist, category, completedSet, showDateCalendar   
        } = this.state;

        let {selectedCategory, todo} = this.props; 

        let todayCategory : boolean = todo.category==="evening" || todo.category==="today"; 
        let daysLeft = 0;
        let flagColor = "rgba(100,100,100,0.7)";
        let canRepeat = false; 
 
        return  <div    
            onKeyDown={this.onWindowEnterPress}  
            onContextMenu={this.onRightClickMenu}
            style={{    
                marginTop:"5px", 
                marginBottom:"5px",  
                width:"100%",   
                WebkitUserSelect:"none",
                display:this.state.display,     
                transform:`translateX(${this.state.translateX}%)`, 
                opacity:this.state.opacity,
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
                    transition: "max-height 0.2s ease-in-out", 
                    caretColor:"cornflowerblue",   
                    display:"flex"
                }}        
                onClick={this.onFieldsContainerClick}  
            >          
                <div style={{display:"flex", flexDirection:"column",  padding:"2px", width:"100%"}}>
                    <div style={{paddingTop:open ? "20px" : "0px"}}>
                        <TodoInputTopLevel 
                            onAdditionalTagsHover={(e) => this.setState({showAdditionalTags:true})}
                            onAdditionalTagsOut={(e) => this.setState({showAdditionalTags:false})}
                            onAdditionalTagsPress={(e) => this.setState({showAdditionalTags:false})} 
                            groupTodos={false}
                            setInputRef={e => {this.inputRef=e;}}
                            onRestoreButtonClick={() => {}}
                            onCheckBoxClick={() => {}}
                            onTitleChange={this.onTitleChange} 
                            open={open}
                            rootRef={this.props.rootRef} 
                            selectedCategory={selectedCategory}
                            todo={this.todoFromState()}
                            showAdditionalTags={showAdditionalTags}
                            relatedProjectName={null}
                            flagColor={flagColor}   
                        />   
                    </div>
                    {    
                        not(open) ? null :    
                        <TodoInputMiddleLevel 
                            onNoteChange={this.onNoteChange}
                            onAttachTag={this.onAttachTag}
                            onRemoveTag={this.onRemoveTag}
                            updateChecklist={(checklist:ChecklistItem[]) => this.setState({checklist})}
                            open={open} 
                            showChecklist={showChecklist}
                            todo={this.todoFromState()}
                        /> 
                    }
                </div>    
            </div>   
        {
            not(open) ? null :  
            <TodoInputLabels 
                onRemoveSelectedCategoryLabel={this.onRemoveSelectedCategoryLabel}
                onRemoveAttachedDateLabel={this.onRemoveAttachedDateLabel}
                onRemoveDeadlineLabel={() => this.setState({deadline:null})}
                todayCategory={todayCategory}
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
                            transition: "opacity 0.2s ease-in-out",
                            opacity: this.state.open ? 1 : 0,
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
                        transition: "opacity 0.2s ease-in-out",
                        opacity: this.state.open ? 1 : 0,
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
                reminder = {this.state.reminder} 
                attachedDate = {this.state.attachedDate}
                onDayClick = {this.onCalendarDayClick}
                onSomedayClick = {this.onCalendarSomedayClick}
                onTodayClick = {this.onCalendarTodayClick} 
                onRepeatTodo = {null}
                onThisEveningClick = {this.onCalendarThisEveningClick}
                onAddReminderClick = {this.onCalendarAddReminderClick}
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
                        rootRef:this.props.rootRef
                    } as any
                } 
            /> 
            <DeadlineCalendar  
                close={this.closeDeadlineCalendar}
                onDayClick={this.onDeadlineCalendarDayClick}
                open={this.state.showDeadlineCalendar}
                origin = {{vertical: "center", horizontal: "right"}} 
                point = {{vertical: "center", horizontal: "right"}} 
                anchorEl = {this.deadline}
                onClear={this.onDeadlineCalendarClear}
                rootRef = {this.props.rootRef}
            />       
            </div>   
        }     
        </div>
    </div> 
    } 
}   
  
  