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
import { uppercase, debounce, byNotDeleted, byNotCompleted, byTags, assert, isProject, isTodo, byHaveAttachedDate, byNotSomeday } from '../../utils';
import { arrayMove } from '../../sortable-hoc/utils';
import { ProjectHeader } from './ProjectHeader';
import { ProjectBody } from './ProjectBody';
import { adjust, remove, allPass, uniq, isNil, not } from 'ramda';
import { isDev } from '../../app';



interface ProjectComponentProps{ 
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


    getItems = (props:ProjectComponentProps) => {
        let project = props.projects.find((p:Project) => props.selectedProjectId===p._id);
        let items = this.selectItems( 
            project.layout,
            props.todos,
            props.showCompleted, 
            props.showScheduled
        );  

        let toProjectHeader = items.filter( isTodo ) as Todo[];
        let toProjectBody = items.filter((i:Todo) => isTodo(i) ? byTags(props.selectedTag)(i) : true);
        
        return {
            toProjectHeader,
            toProjectBody,
            project
        }
    }


    shouldComponentUpdate(nextProps:ProjectComponentProps,nextState:ProjectComponentState){
        if(
            nextProps.projects!==this.props.projects ||

            nextProps.selectedProjectId!==this.props.selectedProjectId ||

            nextProps.selectedTag !== this.props.selectedTag || 

            nextProps.todos!==this.props.todos ||

            nextProps.showScheduled!==this.props.showScheduled ||  
                                                           
            nextProps.showCompleted!==this.props.showCompleted 
        ){
            
            return true;

        }else{
            
            return false;
        }
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



    updateProjectName = debounce(
        (value:string) : void => {
            this.updateProject({name:value});
        },
        50
    )


     
    updateProjectDescription = debounce(
        (value:string) : void => {
            this.updateProject({description:value});
        },
        50
    )

    componentDidUpdate(){
        console.log("componentDidUpdate project")
    }

 
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
            console.log("update heading")
            this.updateProject({layout:updatedLayout});
        },
        50
    ) 
    
 
     
    updateLayoutOrder = (layout:LayoutItem[]) => {
        let project = this.props.projects.find((p:Project) => this.props.selectedProjectId===p._id);
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
            console.log("update layout order. project.")
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


    
    updateProjectDeadline = (value:Date) => {
        this.updateProject({deadline:value});
    }


    attachTagToProject = (tag:string) => {
        let project = this.props.projects.find((p:Project) => this.props.selectedProjectId===p._id);
        let attachedTags = uniq([tag, ...project.attachedTags]);    
        this.updateProject({attachedTags}); 
    } 


    archiveHeading = (heading_id:string) => {
        this.removeHeading(heading_id); 
    } 
      

    moveHeading = (heading_id:string) => {}
    

    selectItems = (
        layout:LayoutItem[], 
        todos:Todo[], 
        showCompleted:boolean, 
        showScheduled:boolean
    ) : (Todo | Heading)[] => { 

        let items = [];  
             
        let filters = [
            byNotDeleted, 
            showCompleted ? null : byNotCompleted, 
            showScheduled ? null : (t:Todo) => isNil(t.attachedDate),
            showScheduled ? null : byNotSomeday
        ].filter( f => f );  

        let filteredTodos:Todo[] = todos.filter(allPass(filters));
    
        for(let i=0; i<layout.length; i++){ 
            let item : LayoutItem = layout[i];  
            
            assert(not(isNil(item)), `Layout item is Nil ${JSON.stringify(layout)}`);
 
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

        let { 
            toProjectHeader,
            toProjectBody,  
            project
        } = this.getItems(this.props); 
         
        return  isNil(project) ? null :
                <div>   
                    <div>    
                        <ProjectHeader 
                            rootRef={this.props.rootRef}
                            name={project.name} 
                            attachTagToProject={this.attachTagToProject}
                            tags={this.props.tags}
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
                            showScheduled={this.props.showScheduled}
                            showCompleted={this.props.showCompleted}
                            areas={this.props.areas}      
                            selectedProjectId={this.props.selectedProjectId}
                            selectedAreaId={this.props.selectedAreaId}  
                            projects={this.props.projects}
                            selectedTodoId={this.props.selectedTodoId} 
                            searched={this.props.searched}
                            todos={this.props.todos}  
                            tags={this.props.tags}
                            rootRef={this.props.rootRef}
                            dispatch={this.props.dispatch} 
                        />  
                    </div>   

                    <div  
                        style={{
                            cursor:"default",
                            display:"flex", 
                            paddingTop:"20px",
                            height:"auto", 
                            width:"100%"
                        }}  
                    >  
                        <div 
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
                </div> 
    }
} 
 