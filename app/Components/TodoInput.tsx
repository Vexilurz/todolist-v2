import '../assets/styles.css';  
import '../assets/calendarStyle.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, 
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, 
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, groupBy, concat, flatten, ifElse, uniq, splitAt 
} from 'ramda';  
import { ipcRenderer } from 'electron'; 
import IconButton from 'material-ui/IconButton';  
import { Component } from "react";  

import SortableContainer from '../sortable-hoc/sortableContainer';
import SortableElement from '../sortable-hoc/sortableElement';
import SortableHandle from '../sortable-hoc/sortableHandle';
import {arrayMove} from '../sortable-hoc/utils';

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
import {  Todo, updateTodo, addTodo, generateID, removeTodo } from '../databaseCalls';
let uniqid = require("uniqid");  
import Popover from 'material-ui/Popover';
import { Category } from '../MainContainer';
import { TextField } from 'material-ui'; 
import { ThingsCalendar } from './ThingsCalendar';
import { Data } from './ResizableHandle'; 
import { insideTargetArea, debounce, daysRemaining } from '../utils';
import { SelectedCategoryLabel } from './SelectedCategoryLabel';
import { DeadlineLabel } from './DeadlineLabel';
let Autosuggest = require('react-autosuggest');
 

 

let todoChanged = (oldTodo:Todo,newTodo:Todo) : boolean => {
    
    if(oldTodo.checklist.length!==newTodo.checklist.length)
        return true;
        
    if(oldTodo.attachedProjects.length!==newTodo.attachedProjects.length)   
        return true;

    if(oldTodo.attachedTags.length!==newTodo.attachedTags.length)
        return true;


    if(oldTodo.category!==newTodo.category)
        return true;

    if(oldTodo.title!==newTodo.title)
        return true;

    if(oldTodo.checked!==newTodo.checked)
        return true;   

    if(oldTodo.note!==newTodo.note)
        return true;   


    if(oldTodo.deadline instanceof Date  &&  newTodo.deadline instanceof Date){

        if(oldTodo.deadline.getTime()!==newTodo.deadline.getTime())
            return true;  

    }else{

        if(oldTodo.deadline!==newTodo.deadline)
            return true;  

    }  
    

    if(oldTodo.attachedDate instanceof Date  &&  newTodo.attachedDate instanceof Date){
        
        if(oldTodo.attachedDate.getTime()!==newTodo.attachedDate.getTime())
            return true;  

    }else{

        if(oldTodo.attachedDate!==newTodo.attachedDate)
            return true;  

    }   


    /// ???
    if(oldTodo.priority!==newTodo.priority)
        return true;  

    /// ???
    if(oldTodo.reminder!==newTodo.reminder)
        return true;  



    for(let i=0; i<oldTodo.checklist.length; i++){

        let oldItem : ChecklistItem = oldTodo.checklist[i];
        let newItem : ChecklistItem = newTodo.checklist[i];
 
        if(oldItem.checked!==newItem.checked)
           return true; 

        if(oldItem.idx!==newItem.idx)
           return true;  
        
        if(oldItem.text!==newItem.text)
           return true; 
        
        if(oldItem.key!==newItem.key)
           return true; 

    }


    for(let i=0; i<oldTodo.attachedProjects.length; i++)
        if(oldTodo.attachedProjects[i]!==newTodo.attachedProjects[i])
           return true; 
    


    for(let i=0; i<newTodo.attachedTags.length; i++)
        if(oldTodo.attachedTags[i]!==newTodo.attachedTags[i])
           return true; 
    
}




     
 
let generateTagElement = (tag:string,idx:number) => 
    <div key={String(idx)}>  
        <div style={{ 
                transition:"opacity 0.4s ease-in-out", 
                opacity:1,
                width:"auto",  
                height:"24px", 
                alignItems:"center",
                display:"flex",
                color:"rgba(74,136,114,0.9)",
                cursor:"pointer",
                marginRight:"5px",
                marginTop:"5px", 
                backgroundColor:"rgb(171,212,199)",
                borderRadius:"100px",
                fontWeight:700,
                fontFamily:"sans-serif" 
            }}
        >      
            <div style={{padding:"10px"}}>  
            {splitAt(25,tag)[0] + (tag.length > 25 ? "..." : '')}  
            </div>
        </div>
    </div>






