import './../assets/styles.css';   
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';   
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton';  
import { Component } from "react"; 
import {isDev} from "../utils/isDev"; 
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Hide from 'material-ui/svg-icons/navigation/arrow-drop-down';
import { Provider, connect } from "react-redux";
import { Todo, Project, Area, Calendar, Category } from '.././types';
import Print from 'material-ui/svg-icons/action/print';  
import { AreaComponent } from './Area/Area';
import { ProjectComponent } from './Project/Project';
import { Trash } from './Categories/Trash';
import { Logbook } from './Categories/Logbook';
import { Someday } from './Categories/Someday';
import { Next } from './Categories/Next';  
import { Upcoming, extend } from './Categories/Upcoming';
import { Today } from './Categories/Today';
import { Inbox } from './Categories/Inbox';
import { isNil, contains, not, evolve, map, compose, allPass, cond, defaultTo, when, prop} from 'ramda';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber"; 
import { Subscription } from 'rxjs/Rx';
import { RightClickMenu } from './RightClickMenu';
import { RepeatPopup } from './RepeatPopup';
import { Search } from './Search';
import { filter } from 'lodash';
import { updateCalendars, convertEventDate } from './Calendar';
import { globalErrorHandler } from '../utils/globalErrorHandler';
import { updateConfig } from '../utils/config';
import { isNotArray, isDate, isTodo, isString, isNotNil } from '../utils/isSomething';
import { assert } from '../utils/assert';
import { isNewVersion } from '../utils/isNewVersion';
import { UpdateCheckResult } from 'electron-updater';
import { setCallTimeout } from '../utils/setCallTimeout';
import { requestFromMain } from '../utils/requestFromMain';
import { getData } from '../utils/getData';
import { WhenCalendar } from './WhenCalendar';
import { 
    getIntroList, introListLayout, isNotEmpty, checkForUpdates, 
    convertDates, printElement, introListIds, byNotDeleted, log
} from '../utils/utils';
import { threeDaysLater, inPast, oneMinuteLater, fourteenDaysLater, fiveMinutesLater } from '../utils/time'; 
const moment = require("moment");   
const path = require('path');
let uniqid = require("uniqid"); 



interface MainContainerProps{
    dispatch:Function, 

    selectedCategory:Category,

    limit:Date,
    nextUpdateCheck:Date,
    nextBackupCleanup:Date,

    selectedTodo:Todo, 
    scrolledTodo:Todo,

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
    indicators : { 
        [key:string]:{
            active:number,
            completed:number,
            deleted:number
        }; 
    },
    amounts:{
        inbox:number,
        today:number,
        hot:number,
        next:number,
        someday:number,
        logbook:number,
        trash:number
    },

    calendars:Calendar[],
    projects:Project[],
    areas:Area[],
    todos:Todo[],

    selectedProjectId:string,
    selectedAreaId:string,
    moveCompletedItemsToLogbook:string,
    selectedTag:string,
    dragged:string,

    cloneWindow:() => void
} 


