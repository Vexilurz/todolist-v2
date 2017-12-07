import '../assets/styles.css';  
import '../assets/calendarStyle.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, 
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, 
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, groupBy, concat, flatten, ifElse, uniq 
} from 'ramda';
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import CircularProgress from 'material-ui/CircularProgress'; 
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import {
  cyan500, cyan700,   
  pinkA200,
  grey100, grey300, grey400, grey500,
  white, darkBlack, fullBlack,
} from 'material-ui/styles/colors'; 
import {fade} from 'material-ui/utils/colorManipulator';
import FlatButton from 'material-ui/FlatButton';
import spacing from 'material-ui/styles/spacing'; 
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AutoComplete from 'material-ui/AutoComplete'; 
import { ipcRenderer } from 'electron';
import Dialog from 'material-ui/Dialog';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Divider from 'material-ui/Divider';
import AppBar from 'material-ui/AppBar'; 
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import DropDownMenu from 'material-ui/DropDownMenu'; 
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton'; 
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import { Component } from "react"; 
import Paper from 'material-ui/Paper';
import { DraggableCore, DraggableEventHandler, DraggableData } from 'react-draggable';
import * as Draggable from 'react-draggable'; 
import { 
    wrapMuiThemeLight, wrapMuiThemeDark, attachDispatchToProps
} from "../utils"; 
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import { createStore, combineReducers } from "redux"; 
import { Provider, connect } from "react-redux";
//import Chip from 'material-ui-next/Chip';
import Chip from 'material-ui/Chip';
//icons
import Star from 'material-ui/svg-icons/toggle/star';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import CheckBoxEmpty from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import CheckBox from 'material-ui/svg-icons/toggle/check-box'; 
import BusinessCase from 'material-ui/svg-icons/places/business-center';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
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
import PouchDB from 'pouchdb-browser';   
import List from 'material-ui/svg-icons/action/list'; 
import { getTodos, queryToTodos, Todo, updateTodo, generateID, addTodo } from '../databaseCalls';
let uniqid = require("uniqid"); 
//import Popover from 'material-ui-next/Popover'; 
import Popover from 'material-ui/Popover';
import { ThingsCalendarSmall } from './thingsCalendarSmall';
import { TagsPopover } from './TagsPopover';





interface TodoCreationFormProps{ 
    tags:string[], 
    dispatch:Function,
    todos:Todo[],
    open:boolean,
    showTags:boolean  
}   
  
interface TodoCreationFormState{
    formId:string, 
    notes : string[],
    showtagsPopover:boolean, 
    currentTodo : string,  
    currentNote : string,
    showCalendar : boolean, 
    currentTag : string,
    attachedTags : string[]
}  
         
  
export class TodoCreationForm extends Component<TodoCreationFormProps,TodoCreationFormState>{
    calendarOrigin:HTMLElement;
    tagsPopoverOrigin:HTMLElement;
    
    constructor(props){  
        super(props); 
        this.state={
            formId:uniqid(),
            notes : [],
            showCalendar:false,  
            showtagsPopover:false,
            currentTodo : '', 
            currentNote : '',
            currentTag:'',
            attachedTags:[]
        }
    } 
    
    onError = (e) => console.log(e);

    createSortableItem = (transform) => SortableElement(({value}) => transform(value)); 

    getNoteElem = (value:string) => 
        <div style={{  
                display:"flex",  
                alignItems:"center", 
                borderBottom:"1px solid rgba(100,100,100,0.2)"
            }} 
            key={value} 
        >      
        <Circle style={{color:"darkcyan"}}/>  
            <div style={{ 
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                position:"relative"  
            }}>      
                <div style={{ 
                    marginLeft:"10px",
                    fontFamily: "sans-serif", 
                    fontSize: "medium", 
                    color: "rgba(100,100,100,1)",
                    fontWeight: 500
                }}>     
                    {value}   
                </div>  
            </div>    
        </div>;
    

