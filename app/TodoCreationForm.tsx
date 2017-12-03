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
import { db } from './app';
import { getTodos, queryToTodos, Todo, updateTodo, generateID, addTodo } from './databaseCalls';
let uniqid = require("uniqid");

  


interface TodoCreationFormProps{ 
    dispatch:Function
}  
 
interface TodoCreationFormState{
    notes : string[],
    currentTodo : string, 
    currentNote : string
}
 
 
 
export class TodoCreationForm extends Component<TodoCreationFormProps,TodoCreationFormState>{

    constructor(props){
        super(props);
        this.state={
            notes : [],
            currentTodo : '', 
            currentNote : ''  
        }
    }
    
    onError = (e) => console.log(e);

    removeNote = (note:string) => {}; 

 
    getNoteElem = (value:string) => <div style={{ 
        display:"flex", 
        alignItems:"center", 
        borderBottom:"1px solid rgba(100,100,100,0.2)"
    }} key={uniqid()}>     
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
  
 
    addTodoFromInput = () => {
        let getTodosCatch = getTodos(this.onError); 
        let todo : Todo = {
            _id : generateID(),
            category : "",   
            title : this.state.currentTodo,
            priority : Math.random() * 100,
            notes : clone(this.state.notes),
            attachedProdjects : [],
            attachedTags : [],
            status : "",
            deadline : new Date(),
            created : new Date(),
            deleted : new Date(),
            fulfilled : new Date(), 
            history : [],
            attachemnts : []
        };  
  
        return addTodo(this.onError,todo)
               .then(() => getTodosCatch(true,Infinity))
               .then(queryToTodos) 
               .then((todos:Todo[]) => this.props.dispatch({
                    type:"todos",   
                    load:todos
               })) 
    } 
   
  
    render(){
        return <div style={{    
            width:"80%",height:"80%"
        }}> 
            <Paper style={{
                    width:"100%", height:"100%",   
                    position:"relative", overflowY:"overlay"
               }} 
               zDepth={2}  
               className={"scroll"}
            > 
                <div style={{ 
                    padding:"20px",
                    caretColor: "cornflowerblue",
                    display:"flex"
                }}>   
 
                    <div style={{
                        width: "5%",
                        paddingTop: "14px"  
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
                        underlineFocusStyle={{
                            borderColor: "rgba(0,0,0,0)"
                        }}
                        value={this.state.currentTodo}
                        onChange={(event,newValue:string) => this.setState(
                            {currentTodo:newValue}
                        )} 
                        onKeyPress = { 
                        (event) =>   
                            event.key==="Enter" ? 
                            this 
                            .addTodoFromInput()  
                            .then(() => this.setState({ 
                                    currentNote:'',
                                    currentTodo:'', 
                                    notes:[]
                            })) : null     
                        }   
                        underlineStyle={{ 
                            borderColor: "rgba(0,0,0,0)" 
                        }} 
                    />  
                    <TextField 
                        hintText="Notes"
                        underlineFocusStyle={{
                            borderColor: "rgba(0,0,0,0)"
                        }} 
                        underlineStyle={{
                            borderColor: "rgba(0,0,0,0)"
                        }}   
                        value={this.state.currentNote}
                        onKeyPress = {(event) => {
                            
                            if(event.key==="Enter"){
                                let notes = this.state.notes;
                                notes.push(this.state.currentNote);
                                this.setState({ 
                                    currentNote:'',
                                    notes
                                })
                            }

                        }} 
                        onChange = {(event,value) => this.setState({ currentNote:value })}
                    />   
  
                    { this.createSortableNotesList(this.state.notes) } 

                    </div>  
                </div> 

                <div style={{  
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    position: "sticky",
                    bottom: 0,
                    zIndex:5, 
                    padding: "15px",
                    right: 0  
                }}> 
                        <IconButton 
                        onClick = {() => {}}
                        iconStyle={{  
                            color:"rgb(179, 179, 179)",
                            width:"25px", 
                            height:"25px" 
                        }}>     
                            <Calendar />
                        </IconButton> 
                        <IconButton 
                        onClick = {() => {}}
                        iconStyle={{ 
                            color:"rgb(179, 179, 179)",
                            width:"25px", 
                            height:"25px" 
                        }}>     
                            <TriangleLabel />
                        </IconButton> 
                        <IconButton 
                        onClick = {() => {}}
                        iconStyle={{ 
                            color:"rgb(179, 179, 179)",
                            width:"25px", 
                            height:"25px" 
                        }}>     
                            <List />
                        </IconButton> 
                        <IconButton 
                        onClick = {() => {}}
                        iconStyle={{  
                            color:"rgb(179, 179, 179)",
                            width:"25px", 
                            height:"25px" 
                        }}>     
                            <Flag />
                        </IconButton> 
                </div>  
            </Paper>  
        </div>
    }

} 