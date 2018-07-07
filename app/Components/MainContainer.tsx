import './../assets/styles.css';   
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';   
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton';  
import { Component } from "react"; 
import { isDev } from "../utils/isDev"; 
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { Todo, Project, Area, Calendar, Category, action } from '.././types';
import Print from 'material-ui/svg-icons/action/print';  
import { AreaComponent } from './Area/Area';
import { ProjectComponent } from './Project/Project';
import { Trash } from './Categories/Trash';
import { Logbook } from './Categories/Logbook';
import { Someday } from './Categories/Someday';
import { Next } from './Categories/Next';  
import { Today } from './Categories/Today';
import { Inbox } from './Categories/Inbox';
import { 
    isNil, contains, not, evolve, map, compose, allPass, groupBy, 
    cond, defaultTo, when, concat, append, path, prop, reject, 
    mapObjIndexed, values
} from 'ramda';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscription } from 'rxjs/Rx';
import { RightClickMenu } from './RightClickMenu';
import { RepeatPopup } from './RepeatPopup';
import { Search } from './Search/Search';
import { filter } from 'lodash';
import { updateCalendars, convertEventDate } from './Calendar';
import { globalErrorHandler } from '../utils/globalErrorHandler';
import { isTodo, isString, isNotNil } from '../utils/isSomething';
import { isNewVersion } from '../utils/isNewVersion';
import { UpdateCheckResult } from 'electron-updater';
import { setCallTimeout } from '../utils/setCallTimeout';
import { requestFromMain } from '../utils/requestFromMain';
import { getData, updateQuickEntryData } from '../utils/getData';
import { WhenCalendar } from './WhenCalendar';
import { isNotEmpty, checkForUpdates, convertDates, printElement, byNotDeleted, isTodayOrPast, log } from '../utils/utils';
import { threeDaysLater, inPast, fourteenDaysLater, fiveMinutesLater } from '../utils/time'; 
import { introListLayout, getIntroList } from '../utils/introList';
import { fixIncomingData } from '../utils/fixIncomingData';
import { extend } from '../utils/extend';
import { UpcomingDefault } from './Categories/Upcoming/UpcomingDefault';
import { Tag } from './Categories/Tag';

/*
const MockDate = require('mockdate');  
let testDate = () => MockDate.set( new Date().getTime() + (1000*60*60*24*100) );
testDate();
*/

let hideImportCalendarsHint : (calendars:Calendar[], showHint:boolean) => 
    (actions:action[]) => action[] =
    (calendars, showHint) => when( 
        () => isNotEmpty(calendars) && showHint, //if calendars not empty - hide hint
        append({type:"hideHint", load:true}) 
    );



let addIntroList = (projects:Project[],firstLaunch:boolean) => 
    (actions:action[]) : action[] => {
        if(not(firstLaunch)){ return actions; }
        let introListAlreadyExists = projects.find((p:Project) => p._id==="Intro List");

        return when( 
            () => not(introListAlreadyExists), 
            concat([
                {type:"addTodos", load:introListLayout.filter(isTodo)},
                {type:"addProject", load:getIntroList()}  
            ]) 
        )(actions);
    };

 

let addExtendedTodos = (projects:Project[], limit:Date, todos:Todo[]) => (actions:action[]) : action[] => {
    let extended : Todo[] = extend(projects, limit, todos);

    let attachToProjectActions = compose(
        reject(isNil),
        values,
        mapObjIndexed(
            (value:Todo[],projectId:string) : action => {
                let project = projects.find(p => p._id===projectId);
                return isNil(project) ? null : ({
                    type:"updateProject", 
                    load:{ ...project, layout:[ ...project.layout, ...value.map(prop('_id')) ] }
                })
            }
        ),
        groupBy( path(['group','projectId']) ),
        reject( compose( isNil, path(['group','projectId']) ) )
    )(extended);

    let result = compose(
        when( () => isNotEmpty(extended), append({type:"addTodos", load:extended}) ),
        actions => [...actions,...attachToProjectActions] 
    )(actions);

    return result;
};



