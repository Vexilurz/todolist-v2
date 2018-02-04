import './../assets/styles.css';   
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';   
import { ipcRenderer, remote } from 'electron';
import IconButton from 'material-ui/IconButton';  
import { Component } from "react"; 
import { 
    attachDispatchToProps, uppercase, insideTargetArea, 
    chooseIcon, debounce, byTags, byCategory, generateEmptyTodo, isArray, isTodo, isProject, 
    isArea, isArrayOfAreas, isArrayOfProjects, isArrayOfTodos, assert,  
    selectNeverTodos, updateNeverTodos, oneDayBehind, convertDates, 
    convertTodoDates, convertProjectDates, convertAreaDates, clearStorage, oneDayAhead, measureTime, 
    byAttachedToArea, byAttachedToProject, byNotCompleted, byNotDeleted, isTodayOrPast, byDeleted, 
    byCompleted, isToday, byNotSomeday, daysRemaining, byScheduled, yearFromNow, getFromJsonStorage, 
    setToJsonStorage, isDate, timeDifferenceHours, isNewVersion
} from "../utils";   
import { connect } from "react-redux"; 
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { getTodos, updateTodo, Todo, removeTodo, addTodo, getProjects, 
    getAreas, queryToProjects, queryToAreas, Project, Area, initDB, removeArea, 
    removeProject, destroyEverything, addArea, addProject, generateId, addTodos, 
    addProjects, addAreas, Heading, LayoutItem, getCalendars, Calendar} from '.././database';
import { Store, isDev } from '.././app';    
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import { AreaComponent } from './Area/Area';
import { ProjectComponent } from './Project/Project';
import { Trash, TrashPopup } from './Categories/Trash';
import { Logbook } from './Categories/Logbook';
import { Someday } from './Categories/Someday';
import { Next } from './Categories/Next';  
import { Upcoming } from './Categories/Upcoming';
import { Today } from './Categories/Today';
import { Inbox } from './Categories/Inbox';
import { FadeBackgroundIcon } from './FadeBackgroundIcon';
import { generateRandomDatabase } from '../generateRandomObjects';
import { 
    isEmpty, last, isNil, contains, all, not, assoc, flatten, 
    toPairs, map, compose, allPass, cond 
} from 'ramda';
import { isString } from 'util';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber"; 
import { Subscription } from 'rxjs/Rx';
import { RightClickMenu } from './RightClickMenu';
import { RepeatPopup } from './RepeatPopup';
import { Search } from './Search';
import { filter as lodashFilter } from 'lodash';
import { CalendarProps, CalendarEvent, getIcalData, IcalData, AxiosError, updateCalendars } from './Calendar';
import { UpdateInfo, UpdateCheckResult } from 'electron-updater';
import { analytics } from '../analytics';
let Promise = require('bluebird');    
  

export let filter = (array:any[],f:Function,caller:string) : any[] => {
    let start : number = performance.now();
    let result = lodashFilter(array,f); 
    let finish : number = performance.now();
    
    if(isDev()){ 
        if(array.length>100){
           console.log(`filter ${array.length} items ${(finish - start)} ms caller : ${caller}`);  
        }
    }
       
    return result;
}



export let checkForUpdates = () : Promise<UpdateCheckResult> => new Promise(
    (resolve) => { 
        ipcRenderer.removeAllListeners("checkForUpdates");  
        ipcRenderer.send("checkForUpdates");
        ipcRenderer.on(
            "checkForUpdates",
            (event,updateCheckResult:UpdateCheckResult) => resolve(updateCheckResult)
        ) 
    }    
)


export let downloadUpdates = () : Promise<any> => new Promise(
    (resolve) => { 
        ipcRenderer.removeAllListeners("downloadUpdates");  
        ipcRenderer.send("downloadUpdates");
        ipcRenderer.on("downloadUpdates", (event,path:any) => resolve(path))  
    }     
)



