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
    byCompleted, isToday, byNotSomeday, daysRemaining, byScheduled 
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



export type Category = "inbox" | "today" | "upcoming" | "next" | "someday" | 
                       "logbook" | "trash" | "project" | "area" | "evening" | 
                       "deadline" | "search" | "group"
 
                      

interface MainContainerState{ fullWindowSize:boolean }
 

@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)   
export class MainContainer extends Component<Store,MainContainerState>{
    rootRef:HTMLElement;  
    limit:number;
    subscriptions:Subscription[]; 
    events:number;  

    inboxFilters:((todo:Todo) => boolean)[];
    todayFilters:((todo:Todo) => boolean)[];
    logbookFilters:((todo:Todo) => boolean)[];
    somedayFilters:((todo:Todo) => boolean)[];
    nextFilters:((todo:Todo) => boolean)[];
    upcomingFilters:((todo:Todo) => boolean)[];

    constructor(props){ 
        super(props);  

        this.inboxFilters = [
            (todo:Todo) => not(byAttachedToArea(this.props.areas)(todo)), 
            (todo:Todo) => not(byAttachedToProject(this.props.projects)(todo)), 
            (todo:Todo) => isNil(todo.attachedDate), 
            (todo:Todo) => isNil(todo.deadline), 
            byCategory("inbox"), 
            byNotCompleted,  
            byNotDeleted 
        ];  
 
        this.todayFilters = [   
            (t:Todo) => isTodayOrPast(t.attachedDate) || isTodayOrPast(t.deadline), 
            byNotCompleted,  
            byNotDeleted   
        ];   

        this.logbookFilters = [
            byCompleted, 
            byNotDeleted  
        ]; 

        this.somedayFilters = [
            byCategory("someday"),
            (t:Todo) => isNil(t.attachedDate) && isNil(t.deadline),
            byNotCompleted, 
            byNotDeleted 
        ];

        this.nextFilters =  [
            (t:Todo) => not(isToday(t.attachedDate)) && not(isToday(t.deadline)),
            (t:Todo) => isNil(t.attachedDate) && isNil(t.deadline),
            (t:Todo) => t.category!=="inbox",  
            byNotCompleted,  
            byNotDeleted 
        ]; 

        this.upcomingFilters = [
            (t:Todo) => t.category!=="inbox",  
            byScheduled,
            byNotCompleted,  
            byNotDeleted   
        ];

        this.limit = 10000;
        
        this.events = null;  

        this.subscriptions = [];

        this.state = { fullWindowSize:true };

        this.initData(); 
    }  
    
    
     //TODO Test
     requestAdditionalNeverTodos = () : void => { 
        let {todos, dispatch} = this.props;
        let tomorrow : Date = oneDayAhead(); 

        let never = selectNeverTodos(todos) //last === true, last item in sequence  
                    .filter(
                      (todo:Todo) => todo.attachedDate.getTime() <= tomorrow.getTime()
                    );   
  
        if(!isEmpty(never)){ updateNeverTodos(dispatch,never) }
    }
  

    onError = (e) => { console.log(e) } //TODO submit report

 
    isMainWindow = () => { return this.props.windowId===1 }
    

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
         
        getCalendars(this.onError)(true,this.limit)
        .then((calendars:Calendar[]) => updateCalendars(calendars, this.onError))
        .then((calendars:Calendar[]) => dispatch({type:"setCalendars", load:calendars})) 
   

        getProjects(this.onError)(true,this.limit)
        .then((projects:Project[]) => projects.map(convertProjectDates))
        .then((projects:Project[]) => dispatch({type:"setProjects", load:projects}))


        getAreas(this.onError)(true,this.limit)
        .then((areas:Area[]) => areas.map(convertAreaDates))
        .then((areas:Area[]) => dispatch({type:"setAreas", load:areas}))  


