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
    insideTargetArea, daysRemaining, todoChanged, 
    daysLeftMark, generateTagElement, uppercase, generateEmptyTodo,  
    isToday, getMonthName, stringToLength, debounce 
} from '../../utils'; 
import { Todo, removeTodo, updateTodo, Project, generateId } from '../../database';
import { Checklist, ChecklistItem } from './TodoChecklist';
import { Category } from '../MainContainer'; 
import { TagsPopup, TodoTags } from './TodoTags';
import { TodoInputLabel } from './TodoInputLabel'; 
import { uniq, isEmpty, contains, isNil, not, multiply, remove } from 'ramda';
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
import { googleAnalytics, globalErrorHandler } from '../../app';
  

export interface TodoInputState{  
    open : boolean,
    category : Category,
    title : string,  
    note : string, 
    checked : boolean,
    completed : Date,
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
  
    
export interface TodoInputProps{ 
    dispatch : Function,  
    selectedCategory : Category,
    tags : string[],  
    selectedProjectId:string,
    selectedAreaId:string,
    todos:Todo[],
    projects : Project[], 
    todo : Todo,  
    rootRef : HTMLElement,  
    id : string, 
    creation? : boolean
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
         
        let {
            category, 
            title,  
            note, 
            checked,
            completed,
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
            checked, 
            completed,
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

    onError = (error) => globalErrorHandler(error);
    
    componentDidMount(){  
        let click = Observable.fromEvent(window,"click").subscribe(this.onOutsideClick); 
        this.subscriptions.push(click);
    }          
 

    componentDidUpdate(prevProps:TodoInputProps,prevState:TodoInputState){
        let { title, open } = this.state; 

        if(this.inputRef && isEmpty(title) && open){ this.inputRef.focus() } 

        if(isEmpty(title) || open){ this.preventDragOfThisItem() }
        else{ this.enableDragOfThisItem() }  
    }   


    resetCreationForm = () => {
        let emptyTodo = generateEmptyTodo(generateId(), this.props.selectedCategory, 0);
        let newState = {
            ...this.stateFromTodo(this.state,emptyTodo),
            open:true, 
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
        this.preventDragOfThisItem();

        if(!this.state.open){    
            this.setState({open:true, showAdditionalTags:false});   
            this.props.dispatch({type:"showRepeatPopup", load:false});
            this.props.dispatch({type:"showRightClickMenu", load:false});
        }   
    }  
     

    onWindowEnterPress = (e) => {  
        if(e.keyCode===13){  
           if(this.props.creation && this.state.open){
              this.addTodo();
              this.resetCreationForm(); 
           }else if(this.state.open){
              this.setState({open:false}, () => this.updateTodo()); 
           }   
        }   
    }        
    

    onOutsideClick = (e) => {
        let { creation, rootRef, dispatch } = this.props;
        let { open } = this.state;

        if(this.ref===null || this.ref===undefined){ return }

        if(not(open)){ return }

        let x = e.pageX;
        let y = e.pageY; 

        let inside = insideTargetArea(rootRef,this.ref,x,y);
     
        if(!inside){  
            this.setState({open:false}, () => {
                if(creation){
                    this.addTodo();
                }else{
                    this.updateTodo();
                } 
            }); 
        }   
    }    
    
       
    componentWillReceiveProps(nextProps:TodoInputProps,nextState){
        if(nextProps.todo!==this.props.todo){  
           this.setState(this.stateFromTodo(this.state,nextProps.todo));  
        }
    }    


    updateTodo = () => { 
        let todo : Todo = this.todoFromState();  

        if(todoChanged(this.props.todo,todo)){
           this.props.dispatch({type:"updateTodo", load:todo});  
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
        if(!this.props.creation){
            this.updateTodo();
        }  
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = []; 
    } 

  
    stateFromTodo = (state:TodoInputState,todo:Todo) : TodoInputState => ({   
        ...state,
        category:todo.category, 
        title:todo.title,
        note:todo.note,  
        checked:todo.checked, 
        completed:todo.completed,
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
        completed : this.state.completed, 
        checked : this.state.checked,

        group:this.props.todo.group   
    }) 


    animateScroll = (elem:HTMLElement,inc:number,to:number) => {
        if( (elem.scrollTop+inc) >= to ){
           elem.scrollTop = to;  
        }else{
           elem.scrollTop = elem.scrollTop + inc;
           requestAnimationFrame(() => this.animateScroll(elem,inc,to)); 
        }
    }
     

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


    onAttachTag = (tag) => {
        
        if(tag.length===0) 
           return;
 
        this.setState({tag:'', attachedTags:uniq([...this.state.attachedTags, tag])})
    } 


    onRemoveTag = (tag) => {

        let {attachedTags} = this.state;
        
        if(tag.length===0){ return } 
        
        let idx = attachedTags.findIndex( v => v===tag );
 
        if(idx===-1){ return }

        this.setState({attachedTags:remove(idx,1,attachedTags)})
    } 


    onNoteChange = (event,newValue:string) : void => this.setState({note:newValue})


    onTitleChange = (event) :void => this.setState({title:event.target.value})
    

    animateSlideAway = () : Promise<void> => new Promise(resolve => {
        let step = () => {
            let translateX = this.state.translateX-30;
            let opacity = 1 - (translateX/100); 
            this.setState(
                {translateX,opacity},
                () =>   
                        this.state.translateX<=-100 ?
                        this.setState(
                            {display:"none"}, 
                            () => resolve()
                        ) :
                        requestAnimationFrame(step)
            ); 
        } 
            
        step();  
    }) 
      
     
  
    onCheckBoxClick = () => {   
            let { selectedCategory, creation } = this.props;
            let { checked, open } = this.state;
            let shouldAnimateSlideAway = not(checked) && 
                                         selectedCategory!=="logbook" &&  
                                         selectedCategory!=="trash" &&
                                         selectedCategory!=="search"; 
                
            if(not(creation)){
                let isChecked : boolean = !checked; 
                let timeSeconds = Math.round( (new Date().getTime()) / 1000 );

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
                .catch(err => this.onError(err))
                
                this.setState(    
                    { 
                      checked:isChecked,  
                      completed:isChecked ? new Date() : null
                    },  
                    () => setTimeout(   
                        () => shouldAnimateSlideAway ?   
                              this
                              .animateSlideAway()
                              .then(() => setTimeout(() => this.updateTodo(), 0)) : 
                              this.updateTodo() 
                        , 
                        30
                    )
                )  
            }   
    }
    
    
    
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
        let remaining = daysRemaining(day);
        e.stopPropagation();
        if(remaining>=0){
           this.setState({deadline:day})
        }
    }

 
    onDeadlineCalendarClear = (e:any) : void => {
        e.stopPropagation();
        this.setState({deadline:null})
    }
    

    onCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        e.stopPropagation(); 
        let {creation} = this.props; 
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


    onCalendarAddReminderClick = (reminder:Date) : void => this.setState({reminder, attachedDate:reminder})


    onCalendarClear = (e) => {
        e.stopPropagation();
        this.setState({  
            category:this.props.todo.category as Category,
            attachedDate:null, 
            reminder:null  
        }) 
    }
  

    onRestoreButtonClick = debounce(() => {
        this.setState( 
            {deleted:undefined}, 
            () => this.updateTodo()  
        )    
    },50)
     

    onRepeatTodo = (top:number, left:number) => {   
        let {rootRef} = this.props;
        let containerClientRect = rootRef.getBoundingClientRect();
        let repeatTodo : Todo = this.todoFromState();   

        this.props.dispatch({
            type : "openRepeatPopup",
            load : { 
              showRepeatPopup : true, 
              repeatTodo, 
              repeatPopupX : left - containerClientRect.left,    
              repeatPopupY : top + rootRef.scrollTop 
            }    
        });  
    }

    
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
    } 

  
    render(){  
        let {
            open, deleted, checked, 
            attachedDate, title, showAdditionalTags, 
            attachedTags, note, deadline, showChecklist,
            checklist, category, completed   
        } = this.state;
  
        let {selectedCategory, id, todo, creation} = this.props; 

        
        let todayCategory : boolean = category==="evening" || category==="today";   
        let relatedProjectName = this.getRelatedProjectName();
        let removePadding = isNil(relatedProjectName) || selectedCategory==="project";
        let padding = open ? "20px" : removePadding ? "0px" : "5px";  


        let daysLeft = 0;
        let flagColor = "rgba(100,100,100,0.7)";


        if(!isNil(deadline)){      
            daysLeft = daysRemaining(deadline);        
            flagColor = daysLeft <= 1 ? "rgba(200,0,0,0.7)" : "rgba(100,100,100,0.7)";
        }        
        
        let canRepeat = not(creation) && isNil(todo.group); 
 
        return  <div       
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
                    paddingTop:padding,
                    paddingBottom:padding, 
                    caretColor:"cornflowerblue",   
                    display:"flex"
                }}        
                onClick={this.onFieldsContainerClick} 
            >          
            <div style={{display:"flex", flexDirection:"column",  padding:"2px", width:"100%"}}>
                <TodoInputTopLevel 
                    onAdditionalTagsHover={(e) => this.setState({showAdditionalTags:true})}
                    onAdditionalTagsOut={(e) => this.setState({showAdditionalTags:false})}
                    onAdditionalTagsPress={(e) => this.setState({showAdditionalTags:false})} 
                    setInputRef={e => {this.inputRef=e;}}
                    onRestoreButtonClick={this.onRestoreButtonClick}
                    onCheckBoxClick={this.onCheckBoxClick}
                    onTitleChange={this.onTitleChange}
                    open={open}
                    deleted={deleted} 
                    rootRef={this.props.rootRef} 
                    completed={completed}
                    checked={checked}
                    category={category}
                    attachedDate={attachedDate}
                    selectedCategory={selectedCategory}
                    todo={todo}
                    title={title}
                    attachedTags={attachedTags}
                    showAdditionalTags={showAdditionalTags}
                    relatedProjectName={relatedProjectName}
                    deadline={deadline}
                    flagColor={flagColor}   
                />  
                {    
                    not(open) ? null :    
                    <TodoInputMiddleLevel 
                        onNoteChange={this.onNoteChange}
                        onAttachTag={this.onAttachTag}
                        onRemoveTag={this.onRemoveTag}
                        updateChecklist={(checklist:ChecklistItem[]) => this.setState({checklist})}
                        open={open} 
                        note={note} 
                        showChecklist={showChecklist}
                        todo={todo}
                        checklist={checklist}
                        attachedTags={attachedTags} 
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
                open = {this.state.showDateCalendar}
                origin = {{vertical: "center", horizontal: "right"}} 
                point = {{vertical: "center", horizontal: "right"}}  
                anchorEl = {this.calendar}
                rootRef = {this.props.rootRef}
                reminder = {this.state.reminder} 
                attachedDate = {this.state.attachedDate}
                onDayClick = {this.onCalendarDayClick}
                onSomedayClick = {this.onCalendarSomedayClick}
                onTodayClick = {this.onCalendarTodayClick} 
                onRepeatTodo = {canRepeat ? this.onRepeatTodo : null}
                onThisEveningClick = {this.onCalendarThisEveningClick}
                onAddReminderClick = {this.onCalendarAddReminderClick}
                onClear = {this.onCalendarClear}  
            />  
            <TagsPopup  
                tags = {this.props.tags}
                attachTag = {this.onAttachTag}
                close = {this.closeTagsSelection}
                open = {this.state.showTagsSelection}   
                anchorEl = {this.tags} 
                origin = {{vertical: "center", horizontal: "right"}} 
                point = {{vertical: "center", horizontal: "right"}}
                rootRef = {this.props.rootRef}
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
  
  

 
interface TransparentTagProps{
    tag:string 
}

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
    selectedCategory:Category 
} 
 
interface RelatedProjectLabelState{}

class RelatedProjectLabel extends Component<RelatedProjectLabelProps,RelatedProjectLabelState>{

    
    render(){



        if(this.props.selectedCategory==="project")
           return null;
        
        if(this.props.selectedCategory==="next")
           return null;  

        if(this.props.selectedCategory==="area")
           return null;     

        if(isNil(this.props.name)){
           return null;
        }    

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










interface TodoInputTopLevelProps{
    onAdditionalTagsHover:Function,
    onAdditionalTagsOut:Function, 
    onAdditionalTagsPress:Function, 
    setInputRef:(e:any) => void  
    onRestoreButtonClick:Function,
    onCheckBoxClick:Function,
    onTitleChange:Function, 
    completed:Date,
    open:boolean,
    deleted:Date,
    checked:boolean,
    category:Category,
    attachedDate:Date,
    selectedCategory:Category,
    todo:Todo,
    title:string,
    attachedTags:string[],
    showAdditionalTags:boolean,
    relatedProjectName:string,
    deadline:Date,
    rootRef:HTMLElement,
    flagColor:string   
}


interface TodoInputTopLevelState{
    overflow : boolean 
}


class TodoInputTopLevel extends Component <TodoInputTopLevelProps,TodoInputTopLevelState>{

    ref:HTMLElement; 
    inputRef:HTMLElement;
    labelRef:HTMLElement;
    ro:ResizeObserver;

    constructor(props){
        super(props);
        this.state={
            overflow:false
        }
    } 

     
    initRo = () => { 
        this.ro = new ResizeObserver( 
            (entries, observer) => { 
                const {left, top, width, height} = entries[0].contentRect;
                if(
                    isNil(this.inputRef) ||
                    isNil(this.ref) 
                ){ 
                    return
                }

                let container = this.ref.getBoundingClientRect();
                let input = this.inputRef.getBoundingClientRect();
                let threshold = (container.width/100) * 50;
 
                if( 
                    input.width>threshold 
                ){
                   this.setState({overflow:true}); 
                }else{    
                   this.setState({overflow:false}); 
                }    
            }      
        );         
            
        this.ro.observe(this.ref);    
    }

     
    suspendRo = () => { 
        this.ro.disconnect();
        this.ro = undefined;
    }


    componentDidMount(){
        this.initRo();
    }  


    componentWillUnmount(){
        this.suspendRo(); 
    } 

 
    render(){

        let {
            open,
            deleted,
            checked,
            category,
            completed, 
            attachedDate,
            selectedCategory,
            todo,
            title,
            attachedTags,
            showAdditionalTags,
            relatedProjectName,
            deadline, 
            flagColor,  
            rootRef
        } = this.props;

 
        return <div  
            ref={(e) => {this.ref=e;}} 
            style={{display:"flex", flexDirection:"column"}}  
        >  
            <div style={{
              display:"flex",    
              alignItems:this.state.overflow ? "flex-start" : "center", 
              flexDirection:this.state.overflow ? "column" : "row",
              overflow: this.state.overflow ? "hidden" : "visible"
            }}>    
                <div  
                  ref={(e) => {this.inputRef=e;}}
                  style={{display:"flex", alignItems:"center"}}  
                >
                    {
                        isNil(deleted) ? null :      
                        <div
                            onClick={(e) => {e.stopPropagation();}} 
                            onMouseUp={(e) => {e.stopPropagation();}} 
                            onMouseDown={(e) => {e.stopPropagation();}} 
                        > 
                            <RestoreButton  
                                deleted={not(isNil(deleted))}
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
                          checked={checked}  
                          onClick={this.props.onCheckBoxClick}
                        />
                    </div>   
                    {
                        open ? null :       
                        <DueDate  
                            category={category} 
                            date={attachedDate} 
                            completed={completed} 
                            selectedCategory={selectedCategory}
                        />
                    } 
                    {   
                        isNil(todo.group) ? null :
                        <div 
                          style={{
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center"
                          }}
                        > 
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
                    <div ref={this.props.setInputRef}>     
                        <AutosizeInput   
                            type="text"
                            name="form-field-name"   
                            style={{
                                display:"flex", 
                                alignItems:"center",      
                                cursor:"default"  
                            }}            
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
                            onChange={this.props.onTitleChange} 
                        /> 
                    </div>
                </div> 
                {   
                    open ? null :
                    <div style={{
                        height:"25px",
                        display:"flex",
                        alignItems:"center",
                        zIndex:1001,   
                        justifyContent:this.state.overflow ? "flex-start" : "space-between",
                        zoom:this.state.overflow ? 0.8 : 1, 
                        flexGrow:1   
                    }}>        
                        {  
                            isEmpty(attachedTags) ? null :
                            <AdditionalTags   
                                attachedTags={attachedTags}      
                                showAdditionalTags={this.state.overflow ? false : showAdditionalTags}
                                open={open}  
                                onMouseOver={this.props.onAdditionalTagsHover as any}
                                onMouseOut={this.props.onAdditionalTagsOut as any} 
                                onMouseDown={this.props.onAdditionalTagsPress as any}  
                            />   
                        } 
                        {    
                            isNil(deadline) ? null :   
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
                                    <Flag style={{          
                                        color:flagColor, 
                                        cursor:"default",  
                                        width:16, 
                                        height:16
                                    }}/>      
                                </div>   
                                {daysLeftMark(open, deadline)}
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
    note:string, 
    onAttachTag:(tag:string) => void,
    onRemoveTag:(tag:string) => void,
    showChecklist:boolean, 
    todo:Todo,
    checklist:ChecklistItem[],
    attachedTags:string[] 
} 

interface TodoInputMiddleLevelState{}
 
class TodoInputMiddleLevel extends Component<TodoInputMiddleLevelProps,TodoInputMiddleLevelState>{
    
    constructor(props){
        super(props);
    }

    render(){

        let { 
            open,
            note, 
            showChecklist,
            todo,
            checklist,
            attachedTags,
            onAttachTag,
            onRemoveTag
        } = this.props;

        return  <div style={{ 
            transition:"opacity 0.2s ease-in-out", 
            opacity:open ? 1 : 0, 
            paddingLeft:"25px", 
            paddingRight:"25px"  
        }}>    
            <TextField   
                id={`${todo._id}note`}  
                value={note} 
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
                    checklist={checklist}  
                    updateChecklist={this.props.updateChecklist as any} 
                />  
                </div>
            }   
            { 
                isEmpty(attachedTags) ? null : 
                <TodoTags 
                    attachTag={onAttachTag} 
                    removeTag={onRemoveTag}
                    tags={attachedTags}
                /> 
            } 
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
 
 
class TodoInputLabels extends Component<TodoInputLabelsProps,TodoInputLabelsState>{

    constructor(props){
        super(props);
    }


    render(){ 

        let {
            todayCategory,
            open,
            category,
            attachedDate,
            deadline
        } = this.props;

        return <div style={{
                display:"flex", 
                flexDirection:"column", 
                paddingLeft:"10px", 
                paddingRight:"10px"
            }}>   
                {    
                    not(todayCategory) ? null :
                    <div style={{ 
                        transition:"opacity 0.4s ease-in-out",
                        opacity:open ? 1 : 0,
                        paddingLeft:"5px"  
                    }}>      
                        <TodoInputLabel 
                            onRemove={this.props.onRemoveSelectedCategoryLabel}
                            category={category}
                            content={ 
                             <div style={{marginLeft:"15px"}}>
                                 { category==="evening" ? "This Evening" : "Today" }   
                             </div>   
                            }  
                        />   
                    </div>  
                }  
                {   
                    category!=="someday" ? null :
                    <div style={{ 
                        transition:"opacity 0.4s ease-in-out",
                        opacity:open ? 1 : 0,
                        paddingLeft:"5px"  
                    }}>      
                        <TodoInputLabel 
                            onRemove={this.props.onRemoveSelectedCategoryLabel}
                            category={category}
                            content={ 
                                <div style={{marginLeft:"15px"}}>
                                    {"Someday"}   
                                </div>   
                            }  
                        />   
                    </div>  
                }   
                { 
                    isNil(attachedDate) || todayCategory ? null :
                    <div style={{
                        transition: "opacity 0.4s ease-in-out",
                        opacity:open ? 1 : 0
                    }}>    
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
                    <div style={{
                        transition : "opacity 0.4s ease-in-out",
                        opacity : open ? 1 : 0
                    }}>
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