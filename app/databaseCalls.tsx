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


import { db } from './app';
let uniqid = require("uniqid");


export let generateID = () => new Date().toJSON(); 


export interface Project{
  _id : string, 
  attachedTodos : string[],
  name : string,
  description : string 
}


export interface Tag{
  _id : string,
  name : string,
  attachedTodos : string[]
} 


export interface Todo{ 
  _id : string,
  category : string, 
  title : string,
  priority : number,
  notes : string[],
  attachedProdjects : string[],
  attachedTags : string[],
  status : string,
  deadline : Date,
  created : Date,
  deleted : Date,
  fulfilled : Date, 
  history : {
      action : string,
      date : Date
  }[],
  attachemnts : string[]
}


export interface Event{
  _id : string,
  title : string,
  notes : string[],
  attachedProdjects : string[],
  attachedTags : string[],
  date:Date,
  location:string,  
  history : {
      action : string,
      date : Date
  },
  attachemnts : string[]
}



interface Query<T>{
  total_rows: 2, 
  offset: 0, 
  rows: QueryResult<T>[]
}

interface QueryResult<T>{
  doc:T,
  id:string,
  key:string,
  value:Object 
}




export let addTodo = (onError:Function, todo : Todo) : Promise<void> => 
         db.put(todo).catch(onError);

export let getTodoById = (onError:Function, _id : string) : Promise<Todo> => 
         db.get(_id).catch(onError); 

export let updateTodo = (_id : string, replacement : Todo, onError:Function) : Promise<Todo> => 
  db.get(_id)
  .then((doc) => db.put(merge(doc,replacement))) 
  .catch(onError); 


export let getTodosRange = (onError:Function) =>
(descending,limit,start,end) : Promise<Todo[]>=> 
  db.allDocs({
      include_docs:true,
      conflicts: true, 
      descending,
      limit, 
      startkey:start,
      endkey:end 
  })
  .then((result) => {
      console.log("getTodosRange", result);
      return result; 
  })
  .catch(onError);  


export let getTodos = (onError:Function) =>  
(descending,limit) : Promise<Query<Todo>> => 
  db.allDocs({ 
      include_docs:true, 
      conflicts: true,
      descending,
      limit 
  })
  .catch(onError); 

 

export let queryToTodos = (query:Query<Todo>) => ifElse(
      isNil, 
      () => [],
      compose( 
          map(prop("doc")),
          prop("rows") 
      ) 
  )(query)
 
