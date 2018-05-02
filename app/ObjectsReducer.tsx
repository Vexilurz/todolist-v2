import { Project, Area, Todo, Calendar, Store, action } from './types';
import { isDev } from './utils/isDev';
import { ipcRenderer } from 'electron';
import { 
    byNotDeleted, typeEquals, byNotCompleted, convertTodoDates, 
    differentBy, compareByDate, isNotEmpty 
} from './utils/utils';
import { 
    adjust, cond, all, isEmpty, contains, not, remove, uniq, assoc, reverse, 
    findIndex, splitAt, last, assocPath, isNil, and, complement, compose, 
    reject, concat, map, when, find, prop, ifElse, identity, path, equals, 
    allPass, evolve, pick, defaultTo  
} from 'ramda'; 
import { filter } from 'lodash';
import { 
    isTodo, isProject, isArea, isCalendar, isString, isArrayOfTodos, 
    isArrayOfProjects, isArrayOfAreas, isDate, isNumber 
} from './utils/isSomething';
import { moveReminderFromPast } from './utils/getData';

 

let actionOriginIsThisWindow = (action:action) : boolean => {
    return and(action.kind!=="external", action.kind!=="quick-entry");
};



let actionFromQuickEntry = (action:action) : boolean => {
    return action.kind==="quick-entry";
};



let updateOtherInstances = (action:action) => (newState:Store) => {
    if(isNil(newState)){ return newState }

    let shouldUpdateOtherInstances : boolean = actionOriginIsThisWindow(action);
    //update other windows only if action was initialized inside current window 
    //and action belong to ObjectsReducer 
    if(shouldUpdateOtherInstances){
       ipcRenderer.send("action", {action,id:newState.id}); 
    }  

    return newState;
};




