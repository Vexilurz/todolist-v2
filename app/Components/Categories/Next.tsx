import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { 
    attachDispatchToProps, byTags, 
    byNotCompleted, byNotDeleted, byCategory, getTagsFromItems, 
    attachEmptyTodo, isToday, groupObjects 
} from "../../utils/utils";  
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { 
    queryToTodos, getTodos, updateTodo, Todo, removeTodo, addTodo, 
    Project, Area, LayoutItem
} from '../../database';
import Popover from 'material-ui/Popover';
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
import { TodosList } from '../TodosList';
import { ContainerHeader } from '../ContainerHeader';
import { Tags } from '../Tags';
import { FadeBackgroundIcon } from '../FadeBackgroundIcon';
import { uniq, allPass, isEmpty, isNil, not, any, contains, intersection, flatten } from 'ramda';
import { TodoInput } from '../TodoInput/TodoInput';
import { ProjectLink } from '../Project/ProjectLink';
import { Category, filter } from '../MainContainer';
import { AreaLink } from '../Area/AreaLink';
import { TodoCreationForm } from '../TodoInput/TodoCreation';
import { generateId } from '../../utils/generateId';
import { generateEmptyTodo } from '../../utils/generateEmptyTodo';
import { GroupsByProjectArea } from '../GroupsByProjectArea';
import { isDev } from '../../utils/isDev';
import { isNotArray, isString } from '../../utils/isSomething';
import { assert } from '../../utils/assert';


interface NextProps{
    dispatch:Function, 
    groupTodos:boolean,
    selectedTodo:Todo,
    selectedProjectId:string, 
    moveCompletedItemsToLogbook:string, 
    selectedAreaId:string,
    selectedCategory:Category, 
    selectedTag:string,
    rootRef:HTMLElement,
    areas:Area[], 
    projects:Project[], 
    todos:Todo[]
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
        let {    
            dispatch, 
            selectedProjectId, 
            selectedAreaId,
            selectedCategory, 
            selectedTag,
            rootRef,
            areas, 
            projects, 
            moveCompletedItemsToLogbook,
            todos,
            groupTodos
        } = this.props;

        let tags = getTagsFromItems(todos);
 
        let empty = generateEmptyTodo(generateId(), selectedCategory, 0);  


        if(isDev()){
            let hiddenProjects = filter(
                projects, 
                (p:Project) => isNotArray(p.hide) ? false : contains(selectedCategory)(p.hide),
                ""
            );

            let ids : string[] = flatten(hiddenProjects.map((p:Project) => filter(p.layout,isString,"")));
            let hiddenTodos = filter(todos, (todo:Todo) => contains(todo._id)(ids), "");
            let tagsFromTodos : string[] = flatten(hiddenTodos.map((todo:Todo) => todo.attachedTags));

            assert(
                isEmpty(intersection(tags,tagsFromTodos)),
                `tags from hidden Todos still displayed in ${selectedCategory}.`
            ); 
        }


        return  <div id={`${selectedCategory}-list`} style={{WebkitUserSelect:"none"}}>
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
                        show={isEmpty(todos)}  
                    />    
                    <div className={`no-print`}> 
                        <TodoCreationForm  
                            dispatch={this.props.dispatch}  
                            selectedCategory={this.props.selectedCategory} 
                            selectedProjectId={this.props.selectedProjectId}
                            selectedAreaId={this.props.selectedAreaId} 
                            todos={this.props.todos} 
                            projects={this.props.projects}
                            rootRef={this.props.rootRef} 
                            todo={empty as any}  
                        /> 
                    </div> 
                    <div>
                            {
                                groupTodos ? 
                                <GroupsByProjectArea
                                    dispatch={this.props.dispatch} 
                                    selectedTodo={this.props.selectedTodo}
                                    selectedAreaId={this.props.selectedAreaId}
                                    selectedProjectId={this.props.selectedProjectId}
                                    groupTodos={this.props.groupTodos}
                                    moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                                    selectedCategory={this.props.selectedCategory}  
                                    selectedTag={this.props.selectedTag}  
                                    rootRef={this.props.rootRef}
                                    areas={this.props.areas}
                                    projectsFilters={[byNotCompleted, byNotDeleted]}
                                    areasFilters={[byNotDeleted]}
                                    projects={this.props.projects} 
                                    todos={todos} 
                                />
                                :
                                <TodosList            
                                    dispatch={this.props.dispatch}     
                                    selectedTodo={this.props.selectedTodo}
                                    sortBy={(a:Todo,b:Todo) => a.priority-b.priority}
                                    areas={this.props.areas}
                                    groupTodos={this.props.groupTodos}
                                    moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                                    projects={this.props.projects}
                                    selectedCategory={this.props.selectedCategory} 
                                    selectedAreaId={this.props.selectedAreaId}
                                    selectedProjectId={this.props.selectedProjectId}
                                    selectedTag={this.props.selectedTag}  
                                    rootRef={this.props.rootRef}
                                    todos={todos}  
                                />  
                            } 
                    </div> 
                </div> 
    }
}  
