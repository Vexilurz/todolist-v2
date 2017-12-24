import './assets/styles.css'; 
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import PouchDB from 'pouchdb-browser';  
import { ChecklistItem } from './Components/TodoInput/TodoChecklist';
import { Category } from './Components/MainContainer';
import { unique, splitEvery, randomArrayMember, randomInteger, randomDate } from './utils';
const randomWord = require('random-word');
let uniqid = require("uniqid"); 
 

let todos_db;
let projects_db; 
let areas_db;
let events_db;   

 
export let initDB = () => {
  todos_db = new PouchDB('todos'); 
  projects_db = new PouchDB('projects');
  areas_db = new PouchDB('areas');
  events_db = new PouchDB('events');  
} 
   
initDB(); 



Date.prototype["addDays"] = function(days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat; 
};




export type ObjectType = "heading" | "project" | "todo" | "event" | "area"; 


 
export interface Heading{
  title : string, 
  type : ObjectType,
  _id : string, 
  key : string 
}



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
  attachedTodosIds : string[],  
  attachedTags : string[]
}
  

 
export interface Area{
  _id : string, 
  name : string,  
  type : ObjectType,
  priority : number,
  deleted : Date, 
  description : string,
  attachedTags : string[], 
  attachedTodosIds : string[], 
  attachedProjectsIds : string[],
} 

 

