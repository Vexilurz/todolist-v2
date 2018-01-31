import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { 
    attachDispatchToProps, uppercase, insideTargetArea, chooseIcon, byTags, 
    byNotCompleted, byNotDeleted, byCategory, getTagsFromItems, isString, attachEmptyTodo, generateEmptyTodo, isProject, assert, isArea, isTodo, isArrayOfStrings, isToday, groupObjects 
} from "../../utils";  
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { 
    queryToTodos, getTodos, updateTodo, Todo, removeTodo, addTodo, 
    Project, Area, LayoutItem, generateId 
} from '../../database';
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
import { getAreaLink } from '../Area/AreaLink';
import { FadeBackgroundIcon } from '../FadeBackgroundIcon';
import { uniq, allPass, isEmpty, isNil, not, any, contains } from 'ramda';
import { TodoInput } from '../TodoInput/TodoInput';
import { ProjectLink } from '../Project/ProjectLink';
import { Category } from '../MainContainer';


interface NextProps{
    dispatch:Function, 
    selectedTodoId:string,
    searched:boolean,  
    selectedProjectId:string, 
    selectedAreaId:string,
    selectedCategory:Category, 
    selectedTag:string,
    rootRef:HTMLElement,
    areas:Area[], 
    projects:Project[], 
    todos:Todo[],
    tags:string[]
}


interface NextState{}; 
 
type Item = Area | Project | Todo;

export interface Table{
    [key:string]:Item[],
    projects : Project[],
    areas : Area[],
    todos : Todo[],
    detached : Todo[] 
}
 
export class Next extends Component<NextProps, NextState>{
    projectsFilters : ((p:Project) => boolean)[];
    areasFilters : ((a:Area) => boolean)[];
 
    constructor(props){
        super(props);
        this.projectsFilters = [byNotCompleted, byNotDeleted]; 
        this.areasFilters = [byNotDeleted];
    }

    render(){

        let { projects, areas, todos, selectedTag, selectedCategory } = this.props;

        let table = groupObjects(  
            projects, areas, todos, 
            this.projectsFilters,
            this.areasFilters,
            [],
            selectedTag
        );
 
        let tags = getTagsFromItems(todos);
 
        let emptyTodo = generateEmptyTodo(generateId(), selectedCategory, 0);  

        return  <div style={{WebkitUserSelect:"none"}}>
                    <ContainerHeader 
                        selectedCategory={selectedCategory}  
                        dispatch={this.props.dispatch}  
                        tags={tags} 
                        selectedTag={this.props.selectedTag}
                        showTags={true} 
                    />   
                    <FadeBackgroundIcon    
                        container={this.props.rootRef} 
                        selectedCategory={selectedCategory}    
                        show={isEmpty(table.todos)}  
                    />    
                    <div style={{paddingTop:"20px", paddingBottom:"20px"}}>
                        <TodoInput   
                            id={emptyTodo._id}
                            key={"next-todo-creation-form"} 
                            dispatch={this.props.dispatch}  
                            selectedCategory={selectedCategory}  
                            projects={this.props.projects} 
                            selectedProjectId={this.props.selectedProjectId}
                            selectedAreaId={this.props.selectedAreaId}  
                            todos={this.props.todos}
                            selectedTodoId={this.props.selectedTodoId}
                            tags={this.props.tags} 
                            searched={this.props.searched}
                            rootRef={this.props.rootRef}  
                            todo={emptyTodo}
                            creation={true}
                        />  
                        {
                            isEmpty(table.detached) ? null :
                            <TodosList            
                                selectedTodoId={this.props.selectedTodoId} 
                                dispatch={this.props.dispatch}     
                                areas={this.props.areas}
                                projects={this.props.projects}
                                selectedCategory={this.props.selectedCategory} 
                                selectedAreaId={this.props.selectedAreaId}
                                selectedProjectId={this.props.selectedProjectId}
                                searched={this.props.searched}
                                selectedTag={this.props.selectedTag}  
                                rootRef={this.props.rootRef}
                                todos={table.detached}  
                                tags={this.props.tags}  
                            /> 
                        }
                    </div>  
                    <div style={{paddingTop:"10px", paddingBottom:"10px", WebkitUserSelect:"none"}}> 
                    {     
                        table.projects.map( 
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
                                        searched={this.props.searched}
                                        selectedAreaId={this.props.selectedAreaId}
                                        selectedProjectId={this.props.selectedProjectId}
                                        selectedTodoId={this.props.selectedTodoId} 
                                        rootRef={this.props.rootRef}
                                        todos={todos} 
                                        tags={this.props.tags}
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
                                            selectedAreaId={this.props.selectedAreaId}
                                            selectedProjectId={this.props.selectedProjectId}
                                            selectedTodoId={this.props.selectedTodoId} 
                                            todos={todos} 
                                            tags={this.props.tags} 
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
    searched:boolean, 
    selectedAreaId:string,
    selectedProjectId:string, 
    selectedTag:string, 
    selectedTodoId:string, 
    areas:Area[],
    projects:Project[], 
    rootRef:HTMLElement, 
    todos:Todo[], 
    tags:string[],
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
                    selectedCategory={"next"} 
                    areas={this.props.areas}
                    searched={this.props.searched} 
                    selectedAreaId={this.props.selectedAreaId}
                    selectedProjectId={this.props.selectedProjectId}
                    projects={this.props.projects}
                    selectedTodoId={this.props.selectedTodoId} 
                    selectedTag={this.props.selectedTag}  
                    rootRef={this.props.rootRef}
                    todos={this.props.todos.slice(0,idx)}  
                    tags={this.props.tags}  
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