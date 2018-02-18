import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { 
    attachDispatchToProps, byTags, 
    byNotCompleted, byNotDeleted, byCategory, getTagsFromItems, 
    attachEmptyTodo, isToday, groupObjects 
} from "./../utils/utils";  
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { 
    queryToTodos, getTodos, updateTodo, Todo, removeTodo, addTodo, 
    Project, Area, LayoutItem
} from './../database';
import Popover from 'material-ui/Popover';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Repeat from 'material-ui/svg-icons/av/repeat';
import { Store } from './../app';
import Inbox from 'material-ui/svg-icons/content/inbox';
import Duplicate from 'material-ui/svg-icons/content/content-copy';
import ShareIcon from 'material-ui/svg-icons/social/share';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import { TextField } from 'material-ui';
import AutosizeInput from 'react-input-autosize';
import { TodosList } from './TodosList';
import { ContainerHeader } from './ContainerHeader';
import { Tags } from './Tags';
import { FadeBackgroundIcon } from './FadeBackgroundIcon';
import { uniq, allPass, isEmpty, isNil, not, any, contains } from 'ramda';
import { TodoInput } from './TodoInput/TodoInput';
import { ProjectLink } from './Project/ProjectLink';
import { Category } from './MainContainer';
import { AreaLink } from './Area/AreaLink';
import { TodoCreationForm } from './TodoInput/TodoCreation';
import { generateId } from './../utils/generateId';
import { generateEmptyTodo } from './../utils/generateEmptyTodo';




interface GroupsByProjectAreaProps{
    dispatch:Function, 
    selectedProjectId:string, 
    groupTodos:boolean, 
    selectedTodo:Todo, 
    moveCompletedItemsToLogbook:string,
    selectedAreaId:string,
    selectedCategory:Category, 
    selectedTag:string,
    rootRef:HTMLElement,
    areas:Area[], 
    projects:Project[],
    projectsFilters: ((p:Project) => boolean)[],
    areasFilters: ((a:Area) => boolean)[],
    todos:Todo[]
}

interface GroupsByProjectAreaState{}

export class GroupsByProjectArea extends Component<GroupsByProjectAreaProps,GroupsByProjectAreaState>{

    constructor(props){
        super(props);
    }

    render(){

        let { 
            projects, projectsFilters, areasFilters, areas, todos, selectedTag, selectedCategory 
        } = this.props;

        let table = groupObjects(  
            projects, 
            areas, 
            todos, 
            projectsFilters,
            areasFilters,
            [],
            selectedTag
        );

        return <div>
        <div>
            {
                isEmpty(table.detached) ? null :
                <TodosList            
                    dispatch={this.props.dispatch}     
                    areas={this.props.areas}
                    groupTodos={this.props.groupTodos}
                    selectedTodo={this.props.selectedTodo}
                    moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                    projects={this.props.projects}
                    selectedCategory={this.props.selectedCategory} 
                    selectedAreaId={this.props.selectedAreaId}
                    selectedProjectId={this.props.selectedProjectId}
                    selectedTag={this.props.selectedTag}  
                    rootRef={this.props.rootRef}
                    todos={table.detached}  
                /> 
            }
        </div>  
        <div style={{paddingTop:"10px", paddingBottom:"10px", WebkitUserSelect:"none"}}> 
        {     
            table.projects
            .sort((a:Project, b:Project) => a.priority-b.priority)
            .map( 
                (project:Project, index:number) : JSX.Element => {
                    let category = this.props.selectedCategory;
                    let todos = table[project._id] as Todo[];
                    let hide = isNil(project.hide) ? false : contains(category)(project.hide); 
                          
                    return (isEmpty(todos) || hide) ? null : 
                    <div key={`project-link-${project._id}`}>  
                        <ProjectLink {...{project,showMenu:true} as any}/> 
                        <ExpandableTodosList
                            dispatch={this.props.dispatch}   
                            selectedTag={this.props.selectedTag} 
                            selectedTodo={this.props.selectedTodo}
                            selectedAreaId={this.props.selectedAreaId}
                            moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                            selectedProjectId={this.props.selectedProjectId}
                            rootRef={this.props.rootRef}
                            groupTodos={this.props.groupTodos}
                            selectedCategory={this.props.selectedCategory}
                            todos={todos} 
                            areas={this.props.areas}
                            projects={this.props.projects}
                            project={project}
                        />
                    </div>
                } 
            ) 
        } 
        </div>
        <div style={{paddingTop:"10px", paddingBottom:"10px", WebkitUserSelect:"none"}}> 
            {  
                table.areas.map(
                    (a:Area, index:number) : JSX.Element => { 
                        let todos = table[a._id] as Todo[];
                        return isEmpty(todos) ? null : 
                        <div key={`area${index}`}>
                            <AreaLink {...{area:a} as any}/>
                            <ExpandableTodosList
                                dispatch={this.props.dispatch}   
                                selectedTag={this.props.selectedTag}  
                                selectedTodo={this.props.selectedTodo}
                                moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook} 
                                rootRef={this.props.rootRef}
                                groupTodos={this.props.groupTodos}
                                selectedCategory={this.props.selectedCategory}
                                selectedAreaId={this.props.selectedAreaId}
                                selectedProjectId={this.props.selectedProjectId}
                                todos={todos} 
                                areas={this.props.areas}
                                projects={this.props.projects}
                            />
                        </div>
                    }
                )  
            }   
        </div> 
        </div> 
    }

}

interface ExpandableTodosListProps{
    dispatch:Function,   
    moveCompletedItemsToLogbook:string,
    selectedTodo:Todo,
    selectedAreaId:string,
    selectedCategory:Category,
    groupTodos:boolean,
    selectedProjectId:string, 
    selectedTag:string, 
    areas:Area[],
    projects:Project[], 
    rootRef:HTMLElement, 
    todos:Todo[], 
    project?:Project   
} 
 

interface ExpandableTodosListState{
    expanded : boolean 
}   

 
export class ExpandableTodosList extends Component<ExpandableTodosListProps,ExpandableTodosListState>{

    constructor(props){
        super(props);
        this.state={expanded:false};
    } 

    onToggle = () => this.setState({expanded:!this.state.expanded})

    render(){ 
        let { project } = this.props; 
        let expand = isNil(project) ? 3 :  
                     isNil(project.expand) ? 3 : 
                     project.expand; 

        let idx = this.state.expanded ? this.props.todos.length : expand; 
        let showExpandButton = this.props.todos.length > expand; 
          
        return <div>          
                <TodosList        
                    dispatch={this.props.dispatch}     
                    selectedCategory={this.props.selectedCategory} 
                    selectedTodo={this.props.selectedTodo}
                    moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                    areas={this.props.areas}
                    groupTodos={this.props.groupTodos}
                    selectedAreaId={this.props.selectedAreaId}
                    selectedProjectId={this.props.selectedProjectId}
                    projects={this.props.projects}
                    selectedTag={this.props.selectedTag}  
                    rootRef={this.props.rootRef}
                    todos={this.props.todos.slice(0,idx)}  
                />  
                {   
                    !showExpandButton ? null :
                    <div style={{cursor: "pointer", height: "30px"}}>
                        {   
                            <div     
                                onClick={this.onToggle}
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
                                    `Show ${ this.props.todos.length-expand } more items` :
                                    `Hide` 
                                } 
                            </div>
                        }
                    </div>
                }
            </div>
    }
} 