    generateTagElement = (tag:string,idx:number) => 
        <div key={String(idx)}>  
            <div style={{ 
                    width: "auto",
                    height: "30px",
                    alignItems: "center",
                    display: "flex",
                    cursor: "pointer",
                    backgroundColor: "rgba(0,122,0,0.2)",
                    borderRadius: "100px",
                    fontWeight: 700,
                    color: "forestgreen",
                    fontFamily: "sans-serif"
            }}>  
                <div style={{padding:"10px"}}> {tag} </div>
            </div>
        </div>;  


    getNotesList = (items:string[]) =>  
        <ul style={{
                zIndex:10,
                padding:0,
                margin:0  
            }}  
        > 
        {    
            items.map(    
                (note:string, index) => {
                    let SortableItem = this.createSortableItem(this.getNoteElem); 
                    return <SortableItem  key={`item-${index}`} index={index} value={note} />
                }
            ) 
        }  
        </ul>;    
   


    createSortableNotesList = (list : string[]) => { 
        let SortableList = SortableContainer(({items}) => this.getNotesList(items),{withRef:true}); 
     
        return <SortableList 
            shouldCancelStart={() => false}
            lockToContainerEdges={true} 
            distance={1}  
            items={list}   
            axis='y'   
            lockAxis={'y'} 
            onSortEnd={
                ({oldIndex, newIndex}) => this.setState({
                    notes: arrayMove(this.state.notes, oldIndex, newIndex),
                })
            }
            onSortStart={() => {}}
        />
    } 

     
 
    addTodoFromInput = () => {
        if(isEmpty(this.state.currentTodo))
           return;     

        let getTodosCatch = getTodos(this.onError); 
        let todo : Todo = {
            _id : generateID(),
            category : "",   
            title : this.state.currentTodo,
            priority : Math.random() * 100,
            notes : this.state.notes,
            attachedProdjects : [], 
            attachedTags : this.state.attachedTags,
            status : "",
            deadline : new Date(),
            created : new Date(),
            deleted : new Date(),
            fulfilled : new Date(), 
            history : [],
            attachemnts : []
        };    

        this.setState({currentNote:'', currentTodo:'', notes:[], attachedTags:[]});
        addTodo(this.onError,todo);
        this.props.dispatch({type:"todos", load:this.props.todos.unshift(todo)});   
    } 

 
    onTagFieldEnterPress = (event) => {  
        if(event.key==="Enter"){
            let tag = this.state.currentTag;  
            let tags = this.state.attachedTags;
            tags.push(tag);
            this.setState({ 
                currentTag:'',
                attachedTags:uniq(tags)
            });
        }    
    }


    onNoteFieldEnterPress = (event) => {
        if(event.key==="Enter"){
            let notes = this.state.notes;
            notes.push(this.state.currentNote); 
            this.setState({ currentNote:'',  notes});
        }  
    }


