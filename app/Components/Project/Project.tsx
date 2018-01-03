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
import { Todo, Project, Heading, LayoutItem, Area } from '../../database'; 
import { uppercase, debounce, byNotDeleted, byNotCompleted, byTags } from '../../utils';
import { arrayMove } from '../../sortable-hoc/utils';
import { ProjectHeader } from './ProjectHeader';
import { ProjectBody } from './ProjectBody';
import { adjust, remove, allPass, uniq } from 'ramda';



interface ProjectComponentProps{
    projects:Project[], 
    selectedTag:string, 
    areas:Area[], 
    searched:boolean, 
    selectedCategory:string, 
    selectedProjectId:string, 
    selectedTodoId:string, 
    todos:Todo[],
    tags:string[],
    rootRef:HTMLElement,
    dispatch:Function
}
  


interface ProjectComponentState{}  
 
 
 
export class ProjectComponent extends Component<ProjectComponentProps,ProjectComponentState>{

    constructor(props){
        super(props);
    }  
 
    shouldComponentUpdate(nextProps:ProjectComponentProps, nextState:ProjectComponentState){
        return true;
    }
  
    updateProject = (selectedProject:Project, updatedProps) : void => { 
        let type = "updateProject"; 
        let load = { ...selectedProject, ...updatedProps };
        this.props.dispatch({ type, load });
    } 

    updateProjectName = (selectedProject:Project) => debounce(
        (value:string) : void => {
            this.updateProject(selectedProject, {name:value});
        },
        50
    )
     
    updateProjectDescription = (selectedProject:Project) => debounce(
        (value:string) : void => {
            this.updateProject(selectedProject, {description:value});
        },
        50
    )
 
    updateHeading = (selectedProject:Project) => debounce(
        (heading_id:string, newValue:string) => { 
            let layout = selectedProject.layout;
            let idx = layout.findIndex( (i:LayoutItem) => typeof i === "string" ? false : i._id===heading_id );

            if(idx===-1){
                throw new Error(`
                        Item does not exist. 
                        ${heading_id}.
                        updateHeading. 
                        ${JSON.stringify(layout)}
                `);  
            } 
            
            let heading : Heading = {...layout[idx] as Heading} ;
            heading.title=newValue;
            let updatedLayout = adjust(() => heading, idx, layout);
            this.updateProject(selectedProject,{layout:updatedLayout});
        },
        50
    ) 
    
    updateLayout = (selectedProject:Project) => (layout:LayoutItem[]) => {
        this.updateProject(selectedProject, {layout});
    }  

    removeHeading = (selectedProject:Project) => (heading_id:string) => {
        let layout = selectedProject.layout;
        let idx = layout.findIndex( (i:LayoutItem) => typeof i === "string" ? false : i._id===heading_id );

        if(idx===-1){ 
           throw new Error(`
                Item does not exist. 
                ${heading_id}.
                archiveHeading.
                ${JSON.stringify(layout)}
           `)    
        }  
 
        this.updateProject(selectedProject, {layout:remove(idx,1,layout)});
    }
    
    updateProjectDeadline = (selectedProject:Project) => (value:Date) => {
        this.updateProject(selectedProject, {deadline:value});
    }

    attachTagToProject = (selectedProject:Project) => (tag:string) => {
        let attachedTags = uniq([tag, ...selectedProject.attachedTags]);    
        this.updateProject(selectedProject, {attachedTags}); 
    } 

    archiveHeading = (selectedProject:Project) => (heading_id:string) => {
        this.removeHeading(selectedProject)(heading_id); 
    }
        
    moveHeading = (heading_id:string) => {}



    selectItems = (layout:LayoutItem[], todos:Todo[]) : (Todo | Heading)[] => { 
        let items = [];
        let filters = [byNotDeleted, byNotCompleted];
        let filteredTodos:Todo[] = todos.filter(allPass(filters));
    
        for(let i=0; i<layout.length; i++){ 
            let item : LayoutItem = layout[i]; 
 
            if(item===undefined || item===null){
               throw new Error(`Layout item undefined ${layout}. selectItems.`);  
            };
 
            if(typeof item === "string"){
                let todo : Todo = filteredTodos.find( (t:Todo) => t._id===item );
                
                if(todo){
                   items.push(todo); 
                } 
            }else if(item.type==="heading"){
                items.push(item);
            }
        }
        return items; 
    }  
    
    
 
    render(){   
        let project = this.props.projects.find((p:Project) => this.props.selectedProjectId===p._id);
        let items = this.selectItems(project.layout,this.props.todos);

        let toProjectHeader = items.filter( (i) => i.type==="todo" ) as Todo[];
        let toProjectBody = items.filter((i) => i.type==="todo" ? byTags(this.props.selectedTag)(i as Todo) : true);
 
        return  !project ? null :
                <div>  
                    <div>    
                        <ProjectHeader 
                            rootRef={this.props.rootRef}
                            name={project.name} 
                            attachTagToProject={this.attachTagToProject(project)}
                            tags={this.props.tags}
                            description={project.description}
                            created={project.created as any}  
                            deadline={project.deadline as any} 
                            completed={project.completed as any} 
                            selectedTag={this.props.selectedTag}    
                            updateProjectDeadline={this.updateProjectDeadline(project)}
                            updateProjectName={this.updateProjectName(project)}
                            updateProjectDescription={this.updateProjectDescription(project)} 
                            todos={toProjectHeader}
                            dispatch={this.props.dispatch} 
                        />        
                    </div> 
  
                    <div>  
                        <ProjectBody    
                            items={toProjectBody}
                            updateLayout={this.updateLayout(project)}
                            removeHeading={this.removeHeading(project)}
                            updateHeading={this.updateHeading(project)}
                            archiveHeading={this.archiveHeading(project)}
                            moveHeading={this.moveHeading} 
                            areas={this.props.areas}   
                            projects={this.props.projects}
                            selectedTodoId={this.props.selectedTodoId} 
                            searched={this.props.searched}
                            todos={this.props.todos}  
                            tags={this.props.tags}
                            rootRef={this.props.rootRef}
                            dispatch={this.props.dispatch} 
                        />
                    </div>   
                </div> 
    }
} 
 