import '../../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Provider } from "react-redux";
import { Transition } from 'react-transition-group';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Popover from 'material-ui/Popover';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Repeat from 'material-ui/svg-icons/av/repeat';
import Inbox from 'material-ui/svg-icons/content/inbox';
import Duplicate from 'material-ui/svg-icons/content/content-copy';
import ShareIcon from 'material-ui/svg-icons/social/share';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import { TextField } from 'material-ui';
import AutosizeInput from 'react-input-autosize';
import { Todo, Project, Heading, LayoutItem, Area, getTodoById, todos_db, queryToTodos } from '../../database'; 
import { 
    uppercase, debounce, byNotDeleted, byNotCompleted, byTags, assert, 
    isProject, isTodo, byHaveAttachedDate, byNotSomeday, isString,  
    byScheduled, bySomeday, daysRemaining, convertTodoDates 
} from '../../utils'; 
import { ProjectHeader } from './ProjectHeader';
import { ProjectBody } from './ProjectBody';
import { adjust, remove, allPass, uniq, isNil, not, contains, isEmpty, map } from 'ramda';
import { isDev } from '../../app';
import { getProgressStatus } from './ProjectLink';
import { filter } from '../MainContainer';
let Promise = require('bluebird'); 


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
    todos:Todo[],
    projects:Project[], 
    selectedTag:string, 
    dragged:string, 
    areas:Area[], 
    searched:boolean, 
    selectedCategory:string, 
    selectedProjectId:string, 
    selectedAreaId:string, 
    selectedTodoId:string, 
    showScheduled:boolean,
    showCompleted:boolean,
    tags:string[],
    rootRef:HTMLElement,
    dispatch:Function
}
  

interface ProjectComponentState{}   
 
 
export class ProjectComponent extends Component<ProjectComponentProps,ProjectComponentState>{

    constructor(props){
        super(props); 
    }   


    updateProject = (updatedProps) : void => { 
        let type = "updateProject";  
        let project = this.props.projects.find((p:Project) => this.props.selectedProjectId===p._id);
        let load = { ...project, ...updatedProps }; 
        
        assert(
           isProject(load), 
          `load is not a project. ${JSON.stringify(load)}. updateProject. ProjectComponent.`
        );  
    
        this.props.dispatch({type, load}); 
    } 
 

    updateProjectName = debounce((value:string) : void => this.updateProject({name:value}), 50)

     
    updateProjectDescription = debounce((value:string) : void => this.updateProject({description:value}), 50)

    
    updateHeading = debounce(
        (heading_id:string, newValue:string) => { 
            let project = this.props.projects.find((p:Project) => this.props.selectedProjectId===p._id);
            let layout = project.layout;
            let idx = layout.findIndex( (i:LayoutItem) => typeof i === "string" ? false : i._id===heading_id );
         
            assert(
                idx!==-1, 
                `Item does not exist.  
                ${heading_id}.
                updateHeading. 
                ${JSON.stringify(layout)}`
            ) 

            let heading : Heading = {...layout[idx] as Heading};
            heading.title=newValue;
            let updatedLayout = adjust(() => heading, idx, layout);
            this.updateProject({layout:updatedLayout});
        },
        50
    ) 
    
     
    updateLayoutOrder = (layout:LayoutItem[]) => {
        let { project } = this.props; 
        let previousLayout = [...project.layout]; 
        let allLayoutItemsPresent : boolean = previousLayout.length===layout.length;
      
        if(allLayoutItemsPresent){ 

            this.updateProject({layout});
        }else{ 

            let fixed = previousLayout.filter(
                (item:LayoutItem) => -1===layout.findIndex((updated:LayoutItem) => 
                    typeof item==="string" ? 
                    item===updated : 
                    item["_id"]===updated["_id"]
                ) 
            );   

            let newLayout : LayoutItem[] = [...fixed,...layout];
            
            assert( 
                newLayout.length===project.layout.length, 
                `Updated layout has incorrect length.
                ${JSON.stringify(newLayout)}.
                ${JSON.stringify(project.layout)}.
                updateLayoutOrder.`  
            );    

            this.updateProject({layout:newLayout});
        }   
    }
     

