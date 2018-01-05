import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { 
    attachDispatchToProps, uppercase, insideTargetArea, chooseIcon, byTags, 
    byNotCompleted, byNotDeleted, byCategory, getTagsFromItems, isString, attachEmptyTodo, generateEmptyTodo, isProject, assert, isArea, isTodo, isArrayOfStrings 
} from "../../utils";  
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { queryToTodos, getTodos, updateTodo, Todo, removeTodo, addTodo, Project, Area, LayoutItem } from '../../database';
import Popover from 'material-ui/Popover';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Repeat from 'material-ui/svg-icons/av/repeat';
import { Store, isDev } from '../../app';
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
import { uniq, allPass, isEmpty, isNil } from 'ramda';
import { TodoInput } from '../TodoInput/TodoInput';
 
  

interface NextProps{
    dispatch:Function, 
    selectedTodoId:string,
    searched:boolean, 
    selectedCategory:string, 
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
    projectsFilters : ((p:Project) => boolean)[];
    areasFilters : ((a:Area) => boolean)[];
    todosFilters : ((t:Todo) => boolean)[];
 
    constructor(props){
        super(props);
        this.projectsFilters = [byNotCompleted, byNotDeleted]; 
        this.areasFilters = [byNotDeleted];
        this.todosFilters = [
            byCategory("next"),
            (t:Todo) => isNil(t.attachedDate),
            byNotCompleted, 
            byNotDeleted
        ];  
    }


    collectProjects = (table:Table) : Table => {
        for(let i=0;  i<this.props.projects.length; i++){
            let project : Project = this.props.projects[i]; 

            assert(
              isProject(project), 
              `project is not of type Project. ${JSON.stringify(project)}. groupObjects. next.`
            );  
  
            if(allPass([byTags(this.props.selectedTag), ...this.projectsFilters])(project)){
               table[project._id] = [];
               table.projects.push(project);  
            }
        };

        return table;
    } 


