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
import { Todo, Project, Heading, generateId, addProject, removeProject } from '../../database';
import { uppercase, debounce, attachDispatchToProps, insert, remove } from '../../utils';
import { arrayMove } from '../../sortable-hoc/utils';
import { Store } from '../../App';

 

interface ProjectMenuPopoverProps extends Store{
    anchorEl : HTMLElement 
}    
 


interface ProjectMenuPopoverState{}

  
@connect((store,props) => ({...store,...props}), attachDispatchToProps) 
export class ProjectMenuPopover extends Component<ProjectMenuPopoverProps,ProjectMenuPopoverState>{

    constructor(props){
        super(props); 
    }  


 
    //onWhen = (e) => { }
    
    //onAddTags = (e) => { }

    onRepeat = (e) => { 
        this.closeMenu() 
    }

    onAddDeadline = (e) => { 
        this.closeMenu() 
    }

    onMove = (e) => { 
        this.closeMenu() 
    }

    onShare = (e) => { 
        this.closeMenu()  
    }



    updateProject = (selectedProject:Project, updatedProps) : void => { 
        
        let type = "updateProject";
    
        let load = { ...selectedProject, ...updatedProps };

        this.props.dispatch({ type, load });

    }



    onComplete = (e) => {  

        let projectId : string = this.props.selectedProjectId;

        let idx = this.props.projects.findIndex( (p:Project) => p._id===projectId );

        if(idx===-1){

           throw new Error(`Project does not exist. ${projectId} ${JSON.stringify(this.props.projects)}`);

        }  

        let project : Project = { ...this.props.projects[idx] };

        this.updateProject(project, {completed:new Date()});

 
    }
   


    onDuplicate = (e) => {   

        let projectId : string = this.props.selectedProjectId;
        
        let idx = this.props.projects.findIndex( (p:Project) => p._id===projectId );

        if(idx===-1)
           throw new Error(`Project does not exist. ${projectId} ${JSON.stringify(this.props.projects)}`);
 
        let project : any = { ...this.props.projects[idx] };

        project  = {  ...project,  ...{_id:generateId()}  };
        
        delete project._rev;

        addProject((e) => console.log(e), project);
        
        let projects = insert(this.props.projects, project, idx);

        this.props.dispatch({type:"projects", load:projects});

    }



    onDelete = (e) => {   

        let projectId : string = this.props.selectedProjectId;
        
        let idx = this.props.projects.findIndex( (p:Project) => p._id===projectId );

        if(idx===-1)
           throw new Error(`Project does not exist. ${projectId} ${JSON.stringify(this.props.projects)}`);

         
        let projects = remove(this.props.projects, idx);
  
        removeProject(projectId); 

        this.props.dispatch({type:"projects", load:projects});   
 
    }


 
    closeMenu = () => this.props.dispatch({
        type:"showProjectMenuPopover",
        load:false
    })

        

    render(){  
          
        return <Popover 
            className="nocolor"
            style={{
                marginTop:"20px", 
                backgroundColor:"rgba(0,0,0,0)",
                background:"rgba(0,0,0,0)",
                borderRadius:"10px"
            }}   
            open={this.props.showProjectMenuPopover}
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
                 
                    {/*
                        <div  
                            onClick={this.onWhen} 
                            className={"tagItem"} style={{
                                display:"flex", 
                                height:"auto",
                                alignItems:"center",
                                padding:"5px"
                            }}
                        >  
                            <CalendarIco style={{color:"rgb(69, 95, 145)"}}/> 
                            <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                                When   
                            </div>     
                        </div>
                    */}
                    
                    {/*
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
                    */}
                    
 
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

