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
    convertProjectDates, convertAreaDates, timeDifferenceHours, 
    collectSystemInfo, convertDates, checkForUpdates, isNewVersion, nextMidnight,
    oneMinuteBefore, threeDaysLater, isFunction
} from "./utils";  
import { createStore, combineReducers } from "redux"; 
import { Provider, connect } from "react-redux";
import './assets/fonts/index.css'; 
import { LeftPanel } from './Components/LeftPanel/LeftPanel';
import { MainContainer, Category } from './Components/MainContainer';
import { 
    Project, Area, Todo, removeProject, addProject, removeArea, updateProject, 
    addTodo, updateArea, updateTodo, addArea, removeTodo, removeAreas, removeTodos, 
    removeProjects, updateAreas, updateProjects, addTodos, Calendar, Heading, generateId 
} from './database';
import { applicationStateReducer } from './StateReducer';
import { applicationObjectsReducer } from './ObjectsReducer';
import { cond, assoc, isNil, not, defaultTo, map, isEmpty } from 'ramda';
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
const storage = remote.require('electron-json-storage');
import printJS from 'print-js';  
const MockDate = require('mockdate'); 
let testDate = () => MockDate.set( oneMinuteBefore(nextMidnight()) );
injectTapEventPlugin();  

 

export let isDev = () => { return true };   



(() => {      
    let app=document.createElement('div'); 
    app.id='application';     
    document.body.appendChild(app);     
})(); 



const analytics = (() => {
    const sysInfo = collectSystemInfo();
    return new Analytics(
        'UA-113407516-1',
        {
            appName:"tasklist",
            appVersion:remote.app.getVersion(),
            language:sysInfo.userLanguage,
            userAgent:navigator.userAgent,
            viewport:`${sysInfo.viewportSize.width}x${sysInfo.viewportSize.height}`,
            screenResolution:`${sysInfo.screenResolution.width}x${sysInfo.screenResolution.height}`
        }
    );
})()



export const googleAnalytics = ({
    send:(type:string,load:any) =>
    getConfig()
    .then(
        (config:Config) => {
            if(config.shouldSendStatistics){ analytics.send(type,load) }
        }            
    ) 
});     



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

    if(!isNil(error)){
        if(error.code){ value = error.code; }
        else if(error.lineNumber){ value = error.lineNumber; } 
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



export let getConfig = () : Promise<Config> => {
    return new Promise( 
        resolve => {
            storage.get( 
                "config", 
                (error, data:Config) => {  
                    if(!isNil(error)){ globalErrorHandler(error) }
                    if(isNil(data) || isEmpty(data)){ resolve(defaultConfig) }
                    else{ resolve({...data,firstLaunch:false} ) }
                }
            )   
        }
    )
}; 



export let updateConfig = (dispatch:Function) => 
        (load:any) : Promise<any> => {
            return getConfig()
                    .then( 
                      (config:Config) => {
                        let updated = { ...config, ...load } as Config;

                        return new Promise(
                            resolve => 
                                storage.set(  
                                    "config", 
                                    updated, 
                                    (error) => {
                                        if(!isNil(error)){ globalErrorHandler(error) }
                                        dispatch({type:"updateConfig",load:updated}) 
                                        resolve(updated as Config); 
                                    }
                                )
                        )
                      }
                    )
        }


export const defaultConfig = { 
    nextUpdateCheck:new Date(),
    firstLaunch:true,
    hideHint:false,
    defaultTags,  
    shouldSendStatistics:true,
    showCalendarEvents:true,
    groupTodos:false,
    preserveWindowWidth:true, //when resizing sidebar
    enableShortcutForQuickEntry:true,
    quickEntrySavesTo:"inbox", //inbox today next someday
    moveCompletedItemsToLogbook:"immediately"
}


export interface Config{
    nextUpdateCheck:Date,
    firstLaunch:boolean, 
    defaultTags:string[],
    hideHint:boolean,
    shouldSendStatistics:boolean,
    showCalendarEvents:boolean,
    groupTodos:boolean,
    preserveWindowWidth:boolean, //when resizing sidebar
    enableShortcutForQuickEntry:boolean,
    quickEntrySavesTo:string, //inbox today next someday
    moveCompletedItemsToLogbook, //immediatelly
}


export interface Store extends Config{
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
    clone? : boolean,
    dispatch? : Function
}   


export let defaultStoreItems : Store = {
    ...defaultConfig,
    shouldSendStatistics : true, 
    hideHint : true, 
    progress : null,  
    showUpdatesNotification : false, 
    limit : yearFromNow(),
    searchQuery : "",
    openChangeGroupPopup : false,  
    selectedSettingsSection : "QuickEntry",
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
    todos:[]
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
    .catch(err => this.onError(err));



    initUpdateTimeout = () => {
        let {dispatch, nextUpdateCheck} = this.props;
        let check = () => checkForUpdates()  
                          .then((updateCheckResult:UpdateCheckResult) => { 
                                let {updateInfo} = updateCheckResult;
                                let currentAppVersion = remote.app.getVersion(); 
                                let canUpdate = isNewVersion(currentAppVersion,updateInfo.version);

                                if(canUpdate){ dispatch({type:"showUpdatesNotification", load:true}) }
                                else{ updateConfig(dispatch)({nextUpdateCheck:threeDaysLater(new Date())}) }
                           })    
          
        if(isNil(nextUpdateCheck)){ check() }
        else{
            let now = new Date();
            let next = isString(nextUpdateCheck) ? new Date(nextUpdateCheck) : nextUpdateCheck;
            let timeMs = next.getTime() - now.getTime();

            if(timeMs<=0){ check() }
            else{ this.timeouts.push(setTimeout(() => check(), timeMs)) }   
        }
    }



    componentDidMount(){    
        const sysInfo = collectSystemInfo();
        let timeSeconds = Math.round( new Date().getTime() / 1000 );

        this.initObservables();  
        this.initUpdateTimeout(); 
        this.reportStart({...sysInfo, timeSeconds} as any);
    }    


    initObservables = () => {
        let {dispatch} = this.props;

        let updateInterval = Observable.interval(5000)//.subscribe(() => dispatch({type:'update'}));   

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
                <ChangeGroupPopup {...{} as any} /> 
                <TrashPopup {...{} as any} />
            </div>            
        );    
    }           
};   

   
//render application
ipcRenderer.once(
    'loaded',     
    (event, clonedStore:Store) => { 
        let defaultStore = defaultStoreItems;
        if(!isNil(clonedStore)){ 
            let {todos,projects,areas} = clonedStore;
            defaultStore =  {
                ...clonedStore,
                clone:true, 
                todos:todos.map(convertTodoDates),
                projects:projects.map(convertProjectDates), 
                areas:areas.map(convertAreaDates) 
            }
        }   

        getConfig().then(
            (config) => {
                ReactDOM.render(   
                    <Provider store={createStore(applicationReducer, {...defaultStore, ...config} )}>   
                        <App {...{} as any} />
                    </Provider>,
                    document.getElementById('application')
                ) 
            }
        )
    }
);    
 


let reducer = (reducers) => (state:Store, action) => {
    for(let i=0; i<reducers.length; i++){
        let newState = reducers[i](state, action);
        if(newState){ return newState; }  
    }   
    return state;      
}; 
 


let applicationReducer = reducer([applicationStateReducer, applicationObjectsReducer]); 
  

  


  
   