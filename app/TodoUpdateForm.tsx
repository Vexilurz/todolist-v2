import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, 
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, 
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, groupBy, concat, flatten, ifElse 
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
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AutoComplete from 'material-ui/AutoComplete';
import './assets/styles.css';  
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
import { wrapMuiThemeLight, wrapMuiThemeDark, attachDispatchToProps} from "./utils"; 
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import { createStore, combineReducers } from "redux"; 
import { Provider, connect } from "react-redux";
//import Chip from 'material-ui-next/Chip';
import Chip from 'material-ui/Chip'; 
import { reducer } from "./reducer"; 
//icons
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import Star from 'material-ui/svg-icons/toggle/star';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import CheckBoxEmpty from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import CheckBox from 'material-ui/svg-icons/toggle/check-box'; 
import BusinessCase from 'material-ui/svg-icons/places/business-center';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz'; 
import ClearArrow from 'material-ui/svg-icons/content/backspace';   
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
import { db } from './app';
import Popover from 'material-ui/Popover';
import { getTodos, queryToTodos, Todo, updateTodo, generateID, addTodo } from './databaseCalls';
let uniqid = require("uniqid");

 
interface TodoUpdateFormProps{ 
    dispatch:Function,
    todo : Todo, 
    selectedTodoFromId:string,
    changeTodo:Function,
    openMenu:(e:any,formId:string) => void,
    closeMenu:Function    
}  

  
interface TodoUpdateFormState{
    formId : string, 
    notes : string[],
    currentTodo : string, 
    currentNote : string
} 

 

export class TodoUpdateForm extends Component<TodoUpdateFormProps,TodoUpdateFormState>{

    constructor(props){
        super(props);
        this.state={ 
            formId : this.props.todo._id, 
            notes : this.props.todo.notes,
            currentTodo : this.props.todo.title, 
            currentNote : ''
        }
    }
 
    
    onError = (e) => console.log(e);

    removeNote = (note:string) => {}; 
 
    getNoteElem = (value:string) => <div style={{ 
        display:"flex", 
        alignItems:"center", 
        borderBottom:"1px solid rgba(100,100,100,0.2)"
    }} key={value}>     
        <Circle style={{color:"darkcyan"}}/>  
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%"  
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
            { 
            // im not sure should note be deletable or not    
            true ? null :  
            <IconButton 
                onClick = {() => this.removeNote(value)}
                iconStyle={{  
                    color:"rgb(179, 179, 179)",
                    width:"25px", 
                    height:"25px" 
                }}  
            >      
                <Clear />
            </IconButton>
            } 
        </div>   
    </div>;

    
    createSortableItem = (transform) => SortableElement(({value}) => transform(value)); 
    
      
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
            //getContainer={(e) => document.getElementById("todos")} 
            shouldCancelStart={() => false}
            lockToContainerEdges={true} 
            distance={1}  
            items={list}   
            axis='y'   
            lockAxis={'y'}
            onSortEnd={({oldIndex, newIndex}) => this.setState({
                notes: arrayMove(this.state.notes, oldIndex, newIndex),
            })}
            //shouldCancelStart={() => true}
            onSortStart={() => {}}
            //shouldCancelStart={() => true}
            //onSortMove={this.onSortMove}  
        />
    } 
  
    updateTodoFromInput = () => {
          
        if(isNil(this.props.todo))
           return;
       
        if(isEmpty(this.state.currentTodo))
          return;  

          
        let getTodosCatch = getTodos(this.onError);  
        let todo : Todo = {
            _id : this.props.todo._id, 
            category : "",    
            title : this.state.currentTodo,
            priority : Math.random() * 100,
            notes : this.state.notes,
            attachedProdjects : [], 
            attachedTags : this.props.todo.attachedTags,
            status : "",
            deadline : new Date(),
            created : new Date(),
            deleted : new Date(),
            fulfilled : new Date(), 
            history : [],
            attachemnts : [] 
        };   
 
        updateTodo(this.props.todo._id, todo, this.onError); 
        this.props.changeTodo(todo);
    } 

      
 
    render(){ 
        let selected = this.props.selectedTodoFromId === this.state.formId;

 
        return selected ? 
                <Expanded 
                   updateTodoFromInput={this.updateTodoFromInput}
                   currentNote={this.state.currentNote}
                   currentTodo={this.state.currentTodo}
                   onNoteSubmit = {(event) => {
                       if(event.key==="Enter"){   
                           let notes = this.state.notes;
                           notes.push(this.state.currentNote);
                           this.setState({currentNote:'', notes});
                       }   
                   }}       
                   notes={this.state.notes}
                   tags={this.props.todo ? this.props.todo.attachedTags : null}  
                   createSortableNotesList={this.createSortableNotesList}
                /> : <Collapsed 
                    currentTodo={this.state.currentTodo}
                    onContextMenu={(e) => {
                        e.persist();
                        e.preventDefault();
                        this.props.openMenu(e,this.state.formId);
                    }} 
                    onClick={(e) => { 
                        //this.props.closeMenu(); 
                        if(this.state.formId!==this.props.selectedTodoFromId)
                           this.props.dispatch({type:"selectedTodoFromId",load:this.state.formId}) 
                    }}
                    tags={this.props.todo ? this.props.todo.attachedTags : null}
                />
    }   
 
}   
  






