import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, 
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, 
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, groupBy, concat, flatten 
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
let uniqid = require("uniqid");


export class TodoCreationForm extends Component<any,any>{

    constructor(props){
        super(props);
    }

    render(){
        return <div style={{
            width: "80%",  
            height: "100%"  
        }}>
            <Paper style={{width:"100%", height:"100%", position:"relative"}} zDepth={2}>
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
                        underlineFocusStyle={{
                            borderColor: "rgba(0,0,0,0)"
                        }}
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
                    />  
                    </div>  
                </div>
                <div style={{  
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    position: "absolute",
                    bottom: 0,
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
                          <Adjustments />
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