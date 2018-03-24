import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { byNotCompleted, byNotDeleted, getTagsFromItems } from "../../utils/utils";  
import { Todo, Project, Area, Category } from '../../types';
import { ContainerHeader } from '.././ContainerHeader';
import { TodosList } from '.././TodosList';
import { FadeBackgroundIcon } from '../FadeBackgroundIcon';
import { isEmpty } from 'ramda';
import { TodoCreationForm } from '../TodoInput/TodoCreation';
import { generateEmptyTodo } from '../../utils/generateEmptyTodo';
import { generateId } from '../../utils/generateId';
import { GroupsByProjectArea } from '../GroupsByProjectArea';
  

 
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
            dispatch, selectedProjectId, selectedAreaId, rootRef, moveCompletedItemsToLogbook
        } = this.props;

        let tags = getTagsFromItems(todos);
        let empty = generateEmptyTodo(generateId(),selectedCategory,0);   
          
        return <div id={`${selectedCategory}-list`} style={{WebkitUserSelect:"none"}}>
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
                    groupTodos ? 
                    <GroupsByProjectArea
                        dispatch={this.props.dispatch}   
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
                        projectsFilters={[byNotCompleted, byNotDeleted]}
                        areasFilters={[byNotDeleted]}
                        projects={this.props.projects}  
                        todos={this.props.todos}
                    />
                    :
                    <TodosList      
                        areas={this.props.areas}
                        selectedAreaId={this.props.selectedAreaId}
                        sortBy={(a:Todo,b:Todo) => a.priority-b.priority}
                        selectedProjectId={this.props.selectedProjectId}
                        scrolledTodo={this.props.scrolledTodo}
                        projects={this.props.projects}
                        groupTodos={this.props.groupTodos}
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
    }
}