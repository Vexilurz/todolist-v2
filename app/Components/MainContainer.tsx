import './../assets/styles.css';   
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';   
import { ipcRenderer, remote } from 'electron';
import IconButton from 'material-ui/IconButton';  
import { Component } from "react"; 
import { 
    attachDispatchToProps, byTags, byCategory, oneDayBehind, 
    convertTodoDates, convertProjectDates, convertAreaDates, 
    oneDayMore, measureTime, byAttachedToProject, byNotCompleted, 
    byNotDeleted, isTodayOrPast, byDeleted, byCompleted, isToday, 
    byNotSomeday, byScheduled, yearFromNow, timeDifferenceHours, 
    getIntroList, printElement, inFuture, introListIds, introListLayout, 
    threeDaysAhead, byHaveAttachedDate, byAttachedToCompletedProject, 
    byNotAttachedToProject, byNotAttachedToCompletedProject, isNotEmpty, 
    isNotNil, gtDate 
} from "../utils/utils";  
import {isDev} from "../utils/isDev"; 
import {connect} from "react-redux"; 
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Hide from 'material-ui/svg-icons/navigation/arrow-drop-down';
import { 
    getTodos, updateTodo, Todo, removeTodo, addTodo, getProjects, 
    getAreas, queryToProjects, queryToAreas, Project, Area, initDB, 
    removeArea, removeProject, destroyEverything, addArea, addProject, 
    addTodos, addProjects, addAreas, Heading, LayoutItem, getCalendars, 
    Calendar, getDatabaseObjects
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
import { Upcoming, extendNever } from './Categories/Upcoming';
import { Today } from './Categories/Today';
import { Inbox } from './Categories/Inbox';
import { FadeBackgroundIcon } from './FadeBackgroundIcon';
import { 
    isEmpty, last, isNil, contains, all, not, assoc, flatten, reduce, prop, evolve,
    toPairs, map, compose, allPass, cond, defaultTo, reject, when, ifElse, identity 
} from 'ramda';
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
import { debounce } from 'lodash';
import { noteFromText } from '../utils/draftUtils';
const Promise = require('bluebird');   
const moment = require("moment");  


export type Category = "inbox" | "today" | "upcoming" | "next" | "someday" | 
                       "logbook" | "trash" | "project" | "area" | "evening" | 
                       "deadline" | "search" | "group" | "search" | "reminder";


export let filter = (array:any[],f:Function,caller?:string) : any[] => lodashFilter(array,f); 
 

let isMainWindow = () => { 
    return remote.getCurrentWindow().id===1;
}
  

let assureCorrectNoteType : (todo:Todo) => Todo = 
    when(
        compose(isString, prop('note')), 
        evolve({note:noteFromText}) 
    );
    

export let getData = (limit:Date,onError:Function,max:number) : Promise<{
    projects:Project[],
    areas:Area[],
    todos:Todo[],
    calendars:Calendar[]
}> => 
    getDatabaseObjects(onError,max)
    .then(
        compose(
            evolve({ 
                projects:map(convertProjectDates),
                areas:map(convertAreaDates),
                todos:map( 
                    compose(assureCorrectNoteType, convertTodoDates)
                ),  
            }),
            ([calendars,projects,areas,todos]) => ({calendars,projects,areas,todos})
        )
    ).then(
        ({projects,areas,todos,calendars}) => updateCalendars(
            limit,
            calendars,
            onError
        ).then(
            (updated) => ({projects,areas,todos,calendars:updated})
        )
    );

                       
interface MainContainerState{ fullWindowSize:boolean }
@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)   
export class MainContainer extends Component<Store,MainContainerState>{
    rootRef:HTMLElement;  
    limit:number;
    subscriptions:Subscription[]; 
    disablePrintButton:boolean;

    constructor(props){ 
        super(props);  
        this.limit = 100000;
        this.subscriptions = [];
        this.disablePrintButton=false;
        this.state = { fullWindowSize:true };
    };  

    
     
