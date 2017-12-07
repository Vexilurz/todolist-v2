import '../assets/styles.css';  
import '../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, uniq,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, any,
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, 
    groupBy, concat, flatten, toPairs, adjust, prepend, fromPairs 
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
import { Component, SyntheticEvent } from "react"; 
import Paper from 'material-ui/Paper';
import { DraggableCore, DraggableEventHandler, DraggableData } from 'react-draggable';
import * as Draggable from 'react-draggable'; 
import { 
    wrapMuiThemeLight, wrapMuiThemeDark, attachDispatchToProps, 
    uppercase, insideTargetArea, selectCategoryBlock
} from "../utils"; 
import { createStore, combineReducers } from "redux"; 
import { Provider, connect } from "react-redux";
//import Chip from 'material-ui-next/Chip';
import Chip from 'material-ui/Chip';
//icons 
import ClearArrow from 'material-ui/svg-icons/content/backspace';   
import Menu from 'material-ui/Menu';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
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
 
import NewProjectIcon from 'material-ui/svg-icons/image/timelapse';
import NewAreaIcon from 'material-ui/svg-icons/action/tab';

import Plus from 'material-ui/svg-icons/content/add';
import Trash from 'material-ui/svg-icons/action/delete';
import Search from 'material-ui/svg-icons/action/search'; 
import List from 'material-ui/svg-icons/action/list'; 
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Moon from 'material-ui/svg-icons/image/brightness-3';
import Logbook from 'material-ui/svg-icons/av/library-books';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc'; 
import { queryToTodos, getTodos, updateTodo, Todo, removeTodo } from '../databaseCalls';
let uniqid = require("uniqid");
import DayPicker from 'react-day-picker';
//import Popover from 'material-ui-next/Popover';
import Popover from 'material-ui/Popover';
import Button from 'material-ui-next/Button';
import { InboxBlock } from '../MainBlocks/InboxBlock';
import { UpcomingBlock } from '../MainBlocks/UpcomingBlock';
import { TodayBlock } from '../MainBlocks/TodayBlock';
import { AnytimeBlock } from '../MainBlocks/AnytimeBlock';
import { SomedayBlock } from '../MainBlocks/SomedayBlock';
import { LogbookBlock } from '../MainBlocks/LogbookBlock';
import { TrashBlock } from '../MainBlocks/TrashBlock';
import { ProjectBlock } from '../MainBlocks/ProjectBlock';
import { AreaBlock } from '../MainBlocks/AreaBlock';





 
interface RightClickMenuState{} 

//showRightClickMenu 
//rightClickedTodoId 
//rightClickMenuX 
//rightClickMenuY  
//dispatch  
@connect((store,props) => store, attachDispatchToProps) 
export class RightClickMenu extends Component<any,RightClickMenuState>{

   constructor(props){
       super(props);
   }


   changeTodo = (todo:Todo) => {
       let idx = findIndex((t:Todo) => todo._id===t._id)(this.props.todos);
        
       if(idx!==-1)
           this.props.dispatch({
               type:"todos",
               load:adjust<Todo>((old:Todo) => todo,idx,this.props.todos)
           });
   } 

   removeTodo = (_id:string) => {
       let idx = findIndex((item:Todo) => item._id===_id)(this.props.todos);

       if(idx!==-1)
           this.props.dispatch({
               type:"todos",
               load:remove(idx, 1, this.props.todos)
           });
   } 


   onWhen = (e) => {
       this.props.dispatch({type:"showRightClickMenu",load:false});
   } 

   onMove = (e) => {
       this.props.dispatch({type:"showRightClickMenu",load:false});  
   }

   onComplete = (e) => {}

   onShortcuts = (e) => {}

   onRepeat = (e) => {
       this.props.dispatch({type:"showRightClickMenu",load:false}); 
   }

   onDuplicate = (e) => {
       this.props.dispatch({type:"showRightClickMenu",load:false});
   }

   onConvertToProject = (e) => {
       this.props.dispatch({type:"showRightClickMenu",load:false});
   }


   onDeleteToDo = (e) => {
       removeTodo(this.props.rightClickedTodoId)
       .then(
           () => removeTodo(this.props.rightClickedTodoId)
       );
   } 
  

