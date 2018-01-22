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
    daysLeftMark, generateTagElement, uppercase, 
    generateEmptyTodo, isToday, getMonthName, stringToLength, 
    attachDispatchToProps, 
    assert,
    byNotDeleted,
    byNotCompleted
} from '../../utils'; 
import { Todo, removeTodo, updateTodo, generateId, Project } from '../../database';
import { Checklist, ChecklistItem } from './TodoChecklist';
import { Category } from '../MainContainer'; 
import { TagsPopup, TodoTags } from './TodoTags';
import { TodoInputLabel } from './TodoInputLabel';
import { uniq, isEmpty, contains, isNil, remove, allPass } from 'ramda';
import Restore from 'material-ui/svg-icons/content/undo';
let moment = require("moment"); 
import AutosizeInput from 'react-input-autosize'; 
import { isString } from 'util'; 
import { Store } from '../../app';
import { TodoInput, Checkbox } from './TodoInput';
import Inbox from 'material-ui/svg-icons/content/inbox';
import { SimplePopup } from '../SimplePopup';
import PieChart from 'react-minimal-pie-chart';
import { getProgressStatus } from '../Project/ProjectLink';
import { AutoresizableText } from '../AutoresizableText';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import CalendarIco from 'material-ui/svg-icons/action/date-range';


interface TodoInputPopupProps extends Store{} 
            
interface TodoInputPopupState{}
 
@connect((store,props) => ({...store, ...props}), attachDispatchToProps) 
export class TodoInputPopup extends Component<TodoInputPopupProps,TodoInputPopupState>{

    ref:HTMLElement; 

    constructor(props){
       super(props);
    } 
 
    onClose = () => {
       this.props.dispatch({type:"openTodoInputPopup", load:false}); 
    }  
 
    render(){ 

        let {
            openTodoInputPopup, dispatch, tags, todos, 
            projects, selectedCategory, selectedProjectId, 
            selectedAreaId
        } = this.props; 
 
        return <SimplePopup    
            show={openTodoInputPopup}
            onOutsideClick={this.onClose}
        >  
            <div style={{
                backgroundColor:"rgba(0,0,0,0)",  
                zIndex:40000,  
                display:"flex",   
                alignItems:"center",  
                justifyContent:"center", 
                flexDirection:"column"  
            }}>  
                <div style={{   
                    borderRadius:"10px",
                    boxShadow:"0 0 18px rgba(0,0,0,0.5)", 
                    width:`${window.innerWidth/2.5}px`,   
                    backgroundColor:"white" 
                }}> 
                    <AlwaysOpenedTodoInput 
                        dispatch={dispatch}   
                        tags={tags}  
                        todos={todos} 
                        projects={projects}
                        selectedCategory={selectedCategory}
                        selectedProjectId={selectedProjectId}
                        selectedAreaId={selectedAreaId} 
                    />  
                </div>   
            </div>  
        </SimplePopup>    
    }

} 
 

interface AlwaysOpenedTodoInputState{
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
    showDeadlineCalendar : boolean,
    project:Project 
}   
     

    
interface  AlwaysOpenedTodoInputProps{ 
    dispatch:Function,  
    todos:Todo[], 
    projects:Project[], 
    selectedCategory:Category,
    selectedProjectId:string,
    selectedAreaId:string, 
    tags:string[]
}    
   
   
class AlwaysOpenedTodoInput extends Component<AlwaysOpenedTodoInputProps,AlwaysOpenedTodoInputState>{
    
    calendar:HTMLElement; 
    deadline:HTMLElement;
    tags:HTMLElement;
    ref:HTMLElement; 
    inputRef:HTMLElement; 
    
    constructor(props){

        super(props);  

        this.state={   
            tag : '',
            category : 'inbox', 
            title : '',
            note : '',  
            checked : false, 
            completed : undefined,
            reminder : undefined, 
            deadline : undefined, 
            deleted : undefined, 
            attachedDate : undefined, 
            attachedTags : [], 
            checklist : [], 
            showAdditionalTags : false, 
            showDateCalendar : false,  
            showTagsSelection : false, 
            showChecklist : false,  
            showDeadlineCalendar : false,
            project : undefined
        }       
    }
  