interface MainContainerProps{
    dispatch:Function, 
    selectedCategory:Category,
    limit:Date,
    nextUpdateCheck:Date,
    nextBackupCleanup:Date,
    selectedTodo:Todo, 
    scrolledTodo:Todo,
    secretKey:string,
    showRepeatPopup:boolean,
    hideHint:boolean,
    firstLaunch:boolean,
    clone:boolean, 
    groupTodos:boolean,
    showRightClickMenu:boolean,
    showCalendarEvents:boolean,
    showTrashPopup:boolean, 
    showWhenCalendar:boolean, 
    filters:{
        inbox:((todo:Todo) => boolean)[],
        today:((todo:Todo) => boolean)[],
        hot:((todo:Todo) => boolean)[],
        next:((todo:Todo) => boolean)[],
        someday:((todo:Todo) => boolean)[],
        upcoming:((todo:Todo) => boolean)[],
        logbook:((todo:Todo) => boolean)[],
        trash:((todo:Todo) => boolean)[]
    },
    indicators:{ 
        [key:string]:{active:number,completed:number,deleted:number}; 
    },
    calendars:Calendar[],
    projects:Project[],
    areas:Area[],
    todos:Todo[],
    selectedProjectId:string,
    selectedAreaId:string,
    moveCompletedItemsToLogbook:string,
    selectedTags:string[],
    dragged:string,
    cloneWindow:() => void
} 



interface MainContainerState{ 
    separateWindowsCount:number  
}
  

 
export class MainContainer extends Component<MainContainerProps,MainContainerState>{
    rootRef:HTMLElement;  
    subscriptions:Subscription[]; 
    timeouts:any[];
    maxSepWindows:number;
    disablePrintButton:boolean;



    constructor(props){ 
        super(props);  

        this.subscriptions = [];

        this.timeouts = [];

        this.disablePrintButton = false;

        this.maxSepWindows = 6;

        this.state = { separateWindowsCount:0 };
    };  


      
    onError = (e) => globalErrorHandler(e); 

     

    initData : () => Promise<void> = () => 
    getData(this.props.secretKey)
    .then(fixIncomingData)
    .then(({calendars,todos,projects,areas}) => 
        updateCalendars(this.props.limit,calendars,this.onError)
        .then( 
            (updated) => updateQuickEntryData({projects,areas,todos,calendars:updated}) 
        ) 
    )
    .then(({projects, areas, todos, calendars}) => 
        this.setData({
            projects:defaultTo([], projects), 
            areas:defaultTo([], areas), 
            todos:defaultTo([], todos), 
            calendars:map(
                evolve({events:map(convertEventDate)}), 
                defaultTo([], calendars)
            )
        }) 
    );
        


    setData = ({projects, areas, todos, calendars}) : void => {
        if(this.props.clone){ return } 
        compose(
            (actions:action[]) => this.props.dispatch({type:"multiple", load:actions}),
            hideImportCalendarsHint(calendars,not(this.props.hideHint)),
            addExtendedTodos(projects, this.props.limit, todos),
            addIntroList(projects,this.props.firstLaunch),
            () => [],
            () => this.props.dispatch({
                type:"multiple",
                load:[
                    {type:"setProjects", load:projects},
            
                    {type:"setAreas", load:areas},
        
                    {type:"setTodos", load:todos},
        
                    {type:"setCalendars", load:calendars}
                ]
            }),
            () => ipcRenderer.send("focusMainWindowOnStart")
        )()
    };
    
    

    initUpdateTimeout = () : void => {
        if(isDev()){
           console.log(`nextUpdateCheck - ${this.props.nextUpdateCheck}`);
        }

        let check = () =>
            checkForUpdates()  
            .then(
                (updateCheckResult:UpdateCheckResult) => requestFromMain(
                   'getVersion',
                    [],
                    (event, currentAppVersion) => [updateCheckResult, currentAppVersion]
                )
            )
            .then( 
                ([updateCheckResult, currentAppVersion]) => {
                    let {updateInfo} = updateCheckResult;
                    let canUpdate = isNewVersion(currentAppVersion,updateInfo.version);
                    let next : any = isDev() ? fiveMinutesLater(new Date()) : threeDaysLater(new Date());
                    let actions = [{type:"nextUpdateCheck",load:next}];

                    if(canUpdate){ 
                       actions.push({type:"showUpdatesNotification", load:true});
                    } 

                    this.props.dispatch({type:"multiple",load:actions}); 
                    this.initUpdateTimeout();
                }
            )
          
 
        if( 
            isNil(this.props.nextUpdateCheck) || 
            inPast(new Date(this.props.nextUpdateCheck)) 
        ){ 
            check(); 
        }else{
            this.timeouts.push( 

                setCallTimeout( () => check(), new Date(this.props.nextUpdateCheck) ) 
            );
        }
    };



