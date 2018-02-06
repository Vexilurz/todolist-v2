import './assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import IconButton from 'material-ui/IconButton'; 
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import { Component } from "react";  
import { ipcRenderer, remote } from 'electron';
import {    
    wrapMuiThemeLight, wrapMuiThemeDark, attachDispatchToProps, 
    defaultTags, isTodo, isProject, isArea, isArrayOfAreas, 
    isArrayOfProjects, isArrayOfTodos, isArray, transformLoadDates, 
    yearFromNow, isString, stringToLength, assert, convertTodoDates, 
    convertProjectDates, convertAreaDates, getFromJsonStorage, timeDifferenceHours, 
    collectSystemInfo, convertDates, checkForUpdates, isNewVersion, nextMidnight,
    oneMinuteBefore, setToJsonStorage, threeDaysLater
} from "./utils";  
import { createStore, combineReducers } from "redux"; 
import { Provider, connect } from "react-redux";
import './assets/fonts/index.css'; 
import { LeftPanel } from './Components/LeftPanel/LeftPanel';
import { MainContainer, Category } from './Components/MainContainer';
import { 
    Project, Area, Todo, removeProject, addProject, removeArea, updateProject, 
    addTodo, updateArea, updateTodo, addArea, removeTodo, removeAreas, removeTodos, 
    removeProjects, updateAreas, updateProjects, addTodos, Calendar 
} from './database';
import { applicationStateReducer } from './StateReducer';
import { applicationObjectsReducer } from './ObjectsReducer';
import { TodoInputPopup } from './Components/TodoInput/TodoInputPopup';
import { cond, assoc, isNil, not, defaultTo, map } from 'ramda';
import { TrashPopup } from './Components/Categories/Trash'; 
import { Settings, section, SettingsPopup } from './Components/Settings/settings';
import { SimplePopup } from './Components/SimplePopup';
import { ChangeGroupPopup } from './Components/TodoInput/ChangeGroupPopup';
import { TopSnackbar } from './Components/Snackbar';
import Analytics from 'electron-ga';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber"; 
import { Subscription } from 'rxjs/Rx';
import { UpdateNotification } from './Components/UpdateNotification';
import { UpdateInfo, UpdateCheckResult } from 'electron-updater';
export const googleAnalytics = new Analytics('UA-113407516-1');
const MockDate = require('mockdate');

let testDate = () => MockDate.set( oneMinuteBefore(nextMidnight()) );

window.onerror = function (msg, url, lineNo, columnNo, error) {
    let string = msg.toLowerCase();
    var message = [
        'Message: ' + msg,
        'URL: ' + url,
        'Line: ' + lineNo,
        'Column: ' + columnNo,
        'Error object: ' + JSON.stringify(error)
    ].join(' - ');
    globalErrorHandler(message);
    return false;
};


export let globalErrorHandler = (error:any) : Promise<void> => {
    let message = '';
    let value = 0;     

    if(isNil(error)){
        message = 'Unknown error occured.';
    }else if(isString(error)){
        message = error;
    }else if(error.response || error.request){
        if(error.response){
           message = [error.response.data,error.response.status,error.response.headers].join(' ');
        }else if(error.request){
           message = [error.request,error.config].join(' ');
        }
    }else if(error.message){
        message = [error.fileName,error.name,error.message,error.stack].join(' ');
    }else{
        try{ message = JSON.stringify(error) }catch(e){ }
    }

    if(error.code){
       value = error.code;
    }else if(error.lineNumber){
       value = error.lineNumber;
    }  
           
    return Promise.all(
        [
            googleAnalytics.send(
                'event',  
                { ec:'Error', ea:stringToLength(message, 400), el:'Error occured', ev:value }
            ),
            googleAnalytics.send(
                'exception',  
                { exd:stringToLength(message, 120), exf:1 } 
            )  
        ]
    )
    .then(() => console.log('Error report submitted'))
};    



injectTapEventPlugin()  

export let isDev = () => { return true }  

(() => {     
    let app=document.createElement('div'); 
    app.id='application';     
    document.body.appendChild(app);     
})()
 
export interface Store{ 
    progress : any,
    showUpdatesNotification : boolean, 
    limit : Date, 
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
    calendars : Calendar[],
    projects : Project[],
    areas : Area[], 
    todos : Todo[], 
    tags : string[],
    clone? : boolean,
    dispatch? : Function
}   

