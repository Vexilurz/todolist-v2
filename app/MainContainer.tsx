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
import { attachDispatchToProps, uppercase, insideTargetArea, chooseIcon } from "./utils"; 
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { queryToTodos, getTodos, updateTodo, Todo, removeTodo, generateID, addTodo } from './databaseCalls';
import Popover from 'material-ui/Popover';
import Button from 'material-ui-next/Button';
import { Tags } from './Components/Tags';
import { ListType } from './MainContainerCategories/ListType';
import { Footer } from './Components/Footer';
import { Logbook } from './MainContainerCategories/Logbook';
import { Trash } from './MainContainerCategories/Trash';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Repeat from 'material-ui/svg-icons/av/repeat';
import { Store } from './App';
import Inbox from 'material-ui/svg-icons/content/inbox';
import Duplicate from 'material-ui/svg-icons/content/content-copy';
import ShareIcon from 'material-ui/svg-icons/social/share';
import { Project } from './MainContainerCategories/Project';
import { Area } from './MainContainerCategories/Area';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import { TextField } from 'material-ui';
import AutosizeInput from 'react-input-autosize';
let arrayContainsItem = (array) => (item) : boolean => array.includes(item); 


export type Category = "inbox" | "today" | "upcoming" | "anytime" | "someday" | 
                       "logbook" | "trash" | "project" | "area" | "evening"; 



let byCategory = (selectedCategory) => (todo:Todo) : boolean => { 
    if(isNil(todo))
        return false;  

    return todo.category===selectedCategory;
} 


let selectTitle = (props:Store) => {

    if(props.selectedCategory==="project"){

        let p  = props.selectedProject;

        if(isNil(p))
           return uppercase(props.selectedCategory);

        return uppercase(p.name);  

    }else if(props.selectedCategory==="area"){

        let a  = props.selectedArea;
        
        if(isNil(a))
           return uppercase(props.selectedCategory);

 
        return uppercase(a.name);
          
    }else    
       return uppercase(props.selectedCategory);

}
 

let isListTypeCategory = arrayContainsItem(["inbox" , "today" , "upcoming" , "anytime" , "someday"]);

 

let showTags = (selectedCategory:Category) : boolean => 
    selectedCategory!=="inbox" && 
    selectedCategory!=="someday" &&
    selectedCategory!=="area" &&
    selectedCategory!=="project";


interface MainContainerState{ 
    fullWindowSize:boolean,
    showProjectMenuPopover:boolean,
    projectName:string 
}
     

@connect((store,props) =>  ({ ...store, ...props }), attachDispatchToProps)   
export class MainContainer extends Component<Store,MainContainerState>{
    rootRef:HTMLElement; 
    moreAnchor:HTMLElement; 

    constructor(props){
        super(props);  
        this.state = { 
            fullWindowSize:true,  
            showProjectMenuPopover:false,
            projectName:'New Project' 
        }
    }     
 
    onError = (e) => console.log(e);

    updateWidth = () => this.props.dispatch({type:"leftPanelWidth", load:window.innerWidth/3.7});
    
    closeRightClickMenu = () => {
        if(this.props.showRightClickMenu)
           this.props.dispatch({type:"showRightClickMenu",load:false});  
    }
  
    componentDidMount(){
        let onError = (e) => console.log(e);
        let getTodosCatch = getTodos(onError);

        window.addEventListener("resize", this.updateWidth);

        window.addEventListener("click", this.closeRightClickMenu);
   
        getTodosCatch(true,Infinity) 
        .then(queryToTodos) 
        .then(  
            (todos:Todo[]) => this.props.dispatch({type:"todos", load:todos})
        )   
        
        //get projects 
        //get areas  
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
  

    openNewWindow = () => {
        ipcRenderer.send("cloneWindow",this.props)
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
            created : null,  
            deleted : null,  
            fulfilled : null,   
            history : [],
            attachemnts : []
        };    

        addTodo(this.onError,todo);

        this.props.dispatch({type:"newTodo", load:todo}); 
 
        if(this.rootRef) 
           this.rootRef.scrollTop = 0; 
    }; 
    
