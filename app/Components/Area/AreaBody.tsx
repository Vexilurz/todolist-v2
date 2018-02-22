
import '../../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Provider } from "react-redux";
import { Component } from "react";  
import { Todo, Project, Area } from '../../database';
import { byNotCompleted, byNotDeleted } from '../../utils/utils'; 
import { allPass, isNil, not, contains, isEmpty, flatten } from 'ramda';
import { Category, filter } from '../MainContainer';
import { isArrayOfProjects, isString } from '../../utils/isSomething';
import { GroupsByProjectArea } from '../GroupsByProjectArea';

 

interface AreaBodyProps{ 
    area:Area, 
    areas:Area[], 
    projects:Project[],
    selectedTodo:Todo, 
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
            rootRef, projects, todos, selectedTodo 
        } = this.props;

        let projectsFilters=[
            byNotCompleted, 
            byNotDeleted,
            (p) => contains(p._id)(area.attachedProjectsIds),
            (p) => isNil(p.hide) ? true : 
                   isEmpty(p.hide) ? true : 
                   not(contains(selectedCategory)(p.hide))
        ];

        let selectedProjects = filter(projects, allPass(projectsFilters), "");
        let ids = flatten([area.attachedTodosIds,selectedProjects.map((p) => p.layout.filter(isString))]); 
        let selectedTodos = filter(
            todos, 
            allPass([byNotDeleted, byNotCompleted, (todo:Todo) => contains(todo._id)(ids)]), 
            ""
        );

        return <div ref={(e) => {this.ref=e;}}> 
            <GroupsByProjectArea
                projectsFilters={projectsFilters}
                areasFilters={[byNotDeleted]}
                dispatch={dispatch} 
                selectedTodo={selectedTodo}
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
            />
        </div> 
    }
} 




  