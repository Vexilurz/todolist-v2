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
    browserWindowID : string;

    constructor(props){  
        super(props);   
    }
 
    componentDidMount(){
        if(!isNil(this.props.clonedStore)){
            this.props.dispatch({
                type:"newStore",
                load:this.props.clonedStore
            })
        }
  
        if(!isNil(this.props.id)){
            this.browserWindowID = this.props.id; 
        }
    }  

    render(){     

        return wrapMuiThemeLight(
            <div style={{
                backgroundColor:"white",
                width:"100%",
                height:"100%",
                borderRadius:"1%", 
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
                                height:"8%" 
                            }}  
                    >   
                    </div> 
 
                    <LeftPanel {...{windowId:this.browserWindowID} as any}  /> 

                    <MainContainer {...{windowId:this.browserWindowID} as any} />  
 
                </div> 
            </div>         
        );   

    }            
            
};           
  
 

ipcRenderer.on( 
    'loaded',     
    (event, clonedStore:Store, id:string) => { 
        ReactDOM.render( 
            <Provider store={store}><App clonedStore={clonedStore} id={id}/></Provider>,
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

    
    projects:any[],
    areas:any[],
    events:any[],  

    todos:Todo[],
    tags:string[],
    
    dispatch?:Function,
    windowId?:string 
} 



export let defaultStoreItems : Store = {
    selectedCategory : "inbox",
    selectedTodoId : null,
    selectedTag : "All",
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
        "All", "Work", "Home",
        "Priority", "High", "Medium",
        "Low"
    ]
};    
   
 
   
let reducer = (state:Store, action) => { 
    
    switch(action.type){

        case "newStore":
            return {...action.load}; 

        case "selectedCategory":
            return {
                ...state,
                selectedTag:"All", 
                selectedCategory:action.load,
                openNewProjectAreaPopover:false 
            };

 
        case "leftPanelWidth":
            return {
                ...state,
                leftPanelWidth:action.load
            };

             
        case "selectedTag":  
            return {
                ...state,
                selectedTag:action.load
            };


        case "openNewProjectAreaPopover":
            return {
                ...state,
                openNewProjectAreaPopover:action.load
            }; 


        case "openRightClickMenu":
            return {
                ...state,
                showRightClickMenu : action.load.showRightClickMenu,
                rightClickedTodoId : action.load.rightClickedTodoId,
                rightClickMenuX : action.load.rightClickMenuX,
                rightClickMenuY : action.load.rightClickMenuY
            };  
 

        case "showRightClickMenu":
            return {
                ...state,
                showRightClickMenu : action.load
            };


        case "selectedTodoId":
            return {
                ...state,
                selectedTodoId : action.load
            }; 


        case "closeAllItems":
            return {
                ...state,
                openNewProjectAreaPopover : false,
                showRightClickMenu : false,
                selectedTodoId : null
            };  
 

        case "rightClickedTodoId" :
            return {
                ...state,
                rightClickedTodoId : action.load
            }; 

  
        case "rightClickMenuX" :
            return {
                ...state,
                rightClickMenuX : action.load
            }; 
            
  
        case "rightClickMenuY" :
            return {
                ...state,
                rightClickMenuY : action.load
            }; 

 
        case "todos": 
            return { 
                ...state, 
                todos:[...action.load],
                showRightClickMenu:false, 
                tags:getTagsFromTodos(action.load)
            };  
 
        case "newTodo":  
            return {
                ...state, 
                selectedTodoId:action.load._id,
                todos:[action.load,...state.todos],
                showRightClickMenu:false
            };  
             



             
        case "newArea":  
            return {
                ...state, 
                selectedCategory:"area", 
                openNewProjectAreaPopover:false,
                selectedArea:action.load,
                areas:[action.load,...state.areas]
            };    
            

        case "newProject":   
            return {
                ...state, 
                selectedCategory:"project", 
                openNewProjectAreaPopover:false, 
                selectedProject:action.load,
                projects:[action.load,...state.projects],
            };   
        





        case "newEvent":  
            return {
                ...state, 
                events:[action.load,...state.events]
            };               


        case "selectedProject":
            return {
                ...state, 
                selectedProject:action.load
            };    

        case "selectedArea":    
            return {
                ...state, 
                selectedArea:action.load
            };    


        case "projects": 
            return {
                ...state, 
                projects:[...action.load],
                showRightClickMenu:false
            }; 
 
              
        case "areas": 
            return {
                ...state, 
                areas:[...action.load],
                showRightClickMenu:false
            };     
          

        case "events":  
            return {
                ...state, 
                events:[...action.load],
                showRightClickMenu:false
            };       
            
    } 
    
    return state; 
   
};      
  
   
export let store = createStore(reducer, defaultStoreItems); 
  



   