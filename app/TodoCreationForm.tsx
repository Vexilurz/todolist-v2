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
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
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
import { ThingsCalendar } from './MainContainer';
let uniqid = require("uniqid");
//import Popover from 'material-ui-next/Popover'; 
import Popover from 'material-ui/Popover';
interface TagsPopoverProps{
    tags:string[], 
    close : Function,
    open : boolean,
    attachTag:Function,
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
                className="nocolor"
                style={{
                    backgroundColor:"rgba(0,0,0,0)",
                    background:"rgba(0,0,0,0)",
                    borderRadius:"10px"
                }}   
                open={this.props.open}
                anchorEl={this.props.anchorEl}
                //anchorReference={anchorReference}
                //anchorPosition={{ top: positionTop, left: positionLeft }}
                onRequestClose={() => this.props.close()}
                anchorOrigin={this.props.origin} 
                targetOrigin={this.props.point} 
                //transformOrigin={this.props.point}
            >   
                <div  
                className={"darkscroll"}
                style={{  
                    backgroundColor: "rgb(39, 43, 53)",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    borderRadius: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    maxHeight:"150px",
                    cursor:"pointer" 
                }}>   
                   { 
                    map((tag:string) => 
                        <div  
                            onClick={() => this.props.attachTag(tag)} 
                            className={"tagItem"} style={{display:"flex", height:"auto"}}
                        >  
                            <TriangleLabel style={{color:"skyblue"}}/> 
                            <div style={{color:"skyblue", marginLeft:"5px", marginRight:"5px"}}>
                                {tag}   
                            </div>     
                        </div>
                    )(this.props.tags)
                    } 
                </div>  
            </Popover> 
        } 
      
    }










interface TodoCreationFormProps{ 
    tags:string[], 
    dispatch:Function,
    keepTodo:Function,
    triggerOpen:Function, 
    open:boolean
}  
  
interface TodoCreationFormState{
    formId:string, 
    notes : string[],
    showtagsPopoverOrigin:boolean, 
    currentTodo : string,  
    currentNote : string,
    showCalendar : boolean, 
    currentTag : string,
    attachedTags : string[]
} 
       
  
export class TodoCreationForm extends Component<TodoCreationFormProps,TodoCreationFormState>{
    calendarOrigin
    tagsPopoverOrigin
    
    constructor(props){ 
        super(props); 
        this.state={
            formId:uniqid(),
            notes : [],
            showCalendar:false,  
            showtagsPopoverOrigin:false,
            currentTodo : '', 
            currentNote : '',
            currentTag:'',
            attachedTags:[]
        }
    } 
    
    onError = (e) => console.log(e);
    
    removeNote = (note:string) => {}; 

    getNoteElem = (value:string) => { 
       // const DragHandle = SortableHandle(() => <div style={{position:"absolute",width:"100%",height:"100%"}}></div>); 
            
        return <div style={{  
            display:"flex",  
            alignItems:"center", 
            borderBottom:"1px solid rgba(100,100,100,0.2)"
        }} key={uniqid()}>      
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
            </div>
    };

    
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
            onSortEnd={
                ({oldIndex, newIndex}) => this.setState({
                    notes: arrayMove(this.state.notes, oldIndex, newIndex),
                })
            }
            //shouldCancelStart={() => true}
            onSortStart={() => {}}
            //shouldCancelStart={() => true}
            //onSortMove={this.onSortMove}  
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
 
