import './assets/styles.css';  
import './assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, uniq,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, 
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, 
    groupBy, concat, flatten, toPairs, adjust, prepend 
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
import { wrapMuiThemeLight, wrapMuiThemeDark, attachDispatchToProps, uppercase, insideTargetArea} from "./utils"; 
import { createStore, combineReducers } from "redux"; 
import { Provider, connect } from "react-redux";
//import Chip from 'material-ui-next/Chip';
import Chip from 'material-ui/Chip';
import { reducer } from "./reducer"; 
//icons 
import Inbox from 'material-ui/svg-icons/content/inbox';
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
import List from 'material-ui/svg-icons/action/list'; 
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Moon from 'material-ui/svg-icons/image/brightness-3';
import Logbook from 'material-ui/svg-icons/av/library-books';
import { TodoCreationForm } from './TodoCreationForm'; 
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc'; 
import { queryToTodos, getTodos, updateTodo, Todo } from './databaseCalls';
let uniqid = require("uniqid");
import DayPicker from 'react-day-picker';
//import Popover from 'material-ui-next/Popover';
import Popover from 'material-ui/Popover';
import Button from 'material-ui-next/Button';
import { TodoUpdateForm } from './TodoUpdateForm';
import { ThingsCalendarSmall } from './thingsCalendarSmall';
  


let clearTodos = () => {
    let onError = (e) => console.log(e);
    let getTodosCatch = getTodos(onError);

    getTodosCatch(true,Infinity)
    .then(queryToTodos)
    .then(
        (todos:Todo[]) => Promise.all(
            map((todo:Todo) => updateTodo(
                    todo._id,
                    merge(todo,{_deleted: true}),
                    onError
            ))(todos)
        )
    )   
}; 
 

let getTagsFromTodos = (todos:Todo[]) : string[] => compose(
    uniq,    
    prepend("All"),
    flatten, 
    map(prop("attachedTags")),
    filter((v)  => !!v)
)(todos) as any;



let applyDropStyle = (elem:Element, {x,y}) => {
        let arr = [].slice.call(elem.children);
        arr.map( c => elem.removeChild(c));

        let numb = document.createElement("div");
        numb.innerText = "1";

        let parentStyle = {
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            width: "60px",
            height: "20px",
            background: "cadetblue"
        }

        let childStyle = {
            background: "brown",
            width: "20px",
            height: "20px",
            alignItems: "center",
            textAlign: "center",
            /* align-content: center; */
            color: "aliceblue",
            borderRadius: "30px",
            marginBottom: "-20px" 
        }
        
        map((pair) => {
            numb["style"][pair[0]]=pair[1];
        })(toPairs(childStyle))

        map((pair) => {
            elem["style"][pair[0]]=pair[1];
        })(toPairs(parentStyle))
            
        elem.appendChild(numb);  
        elem["style"].transform = "none";
        elem["style"].position = "absolute"; 
        elem["style"].left = (x-60)+'px';
        elem["style"].top = y+'px';
}   


interface SortableTodosUpdateListProps{
   dispatch:Function,
   selectedTodoFromId:string,
   changeTodo:Function,
   selectedTag:string,
   onSortEnd:Function,
   rootRef:HTMLElement,
   todos:Todo[]    
}   

interface SortableTodosUpdateListState{
}
 

class SortableTodosUpdateList extends Component<SortableTodosUpdateListProps, SortableTodosUpdateListState>{
    constructor(props){ 
        super(props);
    }
    
    shouldComponentUpdate(nextProps:SortableTodosUpdateListProps){
       return nextProps.selectedTag!==this.props.selectedTag || 
              nextProps.selectedTodoFromId!==this.props.selectedTodoFromId || 
              !equals(nextProps.todos,this.props.todos); 
              //nextProps.todos.length!==this.props.todos.length 
    }  
   
    createSortableTodoItem = () => SortableElement(({value}) => this.getTodoElem(value)); 
    

    getTodoElem = (value:Todo) => 
        <div 
          className = 'listitem'  
            style={{
                width: "100%", 
                display: "flex",
                alignItems: "center", 
                justifyContent: "center"
            }}>      
            <TodoUpdateForm   
                dispatch={this.props.dispatch} 
                todo={value}
                selectedTodoFromId={this.props.selectedTodoFromId}
                changeTodo = {this.props.changeTodo}
            />  
        </div>    
    