    initBackupCleanupTimeout = () : void => {
        if(isDev()){
           console.log(`nextBackupCleanup - ${this.props.nextBackupCleanup}`);
        }

        let cleanup = () => 
            requestFromMain('backupCleanup', [], event => event)
            .then(() => {
                let next = isDev() ? fiveMinutesLater(new Date()) : fourteenDaysLater(new Date());
                this.props.dispatch({type:"nextBackupCleanup", load:next});
                this.initBackupCleanupTimeout(); 
            });
        
        if(
            isNil(this.props.nextBackupCleanup)  || 
            inPast(new Date(this.props.nextBackupCleanup))
        ){ 
            cleanup(); 
        }else{
            this.timeouts.push(
                setCallTimeout( () => cleanup(), new Date(this.props.nextBackupCleanup) )
            );
        }
    };

 

    initObservables = () => {  
        let {dispatch} = this.props; 
        let minute = 1000 * 60;  
 
        this.subscriptions.push( 
            Observable
                .interval(15*minute)
                .subscribe(() => 
                    requestFromMain(
                        'saveBackup',
                        [
                            { 
                                database : { 
                                    todos:this.props.todos, 
                                    projects:this.props.projects, 
                                    areas:this.props.areas, 
                                    calendars:this.props.calendars 
                                } 
                            }
                        ],
                        (event) => event
                    )
                ),   
        
            Observable
                .interval(5 * minute)
                .flatMap(
                    () => updateCalendars(
                        this.props.limit, 
                        this.props.calendars, 
                        this.onError 
                    )
                )
                .subscribe(  
                    load => dispatch({type:"updateCalendars",load})
                ), 
                

            Observable 
                .fromEvent(ipcRenderer, 'separateWindowsCount', (event,count) => count) 
                .subscribe(
                    (separateWindowsCount:number) => this.setState({separateWindowsCount})
                ), 

  
            Observable
                .fromEvent(window,"resize")
                .debounceTime(100) 
                .subscribe(() => dispatch({type:"leftPanelWidth",load:window.innerWidth/3.7})),
    

            Observable  
                .fromEvent(window,"click")
                .debounceTime(100)
                .subscribe(() => 
                    this.props.showRightClickMenu ? 
                    dispatch({type:"showRightClickMenu", load:false}) : 
                    null
                ),   


            Observable 
                .fromEvent(ipcRenderer, 'receive', (event,todo) => todo) 
                .subscribe((todo:Todo) => {
                    if(isDev()){ console.log(`2) receive:${todo.title}`); }
                }), 


            Observable 
                .fromEvent(ipcRenderer, 'removeReminders', (event,todos) => todos) 
                .subscribe((items:Todo[]) => {
                    let ids : string[] = items.filter(isNotNil).map((t:Todo) => t._id);

                    if(isDev()){ 
                       items.forEach( todo => console.log(`3) erase ${todo ? todo.title : todo}`) ) 
                    }

                    let load = ids.map( id => ({ type:"updateTodoById", load:{id,props:{reminder:null}} }) );
                        
                    if(isNotEmpty(load)){ 
                       dispatch({type:"multiple",load}); 
                    }
                }),     
             

            Observable
                .fromEvent(ipcRenderer, 'openTodo', (event,todo) => todo)
                .subscribe( 
                    (todo) => {
                        ipcRenderer.send('focusMainWindow'); 
                        
                        dispatch({type:"selectedCategory",load:"inbox"});
                        //don't combine this actions to trigger rerender of todo input
                        dispatch({ 
                            type:"multiple",
                            load:[
                                {type:"scrolledTodo",load:todo},
                                {type:"selectedCategory",load:"today"} 
                            ]
                        });  
                    }
                ), 


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
                .subscribe(
                    (event) => dispatch({
                        type:"multiple",
                        load:[
                            {type:"openNewProjectAreaPopup", load:false},
                            {type:"showTrashPopup", load:false},
                            {type:"openTodoInputPopup", load:true}
                        ]
                    })
                )   
        );
    };
  


    componentDidMount(){    
        this.props.dispatch({type:"selectedCategory", load:this.props.selectedCategory});

        this.initObservables(); 

        if(!this.props.clone){
            this.initData(); 
            this.initUpdateTimeout();
            this.initBackupCleanupTimeout();
        }
    };      
     


    componentWillUnmount(){ 
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = [];
        this.timeouts.map(t => clearTimeout(t));
        this.timeouts = [];  
    };  
 
  

