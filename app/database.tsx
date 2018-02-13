import './assets/styles.css'; 
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import PouchDB from 'pouchdb-browser';  
import { ChecklistItem } from './Components/TodoInput/TodoChecklist';
import { Category } from './Components/MainContainer';
import { randomArrayMember, randomInteger, randomDate, convertTodoDates } from './utils/utils';
import { isNil, all, map, isEmpty } from 'ramda';
import { isDev } from './app';
import { RepeatPopupState } from './Components/RepeatPopup';
import { assert } from './utils/assert';
import { isArea, isString, isProject, isTodo } from './utils/isSomething';
let uniqid = require("uniqid"); 
let path = require('path');
let Promise = require('bluebird');
 
export let todos_db;
export let projects_db; 
export let areas_db;
export let calendars_db;
 
const limit = 1000000;
 
export let initDB = () => { 
  calendars_db = new PouchDB('calendars'); 
  todos_db = new PouchDB('todos');   
  projects_db = new PouchDB('projects');
  areas_db = new PouchDB('areas'); 
}  

   
initDB(); 

 
Date.prototype["addDays"] = function(days){
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat; 
}; 


export type ObjectType = "heading" | "project" | "todo" | "area" | "calendar"; 


export interface Calendar{
  url:string, 
  name:string,
  description:string,
  timezone:string,
  active:boolean,
  events:any[],
  type:ObjectType, 
  _id:string
};  

 
export interface Heading{
  title : string, 
  priority : number,
  type : ObjectType,
  _id : string, 
  key : string 
};



export type LayoutItem = string | Heading;



export interface Project{
  _id : string,  
  type : ObjectType, 
  name : string,   
  priority : number,
  description : string, 
  layout : LayoutItem[], 
  created : Date, 
  deadline : Date,
  deleted : Date,
  completed : Date, 
  attachedTags : string[], 
  hide?:Category[],
  expand?:number 
};

 
export interface Area{
  _id : string, 
  name : string,  
  type : ObjectType,
  priority : number,
  created : Date,
  deleted : Date, 
  description : string,
  attachedTags : string[], 
  attachedTodosIds : string[], 
  attachedProjectsIds : string[], 
};  


export interface Group{
   _id:string,  
   type:'never'|'on'|'after',
   options?:RepeatPopupState,  
   last?:boolean
}; 
 

export interface Todo{ 
  _id : string,
  category : Category, 
  type : ObjectType,
  title : string,
  priority : number,
  note : string,  
  checklist : ChecklistItem[],
  reminder : Date,  
  deadline : Date,
  created : Date,
  deleted : Date, 
  attachedDate : Date,  
  attachedTags : string[], 
  completedSet : Date,
  completedWhen : Date, 
  group?:Group
}; 
  

export interface Query<T>{
  total_rows: number, 
  offset: number,  
  rows: QueryResult<T>[]
};


export interface QueryResult<T>{
  doc:T,
  id:string, 
  key:string,
  value:Object 
};

  

function queryToObjects<T>(query:Query<T>){
    let docs = [];

    assert(!isNil(query),`query undefined ${JSON.stringify(query)}. queryToObjects.`);

    if(isNil(query)){ return docs };

    let rows : any[] = query.rows;
    
    if(rows.length===0)
       return []; 
        
    for(let i=0; i<rows.length; i++){
        let doc = rows[i].doc;
        docs.push(doc);
    }

    return docs;
}


 
function setItemToDatabase<T>(
  onError:Function, 
  db:any
){ 
  return function(item:T) : Promise<void>{
      return db.put(item).catch(onError);
  }  
}  
 
 

function setItemsToDatabase<T>(
  onError:Function, 
  db:any
){ 
  return function(items:T[]) : Promise<void>{
    return db.bulkDocs(items).catch(onError); 
  }  
}  
 


export function removeObject<T>(
  onError:Function, 
  db:any
){
  return function(_id:string) : Promise<void>{
    return updateItemInDatabase(onError, db)(_id, {_deleted: true});
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
 
      return db
             .allDocs({ 
                include_docs:true,  
                conflicts: true,
                descending,
                limit 
             })  
             .catch(onError); 
       
  }
}