export interface Todo{ 
  _id : string,
  category : Category, 
  type : ObjectType,
  title : string,
  priority : number,
  note : string,  
  checklist : ChecklistItem[],
  reminder : any,  
  attachedTags : string[], 
  status : string,
  deadline : Date,
  created : Date,
  deleted : Date,
  attachedDate : Date, 
  completed : Date, 
  history : {
      action : string,
      date : Date
  }[],
  attachments : string[],
  checked?:boolean
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

 




let randomCategory = () => {

  let categories = [
    "inbox" , "today" , "upcoming" , "anytime" , "someday" , 
    //"logbook" , "trash" , "project" , "area" , 
    "evening"
  ];  

  return randomArrayMember(categories); 

}
 

 



export let generateId = () => new Date().toJSON(); 


   
let generateid = () => uniqid() + new Date().toJSON();  
 
  
let fakeTags = (n) => {

  let tags = [];
  let i  = randomInteger(n) + 5;

  
  for(let j=0; j<i; j++)
      tags.push(randomWord()); 

  return tags;

}
  


 

let fakeCheckListItem = (idx) => {

  let words : string[] = [];
  let k = randomInteger(3) + 2;

  for(let i=0; i<k; i++)
      words.push(randomWord());  
 

  return {  
      text : words.join(), 
      checked : Math.random() > 0.5 ? true : false,
      idx : idx,
      key : generateid()  
  } 

}



 

let fakeTodo = (tags:string[]) : Todo => {

  let checked = Math.random() > 0.5 ? true : false ;
  
  let title : string[] = [];
  let note : string[] = [];
  let checklist = [];

  let k = randomInteger(3) + 2;
  let n = randomInteger(6) + 2;
  let c = randomInteger(5) + 2;
  

  for(let i=0; i<k; i++)
      title.push(randomWord());  

  for(let i=0; i<n; i++) 
      note.push(randomWord());  

  for(let i=0; i<c; i++) 
      checklist.push(fakeCheckListItem(i));  
    

  return ({ 
      _id : generateid(),   
      type:"todo",
      category : randomCategory(), 
      title : title.join(),
      priority : Math.random()*999999999,
      note : note.join(),
      checklist : checklist,
      reminder : Math.random() > 0.5 ? {} : null, 
      attachedTags:tags,  
      status : "",
      deadline : randomDate(new Date(), new Date()["addDays"](50)),
      created : randomDate(new Date(), new Date()["addDays"](50)),
      deleted : Math.random() < 0.5 ? new Date() : undefined,
      attachedDate : randomDate(new Date(), new Date()["addDays"](50)), 
      completed : checked ? randomDate(new Date(), new Date()["addDays"](50)) : null,
      history : null, 
      attachments : [],
      checked 
  }) 
  
}



let fakeHeading = () : Heading => {

  let title : string[] = []; 

  let k = randomInteger(3) + 2;
  
  for(let i=0; i<k; i++)
      title.push(randomWord());  

  return {
    type : "heading", 
    title : title.join(), 
    _id : generateid(), 
    key : generateid()
  };  

} 
   
 
 
let fakeProject = (attachedTags, layout, attachedAreasIds, attachedTodosIds) : Project => {
    
    let checked = Math.random() > 0.5 ? true : false;

    let name : string[] = [];
    
    let k = randomInteger(3) + 2;
    
    for(let i=0; i<k; i++)
        name.push(randomWord()); 
        
    let description : string[] = [];
          
    let l = randomInteger(3) + 2;
    
    for(let i=0; i<l; i++)
        description.push(randomWord());  
    
    return {   
        _id : generateid(),    
        type : "project", 
        name : name.join(),  
        priority : Math.random()*999999999,
        deleted : Math.random() < 0.5 ? new Date() : undefined,
        description : description.join(),
        created : randomDate(new Date()["addDays"](-50), new Date()),
        deadline : randomDate(new Date(), new Date()["addDays"](50)),
        completed : checked ? randomDate(new Date(), new Date()["addDays"](50)) : null,
        layout,   
        attachedTodosIds,  
        attachedTags  
    };   

} 



let fakeArea = ( 
  attachedTodosIds, 
  attachedProjectsIds,
  attachedEventsIds, 
  attachedTags 
) : Area => {

    let name : string[] = [];
    
    let k = randomInteger(3) + 2;
    
    for(let i=0; i<k; i++)
        name.push(randomWord()); 
        

    let description : string[] = [];
          
    let l = randomInteger(3) + 2;
    
    for(let i=0; i<l; i++)
        description.push(randomWord());  

  
    return { 
      _id : generateid(),   
      type : "area", 
      deleted : Math.random() < 0.5 ? new Date() : undefined,
      priority : Math.random()*999999999,
      name : name.join(),   
      description : description.join(),  
      attachedTags, 
      attachedTodosIds:unique(attachedTodosIds), 
      attachedProjectsIds:unique(attachedProjectsIds)
    }  
 
}



 

let generateProjectLayout = (generateTodosIds,n) => { 
    let layout = [];

    for(let i=0; i<n; i++){
        let r = Math.random();
        if(r > 0.7){
           layout.push(fakeHeading());
        }else{
           layout.push(randomArrayMember(generateTodosIds));
        }
    }  

    return layout;
}


export let generateRandomDatabase = (
  
  { events, todos, projects, areas } : 
  
  { 
    events : number, 
    todos : number, 
    projects : number, 
    areas : number  
  }
 
) : { 

    todos : Todo[],
    events : Event[], 
    projects : Project[],
    areas : Area[] 
     
} => { 
  
  
    let tags = fakeTags(8);
    let tagsChunks = splitEvery(3, tags); 
    let todosItems : Todo[] = [];

    for(let i=0; i<todos; i++)
        todosItems.push(fakeTodo(randomArrayMember(tagsChunks)));


    let generateTodosIds = todosItems.map( (t:Todo) => t._id );
    let generateTodosIdsChunks = [];




    for(let i=0; i<todos; i++){   
        let interval = Math.round(Math.random() * todos);
        let chunk = [];
        for(let j=0; j<interval; j++)
            chunk.push(randomArrayMember(generateTodosIds));
        generateTodosIdsChunks.push(chunk);   
    }
 



    let projectItems = [];
      


    
    for(let i=0; i<projects; i++){
        projectItems.push(fakeProject(
          randomArrayMember(tagsChunks), 
          generateProjectLayout(generateTodosIds,10),
          [],
          generateTodosIdsChunks[i] ? generateTodosIdsChunks[i] : [],  
      ))  
    }
    


    let generateProjectsIds = projectItems.map( (p:Project) => p._id );
    let projectsIdsChunks = splitEvery( Math.round(Math.random()*5), generateProjectsIds );
    let areasItems = [];
 

  
    for(let i=0; i<areas; i++){
        let areaItem = fakeArea(
          generateTodosIdsChunks[i] ? generateTodosIdsChunks[i] : [], 
          projectsIdsChunks[i] ? projectsIdsChunks[i] : [], 
          [],
          randomArrayMember(tagsChunks)
        );
 
        areasItems.push(areaItem)
    }



    return {
      todos : todosItems,
      events : [],
      projects : projectItems,
      areas : areasItems 
    }

}







function queryToObjects<T>(query:Query<T>){

    if(query===undefined || query===null){

       return []; 

    }else{

       let rows : any[] = query.rows;

       if(query===undefined || query===null || rows.length===0)
          return []; 
        

       let docs = [];

       for(let i=0; i<rows.length; i++){
           let doc = rows[i].doc;
           docs.push(doc);
       }

       return docs;
 
    }

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
                 let received = allItems.find( (item) => item["_id"]===items[i]["_id"]);
                 items[i]["_rev"] = received["_rev"];
             }

             return db.bulkDocs(items) 
                      .then(
                        (updated) => {
                          middleware(db, updated);
                          return updated;
                        } 
                      ).catch(onError); 

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
             }).catch(onError); 
    
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


export let addEvent = (onError:Function, event : Event) : Promise<void> => 
          setItemToDatabase<Event>(
            (e) => console.log(e), 
            events_db
          )(event);
            
















 

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

export let queryToEvents = (query:Query<Event>) : Event[] => queryToObjects<Event>(query); 

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

 
        new PouchDB('events')
        .destroy()
        .then(function () {
          // database destroyed
        })
        .catch(function (err) {
          // error occurred
        })  

    ])


