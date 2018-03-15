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
import { ipcRenderer } from 'electron';
import {    
    attachDispatchToProps, transformLoadDates, yearFromNow, convertTodoDates, 
    convertProjectDates, convertAreaDates, timeDifferenceHours, 
    convertDates, checkForUpdates, nextMidnight,
    oneMinuteBefore, threeDaysLater, keyFromDate, isNotNil, 
    nDaysFromNow, monthFromDate, measureTime, log, initDate  
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
import { cond, assoc, isNil, not, defaultTo, map, isEmpty, compose, contains, prop, equals, identity, all, when, evolve } from 'ramda';
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
import { getConfig } from './utils/config';
import { collectSystemInfo } from './utils/collectSystemInfo';
import Clear from 'material-ui/svg-icons/content/clear';
import { getMachineIdSync } from './utils/userid';
import { assert } from './utils/assert';
import { value,text } from './utils/text';
import { setCallTimeout } from './utils/setCallTimeout';
import { isDev } from './utils/isDev';
import { convertEventDate } from './Components/Calendar';
import { defaultTags } from './utils/defaultTags';
const MockDate = require('mockdate');  
let testDate = () => MockDate.set( oneMinuteBefore(nextMidnight()) );
injectTapEventPlugin();  

interface Config{
    nextUpdateCheck:Date,
    firstLaunch:boolean, 
    defaultTags:string[],
    hideHint:boolean,
    shouldSendStatistics:boolean,
    showCalendarEvents:boolean,
    disableReminder:boolean,
    groupTodos:boolean,
    preserveWindowWidth:boolean, //when resizing sidebar
    enableShortcutForQuickEntry:boolean,
    quickEntrySavesTo:string, //inbox today next someday
    moveCompletedItemsToLogbook, //immediatelly
};


const defaultConfig : Config = { 
    nextUpdateCheck:new Date(),
    firstLaunch:true,
    hideHint:false,
    defaultTags:defaultTags,  
    shouldSendStatistics:true,
    showCalendarEvents:true,
    groupTodos:false,
    preserveWindowWidth:true, //when resizing sidebar
    enableShortcutForQuickEntry:true,
    disableReminder:false,
    quickEntrySavesTo:"inbox", //inbox today next someday
    moveCompletedItemsToLogbook:"immediately"
};
 
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
    id? : number,
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

 
interface AppProps{clone:boolean} 
export class App extends Component<AppProps,{}>{  

    constructor(props){  
        super(props);  
    }

    

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
    .catch(err => globalErrorHandler(err));

    

    componentDidMount(){    
        collectSystemInfo()
        .then( 
            info => {
                let timeSeconds = Math.round( new Date().getTime() / 1000 );
                this.reportStart({...info, timeSeconds} as any);
            }
        );
    }    
    

 
    render(){     

        return <div style={{backgroundColor:"white",width:"100%",height:"100%",scroll:"none",zIndex:2001}}>  

            <div style={{display:"flex",width:"inherit",height:"inherit"}}>

                { this.props.clone ? null : <LeftPanel {...{} as any}/> }

                <MainContainer {...{} as any}/>    

            </div> 

            <TrashPopup {...{} as any} />

            <ChangeGroupPopup {...{} as any} />

            { this.props.clone ? null : <UpdateNotification {...{} as any} />}

            { this.props.clone ? null : <SettingsPopup {...{} as any} />}

            { this.props.clone ? null : <LicensePopup {...{} as any} />}

        </div>  
    }           
};    


   
//render application
ipcRenderer.once(
    'loaded',      
    (event, clonedStore:Store, id:number) => { 
        let app=document.createElement('div'); 
        app.id='application';     
        document.body.appendChild(app);   

        let defaultStore = {...defaultStoreItems};

        if(isNotNil(clonedStore)){ 
            let {todos,projects,areas,calendars,limit} = clonedStore;

            defaultStore={
                ...clonedStore,
                limit:initDate(limit),
                clone:true, 
                todos:map(convertTodoDates, todos),
                projects:map(convertProjectDates, projects), 
                areas:map(convertAreaDates, areas), 
                calendars:map(
                    evolve({ events:map(convertEventDate) }),
                    calendars
                )
            };
        }   
   
        getConfig() 
        .then(
            config => {
                let {nextUpdateCheck} = config;
                let data = {
                    ...defaultStore,
                    ...config,
                    nextUpdateCheck:initDate(nextUpdateCheck),
                    id
                };
                let store = createStore(applicationReducer,data);

                assert(isDate(data.nextUpdateCheck),`nextUpdateCheck is not of type Date`);

                ReactDOM.render(   
                    <Provider store={store}>    
                        {wrapMuiThemeLight(<App clone={data.clone}/>)}
                    </Provider>,
                    document.getElementById('application')
                ) 
            }
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
  

  


  
   