interface ExpandedProps{
    currentTodo:string,
    updateTodoFromInput:Function,
    onNoteSubmit:any,
    currentNote:string,
    createSortableNotesList:Function,
    tags:string[],
    notes:string[]
}

interface ExpandedState{

}
 

class Expanded extends Component<ExpandedProps,ExpandedState>{
    constructor(props){
        super(props);
    }

    render(){
        return <div     
        //className = 'listitem'
                style={{                
                    backgroundColor: "white", 
                    width:"100%",height:"inherit", 
                    boxShadow: "1px 1px 14px rgb(156, 156, 156)",
                    borderRadius: "5px",
                    marginBottom: "10px" 
                }}
            >   
                    <div   //className = 'listitem'
                        style={{ 
                            paddingTop:"20px",
                            paddingBottom:"20px", 
                            paddingLeft: "20px", 
                            paddingRight: "20px", 
                            caretColor: "cornflowerblue",
                            display:"flex" 
                        }}
                    >    
                        <div style={{
                            width: "5%",
                            paddingTop: "2px"  
                        }}> 
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
                                textareaStyle={{zIndex:1, height:"auto", cursor:"default"}}
                                style={{zIndex:1, height:"auto", cursor:"default"}}  
                                underlineFocusStyle={{  
                                    zIndex:1,
                                    borderColor: "rgba(0,0,0,0)"
                                }}
                                value={this.props.currentTodo}
                                onChange={
                                    (event,newValue:string) => this.setState({currentTodo:newValue})
                                } 
                                onKeyPress = {   
                                    (event) => event.key==="Enter" ? this.props.updateTodoFromInput() : null  
                                }   
                                underlineStyle={{ 
                                    zIndex:10,
                                    borderColor: "rgba(0,0,0,0)" 
                                }} 
                            />   
                            { 
                                <TextField 
                                    hintText="Notes"
                                    underlineFocusStyle={{
                                        borderColor: "rgba(0,0,0,0)"
                                    }} 
                                    underlineStyle={{
                                        borderColor: "rgba(0,0,0,0)"
                                    }}   
                                    value={this.props.currentNote}
                                    onKeyPress = {this.props.onNoteSubmit}  
                                    onChange = {(event,value) => this.setState({ currentNote:value })}
                                />  
                            } 
         
                            { this.props.createSortableNotesList(this.props.notes)  } 

                            {
                                <div style={{
                                    marginTop: "15px", 
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-start" 
                                }}> 
                                    { 
                                        this.props.tags.map( (tag:string) => 
                                            <div key={tag}>   
                                                <div //className="chip"    
                                                    style={{ 
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
                                                    }}   
                                                >  
                                                    <div style={{padding:"10px"}}>
                                                        {tag}
                                                    </div>
                                                </div>
                                            </div>   
                                        )
                                    }  
                                </div>
                            }
                        </div>
                            
                        
                    </div> 
            </div>
    }
}

 

 

interface CollapsedState{
 
}

interface CollapsedProps{
    onClick:any,
    onContextMenu:any, 
    currentTodo:string,
    tags:string[]
}   
  
 
class Collapsed extends Component<CollapsedProps,CollapsedState>{
    refRoot; 
    constructor(props){
        super(props);
    }
   
    render(){
        return <div  
            ref = {(e) => {this.refRoot=e;}}
            onContextMenu = {this.props.onContextMenu} 
            className = {"todohighlight"}
            onClick = {this.props.onClick}   
            style={{                
                backgroundColor: "", 
                width:"100%",height:"auto", 
                boxShadow: "none",
                borderRadius: "5px",
                marginBottom: "10px" 
            }}
        >   

            <div   
                style={{ 
                    paddingTop: "0px",
                    paddingBottom: "0px", 
                    paddingLeft: "20px", 
                    paddingRight: "20px", 
                    caretColor: "cornflowerblue",
                    display:"flex" 
                }}
            >    
                <div style={{
                    width: "5%",
                    paddingTop: "2px"  
                }}> 
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
                        textareaStyle={{zIndex:1, height:"auto", cursor:"default"}}
                        style={{zIndex:1, height:"auto", cursor:"default"}}  
                        underlineFocusStyle={{  
                            zIndex:1,
                            borderColor: "rgba(0,0,0,0)"
                        }}
                        value={this.props.currentTodo}
                        underlineStyle={{ 
                            zIndex:10,
                            borderColor: "rgba(0,0,0,0)" 
                        }} 
                    />  
                    {
                        <div style={{
                            marginTop: "0px", 
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start" 
                        }}>  
                            { 
                                this.props.tags.map( (tag:string) => 
                                    <div key={tag}>    
                                        <div //className="chip"    
                                            style={{ 
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
                                            }}   
                                        >  
                                            <div style={{padding:"10px"}}>
                                                {tag}
                                            </div>
                                        </div>
                                    </div>   
                                )  
                            }   
                        </div>
                    }
                </div>
                    
                  
            </div> 
    </div>
    }
}