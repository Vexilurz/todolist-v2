import './assets/styles.css'; 
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import PouchDB from 'pouchdb-browser';   
import { convertTodoDates } from './utils/utils';
import { isNil, all, map, isEmpty, not } from 'ramda'; 
import { isDev } from './utils/isDev';
import { assert } from './utils/assert';
import { isArea, isString, isProject, isTodo } from './utils/isSomething';
import { 
    Calendar, ChecklistItem, Category, RawDraftContentState, RepeatOptions,
    Todo, Project, Area, Query 
} from './types';


let uniqid = require("uniqid"); 
let path = require('path');
let Promise = require('bluebird');
 

export let todos_db;
export let projects_db; 
export let areas_db;
export let calendars_db;
 

const limit = 100000;

 
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


  
export let updateProjects = (projects : Project[], onError : Function) : Promise<any[]> => {
    assert(
      all(isProject,projects),
      `Not all input values are of type Project ${projects}. updateProjects.`
    ); 
    return updateItemsInDatabase<Project>(onError,projects_db)(projects);
};



export let updateArea = (_id:string, replacement:Area, onError:Function) : Promise<Area> => {
    assert(isArea(replacement),`Input value is not of type area. ${replacement}. updateArea.`);
    return updateItemInDatabase(onError, areas_db)(_id, replacement);  
};



export let updateAreas = (areas : Area[], onError : Function) : Promise<any[]> => {
    assert(all(isArea,areas),`Not all input values are of type Area ${areas}. updateAreas.`);
    return updateItemsInDatabase<Area>(onError,areas_db)(areas);
};



export let updateProject = (_id : string, replacement : Project, onError:Function) : Promise<Project> => {
    assert(isProject(replacement),`Input value is not of type Project ${replacement}. updateProject.`);
    return updateItemInDatabase(onError, projects_db)(_id, replacement); 
};



export let updateTodo = (_id:string, replacement:Todo, onError:Function) : Promise<Todo> => {
    assert(
      isTodo(replacement), 
      `Input value is not of type Todo ${replacement}. updateTodo.`
    );
    return updateItemInDatabase(onError, todos_db)(_id, replacement);    
}; 



export let updateTodos = (todos : Todo[], onError : Function) : Promise<any[]> => {
    if(isDev()){
       assert(all(isTodo,todos),`Not all input values are of type Todo ${todos}. updateTodos.`);
    }
    return updateItemsInDatabase<Todo>(onError, todos_db)(todos);
};