    render(){ 

        return <div ref={(e) => { this.rootRef=e }}
            className="scroll"  
            id="maincontainer"
            style={{    
                width: window.innerWidth-this.props.leftPanelWidth,
                position:"relative", 
                display: "flex", 
                borderRadius:"1%", 
                backgroundColor: "rgba(209, 209, 209, 0.1)", 
                overflow: "scroll",  
                flexDirection: "column" 
            }}
        >      
            <div onClick={() => {}
                //this.onBodyClick
                }  style={{padding:"60px"}}>
                    <div className="no-drag" style={{position: "fixed", top: 0, right: 0}}>  
                        <IconButton   
                            //onClick = {this.toggleWindowSize} 
                            onClick={this.openNewWindow}     
                            iconStyle={{color:"cadetblue",width:"20px",height:"20px"}}
                        >     
                            <OverlappingWindows />
                        </IconButton> 
                    </div>  

                    <div style={{ width: "100%"}}> 
                        <div style={{
                            display:"flex", 
                            position:"relative",
                            alignItems:"center",
                            marginBottom:"20px"
                        }}>  

                            <div>{chooseIcon(this.props.selectedCategory)}</div>

                            {
                                this.props.selectedCategory==="project" ? 
                                <AutosizeInput
                                    type="text"
                                    name="form-field-name" 
                                    minWidth={"170px"}
                                    inputStyle={{  
                                        boxSizing: "content-box", 
                                        height: "42px",
                                        fontWeight: "bold", 
                                        maxWidth:"450px",
                                        fontFamily: "sans-serif",
                                        border: "none",
                                        fontSize: "26px",
                                        outline: "none" 
                                    }}
                                    value={this.state.projectName}
                                    placeholder="New Project"
                                    onChange={(event) => {
                                       this.setState({projectName:event.target.value}); 
                                    }} 
                                /> 
                                :
                                <div style={{  
                                    fontFamily: "sans-serif",  
                                    fontSize: "xx-large",
                                    fontWeight: 600,
                                    paddingLeft: "10px",
                                    WebkitUserSelect: "none",
                                    cursor:"default" 
                                }}>   
                                    {selectTitle(this.props)}
                                </div> 
                            }

                            {  

                                this.props.selectedCategory!=="project" ? null :

                                <div  
                                    onClick = {() => this.setState({
                                        showProjectMenuPopover:true
                                    })}  

                                    style={{
                                        marginLeft: "5px",
                                        marginRight: "5px",
                                        width: "32px",
                                        height: "32px",
                                        cursor: "pointer"
                                    }}
                                    ref={ (e) => { this.moreAnchor=e; } }
                                >

                                        <ThreeDots style={{  
                                            color:"rgb(179, 179, 179)",
                                            width:"32px", 
                                            height:"32px",
                                            cursor: "pointer" 
                                        }} />

                                </div> 

                            }

                        </div>
 
 
                        { 
                            this.props.selectedCategory!=="project" ? null : 
                             <TextField  
                                hintText = "Notes"   
                                defaultValue = {''}    
                                multiLine={true} 
                                fullWidth = {true}   
                                onChange={(e, value) => {}}
                                inputStyle = {{fontWeight:600, color:"rgba(100,100,100,1)", fontSize:"15px"}}  
                                //hintStyle = {{top:"3px", left:0, width:"100%", height:"100%"}}   
                                //style = {{height:"28px"}}      
                                underlineFocusStyle = {{borderColor: "rgba(0,0,0,0)"}}    
                                underlineStyle = {{borderColor: "rgba(0,0,0,0)"}}  
                            /> 
                        }

 
                        { 
                            this.props.selectedCategory==="today" ?
                            <div style={{   
                                borderRadius:"10px", 
                                backgroundColor:"rgba(100,100,100,0.1)",
                                width:window.innerWidth/3,
                                height:"140px"
                            }}> 
                            </div>
                            :
                            null
                        } 
 
                        <Tags  
                         selectTag={(tag) => this.props.dispatch({type:"selectedTag",load:tag})}
                         tags={this.props.tags}
                         selectedTag={this.props.selectedTag}
                         show={showTags(this.props.selectedCategory)} 
                        /> 
                    </div>  

                    {
                        this.props.selectedCategory === "inbox" && 
                        compose(isEmpty,filter(byCategory(this.props.selectedCategory)))(this.props.todos)
                        ?  
                        <Inbox style={{ 
                            position: "absolute",
                            color: "rgba(100,100,100,0.1)",
                            top: "40%",
                            left: "40%",
                            fill: "currentcolor",
                            height: "170px",
                            width: "170px",
                            userSelect: "none"
                        }} />
                        :
                        null   
                    }   

     
                    <div>  
                        {
                            isListTypeCategory(this.props.selectedCategory) ?  
                            <ListType 
                                dispatch={this.props.dispatch} 
                                selectedCategory={this.props.selectedCategory}
                                showRightClickMenu={this.props.showRightClickMenu}
                                selectedTag={this.props.selectedTag}
                                selectedTodoId={this.props.selectedTodoId}
                                rootRef={this.rootRef} 
                                todos={this.props.todos}
                                projects={this.props.projects}
                                areas={this.props.areas}
                                tags={this.props.tags}
                                events={this.props.events}
                            /> 
                            :
                            {
                                logbook : 
                                    <Logbook


                                    />,
                                trash : 
                                    <Trash 
                                    
                                    
                                    />, 
                                project : 
                                    <Project 
                                        todos={this.props.todos}
                                        projects={this.props.projects}
                                        areas={this.props.areas}
                                        selectedProject={this.props.selectedProject}
                                        dispatch={this.props.dispatch}
                                    />, 
                                area :  
                                    <Area
                                        todos={this.props.todos}
                                        projects={this.props.projects}
                                        areas={this.props.areas} 
                                        selectedArea={this.props.selectedArea}
                                        dispatch={this.props.dispatch}
                                    />
                            }[  this.props.selectedCategory ]
                        } 
                    </div>
                      
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
                            buttonsNamesToDispaly={
                            [
                                "NewTodo" , 
                                "Calendar" , 
                                "Arrow" , 
                                "Search",  
                                this.props.selectedCategory==="project" ? "Heading" : null
                            ].filter(v => !!v) as any
                            }

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
                    {   
                        this.props.selectedCategory!=="project" ? null :
                        <ProjectMenuPopover
                            close={(e) => this.setState({showProjectMenuPopover:false})}
                            open={this.state.showProjectMenuPopover}
                            origin={{vertical: "center", horizontal: "middle"}}  
                            anchorEl={this.moreAnchor}
                            point={{vertical: "top", horizontal: "middle"}} 
                            dispatch={this.props.dispatch}
                        />    
                    }  
             </div>  
        </div> 
  }
} 






















