Date.prototype["addDays"] = function(days){
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat; 
}; 
import './assets/styles.css'; 
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
const PouchDB = require('pouchdb-browser').default;
import { convertTodoDates, measureTimePromise } from './utils/utils';
import { isNil, all, map, isEmpty, not, reduce } from 'ramda'; 
import { isDev } from './utils/isDev';
import { assert } from './utils/assert';
import { isArea, isString, isProject, isTodo } from './utils/isSomething';
import { Calendar, ChecklistItem, Category, RawDraftContentState, RepeatOptions, Todo, Project, Area, Query } from './types';
const Promise = require('bluebird');
const path = require('path');
let todos_db = new PouchDB('todos');  
let projects_db = new PouchDB('projects');
let areas_db = new PouchDB('areas'); 
let calendars_db = new PouchDB('calendars'); 



let updateProjects = (projects : Project[], onError : Function) : Promise<any[]> => {
    if(isDev()){
       assert(all(isProject,projects),`Not all input values are of type Project ${projects}.`); 
    }
    return updateItemsInDatabase(onError,projects_db)(projects);
};



let updateArea = (_id:string, replacement:Area, onError:Function) : Promise<Area> => {
    if(isDev()){
       assert(isArea(replacement),`Input value is not of type area. ${replacement}. updateArea.`);
    }
    return updateItemInDatabase(onError, areas_db)(_id, replacement);  
};



let updateAreas = (areas : Area[], onError : Function) : Promise<any[]> => {
    if(isDev()){
       assert(all(isArea,areas),`Not all input values are of type Area ${areas}. updateAreas.`);
    }
    return updateItemsInDatabase(onError,areas_db)(areas);
};



let updateProject = (_id : string, replacement : Project, onError:Function) : Promise<Project> => {
    if(isDev()){
       assert(isProject(replacement),`Input value is not of type Project ${replacement}. updateProject.`);
    }

    return updateItemInDatabase(onError, projects_db)(_id, replacement); 
};



let updateTodo = (_id:string, replacement:Todo, onError:Function) : Promise<Todo> => {
    if(isDev()){
       assert(isTodo(replacement),`Input value is not of type Todo ${replacement}. updateTodo.`);
    }

    return updateItemInDatabase(onError, todos_db)(_id, replacement);    
}; 



let updateTodos = (todos : Todo[], onError : Function) : Promise<any[]> => {
    if(isDev()){
       assert(all(isTodo,todos),`Not all input values are of type Todo ${todos}. updateTodos.`);
    }

    return updateItemsInDatabase(onError, todos_db)(todos);
};



let queryToObjects = (query:Query<any>) => {
    if(isNil(query) || isEmpty(query.rows)){ return [] }

    return query.rows.map( row => row.doc );
};


 
let setItemToDatabase = (onError:Function, db:any) => 
    (item:any) : Promise<void> => db.put(item).catch(onError);



let setItemsToDatabase = (onError:Function, db:any) => 
    (items:any[]) : Promise<void> => db.bulkDocs(items).catch(onError); 
  
  

let removeObject = (onError:Function, db:any) => 
    (_id:string) : Promise<void> => updateItemInDatabase(onError, db)(_id, {_deleted: true});
  
 

let getItemFromDatabase = (onError:Function, db:any) =>
    (_id:string) : Promise<any> => db.get(_id).catch(onError);
 


let getItems = (onError:Function, db:any) => 
    (descending,limit) : Promise<Query<any>> => db.allDocs({ include_docs:true }).catch(onError); 
       
    

