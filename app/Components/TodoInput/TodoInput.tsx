import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron'; 
import IconButton from 'material-ui/IconButton';  
import { Component } from "react";  
import SortableContainer from '../../sortable-hoc/sortableContainer';
import SortableElement from '../../sortable-hoc/sortableElement';
import SortableHandle from '../../sortable-hoc/sortableHandle';
import {arrayMove} from '../../sortable-hoc/utils';
import { Provider, connect } from "react-redux";
import Chip from 'material-ui/Chip';  
import Star from 'material-ui/svg-icons/toggle/star';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import CheckBoxEmpty from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import CheckBox from 'material-ui/svg-icons/toggle/check-box'; 
import BusinessCase from 'material-ui/svg-icons/places/business-center';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
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
    daysLeftMark, generateTagElement, uppercase 
} from '../../utils';
import { Todo, removeTodo, updateTodo, generateId } from '../../database';
import { Checklist, ChecklistItem } from './TodoChecklist';
import { Category } from '../MainContainer'; 
import { TagsPopup, TodoTags } from './TodoTags';
import { TodoInputLabel } from './TodoInputLabel';
import { uniq, isEmpty, contains } from 'ramda';
let moment = require("moment"); 



export interface TodoInputState{
    open : boolean,
    category : Category,
    title : string,  
    note : string, 
    checked : boolean,
    completed:Date,
    reminder : Date,
    deadline : Date,
    deleted : Date,
    attachedDate : Date, 
    attachedTags : string[],
    tag : string, 
    checklist : ChecklistItem[],
    showDeadlineCalendar : boolean,
    showDateCalendar : boolean,
    showTagsSelection : boolean
}   
    

    
export interface TodoInputProps{ 
    dispatch : Function, 
    selectedCategory : Category,
    tags : string[], 
    todo : Todo,  
    rootRef : HTMLElement,  
    id : string
}   
  
  
export class TodoInput extends Component<TodoInputProps,TodoInputState>{
    
    calendar:HTMLElement; 
    deadline:HTMLElement;
    tags:HTMLElement;
    ref:HTMLElement; 
 
