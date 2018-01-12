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
    getTagsFromItems, defaultTags, isTodo, isProject, isArea, isArrayOfAreas, isArrayOfProjects, isArrayOfTodos, isArray
} from "./utils";  
import { createStore, combineReducers } from "redux"; 
import { Provider, connect } from "react-redux";
import './assets/fonts/index.css'; 
import { LeftPanel } from './Components/LeftPanel/LeftPanel';
import { MainContainer, Category } from './Components/MainContainer';
import { Project, Area, Todo, removeProject, addProject, removeArea, updateProject, addTodo, updateArea, updateTodo, addArea, removeTodo, removeAreas, removeTodos, removeProjects, updateAreas, updateProjects, addTodos } from './database';
import { applicationStateReducer } from './StateReducer';
import { applicationObjectsReducer } from './ObjectsReducer';
import { TodoInputPopup } from './Components/TodoInput/TodoInputPopup';
import { cond, assoc, isNil, not } from 'ramda';
import { TrashPopup } from './Components/Categories/Trash';
 

injectTapEventPlugin();


export let isDev = () => true; 


(() => {     
    let app=document.createElement('div'); 
    app.id='application';     
    document.body.appendChild(app);    
})();  
 



export let transformLoadDates = (load) : any => {

    let converted = load;

    if(isTodo(load)){
        converted = convertTodoDates(load);
    }else if(isProject(load)){
        converted = convertProjectDates(load);
    }else if(isArea(load)){
        converted = convertAreaDates(load); 
    }else if(isArray(load)){
        if(isArrayOfAreas(load)){
            converted = load.map(convertAreaDates);
        }else if(isArrayOfProjects(load)){
            converted = load.map(convertProjectDates);
        }else if(isArrayOfTodos(load)){
            converted = load.map(convertTodoDates);
        }   
    }    

    if(!isNil(load.todos)){
        if(isArrayOfTodos(load.todos)){
           load.todos = load.todos.map(convertTodoDates);
        } 
    }

    if(!isNil(load.projects)){
        if(isArrayOfProjects(load.projects)){
           load.projects = load.projects.map(convertProjectDates);
        }
    }

    if(!isNil(load.areas)){
        if(isArrayOfAreas(load.areas)){
           load.areas = load.areas.map(convertAreaDates);
        } 
    }
 
    return  converted;  
}




export let convertTodoDates = (t:Todo) : Todo => ({
    ...t, 
    reminder : !t.reminder ? undefined :  
                typeof t.reminder==="string" ? new Date(t.reminder) : 
                t.reminder,

    deadline : !t.deadline ? undefined : 
                typeof t.deadline==="string" ? new Date(t.deadline) : 
                t.deadline,
    
    created : !t.created ? undefined : 
               typeof t.created==="string" ? new Date(t.created) : 
               t.created,
    
    deleted : !t.deleted ? undefined : 
               typeof t.deleted==="string" ? new Date(t.deleted) : 
               t.deleted,
    
    attachedDate : !t.attachedDate ? undefined : 
                    typeof t.attachedDate==="string" ? new Date(t.attachedDate) : 
                    t.attachedDate,
    
    completed : !t.completed ? undefined : 
                typeof t.completed==="string" ? new Date(t.completed) : 
                t.completed
})





export let convertProjectDates = (p:Project) : Project => ({
    ...p,
    created : !p.created ? undefined : 
               typeof p.created==="string" ? new Date(p.created) : 
               p.created,

    deadline : !p.deadline ? undefined : 
                typeof p.deadline==="string" ? new Date(p.deadline) : 
                p.deadline,

    deleted : !p.deleted ? undefined : 
               typeof p.deleted==="string" ? new Date(p.deleted) : 
               p.deleted,

    completed : !p.completed ? undefined : 
                 typeof p.completed==="string" ? new Date(p.completed) : 
                 p.completed  
})





export let convertAreaDates = (a:Area) : Area => ({
    ...a, 
    created : !a.created ? undefined : 
               typeof a.created==="string" ? new Date(a.created) : 
               a.created,

    deleted : !a.deleted ? undefined : 
               typeof a.deleted==="string" ? new Date(a.deleted) : 
               a.deleted,
})






export let convertDates = ([todos, projects, areas]) => [ 
    todos.map(convertTodoDates),
    projects.map(convertProjectDates),
    areas.map(convertAreaDates)     
]  





export let initListeners = (props:AppProps) : void => {
    ipcRenderer.removeAllListeners("action");  
    ipcRenderer.removeAllListeners("Ctrl+Alt+T"); 
      

    ipcRenderer.on(
        "Ctrl+Alt+T", 
        (event) => {
            props.dispatch({type:"showRightClickMenu", load:false});
            props.dispatch({type:"openNewProjectAreaPopup", load:false});
            props.dispatch({type:"showTrashPopup", load:false});

            props.dispatch({type:"openTodoInputPopup", load:true});
        }
    ) 
     

    ipcRenderer.on(
        "action", 
        (event, action:{type:string, kind:string, load:any}) => { 

            if(
                action.type==="setAllTypes" && 
                not(props.clone)
            ){  
                return  
            } 

            props.dispatch(assoc("load", transformLoadDates(action.load), action));      
        }
    )   
}


 
 
 
 
interface AppProps extends Store{
    initialLoad:{type:string,load:any}
}

@connect((store,props) =>  ({ ...store, ...props }), attachDispatchToProps)  
export class App extends Component<AppProps,{}>{

    constructor(props){  
        super(props);   
        initListeners(props);
    }
    
    componentDidMount(){ 
        cond([
            [
                (action:{type:string}) : boolean => "open"===action.type,  
                (action:{type:string, load:string}) : void => { 

                    this.props.dispatch({type:"windowId", load:action.load});
                }   
            ], 
            [
                (action:{type:string}) : boolean => "clone"===action.type,  
                (action:{type:string, load:Store}) : void => { 

                    this.props.dispatch({type:"newStore", load:assoc("clone", true, action.load)});
                } 
            ],   
            [ 
                (action:{type:string}) : boolean => "reload"===action.type,  
                (action:{type:string, load:string}) : void => { 

                    this.props.dispatch({type:"windowId", load:action.load});
                }   
            ]
        ])(this.props.initialLoad)
    }   
 


    render(){     
        let { initialLoad, clone } = this.props;

        let action = initialLoad;
        let windowId = null;

        if(
            action.type==="open" || 
            action.type==="reload"
        ){
           windowId=action.load; 
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
                    {
                        clone ? null : <LeftPanel {...{} as any}  />
                    }
                    <MainContainer {...{windowId} as any} />  
                </div>  
   
                <TodoInputPopup {...{container:window} as any} />
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
);    
  
 

export interface Store{
    showScheduled : boolean,
    showCompleted : boolean,
    openSearch : boolean, 
    openTodoInputPopup : boolean, 
    openRightClickMenu : any, 
    showRightClickMenu : boolean, 
    openNewProjectAreaPopup : boolean,
    showProjectMenuPopover : boolean,
    showTrashPopup : boolean,

    selectedCategory : Category,
    selectedTodoId : string, 
    searched : boolean, 
    selectedTag : string, 
    leftPanelWidth : number,
    closeAllItems : any,
    dragged:string,
    selectedProjectId : string,
    selectedAreaId : string,
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
    showScheduled : true,
    showCompleted : false,
    windowId:null, 
    searched:false, 
    selectedCategory : "inbox",
    showTrashPopup : false, 
    openSearch : false, 
    dragged : null, 
    selectedTodoId : null,
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
  


  
   