function updateItemsInDatabase<T>(
  onError:Function, 
  db:any
){
  return function(items:T[]) : Promise<T[]>{
    return db
           .allDocs({ 
              include_docs:true,  
              conflicts: true,
              descending:true,
              keys:items.map((item) => item["_id"]),
              limit 
           })    
           .then( (query:Query<T>) => queryToObjects<T>(query) )
           .then( (itemsWithRev:T[]) => {
                let revs = {};

                for(let i=0; i<itemsWithRev.length; i++){
                    let item = itemsWithRev[i];
                    revs[item["_id"]] = item["_rev"];
                }

                for(let i=0; i<items.length; i++){
                    let item = items[i];  
                    item[`_rev`] = revs[item["_id"]];
                }    
                 
                return db.bulkDocs(items).catch(onError); 
           });    
  }  
}


  
function updateItemInDatabase(
  onError:Function, 
  db:any
){
  return function(_id:string, changed:any) : Promise<any>{
    return db.get(_id)
             .then((doc) => {   
                if(isNil(doc) || isEmpty(doc)){ 
                  return new Promise(resolve => resolve(changed));
                }else{
                  changed["_rev"] = doc["_rev"];
                  return db.put({...doc,...changed});  
                }
             })
             .catch(onError);   
  }   
}



export let addArea = (onError:Function, area : Area) : Promise<void> => {
      assert(isArea(area),`area is not of type Area. addArea. ${JSON.stringify(area)}`); 
      return setItemToDatabase<Area>(
        onError, 
        areas_db
      )(area);
}



export let addAreas = (onError:Function, areas:Area[]) : Promise<void> => {
      assert(all(isArea,areas), `Not all input values are of type Area. addAreas. ${JSON.stringify(areas)}`);
      return setItemsToDatabase<Area>(onError, areas_db)(areas);   
}
 

export let removeArea = (onError:Function,_id:string) : Promise<void> => {
    return removeObject<string>(onError, areas_db)(_id); 
}


export let getAreaById = (onError:Function, _id : string) : Promise<Area> => {
    assert(isString(_id), `_id is not of type String.getAreaById. ${_id}`);
    return getItemFromDatabase<Area>(onError,areas_db)(_id); 
}


export let updateArea = (_id:string, replacement:Area, onError:Function) : Promise<Area> => {
    assert(isArea(replacement),`Input value is not of type area. ${JSON.stringify(replacement)}. updateArea.`);
    return updateItemInDatabase(onError, areas_db)(_id, replacement);  
}


export let getAreas = (onError:Function) => (descending,limit) : Promise<Area[]> => {
    return getItems<Area>(onError, areas_db)(descending,limit).then(queryToAreas);
}


export let updateAreas = (areas : Area[], onError : Function) : Promise<any[]> => {
    assert(all(isArea,areas),`Not all input values are of type Area ${JSON.stringify(areas)}. updateAreas.`);
    return updateItemsInDatabase<Area>(onError,areas_db)(areas);
}
  

export let removeAreas = (areas : Area[], onError : Function) : Promise<any[]> => {
    assert(all(isArea,areas),`Not all input values are of type Area ${JSON.stringify(areas)}. removeAreas.`);
    return updateItemsInDatabase<Area>(onError,areas_db)(areas.map( a => ({...a, _deleted: true}) ));
}   


export let addProject = (onError:Function, project : Project) : Promise<void> => {
    assert(isProject(project),`Input value is not of type project. ${JSON.stringify(project)}. addProject.`);
    return setItemToDatabase<Project>(onError, projects_db)(project);
}


export let addProjects = (onError:Function, projects:Project[]) : Promise<void> => {
    assert(all(isProject,projects),`Not all input values are of type Project ${JSON.stringify(projects)}. addProjects.`);
    return setItemsToDatabase<Project>(onError, projects_db)(projects); 
}


export let removeProject = (_id:string, onError:Function) : Promise<void> => {
    assert(isString(_id), `_id is not a string. ${_id}. removeProject.`);
    return removeObject<string>(onError,projects_db)(_id); 
}


export let getProjectById = (onError:Function, _id : string) : Promise<Project> => {
    assert(isString(_id), `_id is not a string. ${_id}. getProjectById.`);
    return getItemFromDatabase<Project>(onError, projects_db)(_id);
}
 


export let updateProject = (_id : string, replacement : Project, onError:Function) : Promise<Project> => {
    assert(isProject(replacement),`Input value is not of type Project ${JSON.stringify(replacement)}. updateProject.`);
    return updateItemInDatabase(onError, projects_db)(_id, replacement); 
}



export let getProjects = (onError:Function) => (descending,limit) : Promise<Project[]> => {

    return getItems<Project>(
      onError,  
      projects_db 
    )(
      descending,
      limit
    ).then(queryToProjects);
 
}
  

 
export let removeProjects = (projects : Project[], onError:Function) : Promise<any[]> => {
    assert(
      all(isProject,projects),
      `Not all input values are of type Project ${JSON.stringify(projects)}. removeProjects.`
    );
   
    return updateItemsInDatabase<Project>(
      onError,
      projects_db 
    )(projects.map( p => ({...p, _deleted: true}) ))
}    
  