interface ProjectMenuPopoverProps{
    close : Function,
    open : boolean,
    origin : any,  
    anchorEl : HTMLElement,
    point : any,
    dispatch : Function
}  


export class ProjectMenuPopover extends Component<ProjectMenuPopoverProps,{}>{

    constructor(props){
        super(props); 
    }  


    onComplete = (e) => {
        
    }


    onWhen = (e) => {
        
    }


    onAddTags = (e) => {
        
    }


    onAddDeadline = (e) => {

    }


    onMove = (e) => {
        
    }


    onRepeat = (e) => {

    }


    onDuplicate = (e) => {

    }


    onDelete = (e) => {

    }


    onShare = (e) => {

    }


    render(){ 
        return <Popover 
            className="nocolor"
            style={{
                marginTop:"20px", 
                backgroundColor:"rgba(0,0,0,0)",
                background:"rgba(0,0,0,0)",
                borderRadius:"10px"
            }}   
            open={this.props.open}
            anchorEl={this.props.anchorEl}
            onRequestClose={() => this.props.close()}
            anchorOrigin={this.props.origin} 
            targetOrigin={this.props.point} 
        >   
            <div  className={"darkscroll"}
                    style={{  
                        backgroundColor: "rgb(39, 43, 53)",
                        paddingRight: "10px",
                        paddingLeft: "10px",
                        borderRadius: "10px",
                        paddingTop: "5px",
                        paddingBottom: "5px",
                        cursor:"pointer" 
                    }} 
            >    

                    <div  
                        onClick={this.onComplete} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <CheckCircle style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Complete project   
                        </div>     
                    </div>
                
 
 
                    <div  
                        onClick={this.onWhen} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <CalendarIco style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            When   
                        </div>     
                    </div>


                    <div   
                        onClick={this.onAddTags} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <TriangleLabel style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Add tags  
                        </div>     
                    </div>




 
                    <div  
                        onClick={this.onAddDeadline} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <Flag style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Add deadline 
                        </div>     
                    </div>
 




                    <div style={{
                        border:"1px solid rgba(200,200,200,0.1)",
                        marginTop: "5px",
                        marginBottom: "5px"
                    }}>
                    </div>






                    <div  
                        onClick={this.onMove} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >   
                        <Arrow style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Move 
                        </div>     
                    </div>

 

                    <div  
                        onClick={this.onRepeat} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <Repeat style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Repeat...  
                        </div>     
                    </div>

                    <div  
                        onClick={this.onDuplicate} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <Duplicate style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                             Duplicate project 
                        </div>     
                    </div>
                 

                    <div   
                        onClick={this.onDelete} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <TrashIcon style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Delete project  
                        </div>     
                    </div>

                    <div  
                        onClick={this.onShare} 
                        className={"tagItem"} style={{
                            display:"flex",  
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >      
                        <ShareIcon style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                          Share
                        </div>     
                    </div>
 
            </div> 
        </Popover> 


    }

}

