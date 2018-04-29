import './assets/styles.css';  
import './assets/fonts/index.css'; 
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react";  
import { ipcRenderer } from 'electron';
import {    
    attachDispatchToProps, convertTodoDates, 
    convertProjectDates, convertAreaDates, 
    oneMinuteBefore, nDaysFromNow, initDate, byDeleted, 
    byNotDeleted, byCompleted, byNotCompleted, 
    byCategory, isDeadlineTodayOrPast, 
    isTodayOrPast, byScheduled, typeEquals, log, measureTime, measureTimePromise 
} from "./utils/utils";  
import { wrapMuiThemeLight } from './utils/wrapMuiThemeLight'; 
import { isString, isDate, isNumber, isNotNil } from './utils/isSomething';
import { createStore } from "redux"; 
import { Provider, connect } from "react-redux";
import { LeftPanel } from './Components/LeftPanel/LeftPanel';
import { MainContainer } from './Components/MainContainer';
import { filter } from 'lodash';
import { addTodos, todos_db } from './database'; 
import { Project, Area, Category, Todo, Calendar, Config, Store, action, Indicators, Cookie } from './types';
import { applicationStateReducer } from './StateReducer'; 
import { applicationObjectsReducer } from './ObjectsReducer';
import { 
    isNil, not, map, compose, contains, prop, when, evolve, isEmpty,
    ifElse, applyTo, flatten, reject, assoc, range, toLower, all, identity 
} from 'ramda';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { TrashPopup } from './Components/Categories/Trash'; 
import { ChangeGroupPopup } from './Components/TodoInput/ChangeGroupPopup';
import { UpdateNotification } from './Components/UpdateNotification';
import { googleAnalytics } from './analytics';
import { globalErrorHandler } from './utils/globalErrorHandler';
import { getConfig } from './utils/config';
import { collectSystemInfo } from './utils/collectSystemInfo';
import { assert } from './utils/assert';
import { isDev } from './utils/isDev';
import { convertEventDate } from './Components/Calendar';
import { SettingsPopup } from './Components/settings/SettingsPopup';
import { LicensePopup } from './Components/settings/LicensePopup';
import { refreshReminders } from './utils/reminderUtils';
import { uppercase } from './utils/uppercase';
import { getFilters } from './utils/getFilters';
import { generateAmounts } from './utils/generateAmounts';
import { defaultStoreItems } from './defaultStoreItems'; 
import { checkAuthenticated } from './utils/checkAuthenticated';



