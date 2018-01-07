import './../assets/styles.css';   
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';   
import { ipcRenderer, remote } from 'electron';
import IconButton from 'material-ui/IconButton';  
import { Component } from "react"; 
import { 
    attachDispatchToProps, uppercase, insideTargetArea, 
    chooseIcon, debounce, byTags, byCategory, generateEmptyTodo, isArray, isTodo, isProject, isArea, isArrayOfAreas, isArrayOfProjects, isArrayOfTodos, assert 
} from "../utils";  
import { connect } from "react-redux"; 
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { getTodos, updateTodo, Todo, removeTodo, addTodo, getProjects, 
    getAreas, queryToProjects, queryToAreas, Project, Area, initDB, removeArea, 
    removeProject, destroyEverything, addArea, addProject, generateId, addTodos, 
    addProjects, addAreas, Heading, LayoutItem } from '.././database';
import { Store, isDev } from '.././app';   
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import { AreaComponent } from './Area/Area';
import { ProjectComponent } from './Project/Project';
import { Trash } from './Categories/Trash';
import { Logbook } from './Categories/Logbook';
import { Someday } from './Categories/Someday';
import { Next } from './Categories/Next';  
import { Upcoming } from './Categories/Upcoming';
import { Today } from './Categories/Today';
import { Inbox } from './Categories/Inbox';
import { QuickSearch } from './Search';
import { FadeBackgroundIcon } from './FadeBackgroundIcon';
import { generateRandomDatabase } from '../generateRandomObjects';
import { isEmpty, last, isNil, contains, all, not, assoc } from 'ramda';
import { isString } from 'util';


 
export type Category = "inbox" | "today" | "upcoming" | "next" | "someday" | 
                       "logbook" | "trash" | "project" | "area" | "evening" | "deadline"; 

             

interface MainContainerState{ 
    fullWindowSize:boolean
}


let transformLoadDates = (load) : any => {

    let converted = load;

    if(isTodo(load)){
        converted = convertTodoDates(load);
    }else if(isProject(load)){
        converted = convertProjectDates(load);
    }else if(isArea(load)){
        converted = convertAreaDates(load); 
    }else if(isArray(load)){
        if(isArrayOfAreas(load)){
            converted = load.map(convertAreaDates);
        }else if(isArrayOfProjects(load)){
            converted = load.map(convertProjectDates);
        }else if(isArrayOfTodos(load)){
            converted = load.map(convertTodoDates);
        }   
    }    

    if(!isNil(load.todos)){
        if(isArrayOfTodos(load.todos)){
           load.todos = load.todos.map(convertTodoDates);
        } 
    }

    if(!isNil(load.projects)){
        if(isArrayOfProjects(load.projects)){
           load.projects = load.projects.map(convertProjectDates);
        }
    }

    if(!isNil(load.areas)){
        if(isArrayOfAreas(load.areas)){
           load.areas = load.areas.map(convertAreaDates);
        } 
    }
 
    return  converted;  
}


let convertTodoDates = (t:Todo) : Todo => ({
    ...t, 
    reminder : !t.reminder ? undefined :  
                typeof t.reminder==="string" ? new Date(t.reminder) : 
                t.reminder,

    deadline : !t.deadline ? undefined : 
                typeof t.deadline==="string" ? new Date(t.deadline) : 
                t.deadline,
    
    created : !t.created ? undefined : 
               typeof t.created==="string" ? new Date(t.created) : 
               t.created,
    
    deleted : !t.deleted ? undefined : 
               typeof t.deleted==="string" ? new Date(t.deleted) : 
               t.deleted,
    
    attachedDate : !t.attachedDate ? undefined : 
                    typeof t.attachedDate==="string" ? new Date(t.attachedDate) : 
                    t.attachedDate,
    
    completed : !t.completed ? undefined : 
                typeof t.completed==="string" ? new Date(t.completed) : 
                t.completed
});



let convertProjectDates = (p:Project) : Project => ({
    ...p,
    created : !p.created ? undefined : 
               typeof p.created==="string" ? new Date(p.created) : 
               p.created,

    deadline : !p.deadline ? undefined : 
                typeof p.deadline==="string" ? new Date(p.deadline) : 
                p.deadline,

    deleted : !p.deleted ? undefined : 
               typeof p.deleted==="string" ? new Date(p.deleted) : 
               p.deleted,

    completed : !p.completed ? undefined : 
                 typeof p.completed==="string" ? new Date(p.completed) : 
                 p.completed  
});



let convertAreaDates = (a:Area) : Area => ({
    ...a, 
    created : !a.created ? undefined : 
               typeof a.created==="string" ? new Date(a.created) : 
               a.created,

    deleted : !a.deleted ? undefined : 
               typeof a.deleted==="string" ? new Date(a.deleted) : 
               a.deleted,
});


export let convertDates = ([todos, projects, areas]) => [ 
    todos.map(convertTodoDates),
    projects.map(convertProjectDates),
    areas.map(convertAreaDates)     
];  
 
  
  
