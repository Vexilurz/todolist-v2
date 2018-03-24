
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
        let { 
            dispatch, selectedProjectId, groupTodos, moveCompletedItemsToLogbook, area,
            selectedAreaId, selectedCategory, selectedTag, 
            rootRef, projects, todos, scrolledTodo 
        } = this.props;

        
        let projectsFilters=[
            byNotCompleted, 
            byNotDeleted,
            (p) => contains(p._id)(area.attachedProjectsIds)
        ];


        let selectedProjects = filter(projects, allPass(projectsFilters));


        let ids = flatten( selectedProjects.map((p) => p.layout.filter(isString)) ); 


        let selectedTodos = filter(
            todos, 
            allPass([byNotDeleted, byNotCompleted, (todo:Todo) => contains(todo._id)(ids)])
        );


        return <div ref={(e) => {this.ref=e;}}> 
            <GroupsByProjectArea
                projectsFilters={projectsFilters}
                areasFilters={[byNotDeleted]} 
                dispatch={dispatch} 
                indicators={this.props.indicators}
                scrolledTodo={this.props.scrolledTodo}
                selectedProjectId={selectedProjectId}
                groupTodos={groupTodos}
                moveCompletedItemsToLogbook={moveCompletedItemsToLogbook}
                selectedAreaId={selectedAreaId}
                selectedCategory={selectedCategory}
                selectedTag={selectedTag}
                rootRef={rootRef}
                areas={[]}
                projects={projects} 
                todos={selectedTodos}
                hideDetached={true}
            />
        </div> 
    }
} 




  