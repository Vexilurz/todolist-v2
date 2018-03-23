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
    oneMinuteBefore, isNotNil, 
    nDaysFromNow, initDate, byDeleted, 
    byNotDeleted, byCompleted, byNotCompleted, 
    byCategory, introListIds, isDeadlineTodayOrPast, 
    isTodayOrPast, byScheduled, typeEquals, log 
} from "./utils/utils";  
import { wrapMuiThemeLight } from './utils/wrapMuiThemeLight'; 
import { isString, isDate, isNumber } from './utils/isSomething';
import { createStore } from "redux"; 
import { Provider, connect } from "react-redux";
import { LeftPanel } from './Components/LeftPanel/LeftPanel';
import { MainContainer, Category, filter } from './Components/MainContainer';
import { Project, Area, Todo, addTodos, Calendar } from './database';
import { applicationStateReducer } from './StateReducer';
import { applicationObjectsReducer } from './ObjectsReducer';
import { isNil, not, map, compose, contains, prop, when, evolve, ifElse, applyTo, flatten, reject } from 'ramda';
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
import { defaultTags } from './utils/defaultTags';
import { section } from './Components/Settings/section';
import { SettingsPopup } from './Components/settings/SettingsPopup';
import { LicensePopup } from './Components/settings/LicensePopup';
import { generateIndicators } from './utils/generateIndicators';
import { generateAmounts } from './utils/generateAmounts';
import { requestFromMain } from './utils/requestFromMain';
import { refreshReminders } from './utils/reminderUtils';
let pathTo = require('path'); 
injectTapEventPlugin();  



/*
const MockDate = require('mockdate');  
let testDate = () => MockDate.set( oneMinuteBefore(nextMidnight()) );
*/



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
    moveCompletedItemsToLogbook:string, //immediatelly
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


 
export interface Store extends Config{
    showWhenCalendar : boolean, 
    whenTodo : Todo,
    whenCalendarPopupX : number, 
    whenCalendarPopupY : number,
    
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

    showWhenCalendar : false, 
    whenTodo : null,
    whenCalendarPopupX : 0, 
    whenCalendarPopupY : 0,

    showLicense : false, 
    selectedTodo : null, 
    scrolledTodo : null,
    shouldSendStatistics : true,  
    hideHint : true,  
    progress : null,  
    scheduledReminders : [],  
    showUpdatesNotification : false, 
    limit:nDaysFromNow(40), 
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
    projects : [],
    areas : [],  
    clone : false,
    todos : []
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
    },
    todos : Todo[]
}
@connect((store,props) => store, attachDispatchToProps)   
export class App extends Component<AppProps,AppState>{  
    constructor(props){  
        super(props);

        let {amounts,indicators,todos} = this.propsToState(this.props);  
        this.state = {amounts,indicators,todos};
    };



    componentDidMount(){    
        collectSystemInfo()
        .then( 
            info => {
                let timeSeconds = Math.round( new Date().getTime() / 1000 );
                this.reportStart({...info, timeSeconds} as any);
            }
        );
    };



    /*    
        if(isDev()){
            let dir = 'C:\\Users\\Anatoly\\Desktop\\ical';
            requestFromMain<any>(
                'getFilenames',   
                [ dir ],  
                (event, files) => files.filter( name => pathTo.extname(name)==='.ics' ) 
            )
            .then(
                files => files 
                .reduce( 
                    (promise,file) => promise.then(
                        (list) => requestFromMain<any>(
                            "readFile",   
                            [ pathTo.join(dir,file) ],  
                            (event, data) => data
                        ).then(
                            (data) => {
                                return [data,...list];
                            }
                        )
                    ),
                    new Promise(resolve => resolve([])) 
                )
            ).then(
                raw => Promise.all(
                    raw.map(
                        d => {
                            let data = {
                                calendar:{
                                    name:'Error. Incorrect format.',
                                    description:'',
                                    timezone:''
                                }, 
                                events:[]
                            };

                            try{
                                data = parseCalendar(this.props.limit,d);
                            }catch(e){
                                data.calendar.description=e.message;
                            }
  
                            return data;
                        }   
                    )
                ) 
            )
            .then(
                calendars => this.props.dispatch({ 
                        type:"multiple",
                        load:calendars.map( 
                            (calendar:any) => ({
                                type:'addCalendar', 
                                load:{
                                    url:'', 
                                    active:true,
                                    _id:generateId(),
                                    name:calendar.name, 
                                    description:calendar.description,
                                    timezone:calendar.timezone,
                                    events:calendar.events,
                                    type:"calendar"
                                }
                            })
                        )
                }) 
            )
        }
    */    

 

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



    getFilters = (props:Store) => ({
        inbox:[ 
            (() => {
                let ids = flatten( props.projects.map(p => p.layout.filter(isString)) );
                return (t:Todo) => !contains(t._id)(ids); 
            })(),
            (t:Todo) => isNil(t.attachedDate) && isNil(t.deadline), 
            byCategory("inbox"), 
            byNotCompleted,  
            byNotDeleted   
        ],
        today:[    
            (t:Todo) => isTodayOrPast(t.attachedDate) || isTodayOrPast(t.deadline), 
            (t:Todo) => t.category!=="someday",
            byNotCompleted,  
            byNotDeleted   
        ], 
        hot:[
            (todo:Todo) => isDeadlineTodayOrPast(todo.deadline),
            (t:Todo) => t.category!=="someday",
            byNotCompleted,  
            byNotDeleted  
        ],
        next:[ 
            (item : (Project | Todo)) : boolean => not( contains(item._id,introListIds) ),
            (t:Todo) => isNil(t.attachedDate) && isNil(t.deadline),
            (t:Todo) => t.category!=="inbox" && t.category!=="someday",  
            byNotCompleted,   
            byNotDeleted    
        ],
        upcoming:[
            byScheduled,
            (t:Todo) => t.category!=="someday",
            byNotCompleted,  
            byNotDeleted   
        ],
        someday:[
            byCategory("someday"),
            (todo:Todo) => isNil(todo.deadline) && isNil(todo.attachedDate),
            byNotCompleted,   
            byNotDeleted 
        ],
        logbook:[
            byCompleted, 
            byNotDeleted
        ], 
        trash:[byDeleted]
    });