    componentDidUpdate(prevProps, prevState){
        if(
            this.props.selectedCategory!==prevProps.selectedCategory ||
            this.props.selectedProjectId!==prevProps.selectedProjectId ||
            this.props.selectedAreaId!==prevProps.selectedAreaId
        ){
            if(this.rootRef){ 
               this.rootRef.scrollTop=0;  
            } 
        }
    }; 

    

    printCurrentList = () => {   
        let {selectedCategory} = this.props;
        if(this.disablePrintButton){ return } 

        let list = document.getElementById(`${selectedCategory}-list`); 
        if(list){  
           this.disablePrintButton = true; 
           printElement(selectedCategory, list).then(() => { this.disablePrintButton = false; });
        } 
    };

    

    render(){   
        return  <div ref={(e) => { this.rootRef=e }}
                    className="scroll"  
                    id="maincontainer"  
                    style={{    
                       flexGrow:1,  
                       overflowX:"hidden",
                       height:`${window.innerHeight}px`,     
                       position:"relative",  
                       display:"flex",     
                       backgroundColor:"rgba(255, 255, 255, 1)", 
                       flexDirection:"column"     
                    }}  
                >  
                { 
                    not(this.props.showRightClickMenu) ? null : 
                    <RightClickMenu {...{} as any}/> 
                } 
                {
                    not(this.props.showRepeatPopup) ? null : 
                    <RepeatPopup {...{} as any}/>  
                }
                {
                    not(this.props.showWhenCalendar) ? null : 
                    <WhenCalendar {...{} as any}/>  
                }
                <div style={{display:"flex",padding:"10px"}}>   
                    <div style={{
                        zIndex: 20000,
                        alignItems: "center",
                        position: "fixed",
                        height: "27px",
                        width: "60px",
                        display: "flex",
                        top: "0px",
                        justifyContent: "space-between",
                        right: "15px"
                    }}>  
                        { 
                            this.props.clone ? null :
                            <IconButton  
                                style={{padding:0,width:"auto",height:"auto"}}
                                iconStyle={{width:"20px",height:"20px",color:"rgba(100,100,100,0.5)"}}
                                onClick={this.printCurrentList}
                            > 
                                <Print />   
                            </IconButton>   
                        } 
                        {     
                            this.props.clone ? null :
                            this.state.separateWindowsCount>this.maxSepWindows ? null :
                            <IconButton    
                                style={{padding:0,width:"auto",height:"auto"}}
                                iconStyle={{width:"18px",height:"18px",color:"rgba(100,100,100,0.5)"}}
                                onClick={this.props.cloneWindow}   
                                disabled={this.state.separateWindowsCount>this.maxSepWindows}
                            >     
                                <OverlappingWindows />
                            </IconButton> 
                        }  
                    </div>   
                </div>  
                <div style={{paddingLeft:"60px", paddingRight:"60px", paddingBottom:"140px", paddingTop:"10px"}}>
                    {     
                        cond([  
                            [ 
                                (selectedCategory:Category) : boolean => 'inbox'===selectedCategory,  
                                () => {
                                    let inboxFilters = this.props.filters.inbox;    
                                    let inboxTodos = filter(this.props.todos, allPass(inboxFilters));
                                    
                                    return <Inbox 
                                        todos={inboxTodos} 
                                        filters={this.props.filters}
                                        dispatch={this.props.dispatch}
                                        selectedCategory={this.props.selectedCategory}
                                        groupTodos={this.props.groupTodos}
                                        selectedTodo={this.props.selectedTodo}
                                        scrolledTodo={this.props.scrolledTodo}
                                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                                        selectedTags={this.props.selectedTags} 
                                        selectedProjectId={this.props.selectedProjectId} 
                                        selectedAreaId={this.props.selectedAreaId} 
                                        rootRef={this.rootRef}
                                        areas={this.props.areas}
                                        projects={this.props.projects} 
                                    />
                                }
                            ],   
                            [ 
                                (selectedCategory:Category) : boolean => 'today'===selectedCategory,  
                                () => { 
                                    let todayFilters = this.props.filters.today; 
                                    let todayTodos = filter(this.props.todos, allPass(todayFilters));
                                    
                                    return <Today   
                                        todos={todayTodos}
                                        filters={this.props.filters}
                                        hideHint={this.props.hideHint}
                                        clone={this.props.clone}
                                        dispatch={this.props.dispatch}
                                        scrolledTodo={this.props.scrolledTodo}
                                        selectedTodo={this.props.selectedTodo}
                                        groupTodos={this.props.groupTodos}
                                        selectedProjectId={this.props.selectedProjectId}
                                        indicators={this.props.indicators}
                                        selectedAreaId={this.props.selectedAreaId} 
                                        selectedCategory={this.props.selectedCategory}
                                        selectedTags={this.props.selectedTags} 
                                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                                        areas={this.props.areas}
                                        projects={this.props.projects}
                                        rootRef={this.rootRef} 
                                        showCalendarEvents={this.props.showCalendarEvents}
                                        calendars={this.props.calendars}
                                    /> 
                                }
                            ], 
                            [ 
                                (selectedCategory:Category) : boolean => 'someday'===selectedCategory,  
                                () => {
                                    let somedayFilters = this.props.filters.someday;
                                    let selectedTodos = filter(this.props.todos, allPass(somedayFilters));

                                    return <Someday 
                                        todos={selectedTodos}
                                        filters={this.props.filters}
                                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                                        dispatch={this.props.dispatch}
                                        selectedTodo={this.props.selectedTodo}
                                        groupTodos={this.props.groupTodos}
                                        indicators={this.props.indicators}
                                        scrolledTodo={this.props.scrolledTodo}
                                        selectedProjectId={this.props.selectedProjectId}
                                        selectedAreaId={this.props.selectedAreaId} 
                                        selectedCategory={this.props.selectedCategory}
                                        selectedTags={this.props.selectedTags} 
                                        rootRef={this.rootRef}
                                        areas={this.props.areas}
                                        projects={this.props.projects}
                                    /> 
                                }
                            ], 
                            [ 
                                (selectedCategory:Category) : boolean => 'next'===selectedCategory,  
                                () => {
                                    let nextFilters = this.props.filters.next; 
                                    let nextTodos = filter(this.props.todos, allPass(nextFilters));
                                    
                                    return <Next   
                                        todos={nextTodos}
                                        filters={this.props.filters}
                                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                                        dispatch={this.props.dispatch}
                                        indicators={this.props.indicators}
                                        groupTodos={this.props.groupTodos}
                                        selectedTodo={this.props.selectedTodo}
                                        scrolledTodo={this.props.scrolledTodo}
                                        selectedCategory={this.props.selectedCategory}
                                        selectedTags={this.props.selectedTags} 
                                        rootRef={this.rootRef}
                                        selectedProjectId={this.props.selectedProjectId}
                                        selectedAreaId={this.props.selectedAreaId} 
                                        areas={this.props.areas} 
                                        projects={this.props.projects} 
                                    />
                                }
                            ],  
                            [ 
                                (selectedCategory:Category) : boolean => 'trash'===selectedCategory,  
                                () => {
                                    let trashTodos = filter(this.props.todos, allPass(this.props.filters.trash));
                                    
                                    return <Trash    
                                        todos={trashTodos}
                                        groupTodos={this.props.groupTodos}  
                                        indicators={this.props.indicators}
                                        dispatch={this.props.dispatch} 
                                        scrolledTodo={this.props.scrolledTodo}
                                        selectedCategory={this.props.selectedCategory}
                                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                                        selectedTags={this.props.selectedTags} 
                                        showTrashPopup={this.props.showTrashPopup}
                                        selectedProjectId={this.props.selectedProjectId}
                                        selectedAreaId={this.props.selectedAreaId} 
                                        projects={this.props.projects}
                                        areas={this.props.areas}
                                        rootRef={this.rootRef}      
                                    /> 
                                }
                            ],  
                            [ 
                                (selectedCategory:Category) : boolean => 'logbook'===selectedCategory,  
                                () => {
                                    let logbookTodos = filter(this.props.todos, allPass(this.props.filters.logbook)); 
                                    
                                    return <Logbook   
                                        todos={logbookTodos} 
                                        groupTodos={this.props.groupTodos}
                                        indicators={this.props.indicators}
                                        dispatch={this.props.dispatch}
                                        scrolledTodo={this.props.scrolledTodo}
                                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                                        selectedCategory={this.props.selectedCategory} 
                                        selectedAreaId={this.props.selectedAreaId} 
                                        selectedProjectId={this.props.selectedProjectId}
                                        areas={this.props.areas}
                                        projects={this.props.projects}
                                        selectedTags={this.props.selectedTags} 
                                        rootRef={this.rootRef}
                                    />
                                }
                            ], 
                            [ 
                                (selectedCategory:Category) : boolean => 'upcoming'===selectedCategory,  
                                () => {
                                    let upcomingFilters = this.props.filters.upcoming;
                                    let upcomingTodos = filter(this.props.todos, allPass(upcomingFilters));

                                    return <UpcomingDefault 
                                        limit={this.props.limit}
                                        clone={this.props.clone} 
                                        filters={this.props.filters}
                                        indicators={this.props.indicators}
                                        hideHint={this.props.hideHint}
                                        todos={upcomingTodos}
                                        groupTodos={this.props.groupTodos}
                                        dispatch={this.props.dispatch}
                                        selectedCategory={this.props.selectedCategory}
                                        scrolledTodo={this.props.scrolledTodo}
                                        areas={this.props.areas}
                                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                                        selectedAreaId={this.props.selectedAreaId}
                                        selectedProjectId={this.props.selectedProjectId}
                                        projects={this.props.projects}
                                        selectedTags={this.props.selectedTags} 
                                        rootRef={this.rootRef}
                                        showCalendarEvents={this.props.showCalendarEvents}
                                        calendars={this.props.calendars} 
                                    />
                                }
                            ], 
                            [ 
                                (selectedCategory:Category) : boolean => 'project'===selectedCategory,  
                                () => {
                                    let project = this.props.projects.find(p => this.props.selectedProjectId===p._id);
                                    let ids = project.layout.filter(isString);
                                    
                                    if(isNil(project)){ return null }

                                    if(isDev()){
                                       let todos = filter(this.props.todos, allPass([t => contains(t._id)(ids), t => isNotNil(t.group)]));
                                       console.log(`repeated for ${project.name} - ${todos.length}`, todos);
                                    }

                                    
                                    let projectFilters = [
                                        (t:Todo) => contains(t._id)(ids), 
                                        byNotDeleted,
                                        (t:Todo) => isNil(t.group) ? true : isTodayOrPast(t.attachedDate)
                                    ];  
                                    let selectedTodos = filter(this.props.todos, allPass(projectFilters));
                                    let indicator = defaultTo({completed:0, active:0})(this.props.indicators[project._id]);

                                    return <ProjectComponent  
                                        project={project}
                                        indicator={indicator}
                                        filters={this.props.filters}
                                        todos={selectedTodos}
                                        scrolledTodo={this.props.scrolledTodo}
                                        selectedTodo={this.props.selectedTodo}
                                        groupTodos={this.props.groupTodos}
                                        dispatch={this.props.dispatch} 
                                        selectedTags={this.props.selectedTags}  
                                        selectedCategory={this.props.selectedCategory}
                                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                                        selectedProjectId={this.props.selectedProjectId}
                                        dragged={this.props.dragged}  
                                        selectedAreaId={this.props.selectedAreaId} 
                                        projects={this.props.projects}  
                                        areas={this.props.areas}
                                        rootRef={this.rootRef} 
                                    />
                                }  
                            ],
                            [  
                                (selectedCategory:Category) : boolean => 'area'===selectedCategory,  
                                () => {
                                    let area = this.props.areas.find((a) => this.props.selectedAreaId===a._id);

                                    if(isNil(area)){ return null }
 
                                    return <AreaComponent    
                                        area={area}   
                                        filters={this.props.filters}
                                        indicators={this.props.indicators}
                                        todos={this.props.todos}  
                                        scrolledTodo={this.props.scrolledTodo}
                                        groupTodos={this.props.groupTodos}
                                        areas={this.props.areas} 
                                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                                        selectedCategory={this.props.selectedCategory}
                                        selectedAreaId={this.props.selectedAreaId} 
                                        selectedTags={this.props.selectedTags} 
                                        dispatch={this.props.dispatch}      
                                        selectedProjectId={this.props.selectedProjectId}
                                        projects={this.props.projects} 
                                        rootRef={this.rootRef}
                                    />  
                                }   
                            ], 
                            [  
                                (selectedCategory:Category) : boolean => 'search'===selectedCategory,  
                                () => <Search {...{indicators:this.props.indicators} as any}/>
                            ],
                            [  
                                (selectedCategory:Category) : boolean => 'tag'===selectedCategory,  
                                () => <Tag {...{} as any}/>
                            ]  
                        ])(this.props.selectedCategory) 
                    }  
                </div>    
        </div> 
    } 
};   
 



 





 
















