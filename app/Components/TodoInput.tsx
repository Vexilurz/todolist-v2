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
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
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
import { TagsPopover } from './TagsPopover';
import { Transition } from 'react-transition-group';
import { Category } from '../MainContainer';
import { TextField } from 'material-ui';
import { ThingsCalendar } from './ThingsCalendar';
import { DraggableCore } from 'react-draggable';   
import { Data } from './ResizableHandle';
import { insideTargetArea, debounce } from '../utils';
let moment = require("moment");


function daysRemaining(date) {
    var eventdate = moment(date);
    var todaysdate = moment();
    return eventdate.diff(todaysdate, 'days');
}

let getItem = (value,index) => null;



let createSortableItem = (index) => SortableElement(({value}) => getItem(value,index)); 



let getCheckList = (items:ChecklistItem[]) =>  
    <ul style={{
        zIndex:10,
        padding:0,
        margin:0  
    }}>   
        {    
            items.map(      
             (item:ChecklistItem, index) => { 
                let SortableItem = createSortableItem(index); 
                return <SortableItem  style={{zIndex:10000000}} key={`item-${item.key}`} index={index} value={item} />
              }
            ) 
        }   
    </ul>;    
         


const SortableList = SortableContainer(({items}) => getCheckList(items),{withRef:true}); 

  


export interface ChecklistItem{
    text : string, 
    checked : boolean,
    idx : number,
    key? : string  
} 
 
interface TodoInputProps{ 
    dispatch : Function, 
    tags : string[], 
    todos : Todo[],
    todo : Todo, 
    rootRef : HTMLElement,  
    selectedCategory : string, 
    idx : number
}   
 
interface TodoInputState{
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
    dragging : boolean, 
    x:number,
    y:number    
}    
 
export class TodoInput extends Component<TodoInputProps,TodoInputState>{
    
    calendarOrigin:HTMLElement;
    tagsPopoverOrigin:HTMLElement;
    ref:HTMLElement;
    SortableList:JSX.Element;
    transitionOffset:number;
    checklistBuffer:ChecklistItem[];

    constructor(props){

        super(props);  

        getItem = this.getCheckListItem;

        this.checklistBuffer = clone(this.props.todo.checklist); 
         
        this.transitionOffset = 40;

        this.state={  
            newSelectedCategory : null,
            formId : this.props.todo._id, 
            checklist : this.props.todo.checklist,
            checked : this.props.todo.checked,
            showCalendar : false,  
            showtagsPopover : false, 
            attachedDate : this.props.todo.attachedDate,
            currentTodo : this.props.todo.title, 
            currentNote : this.props.todo.note, 
            currentTag : '',  
            deadline : null, 
            attachedTags : this.props.todo.attachedTags,
            reminder : null,
            open : false,
            dragging:false, 
            x:0,
            y:0  
        }    
    }    
 

    onError = (e) => console.log(e);
 