        this.props.keepTodo(todo);
    } 
   
   
    render(){ 
        let selected = this.props.open;
 

        return <div   
            className = {"todohighlight"}
            onClick = {(e) => { 
                e.stopPropagation();  
                this.props.triggerOpen(); 
            }}  
            style={{           
                width:"100%",height:"auto",  
                backgroundColor:"white",
                boxShadow: selected ? "1px 1px 14px rgb(156, 156, 156)" : "none",
                borderRadius: "5px",
                marginBottom: "10px" 
            }}
        >   
                <div   
                    style={{ 
                        paddingTop: selected ? "20px" : "0px",
                        paddingBottom: selected ? "20px" : "0px", 
                        paddingLeft: "20px", 
                        paddingRight: "20px", 
                        caretColor: "cornflowerblue",
                        display:"flex" 
                    }}
                >    
                    <div 
                    style={{
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
                            onChange={
                              (event,newValue:string) => this.setState({currentTodo:newValue})
                            } 
                            onKeyPress = {   
                              (event) => event.key==="Enter" ? this.addTodoFromInput() : null  
                            }      
                            underlineStyle={{   
                               borderColor: "rgba(0,0,0,0)" 
                            }}  
                        />  
                        {
                            !selected ? null :
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
                                        this.setState({ currentNote:'',  notes});
                                    }  
 
                                }} 
                                onChange = {(event,value) => this.setState({ currentNote:value })}
                            />  
                        } 
    
                        { !selected ? null : this.createSortableNotesList(this.state.notes)  } 

                        {
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start" 
                            }}> 
                                { 
                                    this.state.attachedTags.map( (tag:string) => 
                                        <div key={uniqid()}>  
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
                                <TextField  
                                    hintText="Add tag"
                                    underlineFocusStyle={{
                                        borderColor: "rgba(0,0,0,0)"
                                    }} 
                                    underlineStyle={{
                                        borderColor: "rgba(0,0,0,0)"
                                    }}   
                                    value={this.state.currentTag}
                                    onKeyPress = {(event) => {  
                                        if(event.key==="Enter"){
                                            let tag = this.state.currentTag;  
                                            let tags = this.state.attachedTags;
                                            tags.push(tag);
                                            this.setState({ 
                                                currentTag:'',
                                                attachedTags:uniq(tags)
                                            });
                                        }    
                                    }}  
                                    onChange = {(event,value) => this.setState({ currentTag:value })}
                                />  
                            </div>
                        }
                    </div> 
                        
                      
                </div> 

                { !selected ? null :
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
                    <ThingsCalendar
                        close = {() => this.setState({showCalendar:false})}
                        open = {this.state.showCalendar}
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
                        <div ref={(e) => { this.calendarOrigin=e; }}>  
                            <IconButton 
                            onClick = {() => this.setState({showCalendar:true})}
                            iconStyle={{  
                                color: this.state.showCalendar ? "cadetblue" : "rgb(179, 179, 179)",
                                width:"25px",  
                                height:"25px"  
                            }}>     
                                <Calendar />
                            </IconButton> 
                        </div> 
                    <TagsPopover  
                      tags={this.props.tags}
                      attachTag={(tag:string) => this.setState({ 
                        attachedTags:compose(uniq,append(tag))(this.state.attachedTags) as any
                      })}
                      close = {() => this.setState({showtagsPopoverOrigin:false})}
                      open = {this.state.showtagsPopoverOrigin}
                      anchorEl = {this.tagsPopoverOrigin}
                      origin = {{    
                          vertical: "bottom",
                          horizontal: "left",
                      }} 
                      point = {{
                          vertical: "top",
                          horizontal: "right"
                      }} 
                    />
                        <div ref={(e) => { this.tagsPopoverOrigin=e; }}> 
                            <IconButton 
                            onClick = {() => this.setState({showtagsPopoverOrigin:true})}
                            iconStyle={{ 
                                color:"rgb(179, 179, 179)",
                                width:"25px", 
                                height:"25px" 
                            }}>       
                                <TriangleLabel />
                            </IconButton>    
                        </div>

                        <IconButton    
                        onClick = {() => this.addTodoFromInput()}
                        iconStyle={{ 
                            color: isEmpty(this.state.currentTodo) ? "rgb(179, 179, 179)" : "cadetblue",
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
                }  
        </div>
    }
 
}  