    componentDidMount(){  
        if(this.inputRef){  this.inputRef.focus()  }
    }    


    closeParentContainer = () => {
        this.props.dispatch({type:"openTodoInputPopup", load:false})
    }


    addTodo = () => {
        let todo : Todo = this.todoFromState();  
        let { project } = this.state;
        let { dispatch,todos } = this.props;

        if(!isEmpty(todo.title)){

            let priority : number = 0;

            if(!isEmpty(todos)){
                let first : Todo = todos[0];
                priority = first.priority - 1; 
            }  

            dispatch({type:"addTodo", load:todo}); 

            if(!isNil(project)){
                dispatch({
                  type:"attachTodoToProject",  
                  load:{ projectId:project._id, todoId:todo._id }
                })      
            } 
        }
    } 


    onSave = () => {
        this.addTodo() 
        this.closeParentContainer()
    } 
    

    onCancel = () => {
        this.closeParentContainer()
    }


    stateFromTodo = (state,todo:Todo) => ({   
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
        _id : generateId(),
        category : this.state.category, 
        type : "todo",
        title : this.state.title,
        priority : 0,
        note : this.state.note,  
        checklist : this.state.checklist,
        reminder : this.state.reminder,  
        deadline : this.state.deadline, 
        created : new Date(),
        deleted : this.state.deleted, 
        attachedDate : this.state.attachedDate,  
        attachedTags : this.state.attachedTags, 
        completed : this.state.completed, 
        checked : this.state.checked
    }) 
    

    onAttachTag = (tag) => { 

        if(tag.length===0){ return }

        this.setState({tag:'', attachedTags:uniq([...this.state.attachedTags, tag])})
    }  


    onRemoveTag = (tag) => {

        let {attachedTags} = this.state;
        
        if(tag.length===0){ return }
        
        let idx = attachedTags.findIndex( v => v===tag );
 
        if(idx===-1){ return }

        this.setState({attachedTags:remove(idx,1,attachedTags)})
    } 

    
    onNoteChange = (event,newValue:string) : void => {
        this.setState({note:newValue})
    }


    onTitleChange = (event,newValue:string) : void => {
        this.setState({title:newValue})
    }


    onCheckBoxClick = () => {  
        let checked : boolean = !this.state.checked; 
        this.setState({checked:checked, completed:checked ? new Date() : null})
    } 


    onChecklistButtonClick = (e) => {
        this.setState({showChecklist:true}) 
    }
      

    onFlagButtonClick = (e) => {
        this.setState({showDeadlineCalendar:true})
    }


    closeDeadlineCalendar = (e) => {
        this.setState({showDeadlineCalendar:false})
    }
 

    onCalendarButtonClick = (e) => {
        this.setState({showDateCalendar:true})
    }
    

    closeDateCalendar = (e) => {
        this.setState({showDateCalendar:false})
    }

    
    onTagsButtonClick = (e) => {
        this.setState({showTagsSelection:true})
    }


    closeTagsSelection = (e) => {
        this.setState({showTagsSelection:false}) 
    }


    onRemoveSelectedCategoryLabel = () => {
        let { category, project } = this.state;
        let todayCategory = category==="today" || category==="evening";
        let somedayCategory = category==="someday";
        let noProject = isNil(project);

        if(todayCategory){
            this.setState({category:noProject ? 'inbox' : `next`, attachedDate:null, deadline:null})  
        }else if(somedayCategory){                            
            this.setState({category:noProject ? 'inbox' : `next`}) 
        }
    }     


    onDeadlineCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        let {attachedDate,category} = this.state;
        let deadlineToday = daysRemaining(day)===0;
            