    removeTodosFromCompletedProjects : (todos:Todo[], projects:Project[]) => Todo[] =
    (todos, projects) => compose(
        applyTo(todos),
        items => reject((todo:Todo) => contains(todo._id,items)),
        items => filter(items, isString),
        flatten,
        map(prop('layout')),
        projects => filter(projects, byCompleted)
    )(projects);
    


    propsToState = (props:Store) : AppState => {
        let todos = this.removeTodosFromCompletedProjects(props.todos, props.projects);

        let filters : {
            inbox:((todo:Todo) => boolean)[],
            today:((todo:Todo) => boolean)[], 
            hot:((todo:Todo) => boolean)[],
            next:((todo:Todo) => boolean)[],
            someday:((todo:Todo) => boolean)[],
            upcoming:((todo:Todo) => boolean)[],
            logbook:((todo:Todo) => boolean)[],
            trash:((todo:Todo) => boolean)[]
        } = this.getFilters(props);

        let indicators : { 
            [key:string]:{
                active:number,
                completed:number,
                deleted:number
            }; 
        } = generateIndicators(
            props.projects,
            props.todos
        );

        let amounts : { 
            inbox:number,
            today:number,
            hot:number,
            next:number,
            someday:number,
            logbook:number,
            trash:number
        } = generateAmounts(todos,filters);


        return {amounts,indicators,todos};
    };



    componentWillReceiveProps(nextProps:Store){
        if(
            this.props.projects!==nextProps.projects ||
            this.props.todos!==nextProps.todos
        ){
            let {amounts,indicators,todos} = this.propsToState(nextProps);

            this.setState(
                {amounts,indicators,todos}, 
                when(
                    () => not(nextProps.clone),
                    () => requestFromMain<any>(
                        'updateQuickEntryData', 
                        [
                            {
                                todos,
                                projects:nextProps.projects,
                                areas:nextProps.areas,
                                indicators
                            }
                        ],  
                        (event) => event
                    )
                )
            );
        }
    };
 

 
    render(){
        return <div style={{backgroundColor:"white",width:"100%",height:"100%",scroll:"none",zIndex:2001}}>  
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
                    /> 
                } 
                <MainContainer 
                    dispatch={this.props.dispatch} 
                    selectedCategory={this.props.selectedCategory}
                    limit={this.props.limit}
                    nextUpdateCheck={this.props.nextUpdateCheck}
                    selectedTodo={this.props.selectedTodo}
                    scrolledTodo={this.props.scrolledTodo}
                    showRepeatPopup={this.props.showRepeatPopup}
                    hideHint={this.props.hideHint}
                    firstLaunch={this.props.firstLaunch}
                    clone={this.props.clone}
                    showCompleted={this.props.showCompleted} 
                    showWhenCalendar={this.props.showWhenCalendar}
                    showScheduled={this.props.showScheduled}
                    groupTodos={this.props.groupTodos}
                    showRightClickMenu={this.props.showRightClickMenu}
                    showCalendarEvents={this.props.showCalendarEvents}
                    showTrashPopup={this.props.showTrashPopup}
                    filters={this.getFilters(this.props)}
                    indicators={this.state.indicators}
                    calendars={filter(this.props.calendars, (calendar:Calendar) => calendar.active)}
                    projects={this.props.projects}
                    areas={this.props.areas}
                    todos={this.state.todos} 
                    selectedProjectId={this.props.selectedProjectId}
                    selectedAreaId={this.props.selectedAreaId}
                    moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                    selectedTag={this.props.selectedTag}
                    dragged={this.props.dragged}
                /> 
            </div>   
            { 
                this.props.clone ? null : 
                not(this.props.openSettings) ? null :
                <SettingsPopup  
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



let renderApp = (event, clonedStore:Store, id:number) : void => { 
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
                todos:map(convertTodoDates,todos),
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
                        {wrapMuiThemeLight(<App {...{} as any}/>)}
                    </Provider>,
                    document.getElementById('application')
                ) 
            }
        ); 
};


   
//render application
ipcRenderer.once('loaded',renderApp);    



interface action{ type:string, load:any };

let reducer = (reducers) => ( state:Store, action:any) : Store => {
    let f = (state:Store,action:action) => {
        for(let i=0; i<reducers.length; i++){
            let newState = reducers[i](state, action);
            if(newState){ 
               return refreshReminders(state,newState);
            }  
        }    
        return state;
    };

    return ifElse(
        typeEquals("multiple"), 
        (action:action) => action.load.reduce((state,action) => f(state,action), state),
        (action:action) => f(state,action)
    )(action);
}; 



let applicationReducer = reducer([applicationStateReducer, applicationObjectsReducer]); 
  

  


  
   