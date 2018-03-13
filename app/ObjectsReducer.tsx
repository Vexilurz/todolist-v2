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
import { 
    removeDeletedProjects, removeDeletedAreas, removeDeletedTodos, byNotDeleted, isMainWindow, 
    isNotNil, typeEquals, inFuture, byNotCompleted, measureTime, convertTodoDates 
} from './utils/utils';
import { 
    adjust, cond, all, isEmpty, contains, not, remove, uniq, 
    isNil, and, complement, compose, reject, concat, map, 
    prop, ifElse, identity, path, equals, allPass, evolve  
} from 'ramda';
import { filter } from './Components/MainContainer';
import { globalErrorHandler } from './utils/globalErrorHandler';
import { Config } from './utils/config';
import { assert } from './utils/assert';
import { 
    isTodo, isProject, isArea, isCalendar, isString, isArrayOfTodos, 
    isArrayOfProjects, isArrayOfAreas, isDate, isNumber 
} from './utils/isSomething';
import { setCallTimeout } from './utils/setCallTimeout';
import { findWindowByTitle } from './utils/utils';
import { convertEventDate } from './Components/Calendar';


let onError = (e) => globalErrorHandler(e); 


let actionOriginIsThisWindow = (action:{type:string,load:any,kind:string}) : boolean => {
    return and(action.kind!=="external", action.kind!=="quick-entry");
};


let actionFromQuickEntry = (action:{type:string,load:any,kind:string}) : boolean => {
    return action.kind==="quick-entry";
};


let log = (append:string) => (load:any) : any => {
    console.log(append,load); 
    return load;
};


let notEquals = complement(equals);


let scheduleReminder = (todo) : number => {
    assert(isDate(todo.reminder),`reminder is not of type Date. scheduleReminder. ${todo.reminder}.`);
  

    return setCallTimeout(
        () => {
            let notification : any = findWindowByTitle('Notification');
 
            if(notification){ 
               notification.webContents.send('remind',todo); 
            };
        }, 
        todo.reminder
    ); 
};


let clearScheduledReminders = (store:Store) : Store => {
    let scheduledReminders = store.scheduledReminders;
    scheduledReminders.forEach(t => {
        assert(isNumber(t),`Error:clearScheduledReminders.`);
        clearTimeout(t);
    }); 
    return {...store,scheduledReminders:[]};
};


