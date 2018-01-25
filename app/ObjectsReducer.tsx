import { ipcRenderer } from 'electron'; 
import { Store, isDev } from './app';
import {  
    Project, Area, Todo, removeProject, generateId, addProject, 
    removeArea, updateProject, addTodo, updateArea, updateTodo, 
    addArea, removeTodo, removeAreas, removeTodos, removeProjects, 
    updateAreas, updateProjects, addTodos, addProjects, addAreas, 
    updateTodos, addCalendar, Calendar, updateCalendar 
} from './database';
import { 
    getTagsFromItems, defaultTags, removeDeletedProjects, 
    removeDeletedAreas, removeDeletedTodos, Item, ItemWithPriority, byNotDeleted, isTodo, assert 
} from './utils';
import { adjust, cond, equals, all, clone, isEmpty, contains, not, remove, uniq } from 'ramda';

let onError = (e) => {
    console.log(e); 
}

export let applicationObjectsReducer = (state:Store, action) : Store => { 

    let newState : Store = undefined;
    let shouldAffectDatabase : boolean = action.kind!=="external";
    let shouldUpdateOtherInstances : boolean = action.kind!=="external";

 
    newState = cond([  

        [ 
            (action:{type:string}) : boolean => 'setCalendars'===action.type,  

            (action:{ 
                type:string,
                load:Calendar[]
            }):Store => ({...state, calendars:action.load})
        ],  

        [  
            (action:{type:string}) : boolean => "addCalendar"===action.type,  

            (action:{type:string,load:Calendar}):Store => { 

                if(shouldAffectDatabase){
                   addCalendar(onError,action.load);
                }  

                return {...state, calendars:[action.load,...state.calendars]};
            }
        ],   
         
        [ 
            (action:{type:string}) : boolean => "updateCalendar"===action.type,  

            (action:{ 
                type:string,
                load:Calendar
            }):Store => { 
                let calendars = [...state.calendars];
                let idx = calendars.findIndex(c => c.url===action.load.url);

                assert(idx!==-1, `calendar does not exist.updateCalendar.${JSON.stringify(action.load)}`);
           
                if(shouldAffectDatabase){
                   updateCalendar(action.load._id, action.load, onError)
                }  

                calendars[idx] = action.load;
                    
                return {...state, calendars:[...calendars]};
            }
        ],  



        [ 
            (action:{type:string}) : boolean => "setTodos"===action.type,  

            (action:{
                type:string,
                load:Todo[]
            }) : Store => ({  
                ...state,
                todos : action.load,
                tags : uniq([   
                    ...state.tags,
                    ...defaultTags, 
                    ...getTagsFromItems(action.load)
                ])
            })
        ], 


        [ 
            (action:{type:string}) : boolean => "setProjects"===action.type,  

            (action:{
                type:string, 
                load:Project[]
            }) : Store => ({  
                ...state,
                projects : action.load,
                tags : uniq([  
                    ...state.tags,
                    ...defaultTags, 
                    ...getTagsFromItems(action.load)
                ])
            })
        ], 

        [ 
            (action:{type:string}) : boolean => "setAreas"===action.type,  

            (action:{
                type:string,
                load:Area[]
            }) : Store => ({  
                ...state,
                areas : action.load,
                tags : uniq([  
                    ...state.tags,
                    ...defaultTags, 
                    ...getTagsFromItems(action.load)
                ])
            })
        ], 



        [ 
            (action:{type:string}) : boolean => "setAllTypes"===action.type,  

            (action:{
                type:string,
                load:{todos:Todo[],projects:Project[],areas:Area[]}
            }) : Store => ({  
                ...state,
                todos : [...action.load.todos],
                projects : [...action.load.projects],
                areas : [...action.load.areas],
                tags : [  
                    ...defaultTags, 
                    ...getTagsFromItems([ 
                        ...action.load.todos,
                        ...action.load.projects,
                        ...action.load.areas
                    ])
                ]
            })
        ], 

        [
            (action:{type:string, kind:string}) : boolean => "removeDeleted"===action.type, 

            (action:{type:string, kind:string}) : Store => {

                let todos;
                let projects;
                let areas;
 
                if(shouldAffectDatabase){
                    todos = removeDeletedTodos(state.todos);
                    projects = removeDeletedProjects(state.projects);
                    areas = removeDeletedAreas(state.areas); 
                }else{
                    todos = state.todos.filter(byNotDeleted);
                    projects = state.projects.filter(byNotDeleted); 
                    areas = state.areas.filter(byNotDeleted); 
                }
 
                return {  
                    ...state,
                    todos,
                    projects,
                    areas,
                    tags:[ 
                      ...defaultTags,
                      ...getTagsFromItems([...todos, ...projects, ...areas])
                    ]
                } 
            }
        ], 

        [
            (action:{type:string}) : boolean => "addTodo"===action.type,

            (action:{type:string, load:Todo}) : Store => {

                assert(
                    isTodo(action.load), 
                    `Load is not of type Todo. ${JSON.stringify(action.load)}. addTodo. objectsReducer.`
                )

                if(isEmpty(action.load.title)){
                   return {...state}; 
                }
 
                if(shouldAffectDatabase){     
                   addTodo(onError, action.load)
                }

                return {
                    ...state, 
                    todos:[action.load,...state.todos],
                } 
            } 
        ], 


        [ 
            (action:{type:string}) => "updateTodo"===action.type,

            (action:{type:string, load:Todo}) : Store => {

                let idx = state.todos.findIndex((t:Todo) => action.load._id===t._id);

                assert(idx!==-1, `Attempt to update non existing Todo. ${JSON.stringify(action.load)}.`);
                assert(
                    isTodo(action.load), 
                    `Load is not of type Todo. ${JSON.stringify(action.load)}. updateTodo. objectsReducer.`
                )

                if(isEmpty(action.load.title)){
                    if(shouldAffectDatabase){
                       removeTodo(action.load._id)
                    } 
                    return { 
                      ...state, 
                      todos:remove(idx, 1, state.todos)
                    }  
                } 

                if(shouldAffectDatabase){
                   updateTodo(action.load._id, action.load, onError)
                }
                 
                return { 
                    ...state, 
                    todos:adjust(() => action.load, idx, state.todos)
                } 
            }
        ],


        [
            (action:{type:string}) : boolean => "addProject"===action.type,

            (action:{type:string, load:Project}) : Store => {
                
                if(action.load.type!=="project"){
                    if(isDev()){ 
                       throw new Error(`Load is not of type Project. ${JSON.stringify(action.load)} addProject. objectsReducer.`);
                    }
                }

                if(shouldAffectDatabase){   
                   addProject(onError,action.load)
                }
 
                return {
                    ...state,  
                    projects:[action.load,...state.projects]
                }   
            }
        ], 

        [
            (action:{type:string}) : boolean => "addArea"===action.type,

            (action:{type:string, load:Area}) : Store => {
                
                assert(
                  action.load.type==="area",
                  `Load is not of type Area. ${JSON.stringify(action.load)} addArea. objectsReducer.`
                )   

                if(shouldAffectDatabase){    
                   addArea(onError,action.load)
                } 
 
                return {
                    ...state,  
                    areas:[action.load,...state.areas]
                } 
            }    
        ],

        [
            (action:{type:string}) => "attachTodoToProject"===action.type,

            (action:{type:string, load:{projectId:string,todoId:string} }) : Store => {

                let idx = state.projects.findIndex( (p:Project) => p._id===action.load.projectId );

                if(idx===-1){ 
                    if(isDev()){ 
                       throw new Error("Attempt to update non existing object. attachTodoToProject. objectsReducer.");  
                    }   
                }
    
                let project : Project = {...state.projects[idx]};  
                project.layout = [action.load.todoId, ...project.layout];
    
                if(shouldAffectDatabase){
                   updateProject(project._id,project,onError);
                }

                return {
                    ...state,
                    projects:adjust(() => project, idx, state.projects)
                }
            }
        ],
 
        [
            (action:{type:string}) => "attachTodoToArea"===action.type,

            (action:{type:string, load:{areaId:string,todoId:string} }) : Store => {

                let idx = state.areas.findIndex( (a:Area) => a._id===action.load.areaId );

                if(idx===-1){ 
                    if(isDev()){ 
                       throw new Error("Attempt to update non existing object. attachTodoToArea. objectsReducer."); 
                    } 
                }
    
                let area = {...state.areas[idx]};
                area.attachedTodosIds = [action.load.todoId, ...area.attachedTodosIds];
    
                if(shouldAffectDatabase){
                   updateArea(area._id,area,onError);
                }

                return {     
                    ...state,  
                    areas:adjust(() => area, idx, state.areas)
                } 
            } 
        ],  

        [ 
            (action:{type:string}) => "updateProject"===action.type,

            (action:{type:string, load:Project}) : Store => {

                let idx = state.projects.findIndex((p:Project) => action.load._id===p._id);
                
                if(idx===-1){
                   if(isDev()){ 
                      throw new Error("Attempt to update non existing object. updateProject. objectsReducer.");
                   }
                }
                      
                if(action.load.type!=="project"){
                   if(isDev()){ 
                      throw new Error(`Load is not of type Project. ${JSON.stringify(action.load)} updateProject. objectsReducer.`);
                   }
                }
                    
                if(shouldAffectDatabase){
                   updateProject(action.load._id, action.load, onError);   
                }
                 
                return { 
                    ...state, 
                    projects:adjust(() => action.load, idx, state.projects)
                }
            }
        ],

        [ 
            (action:{type:string}) => "updateArea"===action.type,

            (action:{type:string, load:Area}) : Store => {

                let idx = state.areas.findIndex((a:Area) => action.load._id===a._id);
                
                if(idx===-1){ 
                   if(isDev()){ 
                      throw new Error("Attempt to update non existing object. updateArea. objectsReducer.");
                   }
                }
 
                if(action.load.type!=="area"){  
                    if(isDev()){ 
                       throw new Error(`Load is not of type Area. ${JSON.stringify(action.load)} updateArea. objectsReducer.`);
                    }
                }

                if(shouldAffectDatabase){   
                   updateArea(action.load._id, action.load, onError)
                }

                return {   
                    ...state,  
                    areas:adjust(() => action.load, idx, state.areas)
                }
            } 
        ],

        [ 
            (action:{type:string}) => "updateTodos"===action.type,
 
            (action:{type:string, load:Todo[]}) : Store => {
                let changedTodos = action.load; 
                let changedIds : string[] = changedTodos.map((t:Todo) => t._id);
                let notChangedTodos : Todo[] = state.todos.filter((todo:Todo) => not(contains(todo._id)(changedIds)));
                
                let todos = [...changedTodos,...notChangedTodos];

                if(shouldAffectDatabase){ 
                   updateTodos(action.load,onError) 
                }
    
                return {...state, todos}
            } 
        ],

        [ 
            (action:{type:string}) => "updateProjects"===action.type,
 
            (action:{type:string, load:Project[]}) : Store => {
 
                let changed = action.load.map( (p:Project) => p._id );
                let fixed = state.projects.filter( (p:Project) => changed.indexOf(p._id)===-1 );  
                
                if(shouldAffectDatabase){
                   updateProjects(action.load,onError)
                }
    
                return {    
                    ...state,  
                    projects:[...fixed,...action.load] 
                }
            }
        ],

        [ 
            (action:{type:string}) => "updateAreas"===action.type,
 
            (action:{type:string, load:Area[]}) : Store => {
 
                let changed = action.load.map( (a:Area) => a._id );
                let fixed = state.areas.filter( (a:Area) => changed.indexOf(a._id)===-1 )  
    
                if(shouldAffectDatabase){
                   updateAreas(action.load,onError)
                } 
    
                return {     
                    ...state,  
                    areas:[...fixed,...action.load] 
                }
            }
        ],

        [ 
            (action:{type:string}) => "addTodos"===action.type,
 
            (action:{type:string, load:Todo[]}) : Store => {
 
                if(shouldAffectDatabase){ 
                   addTodos(onError,action.load)
                } 
                   
                return {
                    ...state,  
                    todos:[...action.load,...state.todos]
                }
            }
        ],

        [ 
            (action:{type:string}) => "addProjects"===action.type,
 
            (action:{type:string, load:Project[]}) : Store => {
 
                if(shouldAffectDatabase){
                   addProjects(onError, action.load);
                }
                
                return {
                    ...state,  
                    projects:[...action.load,...state.projects]
                }
            }
        ],

        [ 
            (action:{type:string}) => "addAreas"===action.type,
 
            (action:{type:string, load:Area[]}) : Store => {

                if(shouldAffectDatabase){
                   addAreas(onError, action.load);
                }
                
                return {
                    ...state,   
                    areas:[...action.load,...state.areas]
                }
            }
        ], 

    ])(action);

    

    if(newState && shouldUpdateOtherInstances){ 
       ipcRenderer.send("action", action, state.windowId) 
    }    
 
    return newState; 
}     