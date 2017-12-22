import './assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { ipcRenderer } from 'electron'; 
import IconButton from 'material-ui/IconButton'; 
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import { Component } from "react"; 
import {  
    wrapMuiThemeLight, wrapMuiThemeDark, attachDispatchToProps, 
    getTagsFromTodos, replace, remove, insert
} from "./utils"; 
import { createStore, combineReducers } from "redux"; 
import { Provider, connect } from "react-redux";
import './assets/fonts/index.css'; 
import { LeftPanel } from './Components/LeftPanel/LeftPanel';
import { MainContainer, Category } from './Components/MainContainer';
import { Project, Area, Todo, removeProject, generateId, addProject, removeArea, updateProject, addTodo, updateArea, updateTodo, addArea, removeTodo, removeAreas, removeTodos, removeProjects } from './database';
injectTapEventPlugin(); 
      
(() => {     
    let app=document.createElement('div'); 
    app.id='application';     
    document.body.appendChild(app);   
})();  
 


@connect((store,props) =>  ({ ...store, ...props }), attachDispatchToProps)  
export class App extends Component<any,any>{

    constructor(props){  
  
        super(props);   


    }


 
    componentDidMount(){

        let {type,load} = this.props.initialLoad;

        switch(type){

            case "clone":
               this.props.dispatch({type:"newStore", load});
               this.props.dispatch({type:"clone", load:true});
               break; 
            case "reload":
               this.props.dispatch({type:"windowId", load});
               break;
            case "open":
               this.props.dispatch({type:"windowId", load});
               break;

        }

    }   
 


    render(){     

        return wrapMuiThemeLight(
            <div style={{
                backgroundColor:"white",
                width:"100%",
                height:"100%", 
                scroll:"none",
                zIndex:2001,  
            }}>  
                <div style={{display:"flex", width:"inherit", height:"inherit"}}>    
    
                    <div className="drag"
                            style={{
                                pointerEvents:"none",   
                                position : "absolute", 
                                top:0,
                                left:0,     
                                width:"100%", 
                                height:"6%" 
                            }}  
                    >   
                    </div>  
 
                    <LeftPanel {...{} as any}  /> 

                    <MainContainer {...{} as any} />  
 
                </div> 
            </div>         
        );   

    }            
            
};           
  
 

ipcRenderer.on( 
    'loaded',     
    (event, {type, load} : {type:string,load:any}) => { 

        ReactDOM.render(  
            <Provider store={store}> 
                <App initialLoad={{type,load}}/>
            </Provider>,
            document.getElementById('application')
        )  
    }
);    
  


export interface Store{
    selectedCategory : Category,
    selectedTodoId : string,
    openSearch : boolean, 
    selectedTag : string,
    leftPanelWidth : number,
    closeAllItems : any,
    openRightClickMenu : any, 
    selectedProjectId : string,
    selectedAreaId : string,
    showProjectMenuPopover : boolean,
    openNewProjectAreaPopup : boolean,
    showRightClickMenu : boolean,
    rightClickedTodoId : string,
    rightClickMenuX : number,
    rightClickMenuY : number,
    windowId:number,
    projects:Project[],
    areas:Area[],
    events:Event[],   
    todos:Todo[],
    tags:string[],
    
    clone?:boolean,
    dispatch?:Function
} 



export let defaultStoreItems : Store = {

    windowId:null, 
     
    selectedCategory : "inbox",

    openSearch : false, 

    selectedTodoId : null,

    selectedTag : "",

    leftPanelWidth : window.innerWidth/3.7,
     
    selectedProjectId : null,

    selectedAreaId : null,
 
    showProjectMenuPopover : false,

    closeAllItems : undefined,

    openRightClickMenu : undefined,
     
    openNewProjectAreaPopup : false,

    showRightClickMenu : false,

    rightClickedTodoId : null,

    rightClickMenuX : 0,

    rightClickMenuY : 0,
    
    projects:[],

    areas:[],

    events:[], 

    clone : false,
    todos:[], 

    tags:[
        "Work", "Home",
        "Priority", "High", "Medium",
        "Low"
    ]

};    
    
 

let reducer = (reducers) => (state:Store, action) => {

    let newState = undefined;
 

    if(action.type==="newStore"){

       return {...action.load}  

    }


    for(let i=0; i<reducers.length; i++){

        newState = reducers[i](state, action);

        if(newState)
           return newState; 

    }
 

    return state; 
};
   
 
 
