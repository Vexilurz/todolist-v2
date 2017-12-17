import './assets/styles.css'; 
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, multiply, add,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, aperture,
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, groupBy, concat, flatten, ifElse, join 
} from 'ramda';  
import { ipcRenderer } from 'electron';
import PouchDB from 'pouchdb-browser';  
import { ChecklistItem } from './Components/TodoInput';
import { Category } from './MainContainer';


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

const randomWord = require('random-word');
let uniqid = require("uniqid"); 


let randomInteger = (n:number) : number => compose(Math.round, multiply(n), Math.random)(0);


let randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));


let randomArrayMember = (array : any[]) => {

    let range = array.length - 1;
   
    let idx = randomInteger(range);

    let member = array[idx]; 

    if(member===undefined){
      debugger;  
      throw new Error(`Array member undefined. randomArrayMember.${array} ${idx}`)
    
    }

    return member;

} 


let randomCategory = () => {

  let categories = [
    "inbox" , "today" , "upcoming" , "anytime" , "someday" , 
    //"logbook" , "trash" , "project" , "area" , 
    "evening"
  ];  

  return randomArrayMember(categories); 

}



Date.prototype["addDays"] = function(days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat; 
};





  
export let generateID = () => uniqid();  
//() => new Date().toJSON(); 

 
let fakeTags = (n) => compose(map((i) => randomWord()), range(0), add(5))(randomInteger(n));
  

let fakeEvent  = (attachedTags, attachedProjectsIds) : Event => ({
    _id : generateID(), 
    type:"event",
    title : compose(join(' '), map((n) => randomWord()), range(0), add(3))(randomInteger(4)),
    note : compose(join(' '), map((n) => randomWord()), range(0), add(2))(randomInteger(10)),
    attachedProjectsIds,
    attachedTags,
    date:randomDate(new Date(2012, 0, 1), new Date()),
    location:JSON.stringify({ latitude: Math.random()*100, longitude: Math.random()*100 }),  
    history : null,
    attachments : []
}) 



let fakeCheckListItem = (idx) => ({  
    text : compose(join(' '), map((n) => randomWord()), range(0), add(2))(randomInteger(5)), 
    checked : Math.random() > 0.5 ? true : false,
    idx : idx,
    key : uniqid()  
}) 

 

let fakeTodo = (tags:string[], attachedProjectsIds) : Todo => {
  let checked = Math.random() > 0.5 ? true : false ;
  
  if(tags===undefined) 
     throw new Error("Tags undefined. fakeTodo"); 

  return ({ 
      _id : generateID(),   
      type:"todo",
      category : randomCategory(), 
      title : compose(join(' '), map((n) => randomWord()), range(0), add(3))(randomInteger(4)),
      priority : Math.random()*100,
      note : compose(join(' '), map((n) => randomWord()), range(0), add(2))(randomInteger(10)),
      checklist : compose(map(fakeCheckListItem), range(0))(7),
      reminder : Math.random() > 0.5 ? {} : null, 
      attachedProjectsIds, 
      attachedTags:tags,
      status : "",
      deadline : randomDate(new Date(), new Date()["addDays"](50)),
      created : randomDate(new Date(), new Date()["addDays"](50)),
      deleted : null, 
      attachedDate : randomDate(new Date(), new Date()["addDays"](50)), 
      completed : checked ? randomDate(new Date(), new Date()["addDays"](50)) : null,
      history : null, 
      attachments : [],
      checked 
  })

}



let fakeHeading = () : Heading => ({
    type : "heading",
    title : compose(join(' '), map((n) => randomWord()), range(0), add(4))(randomInteger(2)), 
    _id : uniqid(), 
    key : uniqid()
}) 
  
 
 
let fakeProject = (attachedTags, layout, attachedAreasIds) : Project => {
  let checked = Math.random() > 0.5 ? true : false ;

  return ({ 
    _id : generateID(),   
    type : "project",
    name : compose(join(' '), map((n) => randomWord()), range(0), add(3))(randomInteger(3)), 
    description : compose(join(' '), map((n) => randomWord()), range(0), add(7))(randomInteger(20)),
    deadline : randomDate(new Date(), new Date()["addDays"](50)),
    completed : checked ? randomDate(new Date(), new Date()["addDays"](50)) : null,
    layout,
    attachedAreasIds,  
    attachedTags  
})

}