export let defaultStoreItems : Store = {
    progress : null, 
    showUpdatesNotification : false, 
    limit : yearFromNow(),
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

interface AppProps extends Store{};  



@connect((store,props) =>  ({ ...store, ...props }), attachDispatchToProps)  
export class App extends Component<AppProps,{}>{  
    subscriptions:Subscription[]; 
    timeouts:any[]; 

    constructor(props){  
        super(props);  
        this.timeouts = [];
        this.subscriptions = [];
    }

    onError = (error) => globalErrorHandler(error)

    reportStart = ({ arch, cpus, platform, release, type, timeSeconds }) => googleAnalytics.send(   
        'event',   
        {  
           ec:'Start',   
           ea:`
                Application launched ${new Date().toString()}
                System info :
                arch ${arch}; 
                cpus ${cpus.length};
                platform ${platform};
                release ${release};
                type ${type}; 
           `,  
           el:'Application launched', 
           ev:timeSeconds 
        }
    ) 
    .then(() => console.log('Application launched'))
    .catch(err => this.onError(err))

      
    initUpdateTimeout = () => {
        let {dispatch} = this.props;
        let check = () => checkForUpdates()  
                          .then((updateCheckResult:UpdateCheckResult) => { 
                                let {updateInfo} = updateCheckResult;
                                let currentAppVersion = remote.app.getVersion(); 
                                let canUpdate = isNewVersion(currentAppVersion,updateInfo.version);
                                if(canUpdate){ 
                                    dispatch({type:"showUpdatesNotification", load:true}) 
                                }else{
                                    setToJsonStorage(
                                        "nextUpdateCheck",
                                        {nextUpdateCheck:threeDaysLater(new Date())}, 
                                        this.onError 
                                    ) 
                                }
                           }) 
        
        getFromJsonStorage("nextUpdateCheck", this.onError)
        .then((data:any) => new Date(data.nextUpdateCheck))
        .then((nextUpdateCheck:Date) => {  
            if(isNil(nextUpdateCheck)){ check() }
            else{
                let now = new Date();
                let timeMs = nextUpdateCheck.getTime() - now.getTime();
                if(timeMs<=0){ check() }
                else{
                    this.timeouts.push( setTimeout(() => check(), timeMs) )
                }   
            }
        }) 
    }


    initMidnightTimeout = () : void => {
        let {dispatch} = this.props;
        let onNewDayBegins = () => dispatch({type:'update'}); 
        let now = new Date();
        let midnight : Date = nextMidnight();
        let timeMs = midnight.getTime() - now.getTime();
        if(timeMs<=0){ onNewDayBegins() } 
        else{ 
            this.timeouts.push(setTimeout(onNewDayBegins, timeMs));
        } 
    }

 
    componentDidMount(){   
        let timeSeconds = Math.round( new Date().getTime() / 1000 );
        let { arch, cpus, platform, release, type } = collectSystemInfo();
        this.initObservables(); 
        this.initUpdateTimeout();
        this.initMidnightTimeout();
        this.reportStart({arch,cpus,platform,release,type,timeSeconds});
    }    


    initObservables = () => {
        let {dispatch} = this.props;

        let actionListener = Observable
                             .fromEvent(ipcRenderer, "action", (event,action) => action)
                             .map((action) => ({ 
                                ...action,
                                load:map(convertDates)(defaultTo({})(convertDates(action.load))) 
                             }))
                             .subscribe((action) => action.type==="@@redux/INIT" ? null : dispatch(action));   

        
        let errorListener = Observable
                            .fromEvent(ipcRenderer, "error", (event,error) => error)
                            .subscribe((error) => this.onError(error));  

        let progressListener = Observable
                               .fromEvent(ipcRenderer, "progress", (event,progress) => progress)
                               .subscribe((progress) => dispatch({type:"progress",load:progress}));                     

        let ctrlAltTListener = Observable  
                                .fromEvent(ipcRenderer, "Ctrl+Alt+T", (event) => event)
                                .subscribe((event) => {
                                    dispatch({type:"openNewProjectAreaPopup", load:false});
                                    dispatch({type:"showTrashPopup", load:false});
                                    dispatch({type:"openTodoInputPopup", load:true});
                                });  

        this.subscriptions.push(actionListener,errorListener,ctrlAltTListener,progressListener);
    }


    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = [];
        this.timeouts.map(t => clearTimeout(t));
        this.timeouts = [];  
    }
 
  
    render(){     
        let { clone } = this.props;
        
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
                    <MainContainer {...{} as any}/>    
                </div>       
                <UpdateNotification {...{} as any} />    
                <SettingsPopup {...{} as any} />      
                <TodoInputPopup {...{} as any} />  
                <ChangeGroupPopup {...{} as any} /> 
                <TrashPopup {...{} as any} />
            </div>            
        );    
    }           
};   
  

ipcRenderer.once(
    'loaded',     
    (event, clonedStore:Store) => { 
        let defaultStore = defaultStoreItems;
        if(!isNil(clonedStore)){ 
            let {todos,projects,areas} = clonedStore;
            defaultStore = {
                ...clonedStore,
                clone:true,
                todos:todos.map(convertTodoDates),
                projects:projects.map(convertProjectDates), 
                areas:areas.map(convertAreaDates) 
            }
        }   
        ReactDOM.render(   
            <Provider store={createStore(applicationReducer, defaultStore)}>   
                <App {...{} as any} />
            </Provider>,
            document.getElementById('application')
        )     
    }
);    
 

let reducer = (reducers) => (state:Store, action) => {
    for(let i=0; i<reducers.length; i++){
        let newState = reducers[i](state, action);
        if(newState){ return newState }  
    }   
    return state  
}; 
 
let applicationReducer = reducer([applicationStateReducer, applicationObjectsReducer]); 
  

  


  
   