        getTodos(this.onError)(true,this.limit)
        .then((todos:Todo[]) => todos.map(convertTodoDates))
        .then((todos:Todo[]) => dispatch({type:"setTodos", load:todos}))
    } 
    
    
    initRefreshEventsInterval = () : void => {
        let delay = 1000 * 5 * 60; //every 5 minutes 

        if(isNil(this.events)){
            this.events = setInterval(
                () => {
                    let {calendars, dispatch} = this.props;
            
                    updateCalendars(calendars, this.onError)
                    .then( 
                      (calendars:Calendar[]) => dispatch({type:"setCalendars", load:calendars})
                    )  
                },    
                delay 
            ) as any;
        }
    }
 

    initObservables = () => {
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

        this.subscriptions.push(resize,click);
    }


    componentDidMount(){ 
        this.initRefreshEventsInterval();
        this.requestAdditionalNeverTodos();  
        this.initObservables();
    }      
     

    componentWillUnmount(){ 
        if(this.events){ clearInterval(this.events) }
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
                                () => <Inbox 
                                    todos={filter(todos, allPass(this.inboxFilters), "Inbox")} 
                                    dispatch={this.props.dispatch}
                                    selectedTodoId={this.props.selectedTodoId}
                                    selectedCategory={this.props.selectedCategory}
                                    selectedTag={this.props.selectedTag} 
                                    searched={this.props.searched}
                                    selectedProjectId={this.props.selectedProjectId}
                                    selectedAreaId={this.props.selectedAreaId} 
                                    rootRef={this.rootRef}
                                    areas={this.props.areas}
                                    projects={this.props.projects}
                                    tags={this.props.tags}
                                /> 
                            ],  
                            [ 
                                (selectedCategory:string) : boolean => 'today'===selectedCategory,  
                                () => <Today  
                                    todos={filter(todos, allPass(this.todayFilters), "Today")}
                                    dispatch={this.props.dispatch}
                                    selectedTodoId={this.props.selectedTodoId}
                                    searched={this.props.searched}
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
                            ],  
                            [ 
                                (selectedCategory:string) : boolean => 'trash'===selectedCategory,  
                                () => <Trash    
                                    todos={filter(todos, byDeleted, "Trash")}  
                                    dispatch={this.props.dispatch} 
                                    tags={this.props.tags}
                                    searched={this.props.searched}
                                    selectedCategory={this.props.selectedCategory}
                                    selectedTag={this.props.selectedTag}
                                    selectedTodoId={this.props.selectedTodoId}  
                                    showTrashPopup={this.props.showTrashPopup}
                                    selectedProjectId={this.props.selectedProjectId}
                                    selectedAreaId={this.props.selectedAreaId} 
                                    projects={this.props.projects}
                                    areas={this.props.areas}
                                    rootRef={this.rootRef}      
                                /> 
                            ],  
                            [ 
                                (selectedCategory:string) : boolean => 'logbook'===selectedCategory,  
                                () => <Logbook   
                                    todos={filter(todos, allPass(this.logbookFilters), "Logbook")} 
                                    dispatch={this.props.dispatch}
                                    selectedTodoId={this.props.selectedTodoId}
                                    selectedCategory={this.props.selectedCategory} 
                                    searched={this.props.searched}
                                    selectedAreaId={this.props.selectedAreaId} 
                                    selectedProjectId={this.props.selectedProjectId}
                                    areas={this.props.areas}
                                    projects={this.props.projects}
                                    selectedTag={this.props.selectedTag} 
                                    tags={this.props.tags} 
                                    rootRef={this.rootRef}
                                />
                            ], 
                            [ 
                                (selectedCategory:string) : boolean => 'someday'===selectedCategory,  
                                () => <Someday 
                                    todos={filter(todos, allPass(this.somedayFilters), "Someday")}
                                    dispatch={this.props.dispatch}
                                    selectedProjectId={this.props.selectedProjectId}
                                    selectedAreaId={this.props.selectedAreaId} 
                                    searched={this.props.searched}
                                    selectedTodoId={this.props.selectedTodoId}
                                    selectedCategory={this.props.selectedCategory}
                                    selectedTag={this.props.selectedTag}
                                    rootRef={this.rootRef}
                                    areas={this.props.areas}
                                    projects={this.props.projects}
                                    tags={this.props.tags}
                                /> 
                            ], 
                            [ 
                                (selectedCategory:string) : boolean => 'next'===selectedCategory,  
                                () => <Next   
                                    todos={filter(todos, allPass(this.nextFilters), "Next")}
                                    dispatch={this.props.dispatch}
                                    selectedTodoId={this.props.selectedTodoId} 
                                    searched={this.props.searched}
                                    selectedCategory={this.props.selectedCategory}
                                    selectedTag={this.props.selectedTag}
                                    rootRef={this.rootRef}
                                    selectedProjectId={this.props.selectedProjectId}
                                    selectedAreaId={this.props.selectedAreaId} 
                                    areas={this.props.areas}
                                    projects={this.props.projects} 
                                    tags={this.props.tags}
                                />
                            ],
                            [ 
                                (selectedCategory:string) : boolean => 'upcoming'===selectedCategory,  
                                () => <Upcoming  
                                    todos={filter(todos, allPass(this.upcomingFilters), "Upcoming")}
                                    dispatch={this.props.dispatch}
                                    selectedTodoId={this.props.selectedTodoId}
                                    selectedCategory={this.props.selectedCategory}
                                    searched={this.props.searched}
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
                                        searched={this.props.searched}
                                        selectedProjectId={this.props.selectedProjectId}
                                        selectedTodoId={this.props.selectedTodoId}  
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
                                        searched={this.props.searched}
                                        selectedTag={this.props.selectedTag}
                                        dispatch={this.props.dispatch}      
                                        selectedProjectId={this.props.selectedProjectId}
                                        projects={this.props.projects} 
                                        selectedTodoId={this.props.selectedTodoId} 
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
 



 





 
















