import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { byNotCompleted, byNotDeleted, getTagsFromItems, byTags } from "../../utils/utils";  
import { Todo, Project, Area, Category } from '../../types';
import { TodosList } from '../TodosList';
import { ContainerHeader } from '../ContainerHeader';
import { FadeBackgroundIcon } from '../FadeBackgroundIcon';
import { isEmpty, isNil, contains, intersection, flatten, all, compose, allPass, identity, ifElse } from 'ramda';
import { filter } from 'lodash';
import { TodoCreationForm } from '../TodoInput/TodoCreation';
import { generateId } from '../../utils/generateId';
import { generateEmptyTodo } from '../../utils/generateEmptyTodo';
import { GroupsByProjectArea } from '../GroupsByProjectArea';
import { isDev } from '../../utils/isDev';
import { isNotArray, isString } from '../../utils/isSomething';
import { byHidden } from '../../utils/byHidden';
import { projectsToHiddenTodosIDs } from '../../utils/projectsToHiddenTodosIDs';


interface NextProps{ 
    dispatch:Function, 
    groupTodos:boolean,
    selectedTodo:Todo,
    scrolledTodo:Todo,
    selectedProjectId:string, 
    moveCompletedItemsToLogbook:string, 
    selectedAreaId:string,
    selectedCategory:Category, 
    selectedTags:string[],
    rootRef:HTMLElement,
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
    indicators:{[key:string]:{active:number,completed:number,deleted:number};},
    areas:Area[], 
    projects:Project[], 
    todos:Todo[]
} 


interface NextState{}; 


type Item = Area | Project | Todo;

 
export class Next extends Component<NextProps, NextState>{

    constructor(props){ super(props); }

    render(){
        let hiddenTodosIds : string[] = projectsToHiddenTodosIDs(this.props.selectedCategory)(this.props.projects);
        let visibleTodos : Todo[] = filter(this.props.todos, (todo:Todo) => !contains(todo._id)(hiddenTodosIds));

        let selectedTodos = filter(
            visibleTodos,//this.props.groupTodos ? visibleTodos : this.props.todos, 
            byTags(this.props.selectedTags)
        );

        let tags : string[] = getTagsFromItems(visibleTodos
            //this.props.groupTodos ? visibleTodos : this.props.todos
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
                selectedTags={this.props.selectedTags}
                showTags={true} 
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
            <div> 
                { 
                    this.props.groupTodos ?
                    <GroupsByProjectArea
                        dispatch={this.props.dispatch} 
                        scrolledTodo={this.props.scrolledTodo}
                        filters={this.props.filters}
                        selectedAreaId={this.props.selectedAreaId}
                        selectedProjectId={this.props.selectedProjectId}
                        groupTodos={this.props.groupTodos}
                        indicators={this.props.indicators}
                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                        selectedCategory={this.props.selectedCategory}  
                        selectedTags={this.props.selectedTags}  
                        rootRef={this.props.rootRef} 
                        areas={this.props.areas}
                        projectsFilters={projectsFilters}
                        areasFilters={areasFilters}
                        projects={this.props.projects} 
                        todos={selectedTodos} 
                    />
                    :
                    <TodosList            
                        dispatch={this.props.dispatch}     
                        filters={this.props.filters}
                        scrolledTodo={this.props.scrolledTodo}
                        sortBy={(a:Todo,b:Todo) => a.priority-b.priority}
                        areas={this.props.areas}
                        groupTodos={this.props.groupTodos}
                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                        projects={this.props.projects}
                        selectedCategory={this.props.selectedCategory} 
                        selectedAreaId={this.props.selectedAreaId}
                        selectedProjectId={this.props.selectedProjectId}
                        rootRef={this.props.rootRef}
                        todos={selectedTodos}  
                    />  
                } 
            </div> 
        </div> 
    }
}  