    removeHeading = (heading_id:string) => {
        let project = this.props.projects.find((p:Project) => this.props.selectedProjectId===p._id);
        let layout = project.layout;
        let idx = layout.findIndex( (i:LayoutItem) => typeof i === "string" ? false : i._id===heading_id );

        assert(
            idx!==-1, 
            `Item does not exist. 
            ${heading_id}.
            archiveHeading.
            ${JSON.stringify(layout)}
            `
        ) 

        this.updateProject({layout:remove(idx,1,layout)});
    }

    
    updateProjectDeadline = (value:Date) => this.updateProject({deadline:value});
    

    attachTagToProject = (tag:string) => {
        let project = this.props.projects.find((p:Project) => this.props.selectedProjectId===p._id);
        let attachedTags = uniq([tag, ...project.attachedTags]);    
        this.updateProject({attachedTags}); 
    } 


    archiveHeading = (heading_id:string) => {
        this.removeHeading(heading_id); 
    } 
      

    moveHeading = (heading_id:string) => {}
    
      
    render(){   
        let { selectedTag, project, showCompleted, showScheduled, todos } = this.props;

        if(isNil(project)){ return null } 

        let byNotFuture = (t:Todo) => !isNil(t.attachedDate) ? daysRemaining(t.attachedDate)<=0 : true;
        let projectFilters = [ 
            showCompleted ? null : byNotCompleted, 
            showScheduled ? null : byNotFuture, 
            showScheduled ? null : byNotSomeday 
        ].filter( f => f );

        let layout = project.layout
                     .map( 
                       (item:LayoutItem) => isString(item) ? 
                                            todos.find(todo => todo._id===item) : 
                                            item 
                     )
                     .filter( v => v ) as (Todo | Heading)[] 

        let toProjectHeader = layout.filter( 
            (i:Todo) => isTodo(i) ? 
                        allPass(projectFilters)(i) : 
                        false 
        ) as Todo[];
         
        let toProjectBody = layout.filter( 
            (i:Todo) => isTodo(i) ? 
                        allPass([
                            byTags(selectedTag),
                            ...projectFilters
                        ])(i) : 
                        true 
        );
      
        let progress = getProgressStatus(project, todos);

        return <div>      
                    <div className="unselectable">     
                        <ProjectHeader 
                            rootRef={this.props.rootRef}
                            name={project.name} 
                            attachTagToProject={this.attachTagToProject}
                            tags={this.props.tags} 
                            progress={progress}   
                            description={project.description}
                            created={project.created as any}   
                            deadline={project.deadline as any} 
                            completed={project.completed as any} 
                            selectedTag={this.props.selectedTag}    
                            updateProjectDeadline={this.updateProjectDeadline}
                            updateProjectName={this.updateProjectName}
                            updateProjectDescription={this.updateProjectDescription} 
                            todos={toProjectHeader} 
                            dispatch={this.props.dispatch}   
                        />           
                    </div>   
                    <div>   
                        <ProjectBody    
                            items={toProjectBody}
                            dragged={this.props.dragged}
                            updateLayoutOrder={this.updateLayoutOrder}
                            removeHeading={this.removeHeading}
                            updateHeading={this.updateHeading}
                            archiveHeading={this.archiveHeading}
                            moveHeading={this.moveHeading}   
                            selectedTag={this.props.selectedTag}    
                            areas={this.props.areas}      
                            selectedProjectId={this.props.selectedProjectId}
                            selectedAreaId={this.props.selectedAreaId}  
                            projects={this.props.projects}
                            selectedTodoId={this.props.selectedTodoId} 
                            searched={this.props.searched}
                            todos={toProjectBody as Todo[]}  
                            tags={this.props.tags}
                            rootRef={this.props.rootRef}
                            dispatch={this.props.dispatch} 
                        />  
                    </div>   
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
                                onClick={() => this.props.dispatch({ 
                                    type:"showScheduled", 
                                    load:!this.props.showScheduled
                                })}  
                                style={{
                                    color:"rgba(100,100,100,0.7)",
                                    fontSize:"13px" 
                                }}
                            > 
                                {`${this.props.showScheduled ? 'Hide' : 'Show'} later to-dos`}
                            </div>      
                        </div> 
                    }
                </div> 
    }
} 
  