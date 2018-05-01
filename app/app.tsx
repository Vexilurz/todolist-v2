import './assets/styles.css';  
import './assets/fonts/index.css'; 
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import { Component } from "react";  
import { ipcRenderer } from 'electron';
import { 
    attachDispatchToProps, convertTodoDates, convertProjectDates, convertAreaDates, 
    initDate, measureTimePromise,  onErrorWindow 
} from "./utils/utils";  
import { wrapMuiThemeLight } from './utils/wrapMuiThemeLight'; 
import { isNotNil } from './utils/isSomething';
import { createStore } from "redux"; 
import { Provider, connect } from "react-redux";
import { LeftPanel } from './Components/LeftPanel/LeftPanel';
import { MainContainer } from './Components/MainContainer'; 
import { filter } from 'lodash';
import { Project, Todo, Calendar, Config, Store, Indicators, action, PouchChanges, PouchError } from './types';
import { isNil, not, map, when, evolve, prop } from 'ramda';
import { Observable, Subscription } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { TrashPopup } from './Components/Categories/Trash'; 
import { ChangeGroupPopup } from './Components/TodoInput/ChangeGroupPopup';
import { UpdateNotification } from './Components/UpdateNotification';
import { googleAnalytics } from './analytics';
import { globalErrorHandler } from './utils/globalErrorHandler';
import { getConfig } from './utils/config';
import { collectSystemInfo } from './utils/collectSystemInfo';
import { convertEventDate } from './Components/Calendar';
import { SettingsPopup } from './Components/settings/SettingsPopup';
import { LicensePopup } from './Components/settings/LicensePopup';
import { uppercase } from './utils/uppercase';
import { getFilters } from './utils/getFilters';
import { generateAmounts } from './utils/generateAmounts';
import { defaultStoreItems } from './defaultStoreItems'; 
import { applicationReducer } from './reducer';
import { typeEquals } from './utils/time';
import { workerSendAction } from './utils/workerSendAction';
export const pouchWorker = new Worker('pouchWorker.js');
window.onerror = onErrorWindow; 



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

        this.state = { 
            amounts:this.getAmounts(this.props), 
            indicators:{} 
        };
    };


    openLoginForm = () =>   this.props.dispatch({
        type:"multiple", 
        load:[{type:"openSettings", load:true}, {type:"selectedSettingsSection", load:'Sync'}]
    });



    initObservables = () => {

        let subscribeToChannel = (
            channel:string, 
            subscriber:(action:action) => void
        ) : Subscription => 
            Observable
            .fromEvent(pouchWorker,'message',(event) => event)
            .map(prop('data'))
            .filter(typeEquals(channel)) 
            .subscribe(subscriber);
        


        let onChanges = (action:action) => { 
            let changes : PouchChanges = action.load; 
            console.log(`%c pouch ${action.type}`, `color: "#000080"`, action.load);
        };



        let onLog = (action:action) => { 
            console.log(`%c ${action.load}`, 'color: #926239');
        };
        

 
        let onError = (action:action) => { 
            let error : PouchError = action.load;
            console.log(`%c pouch - ${action.type} - ${action.load}`, 'color: #8b0017');

            if(error.status===401 && error.error==="unauthorized"){
               this.openLoginForm()
            }
        };



        this.subscriptions.push(
            subscribeToChannel("changes", onChanges),
            subscribeToChannel("log", onLog),
            subscribeToChannel("error", onError)
        );
    };

    

    suspendDatabaseObservable = () => {
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions=[];
    };

    
    
    componentDidMount(){    
        this.generateIndicatorsWorker = new Worker('generateIndicators.js');

        this.setInitialTitle();

        if(!this.props.clone){
            this.initObservables();
            collectSystemInfo().then( info => this.reportStart({...info} as any) );
        }
    }; 



    //cleanup 
    componentWillUnmount(){
        this.suspendDatabaseObservable();
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
        () => ipcRenderer.send(
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

            measureTimePromise(this.promiseIndicators,'promiseIndicators')(
                nextProps.projects,
                nextProps.todos
            )
            .then(
                (indicators:Indicators) => this.setState(
                    {indicators}, 
                    when( 
                        () => not(this.props.clone),
                        this.updateQuickEntry(nextProps,indicators)
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
    let { nextUpdateCheck } = config;
    
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

