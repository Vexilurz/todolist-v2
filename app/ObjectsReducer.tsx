import { ipcRenderer } from 'electron'; 
import { Store } from './App';
import { 
    Project, Area, Todo, removeProject, generateId, addProject, 
    removeArea, updateProject, addTodo, updateArea, updateTodo, 
    addArea, removeTodo, removeAreas, removeTodos, removeProjects, 
    updateAreas, updateProjects, addTodos, addProjects, addAreas, updateTodos 
} from './database';
import { 
    getTagsFromItems, defaultTags, removeDeletedProjects, 
    removeDeletedAreas, removeDeletedTodos, changePriority, Item 
} from './utils';
import { adjust, cond, equals, all } from 'ramda';



let onError = (e) => {
    console.log(e); 
}

 

export let applicationObjectsReducer = (state:Store, action) : Store => { 

    let newState : Store = undefined;

    newState = cond([
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
            (action:{type:string}) : boolean => "removeDeleted"===action.type, 

            (action:{type:string}) : Store => {
                let todos = removeDeletedTodos(state.todos);
                let projects = removeDeletedProjects(state.projects);
                let areas = removeDeletedAreas(state.areas);

                return {  
                    ...state,
                    todos,
                    projects,
                    areas,
                    tags :  [ 
                        ...defaultTags,
                        ...getTagsFromItems([...todos, ...projects, ...areas])
                    ]
                }
            }
        ], 

        [
            (action:{type:string}) : boolean => "addTodo"===action.type,

            (action:{type:string, load:Todo}) : Store => {
                
                if(action.load.type!=="todo")
                   throw new Error(`Load is not of type Todo. ${JSON.stringify(action.load)} addTodo. objectsReducer.`);
 
                addTodo(onError, action.load);
                
                return {
                    ...state, 
                    todos:[action.load,...state.todos],
                };  
            }

        ], 

        [
            (action:{type:string}) : boolean => "addProject"===action.type,

            (action:{type:string, load:Project}) : Store => {
                
                if(action.load.type!=="project")
                   throw new Error(`Load is not of type Project. ${JSON.stringify(action.load)} addProject. objectsReducer.`);
 
                addProject(onError,action.load);

                return {
                    ...state,  
                    projects:[action.load,...state.projects]
                };   
            }

        ], 

        [
            (action:{type:string}) : boolean =>"addArea"===action.type,

            (action:{type:string, load:Area}) : Store => {
                
                if(action.load.type!=="area")
                   throw new Error(`Load is not of type Area. ${JSON.stringify(action.load)} addArea. objectsReducer.`);
 
                addArea(onError,action.load);

                return {
                    ...state,  
                    areas:[action.load,...state.areas]
                };   

            }
        ],

        [
            (action:{type:string}) => "attachTodoToProject"===action.type,

            (action:{type:string, load:{projectId:string,todoId:string} }) : Store => {

                let idx = state.projects.findIndex( (p:Project) => p._id===action.load.projectId );

                if(idx===-1) 
                   throw new Error("Attempt to update non existing object. attachTodoToProject. objectsReducer.");   
    
                let project : Project = {...state.projects[idx]};  
                project.layout = [action.load.todoId, ...project.layout];
    
                updateProject(project._id,project,onError);

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

                if(idx===-1) 
                   throw new Error("Attempt to update non existing object. attachTodoToArea. objectsReducer.");  
    
                let area = {...state.areas[idx]};
                area.attachedTodosIds = [action.load.todoId, ...area.attachedTodosIds];
    
                updateArea(area._id,area,onError);

                return {     
                    ...state,  
                    areas:adjust(() => area, idx, state.areas)
                } 
            }
        ],

        [
            (action:{type:string}) => "changeTodosPriority"===action.type,

            (action:{type:string, load:{fromId:string,toId:string} }) : Store => {

                let from  = state.todos.findIndex( (t:Todo) => t._id===action.load.fromId );
                let to  = state.todos.findIndex( (t:Todo) => t._id===action.load.toId );

                let items = changePriority(from,to,state.todos) as Todo[];

                let fromItem = items[from];
                let toItem = items[to];  

                if( all((i:Item) => i.type==="todo", items) ){
                    updateTodos([fromItem,toItem] as Todo[],onError);
                }else{
                    throw new Error(`Not all objects are of type Todo. ${JSON.stringify(items)}`);
                }

                return {
                    ...state, 
                    todos:items
                }
            }
        ],

        [ 
            (action:{type:string}) => "changeProjectsPriority"===action.type,

            (action:{type:string, load:{fromId:string,toId:string} }) : Store => {

                let from  = state.projects.findIndex( (p:Project) => p._id===action.load.fromId );
                let to  = state.projects.findIndex( (p:Project) => p._id===action.load.toId );
                
                let items = changePriority(from,to,state.projects) as Project[];

                let fromItem = items[from]; 
                let toItem = items[to];  
 
                if( all((i:Item) => i.type==="project", items) ){
                    updateProjects([fromItem,toItem] as Project[], onError);
                }else{
                    throw new Error(`Not all objects are of type Project. ${JSON.stringify(items)}`);
                } 

                return {...state, projects:items}
            }
        ], 

        [ 
            (action:{type:string}) => "changeAreasPriority"===action.type,

            (action:{type:string, load:{fromId:string,toId:string} }) : Store => { 

                let from  = state.areas.findIndex( (a:Area) => a._id===action.load.fromId );
                let to  = state.areas.findIndex( (a:Area) => a._id===action.load.toId );

                let items = changePriority(from,to,state.areas) as Area[]; 
                
                let fromItem = items[from]; 
                let toItem = items[to];  
  
                if( all((i:Item) => i.type==="area", items) ){
                    updateAreas([fromItem,toItem] as Area[], onError);
                }else{
                    throw new Error(`Not all objects are of type Area. ${JSON.stringify(items)}`);
                }
                
                return {...state, areas:items}
            }
        ],

        [ 
            (action:{type:string}) => "updateTodo"===action.type,

            (action:{type:string, load:Todo}) : Store => {

                let idx = state.todos.findIndex((t:Todo) => action.load._id===t._id);
                
                if(idx===-1){
                   throw new Error(
                     `Attempt to update non existing object ${JSON.stringify(action.load)}. updateTodo. objectsReducer.`
                   ); 
                }

                if(action.load.type!=="todo")
                   throw new Error(`Load is not of type Todo. ${JSON.stringify(action.load)} updateTodo. objectsReducer.`);
 
    
                updateTodo(action.load._id, action.load, onError);
    
                return { 
                    ...state, 
                    todos:adjust(() => action.load, idx, state.todos)
                }; 

            }
        ],

        [ 
            (action:{type:string}) => "updateProject"===action.type,

            (action:{type:string, load:Project}) : Store => {

                let idx = state.projects.findIndex((p:Project) => action.load._id===p._id);
                
                if(idx===-1)
                   throw new Error("Attempt to update non existing object. updateProject. objectsReducer.");
    
                if(action.load.type!=="project")
                   throw new Error(`Load is not of type Project. ${JSON.stringify(action.load)} updateProject. objectsReducer.`);
 
                updateProject(action.load._id, action.load, onError);   
    
                return { 
                    ...state, 
                    projects:adjust(() => action.load, idx, state.projects)
                };

            }
        ],

        [ 
            (action:{type:string}) => "updateArea"===action.type,

            (action:{type:string, load:Area}) : Store => {

                let idx = state.areas.findIndex((a:Area) => action.load._id===a._id);
                
                if(idx===-1) 
                   throw new Error("Attempt to update non existing object. updateArea. objectsReducer.");
         
                if(action.load.type!=="area")  
                   throw new Error(`Load is not of type Area. ${JSON.stringify(action.load)} updateArea. objectsReducer.`);
    
                updateArea(action.load._id, action.load, onError);
        
                return { 
                    ...state, 
                    areas:adjust(() => action.load, idx, state.areas)
                };  

            } 
        ],

        [ 
            (action:{type:string}) => "updateTodos"===action.type,
 
            (action:{type:string, load:Todo[]}) : Store => {

                let changed = action.load.map( (t:Todo) => t._id );
                let fixed = state.todos.filter( (t:Todo) => changed.indexOf(t._id)===-1 )  
     
                updateTodos(action.load,onError);
    
                return {    
                    ...state,  
                    todos:[...fixed,...action.load] 
                };

            }
        ],

        [ 
            (action:{type:string}) => "updateProjects"===action.type,
 
            (action:{type:string, load:Project[]}) : Store => {
 
                let changed = action.load.map( (p:Project) => p._id );
                let fixed = state.projects.filter( (p:Project) => changed.indexOf(p._id)===-1 );  
     
                updateProjects(action.load,onError);
    
                return {    
                    ...state,  
                    projects:[...fixed,...action.load] 
                };  

            }
        ],

        [ 
            (action:{type:string}) => "updateAreas"===action.type,
 
            (action:{type:string, load:Area[]}) : Store => {
 
                let changed = action.load.map( (a:Area) => a._id );
                let fixed = state.areas.filter( (a:Area) => changed.indexOf(a._id)===-1 )  
    
                updateAreas(action.load,onError);
    
                return {     
                    ...state,  
                    areas:[...fixed,...action.load] 
                };  
            
            }
        ],

        [ 
            (action:{type:string}) => "addTodos"===action.type,
 
            (action:{type:string, load:Todo[]}) : Store => {
 
                addTodos(onError, action.load);
                 
                return {
                    ...state,  
                    todos:[...action.load,...state.todos]
                }; 

            }
        ],

        [ 
            (action:{type:string}) => "addProjects"===action.type,
 
            (action:{type:string, load:Project[]}) : Store => {
 
                addProjects(onError, action.load);
                
                return {
                    ...state,  
                    projects:[...action.load,...state.projects]
                }; 

            }
        ],

        [ 
            (action:{type:string}) => "addAreas"===action.type,
 
            (action:{type:string, load:Area[]}) : Store => {

                addAreas(onError, action.load);
                
                return {
                    ...state,   
                    areas:[...action.load,...state.areas]
                }; 

            }
        ],

    ])(action);



    if(newState){ 

       if(action.kind!=="external"){ 

          ipcRenderer.send("action", action, state.windowId); 
           
       }
    
    }  
 
 

    return newState; 
   
}     