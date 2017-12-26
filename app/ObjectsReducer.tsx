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
    removeDeletedAreas, removeDeletedTodos, changePriority 
} from './utils';
import { adjust, cond, equals } from 'ramda';

let onError = (e) => {
    console.log(e); 
}
 

let applicationObjectsReducer = (state:Store, action) : Store => { 

    let newState : Store = undefined;

    cond([
      [
            (action) => equals("setAllTypes", action.type),  
            (action) => ({  
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
        equals("setAllTypes"),  () => ({  
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
        equals("setAllTypes"),  () => ({  
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
    ])(action)


 
    



    switch(action.type){

        case "setAllTypes":
            newState = {
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
            }
            break;  
 

        case "removeDeleted":
            let todos : Todo[] = removeDeletedTodos(state.todos);
            let projects : Project[] = removeDeletedProjects(state.projects);
            let areas : Area[] = removeDeletedAreas(state.areas);

            newState = {
                ...state,
                todos,  
                projects,
                areas, 
                tags: [ 
                  ...defaultTags,
                  ...getTagsFromItems([...todos, ...projects, ...areas])
                ]
            }  
            break;  


        case "addTodo":  
            addTodo(onError, action.load);

            newState = {
                ...state, 
                todos:[action.load,...state.todos],
            };  
            break; 
        

        case "addArea":  
            addArea(onError, action.load);

            newState = { 
                ...state, 
                areas:[action.load,...state.areas]
            };  
            break;    
            

        case "addProject": 
            addProject(onError,action.load);

            newState = {
                ...state,  
                projects:[action.load,...state.projects]
            };   
            break;
 

        //{projectId,todoId}    
        case "attachTodoToProject":
            idx = state.projects.findIndex( (p:Project) => p._id===action.load.projectId );
            if(idx===-1) 
               throw new Error("Attempt to update non existing object. attachTodoToProject.");   

            project = {...state.projects[idx]};  
            project.layout = [action.load.todoId, ...project.layout];

            updateProject(project._id,project,onError);
            newState = {
                ...state,
                projects:adjust(() => project, idx, state.projects)
            }
            break; 
  

        //{areaId,todoId} 
        case "attachTodoToArea":
            idx = state.areas.findIndex( (a:Area) => a._id===action.load.areaId );
            if(idx===-1) 
               throw new Error("Attempt to update non existing object. attachTodoToArea.");  

            area = {...state.areas[idx]};
            area.attachedTodosIds = [action.load.todoId, ...area.attachedTodosIds];

            updateArea(area._id,area,onError);
            newState = {     
                ...state,  
                areas:adjust(() => area, idx, state.areas)
            } 
            break;     
    

        //{fromId,toId} 
        case "changeTodosPriority":
            from  = state.todos.findIndex( (t:Todo) => t._id===action.load.fromId );
            to  = state.todos.findIndex( (t:Todo) => t._id===action.load.toId );
            newState = {
                ...state, 
                todos:changePriority(from,to,state.todos) as Todo[]
            }
            break;


        //{fromId,toId} 
        case "changeProjectsPriority": 
            from  = state.projects.findIndex( (p:Project) => p._id===action.load.fromId );
            to  = state.projects.findIndex( (p:Project) => p._id===action.load.toId );
            
            newState = {  
                ...state,
                projects:changePriority(from,to,state.projects) as Project[]
            }
            break; 
            

        //{fromId,toId}  
        case "changeAreasPriority": 
            from  = state.areas.findIndex( (a:Area) => a._id===action.load.fromId );
            to  = state.areas.findIndex( (a:Area) => a._id===action.load.toId );
            
            newState = {  
                ...state,
                areas:changePriority(from,to,state.areas) as Area[]
            }
            break; 
        
        
        case "updateTodo":
            idx = state.todos.findIndex((t:Todo) => action.load._id===t._id);

            if(idx===-1)
               throw new Error("Attempt to update non existing object. updateTodo."); 

            updateTodo(action.load._id, action.load, onError);

            newState = { 
                ...state, 
                todos:adjust(() => action.load, idx, state.todos)
            }; 
            break; 


        case "updateProject":  
            idx = state.projects.findIndex((p:Project) => action.load._id===p._id);

            if(idx===-1)
               throw new Error("Attempt to update non existing object. updateProject.");

            updateProject(action.load._id, action.load, onError);   

            newState = { 
                ...state, 
                projects:adjust(() => action.load, idx, state.projects)
            };
            break;    

             
        case "updateArea":  
            idx = state.areas.findIndex((a:Area) => action.load._id===a._id);

            if(idx===-1) 
               throw new Error("Attempt to update non existing object. updateArea.");

            updateArea(action.load._id, action.load, onError);
    
            newState = { 
                ...state, 
                areas:adjust(() => action.load, idx, state.areas)
            };  
            break;         

            





        case "updateTodos":  
            changed = action.load.map( (t:Todo) => t._id );
            fixed = state.todos.filter( (t:Todo) => changed.indexOf(t._id)===-1 )  
 
            updateTodos(action.load,onError);

            newState = {    
                ...state,  
                todos:[...fixed,...action.load] 
            };  
            break;       
      

        case "updateProjects":  
            changed = action.load.map( (p:Project) => p._id );
            fixed = state.projects.filter( (p:Project) => changed.indexOf(p._id)===-1 );  
 
            updateProjects(action.load,onError);

            newState = {    
                ...state,  
                projects:[...fixed,...action.load] 
            };  
            break;    
            
            
        case "updateAreas":  
            changed = action.load.map( (a:Area) => a._id );
            fixed = state.areas.filter( (a:Area) => changed.indexOf(a._id)===-1 )  

            updateAreas(action.load,onError);

            newState = {    
                ...state,  
                areas:[...fixed,...action.load] 
            };  
            break;    


        case "addTodos":
            addTodos(onError, action.load);

            newState = {
                ...state,  
                todos:[...action.load,...state.todos]
            }; 
            break; 


        case "addProjects":
            addProjects(onError, action.load);

            newState = {
                ...state,  
                projects:[...action.load,...state.projects]
            }; 
            break;     

            
        case "addAreas":
            addAreas(onError, action.load);

            newState = {
                ...state,   
                areas:[...action.load,...state.areas]
            }; 
            break;     

    } 


    if(newState){ 

       if(action.kind!=="external"){ 

          ipcRenderer.send("action", action, state.windowId); 
           
       }
    
    }
 
 

    return newState; 
   
}     