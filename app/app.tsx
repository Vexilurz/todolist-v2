import './assets/styles.css';  
import './assets/fonts/index.css'; 
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import { Component } from "react";  
import { ipcRenderer } from 'electron';
import { 
    attachDispatchToProps, convertTodoDates, convertProjectDates, convertAreaDates, 
    initDate, measureTimePromise,  onErrorWindow, log, typeEquals, generateEmptyProject, generateEmptyArea 
} from "./utils/utils";  
import { wrapMuiThemeLight } from './utils/wrapMuiThemeLight'; 
import { isNotNil, isString } from './utils/isSomething';
import { createStore } from "redux"; 
import { Provider, connect } from "react-redux";
import { LeftPanel } from './Components/LeftPanel/LeftPanel';
import { MainContainer } from './Components/MainContainer'; 
import { filter } from 'lodash';
import { 
    Project, Todo, Calendar, Config, Store, Indicators, action, 
    PouchChanges, PouchError, PouchChange, DatabaseChanges, Area, actionStartSync, actionSetKey 
} from './types';
import { 
    isNil, map, when, evolve, prop, isEmpty, path, 
    compose, ifElse, mapObjIndexed, reject, values,
    cond, identity, any, defaultTo, fromPairs 
} from 'ramda';
import { Observable, Subscription } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { TrashPopup } from './Components/Categories/Trash'; 
import { ChangeGroupPopup } from './Components/TodoInput/ChangeGroupPopup';
import { UpdateNotification } from './Components/UpdateNotification';
import { googleAnalytics } from './analytics';
import { globalErrorHandler } from './utils/globalErrorHandler';
import { collectSystemInfo } from './utils/collectSystemInfo';
import { convertEventDate } from './Components/Calendar';
import { SettingsPopup } from './Components/settings/SettingsPopup';
import { LicensePopup } from './Components/settings/LicensePopup';
import { uppercase } from './utils/uppercase';
import { getFilters } from './utils/getFilters';
import { generateAmounts } from './utils/generateAmounts';
import { defaultStoreItems } from './defaultStoreItems'; 
import { applicationReducer } from './reducer';
import { workerSendAction } from './utils/workerSendAction';
import { toStoreChanges } from './utils/toStoreChanges';
import { changesToActions } from './utils/changesToActions';
import { subscribeToChannel } from './utils/subscribeToChannel';
import { requestFromMain } from './utils/requestFromMain';
import { checkAuthenticated } from './utils/checkAuthenticated';
import { emailToUsername } from './utils/emailToUsername';
import { generateId } from './utils/generateId';
import { generateEmptyTodo } from './utils/generateEmptyTodo';
import { isDev } from './utils/isDev';
import { generateEmptyCalendar } from './utils/generateEmptyCalendar';
import { logout } from './utils/logout';
import { fixIncomingData } from './utils/fixIncomingData';
import { ImportPopup } from './Components/ImportPopup';
export const pouchWorker = new Worker('pouchWorker.js');
window.onerror = onErrorWindow; 



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
    subscriptions:Subscription[];

    constructor(props){  
        super(props); 

        this.subscriptions = [];

        this.generateIndicatorsWorker = null;

        this.state = { amounts:this.getAmounts(this.props), indicators:{} };
    };



    openLoginForm = () => this.props.dispatch({
        type:"multiple", 
        load:[
            {type:'sync', load:false}, 
            {type:"openSettings", load:true}, 
            {type:"selectedSettingsSection", load:'Sync'}
        ]
    });



    onPouchChanges = (action:action) => { 
        if(isDev()){
           console.log(`%c pouch ${action.type}`, `color: "#000080"`, action.load);
        }

        let changes : { dbname:string, changes:PouchChanges } = action.load; 
        let dbname = prop("dbname")(changes);
        let change : PouchChange<any> = path(["changes","change"])(changes);

        if(isNil(change) || isEmpty(change.docs) || !change.ok){  return  }
 
        let timestamp = new Date(change.start_time);

        let docs = compose( 
            prop(dbname),
            fixIncomingData, 
            data =>  fromPairs( [[dbname,data]] ),  
            defaultTo([]), 
            prop('docs')
        )(change); 
 
        let lastSyncAction = { type:"lastSync", load:timestamp, kind:"sync" };
        let local = defaultTo([])(this.props[dbname]);

        let actions : action[] = compose(
            changesToActions(dbname),
            toStoreChanges(local) 
        )(docs);
        
        this.props.dispatch({type:"multiple", load: [...actions,lastSyncAction] });
    };



    onPouchLog = (action:action) => { 
        if(isDev()){
           console.log(`%c ${action.load}`, 'color: #926239');
        }
    };



    onPouchError = (action:action) => { 
        let error : PouchError = action.load;

        //if(isDev()){
           console.log(`%c pouch - ${action.type} - ${JSON.stringify(action.load)}`, 'color: #8b0017');
        //}

        globalErrorHandler(error);

        if(
            any( 
                identity,
                [
                    error.status===401 && error.error==="unauthorized",
                    error.status===403 && error.error==="forbidden"
                ]
            )
        ){
            logout().then(() => this.openLoginForm());
        }
    };

     

    initObservables = () => {
        this.subscriptions.push(
            subscribeToChannel("changes", this.onPouchChanges),
            subscribeToChannel("log", this.onPouchLog),
            subscribeToChannel("error", this.onPouchError)
        );
    };



    initSync = () => 
        checkAuthenticated()
        .then( 
            auth => {
                if(
                    isString(this.props.email) && 
                    auth && 
                    this.props.sync
                ){
                    let action : actionStartSync = {
                        type:"startSync", 
                        load:emailToUsername(this.props.email)
                    };

                    pouchWorker.postMessage(action);
                }
            }
        );
    
    

    suspendDatabaseObservable = () => {
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions=[];
    };

    
    //init
    componentDidMount(){    
        this.generateIndicatorsWorker = new Worker('generateIndicators.js');

        this.setInitialTitle();

        if(!this.props.clone){

            this.initSync();

            this.initObservables();

            collectSystemInfo().then( 
                info => this.reportStart({...info} as any) 
            );
        }
    }; 



    //cleanup 
    componentWillUnmount(){
        this.generateIndicatorsWorker.terminate();
        this.generateIndicatorsWorker = null;

        if(!this.props.clone){

            pouchWorker.postMessage({type:'stopSync',load:null});         

            this.suspendDatabaseObservable();
        }
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

        

    promiseIndicators = (projects:Project[],todos:Todo[]) : Promise<Indicators> => {
        let action = {type:'indicators', load:{projects,todos}};
        
        let generateIndicatorsWorkerSendAction = workerSendAction(this.generateIndicatorsWorker);
        
        return generateIndicatorsWorkerSendAction<Indicators>(action);
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



    updateQuickEntry = (nextProps:Store,indicators:Indicators) => 
    ipcRenderer.send(
        'updateQuickEntryData',
        {
            todos:nextProps.todos,
            projects:nextProps.projects,
            areas:nextProps.areas,
            indicators
        }
    );



    componentWillReceiveProps(nextProps:Store){
        if(
            this.props.projects!==nextProps.projects || 
            this.props.todos!==nextProps.todos 
        ){

            this.promiseIndicators(nextProps.projects, nextProps.todos)
            .then(
                (indicators:Indicators) => this.setState(
                    {indicators}, 
                    () => !this.props.clone ? this.updateQuickEntry(nextProps,indicators) : null
                )
            );

            if(!this.props.clone){
                this.setState({amounts:this.getAmounts(nextProps)});
            }
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
                    secretKey={this.props.secretKey}
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
                !this.props.showTrashPopup ? null :    
                <TrashPopup  
                    dispatch={this.props.dispatch}
                    showTrashPopup={this.props.showTrashPopup}
                />
            }
            { 
                this.props.clone ? null : 
                !this.props.openSettings ? null :
                <SettingsPopup  
                    email={this.props.email}
                    secretKey={this.props.secretKey}
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
                this.props.clone ? null : 
                !this.props.showUpdatesNotification ? null :
                <UpdateNotification  
                    dispatch={this.props.dispatch}
                    showUpdatesNotification={this.props.showUpdatesNotification}
                    progress={this.props.progress}
                />
            }
            {   
                !this.props.openChangeGroupPopup ? null : 
                <ChangeGroupPopup    
                    dispatch={this.props.dispatch}
                    todos={this.props.todos}
                    rightClickedTodoId={this.props.rightClickedTodoId}
                />
            }
            { 
                this.props.clone ? null : 
                !this.props.showLicense ? null :
                <LicensePopup 
                    dispatch={this.props.dispatch}
                    showLicense={this.props.showLicense}
                />
            }
            {
                !this.props.import ? null : 
                <ImportPopup 
                    import={this.props.import}
                    dispatch={this.props.dispatch}
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
    let { nextUpdateCheck, nextBackupCleanup } = config;
    app.id='application';      
    document.body.appendChild(app); 
    window.onbeforeunload = onCloseWindow(isMainWindow);
    
    
    if(isClonedWindow){  
        let {todos,projects,areas,calendars,limit} = clonedStore;

        defaultStore = {
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
        nextBackupCleanup:initDate(nextBackupCleanup),
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
    (event,clonedStore:Store,id:number) => 
        requestFromMain("getConfig", [], (event, config) => config)
        .then(
            (config:Config) => {
                let key = config.secretKey;
                
                //if key exist in configuration send it to webworker
                //in order to initialize encryption middleware 
                if(isString(key)){
                   let action : actionSetKey = {type:"setKey", load:key};
                   workerSendAction(pouchWorker)(action);
                }
                
                renderApp(config,clonedStore,id);
            }
        )
);    