let daysLeftMark = (open:boolean, attachedDate) => {

    if(open)
       return null;
    
    if(isNil(attachedDate))
       return null;   

    let daysLeft = daysRemaining(attachedDate);      

    let flagColor = (daysLeft === 1 || daysLeft === 0) ? "rgba(200,0,0,0.7)" : "rgba(100,100,100,0.3)";
       
    let style : any = {
        display: "flex",
        alignItems: "center",
        justifyContent:"flex-end", 
        color:flagColor,
        fontSize:"15px", 
        textAlign: "center",
        width: "240px",  
        fontFamily: "sans-serif"
    };   

    let iconStyle = {
        width:"18px",  
        height:"18px",
        marginLeft:"3px",
        color: flagColor, 
        marginRight:"5px" 
    };
       
    let attachedText = "";
 
    if(daysLeft < 0){

       attachedText = " days ago";

    }else if(daysLeft === 1){

       attachedText = " day left"; 

    }else{ 

       attachedText = " days left";

    }

    return <p style={style}>
                <Flag style={iconStyle}/>   
               { Math.abs(daysLeft) }{ attachedText }
           </p>  

}  



 

export interface ChecklistItem{
    text : string, 
    checked : boolean,
    idx : number,
    key? : string  
}  
 



export interface TodoInputState{
    formId : string, 
    checklist : ChecklistItem[], 
    showtagsPopover : boolean, 
    checked,
    currentTodo : string,  
    currentNote : string,
    attachedDate : Date,
    showCalendar : boolean,  
    currentTag : string,
    attachedTags : string[],
    open : boolean,
    reminder : any,
    newSelectedCategory : Category,
    deadline : Date,
    selectedTags : string[],
    tagsInputDisplay:boolean,
    showSimpleCalendar:boolean
}  
  


 
export interface TodoInputProps{ 
    dispatch : Function, 
    tags : string[], 
    todos : Todo[],
    todo : Todo, 
    rootRef : HTMLElement,  
    selectedCategory : string, 
    idx : number,
    id:string
}   
 
 



export class TodoInput extends Component<TodoInputProps,TodoInputState>{
    

    calendarOrigin:HTMLElement;

    calendarSimpleOrigin:HTMLElement;

    tagsPopoverOrigin:HTMLElement;

    ref:HTMLElement;

    transitionOffset:number;

    checklistBuffer:ChecklistItem[];

