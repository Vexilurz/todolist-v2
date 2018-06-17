import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { Component } from "react";  
import { byTags } from "./../utils/utils";  
import { Todo, Project, Area, LayoutItem, Category } from './../types';
import { TodosList } from './TodosList';
import { allPass, isEmpty, isNil, not, contains, all, compose, defaultTo } from 'ramda';
import { ProjectLink } from './Project/ProjectLink';
import { filter } from 'lodash'; 
import { isString, isDate, isProject } from '../utils/isSomething';
import { groupProjectsByArea } from './Area/groupProjectsByArea';
import {  generateLayout } from './Area/generateLayout';
import { groupByProject } from './project/groupByProject';


interface GroupsByProjectAreaProps{
    dispatch:Function, 
    selectedProjectId:string, 
    groupTodos:boolean, 
    scrolledTodo:Todo, 
    moveCompletedItemsToLogbook:string,
    selectedAreaId:string,
    selectedCategory:Category, 
    selectedTags:string[],
    indicators : { 
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
    areas:Area[], 
    projects:Project[],
    projectsFilters: ((p:Project) => boolean)[],
    areasFilters: ((a:Area) => boolean)[],
    todos:Todo[],
    hideDetached?:boolean
}

interface GroupsByProjectAreaState{}
export class GroupsByProjectArea extends Component<GroupsByProjectAreaProps,GroupsByProjectAreaState>{

    constructor(props){
        super(props);
    }


    sortByLayoutOrder = (project:Project) => (a:Todo,b:Todo) : number => {
        let aIdx : number = project.layout.findIndex(
            (item:LayoutItem) => isString(item) ? item===a._id : false
        );

        let bIdx : number = project.layout.findIndex(
            (item:LayoutItem) => isString(item) ? item===b._id : false
        );

        if(aIdx!==-1 && bIdx!==-1){
            return aIdx - bIdx; 
        }else{
            return 0;
        }
    };
    


    render(){
        let { 
            projects, projectsFilters, areasFilters, hideDetached, areas, todos, selectedCategory 
        } = this.props;

        let selectedAreas = areas.filter(allPass(areasFilters));
        let selectedProjects = filter(this.props.projects, allPass(this.props.projectsFilters));
        let selectedTodos = filter(this.props.todos, byTags(this.props.selectedTags));
       

        //Projects sorted according to order in LeftPanel -> AreasList component
        let sortedProjects : Project[] = compose(
            (layout:any[]) => layout.filter(isProject),
            ({table,detached}) => generateLayout(selectedAreas,{table, detached}),
            () => groupProjectsByArea(selectedProjects,selectedAreas)
        )();


        //Filtered todos grouped by areas and projects
        let result : {[key: string]: Todo[];} = groupByProject(selectedProjects)(selectedTodos);
        //Filtered todos which doesnt belong to any area or project
        let detached = defaultTo([])(result.detached); 


        return <div> 
            {
                hideDetached || isEmpty(detached) ? null :
                <TodosList            
                    dispatch={this.props.dispatch}     
                    areas={this.props.areas}
                    filters={this.props.filters}
                    sortBy={(a:Todo,b:Todo) => a.priority-b.priority}
                    groupTodos={this.props.groupTodos}
                    scrolledTodo={this.props.scrolledTodo}
                    moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                    projects={this.props.projects}
                    selectedCategory={this.props.selectedCategory} 
                    selectedAreaId={this.props.selectedAreaId}
                    selectedProjectId={this.props.selectedProjectId}
                    rootRef={this.props.rootRef}
                    todos={detached}  
                /> 
            } 
            <div style={{paddingTop:"10px", paddingBottom:"10px", WebkitUserSelect:"none"}}> 
                {     
                    sortedProjects
                    .map( 
                        (project:Project, index:number) : JSX.Element => {
                            let category = this.props.selectedCategory;
                            let todos = defaultTo([])(result[project._id]) as Todo[];
                            let hide = isNil(project.hide) ? false : contains(category)(project.hide); 
                            let allCompleted = all((todo:Todo) => isDate(todo.completedWhen), todos);
                            let dontShow : boolean = isEmpty(todos) || hide || allCompleted;
        
                            return dontShow ? null : 
                            <div key={`project-link-${project._id}`}>  
                                <ProjectLink  
                                    project={project}
                                    showMenu={this.props.selectedCategory!=="today"} 
                                    indicator={defaultTo({completed:0, active:0})(this.props.indicators[project._id])} 
                                    dispatch={this.props.dispatch}
                                    selectedCategory={this.props.selectedCategory}
                                    underline={true}
                                /> 
                                <ExpandableTodosList
                                    dispatch={this.props.dispatch}    
                                    sortBy={this.sortByLayoutOrder(project)}
                                    filters={this.props.filters}
                                    selectedTags={this.props.selectedTags} 
                                    scrolledTodo={this.props.scrolledTodo}
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
                                    showAll={this.props.selectedCategory==="today"}
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
    sortBy:(a:Todo,b:Todo) => number,
    moveCompletedItemsToLogbook:string,
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
    scrolledTodo:Todo,
    selectedAreaId:string,
    selectedCategory:Category,
    groupTodos:boolean,
    selectedProjectId:string, 
    selectedTags:string[], 
    areas:Area[],
    projects:Project[], 
    rootRef:HTMLElement, 
    todos:Todo[], 
    project?:Project,
    showAll?:boolean   
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
        let { project, sortBy, todos, showAll } = this.props;

        let { expanded } = this.state;

        let expand = isNil(project) ? 3 :  
                     isNil(project.expand) ? 3 : 
                     project.expand; 

        let idx = expanded ? todos.length : expand; 
        let showExpandButton = todos.length > expand;
        let sortedSliced = showAll ? 
                           todos.sort(sortBy) : 
                           todos.sort(sortBy).slice(0,idx);
        
        return <div>          
                <TodosList  
                    todos={sortedSliced}
                    dispatch={this.props.dispatch}    
                    filters={this.props.filters}
                    scrolledTodo={this.props.scrolledTodo} 
                    sortBy={this.props.sortBy}
                    selectedCategory={this.props.selectedCategory} 
                    moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                    areas={this.props.areas}
                    groupTodos={this.props.groupTodos}
                    selectedAreaId={this.props.selectedAreaId}
                    selectedProjectId={this.props.selectedProjectId}
                    projects={this.props.projects}
                    rootRef={this.props.rootRef}
                    reorderLayout={true}
                />  
                {   
                    not(showExpandButton) ? null :
                    showAll ? null :
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
                                    not(expanded) ? 
                                    `Show ${ todos.length-expand } more tasks` :
                                    `Hide` 
                                } 
                            </div>
                        }
                    </div>
                }
            </div>
    }
} 