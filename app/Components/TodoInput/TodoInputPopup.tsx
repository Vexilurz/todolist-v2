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
    daysLeftMark, generateTagElement, uppercase, 
    generateEmptyTodo, isToday, getMonthName, stringToLength, 
    attachDispatchToProps 
} from '../../utils'; 
import { Todo, removeTodo, updateTodo, generateId, Project } from '../../database';
import { Checklist, ChecklistItem } from './TodoChecklist';
import { Category } from '../MainContainer'; 
import { TagsPopup, TodoTags } from './TodoTags';
import { TodoInputLabel } from './TodoInputLabel';
import { uniq, isEmpty, contains, isNil } from 'ramda';
import Restore from 'material-ui/svg-icons/content/undo';
let moment = require("moment"); 
import AutosizeInput from 'react-input-autosize'; 
import { isString } from 'util'; 
import { Store } from '../../app';
import { TodoInput, Checkbox } from './TodoInput';
import Inbox from 'material-ui/svg-icons/content/inbox';
 


interface TodoInputPopupProps extends Store{} 
 
interface TodoInputPopupState{
    ctrlPressed:boolean
}

@connect((store,props) => store, attachDispatchToProps) 
export class TodoInputPopup extends Component<TodoInputPopupProps,TodoInputPopupState>{

    ref:HTMLElement; 

    constructor(props){
       super(props);
       this.state = {
          ctrlPressed:false
       }
    } 
    
    componentDidMount(){
        window.addEventListener("keydown", this.onCtrlXPress);
        window.addEventListener("keydown", this.onCtrlDown);
        window.addEventListener("keyup", this.onCtrlUp);
    };  
          

    componentWillUnmount(){
        window.removeEventListener("keydown", this.onCtrlXPress);
        window.removeEventListener("keydown", this.onCtrlDown); 
        window.removeEventListener("keyup", this.onCtrlUp); 
    };  


    onCtrlDown = (e) => e.keyCode == 17 ? this.setState({ctrlPressed:true}) : null;


    onCtrlUp = (e) => e.keyCode == 17 ? this.setState({ctrlPressed:false}) : null;
    

