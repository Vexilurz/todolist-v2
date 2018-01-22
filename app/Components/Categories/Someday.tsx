import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { 
    attachDispatchToProps, uppercase, insideTargetArea, chooseIcon,
    byNotCompleted, byNotDeleted, getTagsFromItems, attachEmptyTodo, 
    generateEmptyTodo 
} from "../../utils";  
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none'; 
import { queryToTodos, getTodos, updateTodo, Todo, removeTodo, addTodo, Project, Area, generateId } from '../../database';
import Popover from 'material-ui/Popover';
import { Tags } from '../../Components/Tags';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Repeat from 'material-ui/svg-icons/av/repeat';
import { Store } from '../../app';
import Inbox from 'material-ui/svg-icons/content/inbox';
import Duplicate from 'material-ui/svg-icons/content/content-copy';
import ShareIcon from 'material-ui/svg-icons/social/share';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import { TextField } from 'material-ui'; 
import AutosizeInput from 'react-input-autosize';
import { ContainerHeader } from '.././ContainerHeader';
import { byTags, byCategory } from '../../utils';
import { TodosList } from '.././TodosList';
import { FadeBackgroundIcon } from '../FadeBackgroundIcon';
import { allPass, compose, isEmpty, uniq } from 'ramda';
import { TodoInput } from '../TodoInput/TodoInput';
import { NextProjectsList, groupObjects } from './Next';
import { Category } from '../MainContainer';

  

 
interface SomedayProps{
    dispatch:Function,
    selectedCategory:string, 
    selectedProjectId:string, 
    selectedAreaId:string, 
    selectedTodoId:string,
    selectedTag:string,
    searched:boolean, 
    rootRef:HTMLElement,
    todos:Todo[],
    areas:Area[],   
    projects:Project[], 
    tags:string[]
} 


interface SomedayState{}  
 

export class Someday extends Component<SomedayProps, SomedayState>{
    projectsFilters : ((p:Project) => boolean)[];
    areasFilters : ((a:Area) => boolean)[];
    todosFilters : ((t:Todo) => boolean)[];

    constructor(props){ 
        super(props);

        this.projectsFilters = [byNotCompleted, byNotDeleted]; 
        this.areasFilters = [byNotDeleted];

        this.todosFilters = [
            byCategory("someday"),
            byNotCompleted, 
            byNotDeleted 
        ];
    } 
 
    render(){
        let {projects, areas, todos, selectedTag} = this.props;

        let tags = compose(
            uniq,
            getTagsFromItems,
            (todos) => todos.filter(allPass(this.todosFilters))
        )(this.props.todos) as string[];  

        let table = groupObjects(  
            projects, areas, todos,
            this.projectsFilters,
            this.areasFilters,
            this.todosFilters,
            selectedTag
        );

        let showFadeBackgroundIcon = table.projects.length===0 && 
                                     table.areas.length===0 && 
                                     table.todos.length===0;
         
        let empty = generateEmptyTodo(generateId(),"someday",0);   
         
        return <div  style={{WebkitUserSelect:"none"}}>
             <ContainerHeader 
                selectedCategory={"someday"} 
                dispatch={this.props.dispatch} 
                tags={tags}
                showTags={false} 
                selectedTag={this.props.selectedTag}
            />   
           
            <FadeBackgroundIcon    
                container={this.props.rootRef}  
                selectedCategory={"someday"}  
                show={showFadeBackgroundIcon}
            />    
    
            <div>   
                <div   
                    id="todos" 
                    style={{
                        paddingTop:"20px", 
                        paddingBottom:"20px"
                    }}  
                >      
                    <TodoInput   
                        id={empty._id} 
                        key={"someday-todo-creation-form"} 
                        dispatch={this.props.dispatch}  
                        selectedCategory={"someday"}     
                        searched={this.props.searched}
                        selectedProjectId={this.props.selectedProjectId}
                        selectedAreaId={this.props.selectedAreaId} 
                        todos={this.props.todos} 
                        selectedTodoId={this.props.selectedTodoId}
                        tags={this.props.tags} 
                        projects={this.props.projects}  
                        rootRef={this.props.rootRef}  
                        todo={empty}
                        creation={true}
                    /> 
                    {
                        isEmpty(table.detached) ? null :
                        <TodosList 
                            filters={[]}      
                            searched={this.props.searched}
                            areas={this.props.areas}
                            selectedAreaId={this.props.selectedAreaId}
                            selectedProjectId={this.props.selectedProjectId}
                            projects={this.props.projects}
                            selectedTodoId={this.props.selectedTodoId} 
                            isEmpty={(empty:boolean) => {}} 
                            dispatch={this.props.dispatch}   
                            selectedCategory={"someday"}  
                            selectedTag={this.props.selectedTag}  
                            rootRef={this.props.rootRef}
                            todos={table.detached}  
                            tags={this.props.tags} 
                        />
                    } 
                </div>  

                <div>
                     <NextProjectsList 
                        dispatch={this.props.dispatch}
                        selectedTag={this.props.selectedTag}
                        searched={this.props.searched}
                        selectedTodoId={this.props.selectedTodoId} 
                        rootRef={this.props.rootRef}
                        selectedAreaId={this.props.selectedAreaId}
                        selectedProjectId={this.props.selectedProjectId}
                        selectedCategory={this.props.selectedCategory as Category}
                        todos={this.props.todos} 
                        areas={this.props.areas}
                        projects={this.props.projects} 
                        tags={this.props.tags}
                        table={table}
                    />
                </div> 
            </div> 
        </div>
    }

}