    test = () => {  
        let {dispatch} = this.props;

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
        .then(() => getData(this.props.limit,this.onError,this.limit))  
        .then(
            ({projects, areas, todos, calendars}) => this.setData({ 
                projects:defaultTo([], projects), 
                areas:defaultTo([], areas), 
                todos:defaultTo([], todos), 
                calendars:defaultTo([], calendars)
            }) 
        )
    };


      
    onError = (e) => globalErrorHandler(e); 



    initData = () => {
        if(not(isMainWindow())){ return }  
        let {dispatch} = this.props;

        if(isDev()){ 
            destroyEverything()
            .then(this.test) 
        }else{ 
            getData(this.props.limit,this.onError,this.limit)   
            .then(
                ({projects, areas, todos, calendars}) => this.setData({
                    projects:defaultTo([], projects), 
                    areas:defaultTo([], areas), 
                    todos:defaultTo([], todos), 
                    calendars:defaultTo([], calendars)
                }) 
            )
        } 
    };



    addIntroList = (projects:Project[]) => {
        let {dispatch} = this.props;

        if(this.props.firstLaunch){  
            let alreadyExists = projects.find( (p:Project) => p._id==="Intro List" );
            if(not(alreadyExists)){  
               dispatch({type:"addTodos", load:introListLayout.filter(isTodo)});
               dispatch({type:"addProject", load:getIntroList()}); 
            }
        };
    };
 


    setData = ({projects, areas, todos, calendars}) : void => {
        let {dispatch} = this.props;
        
        if(this.props.clone){ return } 

        dispatch({type:"setProjects", load:projects});
        dispatch({type:"setAreas", load:areas});
        dispatch({type:"setTodos", load:todos});
        dispatch({type:"setCalendars", load:calendars});

        this.addIntroList(projects); 

        let never = extendNever(this.props.limit, todos);

        if(isNotEmpty(never)){
           dispatch({type:"addTodos", load:never}); 
        }

        when(
          isNotEmpty, 
          () => updateConfig(dispatch)({hideHint:true}) 
        )(calendars); 
    };
   
 

