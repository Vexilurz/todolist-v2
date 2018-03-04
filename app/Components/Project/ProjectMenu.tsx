import '../../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import { Component } from "react"; 
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Popover from 'material-ui/Popover';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import Duplicate from 'material-ui/svg-icons/content/content-copy';
import ShareIcon from 'material-ui/svg-icons/social/share';
import Show from 'material-ui/svg-icons/action/visibility';
import Hide from 'material-ui/svg-icons/action/visibility-off';
import Flag from 'material-ui/svg-icons/image/assistant-photo'; 
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import { Todo, Project, Heading, LayoutItem } from '../../database';
import { attachDispatchToProps, createHeading } from '../../utils/utils';
import { Store } from '../../app'; 
import { contains, not, isNil, isEmpty, remove } from 'ramda';
import { Category, filter } from '../MainContainer';
import { assert } from '../../utils/assert';
import { generateId } from '../../utils/generateId';
import { uppercase } from '../../utils/uppercase';
import { isString } from '../../utils/isSomething';
 


export let deleteProject = (dispatch:Function, project:Project, todos:Todo[]) => {
    
    assert(not(isNil(project)),`project with id selectedProjectId does not exist. ${project}. deleteProject`);
    
    let relatedTodosIds : string[] = project.layout.filter(isString) as string[];
    
    let selectedTodos : Todo[] = todos.filter((t:Todo) : boolean => contains(t._id)(relatedTodosIds));   
        
    dispatch({
        type:"updateTodos",   
        load:selectedTodos.map((t:Todo) : Todo => ({...t,reminder:null,deleted:new Date()}))
    });
    dispatch({type:"updateProject", load:{...project,deleted:new Date()}});
}



 

interface ProjectMenuPopoverProps extends Store{
    project:Project,
    anchorEl : HTMLElement, 
    rootRef:HTMLElement, 
    openDeadlineCalendar:Function,
    openTagsPopup:Function   
}    
 

interface ProjectMenuPopoverState{}

   
@connect((store,props) => ({...store,...props}), attachDispatchToProps) 
export class ProjectMenuPopover extends Component<ProjectMenuPopoverProps,ProjectMenuPopoverState>{

    constructor(props){ super(props) }  
  
    closeMenu = () => this.props.dispatch({type:"showProjectMenuPopover", load:false});
      
    updateProject = (selectedProject:Project, updatedProps) : void => { 
        let {dispatch} = this.props;
        dispatch({type:"updateProject", load:{ ...selectedProject, ...updatedProps }})
    }; 

  
    onRepeat = (e) => { 
        this.closeMenu(); 
    };


    onMove = (e) => { 
        this.closeMenu(); 
    };


    onShare = (e) => { 
        this.closeMenu(); 
    };


    onAddDeadline = (e) => { 
        this.closeMenu(); 
        this.props.openDeadlineCalendar();   
    };


    onDuplicate = (e) => {   
        let {project,todos} = this.props;
        let todosIDs = project.layout.filter(isString);
        let relatedTodos = filter(todos, (todo:Todo) => contains( todo._id, todosIDs ), "onDuplicate");
        let duplicatedTodos:Todo[] = [];
        let duplicatedLayout:LayoutItem[] = project.layout.map((item) => {
            if(isString(item)){
                let todo = relatedTodos.find( todo => todo._id===item );
                let duplicate : Todo = {...todo};
                duplicate._id = generateId();
                delete duplicate['_rev']; 
                duplicatedTodos.push(duplicate);
                return duplicate._id;
            }else{
                return item;
            }
        }); 

        let duplicate = {...project, _id:generateId(), layout:duplicatedLayout};
        delete duplicate["_rev"]; 

        this.props.dispatch({type:"addProject",load:duplicate});
        this.props.dispatch({type:"addTodos",load:duplicatedTodos});
        
        this.closeMenu(); 
    };


    onComplete = (e) => { 
        let {project} = this.props;
        this.updateProject(project, {completed:new Date()});
        this.props.dispatch({type:"selectedCategory",load:"inbox"});
        this.closeMenu() 
    };

  
    onDelete = (e) => {   
        let {project} = this.props;
        deleteProject(this.props.dispatch, project, this.props.todos); 
        this.props.dispatch({type:"selectedCategory", load:"inbox"});
        this.closeMenu();           
    };

 
    onAddHeading = (e) => {
        createHeading(e, this.props); 
        this.closeMenu(); 
    }; 

   
    onAddTags = (e) => {
        this.props.openTagsPopup();
        this.closeMenu(); 
    };


    onToggleCompleted = (e) => {
        this.props.dispatch({type:"showCompleted", load:!this.props.showCompleted});
        this.closeMenu(); 
    };

     
    onToggleScheduled = (e) => {
        this.props.dispatch({type:"showScheduled", load:!this.props.showScheduled});
        this.closeMenu(); 
    };