    onFieldsContainerClick = (e) => {   
        e.stopPropagation();  
        let now = new Date().getTime();
     
        if(!this.state.open)
            this.setState({open:true});  
    } 

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
            this.state.open ? 
            this.setState(
                {open:false}, 
                () => this.addTodoFromInput()
            ) : null; 
        }
    }
         
 
    componentDidMount(){ 
        if(this.props.rootRef)  
           this.props.rootRef.addEventListener("click", this.onOutsideClick);  
    
        if(isEmpty(this.state.currentTodo))   
           setTimeout(() => this.setState({open:true}), 10);   
    }     
    

    componentWillUnmount(){
      if(this.props.rootRef)  
         this.props.rootRef.removeEventListener("click", this.onOutsideClick);
    }
    
 

    getCheckListItem = (
        value:ChecklistItem, 
        index:number,
    ) => {
        const DragHandle = SortableHandle(() => 
                <Reorder   
                    style={{ 
                        cursor: "default",
                        marginRight: "5px",  
                        color: "rgba(100, 100, 100, 0.17)"
                    }}
                />  
        );  
         
        return <li  style={{zIndex:10000000, width:"100%"}}>  
            <div  className="toggleFocus"
                style={{   
                    width:"100%",
                    fontSize:"16px",
                    border:"1px solid rgba(150,150,150,0.1)",
                    borderRadius:"5px",
                    alignItems:"center", 
                    display:"flex",   
                }}
            >  
                <div 
                 onClick={this.onChecklistItemCheck(index)}
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
                        id={index.toString()}
                        fullWidth={true}   
                        defaultValue={value.text}
                        hintStyle={{top:"3px", left:0, width:"100%", height:"100%"}}  
                        style={{height:"28px"}}  
                        inputStyle={{fontWeight:600, color:"rgba(100,100,100,1)", fontSize:"16px"}}   
                        underlineFocusStyle={{borderColor: "rgba(0,0,0,0)"}}  
                        underlineStyle={{borderColor: "rgba(0,0,0,0)"}}   
                        onChange={this.onChecklistItemChange(index)}
                        onBlur={this.onChecklistItemBlur} 
                    />          
                    <DragHandle />
            </div> 
        </li>;     
    }
 

    generateTagElement = (tag:string,idx:number) => 
        <div key={String(idx)}>  
            <div style={{ 
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
        </div>;  


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


    removeTodoLocal = (_id:string) => {
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
    

    addTodoFromInput = () => {
        
        let todo : Todo = {
            _id : this.props.todo._id,
            category :  this.state.newSelectedCategory ? 
                        this.state.newSelectedCategory : 
                        this.props.selectedCategory,   
            title : this.state.currentTodo, 
            priority : this.props.idx, 
            reminder : null, 
            checked:this.state.checked, 
            note : this.state.currentNote,
            checklist: this.state.checklist,  
            attachedProjects : [],  
            attachedTags : this.state.attachedTags,
            status : "",
            attachedDate : this.state.attachedDate,
            deadline : null,
            created : new Date(),  
            deleted : null,
            fulfilled : null, 
            history : [],   
            attachemnts : []
        };   
 
        //if(isEmpty(this.state.currentTodo)){
        //   removeTodo(todo._id); 
        //   this.removeTodoLocal(todo._id);
        //}
        //else{  
        updateTodo(todo._id,todo,this.onError);
        this.updateTodo(todo); 
        //}   
        
    } 
     

 
    onChecklistItemBlur = () => 
        this.setState({
            checklist:this.checklistBuffer 
        }, () => {
            let checklist = [...this.state.checklist]; 
            let allNotEmpty = all((v) => v, map((c:ChecklistItem) => !isEmpty(c.text))(checklist));
            
            if(allNotEmpty){
                checklist.push({checked:false, text:'', idx:checklist.length, key: uniqid()});
                this.checklistBuffer=checklist; 
                this.setState({checklist}); 
            }  
        });  
 


    onChecklistItemChange = (index:number) => 
        (event,newText:string) => { 
            if(isNil(this.ref))
               return; 

            let idx = findIndex((c:ChecklistItem) => c.idx===index)(this.checklistBuffer);
            
            if(idx!==-1){ 
                let updatedItem = this.checklistBuffer[idx];
                    
                updatedItem.text = newText;
                updatedItem.idx = index; 

                let checklist = [
                    ...this.checklistBuffer.slice(0,idx),
                    updatedItem, 
                    ...this.checklistBuffer.slice(idx+1) 
                ];   
                
                this.checklistBuffer = checklist;  
            } 
        }; 
   

    onChecklistItemCheck = (index:number) => 
        (e) => {
            e.stopPropagation();

            if(isNil(this.ref))
               return;  
    
            let idx = findIndex((c:ChecklistItem) => c.idx===index)(this.checklistBuffer);
            
            if(idx!==-1){
                let updatedItem = this.checklistBuffer[idx];
                
                updatedItem.checked=!updatedItem.checked;
                updatedItem.idx = index; 
 
                let checklist = [
                    ...this.checklistBuffer.slice(0,idx),
                    updatedItem, 
                    ...this.checklistBuffer.slice(idx+1) 
                ];   
                
                this.checklistBuffer = checklist; 
                
                this.setState({
                    checklist:this.checklistBuffer
                })
            } 
        };


    

    onNotesChange = (event,newValue:string) => this.setState({currentNote:newValue});

    onNewTodoChange = (event,newValue:string) => this.setState({currentTodo:newValue});
    
    onTagInputChange = (event,value) => {
        event.persist(); 
        this.setState({ currentTag:value });  
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
    

 
 
    render(){  
     let daysLeft = daysRemaining(this.state.attachedDate);
     return  <div   
    
            
            onContextMenu={(e) => {
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
            }}
            style={{    
                transform:`translate(${this.state.x}px,${this.state.y}px)`, 
                width:"100%",     
                display:"flex",    
                postiopn:"relative",
                alignItems:"center",  
                justifyContent:"center"
            }} 
    >  
         
         
        <div 
        ref={(e) => { this.ref=e; }} 
        style={{          
            zIndex:200, 
            transition: "box-shadow 0.4s ease-in-out, max-height 0.4s ease-in-out, transform 0.4s ease-in-out", 
            maxHeight:this.state.open ? "1000px" : "30px",
            width:"100%",        
            boxShadow:this.state.open ? "rgba(156, 156, 156, 0.3) 0px 0px 20px" : "", 
            borderRadius:"5px", 
            marginBottom:this.state.open ? "90px" : "10px", 
            transform:`translateY(${this.state.open ? this.transitionOffset : 0}px)`    
        }}>           
    
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
                        onClick = {(e) => { 
                            e.stopPropagation(); 
                            if(!this.state.open)
                               this.setState({checked:!this.state.checked}) 
                        }} 
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

                    <div style={{   
                            display:"flex",
                            flexDirection:"column",
                            width:"90%" 
                        }}  
                        onClick={this.onFieldsContainerClick}
                    >   
                   
                        <div  style={{display:"flex"}}>
                            <TextField  
                                hintText = "New To-Do"   
                                defaultValue = {this.state.currentTodo} 
                                fullWidth = {true}   
                                onChange={debounce(this.onNewTodoChange)}
                                inputStyle = {{fontWeight:600, color:"rgba(100,100,100,1)", fontSize:"16px"}}  
                                hintStyle = {{top:"3px", left:0, width:"100%", height:"100%"}}   
                                style = {{height:"28px"}}      
                                underlineFocusStyle = {{borderColor: "rgba(0,0,0,0)"}}    
                                underlineStyle = {{borderColor: "rgba(0,0,0,0)"}}  
                            /> 
                            {
                                this.state.open ? null :
                                this.state.attachedDate ?
                                    <p style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent:"flex-end", 
                                        color:(  
                                            daysLeft === 1 || daysLeft === 0
                                        ) ? "rgba(200,0,0,0.7)" : "rgba(100,100,100,0.3)",  
                                        textAlign: "center",
                                        width: "240px",  
                                        fontFamily: "sans-serif"
                                    }}> 
                                            <Flag  
                                                style={{
                                                    width:"18px",  
                                                    height:"18px",
                                                    marginLeft:"3px",
                                                    color: (
                                                        daysLeft === 1 || daysLeft === 0
                                                    ) ? "rgba(200,0,0,0.7)" : "rgba(100,100,100,0.3)", 
                                                    marginRight:"5px" 
                                                }}
                                            />  

                                            { Math.abs(daysLeft) }  
                                            { 
                                                daysLeft < 0 ? " days ago" :
                                                daysLeft === 1 ? " day left" : " days left"
                                            }
                                            
                                    </p>    
                                    :
                                    null  
                            }  
                        </div>  



                            <div style={{
                                transition: "opacity 0.5s ease-in-out",
                                opacity:this.state.open ? 1 : 0
                            }}>      
                                { 
                                    <TextField 
                                        defaultValue={this.state.currentNote} 
                                        hintText="Notes"
                                        fullWidth={true}  
                                        hintStyle={{ 
                                        top: "3px", left: 0,  
                                        width:"100%", height:"100%"
                                        }}     
                                        onChange={debounce(this.onNotesChange)}
                                        style={{height:"28px", marginBottom:"15px", marginTop:"15px"}}  
                                        inputStyle={{
                                            fontFamily:"sans-serif",
                                            fontSize:"14px"   
                                        }} 
                                        underlineFocusStyle={{borderColor: "rgba(0,0,0,0)"}} 
                                        underlineStyle={{borderColor: "rgba(0,0,0,0)"}}   
                                    />   



                                } 
                                {    
                                    <SortableList
                                        shouldCancelStart={() => false}
                                        lockToContainerEdges={true}  
                                        distance={0}   
                                        items={this.state.checklist}   
                                        useDragHandle={true} 
                                        axis='y'   
                                        lockAxis={'y'} 
                                        onSortEnd={({oldIndex, newIndex}) => {

                                            let moved = arrayMove(this.state.checklist,oldIndex,newIndex);

                                            let updated = moved.map((el:ChecklistItem,idx) => {
                                                el.idx=idx; return el; 
                                            });  

                                            this.checklistBuffer = [...updated]; 

                                            this.setState({checklist: updated}); 

                                        }} 
                                        onSortStart={() => {}}
                                    /> 
                                } 
                                {    
                                    isEmpty(this.state.attachedTags) ? null : 
                                    <div style={{
                                      display:"flex", alignItems:"center", 
                                      justifyContent:"flex-start", flexWrap:"wrap",
                                      //marginTop:"30px", marginBottom:"15px"
                                    }}>    
                                        {this.state.attachedTags.map(this.generateTagElement)}   
                                        <TextField    
                                            defaultValue={this.state.currentTag}
                                            onChange={this.onTagInputChange}
                                            onBlur={this.onTagFieldBlur}    
                                            hintText=""
                                            onKeyPress={this.onTagFieldEnterPress}
                                            underlineFocusStyle={{borderColor: "rgba(0,0,0,0)"}} 
                                            underlineStyle={{borderColor: "rgba(0,0,0,0)"}}   
                                        />    
                                    </div>
                                }  
                            </div>  
                    </div>   
                </div>   
 
                { 
                    <TodoInputFooter 
                        open = {this.state.open}
                        buttonsNamesToDispaly={[ 
                            //isNil(this.state.attachedDate) ? "Calendar" : undefined, 
                            //isEmpty(this.state.attachedTags) ? "Tag" : undefined,  
                            "Calendar",
                            "Tag",
                            isEmpty(this.state.checklist) ? "Add" : undefined, 
                            isNil(this.state.deadline) ? "Flag" : undefined
                        ].filter(v => !!v) as any}   
                        onCheckListClick={(e) => {
                            if(isEmpty(this.state.checklist)){ 
                               let firstItem = {checked:false, text:'', idx:0, key: uniqid()};
                               this.checklistBuffer=[firstItem];
                               this.setState({
                                  checklist:[firstItem]
                               })  
                            }
                        }}     

                        onFlagClick={(e) => { 
                            //?
                        }} 

                        onCalendarClick={(e) => this.setState({showCalendar:true})} 

                        closeCalendar={(e) => this.setState({showCalendar:false})} 

                        onTagsClick={(e) => this.setState({showtagsPopover:true})} 

                        onCloseTagsClick={(e) => this.setState({showtagsPopover:false})} 

                        tags={this.props.tags}

                        attachTag={(tag:string) => {
                            let tags = this.state.attachedTags;
                            tags.push(tag);
                            this.setState({attachedTags:uniq(tags), showtagsPopover:false});
                        }}   


                        tagsPopoverOpened={this.state.showtagsPopover} 

                        showCalendar={this.state.showCalendar}

                        onDateClick ={
                            (day: Date, modifiers: Object, e : any) => 
                             this.setState({showCalendar:false, attachedDate:day})
                        } 
  
                        onSomedayClick={(e) => {
                            this.setState({ 
                                showCalendar:false,
                                newSelectedCategory:"someday"
                            })
                        }}
                        onTodayClick={(e) => {
                            this.setState({ 
                                showCalendar:false,
                                newSelectedCategory:"today"
                            })
                        }}
                        onThisEveningClick={(e) => {
                            this.setState({ 
                                showCalendar:false,
                                newSelectedCategory:"evening"
                            })
                        }}
                        onAddReminderClick={(e) => {
                            this.setState({ 
                                showCalendar:false,
                                reminder:{} 
                            }) 
                        }}
                        onClear={(e) => {
                           this.setState({
                               showCalendar:false,
                               newSelectedCategory:null, 
                               attachedDate:null 
                           })
                        }}
                    /> 
                }   
        </div>
        </div> 
        
    }
}  
 





























type TodoInputButtonName = "Calendar" | "Tag" | "Add" | "Flag";


interface TodoInputFooterProps{
    open : boolean,
    buttonsNamesToDispaly : TodoInputButtonName[]
    onCheckListClick : Function, 
    onFlagClick : Function,
    
    onCalendarClick : Function,
    closeCalendar : Function,
    onDateClick:(day: Date, modifiers: Object, e : any) => void,
    
    onTagsClick : Function,  
    onCloseTagsClick : Function, 

    tags : string[],
    attachTag : (tag:string) => void
    
    tagsPopoverOpened : boolean,  
    showCalendar : boolean,
    
    onSomedayClick : (e:any) => void, 
    onTodayClick : (e:any) => void, 
    onThisEveningClick : (e:any) => void, 
    onAddReminderClick : (e:any) => void, 
    onClear : (e:any) => void
} 
 
  
class TodoInputFooter extends Component<TodoInputFooterProps,{}>{ 

    calendarOrigin:HTMLElement;
    tagsPopoverOrigin:HTMLElement; 


    constructor(props){
        super(props);
    }
    
 
    render(){
        return <div 
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            position: "sticky",
            bottom: 0,
            zIndex:5,  
            padding: "5px",
            right: 0  
        }}>    
            <ThingsCalendar
                close = {this.props.closeCalendar}   
                open = {this.props.showCalendar}
                anchorEl = {this.calendarOrigin}
                origin = {{vertical: "center", horizontal: "left"}}  
                point = {{vertical: "center", horizontal: "right"}}   
                simple = {false} 
                onDayClick = {this.props.onDateClick} 
                onSomedayClick = {this.props.onSomedayClick}   
                onTodayClick = {this.props.onTodayClick} 
                onThisEveningClick = {this.props.onThisEveningClick}
                onAddReminderClick = {this.props.onAddReminderClick}
                onClear = {this.props.onClear}
            />       

            {     
                !contains("Calendar")(this.props.buttonsNamesToDispaly as any) ? null :     
                <div ref={(e) => { this.calendarOrigin=e; }}>  
                    <IconButton 
                    onClick = {this.props.onCalendarClick} 
                    iconStyle={{  
                        transition: "opacity 0.5s ease-in-out",
                        opacity: this.props.open ? 1 : 0,
                        color:"rgb(207,206,207)",
                        width:"25px",   
                        height:"25px"  
                    }}>      
                        <Calendar /> 
                    </IconButton> 
                </div> 
            } 


            <TagsPopover   
                tags={this.props.tags}
                attachTag={this.props.attachTag}
                close = {this.props.onCloseTagsClick}
                open = {this.props.tagsPopoverOpened}   
                anchorEl = {this.tagsPopoverOrigin}
                origin = {{vertical: "bottom", horizontal: "left"}} 
                point = {{vertical: "top", horizontal: "right"}} 
            />


            {
                !contains("Tag")(this.props.buttonsNamesToDispaly as any) ? null : 
                <div ref={(e) => { this.tagsPopoverOrigin=e; }}> 
                    <IconButton  
                        onClick = {this.props.onTagsClick}
                        iconStyle={{ 
                            transition: "opacity 0.5s ease-in-out",
                            opacity: this.props.open ? 1 : 0,
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
                !contains("Add")(this.props.buttonsNamesToDispaly as any) ? null : 
                <IconButton      
                    onClick = {this.props.onCheckListClick}
                    iconStyle={{ 
                        transition: "opacity 0.5s ease-in-out",
                        opacity: this.props.open ? 1 : 0,
                        color:"rgb(207,206,207)",
                        width:"25px", 
                        height:"25px" 
                    }}
                >      
                    <List />
                </IconButton> 
            }

            {    
                !contains("Flag")(this.props.buttonsNamesToDispaly as any) ? null : 
                <IconButton 
                    onClick = {this.props.onFlagClick} 
                    iconStyle={{  
                        transition: "opacity 0.5s ease-in-out",
                        opacity: this.props.open ? 1 : 0,
                        color:"rgb(207,206,207)",
                        width:"25px", 
                        height:"25px" 
                    }}
                >     
                    <Flag />
                </IconButton>  
            } 
        </div>
    }


}