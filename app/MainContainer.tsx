import './assets/styles.css';  
import './assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, uniq,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, any,
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, 
    groupBy, concat, flatten, toPairs, adjust, prepend, fromPairs 
} from 'ramda';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { attachDispatchToProps, uppercase, insideTargetArea, chooseIcon, showTags } from "./utils"; 
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { queryToTodos, getTodos, updateTodo, Todo, removeTodo, generateID, addTodo, getProjects, getEvents, getAreas, queryToProjects, queryToAreas, Project, Area, removeArea, removeProject } from './databaseCalls';
import Popover from 'material-ui/Popover';
import Button from 'material-ui-next/Button';
import { Tags } from './Components/Tags';
import { Footer } from './Components/Footer';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Repeat from 'material-ui/svg-icons/av/repeat';
import { Store } from './App';
import Duplicate from 'material-ui/svg-icons/content/content-copy';
import ShareIcon from 'material-ui/svg-icons/social/share';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import { TextField } from 'material-ui';
import AutosizeInput from 'react-input-autosize';
import { FadeBackgroundIcon } from './Components/FadeBackgroundIcon';
import Clear from 'material-ui/svg-icons/content/clear';
import Remove from 'material-ui/svg-icons/content/remove'; 
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import FullScreen from 'material-ui/svg-icons/image/crop-square';
import { AreaComponent } from './Components/Area';
import { ProjectComponent } from './Components/Project';
import { Trash } from './Components/Trash';
import { Logbook } from './Components/Logbook';
import { Someday } from './Components/Someday';
import { Anytime } from './Components/Anytime';
import { Upcoming } from './Components/Upcoming';
import { Today } from './Components/Today';
import { Inbox } from './Components/Inbox';



let byTags = (todo:Todo) : boolean => { 
    
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
    
    
    
let byCategory = (todo:Todo) : boolean => { 

    if(isNil(todo))
        return false; 

    if(todo.category==="evening" && this.props.selectedCategory==="today")
        return true;

    if(this.props.selectedCategory==="anytime")
        return true;
            
    return todo.category===this.props.selectedCategory;

} 
    



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



    componentDidMount(){

        this.fetchData();

        ipcRenderer.removeAllListeners("action"); 

        ipcRenderer.on("action", (event, action) => this.props.dispatch(action));
        
        window.addEventListener("resize", this.updateWidth);

        window.addEventListener("click", this.closeRightClickMenu);
    
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
            priority : Math.round(Math.random() * 100),
            note : '',
            checklist : [],   
            attachedProjects : [], 
            attachedTags : [],
            attachedDate : null,  
            status : "",
            reminder : null, 
            deadline : null,  
            created : new Date(),  
            deleted : null,  
            fulfilled : null,   
            history : [],
            attachemnts : []
        };    

        addTodo(this.onError,todo);

        this.props.dispatch({type:"newTodo", load:todo}); 
 
        if(this.rootRef) 
           this.rootRef.scrollTop = 0; 

    } 
    


    openNewWindow = () => {
        
        let clonedStore = {...this.props};

        clonedStore.windowId = undefined;

        ipcRenderer.send("cloneWindow", clonedStore);
    
    }



    selectFooterButtons = () => {

        return [
            "NewTodo" , 
            "Calendar" , 
            "Arrow" , 
            "Search",  
            "Heading" 
        ]

    }


    render(){ 

        let todos = compose(  
            filter(byTags),
            filter(byCategory)
        )(this.props.todos);

 
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
                    objects={todos}
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
                                todos={todos}
                                tags={this.props.tags}
                            />, 

                            today: <Today 
                                dispatch={this.props.dispatch}
                                selectedTodoId={this.props.selectedTodoId}
                                selectedTag={this.props.selectedTag}
                                rootRef={this.rootRef}
                                todos={todos}
                                tags={this.props.tags}
                            />,

                            anytime: <Anytime 
                            
                             
                            

                            />,

                            someday: <Someday 
                            
                            

                            
                            />, 

                            upcoming: <Upcoming 
                                todos={this.props.todos}
                                projects={this.props.projects}
                                events={this.props.events}
                                areas={this.props.areas}
                            />, 

                            logbook: <Logbook 
                            
                            
                            

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



                            onCalendarClick={(e) => {
 


                            }} 

                            onArrowClick={(e) => {



                            }}  

                            onSearchClick={(e) => {



                            }} 

                            onMoreClick={(e) => {



                            }} 

                            onTrashClick={(e) => {



                            }}  

                            onHeadingClick={(e) => {
                                 


                            }}   
                        />  

                    </div>  

             </div>  
        </div> 
  }
} 



