    getTodosList = (items:Todo[]) => !items ? null :
        <ul style={{padding:0,margin:0}}> {     
            items 
            .filter(v => !!v)
            .map(   
                (todo:Todo, index) => {
                    let SortableItem = this.createSortableTodoItem(); 
                    return <SortableItem  key={`item-${index}`} index={index} value={todo} />
                }
            ) 
        } </ul>;    
       
    
    byTags = (todo:Todo) : boolean => { 
        if(isNil(todo))
            return false;
        if(this.props.selectedTag==="All") 
            return true;    

        return contains(this.props.selectedTag,todo.attachedTags);
    }
        
    
    createSortableTodosList = (elem:HTMLElement) => (list : Todo[]) => { 
        let SortableList = SortableContainer(({items}) => this.getTodosList(items),{withRef:true}); 

        return <SortableList    
            getContainer={(e) => elem ? elem : document.body} 
            //lockToContainerEdges={true}    
            shouldCancelStart={() => false} 
            //distance={1}     
            //pressDelay={100}   
            items={list}      
            axis='xy'       
            onSortEnd={this.props.onSortEnd}    
            onSortMove={(e) => { 
                let target = document.getElementById("projects"); 
                let ref = document.body.children[document.body.children.length-1];
                let x = e.clientX;
                let y = e.clientY;  
    
                if(insideTargetArea(target)(x,y))
                    applyDropStyle(ref,{x,y}); 
            }}   
            //shouldCancelStart={() => true}   
            onSortStart={  
                ({node, index, collection}, event) => {
                    //this.props.dispatch({type:"selectedTodoFromId",load:null});
                }   
            }     
            //useWindowAsScrollContainer={true}
        />   
    } 

  
    render(){
        return <div>{  
            compose(
                this.createSortableTodosList(this.props.rootRef),
                filter(this.byTags)
           )(this.props.todos)   
        }</div> 
    } 
}







 
type Category = "inbox" | "today" | "upcoming" | "anytime" | "someday" | "logbook" | "trash";
  

interface MainContainerProps{
   selectedTodoFromId:string, 
   selectedCategory:Category,
   dispatch:Function
}
 
interface MainContainerState{
   fullsize:boolean,
   hold:number,
   showCalendar:boolean,
   todos:Todo[],
   tags:string[],  
   openTodoInput:boolean, 
   selectedTag:string, 
   showTodoInput:boolean 
}     
     

export class MainContainer extends Component<MainContainerProps,MainContainerState>{
    calendarOrigin:HTMLElement; 
    rootRef:HTMLElement; 

    constructor(props){
        super(props); 
        this.state={   
            openTodoInput:false,
            hold:0, 
            fullsize:true, 
            showCalendar:false,
            selectedTag:"All", 
            todos:[],
            tags:[],  
            showTodoInput:false 
        }
    } 


    onError = (e) => console.log(e);
     
    
    componentDidMount(){
        let onError = (e) => console.log(e);
        let getTodosCatch = getTodos(onError);

        getTodosCatch(true,Infinity)
        .then(queryToTodos) 
        .then( 
            (todos:Todo[]) => this.setState({
                todos,
                tags:getTagsFromTodos(todos)
            }) 
        )    
    }   


    changeTodo = (todo:Todo) => {
        let idx = findIndex((t:Todo) => todo._id===t._id)(this.state.todos);
        this.setState({todos:adjust<Todo>((old:Todo) => todo,idx,this.state.todos)});
    } 
      
 

    openTodoInput = () => this.setState(
        {showTodoInput:true,openTodoInput:true}, 
        () => {  
            if(this.rootRef) 
               this.rootRef.scrollTop = 0; 
        }  
    );   


    closeTodoInput = () => this.setState({showTodoInput:false, openTodoInput:false});

 
        