export let getDateUpperLimit = (areas:Area[], projects:Project[], todos:Todo[], currentLimit:Date) => {
        let pIds = flatten( projects.map( (p:Project) => p.layout.filter(isString) ) );
        let aIds = flatten( areas.map( (a:Area) => a.attachedTodosIds ) );
        let attached : Todo[] = filter( 
           todos,
          (todo:Todo) => contains(todo._id)(pIds) || contains(todo._id)(aIds), 
          "getDateUpperLimit"
        );

        let futureLimit = new Date();

        for(let i = 0; i < attached.length; i++){
            let todo : Todo = attached[i];
            if(isNil(todo.attachedDate)){ continue }
            if(todo.attachedDate.getTime() > futureLimit.getTime()){
                futureLimit = new Date(todo.attachedDate.getTime());
            }
        }   

        return futureLimit.getTime() > currentLimit.getTime() ? futureLimit : currentLimit;
}


export let selectTodos = (areas, projects, todos, limit) => {
    let isRepeated = (todo:Todo) => not(isNil(todo.group));
    let isAfterLimit = (limit:Date) => 
                        (todo:Todo) => isNil(todo.attachedDate) ? false : 
                                        todo.attachedDate.getTime() >
                                        limit.getTime();  
    
    let limitByProjects = getDateUpperLimit(areas, projects, todos, limit); 
    let selected = filter( 
        todos,
        (todo:Todo) => {
            if(isRepeated(todo) && isAfterLimit(limitByProjects)(todo)){
                return false; //throw away 
            }else{
                return true; //keep
            }
        },
        "selected" 
    );

    return selected;
}


export type Category = "inbox" | "today" | "upcoming" | "next" | "someday" | 
                       "logbook" | "trash" | "project" | "area" | "evening" | 
                       "deadline" | "search" | "group"
 
                      

interface MainContainerState{ fullWindowSize:boolean }
 

@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)   
export class MainContainer extends Component<Store,MainContainerState>{
    rootRef:HTMLElement;  
    limit:number;
    subscriptions:Subscription[]; 

    constructor(props){ 
        super(props);  

        this.limit = 10000;
        
        this.subscriptions = [];

        console.log(analytics); 

        this.state = { fullWindowSize:true };

        this.initData(); 
    }  
    
     
     //TODO Test
     requestAdditionalNeverTodos = () : void => { 
        let {todos, dispatch, limit} = this.props;
        let tomorrow : Date = oneDayAhead(); 

        let never = selectNeverTodos(todos) //last === true, last item in sequence  
                    .filter(
                      (todo:Todo) => todo.attachedDate.getTime() <= tomorrow.getTime()
                    );   
  
        if(!isEmpty(never)){ updateNeverTodos(dispatch,never,limit) }
    }
  

    onError = (e) => { console.log(e) } //TODO submit report

 
    isMainWindow = () => { 
        return this.props.windowId===1; 
    }
    

    initData = () => {

        if(not(this.isMainWindow())){ return }  

        if(isDev()){
    
            destroyEverything()    
            .then(() => {  
                initDB();
                let fakeData = generateRandomDatabase({todos:215, projects:38, areas:15});      
                    
                let todos = fakeData.todos; 
                let projects = fakeData.projects; 
                let areas = fakeData.areas; 
                    
                Promise.all([ 
                    addTodos(this.onError,todos),    
                    addProjects(this.onError,projects), 
                    addAreas(this.onError,areas),  
                    clearStorage()     
                ]) 
                .then(() => this.fetchData())    
            });

        }else{ this.fetchData() }
    }


    fetchData = () => { 
        let {clone,dispatch} = this.props;
        
        if(clone){ return }
      
        Promise.all([
            getCalendars(this.onError)(true, this.limit), 
            getProjects(this.onError)(true, this.limit),
            getAreas(this.onError)(true, this.limit),
            getTodos(this.onError)(true, this.limit)
        ])
        .then(
            ([calendars,projects,areas,todos]) => [
                calendars,
                projects.map(convertProjectDates),
                areas.map(convertAreaDates),
                todos.map(convertTodoDates)
            ]
        )
        .then(
            ([calendars,projects,areas,todos]) => {
                let {limit} = this.props; 
                let selected = selectTodos(areas, projects, todos, limit);
           
                dispatch({type:"setProjects", load:projects});
                dispatch({type:"setAreas", load:areas});
                dispatch({type:"setTodos", load:selected});

                return updateCalendars(calendars, this.onError);
            }
        )
        .then(
            (calendars) => dispatch({type:"setCalendars", load:calendars})
        )
    } 


