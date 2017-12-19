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
import Button from 'material-ui-next/Button';
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
import { Todo, Project, Heading, LayoutItem } from '../../database'; 
import { uppercase, debounce, replace, remove } from '../../utils';
import { arrayMove } from '../../sortable-hoc/utils';
import { ProjectHeader } from './ProjectHeader';
import { ProjectBody } from './ProjectBody';



interface ProjectComponentProps{
    project:Project,
    todos:Todo[],
    tags:string[],
    rootRef:HTMLElement,
    dispatch:Function
}
  


interface ProjectComponentState{}  
 

 
export class ProjectComponent extends Component<ProjectComponentProps,ProjectComponentState>{


    constructor(props){

        super(props);

        this.state={}

    }  


    shouldComponentUpdate(nextProps){
        
        return true;  

    }
 
 
    updateProject = (selectedProject:Project, updatedProps) : void => { 

        let type = "updateProject";
  
        let load = { ...selectedProject, ...updatedProps };

        this.props.dispatch({ type, load });

    }


    updateProjectName = (value:string) : void => {

        this.updateProject(this.props.project, {name:value});

    }  


    updateProjectDescription = (value:string) : void => {

        this.updateProject(this.props.project, {description:value});
 
    }
    

  
    updateLayout = (layout:LayoutItem[]) => {

        this.updateProject(this.props.project, {layout});

    } 



    updateHeading = (heading_id:string, newValue:string) => {

        let layout = this.props.project.layout;
        let idx = layout.findIndex( (i:LayoutItem) => typeof i === "string" ? false : i._id===heading_id );

        if(idx===-1){

           throw new Error(`Item does not exist. ${heading_id} .updateHeading. ${layout}`) 

        }

        let heading : Heading = {...layout[idx] as Heading} ;

        heading.title=newValue;
 
        this.updateProject(this.props.project, {layout:replace(layout,heading,idx)});
 
    }



    archiveHeading = (heading_id:string) => {

        let layout = this.props.project.layout;
        let idx = layout.findIndex( (i:LayoutItem) => typeof i === "string" ? false : i._id===heading_id );

        if(idx===-1){
  
           throw new Error(`Item does not exist. ${heading_id} .archiveHeading. ${layout}`) 

        }

    }


    moveHeading = (heading_id:string) => {}


    removeHeading = (heading_id:string) => {

        let layout = this.props.project.layout;
        let idx = layout.findIndex( (i:LayoutItem) => typeof i === "string" ? false : i._id===heading_id );

        if(idx===-1){
  
           throw new Error(`Item does not exist. ${heading_id} .archiveHeading. ${layout}`) 

        }
 
        this.updateProject(this.props.project, {layout:remove(layout,idx)});

    }


    render(){
         return <div>
                    <div>    
                        <ProjectHeader
                            name={this.props.project.name}
                            description={this.props.project.description}
                            created={new Date(this.props.project.created)} 
                            deadline={new Date(this.props.project.deadline)}
                            completed={new Date(this.props.project.completed)}
                            updateProjectName={this.updateProjectName}
                            updateProjectDescription={this.updateProjectDescription} 
                            dispatch={this.props.dispatch} 
                        />       
                    </div> 

                    <div>
                        <ProjectBody 
                            layout={this.props.project.layout}
                            updateLayout={this.updateLayout}
                            updateHeading={this.updateHeading}
                            archiveHeading={this.archiveHeading}
                            moveHeading={this.moveHeading} 
                            removeHeading={this.removeHeading}
                            todos={this.props.todos}
                            tags={this.props.tags}
                            rootRef={this.props.rootRef}
                            dispatch={this.props.dispatch} 
                        />
                    </div>   
                </div>
    }

} 
