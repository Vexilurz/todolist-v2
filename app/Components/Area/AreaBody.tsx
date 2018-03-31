
import '../../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Provider } from "react-redux";
import { Component } from "react";  
import { Todo, Project, Area, Category } from '../../types';
import { byNotCompleted, byNotDeleted } from '../../utils/utils'; 
import { allPass, isNil, not, contains, isEmpty, flatten } from 'ramda';
import { filter } from 'lodash';
import { isArrayOfProjects, isString } from '../../utils/isSomething';
import { GroupsByProjectArea } from '../GroupsByProjectArea';
import { projectsToHiddenTodosIDs } from '../../utils/projectsToHiddenTodosIDs';
import { byHidden } from '../../utils/byHidden';

 

interface AreaBodyProps{ 
    area:Area, 
    areas:Area[], 
    projects:Project[],
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
    scrolledTodo:Todo, 
    moveCompletedItemsToLogbook:string, 
    selectedAreaId:string, 
    groupTodos:boolean, 
    selectedProjectId:string, 
    todos:Todo[],
    selectedCategory:Category, 
    selectedTag:string, 
    rootRef:HTMLElement,
    dispatch:Function
} 
 

interface AreaBodyState{} 

export class AreaBody extends Component<AreaBodyProps,AreaBodyState>{

    ref:HTMLElement; 

    constructor(props){
        super(props); 
    }
      
    render(){  
        let areasFilters = [byNotDeleted];

        let projectsFilters = [
            (project:Project) => !byHidden(this.props.selectedCategory)(project),
            byNotCompleted, 
            byNotDeleted,
            (p) => contains(p._id)(this.props.area.attachedProjectsIds)
        ];
        
        let selectedProjects = filter( this.props.projects, allPass(projectsFilters) );
        let selectedTodosIds = flatten( selectedProjects.map((p) => p.layout.filter(isString)) ); 
        let selectedTodos = filter(
            this.props.todos, 
            allPass([
                byNotDeleted, 
                byNotCompleted, 
                (todo:Todo) => contains(todo._id)(selectedTodosIds)
            ])
        ); 

        return <div ref={(e) => {this.ref=e;}}> 
            <GroupsByProjectArea
                projectsFilters={projectsFilters}
                areasFilters={areasFilters} 
                dispatch={this.props.dispatch} 
                indicators={this.props.indicators}
                scrolledTodo={this.props.scrolledTodo}
                selectedProjectId={this.props.selectedProjectId}
                groupTodos={this.props.groupTodos}
                moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                selectedAreaId={this.props.selectedAreaId}
                selectedCategory={this.props.selectedCategory}
                selectedTag={this.props.selectedTag}
                rootRef={this.props.rootRef}
                filters={this.props.filters}
                areas={[]}
                projects={this.props.projects} 
                todos={selectedTodos}
                hideDetached={true}
            />
        </div> 
    }
}; 




  