    onCtrlXPress = (e) => { 
        if(e.keyCode === 88){
            if(this.state.ctrlPressed){  
               this.props.dispatch({type:"openTodoInputPopup", load:!this.props.openTodoInputPopup});
            }
        }  
    }

     
    render(){

        return <Popover 
            useLayerForClickAway={false} 
            open={this.props.openTodoInputPopup}
            anchorEl={document.body}
            style={{  
                backgroundColor:"rgba(0,0,0,0)",
                background:"rgba(0,0,0,0)",  
                borderRadius:"20px",
                zIndex:40000 
            }}     
            onRequestClose={() => this.props.dispatch({type:"openTodoInputPopup", load:false})}
            anchorOrigin={{vertical:"center", horizontal:"middle"}} 
            targetOrigin={{vertical:"center", horizontal:"middle"}} 
            zDepth={5}    
        >   
            <div style={{
                display:"flex",  
                alignItems:"center", 
                justifyContent:"center", 
                flexDirection:"column"
            }}>  
                <div style={{  
                    minWidth:`${window.innerWidth/2}px`, 
                    backgroundColor: "white" 
                }}> 
                    <AlwaysOpenedTodoInput
                        dispatch={this.props.dispatch}  
                        tags={this.props.tags}  
                    /> 
                </div>  
            </div>    
        </Popover>
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
    showDeadlineCalendar : boolean
}   
     

    
interface  AlwaysOpenedTodoInputProps{ 
    dispatch : Function,  
    tags : string[]
}    
  
   
class  AlwaysOpenedTodoInput extends Component<AlwaysOpenedTodoInputProps,AlwaysOpenedTodoInputState>{
    
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
            showDeadlineCalendar : false
        }       
    }


    componentDidMount(){  
        if(this.inputRef){
           this.inputRef.focus();  
        }
    }    


    closeParentContainer = () => this.props.dispatch({type:"openTodoInputPopup", load:false}); 


    onSave = () => {
        let todo : Todo = this.todoFromState();  
        if(!isEmpty(todo.title)){ 
            this.props.dispatch({type:"updateTodo", load:todo});  
        }   
        this.closeParentContainer();
    } 
    

    onCancel = () => this.closeParentContainer();


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
        if(tag.length===0) 
           return;
        this.setState({tag:'', attachedTags:uniq([...this.state.attachedTags, tag])});
    }  

    
    onNoteChange = (event,newValue:string) : void => this.setState({note:newValue});

    onTitleChange = (event) : void => this.setState({title:event.target.value});

    onCheckBoxClick = () => {  
        let checked : boolean = !this.state.checked; 
        this.setState({checked:checked, completed:checked ? new Date() : null});
    } 

    onRemoveSelectedCategoryLabel = () => {
        if(this.state.category==="today" || this.state.category==="evening"){
            this.setState({category:'inbox',attachedDate:null});   
        }else if(this.state.category==="someday"){
            this.setState({category:'inbox'});    
        }
    }    

    onChecklistButtonClick = (e) => this.setState({showChecklist:true}) 
      
    onFlagButtonClick = (e) => this.setState({showDeadlineCalendar:true})

    closeDeadlineCalendar = (e) => this.setState({showDeadlineCalendar:false})
 
    onCalendarButtonClick = (e) => this.setState({showDateCalendar:true})
    
    closeDateCalendar = (e) => this.setState({showDateCalendar:false})
    
    onTagsButtonClick = (e) => this.setState({showTagsSelection:true})

    closeTagsSelection = (e) => this.setState({showTagsSelection:false})

    onDeadlineCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        let remaining = daysRemaining(day);
            
        if(remaining>=0)
           this.setState({deadline:day}); 
    } 

    onRemoveAttachedDateLabel = () => {
        if(
            daysRemaining(this.state.attachedDate)===0 &&  
            (this.state.category==="today" || this.state.category==="evening") 
        ){ 
            this.setState({attachedDate:null, category:'inbox'}); 
        }else{ 
            this.setState({attachedDate:null});  
        }
    }

    onCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        this.setState({
            attachedDate:day,
            category:daysRemaining(day)===0 ? "today" : this.state.category
        });   
    }

    onCalendarClear = (e) => this.setState({  
        category:'inbox',
        attachedDate:null, 
        reminder:null 
    })

    onDeadlineCalendarClear = (e:any) : void => this.setState({deadline:null})

    onCalendarSomedayClick = (e) => this.setState({category:"someday", attachedDate:null})

    onCalendarTodayClick = (e) => this.setState({category:"today", attachedDate:new Date()}) 

    onCalendarThisEveningClick = (e) => this.setState({category:"evening", attachedDate:new Date()}) 

    onCalendarAddReminderClick = (reminder:Date) : void => this.setState({reminder, attachedDate:reminder})
    
    render(){  
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
            onClick={(e) => {e.stopPropagation();}}
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
                            </div>
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
                                {daysLeftMark(true, this.state.deadline, false)}
                            </div>  
                        }   
                    </div>  
                    { 
                        <div style={{
                            transition:"opacity 0.2s ease-in-out",
                            opacity:1,
                            paddingLeft:"25px",
                            paddingRight:"25px"  
                        }}>       
                            <TextField  
                                id={ `always-note` }
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
                                     updateChecklist={(checklist:ChecklistItem[]) => this.setState({checklist})} 
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
                    !this.state.attachedDate ? null :
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
                    origin = {{vertical: "center", horizontal: "right"}} 
                    point = {{vertical: "center", horizontal: "right"}}
                    rootRef = {document.body} 
                />

                <DeadlineCalendar   
                    close={this.closeDeadlineCalendar}
                    onDayClick={this.onDeadlineCalendarDayClick}
                    open={this.state.showDeadlineCalendar}
                    origin = {{vertical: "center", horizontal: "right"}} 
                    point = {{vertical: "center", horizontal: "right"}} 
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
            <div style={{
                backgroundColor:"rgb(234, 235, 239)",
                display:"flex",
                justifyContent:"space-between",
                width:"100%"
            }}>   
                    <div style={{
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center",
                        width:"90px",
                        fontSize:"14px",
                        fontWeight:"bold",
                        color:"rgba(100,100,100,1)",
                        cursor:"default"   
                    }}> 
                        <div style={{
                            paddingRight:"5px", 
                            WebkitUserSelect:"none"
                        }}>  
                            Inbox
                        </div>
                        <Inbox   
                            style={{
                                width:"18px",
                                height:"18px",
                                color:"rgba(100,100,100,1)", 
                                cursor:"default"
                            }} 
                        /> 
                    </div>  
                    <div style={{  
                        display:"flex",  
                        alignItems: "center", 
                        justifyContent: "flex-end",
                        padding: "5px" 
                    }}>
                        <div style={{padding:"2px"}}>
                            <div    
                                onClick={() => this.onCancel()} 
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
                                onClick={() => this.onSave()}
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
            </div>
        </div> 
    } 
}    
  