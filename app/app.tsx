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
    convertDates, checkForUpdates, nextMidnight,
    oneMinuteBefore, threeDaysLater, findWindowByTitle, keyFromDate, isNotNil, 
    nDaysFromNow, monthFromDate, measureTime, log  
} from "./utils/utils";  
import {wrapMuiThemeLight} from './utils/wrapMuiThemeLight'; 
import {isNewVersion} from './utils/isNewVersion';
import {
    isTodo, isProject, isArea, isArrayOfAreas, 
    isArrayOfProjects, isArrayOfTodos, isArray, 
    isString, isFunction, isDate
} from './utils/isSomething';
import { createStore } from "redux"; 
import { Provider, connect } from "react-redux";
import './assets/fonts/index.css'; 
import { LeftPanel } from './Components/LeftPanel/LeftPanel';
import { MainContainer, Category, filter } from './Components/MainContainer';
import { 
    Project, Area, Todo, removeProject, addProject, removeArea, updateProject, 
    addTodo, updateArea, updateTodo, addArea, removeTodo, removeAreas, removeTodos, 
    removeProjects, updateAreas, updateProjects, addTodos, Calendar, Heading, 
    getDatabaseObjects
} from './database';
import { applicationStateReducer } from './StateReducer';
import { applicationObjectsReducer } from './ObjectsReducer';
import { cond, assoc, isNil, not, defaultTo, map, isEmpty, compose, contains, prop, equals, identity, all } from 'ramda';
import { TrashPopup } from './Components/Categories/Trash'; 
import { Settings, section, SettingsPopup, LicensePopup } from './Components/Settings/settings'; 
import { SimplePopup } from './Components/SimplePopup';
import { ChangeGroupPopup } from './Components/TodoInput/ChangeGroupPopup';
import { TopSnackbar } from './Components/Snackbar';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber"; 
import { Subscription } from 'rxjs/Rx';
import { UpdateNotification } from './Components/UpdateNotification';
import { UpdateInfo, UpdateCheckResult } from 'electron-updater';
import { googleAnalytics } from './analytics';
import { globalErrorHandler } from './utils/globalErrorHandler';
import { Config, defaultConfig, updateConfig, getConfig } from './utils/config';
import { collectSystemInfo } from './utils/collectSystemInfo';
import { writeJsonFile } from './utils/jsonFile';
import Clear from 'material-ui/svg-icons/content/clear';
import { getMachineIdSync } from './utils/userid';
import { assert } from './utils/assert';
import { value,text } from './utils/text';
import { setCallTimeout } from './utils/setCallTimeout';
import { isDev } from './utils/isDev';
const MockDate = require('mockdate');  
const os = remote.require('os'); 
const fs = remote.require('fs'); 
const path = require('path');
let testDate = () => MockDate.set( oneMinuteBefore(nextMidnight()) );
injectTapEventPlugin();  


window.onerror = function (msg, url, lineNo, columnNo, error) {
    let string = msg.toLowerCase();
    let message = [ 
        'Message:' + msg, 
        'URL:' + url,
        'Line:' + lineNo,
        'Column:' + columnNo,
        'Error object:' + JSON.stringify(error)
    ].join(' - ');  

    globalErrorHandler(message);

    if(isDev()){ 
       return false; 
    }

    return true;
}; 

 
export interface Store extends Config{
    showLicense : boolean,
    progress : any,
    scrolledTodo : Todo,
    selectedTodo : Todo, 
    showUpdatesNotification : boolean, 
    scheduledReminders : number[],
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
    showLicense : false, 
    selectedTodo : null, 
    scrolledTodo : null,
    shouldSendStatistics : true,  
    hideHint : true,  
    progress : null,  
    scheduledReminders : [],  
    showUpdatesNotification : false, 
    limit:nDaysFromNow(50),//monthFromDate(new Date()), 
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


interface AppProps {
    clone:boolean,  
    dispatch:Function,
    nextUpdateCheck:Date
} // extends Store{};  
@connect(
    (store,props) => ({clone:store.clone, nextUpdateCheck:store.nextUpdateCheck}), 
    attachDispatchToProps,
    null,
    {
        areStatesEqual: (nextStore:Store, prevStore:Store) => {
            return all(
                identity, 
                [
                    nextStore.clone===prevStore.clone,
                    equals(nextStore.nextUpdateCheck,prevStore.nextUpdateCheck)
                ]
            );
        }
    }
)  
export class App extends Component<AppProps,{}>{  
    subscriptions:Subscription[]; 
    timeouts:any[]; 

    constructor(props){  
        super(props);  
        this.timeouts = [];
        this.subscriptions = [];
    }