export let objectsReducer = (state:Store, action:action) : Store => { 
    return compose(
        updateOtherInstances(action),  
        cond([ 
            [ 
                typeEquals("shouldSendStatistics"),
                (action:{type:string,load:boolean}) : Store => {
                    return ({...state, shouldSendStatistics:action.load}); 
                }   
            ],
            [ 
                typeEquals("removeCalendar"),  
                (action:{ type:string, load:string }) : Store => { 
                    let { calendars } = state;
                    let idx = calendars.findIndex(c => c._id===action.load);

                    return {...state, calendars:remove(idx, 1, calendars)};
                }
            ],
            [
                typeEquals("removeTodo"),  
                (action:{ type:string, load:string }) : Store => { 
                    let { todos } = state;
                    let idx = todos.findIndex(c => c._id===action.load);

                    return {...state, todos:remove(idx, 1, todos)};
                }
            ],
            [
                typeEquals("removeProject"),  
                (action:{ type:string, load:string }) : Store => { 
                    let { projects } = state;
                    let idx = projects.findIndex(c => c._id===action.load);

                    return {...state, projects:remove(idx, 1, projects)};
                }
            ],
            [
                typeEquals("removeArea"),  
                (action:{ type:string, load:string }) : Store => { 
                    let { areas } = state;
                    let idx = areas.findIndex(c => c._id===action.load);

                    return {...state, areas:remove(idx, 1, areas)};
                }
            ],
            [
                typeEquals("removeTodos"),  
                (action:{type:string, load:string[]}) : Store => ({
                    ...state,
                    todos:filter(state.todos, t => !contains(t._id)(action.load))
                })
            ],
            [
                typeEquals("removeProjects"),  
                (action:{type:string, load:string[]}) : Store => ({
                    ...state,
                    projects:filter(state.projects, p => !contains(p._id)(action.load))
                })
            ],
            [
                typeEquals("removeAreas"),  
                (action:{type:string, load:string[]}) : Store => ({
                    ...state,
                    areas:filter(state.areas, a => !contains(a._id)(action.load))
                })
            ],
            [
                typeEquals("removeCalendars"),  
                (action:{type:string, load:any}) : Store => ({
                    ...state,
                    calendars:filter(state.calendars, c => !contains(c._id)(action.load))
                })
            ], 
            [
                typeEquals("removeDeleted"), 

                (action:{type:string}) : Store => {
                    return {
                        ...state,
                        todos:filter(state.todos, byNotDeleted),
                        projects:filter(state.projects, byNotDeleted),
                        areas:filter(state.areas, byNotDeleted)
                    }; 
                }
            ], 


            [
                typeEquals("toggleScheduled"),  
                (action:{type:string, load:string}) : Store => {
                    let idx = state.projects.findIndex( p => p._id===action.load );

                    if(idx===-1){ return {...state} }

                    let project = state.projects[idx];

                    project = ({...project,showScheduled:!project.showScheduled});

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

                    return {...state, projects:adjust(() => project, idx, state.projects)};

                }
            ],
            [
                typeEquals("removeGroupAfterDate"),
                (action:{type:string, load:Todo}) : Store => {
                    let compareByAttachedDate = compareByDate((todo:Todo) => todo.attachedDate);
                    let todo : Todo = action.load;
                    let group = prop('group', todo);

                    
                    if(isNil(group) || isNil(todo) || !isDate(todo.attachedDate)){ return }

 
                    let [todosToUpdate, todosToRemove] : Todo[][] = compose(
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
                                        assocPath(['group', 'options', 'until'], until),
                                        assocPath(['group', 'options', 'selectedOption'], 'on'),
                                        assocPath(['group', 'type'], 'on')
                                    )
                                )
                            ) 
                        ),
                        reject((t:Todo) => contains(t._id)(todosToRemoveIds))
                    )(state.todos);

                    return ({...state,todos});
                }
            ],
            [ 
                typeEquals("moveReminderFromPast"),
                (action:{type:string, load:any}) : Store => ({
                    ...state,
                    todos:map((todo:Todo) => moveReminderFromPast(todo), state.todos) 
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
                     
                    let todos : Todo[] = state.todos.map(
                        ifElse(
                            (todo) => contains(todo._id)(changedIds),
                            (todo) => ({...todo,...changedTodos.find( t => t._id===todo._id )}),
                            identity
                        )
                    )
                    
                    /*compose(concat(changedTodos), reject((todo:Todo) => contains(todo._id)(changedIds)))(state.todos);*/

                    return { ...state, todos };
                } 
            ], 
            [
                typeEquals("updateTodoById"),
                (action:{ type:string, load: {id:string,props:any} }) : Store => {

                    let idx = state.todos.findIndex((t:Todo) => action.load.id===t._id);
                    let todo = state.todos[idx]; 

                    if(isNil(todo)){
                       return {...state}; 
                    }

                    todo = {...todo,...action.load.props};

                    //if todo exists and have empty title - remove
                    if(isEmpty(todo.title)){

                        return{ ...state, todos:remove(idx, 1, state.todos) }; 

                    //if todo exists - update
                    }else{ 

                        return{ ...state, todos:adjust(() => todo, idx, state.todos) }; 
                    }
                }
            ], 
            [ 
                typeEquals('updateCalendars'),  
                (action:{type:string,load:Calendar[]}):Store => {
                  
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
                    
                    return {...state, calendars:[action.load,...state.calendars]};
                }
            ],
            [ 
                typeEquals("updateCalendar"),  
                (action:{type:string,load:Calendar}):Store => { 
                    let calendars = [...state.calendars];
                    let idx = calendars.findIndex(c => c.url===action.load.url);

                    return {...state, calendars:adjust(() => action.load, idx, calendars)};
                }
            ],
            [  
                typeEquals("removeGroup"), 

                (action:{type:string, load:string}) : Store => {  
                    let groupId : string = action.load;

                    return{   
                        ...state,  
                        todos:filter( state.todos, (todo:Todo) => isNil(todo.group) || todo.group._id!==groupId )
                    }; 
                }
            ],
            [
                typeEquals("addTodo"),

                (action:{type:string, load:Todo}) : Store => {
                    if(isEmpty(action.load.title)){ 
                       return {...state}; 
                    }

                    let todos = [action.load,...state.todos];

                    return {...state, todos}; 
                } 
            ], 
            [ 
                typeEquals("updateTodo"),

                (action:{type:string, load:Todo}) : Store => {
                    let idx = state.todos.findIndex((t:Todo) => action.load._id===t._id);

                    let todo = convertTodoDates(action.load);

                    if(idx===-1){ 
                        //if such todo does not exist add it to state
                        if(isEmpty(action.load.title)){ 

                            return {...state}; 

                        }else{

                            return { ...state, todos:[todo,...state.todos] };
                        }
                    }else{
                        //if todo exists and have empty title - remove
                        if(isEmpty(action.load.title)){

                            return{ ...state, todos:remove(idx, 1, state.todos) }; 

                        //if todo exists - update
                        }else{ 

                            return{ ...state, todos:adjust((prev) => ({...prev,...todo}), idx, state.todos) }; 
                        }
                    }
                }
            ],
            [
                typeEquals("addProject"),

                (action:{type:string, load:Project}) : Store => {
                  
                    return { ...state, projects:[action.load,...state.projects] };   
                }
            ], 
            [
                typeEquals("addArea"),

                (action:{type:string, load:Area}) : Store => {
                   
                    return { ...state, areas:[action.load,...state.areas] }; 
                }    
            ],
            [
                typeEquals("attachTodoToProject"),

                (action:{type:string, load:{projectId:string,todoId:string}}) : Store => {

                    let idx = state.projects.findIndex((p:Project) => p._id===action.load.projectId);

                    let project : Project = {...state.projects[idx]};  

                    project.layout = uniq([action.load.todoId, ...project.layout]);

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
                    let undeleted = filter( state.todos,  t => contains(t._id)(relatedTodosIds) );
            
                    let todos = state.todos.map(
                        when( 
                            t => contains(t._id)(relatedTodosIds), 
                            t => ({...t,deleted:undefined}) 
                        )
                    ) as Todo[];

                    let projects = adjust(
                        (project:Project) : Project => ({...project,deleted:undefined}), 
                        projectIndex, 
                        state.projects
                    );

                    return {...state, projects, todos};
                }
            ],
            [ 
                typeEquals("updateProject"),

                (action:{type:string, load:Project}) : Store => {

                    let idx = state.projects.findIndex((p:Project) => action.load._id===p._id);

                    return {...state, projects:adjust((p) => ({...p,...action.load}), idx, state.projects)};
                }
            ],
            [ 
                typeEquals("updateArea"),

                (action:{type:string, load:Area}) : Store => {

                    let idx = state.areas.findIndex((a:Area) => action.load._id===a._id);
                    
                    return {...state, areas:adjust((a) => ({...a, ...action.load}), idx, state.areas)};
                } 
            ],
            [ 
                typeEquals("updateProjects"),
    
                (action:{type:string, load:Project[]}) : Store => {
                    let changedProjects = [...action.load];
                    let changedIds:string[] = changedProjects.map((p:Project) => p._id);

                    let projects : Project[] = state.projects.map(
                        ifElse(
                            (project) => contains(project._id)(changedIds),
                            (project) => ({...project,...changedProjects.find( t => t._id===project._id )}),
                            identity
                        )
                    );
                    
                    //compose(concat(changedProjects),reject((project:Project) => contains(project._id)(changedIds)))(state.projects);

                    return { ...state, projects };
                }
            ],
            [ 
                typeEquals("updateAreas"),
    
                (action:{type:string, load:Area[]}) : Store => {
                    let changedAreas = [...action.load];
                    let changedIds:string[] = changedAreas.map((a:Area) => a._id);

                    let areas : Area[] = state.areas.map(
                        ifElse(
                            (area) => contains(area._id)(changedIds),
                            (area) => ({...area,...changedAreas.find( t => t._id===area._id )}),
                            identity
                        )
                    );
                    
                    //compose(concat(changedAreas), reject((area:Area) => contains(area._id)(changedIds)))(state.areas);

                    return { ...state, areas };
                }
            ],
            [ 
                typeEquals("addTodos"),
    
                (action:{type:string, load:Todo[]}) : Store => {
                    if(isEmpty(action.load)){ return { ...state }; }

                    let todos = [...action.load,...state.todos];

                    return { ...state, todos };
                }
            ],
            [ 
                typeEquals("addProjects"),
    
                (action:{type:string, load:Project[]}) : Store => {
                   
                    let projects = [...action.load,...state.projects];

                    return { ...state, projects };
                }
            ],
            [ 
                typeEquals("addAreas"),
    
                (action:{type:string, load:Area[]}) : Store => {

                    let areas = [...action.load,...state.areas];

                    return { ...state, areas };
                }
            ],
            [
                () => true, () => undefined
            ]
        ])
    )(action);
};     