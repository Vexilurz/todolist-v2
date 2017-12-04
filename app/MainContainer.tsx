import './assets/styles.css';  
import './assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, 
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, 
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, groupBy, concat, flatten, toPairs 
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
import Popover from 'material-ui-next/Popover';
import Button from 'material-ui-next/Button';
 
interface ThingsCalendarProps{ 
  close : Function,
  open : boolean,
  anchorEl : HTMLElement
} 

class ThingsCalendar extends Component<ThingsCalendarProps,any>{

    constructor(props){
        super(props);
    }  

    render(){ 
        return <Popover 
            open={this.props.open}
            anchorEl={this.props.anchorEl}
            //anchorReference={anchorReference}
            //anchorPosition={{ top: positionTop, left: positionLeft }}
            onRequestClose={() => this.props.close()}
            anchorOrigin={{ 
                vertical: "top",
                horizontal: "center",
            }} 
            transformOrigin={{ 
                vertical: "top",
                horizontal: "center",
            }}
        >
            <div style={{  
                display:"flex",
                flexDirection:"column",
                backgroundColor:"rgb(39,43,53)",
                borderRadius: "20px"
            }}>   
                <div style={{
                    color: "dimgray",
                    textAlign: "center",
                    padding: "5px",
                    cursor: "default"
                }}>When</div>

                <div className="hoverDateType"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        color: "white",
                        marginLeft: "20px",
                        marginRight: "20px",
                        cursor: "default",
                        WebkitUserSelect:"none" 
                    }}  
                >
                    <Star style={{
                        color:"gold", 
                        width:"15px",
                        height:"15px",
                        cursor:"default" 
                    }}/> 
                    <div style={{marginLeft:"15px"}}>Today</div>
                </div>

                <div className="hoverDateType"
                style={{
                    display: "flex",
                    alignItems: "center",
                    color: "white",
                    cursor: "default",
                    marginLeft: "20px",
                    marginRight: "20px",
                    WebkitUserSelect:"none"  
                }}>
                    <Moon style={{ 
                        transform:"rotate(145deg)", 
                        color:"rgb(192,192,192)", 
                        width:"15px",
                        height:"15px",
                        cursor:"default" 
                    }}/>
                    <div style={{marginLeft:"15px"}}>This Evening</div>
                </div>


                <div style={{
                    zoom: "0.8",
                    display: "flex",
                    justifyContent: "center" 
                }}>
                    <DayPicker />
                </div> 
 
                <div style={{display:"flex",alignItems:"center"}}>  
                    <IconButton   
                      onClick = {() => console.log("Add new list")} 
                      iconStyle={{    
                        color:"rgb(79, 79, 79)",
                        width:"25px",
                        height:"25px"    
                      }} 
                    >        
                        <Plus /> 
                    </IconButton>
                    <div style={{
                        fontFamily: "sans-serif",
                        fontWeight: 600, 
                        color: "rgba(100,100,100,0.7)",
                        fontSize:"15px",  
                        cursor: "default",
                        WebkitUserSelect: "none" 
                    }}> 
                        Add reminder 
                    </div>    
                </div> 

                <Button raised dense style={{
                    margin:"15px", 
                    color:"white", 
                    backgroundColor:"rgb(49,53,63)"
                }}>
                    Clear
                </Button>
            </div>  
        </Popover> 
    } 

}











type Category = "inbox" | "today" | "upcoming" | "anytime" | "someday" | "logbook" | "trash";
 

interface MainContainerProps{
   selectedCategory:Category,
   dispatch:Function,
   todos:Todo[] 
}
 
interface MainContainerState{
   fullsize:boolean,
   showCalendar:boolean
}    
 
 
export class MainContainer extends Component<MainContainerProps,MainContainerState>{
    calendarOrigin:HTMLElement 

    constructor(props){
        super(props);
        this.state={  
            fullsize:true,
            showCalendar:false
        }
    } 
   
 
    componentDidMount(){
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
    }  

 
    getTodoElem = (value:Todo) => <div style={{
        display: "flex",
        marginTop: "5px"   
    }} key={uniqid()}>
        <CheckBoxEmpty style={{ 
            color:"rgba(159,159,159,0.5)",
            width:"20px",
            height:"20px"  
        }}/>  
        <div style={{
            marginLeft: "5px",
            fontFamily: "sans-serif" 
        }}> 
            {value.title}
        </div> 
    </div> 
    