        this.setState({
            deadline:day,
            category:deadlineToday ? "today" : category
        })
    }   

 
    onRemoveAttachedDateLabel = () => {
        let {category,deadline,project} = this.state;

        let noProject = isNil(project);

        this.setState({
            attachedDate:null,
            category:isNil(deadline) && noProject ? "inbox" : category
        }) 
    }


    onCalendarClear = (e) => {
        let {category,deadline,project} = this.state;

        let noProject = isNil(project);

        this.setState({  
            category:isNil(deadline) && noProject ? "inbox" : category,
            attachedDate:null, 
            reminder:null  
        })
    } 


    onDeadlineCalendarClear = (e:any) : void => {
        let { category, attachedDate, project } = this.state;

        let noProject = isNil(project);
        
        this.setState({
            deadline:null,
            category:isNil(attachedDate) && noProject ? "inbox" : category,
        })
    }


    onCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        let {category} = this.state;

        this.setState({
            attachedDate:day, 
            category:daysRemaining(day)===0 ? "today" : category
        })   
    }

    
    onCalendarSomedayClick = (e) => {
        this.setState({category:"someday", attachedDate:null, deadline:null})
    }


    onCalendarTodayClick = (e) => {
        this.setState({category:"today", attachedDate:new Date()}) 
    }


    onCalendarThisEveningClick = (e) => {
        this.setState({category:"evening", attachedDate:new Date()}) 
    }


    onCalendarAddReminderClick = (reminder:Date) : void => {
        this.setState({reminder, attachedDate:reminder})
    }

    
    selectInbox = () => this.setState({
        category:"inbox",
        project:null,
        attachedDate:null,
        deadline:null 
    })

 
    selectProject = (project:Project) => {
        this.setState({project,category:"next"})
    }   


    onWindowEnterPress = (e) => {  
        if(e.keyCode===13){ this.onSave() }    
    }       
    
    
    render(){  
        let {projects,todos} = this.props;  
        let {category,attachedDate} = this.state;

        let todayCategory : boolean = category==="evening" || category==="today"; 

        return  <div   
            style={{     
                width:"100%",         
                display:"flex",    
                position:"relative", 
                alignItems:"center", 
                flexDirection:"column",   
                justifyContent:"center"
            }}   
        >     
        <div    
            ref={(e) => { this.ref=e; }} 
            style={{           
                display:"inline-block", 
                transition: "box-shadow 0.2s ease-in-out, max-height 0.2s ease-in-out", 
                maxHeight:"1000px",
                width:"100%",        
                borderRadius:"5px", 
                marginBottom:"10px" 
            }} 
        >       
            <div
                style={{   
                    paddingLeft:"20px", 
                    paddingRight:"20px",   
                    transition: "max-height 0.2s ease-in-out", 
                    maxHeight:"1000px",
                    paddingTop:"20px",
                    paddingBottom:"20px",
                    caretColor:"cornflowerblue",
                    display:"flex"
                }}    
            >     
                <div style={{display:"flex", flexDirection:"column", width:"100%", padding:"2px"}}>     
                    <div style={{display:"flex", alignItems:"center", position:"relative"}}> 
                    <div style={{display:"flex", alignItems:"center", width:"90%"}}> 
                        <div style={{paddingLeft:"5px", paddingRight:"5px"}}> 
                            <Checkbox checked={this.state.checked} onClick={this.onCheckBoxClick}/>
                        </div>  
                        <div style={{
                            display:"flex", 
                            flexDirection:"column",  
                            width:"100%", 
                            maxHeight:"35px" 
                        }}>     
                            <div style={{display:"flex", height:"30px", alignItems:"center", width:"100%"}}>

                            <TextField   
                                ref={e => {this.inputRef=e;}}
                                onKeyDown={this.onWindowEnterPress}
                                id={`todo-input-shortcut`}
                                value={this.state.title} 
                                hintText="New To-Do" 
                                fullWidth={true}  
                                hintStyle={{ 
                                    top:"3px", 
                                    left:0,   
                                    height:"30px"
                                }}      
                                onChange={this.onTitleChange} 
                                style={{
                                    display:"flex", 
                                    alignItems:"center",  
                                    width:"100%", 
                                    height:"30px",
                                    cursor:"default"
                                }}       
                                inputStyle={{        
                                    height:"30px",
                                    color:"black", fontSize:"16px", 
                                    cursor:"default", boxSizing:"content-box", 
                                    backgroundColor:"rgba(0,0,0,0)",
                                    border:"none", outline:"none"  
                                }} 
                                underlineFocusStyle={{borderColor:"rgba(0,0,0,0)"}} 
                                underlineStyle={{borderColor:"rgba(0,0,0,0)"}}   
                            />  
                            </div>
                        </div>
                    </div>    
                    </div>  
                    { 
                        <div style={{
                            transition:"opacity 0.2s ease-in-out",
                            opacity:1,
                            paddingLeft:"25px", 
                            paddingRight:"25px"  
                        }}>        
                            <TextField   
                                id={`always-note`}  
                                value={this.state.note} 
                                hintText="Notes"
                                multiLine={true}   
                                rows={1}
                                fullWidth={true}  
                                onChange={this.onNoteChange}  
                                onKeyDown={(e) => { if(e.keyCode===13){ e.stopPropagation(); } }}
                                inputStyle={{fontSize:"14px"}} 
                                underlineFocusStyle={{borderColor:"rgba(0,0,0,0)"}} 
                                underlineStyle={{borderColor:"rgba(0,0,0,0)"}}  
                            />  
                            {    
                                !this.state.showChecklist ? null :  
                                <div> 
                                    <Checklist 
                                      checklist={this.state.checklist}  
                                      updateChecklist={(checklist:ChecklistItem[]) => this.setState({checklist})} 
                                    /> 
                                </div> 
                            }   
                            {  
                                this.state.attachedTags.length===0 ? null :
                                <TodoTags   
                                    tags={this.state.attachedTags}
                                    attachTag={this.onAttachTag}
                                    removeTag={this.onRemoveTag}
                                /> 
                            }
                        </div>  
                    }  
                    </div>    
                </div>    
        { 
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
                        opacity:1,
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
                    isNil(attachedDate) || todayCategory ? null :
                    <div style={{
                        transition: "opacity 0.4s ease-in-out",
                        opacity:1
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
                        opacity : 1 
                    }}>
                        <TodoInputLabel  
                            onRemove={this.onDeadlineCalendarClear}
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
                    origin = {{vertical: "center", horizontal: "left"}} 
                    point = {{vertical: "bottom", horizontal: "right"}}  
                    anchorEl={this.calendar}
                    rootRef = {document.body}
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
                    origin = {{vertical: "center", horizontal: "left"}} 
                    point = {{vertical: "bottom", horizontal: "right"}} 
                    rootRef = {document.body} 
                />

                <DeadlineCalendar   
                    close={this.closeDeadlineCalendar}
                    onDayClick={this.onDeadlineCalendarDayClick}
                    open={this.state.showDeadlineCalendar}
                    origin = {{vertical: "center", horizontal: "left"}} 
                    point = {{vertical: "bottom", horizontal: "right"}} 
                    anchorEl = {this.deadline}
                    onClear={this.onDeadlineCalendarClear}
                    rootRef = {document.body}
                />
            {     
                <div ref={(e) => { this.calendar=e; }}>  
                    <IconButton 
                    onClick = {this.onCalendarButtonClick} 
                    iconStyle={{  
                        transition: "opacity 0.2s ease-in-out",
                        opacity: 1,
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
                            opacity: 1,
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
                        opacity:1,
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
                            opacity:1,
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


        <TodoInputPopupFooter
            onCancel={this.onCancel}
            onSave={this.onSave}
            projects={projects}
            todos={todos}
            rootRef={document.body}
            attachedDate={this.state.attachedDate}
            deadline={this.state.deadline} 
            selectInbox={this.selectInbox}    
            selectProject={this.selectProject}
            category={this.state.category}
            project={this.state.project} 
        /> 
        </div> 
    } 
}    
  


interface TodoInputPopupFooterProps{ 
    onCancel:Function,
    onSave:Function,
    projects:Project[],
    todos:Todo[],
    rootRef:HTMLElement,
    attachedDate:Date,
    deadline:Date,  
    selectInbox:() => void,  
    selectProject:(project:Project) => void,
    category:Category,
    project:Project  
}


interface TodoInputPopupFooterState{
    selectorPopupOpened:boolean 
}



class TodoInputPopupFooter extends Component<TodoInputPopupFooterProps,TodoInputPopupFooterState>{
    
    ref:HTMLElement;

    constructor(props){
        super(props);
        this.state={selectorPopupOpened:false}
    }


    closeSelectorPopup = () => {
        this.setState({selectorPopupOpened:false})
    }


    render(){
        let { selectorPopupOpened } = this.state;

        let {
            projects,
            todos,
            rootRef,
            selectInbox,  
            selectProject,
            category,
            project,
            attachedDate,
            deadline  
        } = this.props;


        return <div style={{
            backgroundColor:"rgb(234, 235, 239)",
            display:"flex",
            overflowX:"hidden",
            justifyContent:"space-between",
            width:"100%"
        }}>     
                <div 
                    ref = {e => {this.ref=e;}}
                    onClick={() => this.setState({selectorPopupOpened:true})}
                    style={{
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"flex-start",
                        width:"90px",
                        fontSize:"14px",
                        fontWeight:"bold",
                        color:"rgba(100,100,100,1)",
                        cursor:"default"   
                    }}  
                >  
                    {
                        selectButtonContent({
                            category,
                            project,
                            attachedDate,
                            deadline,
                            todos
                        })
                    } 
                </div>  
                <div style={{  
                    display:"flex",  
                    alignItems:"center", 
                    justifyContent:"flex-end",
                    flexGrow:1, 
                    padding:"5px" 
                }}>
                    <div style={{padding:"2px"}}>
                        <div    
                            onClick={() => this.props.onCancel()} 
                            style={{       
                                width:"90px",
                                display:"flex",
                                alignItems:"center",
                                cursor:"pointer", 
                                justifyContent:"center",
                                borderRadius:"5px",
                                height:"25px",   
                                backgroundColor:"rgba(179,182,189,1)"  
                            }}  
                        > 
                            <div style={{color:"white", fontSize:"16px"}}>      
                                Cancel 
                            </div>  
                        </div>   
                    </div> 
                    <div style={{padding:"2px"}}>
                        <div     
                            onClick={() => this.props.onSave()}
                            style={{     
                                width:"90px",
                                display:"flex",
                                alignItems:"center",
                                cursor:"pointer",
                                justifyContent:"center",
                                borderRadius:"5px",
                                height:"25px",  
                                backgroundColor:"rgba(81, 144, 247, 1)"  
                            }}
                        >  
                            <div style={{color:"white", fontSize:"16px"}}>  
                                Save
                            </div>   
                        </div> 
                    </div>
                </div> 
         
                <SelectorPopup

                    selectInbox = {selectInbox}        
                    selectProject = {selectProject}
                    
                    category = {category}
                    project = {project}
                    
                    open={selectorPopupOpened}
                    anchorEl={this.ref}
                    rootRef={rootRef}
                    close={this.closeSelectorPopup}
                    projects={projects}
                    todos={todos}
                />
        </div>
    }
}
  










interface SelectorPopupProps{
    open:boolean
    anchorEl:HTMLElement,
    close:Function,
    projects:Project[],
    rootRef:HTMLElement, 
    todos:Todo[],
    
    selectInbox:() => void,    
    selectProject:(project:Project) => void,
    
    category:Category,
    project:Project 
}


interface SelectorPopupState{}
 

class SelectorPopup extends Component<SelectorPopupProps,SelectorPopupState>{

    ref:HTMLElement;
    subscriptions:Subscription[];

    constructor(props){
        super(props);
        this.subscriptions=[];         
    }

    componentDidMount(){
        let {close} = this.props;

        let click = Observable
                    .fromEvent(document.body,"click")
                    .subscribe((event:any) => 
                        insideTargetArea(null,this.ref,event.clientX,event.clientY) ? 
                        null :
                        close() 
                    ) 

        this.subscriptions.push(click);  
    }

    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = []; 
    } 

    render(){
    
        let {open,anchorEl,close,projects,todos,rootRef,project,category} = this.props;
    
        return <div> 
            <Popover  
                open={open}
                style={{
                    zIndex:200005,
                    background:"rgba(39, 43, 53, 0)", 
                    backgroundColor:"rgb(39, 43, 53, 0)"
                }}
                anchorEl={anchorEl} 
                canAutoPosition={true}  
                onRequestClose={() => {}} 
                scrollableContainer={rootRef}
                useLayerForClickAway={false} 
                anchorOrigin={{vertical: "center", horizontal: "left"}} 
                targetOrigin={{vertical: "bottom", horizontal: "left"}} 
            >      
                <div    
                    ref={(e) => { this.ref=e; }} 
                    className={"darkscroll"}
                    onClick = {(e) => {e.stopPropagation();}}
                    style={{borderRadius:"10px", width:"240px"}}
                > 
                    <div    
                        className={"darkscroll"}
                        style={{   
                            backgroundColor:"rgb(39, 43, 53)",
                            paddingRight:"10px",
                            paddingLeft:"10px",
                            paddingTop:"5px",
                            paddingBottom:"5px",
                            maxHeight:"150px",
                            overflowX:"hidden" 
                        }}  
                    >     
                            <div style={{
                                display:"flex",
                                alignItems:"center", 
                                paddingTop:"5px",
                                paddingBottom:"5px",
                            }}>
                                <div  
                                    className="hoverDateType" 
                                    onClick={() => {
                                        let {selectInbox,close} = this.props;
                                        selectInbox();
                                        close();
                                    }}
                                    style={{
                                        height:"25px",
                                        display:"flex",
                                        alignItems:"center",
                                        width:"100%",
                                        borderRadius:"2px"
                                    }} 
                                >
                                    <div style={{display:"flex", alignItems:"center"}}>
                                        <Inbox    
                                            style={{  
                                                paddingLeft:"5px",
                                                width:"18px",
                                                height:"18px",
                                                color:"white", 
                                                cursor:"default"
                                            }}  
                                        /> 
                                    </div>
                                    <div  
                                        style={{
                                            width:"100%", 
                                            fontSize:"15px",
                                            paddingRight:"5px", 
                                            paddingLeft:"5px", 
                                            cursor:"default",
                                            color:"white", 
                                            WebkitUserSelect:"none" 
                                        }}
                                    >   
                                        Inbox 
                                    </div>
                                    <div style={{flexGrow:1,justifyContent:"flex-end",alignItems:"center"}}>
                                        <div style={{height:"20px"}}>

                                            {
                                                category!=="inbox" ? null :
                                                <Checked style={{
                                                    color:"white",
                                                    height:18,
                                                    width:18,  
                                                    paddingRight:"5px",
                                                    paddingLeft:"5px",
                                                }}/> 
                                            }
                                        </div>  
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                outline: "none",
                                color: "rgba(255, 255, 255, 1)",
                                width: "100%",
                                borderBottom: "1px solid rgba(255,255,255,0.2)"
                            }}>
                            </div> 
                            {
                                projects 
                                .filter(
                                    allPass([
                                        byNotDeleted,
                                        byNotCompleted 
                                    ])
                                )
                                .map( 
                                    (p:Project) => { 
                                        let {done, left} = getProgressStatus(p,todos);
                                         
                                        return <div    
                                            key = {`${p._id}-project`}
                                            onClick = {(e) => {
                                                let {selectProject,close} = this.props;
                                                selectProject(p);
                                                close(); 
                                            }}
                                            id = {`${p._id}-popup`} 
                                            className="hoverDateType" 
                                            style={{       
                                                borderRadius:"2px", 
                                                color:"white",
                                                height:"25px",  
                                                paddingLeft:"4px", 
                                                display:"flex",
                                                alignItems:"center" 
                                            }} 
                                        >     
                                                <div style={{    
                                                    width: "18px",
                                                    height: "18px",
                                                    position: "relative",
                                                    borderRadius: "100px",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    border: "1px solid rgb(170, 170, 170)",
                                                    boxSizing: "border-box" 
                                                }}> 
                                                    <div style={{
                                                        width: "18px",
                                                        height: "18px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        position: "relative" 
                                                    }}>  
                                                        <PieChart 
                                                            animate={false}    
                                                            totalValue={done+left}
                                                            data={[{     
                                                                value:done,  
                                                                key:1,    
                                                                color:"white" 
                                                            }]}    
                                                            style={{ 
                                                                color:"white",
                                                                width:"12px", 
                                                                height:"12px",
                                                                position:"absolute",
                                                                display:"flex",
                                                                alignItems:"center",
                                                                justifyContent:"center"  
                                                            }}    
                                                        />       
                                                    </div>
                                                </div> 
                            
                                                <div    
                                                    id = {`${p._id}-popup-text`}   
                                                    style={{  
                                                        width:"100%",
                                                        paddingLeft:"5px",
                                                        fontFamily: "sans-serif",
                                                        fontSize:`15px`,  
                                                        whiteSpace: "nowrap",
                                                        cursor: "default",
                                                        color:"white",  
                                                        WebkitUserSelect: "none" 
                                                    }}
                                                >    
                                                    <AutoresizableText
                                                        text={p.name}
                                                        placeholder="New Project"
                                                        fontSize={15}
                                                        style={{}}
                                                        offset={45} 
                                                        placeholderStyle={{}}
                                                    />
                                                </div>     

                                                {   
                                                    isNil(project) ? null :
                                                    project._id!==p._id ? null : 
                                                    <Checked style={{  
                                                        color:"white",
                                                        paddingRight:"5px",
                                                        paddingLeft:"5px",
                                                    }}/> 
                                                }  
                                        </div>
                                    }
                                )
                            }   
                    </div>  
                </div>  
            </Popover> 
        </div>
    }    
}