   onRemoveFromProject = (e) => {
       this.props.dispatch({type:"showRightClickMenu",load:false});
   }

   onShare = (e) => {
       this.props.dispatch({type:"showRightClickMenu",load:false});
   }


   render(){
       return  !this.props.showRightClickMenu  ? null:
               <div onClick = {(e) => {
                       e.stopPropagation();
                       e.preventDefault();
                    }} 
                    style={{  
                       paddingLeft: "20px",
                       paddingRight: "5px",
                       paddingTop: "5px",
                       paddingBottom: "5px",
                       boxShadow: "0 0 10px rgba(0,0,0,0.6)",
                       borderRadius:"5px",
                       zIndex:30000, 
                       width:"250px",
                       height:"240px", 
                       position:"absolute",
                       backgroundColor:"rgba(238,237,239,1)",
                       left:this.props.rightClickMenuX+"px",
                       top:this.props.rightClickMenuY+"px"  
                    }}        
               >       
                       <div 
                       onClick = {(e) => {
                           e.stopPropagation();
                           e.preventDefault(); 
                          
                       }} 
                       style={{
                           display: "flex",
                           flexDirection: "column"
                       }}> 
                            <div 
                            
                            onClick = {this.onWhen}
                            
                            className="rightclickmenuitem"
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontFamily: "sans-serif",
                                paddingLeft: "5px",
                                paddingRight: "5px",
                                fontSize: "14px",
                                cursor: "pointer",
                                paddingTop: "2px",
                                paddingBottom: "2px" 
                            }}>
                               <div>
                                   When...
                               </div>
                               <p style={{    
                                   margin: "0px",
                                   fontWeight: 600,
                                   color: "rgba(70,70,70,1)"
                               }}> 
                                   &#8984; S
                               </p>
                           </div>   

                           <div 
                           
                           onClick = {this.onMove}

                           className="rightclickmenuitem"
                           style={{
                               display: "flex",
                               justifyContent: "space-between",
                               alignItems: "center",
                               fontFamily: "sans-serif",
                               paddingLeft: "5px",
                               paddingRight: "5px",
                               fontSize: "14px",
                               cursor: "pointer",
                               paddingTop: "2px",
                               paddingBottom: "2px" 
                           }}>
                               <div>
                                   Move...
                               </div>
                               <p style={{    
                                   margin: "0px",
                                   fontWeight: 600,
                                   color: "rgba(70,70,70,1)"
                               }}>
                               &#8679;&#8984; M
                               </p>   
                           </div>

                           <div 
                           
                           onClick = {this.onComplete}

                           className="rightclickmenuitem"
                           style={{
                               display: "flex",
                               justifyContent: "space-between",
                               alignItems: "center",
                               fontFamily: "sans-serif",
                               paddingLeft: "5px",
                               paddingRight: "5px",
                               fontSize: "14px",
                               cursor: "pointer",
                               paddingTop: "2px",
                               paddingBottom: "2px" 
                           }}>
                               <div>
                                   Complete
                               </div>
                               <div style={{
                                   height: "14px",
                                   display: "flex",
                                   alignItems: "center" 
                               }}>
                                   <ArrowDropRight style={{
                                       padding: 0,
                                       margin: 0,
                                       color: "rgba(0, 0, 0, 0.6)"
                                   }}/>
                               </div>
                           </div>

                           <div 
                           
                           onClick = {this.onShortcuts}

                           className="rightclickmenuitem"
                           style={{
                               display: "flex",
                               justifyContent: "space-between",
                               alignItems: "center",
                               fontFamily: "sans-serif",
                               paddingLeft: "5px",
                               paddingRight: "5px",
                               fontSize: "14px",
                               cursor: "pointer",
                               paddingTop: "2px",
                               paddingBottom: "2px" 
                           }}>
                               <div>
                                   Shortcuts
                               </div>
                               <div style={{
                                   height: "14px",
                                   display: "flex",
                                   alignItems: "center" 
                               }}>
                                   <ArrowDropRight style={{
                                       padding: 0,
                                       margin: 0, 
                                       color: "rgba(0, 0, 0, 0.6)"
                                   }}/>
                               </div>
                           </div> 
                           
                           <div style={{
                                border:"1px solid rgba(200,200,200,0.5)",
                                marginTop: "5px",
                                marginBottom: "5px"
                           }}>
                           </div>

                           <div 
                           onClick = {this.onRepeat}
                           className="rightclickmenuitem"
                           style={{
                               display: "flex",
                               justifyContent: "space-between",
                               alignItems: "center",
                               fontFamily: "sans-serif",
                               paddingLeft: "5px",
                               paddingRight: "5px",
                               fontSize: "14px",
                               cursor: "pointer",
                               paddingTop: "2px",
                               paddingBottom: "2px" 
                           }}>
                               <div>
                                   Repeat...
                               </div>
                               <p style={{    
                                   margin: "0px",
                                   fontWeight: 600,
                                   color: "rgba(70,70,70,1)"
                               }}>&#8679;&#8984;R</p>
                           </div>

                           <div  
                           onClick = {this.onDuplicate}
                           className="rightclickmenuitem"
                           style={{
                               display: "flex",
                               justifyContent: "space-between",
                               alignItems: "center",
                               fontFamily: "sans-serif",
                               paddingLeft: "5px",
                               paddingRight: "5px",
                               fontSize: "14px",
                               cursor: "pointer",
                               paddingTop: "2px",
                               paddingBottom: "2px" 
                           }}>
                               <div>
                                   Duplicate To-Do
                               </div>
                               <p style={{    
                                   margin: "0px",
                                   fontWeight: 600,
                                   color: "rgba(70,70,70,1)"
                               }}>&#8984;D</p>
                           </div>
                           
                           <div 
                           onClick = {this.onConvertToProject}
                           className="rightclickmenuitem"
                           style={{
                               display: "flex",
                               justifyContent: "space-between",
                               alignItems: "center",
                               fontFamily: "sans-serif",
                               paddingLeft: "5px",
                               paddingRight: "5px",
                               fontSize: "14px",
                               cursor: "pointer",
                               paddingTop: "2px",
                               paddingBottom: "2px" 
                           }}>
                               <div>
                                   Convert to Project
                               </div>
                           </div>

                           <div 
                           onClick = {this.onDeleteToDo}
                           className="rightclickmenuitem"
                           style={{
                               display: "flex",
                               justifyContent: "space-between",
                               alignItems: "center",
                               fontFamily: "sans-serif",
                               paddingLeft: "5px",
                               paddingRight: "5px",
                               fontSize: "14px",
                               cursor: "pointer",
                               paddingTop: "2px",
                               paddingBottom: "2px" 
                           }}> 
                               <div>
                                   Delete To-Do
                               </div>
                               <ClearArrow  style={{
                                   padding: 0,
                                   margin: 0,
                                   color: "rgba(0, 0, 0, 0.6)",
                                   height: "14px"
                               }}/>
                           </div>
                           
                           <div style={{
                                border:"1px solid rgba(200,200,200,0.5)",
                                marginTop: "5px",
                                marginBottom: "5px"
                           }}>
                           </div>

                           <div 
                           onClick = {this.onRemoveFromProject}
                           className="rightclickmenuitem"
                           style={{
                               display: "flex",
                               justifyContent: "space-between",
                               alignItems: "center",
                               fontFamily: "sans-serif",
                               paddingLeft: "5px",
                               paddingRight: "5px",
                               fontSize: "14px",
                               cursor: "pointer",
                               paddingTop: "2px",
                               paddingBottom: "2px"  
                           }}>
                               <div>Remove From Project/Area</div>
                           </div>

                           <div style={{
                               border:"1px solid rgba(200,200,200,0.5)",
                               marginTop: "5px",
                               marginBottom: "5px"
                           }}>
                           </div>

                           <div   
                           onClick = {this.onShare}
                           className="rightclickmenuitem"
                           style={{
                               display: "flex",
                               justifyContent: "space-between",
                               alignItems: "center",
                               fontFamily: "sans-serif",
                               paddingLeft: "5px",
                               paddingRight: "5px",
                               fontSize: "14px",
                               cursor: "pointer",
                               paddingTop: "2px",
                               paddingBottom: "2px" 
                           }}> 
                               <div>Share</div>
                           </div>

                       </div> 
               </div>
           };
}