let applicationStateReducer = (state:Store, action:{ type:keyof Store, load:any}) => {
 
    let newState = undefined;

 
    switch(action.type){  

        case "openSearch": 
            newState = {
                ...state, 
                showProjectMenuPopover:false, 
                showRightClickMenu:false,
                openSearch:action.load 
            }; 
            break;

        case "showProjectMenuPopover":
            newState = {
                ...state, 
                showProjectMenuPopover:action.load
            }; 
            break;

        case "windowId":
            newState = {
                ...state,
                windowId:action.load
            }; 
            break;

        case "clone":
            newState = {
                ...state, 
                clone:action.load
            }; 
            break;    
 
        case "selectedCategory":
            newState = {
                ...state,
                selectedTag:"All", 
                openSearch:false, 
                selectedCategory:action.load,
                openNewProjectAreaPopup:false 
            }; 
            break;


        case "leftPanelWidth":
            newState = {
                ...state,
                leftPanelWidth:action.load
            };
            break;


        case "selectedTag":  
            newState = {
                ...state,
                selectedTag:action.load
            };
            break;


        case "openNewProjectAreaPopup":
            newState = {
                ...state,
                openNewProjectAreaPopup:action.load
            }; 
            break;


        case "openRightClickMenu":
            newState = {
                ...state,
                showRightClickMenu : action.load.showRightClickMenu,
                rightClickedTodoId : action.load.rightClickedTodoId,
                rightClickMenuX : action.load.rightClickMenuX,
                rightClickMenuY : action.load.rightClickMenuY
            };  
            break;


        case "showRightClickMenu": 
            newState = {
                ...state,
                showRightClickMenu : action.load
            };
            break;


        case "selectedTodoId":
            newState = {
                ...state,
                selectedTodoId : action.load,
                openSearch : false
            }; 
            break;


        case "closeAllItems":
            newState = {
                ...state,
                openNewProjectAreaPopup : false,
                showRightClickMenu : false,
                selectedTodoId : null
            };  
            break;


        case "rightClickedTodoId" :
            newState = {
                ...state,
                rightClickedTodoId : action.load
            }; 
            break;


        case "rightClickMenuX" :
            newState = {
                ...state,
                rightClickMenuX : action.load
            }; 
            break;


        case "rightClickMenuY" :
            newState = {
                ...state,
                rightClickMenuY : action.load
            }; 
            break;


        case "selectedProjectId":
            newState = {
                ...state, 
                selectedCategory:"project", 
                selectedTag:"All",
                openSearch:false,
                selectedProjectId:action.load
            };    
            break;
        

        case "selectedAreaId": 
            newState = { 
                ...state, 
                selectedCategory:"area", 
                selectedTag:"All",
                openSearch:false,
                selectedAreaId:action.load
            };    
            break;


    }


    return  newState;
 

}






function removeDeleted<T>(objects : T[], updateDB : Function) : T[]{

    let deleted = [];
    let remainder = [];

    for(let i=0; i<objects.length; i++){
        if(!!objects[i]["deleted"]){
            deleted.push(objects[i]);
        }else{
            remainder.push(objects[i]);  
        } 
    }

    updateDB(deleted);
    
    return remainder;

}



let removeDeletedTodos = (todos:Todo[]) => {
    return removeDeleted<Todo>(todos, removeTodos)
}  

let removeDeletedProjects = (projects:Project[]) => {
    return removeDeleted<Project>(projects, removeProjects)
} 
 
let removeDeletedAreas = (areas:Area[]) => { 
    return removeDeleted<Area>(areas, removeAreas)
}





let swapProjects = (from : number, to : number, projects : Project[]) : Project[] => {
    let fromProject : Project = projects[from];
    let toProject : Project = projects[to];

    let fromPriority : number = fromProject.priority; 
    let toPriority : number = toProject.priority;

    let moveFrom = replace(projects, {...fromProject, toPriority}, from);
    let moveTo = replace(projects, {...toProject, fromPriority}, to);
    
    return moveTo;
}


let swapTodos = (from : number, to : number, todos : Todo[]) : Todo[] => {
    let fromTodo : Todo = todos[from];
    let toTodo : Todo = todos[to];

    let fromPriority : number = fromTodo.priority; 
    let toPriority : number = toTodo.priority;

    let moveFrom = replace(todos, {...fromTodo, toPriority}, from);
    let moveTo = replace(todos, {...toTodo, fromPriority}, to);
     
    return moveTo;
}




 
let onError = (e) => {
    console.log(e);
    debugger;
}
 

