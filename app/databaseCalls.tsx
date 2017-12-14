import './assets/styles.css'; 
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, 
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, 
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, groupBy, concat, flatten, ifElse 
} from 'ramda';  
import { ipcRenderer } from 'electron';
import PouchDB from 'pouchdb-browser';  
import { ChecklistItem } from './Components/TodoInput';



let todos_db = new PouchDB('todos', {adapter: 'websql'}); 
let projects_db = new PouchDB('projects', {adapter: 'websql'});
let areas_db = new PouchDB('areas', {adapter: 'websql'});
let events_db = new PouchDB('events', {adapter: 'websql'});  



  
export let generateID = () => new Date().toJSON(); 



 
 
export interface Heading{

  title : string, 

  attachedTodosIds : string[],

}
  
 
export interface Project{

  _id : string,  
  name : string, 
  description : string, 
  headings : Heading[],

  attachedTodosIds : string[], 
  attachedAreasIds : string[], 
  attachedTags : string[],
  
}
 
 
export interface Area{

  _id : string, 
  name : string,  
  description : string,
  attachedTags : string[], 

  attachedTodosIds : string[], 
  attachedProjectsIds : string[],
  attachedEventsIds : string[], 
  
} 


export interface Todo{ 
  _id : string,
  category : string, 
  title : string,
  priority : number,
  note : string,  
  checklist : ChecklistItem[],
  reminder : any, 
  attachedProjects : string[],
  attachedTags : string[],
  status : string,
  deadline : Date,
  created : Date,
  deleted : Date,
  attachedDate : Date, 
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
  attachedProjectsIds : string[],
  attachedTags : string[],
  date:Date,
  location:string,  
  history : {
      action : string,
      date : Date
  },
  attachemnts : string[]
}
 


export interface Query<T>{
  total_rows: 2, 
  offset: 0, 
  rows: QueryResult<T>[]
}

export interface QueryResult<T>{
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
  onError:Function, 
  db:any
){ 
  return function(item:T) : Promise<void>{

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

 

















export let addArea = (onError:Function, area : Area) : Promise<void> => 
      setItemToDatabase<Area>(
        (e) => console.log(e), 
        areas_db
      )(area);



export let removeArea = (item_id:string) : Promise<void> =>
      removeObject<string>(
        () => {},
        (e) => console.log(e), 
        areas_db
      )(item_id); 



export let getAreaById = (onError:Function, _id : string) : Promise<Area> => 
      getItemFromDatabase<Area>(
        (e) => console.log(e), 
        areas_db
      )(_id); 



export let updateArea = (_id : string, replacement : Area, onError:Function) : Promise<Area> => 
      updateItemInDatabase<Area>(
        () => {},
        (e) => console.log(e), 
        areas_db
      )(_id, replacement); 



export let getAreas = (onError:Function) => (descending,limit) : Promise<Area[]> => 
      getItems<Area>(
        onError,  
        areas_db
      )(
        descending,
        limit
      ).then(queryToAreas)
             
 
 




















export let addProject = (onError:Function, project : Project) : Promise<void> => 
      setItemToDatabase<Project>(
        (e) => console.log(e), 
        projects_db
      )(project);

 

export let removeProject = (item_id:string) : Promise<void> =>
      removeObject<string>(
        () => {},
        (e) => console.log(e), 
        projects_db
      )(item_id); 



export let getProjectById = (onError:Function, _id : string) : Promise<Project> => 
      getItemFromDatabase<Project>(
        (e) => console.log(e), 
        projects_db
      )(_id); 





export let updateProject = (_id : string, replacement : Project, onError:Function) : Promise<Project> => 
      updateItemInDatabase<Project>(
        () => {},
        (e) => console.log(e), 
        projects_db
      )(_id, replacement); 





export let getProjects = (onError:Function) => (descending,limit) : Promise<Project[]> => 
           getItems<Project>(
             onError,  
             projects_db 
           )(
             descending,
             limit
           ).then(queryToProjects);
     


 

export let getEvents = (onError:Function) => (descending,limit) : Promise<Event[]> => 
            getItems<Event>(
             onError,  
             events_db
            )(
              descending,
              limit
            ).then(queryToEvents);

























export let addTodo = (onError:Function, todo : Todo) : Promise<void> => 
           setItemToDatabase<Todo>(
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
 


 
export let getTodos = (onError:Function) => (descending,limit) : Promise<Todo[]> => 
    getItems<Todo>(
      onError, 
      todos_db
    )(
      descending,
      limit
    ).then(queryToTodos)
         
  
 


















    

export let queryToTodos = (query:Query<Todo>) : Todo[] => queryToObjects<Todo>(query); 

export let queryToEvents = (query:Query<Event>) : Event[] => queryToObjects<Event>(query); 

export let queryToProjects = (query:Query<Project>) : Project[] => queryToObjects<Project>(query); 

export let queryToAreas = (query:Query<Area>) : Area[] => queryToObjects<Area>(query); 
