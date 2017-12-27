import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { 
    attachDispatchToProps, uppercase, insideTargetArea, chooseIcon, byTags, 
    byNotCompleted, byNotDeleted, byCategory, getTagsFromItems 
} from "../../utils";  
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { queryToTodos, getTodos, updateTodo, Todo, removeTodo, addTodo, Project, Area, LayoutItem } from '../../database';
import Popover from 'material-ui/Popover';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Repeat from 'material-ui/svg-icons/av/repeat';
import { Store } from '../../App';
import Inbox from 'material-ui/svg-icons/content/inbox';
import Duplicate from 'material-ui/svg-icons/content/content-copy';
import ShareIcon from 'material-ui/svg-icons/social/share';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import { TextField } from 'material-ui';
import AutosizeInput from 'react-input-autosize';
import { TodosList } from '../TodosList';
import { ContainerHeader } from '../ContainerHeader';
import { Tags } from '../Tags';
import { getProjectLink } from '../Project/ProjectLink';
import { getAreaLink } from '../Area/AreaLink';
import { FadeBackgroundIcon } from '../FadeBackgroundIcon';
import { uniq, allPass } from 'ramda';
 
 

interface NextProps{
    dispatch:Function,
    selectedTodoId:string,
    selectedTag:string,
    rootRef:HTMLElement,
    areas:Area[], 
    projects:Project[], 
    todos:Todo[],
    tags:string[]
}


interface NextState{}; 
 
type Item = Area | Project | Todo;

interface Table{
    [key:string]:Item[],
    projects : Project[],
    areas : Area[],
    todos : Todo[],
    detached : Todo[] 
}
 
 
export class Next extends Component<NextProps, NextState>{

    constructor(props){
        super(props);
    }
  

    shouldComponentUpdate(nextProps:NextProps , nextState:NextState){
        let should = false;

        if(this.props.selectedTodoId!==nextProps.selectedTodoId)
           should = true;
        if(this.props.selectedTag!==nextProps.selectedTag)
           should = true;
        if(this.props.rootRef!==nextProps.rootRef)
           should = true;
        if(this.props.areas!==nextProps.areas)
           should = true;
        if(this.props.projects!==nextProps.projects)
           should = true;
        if(this.props.todos!==nextProps.todos)
           should = true;
        if(this.props.tags!==nextProps.tags)
           should = true;
 
        return should;
    }

 
    groupObjects = () : Table => { 

        let table : Table = { 
            projects : [],
            areas : [],
            todos : [],
            detached : []   
        };


        for(let i=0;  i<this.props.projects.length; i++){
            let project : Project = this.props.projects[i]; 

            if(project.type!=="project") 
               throw new Error(`project is not of type Project ${JSON.stringify(project)}. groupObjects.`); 

            let filters = [
                byTags(this.props.selectedTag), 
                byNotCompleted, 
                byNotDeleted
            ];

            if(allPass(filters)(project)){
               table[project._id] = [];
               table.projects.push(project); 
            }
        };


        for(let i=0;  i<this.props.areas.length; i++){
            let area : Area = this.props.areas[i];

            if(area.type!=="area") 
               throw new Error(`area is not of type Area ${JSON.stringify(area)}. groupObjects.`); 
 
            let filters = [
                byTags(this.props.selectedTag),
                byNotDeleted   
            ];

            if(allPass(filters)(area)){
               table[area._id] = [];
               table.areas.push(area);
            }
        };

        
        for(let i = 0; i<this.props.todos.length; i++){
            let todo : Todo = this.props.todos[i]; 

            if(todo.type!=="todo") 
               throw new Error(`todo is not of type Todo ${JSON.stringify(todo)}. groupObjects.`); 

            let filters = [
                byTags(this.props.selectedTag), 
                byNotCompleted, 
                byNotDeleted
            ];

            if(!allPass(filters)(todo))
                continue;  
             
            table.todos.push(todo);     

            let attached = false;

            for(let j=0; j<table.projects.length; j++){
                let project : Project = table.projects[j];
                let idx : number = project.layout.findIndex( (i:LayoutItem) => i===todo._id );
 
                if(idx!==-1){ 
                   table[project._id].push(todo);
                   attached = true; 
                   break; 
                } 
            } 


            for(let k=0; k<table.areas.length; k++){
                let area : Area = table.areas[k]; 
                let idx : number = area.attachedTodosIds.indexOf(todo._id);
 
                if(idx!==-1){
                   table[area._id].push(todo);
                   attached = true; 
                   break;
                }
            }   


            if(!attached)
               table.detached.push(todo); 
        }

        return table; 
    } 



    render(){

        let table = this.groupObjects();
        let empty = table.projects.length===0  &&  
                    table.areas.length===0  &&  
                    table.todos.length===0;

        let tags = uniq( 
            getTagsFromItems([
                ...table.projects,
                ...table.areas,
                ...table.todos
            ]) 
        );


        return <div>
                    <ContainerHeader 
                        selectedCategory={"next"}  
                        dispatch={this.props.dispatch} 
                        tags={tags} 
                        selectedTag={this.props.selectedTag}
                        showTags={true} 
                    />   
                    <FadeBackgroundIcon    
                        container={this.props.rootRef} 
                        selectedCategory={"next"}  
                        show={empty}
                    />   
                    <div style={{paddingTop:"20px", paddingBottom:"20px"}}>
                        <TodosList    
                            filters={[]}    
                            isEmpty={(empty:boolean) => {}}    
                            dispatch={this.props.dispatch}     
                            selectedCategory={"next"} 
                            selectedTag={this.props.selectedTag}  
                            rootRef={this.props.rootRef}
                            todos={table.detached}  
                            tags={this.props.tags}  
                        /> 
                    </div>  
                    <NextProjectsList 
                        dispatch={this.props.dispatch}
                        selectedTag={this.props.selectedTag}
                        rootRef={this.props.rootRef}
                        tags={this.props.tags}
                        table={table}
                    />  
                    <NextAreasList  
                        dispatch={this.props.dispatch}
                        selectedTag={this.props.selectedTag}
                        rootRef={this.props.rootRef}
                        tags={this.props.tags}
                        table={table}
                    />  
                </div> 

    }

}
 


