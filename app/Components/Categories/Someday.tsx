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
    generateEmptyTodo, 
    groupObjects
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
import { allPass, compose, isEmpty, uniq, isNil, contains } from 'ramda';
import { TodoInput } from '../TodoInput/TodoInput';
import { Category } from '../MainContainer';
import { ProjectLink } from '../Project/ProjectLink';
import { ExpandableTodosList, GroupsByProjectArea } from './Next';

  
 
interface SomedayProps{
    dispatch:Function,
    selectedCategory:Category, 
    moveCompletedItemsToLogbook:string, 
    selectedProjectId:string, 
    selectedAreaId:string, 
    selectedTag:string,
    rootRef:HTMLElement,
    todos:Todo[],
    groupTodos:boolean,
    areas:Area[],   
    projects:Project[]
}   


interface SomedayState{}  
 

export class Someday extends Component<SomedayProps, SomedayState>{
    projectsFilters : ((p:Project) => boolean)[];
    areasFilters : ((a:Area) => boolean)[];

    constructor(props){ 
        super(props);
        this.projectsFilters = [byNotCompleted, byNotDeleted]; 
        this.areasFilters = [byNotDeleted];
    } 
 
    render(){
        let {
          projects, areas, todos, selectedTag, selectedCategory, groupTodos,
          dispatch, selectedProjectId, selectedAreaId, rootRef, 
          moveCompletedItemsToLogbook
        } = this.props;
        let tags = getTagsFromItems(todos);
        let empty = generateEmptyTodo(generateId(),selectedCategory,0);   
         
        return <div style={{WebkitUserSelect:"none"}}>
            <ContainerHeader  
                selectedCategory={selectedCategory} 
                dispatch={this.props.dispatch} 
                tags={tags}
                showTags={false} 
                selectedTag={this.props.selectedTag}
            />   
            <FadeBackgroundIcon    
                container={this.props.rootRef}  
                selectedCategory={selectedCategory}  
                show={isEmpty(todos)}
            /> 
            <TodoInput   
                id={empty._id} 
                key={"someday-todo-creation-form"} 
                dispatch={this.props.dispatch}  
                selectedCategory={selectedCategory}    
                moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                selectedProjectId={this.props.selectedProjectId}
                selectedAreaId={this.props.selectedAreaId} 
                todos={this.props.todos} 
                projects={this.props.projects}  
                rootRef={this.props.rootRef}  
                todo={empty} 
                creation={true}
            />     
            <div id={`someday-list`} >    
                <div id="todos" style={{paddingTop:"20px", paddingBottom:"20px"}}>      
                    {
                        groupTodos ? 
                        <GroupsByProjectArea
                            {
                                ...{
                                    dispatch, 
                                    selectedProjectId, 
                                    moveCompletedItemsToLogbook,
                                    selectedAreaId,
                                    selectedCategory, 
                                    selectedTag,
                                    rootRef,
                                    areas, 
                                    projects, 
                                    todos
                                }
                            }
                        />
                        :
                        <TodosList      
                            areas={this.props.areas}
                            selectedAreaId={this.props.selectedAreaId}
                            selectedProjectId={this.props.selectedProjectId}
                            projects={this.props.projects}
                            dispatch={this.props.dispatch}   
                            moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                            selectedCategory={selectedCategory}  
                            selectedTag={this.props.selectedTag}  
                            rootRef={this.props.rootRef}
                            todos={todos}  
                        />
                    }
                </div> 
            </div>
        </div>
    }
}