interface MainContainerState{ 
    fullWindowSize:boolean,
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
        this.state = {fullWindowSize:true, separateWindowsCount:0};
    };  


      
    onError = (e) => globalErrorHandler(e); 



    initData : (clone:boolean) => Promise<void> = when(
        not, 
        () => getData(this.props.limit,this.onError,100000).then(
            ({projects, areas, todos, calendars}) => this.setData({
                projects:defaultTo([], projects), 
                areas:defaultTo([], areas), 
                todos:defaultTo([], todos), 
                calendars:map(
                    evolve({events:map(convertEventDate)}),
                    defaultTo([], calendars)
                )
            }) 
        )
    );
        


    addIntroList = (projects:Project[]) => {
        let {dispatch} = this.props;

        if(this.props.firstLaunch){  
            let alreadyExists = projects.find((p:Project) => p._id==="Intro List");
            if(not(alreadyExists)){  
                dispatch({
                    type:"multiple",
                    load:[
                        {type:"addTodos", load:introListLayout.filter(isTodo)},
                        {type:"addProject", load:getIntroList()}  
                    ]
                }); 
            }
        }; 
    };



    setData = ({projects, areas, todos, calendars}) : void => {
        
        let actions = [];
        let showHint = not(this.props.hideHint);
        let selectedTodos = filter(todos, isTodo);

        if(this.props.clone){ return } 

        actions.push({type:"setProjects", load:[...projects]});
        
        actions.push({type:"setAreas", load:[...areas]});

        actions.push({type:"setTodos", load:[...selectedTodos]});

        actions.push({type:"setCalendars", load:calendars});

        this.addIntroList(projects);  

        let extended = extend(this.props.limit, selectedTodos);

        if(isNotEmpty(extended)){ 
           actions.push({type:"addTodos", load:extended}); 
        }

        this.props.dispatch({type:"multiple",load:actions});

        //if calendars not empty - hide hint
        if(
           isNotEmpty(calendars) && 
           showHint
        ){
           updateConfig({hideHint:true})
           .then( 
                config => this.props.dispatch({type:"updateConfig",load:config}) 
           ) 
        }

    };
    
    

    initUpdateTimeout = () : void => {
        let {dispatch, nextUpdateCheck} = this.props;

        if(isDev()){
           console.log(`nextUpdateCheck - ${nextUpdateCheck}`);
        }

        let check = () =>
            checkForUpdates()  
            .then(
                (updateCheckResult:UpdateCheckResult) => requestFromMain<any>(
                   'getVersion',
                    [],
                    (event, currentAppVersion) => [updateCheckResult, currentAppVersion]
                )
            )
            .then( 
                ([updateCheckResult, currentAppVersion]) => {
                    let {updateInfo} = updateCheckResult;
                    let canUpdate = isNewVersion(currentAppVersion,updateInfo.version);
                    let next = isDev() ? fiveMinutesLater(new Date()) : threeDaysLater(new Date());

                    return updateConfig({nextUpdateCheck:next}).then( config => [config,canUpdate] );
                }
            )
            .then(
                ([config,canUpdate]) => {
                    let actions = [{type:"updateConfig",load:config}];
                    
                    if(canUpdate){ 
                       actions.push({type:"showUpdatesNotification", load:true});
                    } 

                    dispatch({type:"multiple",load:actions}); 

                    this.initUpdateTimeout();
                }
            );   
          
 
        if(
            isNil(nextUpdateCheck) || 
            inPast(new Date(nextUpdateCheck))
        ){ 
            check(); 
        }else{
            this.timeouts.push(
                 setCallTimeout( () => check(), new Date(nextUpdateCheck) )
            );
        }
    };



    initBackupCleanupTimeout = () : void => {
        let {dispatch, nextBackupCleanup} = this.props;

        if(isDev()){
           console.log(` nextBackupCleanup - ${nextBackupCleanup} `);
        }
 
        let cleanup = () => 
        requestFromMain<any>(
            'backupCleanup',
            [],
            (event) => event
        )
        .then(() => {
            let next = isDev() ? fiveMinutesLater(new Date()) : fourteenDaysLater(new Date());

            return updateConfig({nextBackupCleanup:next});
        })
        .then(
            config => {
                dispatch({type:"updateConfig",load:config});

                this.initBackupCleanupTimeout(); 
            }
        );


        if(
            isNil(nextBackupCleanup)  || 
            inPast(new Date(nextBackupCleanup))
        ){ 
            cleanup(); 
        }else{
            this.timeouts.push(
                setCallTimeout(
                    () => cleanup(), 
                    new Date(nextBackupCleanup)
                )
            );
        }
    };

 

    initObservables = () => {  
        let {dispatch} = this.props; 
        let minute = 1000 * 60;  
 
        this.subscriptions.push( 
            Observable
                .interval(5*minute)
                .subscribe(() => 
                    requestFromMain<any>(
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
                    when(
                        isNotEmpty, 
                        load => dispatch({type:"updateCalendars",load})
                    )
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
                .interval(3*minute)
                .subscribe((v) => dispatch({type:'update'})),  



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
        this.initData(this.props.clone); 
        this.initUpdateTimeout();
        this.initBackupCleanupTimeout();
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
                    <div 
                      style={{
                        display:"flex", 
                        zIndex:20000,
                        alignItems:"center", 
                        position:"fixed", 
                        top:0,  
                        right:"15px"
                      }}
                    >  
                        { 
                            this.props.clone ? null :
                            <IconButton  
                                iconStyle={{color:"rgba(100,100,100,0.6)",height:"22px",width:"22px"}} 
                                onTouchTap={this.printCurrentList}
                            > 
                                <Print />   
                            </IconButton>   
                        } 
                        
                        {     
                            this.props.clone ? null :
                            this.state.separateWindowsCount>this.maxSepWindows ? null :
                            <IconButton    
                                iconStyle={{color:"rgba(100,100,100,0.6)",width:"18px",height:"18px"}}
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

                                    if(isDev()){
                                        assert(
                                           inboxTodos.length===this.props.amounts.inbox,
                                           `Amounts dont match. Inbox. ${inboxTodos.length}:${this.props.amounts.inbox}.`
                                        ) 
                                    }

                                    return <Inbox 
                                        todos={inboxTodos} 
                                        filters={this.props.filters}
                                        dispatch={this.props.dispatch}
                                        selectedCategory={this.props.selectedCategory}
                                        groupTodos={this.props.groupTodos}
                                        selectedTodo={this.props.selectedTodo}
                                        scrolledTodo={this.props.scrolledTodo}
                                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                                        selectedTag={this.props.selectedTag} 
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

                                    if(isDev()){
                                        assert(
                                            todayTodos.length===(this.props.amounts.today+this.props.amounts.hot),
                                           `
                                           Amounts dont match. 
                                           Today. 
                                           ${todayTodos.length}:${(this.props.amounts.today+this.props.amounts.hot)}.
                                           `
                                        ) 
                                    }

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
                                        selectedTag={this.props.selectedTag}
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

                                    if(isDev()){
                                        assert(
                                            selectedTodos.length===this.props.amounts.someday,
                                           `Amounts dont match. Someday. ${selectedTodos.length}:${this.props.amounts.someday}.`
                                        ) 
                                    }

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
                                        selectedTag={this.props.selectedTag}
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
                                    let projects = this.props.projects.filter(
                                        (item:Project) : boolean => not( contains(item._id,introListIds) )
                                    );

                                    if(isDev()){
                                        assert(
                                            nextTodos.length===this.props.amounts.next,
                                           `Amounts dont match. Next. ${nextTodos.length}:${this.props.amounts.next}.`
                                        ) 
                                    }

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
                                        selectedTag={this.props.selectedTag}
                                        rootRef={this.rootRef}
                                        selectedProjectId={this.props.selectedProjectId}
                                        selectedAreaId={this.props.selectedAreaId} 
                                        areas={this.props.areas} 
                                        projects={projects} 
                                    />
                                }
                            ],  
                            [ 
                                (selectedCategory:Category) : boolean => 'trash'===selectedCategory,  
                                () => {
                                    let trashTodos = filter(this.props.todos, allPass(this.props.filters.trash));


                                    if(isDev()){
                                        assert(
                                            trashTodos.length===this.props.amounts.trash,
                                           `Amounts dont match. Trash. ${trashTodos.length}:${this.props.amounts.trash}.`
                                        ) 
                                    }


                                    return <Trash    
                                        todos={trashTodos}
                                        groupTodos={this.props.groupTodos}  
                                        indicators={this.props.indicators}
                                        dispatch={this.props.dispatch} 
                                        scrolledTodo={this.props.scrolledTodo}
                                        selectedCategory={this.props.selectedCategory}
                                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                                        selectedTag={this.props.selectedTag} 
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

                                    if(isDev()){
                                        assert(
                                            logbookTodos.length===this.props.amounts.logbook,
                                           `Amounts dont match. Logbook. ${logbookTodos.length}:${this.props.amounts.logbook}.`
                                        ) 
                                    }

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
                                        selectedTag={this.props.selectedTag} 
                                        rootRef={this.rootRef}
                                    />
                                }
                            ], 
                            [ 
                                (selectedCategory:Category) : boolean => 'upcoming'===selectedCategory,  
                                () => {
                                    let upcomingFilters = this.props.filters.upcoming;
                                    let upcomingTodos = filter(this.props.todos, allPass(upcomingFilters));

                                    return <Upcoming  
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
                                        selectedTag={this.props.selectedTag}
                                        rootRef={this.rootRef}
                                        showCalendarEvents={this.props.showCalendarEvents}
                                        calendars={this.props.calendars} 
                                    />
                                }
                            ], 
                            [ 
                                (selectedCategory:Category) : boolean => 'project'===selectedCategory,  
                                () => {
                                    let project = this.props.projects.find(
                                        (p:Project) => this.props.selectedProjectId===p._id
                                    );
 
                                    if(isNil(project)){ return null }

                                    let ids = project.layout.filter(isString);

                                    let projectFilters = [(t:Todo) => contains(t._id)(ids), byNotDeleted];  
                                 
                                    let selectedTodos = filter(this.props.todos, allPass(projectFilters));

                                    let indicator = defaultTo({completed:0, active:0})(
                                        this.props.indicators[project._id]
                                    );

                                    return <ProjectComponent  
                                        project={project}
                                        indicator={indicator}
                                        filters={this.props.filters}
                                        todos={selectedTodos}
                                        scrolledTodo={this.props.scrolledTodo}
                                        selectedTodo={this.props.selectedTodo}
                                        groupTodos={this.props.groupTodos}
                                        dispatch={this.props.dispatch} 
                                        selectedTag={this.props.selectedTag}  
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
                                        selectedTag={this.props.selectedTag}
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
                            ] 
                        ])(this.props.selectedCategory) 
                    }  
                </div>    
        </div> 
    } 
};   
 



 





 
















