import './../assets/styles.css';   
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';   
import { ipcRenderer, remote } from 'electron';
import IconButton from 'material-ui/IconButton';  
import { Component } from "react"; 
import { 
    attachDispatchToProps, byTags, byCategory, selectNeverTodos, updateNeverTodos, oneDayBehind, 
    convertTodoDates, convertProjectDates, convertAreaDates, oneDayAhead, measureTime, 
    byAttachedToProject, byNotCompleted, byNotDeleted, isTodayOrPast, byDeleted, 
    byCompleted, isToday, byNotSomeday, byScheduled, yearFromNow, timeDifferenceHours, 
    getIntroList, printElement, inFuture, introListIds, introListLayout
} from "../utils/utils";  
import {isDev} from "../utils/isDev"; 
import { connect } from "react-redux"; 
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Hide from 'material-ui/svg-icons/navigation/arrow-drop-down';
import { getTodos, updateTodo, Todo, removeTodo, addTodo, getProjects, 
    getAreas, queryToProjects, queryToAreas, Project, Area, initDB, removeArea, 
    removeProject, destroyEverything, addArea, addProject, addTodos, 
    addProjects, addAreas, Heading, LayoutItem, getCalendars, Calendar, getDatabaseObjects
} from '.././database';
import { Store } from '.././app';    
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import Print from 'material-ui/svg-icons/action/print'; 
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
import { isEmpty, last, isNil, contains, all, not, assoc, flatten, toPairs, map, compose, allPass, cond, defaultTo, reject } from 'ramda';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber"; 
import { Subscription } from 'rxjs/Rx';
import { RightClickMenu } from './RightClickMenu';
import { RepeatPopup } from './RepeatPopup';
import { Search } from './Search';
import { filter as lodashFilter } from 'lodash';
import { CalendarProps, CalendarEvent, getIcalData, IcalData, AxiosError, updateCalendars } from './Calendar';
import { globalErrorHandler } from '../utils/globalErrorHandler';
import { generateRandomDatabase } from '../utils/generateRandomObjects';
import { updateConfig, clearStorage } from '../utils/config';
import { isNotArray, isDate, isTodo, isString } from '../utils/isSomething';
import { scheduleReminder } from '../utils/scheduleReminder';
import { debounce } from 'lodash';
const Promise = require('bluebird');   
const moment = require("moment"); 



export let filter = (array:any[],f:Function,caller?:string) : any[] => {
    return lodashFilter(array,f); 
} 



/**
 * Find the most distant in time todo among todos attached to either project or area.
 */
export let getDateUpperLimit = (areas:Area[], projects:Project[], todos:Todo[], currentLimit:Date) => {
        let pIds = flatten( projects.map( (p:Project) => p.layout.filter(isString) ) );
        
        let attached : Todo[] = filter( 
           todos,
          (todo:Todo) => contains(todo._id)(pIds), 
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
};



/**
 * Remove todos which belong to repeating group and 
 * located on timeline beyound current limiting point.
 */
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
};



/**
 * Get items from database, convert dates from string to objects and
 * set retrieved items to store.
 */
export let fetchData = (props:Store,max:number,onError:Function) : Promise<Calendar[]> => { 
    let {clone,dispatch} = props;
    
    if(clone){ return } 

    return getDatabaseObjects(onError,max)
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
            let {limit,firstLaunch} = props; 
            let selected = selectTodos(areas, projects, todos, limit);

            dispatch({type:"setProjects", load:projects});
            dispatch({type:"setAreas", load:areas});
            dispatch({type:"setTodos", load:selected});

            if(firstLaunch){  
                let alreadyExists = projects.find( (p:Project) => p._id==="Intro List" );
                if(not(alreadyExists)){  
                   dispatch({type:"addTodos", load:introListLayout.filter(isTodo)});
                   dispatch({type:"addProject", load:getIntroList()}); 
                }
            };

            return updateCalendars(calendars,onError);
        }
    )
    .then( 
        (calendars) => {  
            dispatch({type:"setCalendars",load:calendars});
            return calendars; 
        } 
    )
}; 

 
export let clearScheduledReminders = (store:Store) : Store => {
    let scheduledReminders = store.scheduledReminders;
    scheduledReminders.forEach(t => clearTimeout(t)); 
    return store;
};