    constructor(props){

        super(props);  

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
            checked, 
            completed,
            reminder, 
            deadline, 
            deleted, 
            attachedDate, 
            attachedTags, 
            checklist,
            
            showDeadlineCalendar:false,
            showDateCalendar:false,
            showTagsSelection:false
        }      
    }   

    componentDidMount(){ 
         
        if(isEmpty(this.state.title))
           this.preventDragOfThisItem();
        
        window.addEventListener("click",this.onOutsideClick);
        //document.body.addEventListener("keydown",this.onWindowEnterPress);   
    }      
      
    componentWillReceiveProps(nextProps:TodoInputProps){
        if(nextProps.todo!==this.props.todo){  
           this.setState(this.stateFromTodo(this.state,nextProps.todo));  
        }
    } 
     
    componentWillUnmount(){
        window.removeEventListener("click", this.onOutsideClick);
        //document.body.removeEventListener("keydown", this.onWindowEnterPress); 
    }

    componentDidUpdate(prevProps:TodoInputProps,prevState){

        if(isEmpty(this.state.title) || this.state.open){
           this.preventDragOfThisItem();
        }else{
           this.enableDragOfThisItem()
        }
    }
 
    onWindowEnterPress = (e) => {
        if(e.keyCode == 13){
           this.collapse(); 
        }  
    }  

    onOutsideClick = (e) => {
        if(this.ref===null || this.ref===undefined)
            return; 

        let x = e.pageX;
        let y = e.pageY; 

        let inside = insideTargetArea(this.ref,x,y);
    
        if(!inside){   
            this.collapse();
        }
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
        checked : this.state.checked
    }) 

    enableDragOfThisItem = () => {
        if(this.ref)
           this.ref["preventDrag"] = false; 
    }
    
    preventDragOfThisItem = () => {
        if(this.ref)
           this.ref["preventDrag"] = true; 
    } 

    onFieldsContainerClick = (e) => {   
 
        this.props.dispatch({type:"selectedTodoId", load:this.props.todo._id});
        
        this.preventDragOfThisItem();
 
        if(!this.state.open)
            this.setState({open:true});  
    } 
    
    collapse = () => {
        if(this.state.open){
            let todo : Todo = this.todoFromState();  

            if(this.state.title.length===0 || todoChanged(this.props.todo,todo))
               this.addTodoFromInput(todo);
           
            this.props.dispatch({type:"selectedTodoId", load:null});
            this.setState({open:false}); 
        }
    }

    addTodoFromInput = (todo:Todo) : void => {

        console.log("addTodoFromInput"); 

        if(this.state.title.length===0){
            this.props.dispatch({ type:"updateTodo", load:{...todo, deleted:new Date()} });
        }else{  
            this.props.dispatch({type:"updateTodo", load:todo});  
        }     
    }  

    onAttachTag = (tag) => {
        
        if(tag.length===0) 
           return;
 
        this.setState({
            tag:'', 
            attachedTags:uniq([...this.state.attachedTags, tag])
        });
    } 

    onNoteChange = (event,newValue:string) : void => this.setState({note:newValue});

    onTitleChange = (event,newValue:string) : void => this.setState({title:newValue});
      
    onCheckBoxClick = (e) => {  
        if(!this.state.open){
            let checked : boolean = !this.state.checked; 
            this.setState( 
                { 
                    checked:checked, 
                    completed:checked ? new Date() : null
                }, 
                () => {
                    let todo : Todo = this.todoFromState();   
    
                    if(this.state.title.length===0 || todoChanged(this.props.todo,todo))
                       this.addTodoFromInput(todo);
                } 
            );  
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
                    rightClickMenuY:e.clientY-this.props.rootRef.offsetTop+this.props.rootRef.scrollTop //?
                }
            });   
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
        if(this.props.todo.checklist.length===0)
           this.setState({checklist:[{checked:false, text:'', idx:0, key: generateId()}]}); 
    }   

    onFlagButtonClick = (e) => this.setState({showDeadlineCalendar:true});

    closeDeadlineCalendar = (e) => this.setState({showDeadlineCalendar:false});
 
    onCalendarButtonClick = (e) => this.setState({showDateCalendar:true});
    
    closeDateCalendar = (e) => this.setState({showDateCalendar:false});
    
    onTagsButtonClick = (e) => this.setState({showTagsSelection:true});

    closeTagsSelection = (e) => this.setState({showTagsSelection:false});

    onDeadlineCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        let remaining = daysRemaining(day);
            
        if(remaining>=0)
           this.setState({deadline:day}); 
    };
 
    onDeadlineCalendarClear = (e:any) : void => this.setState({deadline:null}); 
    
    onCalendarDayClick = (day:Date,modifiers:Object,e:any) => 
        this.setState({
            attachedDate:day,
            category:daysRemaining(day)===0 ? "today" : this.state.category
        });   
        
    onCalendarSomedayClick = (e) => this.setState({category:"someday", attachedDate:null});

    onCalendarTodayClick = (e) => this.setState({category:"today", attachedDate:new Date()}); 

    onCalendarThisEveningClick = (e) => this.setState({category:"evening", attachedDate:new Date()});  

    onCalendarAddReminderClick = (reminder:Date) : void => this.setState({reminder, attachedDate:reminder});

    onCalendarClear = (e) => this.setState({  
        category:this.props.todo.category as Category,
        attachedDate:null, 
        reminder:null 
    })
 
    render(){  
        
        return  <div  
            id={this.props.id}   
            onKeyDown={this.onWindowEnterPress}
            onContextMenu={this.onRightClickMenu}
            style={{    
                    width:"100%",         
                    display:"flex",    
                    position:"relative", 
                    alignItems:"center",   
                    justifyContent:"center"
            }}  
        >     
   
        <div   
            onClick={(e) => {e.stopPropagation();}}
            ref={(e) => { this.ref=e; }} 
            style={{           
                    transition: "box-shadow 0.2s ease-in-out, max-height 0.2s ease-in-out, transform 0.2s ease-in-out", 
                    maxHeight:this.state.open ? "1000px" : "30px",
                    width:"100%",        
                    boxShadow:this.state.open ? "rgba(156, 156, 156, 0.3) 0px 0px 20px" : "", 
                    borderRadius:"5px", 
                    marginBottom:this.state.open ? "90px" : "10px", 
                    transform:`translateY(${this.state.open ? 40 : 0}px)`    
            }}
        >      
                <div
                    className={this.state.open ? "" : "tasklist"}
                    style={{    
                            paddingLeft:"20px", 
                            paddingRight:"20px",  
                            transition: "max-height 0.2s ease-in-out", 
                            maxHeight:this.state.open ? "1000px" : "30px",
                            paddingTop:this.state.open?"20px":"0px",
                            paddingBottom:this.state.open?"20px":"0px",
                            caretColor:"cornflowerblue",
                            display:"flex"  
                    }}
                >        
 
                    <div style={{width:"5%", paddingTop:"8px"}}>
                        <div  
                            onClick = {this.onCheckBoxClick} 
                            style={{   
                                width: "14px",
                                border: this.state.checked ? '' : "2px solid rgba(200,200,200,0.7)", 
                                borderRadius: "3px",
                                backgroundColor: this.state.checked ? "rgb(32,86,184)" : '', 
                                height: "14px",    
                                boxSizing: "border-box",   
                                display: "flex", 
                                alignItems: "center"
                        }}>   
                            { this.state.checked ? <Checked style={{color:"white"}}/> : null }
                        </div> 
                    </div>    
                    <div 
                        style={{    
                            display:"flex",
                            flexDirection:"column",
                            width:"90%", 
                            overflow:"hidden" 
                        }}    
                        onClick={this.onFieldsContainerClick}
                    >   
                        <div style={{display:"flex"}}>
                            <TextField   
                                hintText="New To-Do"   
                                id={this.props.todo._id}
                                defaultValue={this.state.title} 
                                fullWidth={true}   
                                onChange={this.onTitleChange}
                                inputStyle={{ 
                                    color:"black", 
                                    fontSize:"16px",
                                    cursor:"default"
                                }}    
                                hintStyle={{top:"3px", left:0, width:"100%", height:"100%"}}   
                                style={{height:"28px"}}      
                                underlineFocusStyle={{borderColor:"rgba(0,0,0,0)"}}    
                                underlineStyle={{borderColor:"rgba(0,0,0,0)"}}  
                            />   
                            {   
                                !this.state.deadline ? null :
                                daysLeftMark(
                                    this.state.open, 
                                    this.state.deadline, 
                                    false
                                ) 
                            }
                        </div>  
                        { 
                            !this.state.open ? null :
                            <div style={{
                                transition:"opacity 0.2s ease-in-out",
                                opacity:this.state.open ? 1 : 0
                            }}>       
                                <TextField  
                                    id={ `${this.props.todo._id}note` }
                                    defaultValue={this.state.note} 
                                    hintText="Notes"
                                    fullWidth={true}  
                                    hintStyle={{ 
                                        top: "3px",  
                                        left: 0,  
                                        width:"100%", 
                                        height:"100%"
                                    }}     
                                    onChange={this.onNoteChange}
                                    style={{
                                        height:"28px", 
                                        marginBottom:"15px", 
                                        marginTop:"15px",
                                        cursor:"default"
                                    }}    
                                    inputStyle={{
                                        fontFamily:"sans-serif",
                                        fontSize:"14px"   
                                    }} 
                                    underlineFocusStyle={{borderColor: "rgba(0,0,0,0)"}} 
                                    underlineStyle={{borderColor: "rgba(0,0,0,0)"}}   
                                />  
                                <Checklist 
                                    checklist={this.state.checklist}  
                                    updateChecklist={(checklist:ChecklistItem[]) => this.setState({checklist})} 
                                /> 
                                <TodoTags 
                                    tags={this.state.attachedTags}
                                />
                            </div>  
                        }  
                    </div>   
                </div>    

        { 
            !this.state.open ? null :  
            <div style={{display:"flex", flexDirection:"column"}}> 
                {   
                    !contains(this.state.category)(["evening","today","someday"]) ? null :
                    <div style={{
                        transition: "opacity 0.4s ease-in-out",
                        opacity:this.state.open ? 1 : 0
                    }}>    
                        <TodoInputLabel 
                            onRemove={this.onRemoveSelectedCategoryLabel}
                            category={this.state.category}
                            content={ 
                                <div style={{marginLeft:"15px"}}>
                                    { 
                                        this.state.category==="evening" ? "This Evening" :
                                        this.state.category==="today" ? "Today" :
                                        "Someday"
                                    }   
                                </div>  
                            }  
                        />   
                    </div>  
                }  
                { 
                    !this.state.attachedDate ? null :
                    <div style={{
                        transition: "opacity 0.4s ease-in-out",
                        opacity:this.state.open ? 1 : 0
                    }}>    
                        <TodoInputLabel 
                            onRemove={() => this.setState({attachedDate:null})}
                            category={"upcoming"}
                            content={ 
                                <div style={{marginLeft:"15px", color:"black"}}>
                                    When : {
                                        moment(this.state.attachedDate, 'ddd DD-MMM-YYYY, hh:mm A').format('MMMM D hh:mm A')
                                    } 
                                </div>    
                            }  
                        />    
                    </div>  
                } 
                { 
                    !this.state.deadline ? null :
 
                    <div style={{
                        transition : "opacity 0.4s ease-in-out",
                        opacity : this.state.open ? 1 : 0
                    }}>
                        <TodoInputLabel  
                            onRemove={() => this.setState({deadline:null})}
                            category={"deadline"} 
                            content={ 
                                <div style={{marginLeft:"15px", color:"black"}}>
                                    Deadline: {moment(this.state.deadline).format('MMMM D')}
                                </div>
                            }
                        />     
                    </div>  
                } 
            </div>
        } 
        {        
            !this.state.open ? null :
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                bottom: 0, 
                padding: "5px", 
                right: 0,
                zIndex:30001   
            }}>   

                <DateCalendar 
                    close={this.closeDateCalendar}
                    open={this.state.showDateCalendar}
                    origin = {{vertical: "center", horizontal: "right"}} 
                    point = {{vertical: "center", horizontal: "right"}}  
                    anchorEl={this.calendar}
                    rootRef = {this.props.rootRef}
                    reminder={this.state.reminder} 
                    attachedDate={this.state.attachedDate}
                    onDayClick = {this.onCalendarDayClick}
                    onSomedayClick = {this.onCalendarSomedayClick}
                    onTodayClick = {this.onCalendarTodayClick}
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

            {     
                <div ref={(e) => { this.calendar=e; }}>  
                    <IconButton 
                    onClick = {this.onCalendarButtonClick} 
                    iconStyle={{  
                        transition: "opacity 0.2s ease-in-out",
                        opacity: this.state.open ? 1 : 0,
                        color:"rgb(207,206,207)",
                        width:"25px",   
                        height:"25px"  
                    }}>      
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
                            width:"25px",  
                            height:"25px" 
                        }} 
                    >         
                        <TriangleLabel />
                    </IconButton>    
                </div>
            }
            {   
                <IconButton      
                    onClick = {this.onChecklistButtonClick}
                    iconStyle={{ 
                        transition: "opacity 0.2s ease-in-out",
                        opacity: this.state.open ? 1 : 0,
                        color:"rgb(207,206,207)",
                        width:"25px", 
                        height:"25px" 
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
                            width:"25px", 
                            height:"25px" 
                        }}
                    >     
                        <Flag />  
                    </IconButton> 
                </div> 
            }         
            </div>   
        }    
        </div>
        </div> 
        
    } 
}   
  
 

 