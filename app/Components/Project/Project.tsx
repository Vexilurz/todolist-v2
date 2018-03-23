import '../../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { Todo, Project, Heading, LayoutItem, Area } from '../../database'; 
import { debounce } from 'lodash';
import { byNotCompleted, byTags, byNotSomeday, byScheduled, removeHeading, isNotNil } from '../../utils/utils'; 
import { ProjectHeader } from './ProjectHeader';
import { ProjectBody } from './ProjectBody';
import { adjust, allPass, uniq, isEmpty, not, isNil } from 'ramda';
import { filter } from '../MainContainer';
import { bySomeday, isProject, isTodo, isString } from '../../utils/isSomething';
import { assert } from '../../utils/assert';
import { daysRemaining } from '../../utils/daysRemaining';


let haveScheduledTodos = (todos:Todo[]) : boolean => {
    let filtered : Todo[] = filter(
        todos, 
        (todo:Todo) => byScheduled(todo) || bySomeday(todo), 
        "haveScheduledTodos"
    );
    return not(isEmpty(filtered));  
} 


interface ProjectComponentProps{ 
    project:Project,  
    moveCompletedItemsToLogbook:string,
    indicator:{
        active:number,
        completed:number,
        deleted:number
    },
    todos:Todo[],
    groupTodos:boolean, 
    selectedTodo:Todo,
    projects:Project[], 
    selectedTag:string, 
    dragged:string, 
    areas:Area[], 
    scrolledTodo:Todo,
    selectedCategory:string, 
    selectedProjectId:string, 
    selectedAreaId:string, 
    showScheduled:boolean,
    showCompleted:boolean,
    rootRef:HTMLElement,
    dispatch:Function
}
  

interface ProjectComponentState{}   
 
 
export class ProjectComponent extends Component<ProjectComponentProps,ProjectComponentState>{

    constructor(props){
        super(props); 
    }   


    updateProject = (updatedProps) : void => { 
        let load = { ...this.props.project, ...updatedProps }; 
        assert(isProject(load),`load is not a project. ${load}. updateProject. ProjectComponent.`);  
        this.props.dispatch({type:"updateProject", load}); 
    }; 
 

    updateProjectName = debounce((value:string) : void => this.updateProject({name:value}),150);

     
    updateProjectDescription = debounce((value:string) : void => this.updateProject({description:value}),150);

    
    updateHeading = debounce(
        (headingId:string, newValue:string) => { 
            let {project} = this.props;
            let layout = project.layout;
            let idx = layout.findIndex((i:any) => isString(i) ? false : i._id===headingId);
         
            assert(idx!==-1, `Item does not exist. ${headingId} updateHeading. ${layout}`); 

            let updatedLayout = adjust(() => ({...layout[idx] as Heading, title:newValue}), idx, layout);
            this.updateProject({layout:updatedLayout});
        },
        50
    ); 
    

     
    updateLayoutOrder = (layout:LayoutItem[]) => {
        let { project } = this.props;
        assert(layout.length===project.layout.length,`incorrect length.updateLayoutOrder.`);    
        this.updateProject({layout});
    };
     


    removeHeading = (heading_id:string) => {
        let {project} = this.props;
        this.updateProject(
            removeHeading(heading_id,project)
        );
    };


    
    updateProjectDeadline = (value:Date) => this.updateProject({deadline:value});
    


    attachTagToProject = (tag:string) => {
        let project = this.props.projects.find((p:Project) => this.props.selectedProjectId===p._id);
        let attachedTags = uniq([tag, ...project.attachedTags]);    
        this.updateProject({attachedTags}); 
    }; 



    archiveHeading = (heading_id:string) => { this.removeHeading(heading_id) }; 
      


    moveHeading = (heading_id:string) => {}
    

      
    render(){   
        let {selectedTag, project, showCompleted, showScheduled, todos, selectedCategory} = this.props;

        if(isNil(project)){ return null } 

        let byNotFuture = (t:Todo) => isNotNil(t.attachedDate) ? daysRemaining(t.attachedDate)<=0 : true;
        
        let projectFilters = [ 
            showCompleted ? null : byNotCompleted, 
            showScheduled ? null : byNotFuture, 
            showScheduled ? null : byNotSomeday 
        ].filter( f => f );

        let layout = project
                    .layout
                    .map((item:LayoutItem) => isString(item) ? todos.find(todo => todo._id===item) : item)
                    .filter(isNotNil);  
                 

        //this items will go to project header, dont filter them by tag, 
        //because available tags will be derived from them        
        let toProjectHeader = filter(
            layout,
            (i:Todo) => isTodo(i) ? allPass(projectFilters)(i as (Project & Todo)) : false
        );
        
        //filter by tag & by selected filters  
        let toProjectBody = filter(
            layout,
            (i:Todo) => isTodo(i) ? allPass([byTags(selectedTag),...projectFilters])(i as (Project & Todo)) : true
        ); 

  
        return <div id={`${selectedCategory}-list`}>      
                    <div className="unselectable">     
                        <ProjectHeader 
                            project={project} 
                            indicator={this.props.indicator}
                            rootRef={this.props.rootRef}
                            attachTagToProject={this.attachTagToProject}
                            selectedTag={this.props.selectedTag}    
                            updateProjectDeadline={this.updateProjectDeadline}
                            updateProjectName={this.updateProjectName}
                            updateProjectDescription={this.updateProjectDescription} 
                            todos={toProjectHeader} 
                            dispatch={this.props.dispatch}   
                        />           
                    </div>    
                    <ProjectBody    
                        items={toProjectBody}
                        project={project}
                        dragged={this.props.dragged}
                        groupTodos={this.props.groupTodos}
                        selectedCategory={this.props.selectedCategory}
                        scrolledTodo={this.props.scrolledTodo}
                        selectedTodo={this.props.selectedTodo}
                        showCompleted={this.props.showCompleted}
                        updateLayoutOrder={this.updateLayoutOrder}
                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                        removeHeading={this.removeHeading}
                        updateHeading={this.updateHeading}
                        archiveHeading={this.archiveHeading}
                        moveHeading={this.moveHeading}   
                        selectedTag={this.props.selectedTag}    
                        areas={this.props.areas}      
                        selectedProjectId={this.props.selectedProjectId}
                        selectedAreaId={this.props.selectedAreaId}  
                        projects={this.props.projects}
                        todos={toProjectBody as Todo[]}  
                        rootRef={this.props.rootRef}
                        dispatch={this.props.dispatch} 
                    />    
                    {  
                        not(haveScheduledTodos(toProjectBody as Todo[])) ? null:
                        <div 
                            className="noselection"
                            style={{   
                                cursor:"default", display:"flex", 
                                paddingTop:"20px", height:"auto", 
                                width:"100%"
                            }} 
                        >        
                            <div  
                              className="unselectable"
                              onClick={()=>this.props.dispatch({type:"showScheduled",load:!this.props.showScheduled})}  
                              style={{color:"rgba(100,100,100,0.7)",fontSize:"13px"}}
                            > 
                              {`${this.props.showScheduled ? 'Hide' : 'Show'} later tasks`}
                            </div>      
                        </div> 
                    }
                </div> 
    }
} 
  