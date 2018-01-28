import './../assets/styles.css';   
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';   
import { ipcRenderer, remote } from 'electron';
import IconButton from 'material-ui/IconButton';  
import { Component } from "react"; 
import { 
    attachDispatchToProps, uppercase, insideTargetArea, getIcalData,
    chooseIcon, debounce, byTags, byCategory, generateEmptyTodo, isArray, isTodo, isProject, 
    isArea, isArrayOfAreas, isArrayOfProjects, isArrayOfTodos, assert, updateCalendars, 
    selectNeverTodos, updateNeverTodos, oneDayBehind, 
} from "../utils";  
import { connect } from "react-redux"; 
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { getTodos, updateTodo, Todo, removeTodo, addTodo, getProjects, 
    getAreas, queryToProjects, queryToAreas, Project, Area, initDB, removeArea, 
    removeProject, destroyEverything, addArea, addProject, generateId, addTodos, 
    addProjects, addAreas, Heading, LayoutItem, getCalendars, Calendar} from '.././database';
import { 
    Store, isDev, convertDates, convertTodoDates, convertProjectDates, convertAreaDates 
} from '.././app';    
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
import { QuickSearch } from './Search';
import { FadeBackgroundIcon } from './FadeBackgroundIcon';
import { generateRandomDatabase } from '../generateRandomObjects';
import { isEmpty, last, isNil, contains, all, not, assoc, flatten, toPairs, map, compose } from 'ramda';
import { isString } from 'util';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber"; 
import { Subscription } from 'rxjs/Rx';
import { RightClickMenu } from './RightClickMenu';
import { RepeatPopup } from './RepeatPopup';
let ical = require('ical');    
 
 
export type Category = "inbox" | "today" | "upcoming" | "next" | "someday" | 
                       "logbook" | "trash" | "project" | "area" | "evening" | "deadline"; 

             
             
interface MainContainerState{ 
    fullWindowSize:boolean
}

let oneDayAhead = () : Date => { 
 
    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;    
    }
      
    return new Date()["addDays"](1);
}
   
export let createHeading = (e, props:Store) : void => {
     
        let id : string = props.selectedProjectId;
    

        assert(
            props.selectedCategory==="project",   
            `Attempt to create heading outside of project template. 
            ${props.selectedCategory}. 
            createHeading.`
        )

        assert(not(isNil(id)), `selectedProjectId undefined ${id}. createHeading.`);

      
        let project = props.projects.find( (p:Project) => p._id===id );


        assert( 
            isProject(project),   
            `this.props.selectedProjectId ${props.selectedProjectId} do not correspond to existing project.
            ${JSON.stringify(props.projects)}. createHeading`
        )


        let priority = 0; 


        if(!isEmpty(project.layout)){
            let item : LayoutItem = last(project.layout);

            if(isString(item)){ 

                let todo = props.todos.find( (t:Todo) => t._id===item );
                assert(
                    isTodo(todo), 
                    `todo is not of type Todo. 
                     todo : ${JSON.stringify(todo)}. 
                     item : ${JSON.stringify(item)}. 
                     createHeading.`
                )
            
                priority = todo.priority + 1; 
                 
            }else if(item.type==="heading"){

                let heading : Heading = item; 
                priority = heading.priority + 1;

            }
        }


        let heading : Heading = {
            type : "heading", 
            priority,
            title : '',   
            _id : generateId(), 
            key : generateId()
        }; 

        let load = {...project, layout:[heading,...project.layout]};
        
        props.dispatch({ type:"updateProject", load });
}



let clearStorage = () : Promise<void> => 
    new Promise( 
        (resolve) => { 
           ipcRenderer.removeAllListeners("clearStorage"); 
           ipcRenderer.send("clearStorage");
           ipcRenderer.on("clearStorage", (event) => resolve());
        }
    )
  



@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)   
export class MainContainer extends Component<Store,MainContainerState>{

    rootRef:HTMLElement; 
    limit:number;
    subscriptions:Subscription[]; 
    events:number;  
      
