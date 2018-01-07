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
    daysLeftMark, generateTagElement, uppercase, generateEmptyTodo, isToday, getMonthName, stringToLength, debounce 
} from '../../utils'; 
import { Todo, removeTodo, updateTodo, Project, generateId } from '../../database';
import { Checklist, ChecklistItem } from './TodoChecklist';
import { Category } from '../MainContainer'; 
import { TagsPopup, TodoTags } from './TodoTags';
import { TodoInputLabel } from './TodoInputLabel';
import { uniq, isEmpty, contains, isNil } from 'ramda';
import Restore from 'material-ui/svg-icons/content/undo';
let moment = require("moment"); 
import AutosizeInput from 'react-input-autosize'; 
import { isString } from 'util';


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
    selectedTodoId : string, 
    searched : boolean, 
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
            showAdditionalTags : false, 
            showDateCalendar : false,  
            showTagsSelection : false, 
            showChecklist : checklist.length>0,  
            showDeadlineCalendar : false
        }       
    }

    componentDidMount(){  
       
        if(this.props.selectedTodoId===this.props.todo._id){   
            this.setState(   
              {open:true}, 
               () => {
                    setTimeout(() => window.addEventListener("click",this.onOutsideClick), 10);
                    if(this.props.searched){   
                       this.scrollTo();  
                    }    
                }  
            )   
        }else{ 
            window.addEventListener("click", this.onOutsideClick);
        }
    }       


    componentDidUpdate(prevProps:TodoInputProps,prevState:TodoInputState){
        if(this.inputRef && isEmpty(this.state.title) && this.state.open){
           this.inputRef.focus();  
        } 

        if(isEmpty(this.state.title) || this.state.open){  
           this.preventDragOfThisItem();
        }else{
           this.enableDragOfThisItem(); 
        }  
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
 

    onFieldsContainerClick = () => {     
        this.preventDragOfThisItem();
        if(!this.state.open){ 
            this.setState({open:true,showAdditionalTags:false});   
        }   
    } 
     

    onWindowEnterPress = (e) => { 
        if(e.keyCode===13){  
            if(this.props.creation && this.state.open){
               this.addTodo();
               this.resetCreationForm(); 
            }else if(this.state.open){
               this.updateTodo();
               this.setState({open:false}, () => this.props.dispatch({type:"selectedTodoId", load:null})); 
            }   
        }   
    }      
    

    onOutsideClick = (e) => {
        if(this.ref===null || this.ref===undefined)
           return; 

        if(!this.state.open) 
           return;    

        let x = e.pageX;
        let y = e.pageY; 

        let inside = insideTargetArea(this.ref,x,y);
     
        if(!inside){   
            if(this.props.creation){
                this.addTodo();
            }else{
                this.updateTodo();
            } 
            this.setState(
                {open:false}, 
                () => this.props.dispatch({type:"selectedTodoId", load:null})
            ); 
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

            let todos = [...this.props.todos].sort((a:Todo,b:Todo) => a.priority-b.priority);
            
            if(!isEmpty(todos)){ 
                todo.priority = todos[0].priority - 1;
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
        window.removeEventListener("click",this.onOutsideClick);
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


    animateScroll = (elem:HTMLElement,inc:number,to:number) => {
        if(elem.scrollTop+inc>=to){
           elem.scrollTop=to; 
        }else{
           elem.scrollTop+=inc;
           requestAnimationFrame(() => this.animateScroll(elem,inc,to)); 
        }
    }

    
    scrollTo = () => {
        if(this.props.rootRef && this.ref){  
            let rootRef = document.getElementById("maincontainer");
            rootRef.scrollTop = 0;
            let rect = this.ref.getBoundingClientRect(); 
            let a = (rect.top + rect.height/2) - rootRef.scrollTop - window.innerHeight/2;
            this.animateScroll(rootRef, 150, rootRef.scrollTop + a); 
         }  
         this.props.dispatch({type:"searched", load:false}); 
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
 
        this.setState({tag:'', attachedTags:uniq([...this.state.attachedTags, tag])});
    } 


    onNoteChange = (event,newValue:string) : void => this.setState({note:newValue});


    onTitleChange = (event) : void => this.setState({title:event.target.value}, () => console.log(this.state.title));
     

    onCheckBoxClick = debounce(() => {   
        if(!this.state.open && !this.props.creation){ 
            let checked : boolean = !this.state.checked; 
            this.setState( 
                { 
                  checked:checked, 
                  completed:checked ? new Date() : null
                },  
                () => this.updateTodo()
            );  
        } 
    },50) 

    
    onRightClickMenu = (e) => {
        if(!this.state.open){ 
            this.props.dispatch({
                type:"openRightClickMenu",  
                load:{  
                  showRightClickMenu:true,
                  rightClickedTodoId:this.props.todo._id, 
                  rightClickMenuX:e.clientX,
                  rightClickMenuY:e.clientY
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


 
    onChecklistButtonClick = (e) => this.setState({showChecklist:true}); 
      

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
    


    onCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        this.setState({
            attachedDate:day,
            category:daysRemaining(day)===0 ? "today" : this.state.category
        });   
    };



    onRemoveAttachedDateLabel = () => {
        if(
            daysRemaining(this.state.attachedDate)===0 &&  
            (this.state.category==="today" || this.state.category==="evening") &&
            this.props.selectedCategory!=="today" &&
            this.props.selectedCategory!=="evening"
        ){
            this.setState({attachedDate:null, category:this.props.selectedCategory});
        }else{
            this.setState({attachedDate:null});  
        }
    }


    onCalendarSomedayClick = (e) => this.setState({category:"someday", attachedDate:null})


    onCalendarTodayClick = (e) => this.setState({category:"today", attachedDate:new Date()}) 


    onCalendarThisEveningClick = (e) => this.setState({category:"evening", attachedDate:new Date()}) 


    onCalendarAddReminderClick = (reminder:Date) : void => this.setState({reminder, attachedDate:reminder})


    onCalendarClear = (e) => this.setState({  
        category:this.props.todo.category as Category,
        attachedDate:null, 
        reminder:null 
    }) 
 
    onRestoreButtonClick = debounce(() => {
        this.setState( 
            {deleted:undefined}, 
            () => this.updateTodo()  
        )    
    },50)
 
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

        let relatedProjectName = this.getRelatedProjectName();
        let padding = this.state.open ? "20px" :
                      isNil(relatedProjectName) || this.props.selectedCategory==="project" ? "0px" : 
                      "5px";  
 
        return  <div    
            id={this.props.id}   
            onKeyDown={this.onWindowEnterPress}
            onContextMenu={this.onRightClickMenu}
            style={{    
                width:"100%",         
                display:"flex",    
                WebkitUserSelect:"none",
                position:"relative", 
                alignItems:"center",   
                justifyContent:"center"
            }}   
        >    
        <div    
            onClick={(e) => {e.stopPropagation();}}
            ref={(e) => { this.ref=e; }} 
            style={{           
                display:"inline-block", 
                transition: "box-shadow 0.2s ease-in-out, max-height 0.2s ease-in-out", 
                maxHeight:this.state.open ? "1000px" : "30px",
                width:"100%",        
                boxShadow:this.state.open ? "rgba(156, 156, 156, 0.3) 0px 0px 20px" : "", 
                borderRadius:"5px", 
                marginBottom:"10px" 
            }} 
        >       
            <div
                className={this.state.open ? "" : "tasklist"}
                style={{   
                    paddingLeft:"20px", 
                    paddingRight:"20px",   
                    transition: "max-height 0.2s ease-in-out", 
                    maxHeight:this.state.open ? "1000px" : "30px",
                    paddingTop:padding,
                    paddingBottom:padding,
                    caretColor:"cornflowerblue",  
                    display:"flex"
                }}    
                onClick={this.onFieldsContainerClick} 
            >     
                <div style={{display:"flex", flexDirection:"column", width:"100%", padding:"2px"}}>     
                    <div style={{display:"flex", alignItems:"center", position:"relative"}}> 
                    <div style={{display:"flex", alignItems:"center", width:"90%"}}> 
                        <RestoreButton  
                            deleted={!!this.state.deleted}
                            open={this.state.open} 
                            onClick={this.onRestoreButtonClick} 
                        />   
                        <div style={{paddingLeft:"5px", paddingRight:"5px"}}> 
                            <Checkbox checked={this.state.checked} onClick={this.onCheckBoxClick}/>
                        </div>  
                        <div style={{
                            display:"flex", 
                            flexDirection:"column",  
                            width:this.state.open ? "100%" : "50%", 
                            maxHeight:"35px" 
                        }}>     
                            <div style={{display:"flex", height:"30px", alignItems:"center", width:"100%"}}>
                                {
                                    !this.state.attachedDate ? null : 
                                    this.state.open ? null :
                                    <DueDate    
                                        month={getMonthName(this.state.attachedDate)} 
                                        date={this.state.attachedDate}
                                        day={this.state.attachedDate.getDate()} 
                                    />         
                                }  
                                <AutosizeInput     
                                    ref={e => {this.inputRef=e;}}
                                    type="text"  
                                    name="form-field-name" 
                                    minWidth={"100px"} 
                                    style={{display:"flex", alignItems:"center", width:"100%"}}  
                                    inputStyle={{         
                                        color:"black", fontSize:"16px", 
                                        cursor:"default", boxSizing:"content-box", 
                                        backgroundColor:"rgba(0,0,0,0)",
                                        border:"none", outline:"none"  
                                    }}        
                                    value={this.state.title}    
                                    placeholder="New To-Do" 
                                    onChange={this.onTitleChange}  
                                />  
                                <AdditionalTags 
                                    attachedTags={this.state.attachedTags}
                                    showAdditionalTags={this.state.showAdditionalTags}
                                    open={this.state.open} 
                                    onMouseOver={(e) => this.setState({showAdditionalTags:true})}
                                    onMouseOut={(e) => this.setState({showAdditionalTags:false})} 
                                    onMouseDown={(e) => this.setState({showAdditionalTags:false})} 
                                />
                            </div>
                            {
                                this.state.open ? null : 
                                <RelatedProjectLabel 
                                    name={relatedProjectName}
                                    selectedCategory={this.props.selectedCategory}
                                />
                            }   
                        </div>
                    </div>  
                        {    
                            !this.state.deadline ? null :  
                            <div style={{
                                display:"flex",
                                cursor:"default",
                                pointerEvents:"none",  
                                zIndex: 1000,   
                                alignItems:"center",
                                height:"100%",
                                position:"absolute",
                                top:"0px", 
                                right:"0px"    
                            }}> 
                                {daysLeftMark(this.state.open, this.state.deadline, false)}
                            </div>  
                        }   
                    </div>  
                    { 
                        !this.state.open ? null :
                        <div style={{
                            transition:"opacity 0.2s ease-in-out",
                            opacity:this.state.open ? 1 : 0,
                            paddingLeft:"25px",
                            paddingRight:"25px"  
                        }}>       
                            <TextField  
                                id={ `${this.props.todo._id}note` }
                                value={this.state.note} 
                                hintText="Notes"
                                fullWidth={true}  
                                hintStyle={{ 
                                    top: "3px",  
                                    left: 0,  
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
                            {    
                                !this.state.showChecklist ? null : 
                                <div> 
                                    <Checklist 
                                        checklist={this.state.checklist}  
                                        updateChecklist={
                                            (checklist:ChecklistItem[]) => this.setState({checklist})   
                                        } 
                                    /> 
                                </div>
                            }  
                            {  
                                this.state.attachedTags.length===0 ? null :
                                <TodoTags tags={this.state.attachedTags}/>
                            }
                        </div>  
                    }  
                    </div>   
                </div>    




        { 
            !this.state.open ? null :  
            <div style={{
                display:"flex", 
                flexDirection:"column", 
                paddingLeft:"10px", 
                paddingRight:"10px"
            }}>   
                {   
                    !contains(this.state.category)(["evening","today","someday"]) ? null :
                    <div style={{ 
                        transition:"opacity 0.4s ease-in-out",
                        opacity:this.state.open ? 1 : 0,
                        paddingLeft:"5px"  
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
                            onRemove={this.onRemoveAttachedDateLabel}
                            category={"upcoming"}
                            content={ 
                                <div style={{marginLeft:"15px", color:"black"}}>
                                    When : {moment(this.state.attachedDate).format('MMMM D')} 
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
                this.state.showChecklist ? null :     
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
  
 

 
interface TransparentTagProps{
    tag:string 
}

class TransparentTag extends Component<any,any>{
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
    month:string,
    day:number
}
 
class DueDate extends Component<DueDateProps,{}>{
    render(){   
        return daysRemaining(this.props.date)===0 ?    
        <Star  
            style={{    
                width:"18px",  
                height:"18px",
                marginLeft:"3px",
                color:"gold", 
                cursor:"default",
                marginRight:"5px" 
            }}
        />  
        : 
        <div style={{paddingRight:"5px"}}>
            <div style={{  
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
                height:"20px" 
            }}>    
                <div style={{ 
                    display:"flex",   
                    padding:"5px",
                    alignItems:"center", 
                    fontSize:"12px"
                }}>      
                    <div style={{paddingRight:"5px"}}>
                        {this.props.month.slice(0,3)+'.'}
                    </div>  
                    <div>  
                        {this.props.day}
                    </div>
                </div> 
            </div>
        </div> 
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

        if(isNil(this.props.name)){
           return null;
        }    

        return <div 
            style={{ 
              fontSize:"12px",  
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

    constructor(props){
        super(props); 
    } 

    render(){
        return <div  
            onClick = {(e) => this.props.onClick()}  
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
            onClick={(e) => this.props.onClick()}  
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