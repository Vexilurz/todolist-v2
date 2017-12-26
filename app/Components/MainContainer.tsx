import './../assets/styles.css';   
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';   
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton';  
import { Component } from "react"; 
import { attachDispatchToProps, uppercase, insideTargetArea, chooseIcon, 
    showTags, debounce, byTags, byCategory 
} from "../utils";  
import { connect } from "react-redux"; 
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { getTodos, updateTodo, Todo, removeTodo, addTodo, getProjects, getEvents, 
    getAreas, queryToProjects, queryToAreas, Project, Area, initDB, removeArea, removeProject, generateRandomDatabase, 
    destroyEverything, addArea, addProject, addEvent, generateId } from '.././database';
import { Footer } from '.././Components/Footer';
import { Store } from '.././App'; 
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import { AreaComponent } from './Area/Area';
import { ProjectComponent } from './Project/Project';
import { Trash } from './Categories/Trash';
import { Logbook } from './Categories/Logbook';
import { Someday } from './Categories/Someday';
import { Anytime } from './Categories/Anytime';
import { Upcoming } from './Categories/Upcoming';
import { Today } from './Categories/Today';
import { Inbox } from './Categories/Inbox';
import { QuickSearch } from './Search';
import { FadeBackgroundIcon } from './FadeBackgroundIcon';




 
export type Category = "inbox" | "today" | "upcoming" | "anytime" | "someday" | 
                       "logbook" | "trash" | "project" | "area" | "evening" | "deadline"; 

 
                       

interface MainContainerState{ 
    fullWindowSize:boolean
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

