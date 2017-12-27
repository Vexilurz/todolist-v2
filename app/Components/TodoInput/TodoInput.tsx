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
import { ThingsCalendar } from '.././ThingsCalendar';
import {  
    insideTargetArea, daysRemaining, todoChanged, 
    daysLeftMark, generateTagElement, uppercase 
} from '../../utils';
import { Todo, removeTodo, updateTodo, generateId } from '../../database';
import { Checklist, ChecklistItem } from './TodoChecklist';
import { Category } from '../MainContainer'; 
import { TagsPopover, TodoTags } from './TodoTags';
import { TodoInputLabel } from './TodoInputLabel';
import { uniq } from 'ramda';
let moment = require("moment"); 
  



export interface TodoInputState{
    formId : string, 
    showtagsPopover : boolean, 
    checked:boolean,
    completed:Date,
    currentTodo : string,  
    currentNote : string,
    attachedDate : Date, 
    showCalendar : boolean,  
    calendarType : "full" | "simple", 
    currentTag : string, 
    checklist : ChecklistItem[], 
    attachedTags : string[],
    open : boolean, 
    reminder : any,
    newSelectedCategory : Category,
    deadline : Date,
    selectedTags : string[], 
    tagsInputDisplay:boolean
}  
  


  
export interface TodoInputProps{ 
    dispatch : Function, 
    tags : string[], 
    todo : Todo, 
    rootRef : HTMLElement,  
    id:string
}   
 
  

 

export class TodoInput extends Component<TodoInputProps,TodoInputState>{
    

    calendarOrigin:HTMLElement;

    calendarSimpleOrigin:HTMLElement;

    tagsPopoverOrigin:HTMLElement;

    ref:HTMLElement;

    transitionOffset:number;


 
    constructor(props){

        super(props);  

        this.transitionOffset = 40; 

        this.state={  
              
            open : false,
            formId : this.props.todo._id, 
            showCalendar : false,  
            showtagsPopover : false, 
            currentTag : '', 
            tagsInputDisplay : false, 
            selectedTags : this.props.tags,
            calendarType : "full", 
            checklist : this.props.todo.checklist,
 
            completed : this.props.todo.completed,

            newSelectedCategory : this.props.todo.category as Category, 

            checked : this.props.todo.checked,

            attachedDate : this.props.todo.attachedDate,

            currentTodo : this.props.todo.title, 
  
            currentNote : this.props.todo.note, 

            deadline : this.props.todo.deadline, 

            attachedTags : this.props.todo.attachedTags, 

            reminder : this.props.todo.reminder
            
        }     
    }   



    onError = (e) => console.log(e);
    
 

    componentDidMount(){ 

        window.addEventListener("click", this.onOutsideClick);  
     
        if(this.state.currentTodo.length===0)   
           setTimeout(() => this.setState({open:true}), 10);   

    }      
      

   
    componentWillUnmount(){

        window.removeEventListener("click", this.onOutsideClick);

    }
    


    shouldComponentUpdate(nextProps:TodoInputProps, nextState:TodoInputState){

        let should = false;

        if(this.props.todo!==nextProps.todo) 
           should=true; 
        
        if(this.state!==nextState)
           should=true;
           
        return should;    
 
    } 


     
    enableDragOfThisItem = () => {
        if(this.ref)
           this.ref["preventDrag"] = false; 
    }
    


    preventDragOfThisItem = () => {
        if(this.ref)
           this.ref["preventDrag"] = true; 
    }


 
    todoFromState = () : Todo => ({
        _id : this.props.todo._id,  
        priority : this.props.todo.priority,  
        created : this.props.todo.created,  
        deleted : this.props.todo.deleted,
        completed : this.state.completed, 
        type:"todo", 
        category :  this.state.newSelectedCategory,  
        title : this.state.currentTodo, 
        reminder : this.state.reminder, 
        checked : this.state.checked, 
        note : this.state.currentNote,
        checklist : this.state.checklist, 
        attachedTags : this.state.attachedTags,
        attachedDate : this.state.attachedDate,
        deadline : this.state.deadline 
    }) 

 

    onFieldsContainerClick = (e) => {   
 
        this.props.dispatch({type:"selectedTodoId", load:this.props.todo._id});
        
        if(!this.ref) 
            return; 

        this.preventDragOfThisItem();


        if(!this.state.open)
            this.setState({open:true});  

    } 
 

 
    onNotesChange = (event,newValue:string) => this.setState({currentNote:newValue})
    
 
 
    onNewTodoChange = (event,newValue:string) => this.setState({currentTodo:newValue})

    