    collectAreas = (table:Table) : Table => {
        for(let i=0; i<this.props.areas.length; i++){
            let area : Area = this.props.areas[i]; 

            assert(
              isArea(area), 
              `area is not of type Area. ${JSON.stringify(area)}. groupObjects. next.`
            );   
            
            if(allPass([byTags(this.props.selectedTag), ...this.areasFilters])(area)){
               table[area._id] = [];
               table.areas.push(area);
            }
        };

        return table;
    }
 
  
    groupObjects = () : Table => { 
        let table : Table = { 
            projects : [],
            areas : [],
            todos : [],
            detached : []   
        };  
 
        table = this.collectProjects(table);
        table = this.collectAreas(table);

        for(let i = 0; i<this.props.todos.length; i++){
            let todo : Todo = this.props.todos[i]; 

            assert(isTodo(todo),`todo is not of type Todo. ${JSON.stringify(todo)}. groupObjects. next.`);

            if(!allPass([byTags(this.props.selectedTag), ...this.todosFilters])(todo))
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



    getNextTags = () : string[] => {
        let {areas, projects, todos} = this.props;

        return uniq(   
            getTagsFromItems([  
              ...projects.filter(allPass(this.projectsFilters)),
              ...areas.filter(allPass(this.areasFilters)),
              ...todos.filter(allPass(this.todosFilters))   
            ]) 
        );   
    }


    render(){ 

        let table = this.groupObjects();

        let empty = table.projects.length===0 && table.areas.length===0 && table.todos.length===0;
         
        let tags = this.getNextTags();
        
        assert(isArrayOfStrings(tags), `tags is not an array of strings. ${JSON.stringify(tags)}. render. next.`);
         
        let emptyTodo = generateEmptyTodo("emptyTodo", "next", 0);  

        return  <div>
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
                        <TodoInput   
                            id={emptyTodo._id}
                            key={emptyTodo._id}  
                            dispatch={this.props.dispatch}  
                            selectedCategory={"next"}  
                            projects={this.props.projects} 
                            selectedTodoId={this.props.selectedTodoId}
                            tags={this.props.tags} 
                            searched={this.props.searched}
                            rootRef={this.props.rootRef}  
                            todo={emptyTodo}
                            creation={true}
                        /> 
                        <TodosList     
                            filters={[]}      
                            isEmpty={(empty:boolean) => {}}    
                            selectedTodoId={this.props.selectedTodoId} 
                            dispatch={this.props.dispatch}     
                            areas={this.props.areas}
                            projects={this.props.projects}
                            selectedCategory={"next"} 
                            searched={this.props.searched}
                            selectedTag={this.props.selectedTag}  
                            rootRef={this.props.rootRef}
                            todos={table.detached}  
                            tags={this.props.tags}  
                        /> 
                    </div>  
                    <NextProjectsList 
                        dispatch={this.props.dispatch}
                        selectedTag={this.props.selectedTag}
                        searched={this.props.searched}
                        selectedTodoId={this.props.selectedTodoId} 
                        rootRef={this.props.rootRef}
                        todos={this.props.todos}
                        areas={this.props.areas}
                        projects={this.props.projects}
                        tags={this.props.tags}
                        table={table}
                    />  
                    <NextAreasList   
                        dispatch={this.props.dispatch}
                        selectedTag={this.props.selectedTag} 
                        searched={this.props.searched}
                        selectedTodoId={this.props.selectedTodoId}
                        rootRef={this.props.rootRef}
                        todos={this.props.todos}
                        areas={this.props.areas}
                        projects={this.props.projects} 
                        tags={this.props.tags}
                        table={table}
                    />  
                </div> 
    }
}  



let byHaveTodos = (table) => (project:Project) : boolean => {
    let todosIds : string[] = project.layout.filter(isString) as string[]; 
    return !isEmpty(todosIds) && !isEmpty(table[project._id]); 
}



let byContainsItems = (table) => (area:Area) : boolean => {
    let todosIds : string[] = area.attachedTodosIds;
    let projectsIds : string[] = area.attachedProjectsIds;
    return !isEmpty(todosIds) || !isEmpty(table[area._id]);
}   
   

 
interface NextProjectsListProps{
    dispatch:Function,
    selectedTag:string, 
    searched:boolean, 
    selectedTodoId:string, 
    todos:Todo[], 
    rootRef:HTMLElement,
    tags:string[],
    table:Table,
    areas:Area[],
    projects:Project[] 
} 
 
interface NextProjectsListState{}

class NextProjectsList extends Component<NextProjectsListProps, NextProjectsListState>{

    constructor(props){
        super(props); 
    }  

    render(){ 
 
        return  <div style={{paddingTop:"10px", paddingBottom:"10px"}}> 
            {     
                this
                .props
                .table
                .projects
                .filter(byHaveTodos(this.props.table))
                .map(
                    (p:Project, index:number) : JSX.Element => {

                        return <div key={`project-${index}`}>

                            <div>{ 
                                getProjectLink(
                                    p,  
                                    this.props.todos,  
                                    this.props.dispatch, 
                                    index
                                )
                            }</div> 
 
                            <ExpandableTodosList
                                dispatch={this.props.dispatch}   
                                selectedTag={this.props.selectedTag} 
                                searched={this.props.searched}
                                selectedTodoId={this.props.selectedTodoId} 
                                rootRef={this.props.rootRef}
                                todos={this.props.table[p._id] as Todo[]} 
                                tags={this.props.tags}
                                areas={this.props.areas}
                                projects={this.props.projects}
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
    searched:boolean, 
    selectedTodoId:string, 
    rootRef:HTMLElement,
    tags:string[],
    todos:Todo[],
    projects:Project[],
    areas:Area[], 
    table:Table
}

interface NextAreasListState{}

class NextAreasList extends Component<NextAreasListProps,NextAreasListState>{

    constructor(props){
        super(props);
    } 
  
 
    render(){ 
        return <div style={{paddingTop:"10px", paddingBottom:"10px"}}> 
                {  
                    this.props
                    .table
                    .areas
                    .filter(byContainsItems(this.props.table))
                    .map(
                        (a:Area, index:number) : JSX.Element => { 
                            return <div key={`area${index}`}>
                                <div>  
                                  {  
                                    getAreaLink(
                                        a,  
                                        this.props.todos, 
                                        this.props.projects, 
                                        index, 
                                        this.props.dispatch
                                    )       
                                  }  
                                </div>  
  
                                <ExpandableTodosList
                                    dispatch={this.props.dispatch}   
                                    searched={this.props.searched}
                                    selectedTag={this.props.selectedTag}  
                                    rootRef={this.props.rootRef}
                                    selectedTodoId={this.props.selectedTodoId} 
                                    todos={this.props.table[a._id] as Todo[]} 
                                    tags={this.props.tags} 
                                    areas={this.props.areas}
                                    projects={this.props.projects}
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
    searched:boolean, 
    selectedTag:string, 
    selectedTodoId:string, 
    areas:Area[],
    projects:Project[], 
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
        if(this.props.areas!==nextProps.areas)
            should = true;
        if(this.props.projects!==nextProps.projects)
            should = true;    
        if(this.props.tags!==nextProps.tags)
            should = true;
        if(this.props.searched!==nextProps.searched)
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
                        areas={this.props.areas}
                        searched={this.props.searched}
                        projects={this.props.projects}
                        selectedTodoId={this.props.selectedTodoId} 
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