let updateItemsInDatabase = (onError:Function, db:any) => {

    return (values:any[]) : Promise<any[]> => {
        let count = 0;

        let update = (values) : Promise<any[]> => {
            let items = values.filter(v => v);

            return db 
                .allDocs({ 
                    include_docs:true,  
                    //descending:true,
                    keys:items.map((item) => item["_id"])
                })    
                .then( (query:Query<any>) => queryToObjects(query) )
                .then( (result:any[]) => {
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
                    if(err.status===409 && count<5){
                        console.log(`409 retry`);
                        count++;
                        return update(values);
                    }else{  
                        //onError(err);
                        return new Promise(resolve => resolve([]));
                    } 
                });     
        };
        
        return update(values);
    }  
};


  
let updateItemInDatabase = (onError:Function, db:any) => {
    let count = 0;  

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
                    if(err.status===409 && count<5){
                        console.log(`409 retry`);
                        count++;
                        return update(_id,changed);
                    }else {  
                        //onError(err);
                        return new Promise( resolve => resolve([]) )
                    } 
                }); 
    }; 
    
    return update;
};



let addArea = (onError:Function, area : Area) : Promise<void> => {
    if(isDev()){
       assert(isArea(area),`area is not of type Area. addArea. ${area}`); 
    }

    return setItemToDatabase(onError, areas_db)(area);
};



let addAreas = (onError:Function, areas:Area[]) : Promise<void> => {
    if(isDev()){
       assert(all(isArea,areas), `Not all input values are of type Area. addAreas. ${areas}`);
    }

    return setItemsToDatabase(onError, areas_db)(areas);   
};
 


let removeArea = (onError:Function,_id:string) : Promise<void> => {
    return removeObject(onError, areas_db)(_id); 
};



let getAreaById = (onError:Function, _id : string) : Promise<Area> => {
    if(isDev()){
       assert(isString(_id), `_id is not of type String.getAreaById. ${_id}`);
    }

    return getItemFromDatabase(onError,areas_db)(_id); 
};



let getAreas = (onError:Function) => (descending,limit) : Promise<Area[]> => {
    return getItems(onError, areas_db)(descending,limit).then(queryToAreas);
};



let removeAreas = (areas : Area[], onError : Function) : Promise<any[]> => {
    if(isDev()){
       assert(all(isArea,areas),`Not all input values are of type Area ${areas}. removeAreas.`);
    }

    return updateItemsInDatabase(onError,areas_db)(areas.map( a => ({...a, _deleted: true}) ));
};   



let addProject = (onError:Function, project : Project) : Promise<void> => {
    if(isDev()){
       assert(isProject(project),`Input value is not of type project. ${project}. addProject.`);
    }

    return setItemToDatabase(onError, projects_db)(project);
};



let addProjects = (onError:Function, projects:Project[]) : Promise<void> => {
    if(isDev()){
       assert(all(isProject,projects),`Not all input values are of type Project ${projects}. addProjects.`);
    }

    return setItemsToDatabase(onError, projects_db)(projects); 
};



let removeProject = (_id:string, onError:Function) : Promise<void> => {
    if(isDev()){
       assert(isString(_id), `_id is not a string. ${_id}. removeProject.`);
    }

    return removeObject(onError,projects_db)(_id); 
};



let getProjectById = (onError:Function, _id : string) : Promise<Project> => {
    if(isDev()){
       assert(isString(_id), `_id is not a string. ${_id}. getProjectById.`);
    }

    return getItemFromDatabase(onError, projects_db)(_id);
};



let getProjects = (onError:Function) => (descending,limit) : Promise<Project[]> => {

    return getItems(
       onError,  
       projects_db 
    )(
       descending,
       limit
    ).then(
       queryToProjects
    );
};


 
let removeProjects = (projects : Project[], onError:Function) : Promise<any[]> => {
    if(isDev()){
       assert(all(isProject,projects),`Not all input values are of type Project ${projects}. removeProjects.`);
    }
   
    return updateItemsInDatabase(onError, projects_db)( projects.map(p => ({...p, _deleted: true})) )
};    



let addTodo = (onError:Function, todo : Todo) : Promise<void> => {
    if(isDev()){
       assert(isTodo(todo),`Input value is not of type Todo ${todo}. addTodo.`);
    }

    return setItemToDatabase(onError,todos_db)(todo);
};
  