    onRestoreVisibility = (category:Category, project:Project) => {
        let {dispatch} = this.props;
        let hide = [...project.hide];
        let idx = hide.indexOf(category);
        if(idx===-1){ return }
        dispatch({
            type:"updateProject", 
            load:{ ...project, hide:remove(idx, 1, [...project.hide]) }
        }) 
    };

     
    render(){   
        let {project, showProjectMenuPopover, rootRef, anchorEl, showCompleted, showScheduled} = this.props;

        return not(showProjectMenuPopover) ? null :
        <Popover   
            className="nocolor"
            style={{marginTop:"20px",backgroundColor:"rgba(0,0,0,0)",background:"rgba(0,0,0,0)",borderRadius:"10px"}}   
            open={showProjectMenuPopover}
            scrollableContainer={rootRef}
            useLayerForClickAway={false} 
            anchorEl={anchorEl}  
            onRequestClose={this.closeMenu}  
            anchorOrigin={{vertical:"center",horizontal:"middle"}} 
            targetOrigin={{vertical:"top",horizontal:"middle"}} 
        >   
            <div  
                className="darkscroll"
                style={{  
                    backgroundColor:"rgb(39, 43, 53)",
                    paddingRight:"10px",
                    paddingLeft:"10px",
                    borderRadius:"10px",
                    paddingTop:"5px",
                    paddingBottom:"5px",
                    cursor:"pointer" 
                }} 
            >      
                    <div  
                        onClick={this.onComplete} 
                        className={"tagItem"} 
                        style={{display:"flex",height:"auto",alignItems:"center",padding:"5px"}}
                    >  
                        <CheckCircle style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Complete project   
                        </div>     
                    </div>
                    <div  
                        onClick={this.onAddDeadline} 
                        className={"tagItem"} 
                        style={{display:"flex",height:"auto",alignItems:"center",padding:"5px"}}
                    >  
                        <Flag style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Add deadline 
                        </div>     
                    </div>
                    <div  
                        onClick={this.onAddHeading} 
                        className={"tagItem"} 
                        style={{display:"flex",height:"auto",alignItems:"center",padding:"5px"}} 
                    >  
                        <ThreeDots style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Add heading 
                        </div>     
                    </div>
                    <div  
                        onClick={this.onMove} 
                        className={"tagItem"} 
                        style={{display:"flex",height:"auto",alignItems:"center",padding:"5px"}}
                    >   
                        <Arrow style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Move 
                        </div>     
                    </div>
                    <div style={{border:"1px solid rgba(200,200,200,0.1)",marginTop: "5px",marginBottom: "5px"}}></div>
                    {
                        <div  
                            onClick={this.onToggleCompleted} 
                            className={"tagItem"} 
                            style={{display:"flex", height:"auto", alignItems:"center", padding:"5px"}}
                        >  
                            {
                                not(showCompleted) ? 
                                <div style={{display:"flex",alignItems:"center"}}>
                                    <Show style={{color:"rgb(69, 95, 145)"}}/>
                                </div> : 
                                <div style={{display:"flex",alignItems:"center"}}>
                                    <Hide style={{color:"rgb(69, 95, 145)"}}/>
                                </div>
                            }
                            <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                                {`${showCompleted ? 'Hide' : 'Show'} completed tasks`}
                            </div>     
                        </div>
                    }   
                    {
                        isNil(project.hide) ? null :
                        isEmpty(project.hide) ? null :
                        project.hide.map((category:Category) => 
                            <div   
                                key={category}
                                onClick={() => this.onRestoreVisibility(category,project)}  
                                className={"tagItem"} 
                                style={{display:"flex",height:"auto",alignItems:"center",padding:"5px"}} 
                            >   
                                <div style={{display:"flex",alignItems:"center"}}>
                                    <Show style={{color:"rgb(69, 95, 145)"}}/>
                                </div>
                                <div style={{color:"gainsboro",marginLeft:"5px",marginRight:"5px"}}>
                                    Show in {uppercase(category)} 
                                </div>       
                            </div>
                        )
                    }
                    { 
                        <div  
                            onClick={this.onToggleScheduled} 
                            className={"tagItem"} 
                            style={{display:"flex",height:"auto",alignItems:"center",padding:"5px"}}
                        >  
                            { 
                                not(showScheduled) ? 
                                <div style={{display:"flex",alignItems:"center"}}>
                                    <Show style={{color:"rgb(69, 95, 145)"}}/>
                                </div> 
                                : 
                                <div style={{display:"flex",alignItems:"center"}}>
                                    <Hide style={{color:"rgb(69, 95, 145)"}}/>
                                </div>
                            } 
                            <div style={{color:"gainsboro",marginLeft:"5px",marginRight:"5px"}}>
                               {`${showScheduled ? 'Hide' : 'Show'} later tasks`}
                            </div>     
                        </div>
                    }   
                    <div style={{border:"1px solid rgba(200,200,200,0.1)",marginTop:"5px",marginBottom:"5px"}}></div>
                    <div  
                        onClick={this.onDuplicate} 
                        className={"tagItem"} 
                        style={{display:"flex", height:"auto", alignItems:"center", padding:"5px"}}
                    >  
                        <Duplicate style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                             Duplicate project 
                        </div>     
                    </div>
                    <div   
                        onClick={this.onDelete} 
                        className={"tagItem"} 
                        style={{ display:"flex", height:"auto", alignItems:"center", padding:"5px"}}
                    >  
                        <TrashIcon style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Delete project  
                        </div>     
                    </div>

                    <div  
                        onClick={this.onShare} 
                        className={"tagItem"} 
                        style={{display:"flex", height:"auto", alignItems:"center", padding:"5px"}}
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

