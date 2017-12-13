import './assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, 
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, 
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, groupBy, concat 
} from 'ramda';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { ipcRenderer } from 'electron'; 
import IconButton from 'material-ui/IconButton'; 
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import { Component } from "react"; 
import { wrapMuiThemeLight, wrapMuiThemeDark, attachDispatchToProps, getTagsFromTodos} from "./utils"; 
import { createStore, combineReducers } from "redux"; 
import { Provider, connect } from "react-redux";
import { LeftPanel } from './LeftPanel';
import { MainContainer, Category } from './MainContainer';
import { Todo, Project, Area } from './databaseCalls';
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
     
    selectedProject : Project,
    selectedArea : Area,  

    openNewProjectAreaPopover : boolean,
    showRightClickMenu : boolean,

    rightClickedTodoId : string,
    rightClickMenuX : number,
    rightClickMenuY : number,

    windowId:number,
    
    projects:any[],
    areas:any[],
    events:any[],  

    todos:Todo[],
    tags:string[],
    
    dispatch?:Function,
} 



export let defaultStoreItems : Store = {
    windowId:null, 
    selectedCategory : "inbox",
    selectedTodoId : null,
    selectedTag : "",
    leftPanelWidth : window.innerWidth/3.7,
    selectedProject : null,
    selectedArea : null,  
     
    openNewProjectAreaPopover : false,
    showRightClickMenu : false,

    rightClickedTodoId : null,
    rightClickMenuX : 0,
    rightClickMenuY : 0,
    
    projects:[],
    areas:[],
    events:[], 

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
   
 

let applicationStateReducer = (state:Store, action) => {

    let newState = undefined;

 
    switch(action.type){

        case "windowId":
            newState = {
                ...state,
                windowId:action.load
            }; 
            break;

        case "selectedCategory":
            newState = {
                ...state,
                selectedTag:"", 
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

        case "selectedProject":
            newState = {
                ...state, 
                selectedCategory:"project", 
                selectedProject:action.load
            };    
            break;

        case "selectedArea":    
            newState = {
                ...state, 
                selectedCategory:"area", 
                selectedArea:action.load
            }; 
            break;

    }


    return  newState;
 

}

 



let applicationObjectsReducer = (state:Store, action) => { 
    

    let newState = undefined;


    switch(action.type){


        case "setAllTypes":
            newState = {
                ...state,
                todos:[...action.load.todos],
                projects:[...action.load.projects],
                areas:[...action.load.areas],
                events:[...action.load.events]
            }
            break;
 
 
        case "newTodo":  
            newState = {
                ...state, 
                selectedTodoId:action.load._id,
                todos:[action.load,...state.todos],
                showRightClickMenu:false
            }; 
            break; 
             


        case "newArea":  
            newState = {
                ...state, 
                selectedCategory:"area", 
                openNewProjectAreaPopover:false,
                selectedArea:action.load,
                areas:[action.load,...state.areas]
            };  
            break;  
            


        case "newProject":   
            newState = {
                ...state, 
                selectedCategory:"project", 
                openNewProjectAreaPopover:false, 
                selectedProject:action.load,
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

       ipcRenderer.send("action", action, state.windowId); 
    
    }

 

    return newState; 
   
}     



let applicationReducer = reducer([
    applicationStateReducer,
    applicationObjectsReducer
]); 
   
 
export let store = createStore(applicationReducer, defaultStoreItems); 
  


 
   