window.onerror = function(msg:any, url, lineNo, columnNo, error){
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


 
interface AppProps extends Store{}
interface AppState{
    indicators : { [key:string]:{active:number,completed:number,deleted:number}; },
    amounts : { 
        inbox:number,
        today:number,
        hot:number,
        next:number,
        someday:number,
        logbook:number,
        trash:number
    }
}
@connect((store,props) => store, attachDispatchToProps)   
export class App extends Component<AppProps,AppState>{ 
    generateIndicatorsWorker:any;
    pouchSyncWorker:any;
    syncObservableSubscription:any;

    constructor(props){  
        super(props); 

        this.generateIndicatorsWorker = null;

        this.pouchSyncWorker = null;
        this.syncObservableSubscription = null;

        let amounts = this.getAmounts(this.props);
        this.state = { amounts, indicators:{} };
    };

    

    componentDidMount(){    
        this.setInitialTitle();

        this.generateIndicatorsWorker = new Worker('generateIndicators.js');
        this.pouchSyncWorker = new Worker('pouchSync.js');
        
        collectSystemInfo().then( info => this.reportStart({...info} as any) );
    }; 


    //cleanup 
    componentWillUnmount(){
        this.suspendSyncObservable();
      
        this.pouchSyncWorker.terminate();
        this.pouchSyncWorker = null;
    
        this.generateIndicatorsWorker.terminate();
        this.generateIndicatorsWorker = null;
    };



    setInitialTitle = () => ipcRenderer.send(
        'setWindowTitle', 
        `tasklist - ${uppercase(this.props.selectedCategory)}`, 
        this.props.id
    );



    cloneWindow = () => {
        ipcRenderer.send("store", {...this.props});
        setTimeout(() => ipcRenderer.send('separateWindowsCount'), 100);
    };



    reportStart = ({ arch, cpus, platform, release, type }) => 
    googleAnalytics.send(   
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
           ev:0
        } 
    ) 
    .catch(err => globalErrorHandler(err));


/*
    removeTodosFromCompletedProjects : (todos:Todo[], projects:Project[]) => Todo[] =
    (todos, projects) => compose(
        applyTo(todos),
        items => reject((todo:Todo) => contains(todo._id,items)),
        items => filter(items, isString),
        flatten,
        map(prop('layout')),
        projects => filter(projects, byCompleted)
    )(projects);
*/
    

    promiseIndicators = (projects:Project[],todos:Todo[]) : Promise<Indicators> => 
    new Promise(
        resolve => {
            if(isNil(this.generateIndicatorsWorker)){ 
                resolve({}) 
            }else{
                this.generateIndicatorsWorker.addEventListener(
                   "message", 
                   (event) => resolve(event.data),
                   {once:true}
                );

                this.generateIndicatorsWorker.postMessage([projects,todos]); 
            }
        }
    );

    

    initSyncObservable = () => {
        let sync = Observable.fromEvent(this.pouchSyncWorker, 'message', (event) => event) 
        let onPouchSyncWorkerMsg = (event) => {
            console.log(event.data)
        };

        this.syncObservableSubscription = sync.subscribe(onPouchSyncWorkerMsg);
    };



    suspendSyncObservable = () => {
        if(isNotNil(this.syncObservableSubscription)){
           this.syncObservableSubscription.unsubscribe();
           this.syncObservableSubscription = null;
        } 
    };



    initSync = () => {
        this.initSyncObservable();
        this.pouchSyncWorker.postMessage('start'); 
    };

    

    suspendSync = () => {
        this.suspendSyncObservable();
        this.pouchSyncWorker.postMessage('stop');
    };


    getAmounts = (props:Store) : { 
        inbox:number,
        today:number,
        hot:number,
        next:number,
        someday:number,
        logbook:number,
        trash:number
    } => {
        let filters : {
            inbox:((todo:Todo) => boolean)[],
            today:((todo:Todo) => boolean)[], 
            hot:((todo:Todo) => boolean)[],
            next:((todo:Todo) => boolean)[],
            someday:((todo:Todo) => boolean)[],
            upcoming:((todo:Todo) => boolean)[],
            logbook:((todo:Todo) => boolean)[],
            trash:((todo:Todo) => boolean)[]
        } = getFilters(props.projects);

        let amounts = generateAmounts(props.todos, filters);

        return amounts;
    };

  

    componentWillReceiveProps(nextProps:Store){
        if(this.props.sync!==nextProps.sync){
            checkAuthenticated().then (when( identity, this.initSync ) )
        }

        if(
            this.props.projects!==nextProps.projects || 
            this.props.todos!==nextProps.todos
        ){
            measureTimePromise(this.promiseIndicators,'promiseIndicators')(
                nextProps.projects,
                nextProps.todos
            )
            .then(
                (indicators:Indicators) => this.setState(
                    {indicators}, 
                    () => when( 
                        () => not(this.props.clone),
                        () => ipcRenderer.send(
                            'updateQuickEntryData',
                            {
                                todos:nextProps.todos,
                                projects:nextProps.projects,
                                areas:nextProps.areas,
                                indicators:this.state.indicators
                            }
                        )
                    )
                )
            );

            this.setState({amounts:this.getAmounts(nextProps)});
        }
    };

    

    render(){
        return <div style={{backgroundColor:"white",width:"100%",height:"100%",scroll:"none",zIndex:2001} as any}>  
            <div style={{display:"flex",width:"inherit",height:"inherit"}}>
                { 
                    this.props.clone ? null :  
                    <LeftPanel 
                        dispatch={this.props.dispatch}
                        selectedCategory={this.props.selectedCategory}
                        searchQuery={this.props.searchQuery} 
                        leftPanelWidth={this.props.leftPanelWidth}
                        openNewProjectAreaPopup={this.props.openNewProjectAreaPopup}
                        projects={this.props.projects}
                        areas={this.props.areas}
                        amounts={this.state.amounts}
                        indicators={this.state.indicators}
                        dragged={this.props.dragged}
                        selectedProjectId={this.props.selectedProjectId}
                        selectedAreaId={this.props.selectedAreaId}
                        id={this.props.id}
                    /> 
                }  
                <MainContainer 
                    dispatch={this.props.dispatch} 
                    amounts={this.state.amounts}
                    selectedCategory={this.props.selectedCategory}
                    limit={this.props.limit}
                    nextUpdateCheck={this.props.nextUpdateCheck}
                    nextBackupCleanup={this.props.nextBackupCleanup}
                    selectedTodo={this.props.selectedTodo}
                    scrolledTodo={this.props.scrolledTodo}
                    showRepeatPopup={this.props.showRepeatPopup}
                    hideHint={this.props.hideHint}
                    firstLaunch={this.props.firstLaunch}
                    clone={this.props.clone} 
                    showWhenCalendar={this.props.showWhenCalendar}
                    groupTodos={this.props.groupTodos} 
                    showRightClickMenu={this.props.showRightClickMenu}
                    showCalendarEvents={this.props.showCalendarEvents}
                    showTrashPopup={this.props.showTrashPopup}
                    filters={getFilters(this.props.projects)}
                    indicators={this.state.indicators}
                    calendars={filter(this.props.calendars, (calendar:Calendar) => calendar.active)}
                    projects={this.props.projects}
                    areas={this.props.areas} 
                    todos={this.props.todos}  
                    selectedProjectId={this.props.selectedProjectId}
                    selectedAreaId={this.props.selectedAreaId}
                    moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                    selectedTag={this.props.selectedTag}
                    dragged={this.props.dragged}
                    cloneWindow={this.cloneWindow}
                /> 
            </div>   
            { 
                this.props.clone ? null : 
                not(this.props.openSettings) ? null :
                <SettingsPopup  
                    email={this.props.email}
                    sync={this.props.sync}
                    lastSync={this.props.lastSync}
                    dispatch={this.props.dispatch} 
                    openSettings={this.props.openSettings}
                    hideHint={this.props.hideHint}
                    selectedSettingsSection={this.props.selectedSettingsSection}
                    enableShortcutForQuickEntry={this.props.enableShortcutForQuickEntry}
                    quickEntrySavesTo={this.props.quickEntrySavesTo}
                    calendars={this.props.calendars}
                    showCalendarEvents={this.props.showCalendarEvents}
                    limit={this.props.limit}
                    shouldSendStatistics={this.props.shouldSendStatistics}
                    moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                    groupTodos={this.props.groupTodos}
                    disableReminder={this.props.disableReminder}
                    todos={this.props.todos}
                    defaultTags={this.props.defaultTags}
                />
            } 
            {
                not(this.props.showTrashPopup) ? null :    
                <TrashPopup  
                    dispatch={this.props.dispatch}
                    showTrashPopup={this.props.showTrashPopup}
                />
            }
            {   
                not(this.props.openChangeGroupPopup) ? null : 
                <ChangeGroupPopup    
                    dispatch={this.props.dispatch}
                    openChangeGroupPopup={this.props.openChangeGroupPopup}
                    todos={this.props.todos}
                    rightClickedTodoId={this.props.rightClickedTodoId}
                />
            }
            { 
                this.props.clone ? null : 
                not(this.props.showUpdatesNotification) ? null :
                <UpdateNotification  
                    dispatch={this.props.dispatch}
                    showUpdatesNotification={this.props.showUpdatesNotification}
                    progress={this.props.progress}
                />
            }
            { 
                this.props.clone ? null : 
                not(this.props.showLicense) ? null :
                <LicensePopup 
                    dispatch={this.props.dispatch}
                    showLicense={this.props.showLicense}
                />
            }
        </div>  
    }           
};    