    render(){ 
     return <div ref={(e) => { this.rootRef=e }}
                className="scroll"  
                style={{    
                    width: "74%",
                    position:"relative", 
                    display: "flex",
                    borderRadius:"1%", 
                    backgroundColor: "rgba(209, 209, 209, 0.1)", 
                    overflow: "scroll",  
                    flexDirection: "column" 
                }}
            >      

    <div   
        onClick={(e) => {  
            e.stopPropagation(); 
            this.closeTodoInput();
            if(this.props.selectedTodoFromId)
               this.props.dispatch({type:"selectedTodoFromId",load:null});  
        }} 
        style={{padding:"60px"}}
    >
  

        <div className="no-drag"
              style={{
                 position: "fixed",
                 top: 0,
                 right: 0
              }}   
        > 
              <IconButton   
                onClick = {() => this.setState({
                    fullsize:not(this.state.fullsize)
                }, 
                () => ipcRenderer.send("size",this.state.fullsize)
              )}     
              iconStyle={{  
                  color:"cadetblue",
                  width:"20px",
                  height:"20px"    
              }}>     
                  <OverlappingWindows />
              </IconButton> 
        </div>  


 
        <div style={{ width: "100%"}}> 
            <div style={{
                display:"flex",
                alignItems:"center",
                marginBottom:"20px"
            }}>    
               {chooseIcon(this.props.selectedCategory)}
             <div style={{ 
                    fontFamily: "sans-serif",
                    fontSize: "xx-large",
                    fontWeight: 600,
                    paddingLeft: "10px",
                    WebkitUserSelect: "none",
                    cursor:"default" 
             }}>   
               {uppercase(this.props.selectedCategory)}
             </div>
           </div>

            <div style={{
                display: 'flex',
                flexWrap: 'wrap'
            }}> 
            {   
                    map((tag:string) =>  
                      <div key={uniqid()} style={{padding:"10px"}}>
                        <div className="chip"   
                            onClick={() => this.setState({selectedTag:tag})} 
                            style={{
                                width: "auto",
                                height: "30px",
                                alignItems: "center",
                                display: "flex",
                                cursor: "pointer",
                                borderRadius: "100px",
                                backgroundColor: this.state.selectedTag === tag ? "dimgray" : "white",
                                fontWeight: 700,
                                color: this.state.selectedTag === tag ? "white" : "dimgray", 
                                fontFamily: "sans-serif"
                            }}  
                        >  
                            <div style={{padding:"10px"}}> {tag} </div> 
                         </div> 
                      </div>  
                    )(this.state.tags)
            }
            </div>
        </div>     
             
 
        {    
            !this.state.showTodoInput ? 
            <div style={{backgroundColor:"yellow",width:"100%",height:"50px"}}>

            </div>  
            :  
            <div style={{paddingTop:"20px", paddingBottom:"10px"}}>    
                <TodoCreationForm  
                    dispatch={this.props.dispatch}  
                    tags={this.state.tags}
                    keepTodo={(todo:Todo) => {  
                        let todos = [...this.state.todos];
                        todos.unshift(todo);
                        let tags = getTagsFromTodos(todos)
                        this.setState({todos,tags});  
                    }} 
                    triggerOpen={() => this.setState({openTodoInput:true})}
                    open={this.state.openTodoInput}
                />  
            </div> 

        }     
 
        <div id="todos" style={{marginTop: "30px", marginBottom: "60px"}}>
            <SortableTodosUpdateList
                dispatch={this.props.dispatch}
                selectedTodoFromId={this.props.selectedTodoFromId}
                changeTodo={this.changeTodo}
                selectedTag={this.state.selectedTag}
                onSortEnd={({oldIndex, newIndex}) => this.setState({
                    todos:arrayMove(this.state.todos, oldIndex, newIndex)
                })}
                rootRef={this.rootRef}
                todos={this.state.todos} 
            />
        </div>    
         
    </div> 
 
        <ThingsCalendarSmall
            close = {() => this.setState({showCalendar:false})}
            open = {this.state.showCalendar}
            anchorEl = {this.calendarOrigin}
            origin = {{ 
                vertical: "top",
                horizontal: "middle",
            }} 
            point = {{
                vertical: "top",
                horizontal: "middle", 
            }}
        />  

        <div style={{ 
              height: "60px",
              width: "74%", 
              position: "fixed", 
              zIndex:1500,
              display: "flex",
              justifyContent: "center",
              backgroundColor: "white",
              bottom: "0px",
              borderTop: "1px solid rgba(100, 100, 100, 0.2)" 
        }}>   
            <div style={{    
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                position: "absolute",
                bottom: 0,
                backgroundColor: "white", 
                width: "70%",
                height: "60px"      
            }}>
  
                <IconButton  
                    onClick = {() => this.openTodoInput()}
                    tooltip="New To-Do"
                    tooltipPosition="top-center"
                    iconStyle={{ 
                        color:"rgb(79, 79, 79)", 
                        width:"25px", 
                        height:"25px" 
                    }}
                >      
                    <Plus />
                </IconButton> 

                <div ref={(e) => {this.calendarOrigin=e}}>
                    <IconButton 
                        onClick = {() => this.setState({showCalendar:true})}
                        iconStyle={{ 
                            color:"rgb(79, 79, 79)",
                            width:"25px", 
                            height:"25px" 
                        }} 
                    >     
                        <CalendarIco />
                    </IconButton> 
                </div>

                <IconButton 
                    onClick = {() => {}}
                    iconStyle={{ 
                        color:"rgb(79, 79, 79)",
                        width:"25px", 
                        height:"25px" 
                    }}
                >     
                    <Arrow />
                </IconButton> 
                <IconButton 
                    onClick = {() => {}}
                    iconStyle={{  
                        color:"rgb(79, 79, 79)",
                        width:"25px", 
                        height:"25px" 
                    }}
                >     
                    <Search />
                </IconButton> 

            </div>
        </div> 
        </div> 
  }
}

 






 
 

let chooseIcon = (selectedCategory:Category) => {
    switch(selectedCategory){
        case "inbox":
            return <Inbox style={{ 
                color:"dodgerblue", 
                width:"50px",
                height:"50px" 
            }} />;
        case "today":
            return <Star style={{
                color:"gold", 
                width:"50px",
                height:"50px" 
            }}/>
        case "upcoming":
            return <CalendarIco style={{
                color:"crimson", 
                width:"50px",
                height:"50px"
            }}/>
        case "anytime":
            return <Layers style={{
                color:"darkgreen", 
                width:"50px",
                height:"50px"
            }}/>
        case "someday":
            return <BusinessCase  style={{
                color:"burlywood", 
                width:"50px",
                height:"50px"
            }}/> 
        case "logbook":
            return <Logbook style={{
                color:"limegreen", 
                width:"50px",
                height:"50px"
            }}/>  
        case "trash":
            return <Trash style={{
                color:"darkgray", 
                width:"50px",
                height:"50px" 
            }}/>
        default:
            return <Inbox style={{ 
                color:"dodgerblue", 
                width:"50px",
                height:"50px"
            }}/>; 
    }
}