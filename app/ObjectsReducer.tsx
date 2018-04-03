import { Project, Area, Todo, Calendar, Store } from './types';
import {  
    removeProject, addProject, removeArea, updateProject, addTodo, 
    updateArea, updateTodo, addArea, removeTodo, removeAreas, 
    removeTodos, removeProjects, updateAreas, updateProjects, addTodos, 
    addProjects, addAreas, updateTodos, addCalendar, updateCalendar, 
    removeCalendar 
} from './database';
import { isDev } from './utils/isDev';
import { ipcRenderer } from 'electron';
import { 
    removeDeletedProjects, removeDeletedAreas, removeDeletedTodos, byNotDeleted, 
    typeEquals, byNotCompleted, convertTodoDates, differentBy, compareByDate, isNotEmpty 
} from './utils/utils';
import { 
    adjust, cond, all, isEmpty, contains, not, 
    remove, uniq, assoc, reverse, findIndex, splitAt, last, assocPath,
    isNil, and, complement, compose, reject, concat, map, when, find,
    prop, ifElse, identity, path, equals, allPass, evolve, pick, defaultTo  
} from 'ramda'; 
import { filter } from 'lodash';
import { globalErrorHandler } from './utils/globalErrorHandler';
import { assert } from './utils/assert';
import { 
    isTodo, isProject, isArea, isCalendar, isString, isArrayOfTodos, 
    isArrayOfProjects, isArrayOfAreas, isDate, isNumber 
} from './utils/isSomething';
import { setCallTimeout } from './utils/setCallTimeout';
import diff from 'deep-diff';
import { moveReminderFromPast } from './utils/getData';



let getDate = (todo:Todo) => todo.attachedDate;



let compareByAttachedDate = compareByDate(getDate);



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