let applicationObjectsReducer = (state:Store, action) => { 
    

    let newState : Store = undefined;
    let idx = -1; 
    let replacement = [];
    let project : any = null;
    let area : any = null;
    let from : any = null;
    let to : any = null; 
    
    
  

    switch(action.type){

        case "setAllTypes":
            newState = {
                ...state,
                todos:[...action.load.todos],
                projects:[...action.load.projects],
                areas:[...action.load.areas],
                tags:getTagsFromTodos(action.load.todos),
            }
            break;  


  
        case "removeAllTypes":
            newState = {
                ...state,
                todos:removeDeletedTodos(state.todos),  
                projects:removeDeletedProjects(state.projects),
                areas:removeDeletedAreas(state.areas),
                tags:getTagsFromTodos(action.load.todos),
            }
            break; 
            
            
        //{projectId,todoId}    
        case "attachTodoToProject":
            idx = state.projects.findIndex( (p:Project) => p._id===action.load.projectId );
            if(idx===-1) 
                return;  
            project = {...state.projects[idx]};
            project.layout = [action.load.todoId, ...project.layout];
            updateProject(project._id,project,onError);
            newState = {
                ...state,
                projects:replace(state.projects,project,idx) 
            }
            break; 
  
        //{areaId,todoId} 
        case "attachTodoToArea":
            idx = state.areas.findIndex( (a:Area) => a._id===action.load.areaId );
            if(idx===-1) 
                return;  
            area = {...state.areas[idx]};
            area.attachedProjectsIds = [action.load.todoId, ...area.attachedProjectsIds];
            updateArea(area._id,area,onError);
            newState = {
                ...state,
                projects:replace(state.projects,project,idx) 
            }
            break;     

 
        //{fromId,toId} 
        case "swapTodos":
            from  = state.todos.findIndex( (t:Todo) => t._id===action.load.fromId );
            to  = state.todos.findIndex( (t:Todo) => t._id===action.load.toId );
            newState = {
                ...state, 
                todos:swapTodos(from,to,state.todos)
            }
            break;


        //{fromId,toId} 
        case "swapProjects": 
            from  = state.projects.findIndex( (p:Project) => p._id===action.load.fromId );
            to  = state.projects.findIndex( (p:Project) => p._id===action.load.toId );
            newState = {
                ...state,
                projects:swapProjects(from,to,state.projects)
            }
            break;
            
 

        case "updateTodo":
            idx = state.todos.findIndex((t:Todo) => action.load._id===t._id);
            if(idx===-1)
               throw new Error("Attempt to update non existing object. updateTodo."); 
            replacement = replace(state.todos,action.load,idx);
            updateTodo(action.load._id, action.load, onError);
            newState = {
                ...state, 
                selectedTodoId:action.load._id,
                selectedTag:"All",
                tags:getTagsFromTodos(replacement),
                todos:replace(state.todos,action.load,idx),
                showRightClickMenu:false
            }; 
            break; 


        case "updateProject":  
            idx = state.projects.findIndex((p:Project) => action.load._id===p._id);
            if(idx===-1)
               throw new Error("Attempt to update non existing object. updateProject.");
            updateProject(action.load._id,action.load, onError);   
            newState = { 
                ...state, 
                selectedProjectId:action.load._id,
                showProjectMenuPopover:false,
                projects:replace(state.projects,action.load,idx)
            }; 
            break;    

             
        case "updateArea":  
            idx = state.areas.findIndex((a:Area) => action.load._id===a._id);
            if(idx===-1)
               throw new Error("Attempt to update non existing object. updateArea.");
            updateArea(action.load._id,action.load,onError);
            newState = {  
                ...state,  
                selectedAreaId:action.load._id,
                areas:replace(state.areas,action.load,idx)
            };  
            break;    


        case "duplicateTodo":
            idx = state.todos.findIndex((item:Todo) => item._id===action.load);
            if(idx==-1)
               throw new Error(`Todo does not exist. ${action.load}`);
            let duplicatedTodo : any = state.todos[idx];
            duplicatedTodo  = {  ...duplicatedTodo, ...{_id:generateId()}  };
            delete duplicatedTodo._rev;
            addTodo(onError, duplicatedTodo);
            newState = {  
                ...state, 
                todos:insert(state.todos, duplicatedTodo, idx)
            }; 
            break; 
        

        case "duplicateProject":
            idx = state.projects.findIndex( (p:Project) => p._id===action.load );
            if(idx===-1)  
               throw new Error(`Project does not exist. ${action.load}`);
            project = { ...state.projects[idx] }; 
            let _id = generateId(); 
            project  = {  ...project,  ...{_id}  };
            delete project._rev;
            addProject(onError,project);
            newState = {  
                ...state, 
                selectedProjectId:_id,
                showProjectMenuPopover:false, 
                projects:insert(state.projects, project, idx)
            }; 
            break; 


        case "newTodo":  
            addTodo(onError, action.load)
            newState = {
                ...state, 
                selectedTodoId:action.load._id,
                selectedTag:"All",
                todos:[action.load,...state.todos],
                showRightClickMenu:false
            }; 
            break; 
        

        case "newProject": 
            addProject(onError,action.load);
            newState = {
                ...state,  
                selectedCategory:"project", 
                selectedTag:"All",
                openNewProjectAreaPopup:false, 
                selectedProjectId:action.load._id,
                projects:[action.load,...state.projects],
            };   
            break;

 
        case "newArea":  
            addArea(onError,action.load);
            newState = { 
                ...state, 
                selectedCategory:"area", 
                selectedTag:"All",
                openNewProjectAreaPopup:false,
                selectedAreaId:action.load._id, 
                areas:[action.load,...state.areas]
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



let applicationReducer = reducer([
    applicationStateReducer,
    applicationObjectsReducer
]); 
  

 
export let store = createStore(applicationReducer, defaultStoreItems); 
  


 
   