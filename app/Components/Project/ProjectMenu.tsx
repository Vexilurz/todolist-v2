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
import Show from 'material-ui/svg-icons/action/visibility';
import Hide from 'material-ui/svg-icons/action/visibility-off';
import Flag from 'material-ui/svg-icons/image/assistant-photo'; 
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import { TextField } from 'material-ui'; 
import AutosizeInput from 'react-input-autosize';
import { Todo, Project, Heading, generateId, addProject, removeProject } from '../../database';
import { uppercase, debounce, attachDispatchToProps, assert } from '../../utils';
import { Store, isDev } from '../../app';
import { isString } from 'util'; 
import { contains, not, isNil, isEmpty } from 'ramda';
import { createHeading } from '../MainContainer';

 


export let deleteProject = (dispatch:Function, project:Project, todos:Todo[]) => {
    
    assert(
        not(isNil(project)), 
        `project with id selectedProjectId does not exist.
        ${JSON.stringify(project)}
        deleteProject`
    )
    
    let relatedTodosIds : string[] = project.layout.filter(isString);
    
    let selectedTodos : Todo[] = todos.filter(
        (t:Todo) : boolean => contains(t._id)(relatedTodosIds)
    );   
        
    dispatch({
        type:"updateTodos",   
        load:selectedTodos.map((t:Todo) => ({...t,deleted:new Date()}))
    })

    dispatch({type:"updateProject", load:{...project,deleted:new Date()}});
}



 

interface ProjectMenuPopoverProps extends Store{
    anchorEl : HTMLElement 
    rootRef:HTMLElement,
    openDeadlineCalendar:Function,
    openTagsPopup:Function   
}    
 
 

interface ProjectMenuPopoverState{}

   
@connect((store,props) => ({...store,...props}), attachDispatchToProps) 
export class ProjectMenuPopover extends Component<ProjectMenuPopoverProps,ProjectMenuPopoverState>{

    constructor(props){ 
        super(props); 
    }  
 

    closeMenu = () => {
        this.props.dispatch({type:"showProjectMenuPopover", load:false});
    }  

    updateProject = (selectedProject:Project, updatedProps) : void => { 
        
        let type = "updateProject";
    
        let load = { ...selectedProject, ...updatedProps };

        this.props.dispatch({type, load});
    }   
  
    onRepeat = (e) => { 
        this.closeMenu(); 
    }

    onMove = (e) => { 
        this.closeMenu(); 
    }

    onShare = (e) => { 
        this.closeMenu(); 
    } 

    onAddDeadline = (e) => { 
        this.closeMenu(); 
        this.props.openDeadlineCalendar();  
    }   

    onDuplicate = (e) => {   
        let projectId : string = this.props.selectedProjectId;
        
        let idx = this.props.projects.findIndex( (p:Project) => p._id===projectId );

        assert(
            idx!==-1, 
            `Project does not exist. ${projectId} ${JSON.stringify(this.props.projects)}`
        )

        let duplicate = {... this.props.projects[idx], _id:generateId()};
        delete duplicate["_rev"]; 
        
        this.props.dispatch({type:"addProject", load:duplicate}); 
        this.closeMenu(); 
    }


    getSelectedProject = () : Project => {
        let projectId : string = this.props.selectedProjectId;

        let idx = this.props.projects.findIndex((p:Project) => p._id===projectId);

        assert(
            idx!==-1, 
            `Project does not exist. ${projectId} ${JSON.stringify(this.props.projects)}`
        )

        return {...this.props.projects[idx]};
    }


    onComplete = (e) => { 

        let project : Project = this.getSelectedProject();
        this.updateProject(project, {completed:new Date()});
        this.props.dispatch({type:"selectedCategory",load:"inbox"});
        this.closeMenu() 
    } 
  
   
    onDelete = (e) => {   
        let project = this.getSelectedProject();
        deleteProject(this.props.dispatch, project, this.props.todos); 
        this.props.dispatch({type:"selectedCategory", load:"inbox"});
        this.closeMenu();           
    }   
 

    onAddHeading = (e) => {
        createHeading(e, this.props); 
        this.closeMenu(); 
    }  
   
    onAddTags = (e) => {
        this.props.openTagsPopup();
        this.closeMenu(); 
    }

    onToggleCompleted = (e) => {
        this.props.dispatch({type:"showCompleted", load:!this.props.showCompleted});
        this.closeMenu(); 
    }
     