interface NextProjectsListProps{
    dispatch:Function,
    selectedTag:string, 
    rootRef:HTMLElement,
    tags:string[],
    table:Table
} 
 
interface NextProjectsListState{}

class NextProjectsList extends Component<NextProjectsListProps, NextProjectsListState>{

    constructor(props){
        super(props); 
    }

    render(){
 
        return  <div style={{paddingTop:"20px", paddingBottom:"20px"}}> 
            {    
                this.props.table.projects.map(
                    (p:Project, index:number) : JSX.Element => {

                        return <div key={`project-${index}`} style={{padding:"10px"}}>

                            <div style={{padding:"10px"}}>{
                                getProjectLink(
                                    {width: "15px", height: "15px"}, 
                                    p, 
                                    index, 
                                    this.props.dispatch
                                )
                            }</div> 
 
                            <ExpandableTodosList
                                dispatch={this.props.dispatch}   
                                selectedTag={this.props.selectedTag} 
                                rootRef={this.props.rootRef}
                                todos={this.props.table[p._id] as Todo[]} 
                                tags={this.props.tags}
                            />

                        </div>

                    }
                )
            } 
        </div>

    }

}




interface NextAreasListProps{
    dispatch:Function,
    selectedTag:string, 
    rootRef:HTMLElement,
    tags:string[],
    table:Table
}

interface NextAreasListState{}

class NextAreasList extends Component<NextAreasListProps,NextAreasListState>{

    constructor(props){
        super(props);
    } 
 
    render(){ 
        return <div style={{paddingTop:"20px", paddingBottom:"20px"}}> 
                {  
                    this.props.table.areas.map(
                        (a:Area, index:number) : JSX.Element => { 
                            return <div key={`area${index}`} style={{padding:"10px"}}>

                                <div style={{padding:"10px"}}>
                                    {  
                                        getAreaLink( 
                                            {width:"20px",height:"20px"}, 
                                            a,  
                                            index,  
                                            this.props.dispatch
                                        ) 
                                    }
                                </div>  
  
                                <ExpandableTodosList
                                    dispatch={this.props.dispatch}   
                                    selectedTag={this.props.selectedTag}  
                                    rootRef={this.props.rootRef}
                                    todos={this.props.table[a._id] as Todo[]} 
                                    tags={this.props.tags} 
                                />

                            </div>
                        }
                    )
                } 
        </div>  
    }
}
 
 




interface ExpandableTodosListProps{
    dispatch:Function,   
    selectedTag:string, 
    rootRef:HTMLElement, 
    todos:Todo[],
    tags:string[] 
} 
 

interface ExpandableTodosListState{
    expanded : boolean 
} 

 
 
export class ExpandableTodosList extends Component<ExpandableTodosListProps,ExpandableTodosListState>{

    constructor(props){
        super(props);

        this.state = {
            expanded : false,
        }
    }


    shouldComponentUpdate(nextProps:ExpandableTodosListProps,nextState:ExpandableTodosListState){
        let should = false;

        if(this.props.selectedTag!==nextProps.selectedTag) 
            should = true;
        if(this.props.rootRef!==nextProps.rootRef)
            should = true;
        if(this.props.todos!==nextProps.todos)
            should = true;
        if(this.props.tags!==nextProps.tags)
            should = true;
 

        if(this.state.expanded!==nextState.expanded)
            should = true;    
  

        return should; 
    }


    render(){ 

        let idx = this.state.expanded ? this.props.todos.length : 3; 
        let showExpandButton = this.props.todos.length > 3; 
          
        return <div>  
            <div>     
                <div style={{padding:"10px"}}>      
                    <TodosList       
                        filters={[]}  
                        isEmpty={(empty:boolean) => {}}  
                        dispatch={this.props.dispatch}     
                        selectedCategory={"next"} 
                        selectedTag={this.props.selectedTag}  
                        rootRef={this.props.rootRef}
                        todos={this.props.todos.slice(0,idx)}  
                        tags={this.props.tags}  
                    /> 
                </div>  

                {   
                    !showExpandButton ? null :
                    <div style={{cursor: "pointer", height: "30px"}}>
                        {   
                            <div     
                                onClick={() => this.setState({expanded:!this.state.expanded})}
                                style={{
                                    width:"100%",
                                    height:"30px",
                                    fontSize:"14px",
                                    display:"flex",
                                    alignItems:"center",
                                    cursor:"pointer",  
                                    paddingLeft:"30px",
                                    color:"rgba(100, 100, 100, 0.6)"
                                }}
                            >     
                                { 
                                    !this.state.expanded ? 
                                    `Show ${ this.props.todos.length-3 } more items` :
                                    `Hide` 
                                } 
                            </div>
                        }
                    </div>
                }
            </div>
        </div>
 
    }

} 