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
    getTagsFromItems, defaultTags, isTodo, isProject, isArea, isArrayOfAreas, 
    isArrayOfProjects, isArrayOfTodos, isArray, transformLoadDates, convertDates
} from "./utils";  
import { createStore, combineReducers } from "redux"; 
import { Provider, connect } from "react-redux";
import './assets/fonts/index.css'; 
import { LeftPanel } from './Components/LeftPanel/LeftPanel';
import { MainContainer, Category } from './Components/MainContainer';
import { Project, Area, Todo, removeProject, addProject, removeArea, updateProject, addTodo, updateArea, updateTodo, addArea, removeTodo, removeAreas, removeTodos, removeProjects, updateAreas, updateProjects, addTodos, Calendar } from './database';
import { applicationStateReducer } from './StateReducer';
import { applicationObjectsReducer } from './ObjectsReducer';
import { TodoInputPopup } from './Components/TodoInput/TodoInputPopup';
import { cond, assoc, isNil, not } from 'ramda';
import { TrashPopup } from './Components/Categories/Trash'; 
import { Settings, section, SettingsPopup } from './Components/Settings/settings';
import { SimplePopup } from './Components/SimplePopup';
import { ChangeGroupPopup } from './Components/TodoInput/ChangeGroupPopup';
  
injectTapEventPlugin() 

export let isDev = () => { return true } 

(() => {     
    let app=document.createElement('div'); 
    app.id='application';     
    document.body.appendChild(app);    
})()
 
export interface Store{ 
    searchQuery : string,  
    openChangeGroupPopup : boolean,
    selectedSettingsSection : section, 
    openSettings : boolean,
    showScheduled : boolean,
    showCompleted : boolean, 
    openSearch : boolean, 
    openTodoInputPopup : boolean, 
    openRightClickMenu : any, 
    openRepeatPopup : any, 
    showRepeatPopup : boolean,
    showCalendarEvents : boolean,  
    repeatTodo : Todo,
    repeatPopupX : number,
    repeatPopupY : number,
    showRightClickMenu : boolean, 
    openNewProjectAreaPopup : boolean,
    showProjectMenuPopover : boolean,
    showTrashPopup : boolean,
    selectedCategory : Category,
    selectedTag : string, 
    leftPanelWidth : number,
    closeAllItems : any,
    dragged : string,
    selectedProjectId : string, 
    selectedAreaId : string,
    rightClickedTodoId : string,
    rightClickMenuX : number,
    rightClickMenuY : number,
    windowId : number,
    calendars : Calendar[],
    projects : Project[],
    areas : Area[], 
    todos : Todo[], 
    tags : string[],
    clone? : boolean,
    dispatch? : Function
} 

export let defaultStoreItems : Store = {
    searchQuery : "",
    openChangeGroupPopup : false,  
    selectedSettingsSection : "General",
    openSettings : false,   
    openRepeatPopup : null, 
    showRepeatPopup : false,
    repeatTodo : null, 
    repeatPopupX : 0, 
    repeatPopupY : 0,
    showScheduled : true,
    showCalendarEvents : true,
    showCompleted : false,
    windowId:null, 
    calendars:[],
    selectedCategory : "inbox",
    showTrashPopup : false, 
    openSearch : false, 
    dragged : null, 
    openTodoInputPopup : false, 
    selectedTag : "All",
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
    clone : false,
    todos:[], 
    tags:[...defaultTags]
};      
     


interface AppProps extends Store{
    initialLoad:{type:string,load:any}
}

 

@connect((store,props) =>  ({ ...store, ...props }), attachDispatchToProps)  
export class App extends Component<AppProps,{}>{

    constructor(props){  
        super(props);  
    }


    init = () : void => {
        let {initialLoad,dispatch} = this.props; 
        let {type,load} = initialLoad;

        switch(type){
            case "open":
                dispatch({type:"windowId", load});
                break;
            case "reload":
                dispatch({type:"windowId", load});
                break;    
            case "clone":
                dispatch({type:"newStore", load:assoc("clone", true, load)});
                break;
        }
    }


    initCtrlAltTListener = () => {
        let {dispatch} = this.props;
        ipcRenderer.removeAllListeners("Ctrl+Alt+T"); 
        ipcRenderer.on( 
            "Ctrl+Alt+T", 
            (event) => {
               dispatch({type:"openNewProjectAreaPopup", load:false});
               dispatch({type:"showTrashPopup", load:false});
               dispatch({type:"openTodoInputPopup", load:true});
            }
        ); 
    }


    initActionListener = () => {
        let {dispatch,clone} = this.props;
        ipcRenderer.removeAllListeners("action");  
        ipcRenderer.on(
            "action", 
            (event, action:{type:string, kind:string, load:any}) => { 
    
                if(not(clone)){ return }  
    
                dispatch(assoc("load", transformLoadDates(action.load), action));      
            }
        );  
    } 


    initListeners = () : void => {
         this.initCtrlAltTListener();
         this.initActionListener();
    }


    suspendListeners = () : void => {
        ipcRenderer.removeAllListeners("Ctrl+Alt+T"); 
        ipcRenderer.removeAllListeners("action"); 
    }

     
    componentDidMount(){  
        this.init();
        this.initListeners();
    }   


    componentWillUnmount(){
        this.suspendListeners();  
    }
 
  
    render(){     
        let { initialLoad, clone } = this.props;
        let { type,load } = initialLoad;
        let windowId = null;

        if(type==="open" || type==="reload"){
           windowId=load; 
        }
        
        return wrapMuiThemeLight(
            <div style={{
                backgroundColor:"white",
                width:"100%",
                height:"100%", 
                scroll:"none",  
                zIndex:2001,  
            }}>   
                <div style={{display:"flex", width:"inherit", height:"inherit"}}>  
                    { clone ? null : <LeftPanel {...{} as any}/> }
                    <MainContainer {...{windowId} as any}/>  
                </div>   
                <SettingsPopup {...{} as any} />      
                <TodoInputPopup {...{} as any} />  
                <ChangeGroupPopup {...{} as any} />
                <TrashPopup {...{} as any} />
            </div>           
        );    
    }           
};              
     
  

ipcRenderer.on( 
    'loaded',     
    (event, {type, load} : {type:string,load:any}) => { 
        
        ReactDOM.render(  
            <Provider store={store}>   
                <App {...{initialLoad:{type,load}} as any} />
            </Provider>,
            document.getElementById('application')
        )  
    }
)    
 

let reducer = (reducers) => (state:Store, action) => {

    let newState = undefined;
  
    if(action.type==="newStore"){

       let [todos,projects,areas] = convertDates([
            action.load.todos, 
            action.load.projects, 
            action.load.areas
       ]); 
      
       return {...action.load,todos,projects,areas}
    }
 
    for(let i=0; i<reducers.length; i++){
    
        newState = reducers[i](state, action);

        if(newState){  
           return newState
        }  
    }   
  
    return state  
} 
 
let applicationReducer = reducer([applicationStateReducer, applicationObjectsReducer]); 
  
export let store = createStore(applicationReducer, defaultStoreItems); 
  


  
   