let addCalendar = (onError:Function, calendar:Calendar) : Promise<void> => {
    //for performance reason dont save events data into database
    //they will be requested anyway from url on application startup or url submit
    calendar.events = [];

    return setItemToDatabase(onError,calendars_db)(calendar);
};
 


let updateCalendar = (_id:string, replacement:Calendar, onError:Function) : Promise<Calendar> => {
    return updateItemInDatabase(onError, calendars_db)(_id, replacement);    
};



let addCalendars = (onError:Function, calendars:Calendar[]) : Promise<void> => {
    return setItemsToDatabase(onError, calendars_db)(calendars);
};



let addTodos = (onError:Function, todos : Todo[]) : Promise<void> => {
    if(isDev()){
       assert(all(isTodo,todos),`Not all input values are of type Todo ${todos}. addTodos.`);   
    } 

    return setItemsToDatabase(onError, todos_db)(todos); 
};
  


let removeCalendars = (calendars : Calendar[], onError:Function) : Promise<any[]> => {
    return updateItemsInDatabase(onError,calendars_db)(calendars.map( t => ({...t, _deleted: true})))
};     



let removeCalendar = (_id:string, onError:Function) : Promise<void> => {
    if(isDev()){
       assert(isString(_id),`_id is not a string. ${_id}. removeCalendar.`);  
    }

    return removeObject(onError, calendars_db)(_id); 
};



let removeTodo = (_id:string,onError:Function) : Promise<void> => {
    if(isDev()){
       assert(isString(_id),`_id is not a string. ${_id}. removeTodo.`);
    }

    return removeObject(onError,todos_db)(_id); 
};


  
let getTodoById = (onError:Function, _id:string) : Promise<Todo> => {
    if(isDev()){
       assert(isString(_id),`_id is not a string. ${_id}. getTodoById.`);  
    }

    return getItemFromDatabase(onError, todos_db)(_id); 
};

 

let getTodos = (onError:Function) => (descending,limit) : Promise<Todo[]> => {
    return getItems(onError, todos_db)(descending,limit).then(queryToTodos)           
};



let getCalendars = (onError:Function) => (descending,limit) : Promise<Calendar[]> => {
    return getItems(onError, calendars_db)( 
      descending,
      limit 
    ).then(
      queryToCalendars
    )
};


  
let removeTodos = (todos:Todo[], onError:Function) : Promise<any[]> => {
    if(isDev()){
        assert(all(isTodo,todos),`Not all input values are of type Todo ${todos}. removeTodos.`);
    }  

    if(isEmpty(todos)){ 
        return new Promise(resolve => resolve([]));
    }  
    
    return updateItemsInDatabase(onError, todos_db)(todos.map(t => ({...t, _deleted: true})));
};     



let queryToCalendars = (query:Query<Calendar>) : Calendar[] => queryToObjects(query); 



let queryToTodos = (query:Query<Todo>) : Todo[] => queryToObjects(query); 



let queryToProjects = (query:Query<Project>) : Project[] => queryToObjects(query); 



let queryToAreas = (query:Query<Area>) : Area[] => queryToObjects(query); 



let getDatabaseObjects = (onError:Function,max:number) => {
    return Promise.map(
        [
            () => measureTimePromise( getCalendars(onError), 'getCalendars' )(true,max),
            () => measureTimePromise( getProjects(onError), 'getProjects' )(true,max),
            () => measureTimePromise( getAreas(onError), 'getAreas' )(true,max),
            () => measureTimePromise( getTodos(onError), 'getTodos' )(true,max)
        ], 
        (f) => f(), 
        {concurrency: 1}
    );
};

 

let destroyEverything = () : Promise<void[]> => 
    Promise.all([ 
        calendars_db.destroy(),
        todos_db.destroy(),
        projects_db.destroy(),
        areas_db.destroy()
    ]); 


 