export let createHeading = (e, props:Store) : void => {
    
        if(props.selectedCategory!=="project"){
            if(isDev()){ 
                throw new Error(
                    `Attempt to create heading outside of project template. ${props.selectedCategory}. 
                    createHeading`
                );
            } 
        }  

        let id : string = props.selectedProjectId;

        if(isNil(id)){
           if(isDev()){ 
              throw new Error(`selectedProjectId undefined ${id}. createHeading.`);
           }
        }

        
        let project = props.projects.find( (p:Project) => p._id===id );

        if(!project){  
            if(isDev()){ 
                throw new Error(
                    `this.props.selectedProjectId ${props.selectedProjectId} do not correspond to existing project.
                    ${JSON.stringify(props.projects)}. createHeading`
                );   
            }   
        }

        let priority = 0; 

        if(!isEmpty(project.layout)){
            let item : LayoutItem = last(project.layout);

            if(isString(item)){ 

                let todo = props.todos.find( (t:Todo) => t._id===item );

                if(todo.type!=="todo"){ 
                    if(isDev()){ 
                        throw new Error(`
                            todo is not of type Todo. 
                            todo : ${JSON.stringify(todo)}. 
                            item : ${JSON.stringify(item)}. 
                            createHeading.
                        `); 
                    } 
                }

                priority = todo.priority + 1; 
                
            }else if(item.type==="heading"){

                let heading : Heading = item; 

                if(heading.type!=="heading"){ 
                    if(isDev()){ 
                       throw new Error(`heading is not of type Heading. ${JSON.stringify(heading)} createHeading `);
                    }
                } 

                priority = heading.priority + 1;

            }else{
                if(isDev()){ 
                   throw new Error(`Selected item is not of type LayoutItem. ${JSON.stringify(item)}. createHeading.`); 
                }
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



@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)   
export class MainContainer extends Component<Store,MainContainerState>{

    rootRef:HTMLElement; 
    limit:number;

    constructor(props){

        super(props);  

        this.limit = 10000;

        this.state = {   
            fullWindowSize:true 
        }
        
           
        if(this.props.windowId===1){  
            
            destroyEverything()   
            .then(() => {  
                console.log("DESTROY!!!");  
                initDB();

                let fakeData = generateRandomDatabase({ 
                    todos : 140,  
                    projects : 38,  
                    areas : 5 
                });     
                 
                let todos = fakeData.todos;
                let projects = fakeData.projects; 
                let areas = fakeData.areas; 
                
                Promise.all([
                    addTodos(this.onError,todos),    
                    addProjects(this.onError,projects), 
                    addAreas(this.onError,areas) 
                ]) 
                .then(() => this.fetchData())    
            })
            //this.fetchData();   
        }    
    }    
    

    openNewWindow = () => { 
        let clonedStore = {...this.props};
        clonedStore.windowId = undefined;
        ipcRenderer.send("cloneWindow", clonedStore);
    }
 
 

    onError = (e) => console.log(e);



    updateWidth = () => this.props.dispatch({type:"leftPanelWidth", load:window.innerWidth/3.7});
  
     

    closeRightClickMenu = () => {

        if(this.props.showRightClickMenu)
           this.props.dispatch({type:"showRightClickMenu", load:false});  
    }

    

    fetchData = () => { 
        if(this.props.clone)
           return; 

        Promise.all([ 
            getTodos(this.onError)(true,this.limit),
            getProjects(this.onError)(true,this.limit), 
            getAreas(this.onError)(true,this.limit)
        ])
        .then(convertDates)
        .then(([todos, projects, areas]) => {

                this.props.dispatch({ 
                    type:"setAllTypes", 
                    load:{ 
                        todos,
                        projects,
                        areas
                    }
                })  
            } 
        ) 
    } 
     
    
    componentDidMount(){
        
        window.addEventListener("resize", this.updateWidth);
        window.addEventListener("click", this.closeRightClickMenu); 

        //update separate windows   
        ipcRenderer.removeAllListeners("action");   
        ipcRenderer.on(
            "action", 
            (event, action:{type:string, kind:string, load:any}) => { 

                if(action.type==="setAllTypes" && !this.props.clone){
                   return; 
                } 

                this.props.dispatch(assoc("load", transformLoadDates(action.load), action));      
            }
        );  
    }      
     
    

    componentWillUnmount(){
        window.removeEventListener("resize", this.updateWidth);
        window.removeEventListener("click", this.closeRightClickMenu);
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
                        width:this.props.clone ?  
                              `${window.innerWidth}px` :   
                              `${window.innerWidth-this.props.currentleftPanelWidth}px`,
                        height:`${window.innerHeight}px`,     
                        position:"relative",  
                        display:"flex",   
                        backgroundColor:"rgba(209, 209, 209, 0.1)", 
                        overflow:"scroll",      
                        flexDirection:"column"   
                    }}  
                >  
                <div style={{display: "flex", padding: "10px", minWidth:"500px"}}>   
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
 

                <div style={{padding:"60px", minWidth:"500px"}}>
                    {    
                        {   
                            inbox:<Inbox 
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
          
                            today: <Today 
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
                            />,
  
                            evening: <Today 
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
                            />,

                            upcoming: <Upcoming 
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
                            />,  
 
                            logbook: <Logbook   
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

                            someday: <Someday 
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

                            next: <Next   
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
       
                            trash: <Trash   
                                dispatch={this.props.dispatch}
                                tags={this.props.tags}
                                searched={this.props.searched}
                                selectedCategory={this.props.selectedCategory}
                                selectedTag={this.props.selectedTag}
                                selectedTodoId={this.props.selectedTodoId} 
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




 





 
















