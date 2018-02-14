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
    byNotDeleted, byNotCompleted, byTags, byHaveAttachedDate, byNotSomeday, byScheduled, convertTodoDates 
} from '../../utils/utils'; 
import { ProjectHeader } from './ProjectHeader';
import { ProjectBody } from './ProjectBody';
import { 
    adjust, remove, allPass, uniq, contains, 
    isEmpty, map, compose, not, isNil 
} from 'ramda';
import { getProgressStatus } from './ProjectLink';
import { filter } from '../MainContainer';
import { bySomeday, isProject, isTodo, isString } from '../../utils/isSomething';
import { assert } from '../../utils/assert';
import { daysRemaining } from '../../utils/daysRemaining';
import {debounce} from 'lodash'; 
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
    moveCompletedItemsToLogbook:string,
    todos:Todo[],
    groupTodos:boolean, 
    projects:Project[], 
    selectedTag:string, 
    dragged:string, 
    areas:Area[], 
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
        assert(isProject(load),`load is not a project. ${JSON.stringify(load)}. updateProject. ProjectComponent.`);  
        this.props.dispatch({type:"updateProject", load}); 
    }; 
 

    updateProjectName = debounce((value:string) : void => this.updateProject({name:value}),150);

     
    updateProjectDescription = debounce((value:string) : void => this.updateProject({description:value}),150);

    
    updateHeading = debounce(
        (headingId:string, newValue:string) => { 
            let {project} = this.props;
            let layout = project.layout;
            let idx = layout.findIndex((i:any) => isString(i) ? false : i._id===headingId);
         
            assert(idx!==-1, `Item does not exist. ${headingId} updateHeading. ${JSON.stringify(layout)}`); 

            let updatedLayout = adjust(() => ({...layout[idx] as Heading, title:newValue}), idx, layout);
            this.updateProject({layout:updatedLayout});
        },
        50
    ); 
    
     
    updateLayoutOrder = (layout:LayoutItem[]) => {
        let { project } = this.props; 
        let previousLayout = [...project.layout]; 
        let allLayoutItemsPresent : boolean = previousLayout.length===layout.length;
      
        if(allLayoutItemsPresent){ 

            this.updateProject({layout});

        }else{ 
            let fixed = previousLayout.filter(
                (item:LayoutItem) => -1===layout.findIndex(
                    (updated:LayoutItem) => isString(item) ? item===updated : item["_id"]===updated["_id"]
                ) 
            );   

            let newLayout : LayoutItem[] = [...fixed,...layout];
            
            assert(
               newLayout.length===project.layout.length, 
              `Updated layout has incorrect length.${JSON.stringify(newLayout)}.${JSON.stringify(project.layout)}.updateLayoutOrder.`  
            );    

            this.updateProject({layout:newLayout});
        }   
    };
     

    removeHeading = (heading_id:string) => {
        let {project} = this.props;
        let layout = project.layout;
        let idx = layout.findIndex((i:any) => isString(i) ? false : i._id===heading_id);
        assert(idx!==-1,`Item does not exist.${heading_id}.archiveHeading.${JSON.stringify(layout)}`); 
        this.updateProject({layout:remove(idx,1,layout)});
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
        let {selectedTag, project, showCompleted, showScheduled, todos} = this.props;

        if(isNil(project)){ return null } 

        let byNotFuture = (t:Todo) => !isNil(t.attachedDate) ? daysRemaining(t.attachedDate)<=0 : true;
        
        let projectFilters = [ 
            showCompleted ? null : byNotCompleted, 
            showScheduled ? null : byNotFuture, 
            showScheduled ? null : byNotSomeday 
        ].filter( f => f );


        let layout = project.layout
                            .map( (item:LayoutItem) => isString(item) ? todos.find(todo => todo._id===item) : item )
                            .filter( (item) => not(isNil(item)) );  
                 

        let toProjectHeader = filter(
            layout,
            (i:Todo) => isTodo(i) ? allPass(projectFilters)(i as (Project & Todo)) : false, 
            ""
        );
        
          
        let toProjectBody = filter(
            layout,
            (i:Todo) => isTodo(i) ? allPass([byTags(selectedTag),...projectFilters])(i as (Project & Todo)) : true, 
            ""
        );


        let progress = getProgressStatus(project, todos, false);


        return <div>      
                    <div className="unselectable">     
                        <ProjectHeader 
                            project={project}
                            rootRef={this.props.rootRef}
                            attachTagToProject={this.attachTagToProject}
                            progress={progress}   
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
                            groupTodos={this.props.groupTodos}
                            selectedCategory={this.props.selectedCategory}
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
                              onClick={()=>this.props.dispatch({type:"showScheduled",load:!this.props.showScheduled})}  
                              style={{color:"rgba(100,100,100,0.7)",fontSize:"13px"}}
                            > 
                              {`${this.props.showScheduled ? 'Hide' : 'Show'} later to-dos`}
                            </div>      
                        </div> 
                    }
                </div> 
    }
} 
  