export let applicationObjectsReducer = (state:Store, action:{type:string,load:any,kind:string}) : Store => { 
    //console.log(`applicationObjectsReducer ${action.type}`)
    let shouldAffectDatabase : boolean =  and(actionFromQuickEntry(action),isMainWindow()) || 
                                          actionOriginIsThisWindow(action);

    

    let refreshReminders = (newState:Store) : Store => {
        let hasReminder = compose(isDate,prop('reminder'));
        let reminderInFuture = compose(inFuture,prop('reminder'));
        let initial = typeEquals("setTodos")(action);
        let filters = [byNotCompleted,byNotDeleted];


        if(initial){ 
           filters.push(hasReminder); 
        }else{
           filters.push(reminderInFuture); 
        }


        let shouldRefreshReminders : boolean = cond([
            [ typeEquals("updateTodoById"), compose(isDate, path(['load','props','reminder'])) ],
            [ typeEquals("setTodos"), (action:{type:string,load:Todo[]}) => true ],
            [ typeEquals("removeGroup"), (action:{type:string, load:string})  => true ],
            [ typeEquals("removeDeleted"), (action:{type:string}) => false ],
            [ typeEquals("addTodo"), compose(isDate, path(['load','reminder'])) ],
            [ typeEquals("updateTodos"), (action:{type:string, load:Todo[]}) => true ],
            [
                typeEquals("updateTodo"),
                (action:{type:string, load:Todo}) => {
                    let todo : Todo = action.load; 
                    let previous : Todo = state.todos.find((t:Todo) => t._id===todo._id);
    
                    return notEquals(
                        prop(`reminder`,todo),
                        prop(`reminder`,previous)
                    );
                }
            ],
            [() => true, () => false]
        ])(action);


        return ifElse(
            (newState:Store) => shouldRefreshReminders && isMainWindow() && isNotNil(newState),
            compose(
                (scheduledReminders:number[]) : Store => ({...newState,scheduledReminders}),

                (scheduledReminders:number[]) => filter(scheduledReminders, isNotNil),     

                map((todo) : number => scheduleReminder(todo)), //create timeout for each reminder

                (todos:Todo[]) => filter(todos, allPass(filters)), //only todos with reminder left
                
                prop('todos'), //get todos from current state   

                clearScheduledReminders //suspend existing timeouts
            ),  
            identity   
        )(newState);
    };



    let updateQuickEntry = (newState:Store) : Store => {
        let quickEntry = findWindowByTitle('Add task');
        let shouldUpdate = true;    
        //typeEquals("setTodos")(action) || typeEquals("setProjects")(action);

        if(isNotNil(quickEntry)){ 
            if(quickEntry.isVisible() || shouldUpdate){ 
               
                quickEntry.webContents.send( 
                   "projects", 
                   filter( state.projects, allPass([byNotDeleted,byNotCompleted]) ) 
                );

                quickEntry.webContents.send(
                    "todos",  
                    filter( state.todos, allPass([byNotDeleted]) ) 
                ); 
            }
        }
           
        return newState;  
    };

    
    
    return compose(
        updateQuickEntry,  
        refreshReminders,
        (newState:Store) => {
            if(isNil(newState)){ return newState }

            let shouldUpdateOtherInstances : boolean = actionOriginIsThisWindow(action);
            //update other windows only if action was initialized inside current window 
            //and action belong to ObjectsReducer (state was updated inside this function)
            if(shouldUpdateOtherInstances){
               ipcRenderer.send("action", {id:remote.getCurrentWindow().id, action}); 
            }  
  
            return newState;
        },  
        cond([  
            [ 
                typeEquals("updateTodos"),
                (action:{type:string, load:Todo[]}) : Store => {
                    let changedTodos = action.load;
                    let changedIds:string[] = changedTodos.map((t:Todo) => t._id);

                    let todos : Todo[] = compose(
                        concat(changedTodos),
                        reject((todo:Todo) => contains(todo._id)(changedIds))
                    )(state.todos);

                    if(isDev()){
                        assert(isArrayOfTodos(todos), `Error: updateTodos. objectsReducer. ${todos}`);
                    }

                    if(shouldAffectDatabase){ 
                       updateTodos(changedTodos,onError); 
                    }
         
                    return { ...state, todos };
                } 
            ], 
            [
                typeEquals("updateTodoById"),  
                (action:{ type:string, load: {id:string,props:any} }) : Store => {

                    let idx = state.todos.findIndex((t:Todo) => action.load.id===t._id);
                    let todo = state.todos[idx]; 

                    assert(isString(action.load.id),`id is not of type String. updateTodoById.`);

                    if(isNil(todo)){
                       return {...state}; 
                    }

                    todo = {...todo,...action.load.props};

                    //if todo exists and have empty title - remove
                    if(isEmpty(todo.title)){

                        if(shouldAffectDatabase){ 
                            removeTodo(action.load.id, onError); 
                        } 

                        return{ ...state, todos:remove(idx, 1, state.todos) }; 

                    //if todo exists - update
                    }else{ 

                        if(shouldAffectDatabase){ 
                            updateTodo(action.load.id, todo, onError); 
                        }

                        return{ ...state, todos:adjust(() => todo, idx, state.todos) }; 
                    }
                }
            ], 

            [
                typeEquals('updateConfig'),  
                (action:{type:string, load: { [key in keyof Config]: any }}) : Store => ({...state, ...action.load}) 
            ],
            

            [
                typeEquals('showCalendarEvents'),  
                (action:{type:string,load:boolean}) : Store => ({...state, showCalendarEvents:action.load}) 
            ], 

            [
                typeEquals('update'),  
                (action:{type:string}) : Store => ({...state, todos:[...state.todos]})
            ],

            [ 
                typeEquals('setCalendars'),  
                (action:{type:string,load:Calendar[]}):Store => ({
                    ...state, 
                    calendars:map(evolve({events:map(convertEventDate)}),action.load)
                })
            ],  

            [  
                typeEquals("addCalendar"),  
                (action:{type:string,load:Calendar}):Store => { 

                    assert(isCalendar(action.load), `Error: addCalendar. applicationObjectsReducer. ${action.load}`); 
               
                    if(shouldAffectDatabase){ 
                       addCalendar(onError,action.load) 
                    }  

                    return {...state, calendars:[action.load,...state.calendars]};
                }
            ],

            [ 
                typeEquals("removeCalendar"),  
                (action:{ type:string, load:string }) : Store => { 

                    assert(isString(action.load), `Error: removeCalendar. applicationObjectsReducer. ${action.load}`);

                    let { calendars } = state;
                    let idx = calendars.findIndex(c => c._id===action.load);

                    assert(idx!==-1, `attempt to remove non existing calendar. ObjectsReducer. ${action.load}`);
            
                    if(shouldAffectDatabase){ 
                       removeCalendar(action.load, onError); 
                    }  

                    return {...state, calendars:remove(idx, 1, calendars)};
                }
            ],

            [ 
                typeEquals("updateCalendar"),  
                (action:{type:string,load:Calendar}):Store => { 

                    assert(isCalendar(action.load), `Error: updateCalendar. applicationObjectsReducer. ${action.load}`); 

                    let calendars = [...state.calendars];
                    let idx = calendars.findIndex(c => c.url===action.load.url);

                    if(shouldAffectDatabase){ 
                       updateCalendar(action.load._id, action.load, onError); 
                    }  

                    return {...state, calendars:adjust(() => action.load, idx, calendars)};
                }
            ],

            [ 
                typeEquals("setTodos"),  
                (action:{type:string,load:Todo[]}) : Store => {

                    assert(isArrayOfTodos(action.load), `Error: setTodos. applicationObjectsReducer. ${action.load}`); 
                
                    return {...state,todos:action.load};
                }
            ], 

            [ 
                typeEquals("setProjects"),  

                (action:{type:string, load:Project[]}) : Store => {

                    assert(isArrayOfProjects(action.load), `Error: setProjects. applicationObjectsReducer. ${action.load}`); 
                    
                    return { ...state, projects:action.load };
                }
            ], 

            [ 
                typeEquals("setAreas"),  

                (action:{type:string,load:Area[]}) : Store => { 

                    assert(isArrayOfAreas(action.load), `Error: setAreas. applicationObjectsReducer. ${action.load}`); 
                    
                    return { ...state, areas:action.load };
                }
            ],

            [ 
                typeEquals("setAllTypes"),  

                (action:{ type:string, load:{ todos:Todo[], projects:Project[], areas:Area[] } }) : Store => {

                    assert(isArrayOfTodos(action.load.todos), `Error: setAllTypes. todos. applicationObjectsReducer. ${action.load}`); 
                    assert(isArrayOfProjects(action.load.projects), `Error: setAllTypes. projects. applicationObjectsReducer. ${action.load}`); 
                    assert(isArrayOfAreas(action.load.areas), `Error: setAllTypes. areas. applicationObjectsReducer. ${action.load}`); 
                
                    return {  
                        ...state,
                        todos : [...action.load.todos],
                        projects : [...action.load.projects],
                        areas : [...action.load.areas]
                    };
                }
            ],

            [  
                typeEquals("removeGroup"), 

                (action:{type:string, load:string}) : Store => {  

                    assert(isString(action.load), `Error: removeGroup. applicationObjectsReducer. ${action.load}`); 
                    
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
    
                    if(shouldAffectDatabase){ 
                       removeTodos(group,onError); 
                    } 

                    return{   
                        ...state,  
                        todos
                    }; 
                }
            ],

            [
                typeEquals("removeDeleted"), 

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

                    return {...state,todos,projects,areas}; 
                }
            ], 

            [
                typeEquals("addTodo"),

                (action:{type:string, load:Todo}) : Store => {

                    assert(isTodo(action.load),`Load is not of type Todo. ${action.load}. addTodo. objectsReducer.`);

                    if(isEmpty(action.load.title)){ 
                       return {...state}; 
                    }
    
                    if(shouldAffectDatabase){ 
                       addTodo(onError, action.load); 
                    }

                    let todos = [action.load,...state.todos];

                    return {...state, todos}; 
                } 
            ], 

            [ 
                typeEquals("updateTodo"),

                (action:{type:string, load:Todo}) : Store => {

                    assert(isTodo(action.load), `Load is not of type Todo. ${action.load}. updateTodo. objectsReducer.`);

                    let idx = state.todos.findIndex((t:Todo) => action.load._id===t._id);

                    let todo = convertTodoDates(action.load);

                    if(idx===-1){ 
                        //if such todo does not exist add it to state
                        if(isEmpty(action.load.title)){ 

                            return {...state}; 

                        }else{

                            if(shouldAffectDatabase){ 
                               addTodo(onError, action.load); 
                            }

                            return { ...state, todos:[todo,...state.todos] };
                        }
                    }else{
                        //if todo exists and have empty title - remove
                        if(isEmpty(action.load.title)){

                            if(shouldAffectDatabase){ 
                               removeTodo(action.load._id, onError); 
                            } 

                            return{ ...state, todos:remove(idx, 1, state.todos) }; 

                        //if todo exists - update
                        }else{ 

                            if(shouldAffectDatabase){ 
                               updateTodo(action.load._id, action.load, onError); 
                            }

                            return{ ...state, todos:adjust(() => todo, idx, state.todos) }; 
                        }
                    }
                }
            ],

            [
                typeEquals("addProject"),

                (action:{type:string, load:Project}) : Store => {
                    
                    assert(isProject(action.load), `Load is not of type Project. ${action.load} addProject. objectsReducer.`)

                    if(shouldAffectDatabase){ 
                       addProject(onError,action.load); 
                    }
    
                    return { ...state, projects:[action.load,...state.projects] };   
                }
            ], 

            [
                typeEquals("addArea"),

                (action:{type:string, load:Area}) : Store => {
                    
                    assert(isArea(action.load), `Load is not of type Area. ${action.load} addArea. objectsReducer.`)   

                    if(shouldAffectDatabase){ 
                       addArea(onError,action.load); 
                    } 
    
                    return { ...state, areas:[action.load,...state.areas] }; 
                }    
            ],

            [
                typeEquals("attachTodoToProject"),

                (action:{type:string, load:{projectId:string,todoId:string}}) : Store => {

                    let idx = state.projects.findIndex((p:Project) => p._id===action.load.projectId);

                    assert(idx!==-1, "Attempt to update non existing object. attachTodoToProject. objectsReducer.");
        
                    let project : Project = {...state.projects[idx]};  

                    project.layout = uniq([action.load.todoId, ...project.layout]);

                    if(shouldAffectDatabase){ 
                       updateProject(project._id,project,onError); 
                    }

                    return {...state,projects:adjust(() => project, idx, state.projects)};
                }
            ], 

            [ 
                typeEquals("updateProject"),

                (action:{type:string, load:Project}) : Store => {

                    assert(isProject(action.load),`Load is not of type Project. ${action.load} updateProject. objectsReducer.`);
                
                    let idx = state.projects.findIndex((p:Project) => action.load._id===p._id);
                    
                    assert(idx!==-1, "Attempt to update non existing object. updateProject. objectsReducer.");
    
                    if(shouldAffectDatabase){ 
                       updateProject(action.load._id, action.load, onError); 
                    }
                    
                    return {...state, projects:adjust(() => action.load, idx, state.projects)};
                }
            ],

            [ 
                typeEquals("updateArea"),

                (action:{type:string, load:Area}) : Store => {

                    assert(isArea(action.load),`Load is not of type Area. ${action.load} updateArea. objectsReducer.`);

                    let idx = state.areas.findIndex((a:Area) => action.load._id===a._id);
                    
                    assert(idx!==-1, "Attempt to update non existing object. updateArea. objectsReducer.");

                    if(shouldAffectDatabase){ 
                       updateArea(action.load._id, action.load, onError); 
                    }

                    return {...state, areas:adjust(() => action.load, idx, state.areas)};
                } 
            ],

            [ 
                typeEquals("updateProjects"),
    
                (action:{type:string, load:Project[]}) : Store => {
                    let changedProjects = [...action.load];
                    let changedIds:string[] = changedProjects.map((p:Project) => p._id);

                    let projects : Project[] = compose(
                        concat(changedProjects),
                        reject((project:Project) => contains(project._id)(changedIds))
                    )(state.projects);

                    assert(isArrayOfProjects(projects), `Error: updateProjects. objectsReducer. ${projects}`);
                    
                    if(shouldAffectDatabase){ 
                       updateProjects(changedProjects,onError); 
                    }
        
                    return { ...state, projects };
                }
            ],

            [ 
                typeEquals("updateAreas"),
    
                (action:{type:string, load:Area[]}) : Store => {
                    let changedAreas = [...action.load];
                    let changedIds:string[] = changedAreas.map((a:Area) => a._id);

                    let areas : Area[] = compose(
                        concat(changedAreas),
                        reject((area:Area) => contains(area._id)(changedIds))
                    )(state.areas);

                    assert(isArrayOfAreas(areas), `Error: updateAreas. objectsReducer. ${areas}`);
                    
                    if(shouldAffectDatabase){ 
                       updateAreas(changedAreas,onError); 
                    } 
        
                    return { ...state, areas };
                }
            ],

            [ 
                typeEquals("addTodos"),
    
                (action:{type:string, load:Todo[]}) : Store => {
                    if(shouldAffectDatabase){ 
                       addTodos(onError,action.load); 
                    } 
                    
                    let todos = [...action.load,...state.todos];

                    assert(isArrayOfTodos(todos), `Error: addTodos. objectsReducer. ${todos}`);
                    
                    return { ...state, todos };
                }
            ],

            [ 
                typeEquals("addProjects"),
    
                (action:{type:string, load:Project[]}) : Store => {
                    if(shouldAffectDatabase){ 
                       addProjects(onError, action.load); 
                    }

                    let projects = [...action.load,...state.projects];

                    assert(isArrayOfProjects(projects), `Error: addProjects. objectsReducer. ${projects}`);
                    
                    return { ...state, projects };
                }
            ],

            [ 
                typeEquals("addAreas"),
    
                (action:{type:string, load:Area[]}) : Store => {

                    if(shouldAffectDatabase){ 
                       addAreas(onError, action.load); 
                    } 

                    let areas = [...action.load,...state.areas];

                    assert(isArrayOfAreas(areas), `Error: addAreas. objectsReducer. ${areas}`);

                    return { ...state, areas };
                }
            ],

            [
                () => true, () => undefined
            ]
        ])
    )(action);
};     