    initObservables = () => {  
        let {dispatch} = this.props; 
        let minute = 1000 * 60;  
 
        this.subscriptions.push(
            Observable
                .interval(5 * minute)
                .flatMap(() => updateCalendars(
                    this.props.limit, 
                    this.props.calendars, 
                    this.onError
                ))
                .subscribe((calendars:Calendar[]) => dispatch({type:"setCalendars",load:calendars})),

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
                )
        );
    };
  


    componentDidMount(){    
        this.initObservables(); 
        this.initData(); 
    };      
     


    componentWillUnmount(){ 
        this.subscriptions.map( s => s.unsubscribe() );
        this.subscriptions = [];
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

        //let mainWindow = remote.BrowserWindow.getAllWindows().find(w => w.id===1);
        //mainWindow.webContents.printToPDF({}, () => {})

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
            todos, projects, areas, selectedProjectId, selectedAreaId, 
            showCompleted, showScheduled, selectedCategory, clone 
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
                <div style={{display:"flex",padding:"10px"}}>   
                    <div 
                      style={{
                        display:"flex", 
                        alignItems:"center", 
                        position:"fixed", 
                        top:0, 
                        right:0 
                      }}
                    >  
                        { 
                            clone ? null :
                            <IconButton  
                                iconStyle={{color:"rgba(100,100,100,0.6)",height:"22px",width:"22px"}} 
                                onTouchTap={this.printCurrentList}
                            > 
                                <Print />   
                            </IconButton>   
                        }
                        {     
                            clone ? null :
                            <IconButton    
                                iconStyle={{color:"rgba(100,100,100,0.6)",width:"18px",height:"18px"}}
                                onClick={() => ipcRenderer.send("store", {...this.props})}   
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
                                        byNotAttachedToProject(projects), 
                                        (t:Todo) => isNil(t.attachedDate) && isNil(t.deadline), 
                                        byCategory("inbox"), 
                                        byNotCompleted,  
                                        byNotDeleted   
                                    ];    
                                    
                                    return <Inbox 
                                        todos={filter(todos, allPass(inboxFilters))} 
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
                                    let {projects,groupTodos,clone,limit,dispatch} = this.props;

                                    let todayFilters = [   
                                        byNotAttachedToCompletedProject(projects),
                                        (t:Todo) => isTodayOrPast(t.attachedDate) || isTodayOrPast(t.deadline), 
                                        (t:Todo) => t.category!=="someday",
                                        byNotCompleted,  
                                        byNotDeleted   
                                    ];   

                                    let selectedTodos = filter(todos, allPass(todayFilters));

                                    if(groupTodos){
                                        let hidden = filter( 
                                            projects, 
                                           (p:Project) => isNotArray(p.hide) ? 
                                                          false : 
                                                          contains(selectedCategory,p.hide)
                                        ); 
                                        let ids : string[] = flatten(hidden.map((p:Project) => p.layout.filter(isString)));
                                        selectedTodos = reject((todo:Todo) => contains(todo._id)(ids),selectedTodos);
                                    };  
 
                                    return <Today   
                                        todos={selectedTodos}
                                        clone={clone}
                                        dispatch={this.props.dispatch}
                                        scrolledTodo={this.props.scrolledTodo}
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
                                        byNotAttachedToCompletedProject(projects),
                                        byCategory("someday"),
                                        (todo:Todo) => isNil(todo.deadline) && isNil(todo.attachedDate),
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
                                    let {groupTodos} = this.props;
                                    
                                    let byIntroList = (item : (Project | Todo)) : boolean => contains(item._id,introListIds);
                                    let byNotIntroList = compose(not, byIntroList);
                                    
                                    let nextFilters = [ 
                                        byNotIntroList,
                                        byNotAttachedToCompletedProject(projects),
                                        (t:Todo) => isNil(t.attachedDate) && isNil(t.deadline),
                                        (t:Todo) => t.category!=="inbox" && t.category!=="someday",  
                                        byNotCompleted,   
                                        byNotDeleted    
                                    ]; 

                                    let selectedTodos = filter(todos, allPass(nextFilters));

                                    if(groupTodos){ 
                                        let hidden = filter(
                                           projects, 
                                           (p:Project) => isNotArray(p.hide) ? false : contains(selectedCategory)(p.hide)
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
                                        scrolledTodo={this.props.scrolledTodo}
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
                                        todos={filter(todos, byDeleted)}
                                        groupTodos={this.props.groupTodos}  
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

                                    let logbookFilters = [
                                        byCompleted, 
                                        byNotDeleted,
                                        byNotAttachedToCompletedProject(projects)
                                    ]; 

                                    return <Logbook   
                                        todos={filter(todos, allPass(logbookFilters))} 
                                        groupTodos={this.props.groupTodos}
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
 
                                    let upcomingFilters = [
                                        byScheduled,
                                        byNotAttachedToCompletedProject(projects),
                                        (t:Todo) => t.category!=="someday",
                                        byNotCompleted,  
                                        byNotDeleted   
                                    ];

                                    return <Upcoming  
                                        limit={this.props.limit}
                                        clone={this.props.clone}
                                        todos={filter(todos, allPass(upcomingFilters))}
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
                                    let project = projects.find((p:Project) => selectedProjectId===p._id);

                                    if(isNil(project)){ return null }

                                    let ids = project.layout.filter(isString);

                                    let projectFilters = [ 
                                        (t:Todo) => contains(t._id)(ids), 
                                        byNotDeleted 
                                    ];  
                                 
                                    let selectedTodos = filter(todos, allPass(projectFilters));

                                    return <ProjectComponent 
                                        project={project}
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
                                () => <Search {...{} as any}/>
                            ]
                        ])(selectedCategory) 
                    }  
                </div>    
        </div> 
    }
}   
 



 





 
