    initObservables = () => { 
        let {dispatch} = this.props; 
        let minute = 1000 * 60;  
        let intervalHours = 72 

        let updateProgress = Observable.fromEvent(
                                ipcRenderer, 
                                "download-progress",  
                                (event,progressObj) => progressObj 
                             ).subscribe( 
                                (progressObj) => dispatch({type:"progress",load:progressObj})
                             );  

         
        let updates = Observable
                        .interval(1 * minute) 
                        .flatMap( (p) => getFromJsonStorage("lastUpdatesCheck") )
                        .filter( (data:{lastUpdatesCheck:Date}) => 
                            isNil(data.lastUpdatesCheck) ||
                            timeDifferenceHours(data.lastUpdatesCheck,new Date())>=intervalHours
                        )     
                        .flatMap((data:{lastUpdatesCheck:Date}) => checkForUpdates())
                        .subscribe(
                            (updateCheckResult:UpdateCheckResult) => {
                                let {updateInfo} = updateCheckResult;
                                let currentAppVersion = remote.app.getVersion(); 
                                let canUpdate = isNewVersion(currentAppVersion,updateInfo.version);
                                if(canUpdate){ dispatch({type:"showUpdatesNotification", load:true}) };
                            }
                        ); 
      
        let calendars = Observable.interval(5 * minute)
                        .flatMap( () =>  updateCalendars(this.props.calendars, this.onError))
                        .subscribe( 
                            (calendars:Calendar[]) => this.props.dispatch({type:"setCalendars", load:calendars}) 
                        );

  
        let resize = Observable
                    .fromEvent(window,"resize")
                    .debounceTime(100) 
                    .subscribe(
                        () => this.props.dispatch({type:"leftPanelWidth", load:window.innerWidth/3.7})
                    );
 
        let click = Observable  
                    .fromEvent(window,"click")
                    .debounceTime(100)
                    .subscribe(() => {
                        if(this.props.showRightClickMenu){
                           this.props.dispatch({type:"showRightClickMenu", load:false})
                        }
                    }); 

        this.subscriptions.push(resize,click,updates,calendars,updateProgress);
    }
  

    componentDidMount(){   
        this.requestAdditionalNeverTodos();  
        this.initObservables(); 
    }      
     

    componentWillUnmount(){ 
        this.subscriptions.map( s => s.unsubscribe() );
    }  
 