    constructor(props){

        super(props);  

        this.limit = 5000;

        this.events = null; 

        this.subscriptions = [];

        this.state = {    
            fullWindowSize:true 
        }

        if(this.props.windowId===1){ 
            if(isDev()){

                destroyEverything()   
                .then(() => {  
                    initDB();

                    let fakeData = generateRandomDatabase({todos:150, projects:38, areas:15});      
                     
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
            }else{

                this.fetchData();
            }
        }    
    }    
    

    openNewWindow = () => { 
        let clonedStore = {...this.props};
        clonedStore.windowId = undefined;
        ipcRenderer.send("cloneWindow", clonedStore);
    }
 

    onError = (e) => console.log(e);


    closeRightClickMenu = () => {
        if(this.props.showRightClickMenu){
           this.props.dispatch({type:"showRightClickMenu", load:false})
        }
    }

    
    updateLeftPanelWidth = () => {
        this.props.dispatch({type:"leftPanelWidth", load:window.innerWidth/3.7})
    } 


    fetchData = () => { 
        let {clone,dispatch} = this.props;
        
        if(clone){ return }
         
        getCalendars(this.onError)(true,this.limit)
        .then((calendars:Calendar[]) => updateCalendars(calendars))
        .then((calendars:Calendar[]) => dispatch({type:"setCalendars", load:calendars})) 
   
        
        getTodos(this.onError)(true,this.limit)
        .then((todos:Todo[]) => todos.map(convertTodoDates))
        .then((todos:Todo[]) => dispatch({type:"setTodos", load:todos}))


        getProjects(this.onError)(true,this.limit)
        .then((projects:Project[]) => projects.map(convertProjectDates))
        .then((projects:Project[]) => dispatch({type:"setProjects", load:projects}))


        getAreas(this.onError)(true,this.limit)
        .then((areas:Area[]) => areas.map(convertAreaDates))
        .then((areas:Area[]) => dispatch({type:"setAreas", load:areas}))  
    } 
    
    
    refreshEvents = () => {
        let {calendars, dispatch} = this.props;

        console.log("update calendar events");

        updateCalendars(calendars)
        .then( 
            (calendars:Calendar[]) => dispatch({type:"setCalendars", load:calendars})
        )  
    }

    
    componentDidMount(){ 

        let delay = 1000 * 5 * 60;
        
        if(isNil(this.events)){
           this.events = setInterval(this.refreshEvents,delay) as any;
        } 
 
        let resize = Observable
                    .fromEvent(window,"resize")
                    .debounceTime(100) 
                    .subscribe(this.updateLeftPanelWidth);

        let click = Observable 
                    .fromEvent(window,"click")
                    .debounceTime(100)
                    .subscribe(this.closeRightClickMenu);
        
        this.updateNeverTodos();  

        this.subscriptions.push(resize,click);
    }      
     
    updateNeverTodos = () => { 
        let {todos, dispatch} = this.props;
        let tomorrow : Date = oneDayAhead();

        let never = selectNeverTodos(todos) //last === true
                    .filter(
                      (todo:Todo) => todo.attachedDate.getTime() <= tomorrow.getTime()
                    );   
  
        if(!isEmpty(never)){ updateNeverTodos(dispatch,never) }
    }

    componentWillUnmount(){ 

        if(this.events){ clearInterval(this.events) }

        this.subscriptions.map( s => s.unsubscribe() );
    }  
      

    componentWillReceiveProps(nextProps){
        if(this.props.selectedCategory!==nextProps.selectedCategory){
           if(this.rootRef){   
              this.rootRef.scrollTop=0;
           } 
        }
    }
    
    
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
                                onClick={this.openNewWindow}   
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
                        {   
                            inbox : <Inbox 
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
                                todos={this.props.todos} 
                                tags={this.props.tags}
                            />,   
          
                            today : <Today 
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
                                todos={this.props.todos}
                                tags={this.props.tags}
                                showCalendarEvents={this.props.showCalendarEvents}
                                calendars={this.props.calendars}
                            />,
  
                            evening : <Today 
                                dispatch={this.props.dispatch}
                                selectedTodoId={this.props.selectedTodoId}
                                searched={this.props.searched}
                                selectedCategory={this.props.selectedCategory}
                                areas={this.props.areas}
                                selectedProjectId={this.props.selectedProjectId}
                                selectedAreaId={this.props.selectedAreaId} 
                                projects={this.props.projects}
                                selectedTag={this.props.selectedTag}
                                rootRef={this.rootRef}
                                todos={this.props.todos}
                                tags={this.props.tags} 
                                showCalendarEvents={this.props.showCalendarEvents}
                                calendars={this.props.calendars}
                            />, 

                            upcoming : <Upcoming 
                                dispatch={this.props.dispatch}
                                selectedTodoId={this.props.selectedTodoId}
                                selectedCategory={this.props.selectedCategory}
                                searched={this.props.searched}
                                todos={this.props.todos}
                                areas={this.props.areas}
                                selectedAreaId={this.props.selectedAreaId}
                                selectedProjectId={this.props.selectedProjectId}
                                projects={this.props.projects}
                                selectedTag={this.props.selectedTag}
                                tags={this.props.tags} 
                                rootRef={this.rootRef}
                                showCalendarEvents={this.props.showCalendarEvents}
                                calendars={this.props.calendars} 
                            />,  
 
                            logbook : <Logbook   
                                dispatch={this.props.dispatch}
                                selectedTodoId={this.props.selectedTodoId}
                                selectedCategory={this.props.selectedCategory}
                                searched={this.props.searched}
                                todos={this.props.todos} 
                                selectedAreaId={this.props.selectedAreaId}
                                selectedProjectId={this.props.selectedProjectId}
                                areas={this.props.areas}
                                projects={this.props.projects}
                                selectedTag={this.props.selectedTag}
                                tags={this.props.tags} 
                                rootRef={this.rootRef}
                            />, 

                            someday : <Someday 
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
                                todos={this.props.todos}
                                tags={this.props.tags}
                            />,    

                            next : <Next   
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
                                todos={this.props.todos}
                                tags={this.props.tags}
                            />,   
       
                            trash : <Trash     
                                dispatch={this.props.dispatch}
                                tags={this.props.tags}
                                searched={this.props.searched}
                                selectedCategory={this.props.selectedCategory}
                                selectedTag={this.props.selectedTag}
                                selectedTodoId={this.props.selectedTodoId}  
                                showTrashPopup={this.props.showTrashPopup}
                                todos={this.props.todos}
                                selectedProjectId={this.props.selectedProjectId}
                                selectedAreaId={this.props.selectedAreaId} 
                                projects={this.props.projects}
                                areas={this.props.areas}
                                rootRef={this.rootRef}      
                            />, 
                             
                            project : <ProjectComponent 
                                dispatch={this.props.dispatch} 
                                selectedTag={this.props.selectedTag}  
                                selectedCategory={this.props.selectedCategory}
                                searched={this.props.searched}
                                selectedProjectId={this.props.selectedProjectId}
                                selectedTodoId={this.props.selectedTodoId} 
                                todos={this.props.todos} 
                                dragged={this.props.dragged} 
                                showScheduled={this.props.showScheduled}
                                showCompleted={this.props.showCompleted}
                                selectedAreaId={this.props.selectedAreaId} 
                                projects={this.props.projects}  
                                areas={this.props.areas}
                                rootRef={this.rootRef} 
                                tags={this.props.tags} 
                            />,    
  
                            area : <AreaComponent  
                                areas={this.props.areas}
                                selectedCategory={this.props.selectedCategory}
                                selectedAreaId={this.props.selectedAreaId}
                                searched={this.props.searched}
                                selectedTag={this.props.selectedTag}
                                dispatch={this.props.dispatch}      
                                selectedProjectId={this.props.selectedProjectId}
                                projects={this.props.projects}
                                todos={this.props.todos}
                                selectedTodoId={this.props.selectedTodoId} 
                                tags={this.props.tags}
                                rootRef={this.rootRef}
                            />    
                        }[this.props.selectedCategory]
                    }
                </div>    
        </div> 
    }
}  
 



 





 
