    onOutsideClick = (e) => {

        if(this.ref===null || this.ref===undefined)
           return; 

        let x = e.pageX;

        let y = e.pageY; 

        let inside = insideTargetArea(this.ref,x,y);

        if(!inside){   

            this.props.dispatch({type:"selectedTodoId", load:null});

            if(this.state.open){
                  
                this.enableDragOfThisItem();

                this.setState(
                    
                    {open:false}, 
                       
                    () => {
                        let todo : Todo = this.todoFromState();   
                        
                        if(this.state.currentTodo.length===0 || todoChanged(this.props.todo,todo))
                           this.addTodoFromInput(todo);
                    }    

                ); 
               
            }

        }   

    }   
     


    updateTodo = (changedTodo:Todo) : void => {
    
        this.props.dispatch({type:"updateTodo", load:changedTodo});  

    }  
    
    

    removeTodo = (changedTodo:Todo) : void => {
     
        this.props.dispatch({ type:"updateTodo", load:{...changedTodo, deleted:new Date()} });

    }   
     


    addTodoFromInput = (todo:Todo) : void => {
        
        if(this.state.currentTodo.length===0){


            this.removeTodo(todo);

        }else{  
 

            this.updateTodo(todo); 

        }   
        
    } 
      


    attachTag = (tag) => {
        
        if(tag.length===0) 
            return;

        let tags = this.state.attachedTags;

        if(!Array.isArray(tags))
            tags = []; 

        tags.push(tag); 

        this.setState({
            currentTag:'', 
            attachedTags:uniq(tags), 
            showtagsPopover:false, 
            tagsInputDisplay:false
        });
    } 


    
    onTagFieldEnterPress = (event) => {  

        if(event.key==="Enter"){
            this.attachTag(this.state.currentTag);
        } 
         
    }  
     


    onTagFieldBlur = (event) => {  

        this.attachTag(this.state.currentTag);

    } 