let isMainWindow = () => remote.getCurrentWindow().id===1;
 
 
export type Category = "inbox" | "today" | "upcoming" | "next" | "someday" | 
                       "logbook" | "trash" | "project" | "area" | "evening" | 
                       "deadline" | "search" | "group" | "search" | "reminder";
                  
                       
interface MainContainerState{ fullWindowSize:boolean }


@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)   
export class MainContainer extends Component<Store,MainContainerState>{
    rootRef:HTMLElement;  
    limit:number;
    subscriptions:Subscription[]; 
    disablePrintButton:boolean;

    constructor(props){ 
        super(props);  
        this.limit = 10000;
        this.subscriptions = [];
        this.disablePrintButton=false;
        this.state = { fullWindowSize:true };
    }  
     
      
    //TODO Test
    requestAdditionalNeverTodos = () : void => { 
        let {todos, dispatch, limit} = this.props;
        let tomorrow : Date = oneDayAhead(new Date()); 

        let never = selectNeverTodos(todos) //last === true, last item in sequence  
                    .filter((todo:Todo) => todo.attachedDate.getTime() <= tomorrow.getTime());   
  
        if(!isEmpty(never)){ updateNeverTodos(dispatch,never,limit) }
    };


    onError = (e) => globalErrorHandler(e); 


