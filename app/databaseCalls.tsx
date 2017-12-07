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


import { todos_db } from './app';
let uniqid = require("uniqid");


export let generateID = () => new Date().toJSON(); 


export interface Project{
  _id : string, 
  attachedTodos : string[],
  name : string,
  description : string 
}
 
 
export interface Area{
  _id : string, 
  attachedTodos : string[],
  attachedProjects : string[],
  name : string,  
  description : string 
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
  attachemnts : string[],
  checked?:boolean
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






function queryToObjects<T>(query:Query<T>){
    return ifElse(
        isNil, 
        () => [],
        compose( 
            map(prop("doc")),
            prop("rows") 
        ) 
    )(query)
}



function setItemToDatabase<T>(
  middleware:Function,
  onError:Function, 
  db:any
){
  return function(item:T) : Promise<void>{

      middleware(item,db);     

      return db.put(item).catch(onError);

  }  
}  




export function removeObject<T>(
  middleware:Function,
  onError:Function, 
  db:any
){
  return function(_id) : Promise<void>{
 
    return updateItemInDatabase<any>(
      middleware,
      onError, 
      db 
    )(_id, {_deleted: true})

  }  
}  


function getItemFromDatabase<T>(
  onError:Function, 
  db:any
){
  return function(_id:string) : Promise<T>{
        
    return db.get(_id).catch(onError);  
 
  }
}



function getItems<T>(
  onError:Function, 
  db:any
){
  return function(descending,limit) : Promise<Query<T>>{
 
      return db.allDocs({ 
          include_docs:true,  
          conflicts: true,
          descending,
          limit 
      }) 
      .catch(onError); 
       
  }
}



function getItemsRange<T>(
  onError:Function, 
  db:any
){ 
  return function(
    descending,
    limit,
    start,
    end 
  ) : Promise<Query<T>>{
 
      return db.allDocs({ 
        include_docs:true,
        conflicts: true, 
        descending,
        limit, 
        startkey:start,
        endkey:end 
      }) 
      .catch(onError); 
       
  }
}

  
function updateItemInDatabase<T>(
  middleware:Function,
  onError:Function, 
  db:any
){
  return function(_id:string, changed:T) : Promise<T>{
    
    return db.get(_id)
           .then(
              (doc) => {
                let updated = merge(doc,changed);
                middleware(updated,db);
                return db.put(updated);
              } 
            ).catch(onError); 
   
  } 
}

 

 

export let addTodo = (onError:Function, todo : Todo) : Promise<void> => 
           setItemToDatabase<Todo>(
              () => {},
              (e) => console.log(e), 
              todos_db
           )(todo);
 


            
export let removeTodo = (item_id:string) : Promise<void> =>
          removeObject<string>(
            () => {},
            (e) => console.log(e), 
            todos_db
          )(item_id); 
  
   
 
export let getTodoById = (onError:Function, _id : string) : Promise<Todo> => 
          getItemFromDatabase<Todo>(
            (e) => console.log(e), 
            todos_db
          )(_id); 

 
  
export let updateTodo = (_id : string, replacement : Todo, onError:Function) : Promise<Todo> => 
          updateItemInDatabase<Todo>(
            () => {},
            (e) => console.log(e), 
            todos_db
          )(_id, replacement); 
 



export let getTodosRange = (onError:Function) =>
  (
    descending, 
    limit,
    start,
    end
  ) : Promise<Todo[]>=> 
  
      getItemsRange<Todo>(
        onError, 
        todos_db
      )(
        descending,
        limit,
        start,
        end 
      ).then(
        queryToTodos
      )
                
  


 
export let getTodos = (onError:Function) => (descending,limit) : Promise<Query<Todo>> => 
    getItems<Todo>(
      onError, 
      todos_db
    )(
      descending,
      limit
    )
         

 

export let queryToTodos = (query:Query<Todo>) => queryToObjects<Todo>(query); 
 