    createSortableItem = (transform) => SortableElement(({value}) => transform(value)); 
 
 
    getTodosList = (items:Todo[]) =>  
        <ul> {    
            items.map( 
                (todo:Todo, index) => {
                    let SortableItem = this.createSortableItem(this.getTodoElem); 
                    return <SortableItem  key={`item-${index}`} index={index} value={todo} />
                }
            ) 
        } </ul>;    
    

    applyDropStyle = (elem:Element) => {
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
    }      


    createSortableTodosList = (list : Todo[]) => { 
        let SortableList = SortableContainer(({items}) => this.getTodosList(items),{withRef:true}); 
    
        return <SortableList 
            //getContainer={(e) => document.getElementById("todos")} 
            //lockToContainerEdges={true} 
            distance={1}   
            items={list}  
            axis='y'  
            onSortEnd={({oldIndex, newIndex}) => this.props.dispatch({
                type:"todos", 
                load: arrayMove(this.props.todos, oldIndex, newIndex),
            })}   
            onSortMove={(e) => {
               let target = document.getElementById("projects"); 
               let ref = document.body.children[document.body.children.length-1];
   
               if(insideTargetArea(target)(e.clientX,e.clientY))
                this.applyDropStyle(ref);
            }}   
            //shouldCancelStart={() => true}
            onSortStart={({node, index, collection}, event) => {
            }}    
            useWindowAsScrollContainer={true}
        />  
    }   
 
        
    render(){
     return <div style={{ 
              width: "74%",
              position:"relative",
              display: "flex",
              flexDirection: "column" 
          }}
        >    

        <div className="no-drag"
              style={{
                  position:"absolute", 
                  top:0,
                  right:0 
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


        <div style={{
            width: "100%",
            padding: "80px"
        }}> 
           <div style={{
                display:"flex",
                alignItems:"center"
           }}>  
               {chooseIcon(this.props.selectedCategory)}
             <div  
               style={{
                    fontFamily: "sans-serif",
                    fontSize: "xx-large",
                    fontWeight: 600,
                    paddingLeft: "10px",
                    WebkitUserSelect: "none",
                    cursor:"default" 
               }}
             >  
               {uppercase(this.props.selectedCategory)}
             </div>
           </div>

            <div style={{
                display: 'flex',
                flexWrap: 'wrap'
            }}> 
            { 
                compose(
                    map((n:number) =>  
                        <div key={uniqid()} style={{padding:"10px"}}>
                            <Chip
                                onRequestDelete={() => {}}
                            >  
                            Placeholder {n}
                            </Chip>
                        </div>
                    ),  
                    range(0)  
                )(5) 
            }
            </div>


        </div>   
       
        <div 
        style={{
            width: "100%",
            height: "30%",
            display: "flex",
            alignItems: "center", 
            justifyContent: "center"
        }}>   
          <TodoCreationForm dispatch={this.props.dispatch} /> 
        </div>    

        <div>
            {  
                this.createSortableTodosList(this.props.todos)
            }
        </div>    


        <ThingsCalendar
            close = {() => this.setState({showCalendar:false})}
            open = {this.state.showCalendar}
            anchorEl = {this.calendarOrigin}
        />  

        <div style={{ 
              height: "60px",
              width: "74%", 
              position: "fixed",
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
              onClick = {() => {}}
              iconStyle={{ 
                  color:"rgb(79, 79, 79)",
                  width:"25px", 
                  height:"25px" 
              }}>     
                  <Plus />
              </IconButton> 

              <div ref={(e) => {this.calendarOrigin=e}}>
                <IconButton 
                onClick = {() => this.setState({showCalendar:true})}
                iconStyle={{ 
                    color:"rgb(79, 79, 79)",
                    width:"25px", 
                    height:"25px" 
                }}>     
                    <CalendarIco />
                </IconButton> 
              </div>



              <IconButton 
              onClick = {() => {}}
              iconStyle={{ 
                  color:"rgb(79, 79, 79)",
                  width:"25px", 
                  height:"25px" 
              }}>     
                  <Arrow />
              </IconButton> 
              <IconButton 
              onClick = {() => {}}
              iconStyle={{  
                  color:"rgb(79, 79, 79)",
                  width:"25px", 
                  height:"25px" 
              }}>     
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