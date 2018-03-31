import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { byNotCompleted, byNotDeleted, getTagsFromItems, byTags } from "../../utils/utils";  
import { Todo, Project, Area, Category } from '../../types';
import { ContainerHeader } from '.././ContainerHeader';
import { TodosList } from '.././TodosList';
import { FadeBackgroundIcon } from '../FadeBackgroundIcon';
import { isEmpty, contains } from 'ramda';
import { TodoCreationForm } from '../TodoInput/TodoCreation';
import { generateEmptyTodo } from '../../utils/generateEmptyTodo';
import { generateId } from '../../utils/generateId';
import { GroupsByProjectArea } from '../GroupsByProjectArea';
import { projectsToHiddenTodosIDs } from '../../utils/projectsToHiddenTodosIDs';
import { filter } from 'lodash';
import { byHidden } from '../../utils/byHidden';
 
interface SomedayProps{
    dispatch:Function,
    selectedCategory:Category, 
    selectedTodo:Todo,
    scrolledTodo:Todo,
    moveCompletedItemsToLogbook:string, 
    selectedProjectId:string, 
    selectedAreaId:string, 
    selectedTag:string,
    indicators:{ 
        [key:string]:{
            active:number,
            completed:number,
            deleted:number
        }; 
    },
    filters:{
        inbox:((todo:Todo) => boolean)[],
        today:((todo:Todo) => boolean)[],
        hot:((todo:Todo) => boolean)[],
        next:((todo:Todo) => boolean)[],
        someday:((todo:Todo) => boolean)[],
        upcoming:((todo:Todo) => boolean)[],
        logbook:((todo:Todo) => boolean)[],
        trash:((todo:Todo) => boolean)[]
    },
    rootRef:HTMLElement, 
    todos:Todo[],
    groupTodos:boolean,
    areas:Area[],   
    projects:Project[]
}   
 

interface SomedayState{}  
 

export class Someday extends Component<SomedayProps, SomedayState>{

    constructor(props){ 
        super(props);
    } 
 
    render(){
        let hiddenTodosIds : string[] = projectsToHiddenTodosIDs(this.props.selectedCategory)(this.props.projects);
        let visibleTodos : Todo[] = filter(this.props.todos, (todo:Todo) => !contains(todo._id)(hiddenTodosIds));
        
        let selectedTodos = filter(
            this.props.groupTodos ? visibleTodos : this.props.todos, 
            byTags(this.props.selectedTag)
        );

        let tags : string[] = getTagsFromItems(
            this.props.groupTodos ? visibleTodos : this.props.todos
        );

        let empty = generateEmptyTodo(generateId(), this.props.selectedCategory, 0);   

        let areasFilters = [byNotDeleted];
        let projectsFilters = [
            (project:Project) => !byHidden(this.props.selectedCategory)(project),
            byNotCompleted,   
            byNotDeleted 
        ];
        
        return <div id={`${this.props.selectedCategory}-list`} style={{WebkitUserSelect:"none"}}>
            <ContainerHeader  
                selectedCategory={this.props.selectedCategory} 
                dispatch={this.props.dispatch} 
                tags={tags}
                showTags={false} 
                selectedTag={this.props.selectedTag}
            />   
            <FadeBackgroundIcon    
                container={this.props.rootRef}  
                selectedCategory={this.props.selectedCategory}  
                show={isEmpty(selectedTodos)}
            />  
            <div className={`no-print`}>
                <TodoCreationForm   
                    dispatch={this.props.dispatch}  
                    selectedTodo={this.props.selectedTodo}
                    selectedCategory={this.props.selectedCategory} 
                    selectedProjectId={this.props.selectedProjectId}
                    selectedAreaId={this.props.selectedAreaId} 
                    todos={this.props.todos} 
                    projects={this.props.projects} 
                    rootRef={this.props.rootRef} 
                    todo={empty as any} 
                />  
            </div>    
            <div id="todos">      
                {
                    this.props.groupTodos ? 
                    <GroupsByProjectArea
                        dispatch={this.props.dispatch}   
                        filters={this.props.filters}
                        selectedProjectId={this.props.selectedProjectId}
                        indicators={this.props.indicators}
                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                        selectedAreaId={this.props.selectedAreaId}
                        scrolledTodo={this.props.scrolledTodo}
                        groupTodos={this.props.groupTodos}
                        selectedCategory={this.props.selectedCategory}
                        selectedTag={this.props.selectedTag}
                        rootRef={this.props.rootRef}
                        areas={this.props.areas}
                        projectsFilters={projectsFilters}
                        areasFilters={areasFilters}
                        projects={this.props.projects}  
                        todos={selectedTodos}
                    />
                    :
                    <TodosList      
                        areas={this.props.areas}
                        filters={this.props.filters}
                        selectedAreaId={this.props.selectedAreaId}
                        sortBy={(a:Todo,b:Todo) => a.priority-b.priority}
                        selectedProjectId={this.props.selectedProjectId}
                        scrolledTodo={this.props.scrolledTodo}
                        projects={this.props.projects}
                        groupTodos={this.props.groupTodos}
                        dispatch={this.props.dispatch}   
                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                        selectedCategory={this.props.selectedCategory}    
                        rootRef={this.props.rootRef}
                        todos={selectedTodos}  
                    />
                }
            </div> 
        </div>
    }
}