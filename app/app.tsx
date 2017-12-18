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
    getTagsFromTodos, replace, remove
} from "./utils"; 
import { createStore, combineReducers } from "redux"; 
import { Provider, connect } from "react-redux";
import './assets/fonts/index.css';
import { LeftPanel } from './Components/LeftPanel';
import { MainContainer, Category } from './Components/MainContainer';
import { Project, Area, Todo } from './database';
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
    selectedTag : string,
    leftPanelWidth : number,
    closeAllItems : any,
    openRightClickMenu : any, 
    selectedProjectId : string,
    selectedAreaId : string,
    showProjectMenuPopover : boolean,
    openNewProjectAreaPopover : boolean,
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

    selectedTodoId : null,

    selectedTag : "",

    leftPanelWidth : window.innerWidth/3.7,
     
    selectedProjectId : null,

    selectedAreaId : null,
 
    showProjectMenuPopover : false,

    closeAllItems : undefined,

    openRightClickMenu : undefined,
     
    openNewProjectAreaPopover : false,

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
                selectedCategory:action.load,
                openNewProjectAreaPopover:false 
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


        case "openNewProjectAreaPopover":
            newState = {
                ...state,
                openNewProjectAreaPopover:action.load
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
                selectedTodoId : action.load
            }; 
            break;


        case "closeAllItems":
            newState = {
                ...state,
                openNewProjectAreaPopover : false,
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
                selectedProjectId:action.load
            };    
            break;
        

        case "selectedAreaId": 
            newState = { 
                ...state, 
                selectedCategory:"area", 
                selectedTag:"All",
                selectedAreaId:action.load
            };    
            break;


    }


    return  newState;
 

}

 



let applicationObjectsReducer = (state:Store, action) => { 
    

    let newState = undefined;
    let idx = -1; 
    let replacement = [];
  

    switch(action.type){

        //load : {projectId,todoId}    
        case "attachTodoToProject":
            idx = state.projects.findIndex( (p:Project) => p._id===action.load.projectId );
 
            if(idx===-1) 
               return;  
               //throw new Error(`Project does not exist ${action.load.projectId}. attachTodoToProject.`);

            let project = {...state.projects[idx]};

            project.layout = [action.load.todoId, ...project.layout];
 
            newState = {
                ...state,
                projects:replace(state.projects,project,idx) 
            }
            break;


        case "setAllTypes":
            newState = {
                ...state,
                todos:[...action.load.todos],
                projects:[...action.load.projects],
                areas:[...action.load.areas],
                events:[...action.load.events],
                tags:getTagsFromTodos(action.load.todos),
            }
            break; 
 
 
 
        case "newTodo":  
            newState = {
                ...state, 
                selectedTodoId:action.load._id,
                selectedTag:"All",
                todos:[action.load,...state.todos],
                showRightClickMenu:false
            }; 
            break; 
        
            
        case "swapTodos":
            let todos = [...state.todos];
            let temp = null;
            let from : number = todos.findIndex( (t:Todo) => t._id===action.load.fromId );
            let to : number = todos.findIndex( (t:Todo) => t._id===action.load.toId );

            if(from===-1 || to===-1)
                throw new Error("Attempt to swap non existing objects. swapTodos");

            temp = todos[from];   
            todos[from] = todos[to];
            todos[to] = temp; 

            break;
        
        


        case "updateProject":  
            idx = state.projects.findIndex((p:Project) => action.load._id===p._id);
            
            if(idx===-1){
               throw new Error("Attempt to update non existing object. updateProject.")
            }
 
            newState = { 
                ...state, 
                selectedProjectId:action.load._id,
                showProjectMenuPopover:false,
                projects:replace(state.projects,action.load,idx)
            }; 
            break;   
 


        case "updateTodo":

            idx = state.todos.findIndex((t:Todo) => action.load._id===t._id);
            
            if(idx===-1){
                throw new Error("Attempt to update non existing object. updateTodo.")
            }

            replacement = replace(state.todos,action.load,idx);

            newState = {
                ...state, 
                selectedTodoId:action.load._id,
                selectedTag:"All",
                tags:getTagsFromTodos(replacement),
                todos:replace(state.todos,action.load,idx),
                showRightClickMenu:false
            }; 
            break; 




        case "removeTodo":
        
            idx = state.todos.findIndex((t:Todo) => action.load===t._id);
            
            if(idx===-1){

                throw new Error("Attempt to remove non existing object. updateTodo.")

            }

            replacement = remove(state.todos,idx);
    
            newState = {
                ...state, 
                selectedTodoId:action.load._id,
                selectedTag:"All", 
                todos:remove(state.todos,idx),
                tags:getTagsFromTodos(replacement),
                showRightClickMenu:false
            }; 
            break; 



        case "newArea":   
            newState = { 
                ...state, 
                selectedCategory:"area", 
                selectedTag:"All",
                openNewProjectAreaPopover:false,
                selectedAreaId:action.load._id, 
                areas:[action.load,...state.areas]
            };  
            break;  



        case "newProject":   
            newState = {
                ...state,  
                selectedCategory:"project", 
                selectedTag:"All",
                openNewProjectAreaPopover:false, 
                selectedProjectId:action.load._id,
                projects:[action.load,...state.projects],
            };   
            break;
        


        case "newEvent":  
            newState = {
                ...state, 
                events:[action.load,...state.events]
            }; 
            break;              



        case "projects":  
            newState = {
                ...state,  
                projects:[...action.load],
                showProjectMenuPopover:false,
                showRightClickMenu:false
            }; 
            break; 
           
            


        case "todos": 
            newState = { 
                ...state, 
                todos:[...action.load],
                showRightClickMenu:false, 
                tags:getTagsFromTodos(action.load)
            }; 
            break;    


              
        case "areas": 
            newState = {
                ...state, 
                areas:[...action.load],
                showRightClickMenu:false
            };     
            break;
          


        case "events":  
            newState = {
                ...state, 
                events:[...action.load],
                showRightClickMenu:false
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
  


 
   