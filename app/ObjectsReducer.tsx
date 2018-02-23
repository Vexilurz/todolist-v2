import { Store } from './app';
import {  
    Project, Area, Todo, removeProject, addProject, 
    removeArea, updateProject, addTodo, updateArea, updateTodo, 
    addArea, removeTodo, removeAreas, removeTodos, removeProjects, 
    updateAreas, updateProjects, addTodos, addProjects, addAreas, 
    updateTodos, addCalendar, Calendar, updateCalendar, removeCalendar 
} from './database';
import { isDev } from './utils/isDev';
import { ipcRenderer, remote } from 'electron';
import { removeDeletedProjects, removeDeletedAreas, removeDeletedTodos, byNotDeleted } from './utils/utils';
import { adjust, cond, all, isEmpty, contains, not, remove, uniq, isNil } from 'ramda';
import { filter, activateReminders } from './Components/MainContainer';
import { globalErrorHandler } from './utils/globalErrorHandler';
import { Config } from './utils/config';
import { assert } from './utils/assert';
import { isTodo, isProject, isArea } from './utils/isSomething';


let onError = (e) => globalErrorHandler(e); 

let isMainWindow = () => {  
    return remote.getCurrentWindow().id===1; 
}

export let applicationObjectsReducer = (state:Store, action) : Store => { 

    let shouldAffectDatabase : boolean = action.kind!=="external" ||
                                         (action.kind==="quick-entry" && isMainWindow());                       
    
    let shouldUpdateOtherInstances : boolean = action.kind!=="external" && action.kind!=="quick-entry";
    let newState : Store = undefined;
    
    newState = cond([    
        [
            (action:{type:string}) : boolean => 'updateConfig'===action.type,  
            (action:{type:string, load: { [key in keyof Config]: any }}) : Store => {
              return  ({...state, ...action.load})   
            }  
        ],
        [
            (action:{type:string}) : boolean => 'update'===action.type,  
            (action:{type:string}) : Store => {
              console.log("update");  
              return  ({...state, todos:[...state.todos]}) 
            }
        ],
        [ 
            (action:{type:string}) : boolean => 'setCalendars'===action.type,  
            (action:{type:string,load:Calendar[]}):Store => ({...state, calendars:action.load})
        ],  
        [  
            (action:{type:string}) : boolean => "addCalendar"===action.type,  
            (action:{type:string,load:Calendar}):Store => { 
                if(shouldAffectDatabase){ addCalendar(onError,action.load) }  
                return {...state, calendars:[action.load,...state.calendars]};
            }
        ],  
        [ 
            (action:{ type:string }) : boolean => "removeCalendar"===action.type,  

            (action:{ type:string, load:string }) : Store => { 
                let { calendars } = state;
                let idx = calendars.findIndex(c => c._id===action.load);
                
                assert(idx!==-1, `attempt to remove non existing calendar. ObjectsReducer. ${action.load}`)
        
                if(shouldAffectDatabase){ removeCalendar(action.load, onError) }  
                return {...state, calendars:remove(idx, 1, calendars)};
            }
        ], 
        [ 
            (action:{type:string}) : boolean => "updateCalendar"===action.type,  

            (action:{type:string,load:Calendar}):Store => { 
                let calendars = [...state.calendars];
                let idx = calendars.findIndex(c => c.url===action.load.url);

                if(shouldAffectDatabase){ updateCalendar(action.load._id, action.load, onError) }    
                return {...state, calendars:adjust(() => action.load, idx, calendars)};
            }
        ],  
        [ 
            (action:{type:string}) : boolean => "setTodos"===action.type,  

            (action:{
                type:string,
                load:Todo[]
            }) : Store => ({  
                ...state,
                todos : action.load
            })
        ], 
        [ 
            (action:{type:string}) : boolean => "setProjects"===action.type,  

            (action:{type:string, load:Project[]}) : Store => ({ ...state, projects : action.load })
        ], 
        [ 
            (action:{type:string}) : boolean => "setAreas"===action.type,  

            (action:{type:string,load:Area[]}) : Store => ({ ...state, areas:action.load })
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
                areas : [...action.load.areas]
            })
        ], 
        [  
            (action:{type:string}) : boolean => "removeGroup"===action.type, 

            (action:{type:string, load:string}) : Store => {  
                let groupId : string = action.load;
                let group : Todo[] = [];
                let todos : Todo[] = []; 

                for(let i=0; i<state.todos.length; i++){
                    let todo : Todo = state.todos[i];
                    if(isNil(todo.group)){ 
                        todos.push(todo);
                    }else if(todo.group._id!==groupId){
                        todos.push(todo);
                    }else{
                        group.push(todo); 
                    }
                } 
  
                if(shouldAffectDatabase){ removeTodos(group,onError) } 

                return{   
                   ...state,  
                   todos, 
                   scheduledReminders:activateReminders(state.scheduledReminders,todos) 
                } 
            }
        ],
        [
            (action:{type:string}) : boolean => "removeDeleted"===action.type, 

            (action:{type:string}) : Store => {

                let todos;
                let projects;
                let areas;
 
                if(shouldAffectDatabase){
                    todos = removeDeletedTodos(state.todos);
                    projects = removeDeletedProjects(state.projects);
                    areas = removeDeletedAreas(state.areas); 
                }else{
                    todos = filter(state.todos, byNotDeleted, "");
                    projects = filter(state.projects, byNotDeleted, ""); 
                    areas = filter(state.areas, byNotDeleted, ""); 
                }
 
                return {   
                    ...state,
                    todos,
                    projects,
                    areas
                } 
            }
        ], 
        [
            (action:{type:string}) : boolean => "addTodo"===action.type,

            (action:{type:string, load:Todo}) : Store => {

                assert(isTodo(action.load),`Load is not of type Todo. ${action.load}. addTodo. objectsReducer.`);

                if(isEmpty(action.load.title)){ return {...state}; }
 
                if(shouldAffectDatabase){ addTodo(onError, action.load) }

                let todos = [action.load,...state.todos];

                return {...state, todos} 
            } 
        ], 
        [ 
            (action:{type:string}) => "updateTodo"===action.type,

            (action:{type:string, load:Todo}) : Store => {

                assert(isTodo(action.load), `Load is not of type Todo. ${action.load}. updateTodo. objectsReducer.`);

                let idx = state.todos.findIndex((t:Todo) => action.load._id===t._id);

                if(idx===-1){

                    if(isEmpty(action.load.title)){ 
                        return {...state} 
                    }else{
                        if(shouldAffectDatabase){ addTodo(onError, action.load) }
    
                        return {
                            ...state, 
                            todos:[action.load,...state.todos]
                        }
                    }
                }else{

                    if(isEmpty(action.load.title)){

                        if(shouldAffectDatabase){ removeTodo(action.load._id, onError) } 

                        return{ 
                            ...state, 
                            todos:remove(idx, 1, state.todos) 
                        } 
                    }else{ 
                        if(shouldAffectDatabase){ updateTodo(action.load._id, action.load, onError) }

                        return{ 
                            ...state, 
                            todos:adjust(() => action.load, idx, state.todos) 
                        } 
                    }
                }
            }
        ],
        [
            (action:{type:string}) : boolean => "addProject"===action.type,

            (action:{type:string, load:Project}) : Store => {
                
                assert(isProject(action.load), `Load is not of type Project. ${action.load} addProject. objectsReducer.`)

                if(shouldAffectDatabase){ addProject(onError,action.load) }
 
                return { ...state, projects:[action.load,...state.projects] }   
            }
        ], 
        [
            (action:{type:string}) : boolean => "addArea"===action.type,

            (action:{type:string, load:Area}) : Store => {
                
                assert(isArea(action.load), `Load is not of type Area. ${action.load} addArea. objectsReducer.`)   

                if(shouldAffectDatabase){ addArea(onError,action.load) } 
 
                return { ...state, areas:[action.load,...state.areas] } 
            }    
        ],
        [
            (action:{type:string}) => "attachTodoToProject"===action.type,

            (action:{type:string, load:{projectId:string,todoId:string}}) : Store => {

                let idx = state.projects.findIndex((p:Project) => p._id===action.load.projectId);

                assert(idx!==-1, "Attempt to update non existing object. attachTodoToProject. objectsReducer.");
    
                let project : Project = {...state.projects[idx]};  

                if(not(contains(action.load.todoId)(project.layout as any))){  
                   project.layout = [action.load.todoId, ...project.layout]; 
                }
      
                if(shouldAffectDatabase){ 
                    updateProject(project._id,project,onError) 
                }

                return { 
                    ...state,
                    projects:adjust(() => project, idx, state.projects) 
                }
            }
        ],
        [
            (action:{type:string}) => "attachTodoToArea"===action.type,

            (action:{type:string, load:{areaId:string,todoId:string}}) : Store => {
  
                let idx = state.areas.findIndex( (a:Area) => a._id===action.load.areaId );

                assert(idx!==-1, "Attempt to update non existing object. attachTodoToArea. objectsReducer.");
              
                let area : Area = {...state.areas[idx]};

                area.attachedTodosIds = uniq([action.load.todoId, ...area.attachedTodosIds]);

                if(shouldAffectDatabase){ 
                    updateArea(area._id,area,onError) 
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
                assert(isProject(action.load),`Load is not of type Project. ${action.load} updateProject. objectsReducer.`)
              
                let idx = state.projects.findIndex((p:Project) => action.load._id===p._id);
                
                assert(idx!==-1,"Attempt to update non existing object. updateProject. objectsReducer.");
 
                if(shouldAffectDatabase){ updateProject(action.load._id, action.load, onError) }
                 
                return {...state, projects:adjust(() => action.load, idx, state.projects)}
            }
        ],
        [ 
            (action:{type:string}) => "updateArea"===action.type,

            (action:{type:string, load:Area}) : Store => {
                assert(isArea(action.load),`Load is not of type Area. ${action.load} updateArea. objectsReducer.`);

                let idx = state.areas.findIndex((a:Area) => action.load._id===a._id);
                
                assert(idx!==-1, "Attempt to update non existing object. updateArea. objectsReducer.");

                if(shouldAffectDatabase){ updateArea(action.load._id, action.load, onError) }

                return {...state, areas:adjust(() => action.load, idx, state.areas)}
            } 
        ],
        [ 
            (action:{type:string}) => "updateTodos"===action.type,
 
            (action:{type:string, load:Todo[]}) : Store => {
                let changedTodos = [...action.load]; 
                let changedIds:string[] = changedTodos.map((t:Todo) => t._id);
                let notChangedTodos:Todo[] = filter(state.todos,(todo:Todo) => not(contains(todo._id)(changedIds)),"");
                
                let todos = [...changedTodos,...notChangedTodos];

                if(shouldAffectDatabase){ updateTodos(changedTodos,onError) }
    
                return { ...state, todos }
            } 
        ],
        [ 
            (action:{type:string}) => "updateProjects"===action.type,
 
            (action:{type:string, load:Project[]}) : Store => {
                let changed = action.load.map( (p:Project) => p._id );
                let fixed = state.projects.filter( (p:Project) => changed.indexOf(p._id)===-1 );  
                
                if(shouldAffectDatabase){ updateProjects(action.load,onError) }
    
                return { ...state, projects:[...fixed,...action.load] }
            }
        ],
        [ 
            (action:{type:string}) => "updateAreas"===action.type,
 
            (action:{type:string, load:Area[]}) : Store => {
 
                let changed = action.load.map( (a:Area) => a._id );
                let fixed = state.areas.filter( (a:Area) => changed.indexOf(a._id)===-1 );  
    
                if(shouldAffectDatabase){ updateAreas(action.load,onError) } 
    
                return { ...state, areas:[...fixed,...action.load] }
            }
        ],
        [ 
            (action:{type:string}) => "addTodos"===action.type,
 
            (action:{type:string, load:Todo[]}) : Store => {
 
                if(shouldAffectDatabase){ addTodos(onError,action.load) } 
                
                let todos = [...action.load,...state.todos];
                
                return { ...state, todos }
            }
        ],
        [ 
            (action:{type:string}) => "addProjects"===action.type,
 
            (action:{type:string, load:Project[]}) : Store => {
 
                if(shouldAffectDatabase){ addProjects(onError, action.load) }
                
                return { ...state, projects:[...action.load,...state.projects] }
            }
        ],
        [ 
            (action:{type:string}) => "addAreas"===action.type,
 
            (action:{type:string, load:Area[]}) : Store => {

                if(shouldAffectDatabase){ addAreas(onError, action.load) } 
                
                return { ...state, areas:[...action.load,...state.areas] }
            }
        ]
    ])(action);

    //update other windows only if action was initialized inside current window 
    //and action belong to ObjectsReducer (state was updated inside this function)
    if(!isNil(newState) && shouldUpdateOtherInstances){
        ipcRenderer.send("action", {id:remote.getCurrentWindow().id, action}); 
    }
     
    return newState; 
}     