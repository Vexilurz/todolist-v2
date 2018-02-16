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
    attachDispatchToProps, transformLoadDates, yearFromNow, convertTodoDates, 
    convertProjectDates, convertAreaDates, timeDifferenceHours, 
    convertDates, checkForUpdates, isNewVersion, nextMidnight,
    oneMinuteBefore, threeDaysLater 
} from "./utils/utils";  
import {wrapMuiThemeLight} from './utils/wrapMuiThemeLight'; 
import {
    isTodo, isProject, isArea, isArrayOfAreas, 
    isArrayOfProjects, isArrayOfTodos, isArray, isString, isFunction
} from './utils/isSomething';
import { createStore, combineReducers } from "redux"; 
import { Provider, connect } from "react-redux";
import './assets/fonts/index.css'; 
import { LeftPanel } from './Components/LeftPanel/LeftPanel';
import { MainContainer, Category } from './Components/MainContainer';
import { 
    Project, Area, Todo, removeProject, addProject, removeArea, updateProject, 
    addTodo, updateArea, updateTodo, addArea, removeTodo, removeAreas, removeTodos, 
    removeProjects, updateAreas, updateProjects, addTodos, Calendar, Heading, getDatabaseObjects,
} from './database';
import { applicationStateReducer } from './StateReducer';
import { applicationObjectsReducer } from './ObjectsReducer';
import { cond, assoc, isNil, not, defaultTo, map, isEmpty } from 'ramda';
import { TrashPopup } from './Components/Categories/Trash'; 
import { Settings, section, SettingsPopup } from './Components/Settings/settings'; 
import { SimplePopup } from './Components/SimplePopup';
import { ChangeGroupPopup } from './Components/TodoInput/ChangeGroupPopup';
import { TopSnackbar } from './Components/Snackbar';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber"; 
import { Subscription } from 'rxjs/Rx';
import { UpdateNotification } from './Components/UpdateNotification';
import { UpdateInfo, UpdateCheckResult } from 'electron-updater';
import printJS from 'print-js';  
import { googleAnalytics } from './analytics';
import { globalErrorHandler } from './utils/globalErrorHandler';
import { Config, defaultConfig, updateConfig, getConfig } from './utils/config';
import { collectSystemInfo } from './utils/collectSystemInfo';
import { writeJsonFile } from './utils/jsonFile';
import { getMachineIdSync } from './utils/userid';
const MockDate = require('mockdate'); 
const os = remote.require('os'); 
const path = require('path');
const storage = remote.require('electron-json-storage');
let testDate = () => MockDate.set( oneMinuteBefore(nextMidnight()) );
injectTapEventPlugin();  


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

@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)  
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

                                if(canUpdate){ 
                                    dispatch({type:"showUpdatesNotification", load:true}) 
                                }else{ 
                                    updateConfig(storage,dispatch)({
                                        nextUpdateCheck:threeDaysLater(new Date())
                                    }) 
                                }
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

        let updateInterval = Observable.interval(10000).subscribe(() => dispatch({type:'update'}));   

        let backupInterval = Observable.interval(60000).subscribe(() => {
             let id = getMachineIdSync();   
             let to = path.resolve(os.homedir(), `${id}.json`);
             
             getDatabaseObjects(this.onError,1000000)
             .then(([calendars,projects,areas,todos]) => 
                writeJsonFile(
                    { database : { todos, projects, areas, calendars } },
                    to 
                )
                .then((err) => ({err,to}))
             )
             .then(({err,to}) => console.log(`Backup saved to ${to}.`));
        });   
        

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

        this.subscriptions.push(
            actionListener,
            errorListener,
            ctrlAltTListener,
            progressListener,
            updateInterval,
            backupInterval
        );
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
   
        let app=document.createElement('div'); 
        app.id='application';     
        document.body.appendChild(app);     
   
        getConfig(storage) 
        .then( 
            (config) => {
                ReactDOM.render(   
                    <Provider store={createStore(applicationReducer, {...defaultStore, ...config})}>   
                        <App {...{} as any}/>
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
  

  


  
   