export let applicationObjectsReducer = (state:Store, action:{type:string,load:any,kind:string}) : Store => { 
    let clone : boolean = prop('clone',state);
    let shouldAffectDatabase : boolean =  and(actionFromQuickEntry(action),not(clone)) || 
                                          actionOriginIsThisWindow(action);

    
    return compose(
        (newState:Store) => {
            if(isNil(newState)){ return newState }

            let shouldUpdateOtherInstances : boolean = actionOriginIsThisWindow(action);
            //update other windows only if action was initialized inside current window 
            //and action belong to ObjectsReducer (state was updated inside this function)
            if(shouldUpdateOtherInstances){
               ipcRenderer.send("action", {action,id:newState.id}); 
            }  
  
            return newState;
        },  
        cond([ 
            [
                typeEquals("toggleScheduled"),  
                (action:{type:string, load:string}) : Store => {
                    let idx = state.projects.findIndex( p => p._id===action.load );

                    if(idx===-1){ return {...state} }

                    let project = state.projects[idx];

                    project = ({...project,showScheduled:!project.showScheduled});

                    if(shouldAffectDatabase){ 
                       updateProject(action.load, project, onError); 
                    }
                    
                    return {...state, projects:adjust(() => project, idx, state.projects)};

                }
            ],
            [
                typeEquals("toggleCompleted"),  
                (action:{type:string, load:string}) : Store => {
                    let idx = state.projects.findIndex( p => p._id===action.load );

                    if(idx===-1){ return {...state} }

                    let project = state.projects[idx];

                    project = ({...project,showCompleted:!project.showCompleted});

                    if(shouldAffectDatabase){ 
                       updateProject(action.load, project, onError); 
                    }
                    
                    return {...state, projects:adjust(() => project, idx, state.projects)};

                }
            ],


            
            [
                typeEquals("removeGroupAfterDate"),
                (action:{type:string, load:Todo}) : Store => {
                    let todo : Todo = action.load;
                    let group = prop('group', todo);

                    
                    if(isNil(group) || isNil(todo) || !isDate(todo.attachedDate)){ return }

 
                    let [todosToUpdate, todosToRemove] : Todo[][] = compose(
                        log('todosToUpdate & todosToRemove'),
                        (todos:Todo[]) => compose( 
                            (idx:number) => splitAt(idx)(todos), 
                            findIndex((t:Todo) => t._id===todo._id) 
                        )(todos), 
                        reverse, //from past -> to future
                        (todos:Todo[]) => todos.sort( compareByAttachedDate ), 
                        (id:string) => filter( state.todos, (todo:Todo) => path(['group','_id'], todo)===id ),
                        prop('_id')
                    )(group);


                    let todosToRemoveIds = todosToRemove.map((t:Todo) => t._id);
                    let todosToUpdateIds = todosToUpdate.map((t:Todo) => t._id);
                    let until = compose(prop('attachedDate'), last)(todosToUpdate);

                    let todos : Todo[] = compose(
                        when(
                            () => path(['group','options','selectedOption'], todo) !== 'after',
                            map(
                                when(
                                    (t:Todo) => contains(t._id)(todosToUpdateIds) && isDate(until), 
                                    compose(
                                        log('updated'), 
                                        assocPath(['group', 'options', 'until'], until),
                                        assocPath(['group', 'options', 'selectedOption'], 'on'),
                                        assocPath(['group', 'type'], 'on')
                                    )
                                )
                            ) 
                        ),
                        reject((t:Todo) => contains(t._id)(todosToRemoveIds))
                    )(state.todos);

                    if(shouldAffectDatabase){ 
                       removeTodos(todosToRemove,onError); 
                    } 

                    return ({...state,todos});
                }
            ],

            [ 
                typeEquals("moveReminderFromPast"),
                (action:{type:string, load:any}) : Store => ({
                    ...state,
                    todos:map(
                        (todo:Todo) => moveReminderFromPast(todo),
                        state.todos
                    ) 
                })
            ],

            [
                typeEquals("openWhenCalendar"),
                (
                    action:{
                        type:string, 
                        load:{
                            showWhenCalendar : boolean, 
                            whenTodo : Todo,
                            whenCalendarPopupX : number, 
                            whenCalendarPopupY : number,
                            showRightClickMenu : boolean
                        } 
                    }
                ) : Store => ({
                    ...state,
                    showWhenCalendar : action.load.showWhenCalendar, 
                    whenTodo : action.load.whenTodo,
                    whenCalendarPopupX : action.load.whenCalendarPopupX, 
                    whenCalendarPopupY : action.load.whenCalendarPopupY,
                    showRightClickMenu : action.load.showRightClickMenu
                })
            ],  
            [ 
                typeEquals("updateTodos"),
                (action:{type:string, load:Todo[]}) : Store => {
                    let changedTodos = action.load;
                    let changedIds:string[] = changedTodos.map((t:Todo) => t._id);

                    if(isEmpty(changedIds)){ 
                       return { ...state };  
                    }
                     
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

                    if(isDev()){
                       assert(isString(action.load.id),`id is not of type String. updateTodoById.`);
                       assert(isTodo(todo),`Todo is not of type Todo. updateTodoById.`);
                    }

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
                (action:{type:string, load:any}) : Store => ({...state, ...action.load}) 
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
                (action:{type:string,load:Calendar[]}):Store => {
                    return {
                        ...state, 
                        calendars:action.load
                    }
                }
            ],  

            [ 
                typeEquals('updateCalendars'),  
                (action:{type:string,load:Calendar[]}):Store => {
                    if(isDev()){
                       assert(all(isCalendar,action.load), `Not all items of type Calendar.`); 
                    }

                    let calendars = state.calendars.map(
                        c => compose(
                            defaultTo(c),
                            find((calendar:Calendar) => calendar._id===c._id)
                        )(action.load)
                    );

                    return {...state, calendars};
                }
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
                
                    return {...state,todos:[...action.load] };
                }
            ], 

            [ 
                typeEquals("setProjects"),  

                (action:{type:string, load:Project[]}) : Store => {

                    assert(isArrayOfProjects(action.load), `Error: setProjects. applicationObjectsReducer. ${action.load}`); 
                    
                    return { ...state, projects:[...action.load] };
                }
            ], 

            [ 
                typeEquals("setAreas"),  

                (action:{type:string,load:Area[]}) : Store => { 

                    assert(isArrayOfAreas(action.load), `Error: setAreas. applicationObjectsReducer. ${action.load}`); 
                    
                    return { ...state, areas:[...action.load]  };
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
                        todos = filter(state.todos, byNotDeleted);
                        projects = filter(state.projects, byNotDeleted); 
                        areas = filter(state.areas, byNotDeleted); 
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
                typeEquals("restoreProject"),
                (action:{type:string, load:string}) : Store => {
                    let projectIndex : number = state.projects.findIndex( p => p._id===action.load );

                    if(projectIndex===-1){ return state }

                    let project = state.projects[projectIndex];
                    let relatedTodosIds : string[] = project.layout.filter(isString) as any[];
            
                    let todos = state.todos.map(
                        when( 
                            t => contains(t._id)(relatedTodosIds), 
                            t => ({...t,deleted:undefined}) 
                        )
                    ) as Todo[];

                    let projects = adjust(
                        (project:Project) => assoc('deleted',undefined,project), 
                        projectIndex, 
                        state.projects
                    );
 
                    return {...state, projects, todos};
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
                    if(isEmpty(action.load)){ return { ...state }; }

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