export let updateProjects = (projects : Project[], onError : Function) : Promise<any[]> => {
    assert(
      all(isProject,projects),
      `Not all input values are of type Project ${JSON.stringify(projects)}. updateProjects.`
    );

    return updateItemsInDatabase<Project>(onError,projects_db)(projects);
} 
  

export let addTodo = (onError:Function, todo : Todo) : Promise<void> => {
    assert(isTodo(todo),`Input value is not of type Todo ${JSON.stringify(todo)}. addTodo.`);
    return setItemToDatabase<Todo>(onError,todos_db)(todo);
}
  

export let addCalendar = (onError:Function, calendar:Calendar) : Promise<void> => {
    return setItemToDatabase<Calendar>(onError,calendars_db)(calendar);
}
 

export let updateCalendar = (_id:string, replacement:Calendar, onError:Function) : Promise<Calendar> => {
    return updateItemInDatabase(onError, calendars_db)(_id, replacement);    
}


export let addCalendars = (onError:Function, calendars:Calendar[]) : Promise<void> => {
    return setItemsToDatabase<Calendar>(onError, calendars_db)(calendars);
}


export let addTodos = (onError:Function, todos : Todo[]) : Promise<void> => {
    assert(all(isTodo,todos),`Not all input values are of type Todo ${JSON.stringify(todos)}. addTodos.`);    
    return setItemsToDatabase<Todo>(onError, todos_db)(todos); 
}
    

export let removeCalendars = (calendars : Calendar[], onError:Function) : Promise<any[]> => {
    return updateItemsInDatabase<Calendar>(onError,calendars_db)(calendars.map( t => ({...t, _deleted: true})))
}     


export let removeCalendar = (_id:string, onError:Function) : Promise<void> => {
    assert(isString(_id),`_id is not a string. ${_id}. removeCalendar.`);  
    return removeObject<string>(onError, calendars_db)(_id); 
}


export let removeTodo = (_id:string,onError:Function) : Promise<void> => {
    assert(isString(_id),`_id is not a string. ${_id}. removeTodo.`);
    return removeObject<string>(onError,todos_db)(_id); 
}

  
export let getTodoById = (onError:Function, _id : string) : Promise<Todo> => {
    assert(isString(_id),`_id is not a string. ${_id}. getTodoById.`);  
    return getItemFromDatabase<Todo>(onError, todos_db)(_id); 
}

  
export let updateTodo = (_id:string, replacement:Todo, onError:Function) : Promise<Todo> => {
      assert(
        isTodo(replacement), 
        `Input value is not of type Todo ${JSON.stringify(replacement)}. updateTodo.`
      );
    
      return updateItemInDatabase(onError, todos_db)(_id, replacement);    
}

 
export let getTodos = (onError:Function) => (descending,limit) : Promise<Todo[]> => {

    return getItems<Todo>(
      onError, 
      todos_db
    )( 
      descending,
      limit
    ).then(queryToTodos)
}


export let getCalendars = (onError:Function) => (descending,limit) : Promise<Calendar[]> => {
    return getItems<Calendar>(onError, calendars_db)( 
      descending,
      limit 
    ).then(queryToCalendars)
}

  
export let removeTodos = (todos:Todo[], onError:Function) : Promise<any[]> => {
  assert(all(isTodo,todos),`Not all input values are of type Todo ${JSON.stringify(todos)}. removeTodos.`);
  return updateItemsInDatabase<Todo>(onError, todos_db)(todos.map(t => ({...t, _deleted: true})))
}     


export let updateTodos = (todos : Todo[], onError : Function) : Promise<any[]> => {
  assert(all(isTodo,todos),`Not all input values are of type Todo ${JSON.stringify(todos)}. updateTodos.`);
  return updateItemsInDatabase<Todo>(onError, todos_db)(todos);
} 
  

export let queryToCalendars = (query:Query<Calendar>) : Calendar[] => queryToObjects<Calendar>(query); 

export let queryToTodos = (query:Query<Todo>) : Todo[] => {
  return queryToObjects<Todo>(query); 
}

export let queryToProjects = (query:Query<Project>) : Project[] => queryToObjects<Project>(query); 

export let queryToAreas = (query:Query<Area>) : Area[] => queryToObjects<Area>(query); 

export let destroyEverything = () : Promise<void[]> => 
        Promise.all([ 
            calendars_db.destroy(),
            todos_db.destroy(),
            projects_db.destroy(),
            areas_db.destroy()
        ]) 