    render(){ 

        return <div    
            className = {"todohighlight"}
            onClick = {(e) => { e.stopPropagation(); }}   
            style={{
                width:"100%",
                height:"auto",  
                backgroundColor:"white",
                boxShadow: "1px 1px 14px rgb(156, 156, 156)",
                borderRadius: "5px",
                marginBottom: "10px" 
            }} 
        >   



                <div style={{  
                    paddingTop: "20px",
                    paddingBottom: "20px", 
                    paddingLeft: "20px", 
                    paddingRight: "20px", 
                    caretColor: "cornflowerblue",
                    display:"flex" 
                }}>    

                    <div style={{width: "5%",paddingTop: "14px"}}>
                        <CheckBoxEmpty style={{ 
                            color:"rgba(159,159,159,0.5)",
                            width:"20px",
                            height:"20px"  
                        }}/>  
                    </div> 

                    <div style={{ 
                        display:"flex",
                        flexDirection:"column",
                        width:"90%"
                    }}>       
                        <TextField
                            hintText="New To-Do"
                            fullWidth={true}  
                            underlineFocusStyle={{borderColor: "rgba(0,0,0,0)"}}
                            value={this.state.currentTodo}
                            onChange={(event,newValue:string) => this.setState({currentTodo:newValue})} 
                            onKeyPress = {(event) => event.key==="Enter" ? this.addTodoFromInput() : null}      
                            underlineStyle={{borderColor: "rgba(0,0,0,0)"}}  
                        />  
                        {
                            <TextField 
                                hintText="Notes"
                                underlineFocusStyle={{borderColor: "rgba(0,0,0,0)"}} 
                                underlineStyle={{borderColor: "rgba(0,0,0,0)"}}   
                                value={this.state.currentNote}
                                onKeyPress = {this.onNoteFieldEnterPress}
                                onChange = {(event,value) => this.setState({ currentNote:value })}
                            />  
                        } 
    
                        { this.createSortableNotesList(this.state.notes) } 

                        {  
                            !this.props.showTags ? null :
                            <div style={{display:"flex", alignItems:"center", justifyContent:"flex-start"}}> 

                                {  this.state.attachedTags.map(this.generateTagElement) }   
 
                                <TextField  
                                    hintText="Add tag"
                                    underlineFocusStyle={{borderColor: "rgba(0,0,0,0)"}} 
                                    underlineStyle={{borderColor: "rgba(0,0,0,0)"}}   
                                    value={this.state.currentTag}
                                    onKeyPress = {this.onTagFieldEnterPress}  
                                    onChange = {(event,value) => this.setState({ currentTag:value })}
                                />   
                                 
                            </div>
                        }
                    </div>  
                        
                      
                </div>  


                {  
                    <TodoCreationFormFooter 
                        buttonsNamesToDispaly={["Calendar", "Tag", "Add", "Flag"]}
                        
                        onAddClick={(e) => this.addTodoFromInput()} 

                        onFlagClick={(e) => {
                            //?
                        }} 

                        onCalendarClick={(e) => this.setState({showCalendar:true})} 

                        closeCalendar={(e) => this.setState({showCalendar:false})} 

                        onTagsClick={(e) => this.setState({showtagsPopover:true})} 

                        onCloseTagsClick={(e) => this.setState({showtagsPopover:false})} 

                        tags={this.state.attachedTags}

                        attachTag={(tag:string) => {
                            let tags = this.state.attachedTags;
                            tags.push(tag);
                            this.setState({attachedTags:uniq(tags)});
                        }}  

                        tagsPopoverOpened={this.state.showtagsPopover} 

                        showCalendar={this.state.showCalendar} 
                    />
                }  
        </div>
    }
 
}  






type TodoCreationFormButtonName = "Calendar" | "Tag" | "Add" | "Flag";


interface TodoCreationFormFooterProps{
    buttonsNamesToDispaly:TodoCreationFormButtonName[]
    
    onAddClick : Function, 
    onFlagClick : Function,
    
    onCalendarClick : Function,
    closeCalendar : Function,

    onTagsClick : Function,  
    onCloseTagsClick : Function, 

    tags : string[],
    attachTag : (tag:string) => void

    tagsPopoverOpened : boolean,  
    showCalendar:boolean 
} 

  
class TodoCreationFormFooter extends Component<TodoCreationFormFooterProps,{}>{ 

    calendarOrigin:HTMLElement;
    tagsPopoverOrigin:HTMLElement;


    constructor(props){
        super(props);
    }
    

    render(){
        return <div style={{  
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            position: "sticky",
            bottom: 0,
            zIndex:5, 
            padding: "15px",
            right: 0  
        }}>   

            <ThingsCalendarSmall
                close = {this.props.closeCalendar}
                open = {this.props.showCalendar}
                anchorEl = {this.calendarOrigin}
                origin = {{  
                    vertical: "bottom",
                    horizontal: "left",
                }} 
                point = {{
                    vertical: "center",
                    horizontal: "right",
                }} 
            />     

            {   
                !contains("Calendar")(this.props.buttonsNamesToDispaly as any) ? null :     
                <div ref={(e) => { this.calendarOrigin=e; }}>  
                    <IconButton 
                    onClick = {this.props.onCalendarClick}
                    iconStyle={{  
                        color: "rgb(179, 179, 179)",
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
                            color:"rgb(179, 179, 179)",
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
                    onClick = {this.props.onAddClick}
                    iconStyle={{ 
                        color: "rgb(179, 179, 179)",
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
                        color:"rgb(179, 179, 179)",
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