        Promise.all([ 
            getTodos(this.onError)(true,this.limit),
            getProjects(this.onError)(true,this.limit), 
            getAreas(this.onError)(true,this.limit),
            getEvents(this.onError)(true,this.limit) 
        ]).then( 
            ([todos, projects, areas, events]) => {  
 
                this.props.dispatch({
                    type:"setAllTypes", 
                    load:{ 
                        todos,
                        projects,
                        areas,
                        events
                    }
                })  
                  
            } 
        )  

    } 
 



    onDeleteToDo = (e) => { 

        if(this.props.selectedTodoId===null || this.props.selectedTodoId===undefined)
           return;  
 
        //this.removeTodoLocal(this.props.selectedTodoId); 
          
    } 


    
    componentDidMount(){


        /*destroyEverything().then(() => { 
                
                initDB();

                let fakeData = generateRandomDatabase({
                    todos : 0,  
                    events : 0, 
                    projects : 0,  
                    areas : 0 
                });  
 
                console.log("fakeData", fakeData); 
                  
                let todos = fakeData.todos;
                let projects = fakeData.projects; 
                let events = fakeData.events;
                let areas = fakeData.areas; 
                
                Promise.all([
                    Promise.all(todos.map( (t:Todo) => addTodo(this.onError,t) )),
                    Promise.all(events.map( (e:Event) => addEvent(this.onError,e) )),
                    Promise.all(projects.map( (p:Project) => addProject(this.onError,p) )),
                    Promise.all(areas.map( (a:Area) => addArea(this.onError,a) ))
                ]).then( 
                    () => this.fetchData()  
                ) 
                  
        })*/  

        
        this.fetchData()  
        window.addEventListener("resize", this.updateWidth);

        window.addEventListener("click", this.closeRightClickMenu); 

        //update separate windows 
        ipcRenderer.removeAllListeners("action");  
        ipcRenderer.on("action", (event, action) => this.props.dispatch(action));
    
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
  
 

    onSearchClick = (e) => { 

        this.props.dispatch({type:"openSearch", load:true}); 

    }


   
    createHeading = (e) => {

        if(this.props.selectedCategory!=="project")
           return;

        let id = this.props.selectedProjectId;

        let heading = {
            type : "heading", 
            title : '',  
            _id : generateId(), 
            key : generateId()
        }; 

        let project = this.props.projects.find( (p:Project) => p._id===id );

        if(!project)
           return; 
 
        let load = {...project, layout:[heading,...project.layout]};
        
        this.props.dispatch({ type:"updateProject", load });
          
    }



    createNewTodo = (e) => { 
 
        //what category selected now?
        //attach to project
        //attach to area
        //etc
 
        if(this.props.selectedCategory==="trash")
           return;


        e.stopPropagation(); 

        let id = generateId();
 
        let todo : Todo = {    
            _id : id,
            type:"todo",
            category : this.props.selectedCategory,  
            title : '', 
            priority : Math.round(Math.random() * 1000), 
            reminder : null, 
            checked : false,  
            note : '',
            checklist : [],   
            attachedTags : [],
            status : "", 
            attachedDate : null,
            deadline : null,
            created : new Date(),  
            deleted : null, 
            completed : null, 
            history : [],    
            attachments : []
        }  

 
        this.props.dispatch({type:"addTodo", load:todo});

 
        if(this.props.selectedCategory==="project"){ 

            this.props.dispatch({ 
                type:"attachTodoToProject", 
                load:{
                    projectId:this.props.selectedProjectId,
                    todoId:todo._id
                } 
            });   

        }else if(this.props.selectedCategory==="area"){

            this.props.dispatch({ 
                type:"attachTodoToArea", 
                load:{
                    areaId:this.props.selectedAreaId,
                    todoId:todo._id
                }     
            });  

        }   

 
        if(this.rootRef) 
           this.rootRef.scrollTop = 0; 
    
    } 
    

 
    selectFooterButtons = () => {

        if(this.props.selectedCategory==="project"){
            return [
                "NewTodo",
                "Heading",
                this.props.selectedTodoId!==null ? "Trash" : undefined,
                this.props.selectedTodoId!==null ? "Arrow" : undefined,
                this.props.selectedTodoId!==null ? "Calendar" : undefined,
                "Search"  
            ].filter( v => !!v) 
        }else if(this.props.selectedCategory==="area"){
            return [
                "NewTodo",
                this.props.selectedTodoId!==null ? "Trash" : undefined,
                this.props.selectedTodoId!==null ? "Arrow" : undefined,
                this.props.selectedTodoId!==null ? "Calendar" : undefined,
                "Search"  
            ].filter( v => !!v)  
        }else if(this.props.selectedCategory==="trash"){
            return ["Search"]
        }else if(this.props.selectedCategory==="logbook"){
            return [
                this.props.selectedTodoId!==null ? "Trash" : undefined,
                this.props.selectedTodoId!==null ? "Arrow" : undefined,
                this.props.selectedTodoId!==null ? "Calendar" : undefined,
                "Search"   
            ].filter( v => !!v) 
        }else if(this.props.selectedCategory==="upcoming"){
            return [
                this.props.selectedTodoId!==null ? "Trash" : undefined,
                this.props.selectedTodoId!==null ? "Arrow" : undefined,
                this.props.selectedTodoId!==null ? "Calendar" : undefined,
                "Search"   
            ].filter( v => !!v)   
        }else{
            return [
                "NewTodo",
                this.props.selectedTodoId!==null ? "Trash" : undefined,
                this.props.selectedTodoId!==null ? "Arrow" : undefined,
                this.props.selectedTodoId!==null ? "Calendar" : undefined,
                "Search"  
            ].filter( v => !!v)  
        }
  
    }



    render(){  
 
        return  <div ref={(e) => { this.rootRef=e }}
                     className="scroll"  
                     id="maincontainer"  
                     style={{    
                        width : this.props.clone ? "100%" : (window.innerWidth-this.props.leftPanelWidth),
                        position :"relative", 
                        display : "flex", 
                        borderRadius :"1%",  
                        backgroundColor : "rgba(209, 209, 209, 0.1)", 
                        overflow : "scroll",  
                        flexDirection: "column" 
                     }} 
                >    
 
                {
                    !this.props.openSearch ? null :
                    <QuickSearch  
                        container={this.rootRef}
                        todos={this.props.todos} 
                        projects={this.props.projects} 
                        areas={this.props.areas}  
                        dispatch={this.props.dispatch} 
                    />
                }   
             
                  
                <div style={{display: "flex", padding: "10px"}}>   

                    <div className="no-drag" style={{position: "fixed", top: 0, right: 0}}>  
 
                            <IconButton 
                                iconStyle={{
                                    color:"rgba(100,100,100,0.6)",
                                    opacity:0,
                                    width:"20px",
                                    height:"20px" 
                                }}
                                className="no-drag" 
                                onTouchTap={() => ipcRenderer.send("reload", this.props.windowId)}
                            >
                                <Refresh />  
                            </IconButton>  

                            <IconButton    
                                onClick={this.openNewWindow}   
                                className="no-drag"  
                                iconStyle={{color:"rgba(100,100,100,0.6)",width:"20px",height:"20px"}}
                            >     
                                <OverlappingWindows />
                            </IconButton>  

                    </div>   

                </div>    



                <div style={{padding:"60px"}}>
     
                   {   
                       {  
                            inbox:<Inbox 
                                dispatch={this.props.dispatch}
                                selectedTodoId={this.props.selectedTodoId}
                                selectedTag={this.props.selectedTag}
                                rootRef={this.rootRef}
                                todos={this.props.todos}
                                tags={this.props.tags}
                            />,  
 
                            today: <Today 
                                dispatch={this.props.dispatch}
                                selectedTodoId={this.props.selectedTodoId}
                                selectedTag={this.props.selectedTag}
                                rootRef={this.rootRef}
                                todos={this.props.todos}
                                tags={this.props.tags}
                            />,

                            upcoming: <Upcoming 
                                dispatch={this.props.dispatch}
                                selectedTodoId={this.props.selectedTodoId}
                                todos={this.props.todos}
                                projects={this.props.projects}
                                selectedTag={this.props.selectedTag}
                                tags={this.props.tags} 
                                rootRef={this.rootRef}
                            />,  
 
                            logbook: <Logbook   
                                dispatch={this.props.dispatch}
                                selectedTodoId={this.props.selectedTodoId}
                                todos={this.props.todos}
                                projects={this.props.projects}
                                selectedTag={this.props.selectedTag}
                                tags={this.props.tags} 
                                rootRef={this.rootRef}
                            />, 

                            someday: <Someday 
                                dispatch={this.props.dispatch}
                                selectedTodoId={this.props.selectedTodoId}
                                selectedTag={this.props.selectedTag}
                                rootRef={this.rootRef}
                                todos={this.props.todos}
                                tags={this.props.tags}
                            />,   

                            anytime: <Anytime   
                                dispatch={this.props.dispatch}
                                selectedTodoId={this.props.selectedTodoId} 
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
                                selectedTag={this.props.selectedTag}
                                todos={this.props.todos}
                                projects={this.props.projects}
                                areas={this.props.areas}
                                rootRef={this.rootRef}      
                            />,
                            



                            project : <ProjectComponent 
                                dispatch={this.props.dispatch} 
                                selectedProjectId={this.props.selectedProjectId}
                                todos={this.props.todos}
                                projects={this.props.projects}  
                                rootRef={this.rootRef}
                                tags={this.props.tags} 
                            />,    

                            area : <AreaComponent 
                                areas={this.props.areas}
                                selectedAreaId={this.props.selectedAreaId}
                                dispatch={this.props.dispatch}
                                projects={this.props.projects}
                                todos={this.props.todos}
                                tags={this.props.tags}
                                rootRef={this.rootRef}
                            />  

                        }[this.props.selectedCategory]
                    }
 


                    <div style={{  
                        height:"60px", 
                        width:this.props.clone ? "100%" : window.innerWidth-this.props.leftPanelWidth, 
                        position:"fixed", 
                        right:"0px",   
                        zIndex:1500,
                        display:"flex",
                        justifyContent:"center",
                        backgroundColor:"white",
                        bottom:"0px",
                        borderTop:"1px solid rgba(100, 100, 100, 0.2)" 
                    }}>     
                        <Footer     
                            buttonsNamesToDispaly={this.selectFooterButtons() as any}
 
                            onNewTodoClick={this.createNewTodo}

                            onTrashClick={this.onDeleteToDo}  

                            onSearchClick={this.onSearchClick} 

                            onHeadingClick={this.createHeading}

                            onCalendarClick={(e) => {}} 

                            onArrowClick={(e) => {}}  

                            onMoreClick={(e) => {}} 
                        />   

                    </div>  

             </div>  
        </div> 
  }
} 










 
