let onCloseWindow = (isMainWindow:boolean) => () => {
    if(isMainWindow){
        ipcRenderer.send('Mhide'); 
        return false; 
    }else{
        ipcRenderer.send('separateWindowsCount'); 
        return undefined;
    }
};



let renderApp = (config:Config, clonedStore:Store, id:number) : void => { 
    let app=document.createElement('div'); 
    let isClonedWindow : boolean = isNotNil(clonedStore);
    let isMainWindow : boolean = id===1;
    let defaultStore = {...defaultStoreItems};
    let {nextUpdateCheck} = config;
    
    app.id='application';      
    document.body.appendChild(app); 
    window.onbeforeunload = onCloseWindow(isMainWindow);
    
 
    if(isClonedWindow){  
        let {todos,projects,areas,calendars,limit} = clonedStore;

        defaultStore={
            ...clonedStore,
            limit:initDate(limit),
            clone:true, 
            todos:map(convertTodoDates,todos),
            projects:map(convertProjectDates, projects), 
            areas:map(convertAreaDates, areas), 
            calendars:map( evolve({events:map(convertEventDate)}), calendars )
        };
    }    


    let data = {
        ...defaultStore,
        ...config,
        nextUpdateCheck:initDate(nextUpdateCheck),
        id
    };
   

    let store = createStore(applicationReducer,data);

    
    ReactDOM.render(   
        <Provider store={store}>    
            {wrapMuiThemeLight(<App {...{} as any}/>)}
        </Provider>,
        document.getElementById('application')
    )  
}; 
 

   
//render application
ipcRenderer.once(
    'loaded', 
    (event,clonedStore:Store,id:number) => getConfig().then(config => renderApp(config,clonedStore,id))
);    




let reducer = (reducers) => ( state:Store, action:any) : Store => {
    let f = (state:Store,action:action) => {
        for(let i=0; i<reducers.length; i++){
            let newState = reducers[i](state, action);
            if(newState){ 
               return newState;
            }  
        }    
        return state;
    };

    return refreshReminders(
        state,
        ifElse(
            typeEquals("multiple"), 
            (action:action) => action.load.reduce((state,action) => f(state,action), state),
            (action:action) => f(state,action)
        )(action)
    );
}; 



let applicationReducer = reducer([applicationStateReducer, applicationObjectsReducer]); 
  

  


  
   