    initData = () => {
        
        if(not(isMainWindow())){ return }  
        let {dispatch} = this.props;

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
                    clearStorage(this.onError)     
                ])  
                .then(() => fetchData(this.props,this.limit,this.onError))  
                .then((calendars) => isEmpty(calendars) ? null : updateConfig(dispatch)({hideHint:true})) 
            });
        }else{ 
            fetchData(this.props,this.limit,this.onError) 
            .then((calendars) => isEmpty(calendars) ? null : updateConfig(dispatch)({hideHint:true}))   
        } 
    }



    initObservables = () => {  
        let {dispatch,showRightClickMenu} = this.props; 
        let minute = 1000 * 60;  

        
        let calendars = Observable.interval(2 * minute)
                        .flatMap( () =>  updateCalendars(this.props.calendars, this.onError))
                        .subscribe((calendars:Calendar[]) => dispatch({type:"setCalendars", load:calendars}));   

        let resize = Observable
                    .fromEvent(window,"resize")
                    .debounceTime(100) 
                    .subscribe(() => dispatch({type:"leftPanelWidth", load:window.innerWidth/3.7}));
 
        let click = Observable  
                    .fromEvent(window,"click")
                    .debounceTime(100)
                    .subscribe(() => showRightClickMenu ? dispatch({type:"showRightClickMenu", load:false}) : null); 

        this.subscriptions.push(resize,click,calendars);
    }
  


    componentDidMount(){   
        this.requestAdditionalNeverTodos();  
        this.initObservables(); 
        this.initData(); 
    }      
     


    componentWillUnmount(){ 
        this.subscriptions.map( s => s.unsubscribe() );
        this.subscriptions = [];
    }  
 


    componentWillReceiveProps(nextProps){
        if(this.props.selectedCategory!==nextProps.selectedCategory){
           if(this.rootRef){ this.rootRef.scrollTop=0; } 
        }
    }
      

    printCurrentList = () => {  
        let {selectedCategory} = this.props;

        if(this.disablePrintButton){ return }

        let list = document.getElementById(`${selectedCategory}-list`); 
        if(list){ 
           this.disablePrintButton = true; 

           printElement(selectedCategory, list) 
           .then(() => { 
              this.disablePrintButton = false;
           })
        }
    };

    
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
                    <div 
                    className="no-drag" 
                    style={{
                        display:"flex", 
                        alignItems:"center", 
                        position:"fixed", 
                        top:0, 
                        right:0 
                    }}>  
                        { 
                            this.props.clone ? null :
                            <IconButton  
                                iconStyle={{color:"rgba(100,100,100,0.6)", height:"22px", width:"22px"}} 
                                className="no-drag" 
                                onTouchTap={this.printCurrentList}
                            > 
                                <Print />   
                            </IconButton>   
                        }
                        {     
                            this.props.clone ? null :
                            <IconButton    
                                onClick={() => ipcRenderer.send("store", {...this.props})}     
                                className="no-drag"  
                                iconStyle={{color:"rgba(100,100,100,0.6)",width:"18px",height:"18px"}}
                            >     
                                <OverlappingWindows />
                            </IconButton> 
                        } 
                    </div>   
                </div>  
                <div style={{paddingLeft:"60px", paddingRight:"60px", paddingBottom:"60px", paddingTop:"10px"}}>
                    {    
                        cond([  
                            [ 
                                (selectedCategory:Category) : boolean => 'inbox'===selectedCategory,  
                                () => {
                                    let inboxFilters = [
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
                                        groupTodos={this.props.groupTodos}
                                        selectedTodo={this.props.selectedTodo}
                                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                                        selectedTag={this.props.selectedTag} 
                                        selectedProjectId={this.props.selectedProjectId} 
                                        selectedAreaId={this.props.selectedAreaId} 
                                        rootRef={this.rootRef}
                                        areas={this.props.areas}
                                        projects={this.props.projects} 
                                    />;
                                }
                            ],  
                            [ 
                                (selectedCategory:Category) : boolean => 'today'===selectedCategory,  
                                () => {
                                    let {projects,groupTodos,clone} = this.props;

                                    let todayFilters = [   
                                        (t:Todo) => isTodayOrPast(t.attachedDate) || isTodayOrPast(t.deadline), 
                                        byNotCompleted,  
                                        byNotDeleted   
                                    ];   

                                    let selectedTodos = filter(todos, allPass(todayFilters), "");

                                    if(groupTodos){
                                        let hidden = filter(
                                           projects, 
                                           (p:Project) => isNotArray(p.hide) ? false : contains(selectedCategory)(p.hide),
                                           ""
                                        );
                                        let ids : string[] = flatten(hidden.map((p:Project) => p.layout.filter(isString)));
                                        selectedTodos = reject((todo:Todo) => contains(todo._id)(ids),selectedTodos);
                                    };
 
                                    return <Today  
                                        todos={selectedTodos}
                                        clone={clone}
                                        dispatch={this.props.dispatch}
                                        selectedTodo={this.props.selectedTodo}
                                        groupTodos={this.props.groupTodos}
                                        selectedProjectId={this.props.selectedProjectId}
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
                                    let somedayFilters = [
                                        byCategory("someday"),
                                        (todo:Todo) => isNil(todo.deadline),
                                        byNotCompleted,  
                                        byNotDeleted 
                                    ];

                                    let selectedTodos = filter(todos, allPass(somedayFilters), "");

                                    return <Someday 
                                        todos={selectedTodos}
                                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                                        dispatch={this.props.dispatch}
                                        selectedTodo={this.props.selectedTodo}
                                        groupTodos={this.props.groupTodos}
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
                                    let {groupTodos} = this.props;
                                    let byIntroList = (item : (Project | Todo)) : boolean => contains(item._id)(introListIds);
                                    let byNotIntroList = compose(not, byIntroList);
                                    let nextFilters = [ 
                                        (t:Todo) => isNil(t.attachedDate) && isNil(t.deadline),
                                        (t:Todo) => t.category!=="inbox",  
                                        (t:Todo) => t.category!=="someday",  
                                        byNotIntroList,
                                        byNotCompleted,   
                                        byNotDeleted   
                                    ]; 

                                    let selectedTodos = filter(todos, allPass(nextFilters), "");

                                    if(groupTodos){ 
                                        let hidden = filter(
                                           projects, 
                                           (p:Project) => isNotArray(p.hide) ? false : contains(selectedCategory)(p.hide),
                                           ""
                                        );
                                        let ids : string[] = flatten(hidden.map((p:Project) => p.layout.filter(isString)));
                                        selectedTodos = reject((todo:Todo) => contains(todo._id)(ids),selectedTodos);
                                    };

                                    return <Next   
                                        todos={selectedTodos}
                                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                                        dispatch={this.props.dispatch}
                                        groupTodos={this.props.groupTodos}
                                        selectedTodo={this.props.selectedTodo}
                                        selectedCategory={this.props.selectedCategory}
                                        selectedTag={this.props.selectedTag}
                                        rootRef={this.rootRef}
                                        selectedProjectId={this.props.selectedProjectId}
                                        selectedAreaId={this.props.selectedAreaId} 
                                        areas={this.props.areas} 
                                        projects={this.props.projects.filter(byNotIntroList)} 
                                    />
                                }
                            ], 
                            [ 
                                (selectedCategory:Category) : boolean => 'trash'===selectedCategory,  
                                () => {
                                
                                    return <Trash    
                                        todos={filter(todos, byDeleted, "Trash")}
                                        groupTodos={this.props.groupTodos}  
                                        dispatch={this.props.dispatch} 
                                        selectedTodo={this.props.selectedTodo}
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

                                    let logbookFilters = [byCompleted, byNotDeleted]; 

                                    return <Logbook   
                                        todos={filter(todos, allPass(logbookFilters), "Logbook")} 
                                        groupTodos={this.props.groupTodos}
                                        dispatch={this.props.dispatch}
                                        selectedTodo={this.props.selectedTodo}
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
 
                                    let upcomingFilters = [
                                        byScheduled,
                                        byNotCompleted,  
                                        byNotDeleted   
                                    ];

                                    return <Upcoming  
                                        limit={this.props.limit}
                                        clone={this.props.clone}
                                        todos={filter(todos, allPass(upcomingFilters), "Upcoming")}
                                        groupTodos={this.props.groupTodos}
                                        dispatch={this.props.dispatch}
                                        selectedCategory={this.props.selectedCategory}
                                        selectedTodo={this.props.selectedTodo}
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
                                    let project = projects.find((p:Project) => selectedProjectId===p._id);

                                    if(isNil(project)){ return null }

                                    let ids = project.layout.filter(isString);

                                    let projectFilters = [ 
                                        (t:Todo) => contains(t._id)(ids), 
                                        byNotDeleted 
                                    ];  
                                 
                                    let selectedTodos = filter(todos, allPass(projectFilters), "");

                                    return <ProjectComponent 
                                        project={project}
                                        todos={selectedTodos}
                                        selectedTodo={this.props.selectedTodo}
                                        groupTodos={this.props.groupTodos}
                                        dispatch={this.props.dispatch} 
                                        selectedTag={this.props.selectedTag}  
                                        selectedCategory={this.props.selectedCategory}
                                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                                        selectedProjectId={this.props.selectedProjectId}
                                        dragged={this.props.dragged} 
                                        showScheduled={this.props.showScheduled} 
                                        showCompleted={this.props.showCompleted}
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
                                    let area = areas.find((a) => selectedAreaId===a._id);

                                    if(isNil(area)){ return null }

                                    return <AreaComponent    
                                        area={area}  
                                        todos={this.props.todos}  
                                        selectedTodo={this.props.selectedTodo}
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
                                () => <Search {...{} as any}/>
                            ]
                        ])(selectedCategory) 
                    }  
                </div>    
        </div> 
    }
}  
 



 





 
