let fakeArea = ( 
  attachedTodosIds, 
  attachedProjectsIds,
  attachedEventsIds, 
  attachedTags 
) : Area => ({ 
    _id : generateID(),   
    type : "area", 
    name : compose(join(' '), map((n) => randomWord()), range(0), add(1))(randomInteger(3)), 
    description : compose(join(' '), map((n) => randomWord()), range(0), add(2))(randomInteger(20)),
    attachedTags,
    attachedTodosIds, 
    attachedProjectsIds,
    attachedEventsIds 
})


let generateProjectLayout = (generateTodosIds,n) => { 

    if(generateTodosIds.length===0)
       throw new Error("generateTodosIds empty. generateProjectLayout.")

    return  compose(
              map((v) => v > 0.7 ? fakeHeading() : randomArrayMember(generateTodosIds)),  
              map((i) => Math.random()),
              range(0)
            )(n) 

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
  
    let tags =  fakeTags(12);
    let tagsChunks = aperture(3)(tags);
 
    if(tagsChunks.length===0) 
       throw new Error("tagsChunks empty.")

    let todosItems : Todo[] = map(() => fakeTodo(randomArrayMember(tagsChunks),[]), range(0,todos));

    let generateTodosIds = map( (t:Todo) => t._id )(todosItems);

    let generateTodosIdsChunks = aperture(3)(generateTodosIds);

 
    let eventsItems : Event[] = map(() => fakeEvent(randomArrayMember(tagsChunks),[]), range(0,events));

    let generateEventsIds = map( (e:Event) => e._id )(eventsItems);
 
    let generateEventsIdsChunks = aperture(3)(generateEventsIds);
    

    let projectItems = map((n) => fakeProject(
        randomArrayMember(tagsChunks),
        generateProjectLayout(generateTodosIds,12),
        []  
    ))(range(0,projects));
        

    let generateProjectsIds = map( (p:Project) => p._id )(projectItems);
    

    let projectsIdsChunks = aperture(3)(generateProjectsIds);
    
    if(projectsIdsChunks.length===0)
       throw new Error("projectsIdsChunks empty.");

    if(generateEventsIdsChunks.length===0)
       throw new Error("generateEventsIdsChunks empty.");   


    let areasItems : Area[] = map(() => fakeArea(
      randomArrayMember(generateTodosIdsChunks),
      randomArrayMember(projectsIdsChunks),
      randomArrayMember(generateEventsIdsChunks),
      randomArrayMember(tagsChunks)
    ), range(0,areas));
 


    for(let i=0; i<areasItems.length; i++){
        let item = areasItems[i];
        let attachedProjects : any = item.attachedProjectsIds;
         
        for(let j=0; j<projectItems.length; j++){

            if(contains(projectItems[j]._id)(attachedProjects)){
               projectItems[j].attachedAreasIds.push(item._id)
            }
 
        }
    }



    for(let i=0; i<projectItems.length; i++){

        let item = projectItems[i];
        let attached : any = item.layout;
        
        for(let j=0; j<todosItems.length; j++){

          if(contains(todosItems[j]._id)(attached)){

             todosItems[j].attachedProjectsIds.push(item._id)

          }

        }

    }
 

    return {
      todos : todosItems,
      events : eventsItems,
      projects : projectItems,
      areas : areasItems 
    }


}








type ObjectType = "heading" | "project" | "todo" | "event" | "area"; 


 
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
  description : string, 
  layout : LayoutItem[], 
  deadline : Date,
  completed : Date, 
  attachedAreasIds : string[], 
  attachedTags : string[]
}
  

 
export interface Area{
  _id : string, 
  name : string,  
  type : ObjectType,
  description : string,
  attachedTags : string[], 
  attachedTodosIds : string[], 
  attachedProjectsIds : string[],
  attachedEventsIds : string[]
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
  attachedProjectsIds : string[],
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
  

 
export interface Event{
  _id : string, 
  title : string,
  type : ObjectType,
  note : string,
  attachedProjectsIds : string[],
  attachedTags : string[],
  date:Date,
  location:string,  
  history : {
      action : string,
      date : Date
  },
  attachments : string[]
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


export let addEvent = (onError:Function, event : Event) : Promise<void> => 
          setItemToDatabase<Event>(
            (e) => console.log(e), 
            events_db
          )(event);
            























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