    onCheckBoxClick = (e) => {  

        if(!this.state.open){

            let checked = !this.state.checked;
 
            this.setState( 
                 
                {
                    checked, 
                    completed:checked ? new Date() : null
                }, 
                 
                () => {
                    let todo : Todo = this.todoFromState();   
    
                    if(this.state.currentTodo.length===0 || todoChanged(this.props.todo,todo))
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
                    rightClickMenuY:e.clientY-this.props.rootRef.offsetTop+this.props.rootRef.scrollTop
                }
            });   

        }
 
    }
    
 

    onCheckListIconClick = (e) => {
        
        if(this.props.todo.checklist.length===0)
           this.setState({checklist:[{checked:false, text:'', idx:0, key: generateId()}]}); 

    }   



    onFlagIconClick = (e) => this.setState({showCalendar:true, calendarType:"simple"})



    onCalendarIconClick = (e) => this.setState({showCalendar:true, calendarType:"full"})



    onTagsIconClick = (e) => this.setState({showtagsPopover:true})



    onRemoveSelectedCategoryLabel = () => {
        
        this.setState({
            newSelectedCategory:this.props.todo.category as Category,
            attachedDate:null 
        })
    
    }  


        
    onCloseTagsClick = (e) => this.setState({showtagsPopover:false})



    closeCalendar = (e) => this.setState({showCalendar:false})



    onCalendarDayClick = (day:Date,modifiers:Object,e:any) => {

        if(this.state.calendarType==="full"){

            this.setState({
                showCalendar:false, attachedDate:day
            }) 

        }else if(this.state.calendarType==="simple"){

            let remaining = daysRemaining(day);
                
            if(remaining>=0){

                this.setState({ 
                    showCalendar:false, deadline:day 
                }) 

            }

        }

    }



    onCalendarSomedayClick = (e) => {

        this.setState({ 
            showCalendar:false, 
            newSelectedCategory:"someday"
        })

    }
    


    onCalendarTodayClick = (e) => { 

        this.setState({ 
            showCalendar:false, 
            newSelectedCategory:"today",
            attachedDate:new Date()
        }) 

    } 
    


    onCalendarThisEveningClick = (e) => { 

        this.setState({
            showCalendar:false, 
            newSelectedCategory:"evening",
            attachedDate:new Date()
        })

    }  
     
    

    onCalendarAddReminderClick = (e) => { 

        //this.setState({ 
        //    showCalendar:false, reminder:{} 
        //})

    }


     
    onCalendarClear = (e) => { 

        if(this.state.calendarType==="full"){ 
            
            this.setState({ 
                showCalendar:false,
                newSelectedCategory:this.props.todo.category as Category,
                attachedDate:null
            })
    

        }else if(this.state.calendarType==="simple"){ 
    
            this.setState({ 
                showCalendar:false, 
                deadline:null 
            }) 

        }

    }



    selectButtonsToDisplay = () => {
        
        let buttonsNamesToDisplay : any = [
            "Calendar",
            "Tag",
            "Flag",
            "Add" 
        ]; 

        
        return buttonsNamesToDisplay;

    }

    

    render(){  
        
        let buttonsNamesToDisplay = this.selectButtonsToDisplay(); 

        return  <div  
            id={this.props.id}  
            onContextMenu={this.onRightClickMenu}
            style={{    
                width:"100%",     
                display:"flex",   
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
                transform:`translateY(${this.state.open ? this.transitionOffset : 0}px)`    
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
                                hintText = "New To-Do"   
                                id={this.props.todo._id}
                                defaultValue = {this.state.currentTodo} 
                                fullWidth = {true}   
                                onChange={this.onNewTodoChange}
                                inputStyle = {{ 
                                    color:"black", 
                                    fontSize:"16px",
                                    cursor:"default"
                                }}  
                                hintStyle = {{top:"3px", left:0, width:"100%", height:"100%"}}   
                                style = {{height:"28px"}}      
                                underlineFocusStyle = {{borderColor: "rgba(0,0,0,0)"}}    
                                underlineStyle = {{borderColor: "rgba(0,0,0,0)"}}  
                            /> 
  
                            { daysLeftMark(this.state.open, this.state.deadline, false) }

                        </div>  
                        { 
                            !this.state.open ? null :
                            <div style={{
                                transition: "opacity 0.2s ease-in-out",
                                opacity:this.state.open ? 1 : 0
                            }}>      
                                    
                                <TextField 
                                    id={ `${this.props.todo._id}note` }
                                    defaultValue={this.state.currentNote} 
                                    hintText="Notes"
                                    fullWidth={true}  
                                    hintStyle={{ 
                                        top: "3px", left: 0,  
                                        width:"100%", height:"100%"
                                    }}     
                                    onChange={this.onNotesChange}
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

                                <TodoTags todo={this.props.todo}/>

                            </div> 
                        }

                    </div>   
                </div>   


        {

            !this.state.open ? null :  
            <div style={{display:"flex", flexDirection:"column"}}> 
                {  
                    ["evening","today","someday"].indexOf(this.state.newSelectedCategory)===-1 ? null :

                    <div style={{
                        transition: "opacity 0.4s ease-in-out",
                        opacity:this.state.open ? 1 : 0
                    }}>    
                        <TodoInputLabel 
                            onRemove={this.onRemoveSelectedCategoryLabel}
                            category={this.state.newSelectedCategory}
                            content={ 
                                <div style={{marginLeft:"15px"}}>
                                    {
                                        this.state.newSelectedCategory==="evening" ? "This Evening" :
                                        this.state.newSelectedCategory==="today" ? "Today" :
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
                right: 0  
            }}>   

                <ThingsCalendar
                    close = {this.closeCalendar}   
                    open = {this.state.showCalendar}
                    anchorEl = {
                        this.state.calendarType==="simple" ? 
                        this.calendarSimpleOrigin : 
                        this.calendarOrigin
                    }  
                    simple = {this.state.calendarType==="simple"}  
                    onClear = {this.onCalendarClear}
                    origin = {{vertical: "center", horizontal: "right"}} 
                    point = {{vertical: "center", horizontal: "right"}} 
                    onDayClick = {this.onCalendarDayClick}  
                    onSomedayClick = {this.onCalendarSomedayClick}   
                    onTodayClick = {this.onCalendarTodayClick} 
                    onThisEveningClick = {this.onCalendarThisEveningClick}
                    onAddReminderClick = {this.onCalendarAddReminderClick}
                /> 

                <TagsPopover   
                    tags={this.props.tags}
                    attachTag={this.attachTag}
                    close = {this.onCloseTagsClick}
                    open = {this.state.showtagsPopover}   
                    anchorEl = {this.tagsPopoverOrigin} 
                    origin = {{vertical: "center", horizontal: "right"}} 
                    point = {{vertical: "center", horizontal: "right"}} 
                />
                
            {     
                buttonsNamesToDisplay.indexOf("Calendar")===-1 ? null : 

                <div ref={(e) => { this.calendarOrigin=e; }}>  
                    <IconButton 
                    onClick = {this.onCalendarIconClick} 
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
                buttonsNamesToDisplay.indexOf("Tag")===-1 ? null :  

                <div ref={(e) => { this.tagsPopoverOrigin=e;}} > 
                    <IconButton   
                        onClick = {this.onTagsIconClick}
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
                buttonsNamesToDisplay.indexOf("Add")===-1 ? null :  

                <IconButton      
                    onClick = {this.onCheckListIconClick}
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
                buttonsNamesToDisplay.indexOf("Flag")===-1 ? null :  

                <div ref={(e) => { this.calendarSimpleOrigin=e; }}>  
                    <IconButton 
                        onClick = {this.onFlagIconClick} 
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
 
 

 