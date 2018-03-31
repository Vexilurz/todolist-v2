import '../../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Component } from "react";  
import { Todo, Project, Heading, LayoutItem, Area } from '../../types'; 
import { debounce } from 'lodash';
import { byNotCompleted, byTags, byNotSomeday, byScheduled, removeHeading, isNotEmpty } from '../../utils/utils'; 
import { ProjectHeader } from './ProjectHeader';
import { ProjectBody } from './ProjectBody';
import { 
    adjust, allPass, uniq, isEmpty, not, isNil, map, prop, takeWhile, splitAt,
    compose, defaultTo, ifElse, all, contains, findIndex, equals, last 
} from 'ramda';
import { filter } from 'lodash';
import { bySomeday, isProject, isTodo, isString, isDate, isNotNil } from '../../utils/isSomething';
import { assert } from '../../utils/assert';
import { daysRemaining } from '../../utils/daysRemaining';
import { isDev } from '../../utils/isDev';



let byNotFuture = (t:Todo) => isNotNil(t.attachedDate) ? daysRemaining(t.attachedDate)<=0 : true;



let log = (append:string) => (load:any) : any => {
    console.log(append,load); 
    return load;
};



interface ProjectComponentProps{ 
    project:Project,  
    moveCompletedItemsToLogbook:string,
    indicator:{
        active:number,
        completed:number,
        deleted:number
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
        
        this.updateProject(removeHeading(heading_id,project));
    };



    removeHeadingWithTasks = (heading_id:string) => {
        let {project} = this.props;
        let projectFilters = this.getProjectFilters();
        let layout = this.getLayout();
        let toProjectBody = this.getToProjectBody(projectFilters,layout);
        let idx = toProjectBody.findIndex(item => item._id===heading_id);

        let todosToRemove : Todo[] = ifElse(
            equals(-1),
            () => [],
            (idx) => compose(
                takeWhile(isTodo),
                last,
                splitAt(idx+1),
            )(toProjectBody)
        )(idx);

        if(isNotEmpty(todosToRemove)){
            this.props.dispatch({
                type:"updateTodos",   
                load:todosToRemove.map(
                  (t:Todo) : Todo => ({...t,reminder:null,deleted:new Date()})
                )
            });
        }

        this.updateProject( removeHeading(heading_id,project) );
    };


    
    updateProjectDeadline = (value:Date) => this.updateProject({deadline:value});
    


    attachTagToProject = (tag:string) => {
        let project = this.props.projects.find((p:Project) => this.props.selectedProjectId===p._id);
        let attachedTags = uniq([tag, ...project.attachedTags]);    
        this.updateProject({attachedTags}); 
    }; 



    getProjectFilters = () => [ 
        this.props.showCompleted ? null : byNotCompleted, 
        this.props.showScheduled ? null : byNotFuture, 
        this.props.showScheduled ? null : byNotSomeday 
    ].filter( f => f );



    getLayout = () => 
    isNil(this.props.project) ? [] : 
    this.props
        .project
        .layout
        .map((item:LayoutItem) => isString(item) ? this.props.todos.find(todo => todo._id===item) : item)
        .filter(isNotNil);  


     
    noScheduledTodos = (layout:any[]) => compose(
        isEmpty,
        (todos:Todo[]) => filter(
            todos, 
            ifElse(
                isTodo,
                (todo:Todo) => byScheduled(todo) || bySomeday(todo),
                () => false
            )
        ),
        defaultTo([]) 
    )(layout);  



    getToProjectHeader = (projectFilters:Function[], layout:any[]) => filter(
        layout,
        (i:Todo) => isTodo(i) ? allPass(projectFilters)(i as (Project & Todo)) : false
    );



    getToProjectBody = (projectFilters:Function[], layout:any[]) => filter(
        layout,
        (i:Todo) => isTodo(i) ? 
                    allPass([byTags(this.props.selectedTag),...projectFilters])(i as (Project & Todo)) : 
                    true
    ); 



    render(){   
        let {selectedTag, project, showCompleted, showScheduled, todos, selectedCategory} = this.props;

        if(isNil(project)){ return null } 

        let projectFilters = this.getProjectFilters();
        let layout = this.getLayout();
        let noScheduledTodos : boolean = this.noScheduledTodos(layout);  
        

        
        if(isDev()){
            let todos = filter(layout, item => item.type==="todo");
            let completed = filter(todos, (item:Todo) => isDate(item.completedSet));
            let active = filter(todos, (item:Todo) => isNil(item.completedSet));
            
            assert(
                (
                 completed.length===this.props.indicator.completed &&
                 active.length===this.props.indicator.active
                ), 
                `Tasks count does not match indicator.
                ${completed.length} : ${this.props.indicator.completed};
                ${active.length} : ${this.props.indicator.active};
                `
            );
        }      
        
        
        
        //this items will go to project header, dont filter them by tag, 
        //because available tags will be derived from them        
        let toProjectHeader = this.getToProjectHeader(projectFilters,layout);
        
        

        //filter by tag & by selected filters  
        let toProjectBody = this.getToProjectBody(projectFilters,layout);



        if(isDev()){
            if(selectedTag!=="All"){ 
                assert( 
                    all((todo:Todo) => contains(selectedTag)(todo.attachedTags),toProjectBody.filter(isTodo)),
                    `missing tag. Project. ${selectedTag}`
                ) 
            }
        };
        

  
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
                filters={this.props.filters}
                selectedCategory={this.props.selectedCategory}
                scrolledTodo={this.props.scrolledTodo}
                selectedTodo={this.props.selectedTodo}
                showCompleted={this.props.showCompleted}
                updateLayoutOrder={this.updateLayoutOrder}
                moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                removeHeading={this.removeHeading}
                updateHeading={this.updateHeading}
                removeHeadingWithTasks={this.removeHeadingWithTasks}
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
                noScheduledTodos ? null:
                <div 
                    className="noselection"
                    style={{cursor:"default", display:"flex", paddingTop:"20px", height:"auto", width:"100%"}} 
                >        
                    <div  
                        className="unselectable"
                        onClick={()=>this.props.dispatch({type:"showScheduled",load:!this.props.showScheduled})}  
                        style={{color:"rgba(100,100,100,0.7)",fontSize:"13px",cursor:"pointer"}}
                    > 
                        {`${this.props.showScheduled ? 'Hide' : 'Show'} later tasks`}
                    </div>      
                </div> 
            }
        </div> 
    }
} 
  