    onToggleScheduled = (e) => {
        this.props.dispatch({type:"showScheduled", load:!this.props.showScheduled});
        this.closeMenu(); 
    }
     
 
    render(){  
        let project = this.getSelectedProject();

        return !this.props.showProjectMenuPopover ? null :
        <Popover 
            className="nocolor"
            style={{
                marginTop:"20px", 
                backgroundColor:"rgba(0,0,0,0)",
                background:"rgba(0,0,0,0)",
                borderRadius:"10px" 
            }}   
            open={this.props.showProjectMenuPopover}
            scrollableContainer={this.props.rootRef}
            useLayerForClickAway={false} 
            anchorEl={this.props.anchorEl}  
            onRequestClose={this.closeMenu}  
            anchorOrigin={{vertical: "center", horizontal: "middle"}} 
            targetOrigin={{vertical: "top", horizontal: "middle"}} 
        >   
            <div  className={"darkscroll"}
                  style={{  
                    backgroundColor: "rgb(39, 43, 53)",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    borderRadius: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    cursor:"pointer" 
                  }} 
            >      
                    <div  
                        onClick={this.onComplete} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <CheckCircle style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Complete project   
                        </div>     
                    </div>
                    {
                    /*
                    <div    
                        onClick={this.onAddTags}  
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <TriangleLabel style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Add tags  
                        </div>     
                    </div>
                    */
                    } 
                    <div  
                        onClick={this.onAddDeadline} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <Flag style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Add deadline 
                        </div>     
                    </div>

                    <div  
                        onClick={this.onAddHeading} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }} 
                    >  
                        <ThreeDots style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Add heading 
                        </div>     
                    </div>
 
                    <div  
                        onClick={this.onMove} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >   
                        <Arrow style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Move 
                        </div>     
                    </div>

                    {
                        <div  
                            onClick={this.onToggleCompleted} 
                            className={"tagItem"} style={{
                                display:"flex", 
                                height:"auto",
                                alignItems:"center",
                                padding:"5px"
                            }}
                        >  
                            {
                                !this.props.showCompleted ?
                                <Show style={{color:"rgb(69, 95, 145)"}}/> :
                                <Hide style={{color:"rgb(69, 95, 145)"}}/>
                            }
                            <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                                {`${this.props.showCompleted ? 'Hide' : 'Show'} completed to-dos`}
                            </div>     
                        </div>
                    }

                    {
                        isNil(project.hide) ? null :
                        isEmpty(project.hide) ? null :
                        <div  
                            onClick={() => this.props.dispatch({type:"updateProject", load:{...project,hide:[]}})}  
                            className={"tagItem"} 
                            style={{ 
                                display:"flex", 
                                height:"auto",
                                alignItems:"center",
                                padding:"5px"
                            }}
                        >  
                            <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                                 Show in related categories
                            </div>      
                        </div>
                    }

                    { 
                        <div  
                            onClick={this.onToggleScheduled} 
                            className={"tagItem"} style={{
                                display:"flex", 
                                height:"auto",
                                alignItems:"center",
                                padding:"5px"
                            }}
                        >  
                            { 
                                !this.props.showScheduled ? 
                                <Show style={{color:"rgb(69, 95, 145)"}}/> :
                                <Hide style={{color:"rgb(69, 95, 145)"}}/>
                            } 
                            <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                               {`${this.props.showScheduled ? 'Hide' : 'Show'} later to-dos`}
                            </div>     
                        </div>
                    }   


                    <div style={{
                        border:"1px solid rgba(200,200,200,0.1)",
                        marginTop: "5px",
                        marginBottom: "5px"
                    }}>
                    </div>

 
                    <div  
                        onClick={this.onRepeat} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <Repeat style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Repeat...  
                        </div>     
                    </div>

                    <div  
                        onClick={this.onDuplicate} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <Duplicate style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                             Duplicate project 
                        </div>     
                    </div>
                 

                    <div   
                        onClick={this.onDelete} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <TrashIcon style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Delete project  
                        </div>     
                    </div>

                    <div  
                        onClick={this.onShare} 
                        className={"tagItem"} style={{
                            display:"flex",  
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >      
                        <ShareIcon style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Share
                        </div>     
                    </div>
            </div> 
        </Popover> 
    }
}