    onError = (e) => console.log(e);


 
    constructor(props){

        super(props);  

        this.checklistBuffer = [...this.props.todo.checklist]; 
         
        this.transitionOffset = 40; 

        this.state={  
              
            open : false,
            formId : this.props.todo._id, 
            showCalendar : false,  
            showtagsPopover : false, 
            currentTag : '', 
            tagsInputDisplay : false, 
            selectedTags : this.props.tags,
            showSimpleCalendar:false,   


            checklist : this.props.todo.checklist,
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



    componentDidMount(){ 

        if(this.props.rootRef)  
           this.props.rootRef.addEventListener("click", this.onOutsideClick);  
     
        this.setState({checklist:this.checklistBuffer});
 
        if(isEmpty(this.state.currentTodo))   
           setTimeout(() => this.setState({open:true}), 10);   

    }      
      


    componentWillUnmount(){

        if(this.props.rootRef)  
           this.props.rootRef.removeEventListener("click", this.onOutsideClick);

    }
    

     
    enableDragOfThisItem = () => {
        
            this.ref["preventDrag"] = false; 

    }
    


    preventDragOfThisItem = () => {

           this.ref["preventDrag"] = true; 

    }

 

    onFieldsContainerClick = (e) => {   

        if(!this.ref) 
            return; 

        this.preventDragOfThisItem();


        if(!this.state.open)
            this.setState({open:true});  

    } 
 

 
    onNotesChange = debounce((event,newValue:string) => this.setState({currentNote:newValue}), 200)
    
 
 
    onNewTodoChange = debounce((event,newValue:string) => this.setState({currentTodo:newValue}),200)

    

    onOutsideClick = (e) => {

        if(!this.ref)
            return; 

        if(!this.props.rootRef)
            return;


        let rect = this.ref.getBoundingClientRect();

        let inside = false;

        let x = e.pageX;

        let y = e.pageY;
             
        let bottom = rect.bottom;
        
        let top = rect.top;
          

        if( x>rect.left && x<rect.right ) 

            if( y>rect.top && y<bottom )

                inside = true;  
              

        if(!inside){   

            if(this.state.open){

                this.enableDragOfThisItem();

                this.setState(
                    
                    {open:false}, 
                    
                    () => {
                        let todo : Todo = {
                            _id : this.props.todo._id,
                            category :  this.state.newSelectedCategory,  
                            title : this.state.currentTodo, 
                            priority : this.props.idx, 
                            reminder : this.state.reminder, 
                            checked : this.state.checked, 
                            note : this.state.currentNote,
                            checklist : this.state.checklist,  
                            attachedProjects : this.props.todo.attachedProjects,  
                            attachedTags : this.state.attachedTags,
                            status : "",
                            attachedDate : this.state.attachedDate,
                            deadline : this.state.deadline,
                            created : new Date(),  
                            deleted : null,
                            fulfilled : null, 
                            history : [],   
                            attachemnts : []
                        };   
                        
                        if(isEmpty(this.state.currentTodo) || todoChanged(this.props.todo,todo))
                           this.addTodoFromInput(todo);
                    }    

                ); 

            }

        }   

    }   
      


    updateTodo = (changedTodo:Todo) => {
        let idx = findIndex((t:Todo) => changedTodo._id===t._id)(this.props.todos);
         
        if(idx!==-1)
            this.props.dispatch({
                type:"todos",
                load: [
                  ...this.props.todos.slice(0,idx),
                  changedTodo,
                  ...this.props.todos.slice(idx+1),
                ]
            });  
    }  

    

    removeTodo = (_id:string) => {
        let idx = findIndex((item:Todo) => item._id===_id)(this.props.todos);
 
        if(idx!==-1)
           this.props.dispatch({
                type:"todos",
                load: [
                    ...this.props.todos.slice(0,idx),
                    ...this.props.todos.slice(idx+1),
                ]
           });
    }   
    


    addTodoFromInput = (todo:Todo) => {
        
        if(isEmpty(this.state.currentTodo)){

            removeTodo(todo._id); 

            this.removeTodo(todo._id);

        }else{  
 
            updateTodo(todo._id,todo,this.onError);

            this.updateTodo(todo); 

        }   
        
    } 
      


    onCheckListEnterPress = (event) => {

        if (event.which == 13 || event.keyCode == 13) {

            this.setState(
        
                {checklist:this.checklistBuffer}, 

                () => {

                    let allNotEmpty = all((v) => v, map((c:ChecklistItem) => !isEmpty(c.text))(this.checklistBuffer));
                    
                    if(allNotEmpty){

                        this.checklistBuffer.push({
                            checked:false, 
                            text:'', 
                            idx:this.checklistBuffer.length, 
                            key: uniqid()
                        });

                        this.setState(
                            {checklist:this.checklistBuffer}
                        ); 

                    }  
    
                }

            );  

        }
    } 

 

    onChecklistItemBlur = (e) => {
         
        this.setState(
        
            {checklist:this.checklistBuffer}, 

            () => {

                let allNotEmpty = all((v) => v, map((c:ChecklistItem) => !isEmpty(c.text))(this.checklistBuffer));
                
                if(allNotEmpty){
                    this.checklistBuffer.push({
                        checked:false, 
                        text:'', 
                        idx:this.checklistBuffer.length, 
                        key: uniqid()
                    });

                    this.setState(
                        {checklist:this.checklistBuffer}
                    ); 
                }  
  
            }

        );  

    }



    onChecklistItemChange = (key:string) => {
     
        return (event,newText:string) => { 
            event.persist(); 

            if(isNil(this.ref))
               return; 

            let idx = findIndex((c:ChecklistItem) => c.key===key)(this.checklistBuffer);
            
            if(idx!==-1){
                let updatedItem = this.checklistBuffer[idx];
                    
                updatedItem.text = newText;

                let checklist = [
                    ...this.checklistBuffer.slice(0,idx),
                    updatedItem, 
                    ...this.checklistBuffer.slice(idx+1) 
                ];   
                
                this.checklistBuffer = checklist;
            }

        }; 

    }

    

    onChecklistItemCheck = (key:string) => (e) => {

        if(isNil(this.ref))
            return;  

        let idx = findIndex((c:ChecklistItem) => c.key===key)(this.checklistBuffer);
        
        if(idx!==-1){

            let updatedItem = this.checklistBuffer[idx];
            
            updatedItem.checked=!updatedItem.checked;

            let checklist = [
                ...this.checklistBuffer.slice(0,idx),
                updatedItem, 
                ...this.checklistBuffer.slice(idx+1) 
            ];   
            
            this.checklistBuffer = checklist; 
            
            this.setState({checklist:this.checklistBuffer});

        } 

    }
 

    
    onTagFieldEnterPress = (event) => {  

        if(event.key==="Enter"){
            let tag = this.state.currentTag;  

            if(isEmpty(tag)) 
               return;

            let tags = this.state.attachedTags;

            tags.push(tag);

            this.setState({currentTag:'', attachedTags:uniq(tags)});
        } 
        
    }  
    


    onTagFieldBlur = (event) => {  

        let tag = this.state.currentTag; 
            
        if(isEmpty(tag))
           return;

        let tags = this.state.attachedTags;

        tags.push(tag);

        this.setState({currentTag:'', attachedTags:uniq(tags)});

    }



    getCheckListItem = (value:ChecklistItem, index:number) => {

        const DragHandle = SortableHandle(() => 
            <Reorder style={{ 
                        cursor: "default",
                        marginRight: "5px",  
                        color: "rgba(100, 100, 100, 0.17)"
                    }}
            />  
        );  

          
        return <li style={{width:"100%"}}>  

            <div className="toggleFocus"
                 style={{   
                    transition: "opacity 0.4s ease-in-out", 
                    opacity:1,
                    width:"100%", 
                    fontSize:"16px",
                    border:"1px solid rgba(150,150,150,0.1)",
                    borderRadius:"5px",
                    alignItems:"center", 
                    display:"flex",   
                 }}
            >  
                <div  onClick={this.onChecklistItemCheck(value.key)}
                    style={{
                        backgroundColor:value.checked ? 'rgba(108, 135, 222, 0.8)' : '',
                        width:"15px", 
                        height:"14px",
                        borderRadius:"50px",
                        border:value.checked ? '' : "3px solid rgba(108, 135, 222, 0.8)",
                        boxSizing:"border-box",
                        marginRight:"5px",
                        marginLeft:"5px" 
                    }}  
                >        
                </div>  

                    <TextField  
                        id={value.key}
                        fullWidth={true}   
                        defaultValue={value.text}
                        hintStyle={{top:"3px", left:0, width:"100%", height:"100%"}}  
                        style={{height:"28px",cursor:"default"}}  
                        inputStyle={{fontWeight:600, color:"rgba(100,100,100,1)", fontSize:"16px"}}   
                        underlineFocusStyle={{borderColor: "rgba(0,0,0,0)"}}  
                        underlineStyle={{borderColor: "rgba(0,0,0,0)"}}   
                        onChange={this.onChecklistItemChange(value.key)}
                        onBlur={this.onChecklistItemBlur} 
                        onKeyPress={this.onCheckListEnterPress}
                    />   
  
                    <DragHandle />

            </div> 
        </li>     
    }


 
    createSortableItem = (index) => SortableElement(({value}) => this.getCheckListItem(value,index)) 
     


    getCheckList = (items:ChecklistItem[]) => { 
        
        return <ul style={{padding:0,margin:0}}>   
            {     
                items.map(      
                 (item:ChecklistItem, index) => { 
                    let SortableItem = this.createSortableItem(index); 
                    return <SortableItem  key={`item-${item.key}`} index={index} value={item} />
                  }
                ) 
            }   
        </ul>

    }    
        
     

    createSortableChecklist = () => {

        const SortableList = SortableContainer(({items}) => this.getCheckList(items),{withRef:true});

        return <SortableList
            shouldCancelStart={() => false}
            lockToContainerEdges={true}  
            distance={0}   
            items={this.state.checklist}   
            useDragHandle={true} 
            axis='y'   
            lockAxis={'y'} 
            onSortEnd={({oldIndex, newIndex}) => {

                let updateIndex = (el:ChecklistItem,idx:number) => {
                    el.idx=idx;
                    return el; 
                };

                let moved = arrayMove([...this.state.checklist],oldIndex,newIndex);

                let updated = moved.map(updateIndex);  

                this.checklistBuffer = [...updated]; 

                this.setState({checklist:updated}); 
                
            }} 
            onSortStart={() => {}}
        />

    }  



    onCheckBoxClick = debounce((e) => {  

        if(!this.state.open){

            this.setState( 
                
                
                {checked:!this.state.checked}, 
                
                () => {

                    let todo : Todo = {
                        _id : this.props.todo._id,
                        category :  this.state.newSelectedCategory,  
                        title : this.state.currentTodo, 
                        priority : this.props.idx, 
                        reminder : this.state.reminder, 
                        checked : this.state.checked, 
                        note : this.state.currentNote,
                        checklist : this.state.checklist,  
                        attachedProjects : this.props.todo.attachedProjects,  
                        attachedTags : this.state.attachedTags,
                        status : "",
                        attachedDate : this.state.attachedDate,
                        deadline : this.state.deadline,
                        created : new Date(),  
                        deleted : null,
                        fulfilled : null, 
                        history : [],   
                        attachemnts : []
                    };   
  
                    if(isEmpty(this.state.currentTodo) || todoChanged(this.props.todo,todo))
                       this.addTodoFromInput(todo);

                } 
            ); 
 
        } 

    }, 200)

 

    onRightClickMenu = (e) => {

        if(!this.state.open) 
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
    


    onCheckListIconClick = (e) => {

        if(isEmpty(this.checklistBuffer)){

            let firstItem = {checked:false, text:'', idx:0, key: uniqid()};

            this.checklistBuffer=[firstItem];

            this.setState({checklist:this.checklistBuffer}); 

        }

    }      
 
    onAutoSuggestInputChange = (event, { newValue }) => {
        this.setState({
            currentTag:newValue
        });
    }

    onFlagIconClick = (e) => this.setState({showSimpleCalendar:true})



    onTagsIconClick = (e) => this.setState({showtagsPopover:true})


    
    onCalendarIconClick = (e) => this.setState({showCalendar:true})



    closeCalendar = (e) => this.setState({showCalendar:false})



    onCloseTagsClick = (e) => this.setState({showtagsPopover:false})



    attachTag = (tag:string) => {

        if(isEmpty(tag))
           return;  

        let tags = this.state.attachedTags;

        tags.push(tag);

        this.setState({attachedTags:uniq(tags), currentTag:'', showtagsPopover:false});

    }   



    onCalendarDayClick = (day:Date,modifiers:Object,e:any) => {

        this.setState({
            showCalendar:false, attachedDate:day
        }) 

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
     


    onRemoveSelectedCategoryLabel = () => {

        this.setState({
            newSelectedCategory:this.props.selectedCategory as any,
            attachedDate:null 
        })
 
    }  



    onCalendarAddReminderClick = (e) => {

        this.setState({ 
            showCalendar:false, reminder:{} 
        })

    }
    
    

    onCalendarClear = (e) => {

        this.setState({
            showCalendar:false,
            newSelectedCategory:this.props.selectedCategory as any,
            attachedDate:null
        })

    }



    getSuggestionValue = (tag:string) => tag;
      


    renderSuggestion = tag => (
        <div  
            key={tag}  
            className={"tagItem"} style={{
                display:"flex", 
                height:"auto",  
                width:"140px", 
                paddingLeft:"5px", 
                paddingRight:"10px"  
            }}
        >  
            <div style={{width:"24px",height:"24px"}}>
                <TriangleLabel style={{color:"gainsboro"}}/>
            </div> 
            <div style={{
                color:"gainsboro", 
                marginLeft:"5px", 
                marginRight:"5px",
                overflowX:"hidden",
                whiteSpace: "nowrap" 
            }}> 
                {tag}   
            </div>     
        </div>
    )



    getSuggestions = value => {
        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;
         
        return inputLength === 0 ? this.props.tags : this.props.tags.filter(tag =>
            tag.toLowerCase().slice(0, inputLength) === inputValue
        );
    }



    onSuggestionsFetchRequested = ({ value, reason }) => {
        this.setState({
          selectedTags: this.getSuggestions(value),
          tagsInputDisplay: true
        }); 
    }
    
 

    onSuggestionsClearRequested = () => {
        this.setState({ 
            selectedTags: [],
            tagsInputDisplay: false 
        });
    }

 

    render(){  


        let buttonsNamesToDisplay : any = [
            "Calendar",
            "Tag",
            "Flag",
            isEmpty(this.state.checklist) ? "Add" : undefined
        ]; 
 

        return  <div  
                    onClick={(e) => {e.stopPropagation();}}
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
            ref={(e) => { this.ref=e; }} 
            style={{           
                transition: "box-shadow 0.4s ease-in-out, max-height 0.4s ease-in-out, transform 0.4s ease-in-out", 
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
                        transition: "max-height 0.4s ease-in-out", 
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
                                    fontWeight:600, 
                                    color:"rgba(100,100,100,1)", 
                                    fontSize:"16px",
                                    cursor:"default"
                                }}  
                                hintStyle = {{top:"3px", left:0, width:"100%", height:"100%"}}   
                                style = {{height:"28px"}}      
                                underlineFocusStyle = {{borderColor: "rgba(0,0,0,0)"}}    
                                underlineStyle = {{borderColor: "rgba(0,0,0,0)"}}  
                            /> 
 
                            { /*daysLeftMark(this.state.open,this.state.attachedDate)*/ }

                        </div>  

                            <div style={{
                                transition: "opacity 0.5s ease-in-out",
                                opacity:this.state.open ? 1 : 0
                            }}>      
                                  
                                <TextField 
                                    id={ `${this.props.todo._id}note`  }
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
                                   <div 
                                        style={{marginTop:"5px",marginBottom:"15px"}}
                                        onClick={(e) => {e.stopPropagation();}}
                                   > 
                                      {this.createSortableChecklist()}  
                                   </div>
                                {    

                                    isEmpty(this.state.attachedTags) ? null : 
 
                                    <div  
                                        style={{
                                            display:"flex", 
                                            alignItems:"center", 
                                            justifyContent:"flex-start", 
                                            flexWrap:"wrap"
                                        }}  
                                    >    
                                        {this.state.attachedTags.map(generateTagElement)} 
                                    { 
                                    <Autosuggest
                                        suggestions={this.state.selectedTags}
                                        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                                        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                                        getSuggestionValue={this.getSuggestionValue}
                                        onSuggestionSelected={(event, {suggestion, suggestionValue}) => {
                                            this.attachTag(suggestionValue);
                                        }}  
                                        renderSuggestion={this.renderSuggestion}  
                                        shouldRenderSuggestions={(v) => true}
                                        //alwaysRenderSuggestions={true}  
                                        theme={{suggestionsList:"suggestionsList"}}
                                        renderSuggestionsContainer={  
                                            ({containerProps, children, query}) => 
                                                <div    
                                                    {... containerProps}  
                                                    style={{
                                                        zIndex:200,
                                                        backgroundColor: "rgb(39, 43, 53)",
                                                        borderRadius: "10px", 
                                                        
                                                        padding:this.state.tagsInputDisplay &&  
                                                                !isEmpty(this.state.selectedTags) ? "2px 2px" : "",
                                                        position: "absolute", 
                                                        maxHeight: "100px",  
                                                        width: "140px",
                                                        cursor: "pointer" 
                                                    }}
                                                >  
                                                <div    
                                                    className={"darkscroll"}
                                                    style={{
                                                        overflowX: "hidden", 
                                                        maxHeight: "100px", 
                                                        maxWidth: "140px"
                                                    }}
                                                >
                                                { children }
                                                </div>   
                                                </div>  
                                        }      
                                        inputProps={{
                                            style:{  
                                                borderTop: "none",
                                                borderLeft: "none", 
                                                borderRight: "none",
                                                borderBottom: "1px solid rgb(171, 212, 199)",
                                                boxSizing: "content-box", 
                                                color: "rgb(100, 100, 100)",
                                                height: "25px",
                                                fontWeight: "bold",   
                                                width: "140px",
                                                fontFamily: "sans-serif",
                                                fontSize: "16px",
                                                outline: "none"
                                            },
                                            onKeyPress: (event) => {
                                                if (event.which == 13 || event.keyCode == 13) {
                                                    this.attachTag(this.state.currentTag);
                                                    this.setState({currentTag:'', tagsInputDisplay:false});
                                                }  
                                            },
                                            placeholder: '', 
                                            value:this.state.currentTag,
                                            onChange:this.onAutoSuggestInputChange
                                        }}
                                    />
                                    } 
                                    </div>
                                }    
                            </div> 

                    </div>   
                </div>   

 
                {     

                    !contains(
                        this.state.newSelectedCategory,
                        ["evening","today","someday"]
                    ) ? null :

                    !this.state.open ? null :

                    <div>            
                        <SelectedCategoryLabel
                          onRemove={this.onRemoveSelectedCategoryLabel}
                          selectedCategory={this.state.newSelectedCategory}
                        />   
                    </div>  

                }  
 
 
                {

                    !this.state.deadline ? null :

                    !this.state.open ? null :

                    <div>
                        <DeadlineLabel
                            onRemoveDeadline={() => this.setState({deadline:null})}
                            deadline={this.state.deadline} 
                        /> 
                    </div> 

                }
 
  
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
                        anchorEl = {this.calendarOrigin} 
                        origin = {{vertical: "center", horizontal: "right"}} 
                        point = {{vertical: "top", horizontal: "right"}} 
                        simple = {false}   
                        onDayClick = {this.onCalendarDayClick}  
                        onSomedayClick = {this.onCalendarSomedayClick}   
                        onTodayClick = {this.onCalendarTodayClick} 
                        onThisEveningClick = {this.onCalendarThisEveningClick}
                        onAddReminderClick = {this.onCalendarAddReminderClick}
                        onClear = {this.onCalendarClear}
                    /> 
   

                    <ThingsCalendar  
                        close = {() => this.setState({showSimpleCalendar:false})}    
                        open = {this.state.showSimpleCalendar}    
                        anchorEl = {this.calendarSimpleOrigin} 
                        origin = {{vertical: "center", horizontal: "right"}} 
                        point = {{vertical: "top", horizontal: "right"}} 
                        simple = {true}     
                        onDayClick = {(day:Date,modifiers:Object,e:any) => {
                            let remaining = daysRemaining(day);
                             
                            if(remaining>0)
                                this.setState({
                                    showSimpleCalendar:false, 
                                    deadline:day
                                }) 
                        }}   
                        onClear = {(e) => {
                            this.setState({
                                showSimpleCalendar:false, 
                                deadline:null
                            }) 
                        }}
                    /> 


                    <TagsPopover   
                        tags={this.props.tags}
                        attachTag={this.attachTag}
                        close = {this.onCloseTagsClick}
                        open = {this.state.showtagsPopover}   
                        anchorEl = {this.tagsPopoverOrigin} 
                        origin = {{vertical: "center", horizontal: "right"}} 
                        point = {{vertical: "top", horizontal: "right"}} 
                    />
                    {     
                        !contains("Calendar")(buttonsNamesToDisplay as any) ? null :     
                        <div ref={(e) => { this.calendarOrigin=e; }}>  
                            <IconButton 
                            onClick = {this.onCalendarIconClick} 
                            iconStyle={{  
                                transition: "opacity 0.5s ease-in-out",
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
                        !contains("Tag")(buttonsNamesToDisplay as any) ? null : 
                        <div ref={(e) => { this.tagsPopoverOrigin=e;}} > 
                            <IconButton   
                                onClick = {this.onTagsIconClick}
                                iconStyle={{ 
                                    transition: "opacity 0.5s ease-in-out",
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
                        !contains("Add")(buttonsNamesToDisplay as any) ? null : 
                        <IconButton      
                            onClick = {this.onCheckListIconClick}
                            iconStyle={{ 
                                transition: "opacity 0.5s ease-in-out",
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
                        !contains("Flag")(buttonsNamesToDisplay as any) ? null : 
                        <div ref={(e) => { this.calendarSimpleOrigin=e; }}>  
                            <IconButton 
                                onClick = {this.onFlagIconClick} 
                                iconStyle={{  
                                    transition: "opacity 0.5s ease-in-out",
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
        </div>
        </div> 
        
    } 
}  
 
 








interface TagsPopoverProps{
    tags:string[], 
    close : Function,
    open : boolean,
    attachTag:(tag:string) => void,
    origin : any,  
    anchorEl : HTMLElement,
    point : any
}  

export class TagsPopover extends Component<any,any>{
     
        constructor(props){
            super(props);  
        }  

    
        render(){ 
            return <Popover  
                open={this.props.open}
                style={{background:"rgba(39, 43, 53, 0)", backgroundColor:"rgb(39, 43, 53, 0)"}}
                anchorEl={this.props.anchorEl}
                onRequestClose={() => this.props.close()}
                anchorOrigin={this.props.origin} 
                targetOrigin={this.props.point} 
                zDepth={0}
            >     
                <div className={"darkscroll"}
                        style={{  
                            borderRadius:"10px",  
                            width:"140px"
                        }}> 
                    <div    
                        className={"darkscroll"}
                        style={{   
                            backgroundColor: "rgb(39, 43, 53)",
                            paddingRight: "10px",
                            paddingLeft: "10px",
                            paddingTop: "5px",
                            paddingBottom: "5px",
                            maxHeight:"150px",
                            cursor:"pointer",
                            overflowX:"hidden" 
                        }}
                    >    
                        { 
                            map((tag:string) => 

                                <div  
                                    key={tag}  
                                    onClick={() => this.props.attachTag(tag)} 
                                    className={"tagItem"} style={{
                                        display:"flex", 
                                        height:"auto",  
                                        width:"140px", 
                                        paddingLeft:"5px", 
                                        paddingRight:"10px"  
                                    }}
                                >  
                                    <div style={{width:"24px",height:"24px"}}>
                                        <TriangleLabel style={{color:"gainsboro"}}/>
                                    </div> 
                                    <div style={{
                                        color:"gainsboro", 
                                        marginLeft:"5px", 
                                        marginRight:"5px",
                                        overflowX:"hidden",
                                        whiteSpace: "nowrap" 
                                    }}> 
                                        {tag}   
                                    </div>  

                                </div>

                            )(this.props.tags)
                        } 
                    </div>  
                </div>  
            </Popover> 
        } 
      
    }