    onError = (error) => globalErrorHandler(error);


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
                                   updateConfig(dispatch)({nextUpdateCheck:threeDaysLater(new Date())}) 
                                }
                           })    
          
        if(isNil(nextUpdateCheck)){ check() }
        else{
            let next = isString(nextUpdateCheck) ? new Date(nextUpdateCheck) : nextUpdateCheck;
            this.timeouts.push(setCallTimeout(() => check(), next ));
        }
    };


    componentDidMount(){    
        const sysInfo = collectSystemInfo();
        let timeSeconds = Math.round( new Date().getTime() / 1000 );
        
        this.initObservables();  
        this.initUpdateTimeout(); 
        this.reportStart({...sysInfo, timeSeconds} as any);
    }    
    
 
    initObservables = () => {  
        let {dispatch} = this.props;
        let minute = 1000 * 60;  

        this.subscriptions.push(
            Observable.interval(2*minute).subscribe((v) => dispatch({type:'update'})), 

            Observable.interval(5*minute).subscribe(() => { 
                let target = path.resolve(os.homedir(), "tasklist");

                if(not(fs.existsSync(target))){ fs.mkdirSync(target); }

                let to = path.resolve(target, `db_backup_${keyFromDate(new Date())}.json`);
                 
                getDatabaseObjects(this.onError,1000000)
                .then(([calendars,projects,areas,todos]) => 
                    writeJsonFile(
                        { database : { todos, projects, areas, calendars } },
                        to 
                    )  
                    .then((err) => ({err,to}))
                )
            }),  


            Observable
            .fromEvent(ipcRenderer,'openTodo', (event,todo) => todo)
            .subscribe((todo) => {
                let window = remote.BrowserWindow.getAllWindows().find(w => w.id===1);
                if(isNotNil(window)){ 
                   window.show();
                   window.focus();
                }
                dispatch({type:"selectedCategory",load:"inbox"});
                dispatch({type:"scrolledTodo",load:todo}); 
                dispatch({type:"selectedCategory",load:"today"});
            }), 


            Observable  
            .fromEvent(ipcRenderer, "action", (event,action) => action)
            .map((action) => ({ 
                ...action,
                load:compose(
                    map(convertDates),
                    defaultTo({}),
                    convertDates
                )(action.load)
            }))
            .subscribe((action) => action.type==="@@redux/INIT" ? null : dispatch(action)),  


            Observable 
            .fromEvent(ipcRenderer, "error", (event,error) => error)    
            .subscribe((error) => this.onError(error)),


            Observable
            .fromEvent(ipcRenderer, "progress", (event,progress) => progress)
            .subscribe((progress) => dispatch({type:"progress",load:progress})),  


            Observable  
            .fromEvent(ipcRenderer, "Ctrl+Alt+T", (event) => event)
            .subscribe((event) => {
                dispatch({type:"openNewProjectAreaPopup", load:false});
                dispatch({type:"showTrashPopup", load:false}); 
                dispatch({type:"openTodoInputPopup", load:true});
            })
        );
    };


    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = [];
        this.timeouts.map(t => clearTimeout(t));
        this.timeouts = [];  
    }
    
 
    render(){     
        let { clone } = this.props;


        return wrapMuiThemeLight( 
            <div style={{backgroundColor:"white",width:"100%",height:"100%",scroll:"none",zIndex:2001}}>    
                <div style={{display:"flex",width:"inherit",height:"inherit"}}>  

                    { clone ? null : <LeftPanel {...{} as any}/> }

                    <MainContainer {...{} as any}/>    

                </div>       

                <UpdateNotification {...{} as any} />  

                <SettingsPopup {...{} as any} />   

                <ChangeGroupPopup {...{} as any} /> 

                <TrashPopup {...{} as any} />

                <LicensePopup {...{} as any} />
            </div>  
        );  
    }           
};    

   
//render application
ipcRenderer.once(
    'loaded',     
    (event, clonedStore:Store) => { 
        let defaultStore = defaultStoreItems;
        if(not(isNil(clonedStore))){ 
            let {todos,projects,areas} = clonedStore;
            defaultStore={
                ...clonedStore,
                clone:true, 
                todos:todos.map(convertTodoDates),
                projects:projects.map(convertProjectDates), 
                areas:areas.map(convertAreaDates) 
            };
        }   
   
        let app=document.createElement('div'); 
        app.id='application';     
        document.body.appendChild(app);     
   
        getConfig() 
        .then((config) => 
            ReactDOM.render(   
                <Provider store={createStore(applicationReducer, {...defaultStore, ...config})}>   
                    <App {...{} as any}/>
                </Provider>,
                document.getElementById('application')
            ) 
        );
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
  

  


  
   