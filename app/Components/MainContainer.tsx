import './../assets/styles.css';   
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';   
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton';  
import { Component } from "react"; 
import { 
    attachDispatchToProps, uppercase, insideTargetArea, 
    chooseIcon, debounce, byTags, byCategory, generateEmptyTodo, isArray 
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
import { isEmpty, last, isNil, contains, all } from 'ramda';
import { isString } from 'util';


 
export type Category = "inbox" | "today" | "upcoming" | "next" | "someday" | 
                       "logbook" | "trash" | "project" | "area" | "evening" | "deadline"; 

             

interface MainContainerState{ 
    fullWindowSize:boolean
}


let transformLoadDates = (load) : any => {

    if(isNil(load)){
       return load;
    }

    if(load.type==="todo"){
                        
        return convertTodoDates(load);
    }else if(load.type==="project"){

        return convertProjectDates(load);
    }else if(load.type==="area"){

        return convertAreaDates(load); 
    }else if(isArray(load)){

        if(all((a:Area) => a.type==="area", load)){
            return load.map(convertAreaDates);
        }else if(all((p:Project) => p.type==="project", load)){
            return load.map(convertProjectDates);
        }else if(all((t:Todo) => t.type==="todo", load)){
            return load.map(convertTodoDates);
        }   
    } 

    return load;
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



let createNewTodo = (e, props:Store, rootRef:HTMLElement) : void => {   
    
    let allowedTodoCreation : Category[] = [
        "inbox",
        "today", 
        "someday",
        "next", 
        "project", 
        "area"
    ] 

    if(!contains(props.selectedCategory, allowedTodoCreation))
        return; 


    let id : string = generateId();
    let priority : number = 0;

    if(!isEmpty(props.todos)){
        let first : Todo = props.todos[0];
        priority = first.priority - 1; 
    } 

    let todo : Todo = generateEmptyTodo(id,props.selectedCategory,priority);   

    props.dispatch({type:"addTodo", load:todo});

    if(props.selectedCategory==="project"){ 
        
        let project : Project = props.projects.find( (p:Project) => p._id===props.selectedProjectId );

        if(isNil(project)){ 
            if(isDev()){ 
                throw new Error( 
                    `Project with selectedProjectId does not exist.
                    ${props.selectedProjectId} ${JSON.stringify(project)}. 
                    createNewTodo.`
                )  
            } 
        }     

        props.dispatch({ 
            type:"attachTodoToProject", 
            load:{ projectId:project._id, todoId:todo._id } 
        });    

    }else if(props.selectedCategory==="area"){

        let area : Area = props.areas.find( (a:Area) => a._id===props.selectedAreaId );
        
        if(isNil(area)){  
            if(isDev()){ 
                throw new Error(  
                    `Area with selectedAreaId does not exist.
                    ${props.selectedAreaId}. 
                    ${JSON.stringify(area)}. 
                    createNewTodo.`  
                )   
            }
        }  

        props.dispatch({ 
            type:"attachTodoToArea", 
            load:{ areaId:area._id, todoId:todo._id }      
        });  

    }    
 
    if(rootRef){ 
        rootRef.scrollTop = 0; 
    }
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

        if(!this.props.clone){

            destroyEverything()
            .then(() => { 
                 
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
             
        }   
       
        
        window.addEventListener("resize", this.updateWidth);
        window.addEventListener("click", this.closeRightClickMenu); 

        //update separate windows  
        ipcRenderer.removeAllListeners("action");  
        ipcRenderer.on(
            "action", 
            (event, action) => { 
                this.props.dispatch({type:action.type,load:transformLoadDates(action.load)});  
            }
        ); 
    }      
     
    

    componentWillUnmount(){

        window.removeEventListener("resize", this.updateWidth);
        window.removeEventListener("click", this.closeRightClickMenu);
    }  
      
      

    componentWillReceiveProps(nextProps){

        if(this.props.selectedCategory!==nextProps.selectedCategory)
           if(this.rootRef)   
              this.rootRef.scrollTop=0; 
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
                <div style={{display: "flex", padding: "10px"}}>   
                    <div className="no-drag" style={{position: "fixed", top: 0, right: 0}}>  
                            <IconButton 
                                iconStyle={{
                                    color:"rgba(100,100,100,0.6)",
                                    opacity:0,
                                    width:"18px",
                                    height:"18px" 
                                }} 
                                className="no-drag" 
                                onTouchTap={() => ipcRenderer.send("reload", this.props.windowId)}
                            >
                                <Refresh />  
                            </IconButton>  
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


                <div style={{padding:"60px"}}>
                    {   
                        {   
                            inbox:<Inbox 
                                dispatch={this.props.dispatch}
                                selectedTodoId={this.props.selectedTodoId}
                                selectedCategory={this.props.selectedCategory}
                                selectedTag={this.props.selectedTag} 
                                searched={this.props.searched}
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
                                areas={this.props.areas}
                                projects={this.props.projects}
                                selectedTag={this.props.selectedTag}
                                tags={this.props.tags} 
                                rootRef={this.rootRef}
                            />, 

                            someday: <Someday 
                                dispatch={this.props.dispatch}
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




 





 
