function queryToObjects<T>(query:Query<T>){
    let docs = [];

    assert(!isNil(query),`query undefined ${query}. queryToObjects.`);

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



function updateItemsInDatabase<T>(onError:Function, db:any){

    return function(values:T[]) : Promise<T[]>{

        let update = (values) : Promise<T[]> => {
            let items = values.filter(v => v);

            return db 
                .allDocs({ 
                    include_docs:true,  
                    conflicts: true,
                    descending:true,
                    keys:items.map((item) => item["_id"]), 
                    limit 
                })    
                .then( (query:Query<T>) => queryToObjects<T>(query) )
                .then( (result:T[]) => {
                        let itemsWithRev = result.filter(v => v);
                        let revs = {};

                        for(let i=0; i<itemsWithRev.length; i++){
                            let item = itemsWithRev[i];
                            if(not(isNil(item))){
                                revs[item["_id"]] = item["_rev"];
                            }
                        }

                        for(let i=0; i<items.length; i++){
                            let item = items[i];  
                            if(not(isNil(item))){
                                item[`_rev`] = revs[item["_id"]];
                            }
                        }    
                        
                        return db.bulkDocs(items).catch(onError); 
                })
                .catch((err) => {
                    if(err.status===409){
                        console.log(`409 retry`);
                        return update(values);
                    }else{  
                        onError(err);
                    }
                });    
        };
        

        return update(values);
    }  
};


  
function updateItemInDatabase(
  onError:Function, 
  db:any
){
  let update = function(_id:string, changed:any) : Promise<any>{
    return db.get(_id)
             .then((doc) => {   
                if(isNil(doc) || isEmpty(doc)){ 
                  return new Promise(resolve => resolve(changed));
                }else{
                  changed["_rev"] = doc["_rev"];
                  return db.put({...doc,...changed});  
                }
             })
             .catch((err) => {
                  if(err.status===409){
                     console.log(`409 retry`);
                     return update(_id,changed);
                  }else {  
                      onError(err);
                  }
            }); 
  }; 
  
  return update;
};


export let addArea = (onError:Function, area : Area) : Promise<void> => {
      assert(isArea(area),`area is not of type Area. addArea. ${area}`); 
      return setItemToDatabase<Area>(
        onError, 
        areas_db
      )(area);
};


export let addAreas = (onError:Function, areas:Area[]) : Promise<void> => {
      assert(all(isArea,areas), `Not all input values are of type Area. addAreas. ${areas}`);
      return setItemsToDatabase<Area>(onError, areas_db)(areas);   
};
 

export let removeArea = (onError:Function,_id:string) : Promise<void> => {
    return removeObject<string>(onError, areas_db)(_id); 
};


export let getAreaById = (onError:Function, _id : string) : Promise<Area> => {
    assert(isString(_id), `_id is not of type String.getAreaById. ${_id}`);
    return getItemFromDatabase<Area>(onError,areas_db)(_id); 
};


export let getAreas = (onError:Function) => (descending,limit) : Promise<Area[]> => {
    return getItems<Area>(onError, areas_db)(descending,limit).then(queryToAreas);
};


export let removeAreas = (areas : Area[], onError : Function) : Promise<any[]> => {
    assert(all(isArea,areas),`Not all input values are of type Area ${areas}. removeAreas.`);
    return updateItemsInDatabase<Area>(onError,areas_db)(areas.map( a => ({...a, _deleted: true}) ));
};   


export let addProject = (onError:Function, project : Project) : Promise<void> => {
    assert(isProject(project),`Input value is not of type project. ${project}. addProject.`);
    return setItemToDatabase<Project>(onError, projects_db)(project);
};


export let addProjects = (onError:Function, projects:Project[]) : Promise<void> => {
    assert(all(isProject,projects),`Not all input values are of type Project ${projects}. addProjects.`);
    return setItemsToDatabase<Project>(onError, projects_db)(projects); 
};


export let removeProject = (_id:string, onError:Function) : Promise<void> => {
    assert(isString(_id), `_id is not a string. ${_id}. removeProject.`);
    return removeObject<string>(onError,projects_db)(_id); 
};


export let getProjectById = (onError:Function, _id : string) : Promise<Project> => {
    assert(isString(_id), `_id is not a string. ${_id}. getProjectById.`);
    return getItemFromDatabase<Project>(onError, projects_db)(_id);
};


export let getProjects = (onError:Function) => (descending,limit) : Promise<Project[]> => {

    return getItems<Project>(
      onError,  
      projects_db 
    )(
      descending,
      limit
    ).then(queryToProjects);
};

 
export let removeProjects = (projects : Project[], onError:Function) : Promise<any[]> => {
    assert(
      all(isProject,projects),
      `Not all input values are of type Project ${projects}. removeProjects.`
    );
   
    return updateItemsInDatabase<Project>(
      onError,
      projects_db 
    )(projects.map( p => ({...p, _deleted: true}) ))
};    


export let addTodo = (onError:Function, todo : Todo) : Promise<void> => {
    assert(isTodo(todo),`Input value is not of type Todo ${todo}. addTodo.`);
    return setItemToDatabase<Todo>(onError,todos_db)(todo);
};
  

export let addCalendar = (onError:Function, calendar:Calendar) : Promise<void> => {
    return setItemToDatabase<Calendar>(onError,calendars_db)(calendar);
};
 

export let updateCalendar = (_id:string, replacement:Calendar, onError:Function) : Promise<Calendar> => {
    return updateItemInDatabase(onError, calendars_db)(_id, replacement);    
};


export let addCalendars = (onError:Function, calendars:Calendar[]) : Promise<void> => {
    return setItemsToDatabase<Calendar>(onError, calendars_db)(calendars);
};


export let addTodos = (onError:Function, todos : Todo[]) : Promise<void> => {
    assert(all(isTodo,todos),`Not all input values are of type Todo ${todos}. addTodos.`);    
    return setItemsToDatabase<Todo>(onError, todos_db)(todos); 
};
    

export let removeCalendars = (calendars : Calendar[], onError:Function) : Promise<any[]> => {
    return updateItemsInDatabase<Calendar>(onError,calendars_db)(calendars.map( t => ({...t, _deleted: true})))
};     


export let removeCalendar = (_id:string, onError:Function) : Promise<void> => {
    assert(isString(_id),`_id is not a string. ${_id}. removeCalendar.`);  
    return removeObject<string>(onError, calendars_db)(_id); 
};


export let removeTodo = (_id:string,onError:Function) : Promise<void> => {
    assert(isString(_id),`_id is not a string. ${_id}. removeTodo.`);
    return removeObject<string>(onError,todos_db)(_id); 
};

  
export let getTodoById = (onError:Function, _id : string) : Promise<Todo> => {
    assert(isString(_id),`_id is not a string. ${_id}. getTodoById.`);  
    return getItemFromDatabase<Todo>(onError, todos_db)(_id); 
};

 
export let getTodos = (onError:Function) => (descending,limit) : Promise<Todo[]> => {

    return getItems<Todo>(onError, todos_db)(descending,limit)
           .then(queryToTodos)
           .then(
                (todos:Todo[]) => todos.map(
                    (t:Todo) => isNil(t.completed) ? t :  
                                {
                                  ...t,
                                  completedSet:t.completed,
                                  completedWhen:t.completed
                                } 
                )
            )  

};


export let getCalendars = (onError:Function) => (descending,limit) : Promise<Calendar[]> => {
    return getItems<Calendar>(onError, calendars_db)( 
      descending,
      limit 
    ).then(queryToCalendars)
};

  
export let removeTodos = (todos:Todo[], onError:Function) : Promise<any[]> => {
  assert(all(isTodo,todos),`Not all input values are of type Todo ${todos}. removeTodos.`);
  return updateItemsInDatabase<Todo>(onError, todos_db)(todos.map(t => ({...t, _deleted: true})))
};     


export let queryToCalendars = (query:Query<Calendar>) : Calendar[] => queryToObjects<Calendar>(query); 

export let queryToTodos = (query:Query<Todo>) : Todo[] => {
  return queryToObjects<Todo>(query); 
};

export let queryToProjects = (query:Query<Project>) : Project[] => queryToObjects<Project>(query); 

export let queryToAreas = (query:Query<Area>) : Area[] => queryToObjects<Area>(query); 

export let getDatabaseObjects = (onError:Function,max:number) => {
        return Promise.all([
          getCalendars(onError)(true,max), 
          getProjects(onError)(true,max),
          getAreas(onError)(true,max),
          getTodos(onError)(true,max)
        ]); 
};

export let destroyEverything = () : Promise<void[]> => 
        Promise.all([ 
            calendars_db.destroy(),
            todos_db.destroy(),
            projects_db.destroy(),
            areas_db.destroy()
        ]); 


