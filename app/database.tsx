import './assets/styles.css'; 
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import PouchDB from 'pouchdb-browser';  
import { ChecklistItem } from './Components/TodoInput/TodoChecklist';
import { Category } from './Components/MainContainer';
import { randomArrayMember, randomInteger, randomDate } from './utils';
import { isNil } from 'ramda';
let uniqid = require("uniqid"); 
 
 
 
let todos_db;
let projects_db; 
let areas_db;


 
export let initDB = () => {
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



export type ObjectType = "heading" | "project" | "todo" | "area"; 

 
 
export interface Heading{
  title : string, 
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
  attachedTags : string[]
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
  completed : Date, 
  checked : boolean
};
  


export interface Query<T>{
  total_rows: 2, 
  offset: 0, 
  rows: QueryResult<T>[]
};



export interface QueryResult<T>{
  doc:T,
  id:string, 
  key:string,
  value:Object 
};



export let generateId = () => uniqid() + new Date().toJSON(); 

  

function queryToObjects<T>(query:Query<T>){

    if(isNil(query))
       throw new Error(`query undefined ${query}. queryToObjects.`);
 
    let rows : any[] = query.rows;
    let docs = [];

    if(rows.length===0)
       return []; 
        
    for(let i=0; i<rows.length; i++){
        let doc = rows[i].doc;
        docs.push(doc);
    }

    return docs;

};


 
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
  middleware:Function,
  onError:Function, 
  db:any
){
  return function(_id:string) : Promise<void>{
 
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
  middleware:Function,
  onError:Function, 
  db:any
){
  return function(items:T[]) : Promise<T[]>{
 
    return getItems(onError,db)(0,100000)    
            .then( (query:Query<T>) => queryToObjects<T>(query) )
            .then( (allItems:T[]) => {

              for(let i=0; i<items.length; i++){
                  let received = allItems.find((item) => item[`_id`]===items[i][`_id`]);
                  items[i][`_rev`] = received[`_rev`];
              } 

              return db.bulkDocs(items) 
                        .then((updated) => { 
                            middleware(db, updated);
                            return updated;
                        })
                        .catch(onError); 
 
            }); 

  }  
}


  
function updateItemInDatabase<T>(
  middleware:Function,
  onError:Function, 
  db:any
){
  return function(_id:string, changed:T) : Promise<T>{
    
    return db.get(_id)
             .then((doc) => {   
                changed["_rev"] = doc["_rev"];
                middleware(changed,db);
                return db.put(changed);  
             })
             .catch(onError);
             
  }  
}



export let addArea = (onError:Function, area : Area) : Promise<void> => {

      return setItemToDatabase<Area>(
        (e) => console.log(e), 
        areas_db
      )(area);

}



export let removeArea = (item_id:string) : Promise<void> => {

      return removeObject<string>(
        () => {},
        (e) => console.log(e), 
        areas_db
      )(item_id); 

}


export let getAreaById = (onError:Function, _id : string) : Promise<Area> => {

      return getItemFromDatabase<Area>(
        (e) => console.log(e), 
        areas_db
      )(_id); 

}



export let updateArea = (_id : string, replacement : Area, onError:Function) : Promise<Area> => {

      return updateItemInDatabase<Area>(
        () => {},
        (e) => console.log(e), 
        areas_db
      )(_id, replacement); 

}
 

export let getAreas = (onError:Function) => (descending,limit) : Promise<Area[]> => {

      return getItems<Area>(onError, areas_db)(descending,limit)
             .then(queryToAreas);

}
 
  




















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
     





export let addAreas = (onError:Function, areas:Area[]) : Promise<void> => 
          setItemsToDatabase<Area>(
              (e) => console.log(e), 
              areas_db
          )(areas);  



export let addProjects = (onError:Function, projects:Project[]) : Promise<void> => 
          setItemsToDatabase<Project>(
              (e) => console.log(e), 
              projects_db
          )(projects);

 
export let addTodos = (onError:Function, todos : Todo[]) : Promise<void> => 
          setItemsToDatabase<Todo>(
              (e) => console.log(e), 
              todos_db
          )(todos);


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
         


export let removeTodos = (todos : Todo[]) : Promise<any[]> => {
  return updateItemsInDatabase<Todo>(
    (db, value) => console.log(db,value),
    (e) => console.log(e),
    todos_db
  )(todos.map( t => ({...t, _deleted: true}) ))
}    


 
export let removeProjects = (projects : Project[]) : Promise<any[]> => {
  return updateItemsInDatabase<Project>(
    (db, value) => console.log(db,value),
    (e) => console.log(e),
    projects_db
  )(projects.map( p => ({...p, _deleted: true}) ))
}    
  
  

export let removeAreas = (areas : Area[]) : Promise<any[]> => {
  return updateItemsInDatabase<Area>( 
    (db, value) => console.log(db,value),
    (e) => console.log(e),
    areas_db      
  )(areas.map( a => ({...a, _deleted: true}) ))
}    
 
 

export let updateTodos = (todos : Todo[], onError : Function) : Promise<any[]> => {
  return updateItemsInDatabase<Todo>( 
    (db, value) => console.log(db,value),
    (e) => console.log(e),
    todos_db       
  )(todos)
} 



export let updateProjects = (projects : Project[], onError : Function) : Promise<any[]> => {
  return updateItemsInDatabase<Project>( 
    (db, value) => console.log(db,value),
    (e) => console.log(e),
    projects_db       
  )(projects)
} 



export let updateAreas = (areas : Area[], onError : Function) : Promise<any[]> => {
  return updateItemsInDatabase<Area>( 
    (db, value) => console.log(db,value),
    (e) => console.log(e),
    areas_db       
  )(areas)
}
  


export let queryToTodos = (query:Query<Todo>) : Todo[] => queryToObjects<Todo>(query); 

export let queryToProjects = (query:Query<Project>) : Project[] => queryToObjects<Project>(query); 

export let queryToAreas = (query:Query<Area>) : Area[] => queryToObjects<Area>(query); 



export let destroyEverything = () : Promise<void[]> => 

  Promise.all([ 

      new PouchDB('todos')
      .destroy()
      .then(function () {
        // database destroyed
      })
      .catch(function (err) {
        // error occurred
      }), 


      new PouchDB('projects')
      .destroy()
      .then(function () {
        // database destroyed
      })
      .catch(function (err) {
        // error occurred
      }),


      new PouchDB('areas')
      .destroy()
      .then(function () {
        // database destroyed
      })
      .catch(function (err) {
        // error occurred
      }),

  ])