    componentWillReceiveProps(nextProps){
        if(this.props.selectedCategory!==nextProps.selectedCategory){
           if(this.rootRef){ this.rootRef.scrollTop=0; } 
        }
    }
     
    
    render(){  
        let { 
            todos, projects, areas, selectedProjectId, 
            selectedAreaId, showCompleted, showScheduled,
            selectedCategory 
        } = this.props;

        return  <div ref={(e) => { this.rootRef=e }}
                    className="scroll"  
                    id="maincontainer"  
                    style={{    
                       flexGrow:1,  
                       overflowX:"hidden",
                       height:`${window.innerHeight}px`,     
                       position:"relative",  
                       display:"flex",     
                       backgroundColor:"rgba(209, 209, 209, 0.1)", 
                       flexDirection:"column"     
                    }}  
                >  
                <RightClickMenu {...{} as any}/> 
                <RepeatPopup {...{} as any}/>  
                <div style={{display: "flex", padding: "10px"}}>   
                    <div className="no-drag" style={{position: "fixed", top: 0, right: 0}}>  
                        { 
                            not(isDev()) ? null : 
                            <IconButton  
                                iconStyle={{
                                    color:"rgba(100,100,100,0.6)",
                                    opacity:0,
                                    width:"18px",
                                    height:"18px" 
                                }} 
                                className="no-drag" 
                                onTouchTap={() => {
                                    ipcRenderer.send("reload", this.props.windowId);
                                }}
                            > 
                                <Refresh />   
                            </IconButton>  
                        }
                        {     
                            this.props.clone ? null :
                            <IconButton    
                                onClick={() => { 
                                   let clonedStore = {...this.props};
                                   clonedStore.windowId = undefined;
                                   ipcRenderer.send("cloneWindow", clonedStore);
                                }}     
                                className="no-drag"  
                                iconStyle={{color:"rgba(100,100,100,0.6)",width:"18px",height:"18px"}}
                            >     
                                <OverlappingWindows />
                            </IconButton> 
                        } 
                    </div>   
                </div>  
                <div style={{ 
                    paddingLeft:"60px", 
                    paddingRight:"60px",
                    paddingBottom:"60px",
                    paddingTop:"10px"
                }}>
                    {    
                        cond([  
                            [ 
                                (selectedCategory:string) : boolean => 'inbox'===selectedCategory,  
                                () => {

                                    let inboxFilters = [
                                        (todo:Todo) => not(byAttachedToArea(this.props.areas)(todo)), 
                                        (todo:Todo) => not(byAttachedToProject(this.props.projects)(todo)), 
                                        (todo:Todo) => isNil(todo.attachedDate), 
                                        (todo:Todo) => isNil(todo.deadline), 
                                        byCategory("inbox"), 
                                        byNotCompleted,  
                                        byNotDeleted 
                                    ];  

                                    return <Inbox 
                                        todos={filter(todos, allPass(inboxFilters), "Inbox")} 
                                        dispatch={this.props.dispatch}
                                        selectedCategory={this.props.selectedCategory}
                                        selectedTag={this.props.selectedTag} 
                                        selectedProjectId={this.props.selectedProjectId}
                                        selectedAreaId={this.props.selectedAreaId} 
                                        rootRef={this.rootRef}
                                        areas={this.props.areas}
                                        projects={this.props.projects}
                                        tags={this.props.tags}
                                    />
                                }
                            ],  
                            [ 
                                (selectedCategory:string) : boolean => 'today'===selectedCategory,  
                                () => {

                                    let todayFilters = [   
                                        (t:Todo) => isTodayOrPast(t.attachedDate) || isTodayOrPast(t.deadline), 
                                        byNotCompleted,  
                                        byNotDeleted   
                                    ];   

                                    return <Today  
                                        todos={filter(todos, allPass(todayFilters), "Today")}
                                        dispatch={this.props.dispatch}
                                        selectedProjectId={this.props.selectedProjectId}
                                        selectedAreaId={this.props.selectedAreaId} 
                                        selectedCategory={this.props.selectedCategory}
                                        selectedTag={this.props.selectedTag}
                                        areas={this.props.areas}
                                        projects={this.props.projects}
                                        rootRef={this.rootRef} 
                                        tags={this.props.tags}
                                        showCalendarEvents={this.props.showCalendarEvents}
                                        calendars={this.props.calendars}
                                    />
                                }
                            ],  
                            [ 
                                (selectedCategory:string) : boolean => 'trash'===selectedCategory,  
                                () => {
                                
                                    return <Trash    
                                        todos={filter(todos, byDeleted, "Trash")}  
                                        dispatch={this.props.dispatch} 
                                        tags={this.props.tags}
                                        selectedCategory={this.props.selectedCategory}
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
                                (selectedCategory:string) : boolean => 'logbook'===selectedCategory,  
                                () => {

                                    let logbookFilters = [byCompleted, byNotDeleted]; 

                                    return <Logbook   
                                        todos={filter(todos, allPass(logbookFilters), "Logbook")} 
                                        dispatch={this.props.dispatch}
                                        selectedCategory={this.props.selectedCategory} 
                                        selectedAreaId={this.props.selectedAreaId} 
                                        selectedProjectId={this.props.selectedProjectId}
                                        areas={this.props.areas}
                                        projects={this.props.projects}
                                        selectedTag={this.props.selectedTag} 
                                        tags={this.props.tags} 
                                        rootRef={this.rootRef}
                                    />
                                }
                            ], 
                            [ 
                                (selectedCategory:string) : boolean => 'someday'===selectedCategory,  
                                () => {

                                    let somedayFilters = [
                                        byCategory("someday"),
                                        byNotCompleted, 
                                        byNotDeleted 
                                    ];
                                
                                    return <Someday 
                                        todos={filter(todos, allPass(somedayFilters), "Someday")}
                                        dispatch={this.props.dispatch}
                                        selectedProjectId={this.props.selectedProjectId}
                                        selectedAreaId={this.props.selectedAreaId} 
                                        selectedCategory={this.props.selectedCategory}
                                        selectedTag={this.props.selectedTag}
                                        rootRef={this.rootRef}
                                        areas={this.props.areas}
                                        projects={this.props.projects}
                                        tags={this.props.tags}
                                    /> 
                                }
                            ], 
                            [ 
                                (selectedCategory:string) : boolean => 'next'===selectedCategory,  
                                () => {

                                    let nextFilters =  [
                                        (t:Todo) => not(isToday(t.attachedDate)) && not(isToday(t.deadline)),
                                        (t:Todo) => isNil(t.attachedDate) && isNil(t.deadline),
                                        (t:Todo) => t.category!=="inbox",  
                                        byNotCompleted,  
                                        byNotDeleted 
                                    ]; 
                                
                                    return <Next   
                                        todos={filter(todos, allPass(nextFilters), "Next")}
                                        dispatch={this.props.dispatch}
                                        selectedCategory={this.props.selectedCategory}
                                        selectedTag={this.props.selectedTag}
                                        rootRef={this.rootRef}
                                        selectedProjectId={this.props.selectedProjectId}
                                        selectedAreaId={this.props.selectedAreaId} 
                                        areas={this.props.areas}
                                        projects={this.props.projects} 
                                        tags={this.props.tags}
                                    />
                                }
                            ],
                            [ 
                                (selectedCategory:string) : boolean => 'upcoming'===selectedCategory,  
                                () => {

                                    let upcomingFilters = [
                                        (t:Todo) => t.category!=="inbox",  
                                        byScheduled,
                                        byNotCompleted,  
                                        byNotDeleted   
                                    ];

                                    return <Upcoming  
                                        limit={this.props.limit}
                                        todos={filter(todos, allPass(upcomingFilters), "Upcoming")}
                                        dispatch={this.props.dispatch}
                                        selectedCategory={this.props.selectedCategory}
                                        areas={this.props.areas}
                                        selectedAreaId={this.props.selectedAreaId}
                                        selectedProjectId={this.props.selectedProjectId}
                                        projects={this.props.projects}
                                        selectedTag={this.props.selectedTag}
                                        tags={this.props.tags} 
                                        rootRef={this.rootRef}
                                        showCalendarEvents={this.props.showCalendarEvents}
                                        calendars={this.props.calendars} 
                                    />
                                }
                            ],
                            [ 
                                (selectedCategory:string) : boolean => 'project'===selectedCategory,  
                                () => {

                                    let project = projects.find((p:Project) => selectedProjectId===p._id);
                                    let ids = project.layout.filter(isString);
                                    let byContainedInLayout = (t:Todo) => contains(t._id)(ids);
                                    let projectFilters = [ byContainedInLayout, byNotDeleted ].filter( f => f );  
                                 
                                    return <ProjectComponent 
                                        project={project}
                                        todos={filter(todos, allPass(projectFilters), "projectTodos")}
                                        dispatch={this.props.dispatch} 
                                        selectedTag={this.props.selectedTag}  
                                        selectedCategory={this.props.selectedCategory}
                                        selectedProjectId={this.props.selectedProjectId}
                                        dragged={this.props.dragged} 
                                        showScheduled={this.props.showScheduled}
                                        showCompleted={this.props.showCompleted}
                                        selectedAreaId={this.props.selectedAreaId} 
                                        projects={this.props.projects}  
                                        areas={this.props.areas}
                                        rootRef={this.rootRef} 
                                        tags={this.props.tags} 
                                    />
                                } 
                            ],
                            [ 
                                (selectedCategory:string) : boolean => 'area'===selectedCategory,  
                                () => {
                                    
                                    let area = areas.find((a) => selectedAreaId===a._id);
                                    let selectedProjects = projects.filter(
                                        (p) => contains(p._id)(area.attachedProjectsIds)
                                    );
                                    let ids = flatten([
                                        area.attachedTodosIds,
                                        selectedProjects.map((p) => p.layout.filter(isString))
                                    ]);

                                    return <AreaComponent    
                                        area={area} 
                                        todos={filter(todos, (todo:Todo) => contains(todo._id)(ids), "area")}
                                        areas={this.props.areas}
                                        selectedCategory={this.props.selectedCategory}
                                        selectedAreaId={this.props.selectedAreaId}
                                        selectedTag={this.props.selectedTag}
                                        dispatch={this.props.dispatch}      
                                        selectedProjectId={this.props.selectedProjectId}
                                        projects={this.props.projects} 
                                        tags={this.props.tags}
                                        rootRef={this.rootRef}
                                    /> 
                                }
                            ], 
                            [ 
                                (selectedCategory:string) : boolean => 'search'===selectedCategory,  
                                () => <Search {...{} as any}/>
                            ]
                        ])(selectedCategory) 
                    }  
                </div>    
        </div> 
    }
}  
 



 





 
