let selectButtonContent = ({
    category,
    project,
    attachedDate,
    deadline,
    todos
}) => { 
    
    if(category==="inbox" && isNil(attachedDate) && isNil(project) && isNil(deadline)){

        return <div   
            style={{
                cursor:"pointer",
                display:"flex",
                paddingLeft:"15px",
                height:"25px", 
                alignItems:"center"
            }}
        >
            <Inbox   
                style={{
                    width:"18px",
                    height:"18px",
                    color:"rgba(100,100,100,1)"
                }}  
            />
            <div style={{ 
                paddingRight:"5px",    
                paddingLeft:"5px", 
                WebkitUserSelect:"none"
            }}>  
                Inbox
            </div> 
        </div>

    }else if(!isNil(project)){

        let {done, left} = getProgressStatus(project,todos);

        return <div   
            style={{
                paddingLeft:"15px",
                cursor:"pointer",
                display:"flex",
                height:"25px", 
                alignItems:"center"
            }}
        >
            <div style={{    
                width: "18px",
                height: "18px",
                position: "relative",
                borderRadius: "100px",
                display: "flex",
                justifyContent: "flex-start", 
                alignItems: "center",
                border: "1px solid rgb(170, 170, 170)",
                boxSizing: "border-box" 
            }}> 
                <div style={{
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative" 
                }}>  
                    <PieChart 
                        animate={false}    
                        totalValue={done+left}
                        data={[{
                            value:done,  
                            key:1,    
                            color:"white" 
                        }]}    
                        style={{ 
                            color:"white",
                            width:"12px", 
                            height:"12px",
                            position:"absolute",
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center"  
                        }}    
                    />       
                </div>
            </div> 
            <div style={{ 
                paddingRight:"5px", 
                paddingLeft: "5px", 
                WebkitUserSelect:"none", 
                width:"100%"
            }}>   
                {isEmpty(project.name) ? "New Project" : stringToLength(project.name,10)}    
            </div>  
        </div>  

    }else{

        return <div  
            style={{
                cursor:"pointer",
                display:"flex",
                paddingLeft:"15px", 
                height:"25px", 
                alignItems:"center"
            }}
        >
            <CalendarIco 
                style={{
                    width:"18px",
                    height:"18px",
                    color:"rgba(100,100,100,1)", 
                    cursor:"default"
                }}  
            />
            <div style={{ 
                paddingRight:"5px", 
                paddingLeft:"5px", 
                WebkitUserSelect:"none"
            }}>  
                Scheduled
            </div>
        </div>
    }
}