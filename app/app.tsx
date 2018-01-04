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
    getTagsFromItems, defaultTags
} from "./utils";  
import { createStore, combineReducers } from "redux"; 
import { Provider, connect } from "react-redux";
import './assets/fonts/index.css'; 
import { LeftPanel } from './Components/LeftPanel/LeftPanel';
import { MainContainer, Category, convertDates } from './Components/MainContainer';
import { Project, Area, Todo, removeProject, generateId, addProject, removeArea, updateProject, addTodo, updateArea, updateTodo, addArea, removeTodo, removeAreas, removeTodos, removeProjects, updateAreas, updateProjects, addTodos } from './database';
import { applicationStateReducer } from './StateReducer';
import { applicationObjectsReducer } from './ObjectsReducer';
import { TodoInputPopup } from './Components/TodoInput/TodoInputPopup';
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
                 
                    <LeftPanel {...{} as any}  /> 

                    <MainContainer {...{} as any} />  
 
                </div> 
 
                <TodoInputPopup {...{} as any} />
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
    searched : boolean, 
    selectedTag : string, 
    leftPanelWidth : number,
    currentleftPanelWidth : number,
    closeAllItems : any,
    openRightClickMenu : any, 
    dragged:string,
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
    todos:Todo[],
    tags:string[],
    clone?:boolean,
    dispatch?:Function
} 

   

export let defaultStoreItems : Store = {
    windowId:null, 

    searched:false, 
     
    selectedCategory : "inbox",

    openSearch : false, 

    dragged : null, 

    selectedTodoId : null,
 
    selectedTag : "All",

    leftPanelWidth : window.innerWidth/3.7,
 
    currentleftPanelWidth : window.innerWidth/3.7,
    
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

    clone : false,

    todos:[], 
 
    tags:[...defaultTags]
};    
    
 

let reducer = (reducers) => (state:Store, action) => {

    let newState = undefined;
  
    if(action.type==="newStore"){

       let [todos,projects,areas] = convertDates([
            action.load.todos, 
            action.load.projects, 
            action.load.areas
       ]); 
          
       return {...action.load,todos,projects,areas}; 
    }
 
    for(let i=0; i<reducers.length; i++){
    
        newState = reducers[i](state, action);

        if(newState)
           return newState; 
    } 
  
    return state; 
};
 


let applicationReducer = reducer([
    applicationStateReducer,
    applicationObjectsReducer
]); 
  

 
export let store = createStore(applicationReducer, defaultStoreItems); 
  


 
   