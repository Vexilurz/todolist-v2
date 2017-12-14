import './assets/styles.css';  
import './assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, uniq,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, any,
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, 
    groupBy, concat, flatten, toPairs, adjust, prepend, fromPairs 
} from 'ramda';
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { attachDispatchToProps, uppercase, insideTargetArea, chooseIcon, showTags, debounce } from "./utils"; 
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { getTodos, updateTodo, Todo, removeTodo, generateID, addTodo, getProjects, getEvents, getAreas, queryToProjects, queryToAreas, Project, Area, removeArea, removeProject } from './databaseCalls';
import { Footer } from './Components/Footer';
import { Store } from './App';
import { FadeBackgroundIcon } from './Components/FadeBackgroundIcon';
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import { AreaComponent } from './Components/Area';
import { ProjectComponent } from './Components/Project';
import { Trash } from './Components/Trash';
import { Logbook } from './Components/Logbook';
import { Someday } from './Components/Someday';
import { Anytime } from './Components/Anytime';
import { Upcoming } from './Components/Upcoming';
import { Today } from './Components/Today';
import { Inbox } from './Components/Inbox';


export type Category = "inbox" | "today" | "upcoming" | "anytime" | "someday" | 
                       "logbook" | "trash" | "project" | "area" | "evening"; 





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



    updateWidth = debounce(() => this.props.dispatch({type:"leftPanelWidth", load:window.innerWidth/3.7}), 200);

    

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


    removeTodoLocal = (_id:string) => {
        let idx = findIndex((item:Todo) => item._id===_id)(this.props.todos);

        if(idx!==-1)
            this.props.dispatch({
                type:"todos",
                load: [
                    ...this.props.todos.slice(0,idx),
                    ...this.props.todos.slice(idx+1),
                ]
            });
    }  



    onDeleteToDo = (e) => {
        this.removeTodoLocal(this.props.selectedTodoId);
        removeTodo(this.props.selectedTodoId);
    } 



    componentDidMount(){

        this.fetchData();

        

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
  
  

    openTodoInput = (e) => { 
 
        e.stopPropagation(); 

        let id = generateID();

        let todo : Todo = { 
            _id : id,
            category : this.props.selectedCategory,  
            title : '', 
            priority : Math.round(Math.random() * 1000), 
            reminder : null, 
            checked : false,  
            note : '',
            checklist : [],  
            attachedProjects : [],  
            attachedTags : [],
            status : "",
            attachedDate : null,
            deadline : null,
            created : new Date(),  
            deleted : null,
            fulfilled : null, 
            history : [],   
            attachemnts : []
        }  
 
        addTodo(this.onError,todo);

        this.props.dispatch({type:"newTodo", load:todo}); 
 
        if(this.rootRef) 
           this.rootRef.scrollTop = 0; 
    
    } 
    


    selectFooterButtons = () => {

        return [
            "NewTodo" , 
            "Calendar" , 
            "Arrow" , 
            "Search",  
            "Heading",
            "Trash" 
        ]
 
    }


    
    byTags = (todo:Todo) : boolean => { 
        
        if(this.props.selectedTag==="All") 
            return true;    

        if(this.props.selectedCategory==="inbox" || this.props.selectedCategory==="someday")
            return true;  
        
        if(isNil(todo))
            return false;


        if(this.props.selectedTag==="") 
            return true;    

        return contains(this.props.selectedTag,todo.attachedTags);

    } 
        
    
        
    byCategory = (todo:Todo) : boolean => { 

        if(isNil(todo))
            return false; 

        if(todo.category==="evening" && this.props.selectedCategory==="today")
            return true;

        if(this.props.selectedCategory==="anytime")
            return true;
                
        return todo.category===this.props.selectedCategory;

    } 



    render(){  

        let todos = this.props.todos.filter( (t:Todo) => this.byTags(t) && this.byCategory(t) );
         
 
        return  <div ref={(e) => { this.rootRef=e }}
                     className="scroll"  
                     id="maincontainer"
                     style={{    
                        width : window.innerWidth-this.props.leftPanelWidth,
                        position :"relative", 
                        display : "flex", 
                        borderRadius :"1%", 
                        backgroundColor : "rgba(209, 209, 209, 0.1)", 
                        overflow : "scroll",  
                        flexDirection: "column" 
                     }} 
                >    

 
                <FadeBackgroundIcon 
                    container={this.rootRef}
                    objects={todos.filter( t => !t.checked )}
                    selectedCategory={this.props.selectedCategory} 
                />  
 

                <div style={{display: "flex", padding: "10px"}}>   

                    <div className="no-drag" style={{position: "fixed", top: 0, right: 0}}>  

                            <IconButton 
                                iconStyle={{color:"cadetblue",opacity:0,width:"20px",height:"20px"}}
                                className="no-drag" 
                                onTouchTap={() => ipcRenderer.send("reload", this.props.windowId)}
                            >
                                <Refresh />  
                            </IconButton>  

                            <IconButton    
                                onClick={this.openNewWindow}   
                                className="no-drag"  
                                iconStyle={{color:"cadetblue",width:"20px",height:"20px"}}
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
                                todos={todos.filter( t => !t.checked )}
                                tags={this.props.tags}
                            />, 
 
                            today: <Today 
                                dispatch={this.props.dispatch}
                                selectedTodoId={this.props.selectedTodoId}
                                selectedTag={this.props.selectedTag}
                                rootRef={this.rootRef}
                                todos={todos.filter( t => !t.checked )}
                                tags={this.props.tags}
                            />,

                            someday: <Someday 
                                dispatch={this.props.dispatch}
                                selectedTodoId={this.props.selectedTodoId}
                                selectedTag={this.props.selectedTag}
                                rootRef={this.rootRef}
                                todos={todos.filter( t => !t.checked )}
                                tags={this.props.tags}
                            />, 

                            anytime: <Anytime 
                                dispatch={this.props.dispatch}
                                selectedTodoId={this.props.selectedTodoId}
                                selectedTag={this.props.selectedTag}
                                rootRef={this.rootRef}
                                todos={this.props.todos.filter( t => !t.checked )} 
                                tags={this.props.tags}
                            />,
  
                            upcoming: <Upcoming 
                                dispatch={this.props.dispatch}
                                todos={this.props.todos}
                                projects={this.props.projects}
                                events={this.props.events} 
                                areas={this.props.areas}
                                selectedTag={this.props.selectedTag}
                                tags={this.props.tags} 
                                selectedTodoId={this.props.selectedTodoId}
                                rootRef={this.rootRef}
                            />,  

                            logbook: <Logbook   
                                todos={this.props.todos.filter( t => t.checked )}
                                
                                 
                            />,


                            trash: <Trash 
                            
                              

                            
                            />,


                            project : <ProjectComponent 

                                todos={this.props.todos}

                                projects={this.props.projects}

                                areas={this.props.areas}

                                selectedProject={this.props.selectedProject}

                                dispatch={this.props.dispatch}

                            />, 
  

                            area : <AreaComponent 

                                todos={this.props.todos}

                                projects={this.props.projects}

                                areas={this.props.areas} 

                                selectedArea={this.props.selectedArea}

                                dispatch={this.props.dispatch}

                            />

                         }[this.props.selectedCategory]
                    }


                    
     

                    <div style={{ 
                        height:"60px", 
                        width:window.innerWidth-this.props.leftPanelWidth, 
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


                            onNewTodoClick={this.openTodoInput}


                            onTrashClick={this.onDeleteToDo}  


                            onCalendarClick={(e) => {
 


                            }} 

                            onArrowClick={(e) => {



                            }}  

                            onSearchClick={(e) => {



                            }} 

                            onMoreClick={(e) => {



                            }} 


                            onHeadingClick={(e) => {
                                 


                            }}   
                        />  

                    </div>  

             </div>  
        </div> 
  }
} 



























