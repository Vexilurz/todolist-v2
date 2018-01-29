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
import { Todo, Project, Heading, LayoutItem, Area, getTodoById } from '../../database'; 
import { 
    uppercase, debounce, byNotDeleted, byNotCompleted, byTags, assert, 
    isProject, isTodo, byHaveAttachedDate, byNotSomeday, isString, 
    byScheduled, bySomeday, daysRemaining 
} from '../../utils'; 
import { ProjectHeader } from './ProjectHeader';
import { ProjectBody } from './ProjectBody';
import { adjust, remove, allPass, uniq, isNil, not, contains, isEmpty, filter, map } from 'ramda';
import { isDev, convertTodoDates } from '../../app';
import { getProgressStatus } from './ProjectLink';


let haveScheduledTodos = (project:Project, todos:Todo[]) : boolean => {
    let todosIds = project.layout.filter(isString) as string[];
    let filters = [
        byNotDeleted,
        byNotCompleted,
        (todo:Todo) => byScheduled(todo) || bySomeday(todo),
        (todo:Todo) => contains(todo._id)(todosIds) 
    ];

    let filtered : Todo[] = todos.filter(allPass(filters));

    return not(isEmpty(filtered)); 
}


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
  


interface ProjectComponentState{
    toProjectHeader:Todo[],
    toProjectBody:(Todo|Heading)[],  
    project:Project
}   
 
 
 
export class ProjectComponent extends Component<ProjectComponentProps,ProjectComponentState>{

    constructor(props){
        super(props); 
        this.state={
            toProjectHeader:[],
            toProjectBody:[],  
            project:null
        };
    }   

    getItems = (props:ProjectComponentProps) : Promise<{
        toProjectHeader:Todo[];
        toProjectBody:any;
        project:Project;
    }> => {
        let project = props.projects.find((p:Project) => props.selectedProjectId===p._id);
        
        return this.selectItems( 
            project.layout,
            props.todos,
            props.showCompleted, 
            props.showScheduled
        ).then(
            (items:(Todo|Heading)[]) => {
                let toProjectHeader = items.filter( isTodo ) as Todo[];
                let toProjectBody = items.filter((i:Todo) => isTodo(i) ? byTags(props.selectedTag)(i) : true);
                
                return {
                    toProjectHeader,
                    toProjectBody,
                    project
                }
            }
        )
    } 

    componentDidMount(){
        this.getItems(this.props) 
        .then( 
            ({toProjectHeader,toProjectBody,project}) => 
            this.setState({
                toProjectHeader, toProjectBody, project
            })  
        )
    }


    componentWillReciveProps(nextProps:ProjectComponentProps){
        this.getItems(nextProps) 
        .then( 
            ({toProjectHeader,toProjectBody,project}) => 
            this.setState({
                toProjectHeader, toProjectBody, project
            })
        )
    }


    shouldComponentUpdate(nextProps:ProjectComponentProps,nextState:ProjectComponentState){
        if(
            nextProps.projects!==this.props.projects ||

            nextProps.selectedProjectId!==this.props.selectedProjectId ||

            nextProps.selectedTag !== this.props.selectedTag || 

            nextProps.todos!==this.props.todos ||

            nextProps.showScheduled!==this.props.showScheduled ||  
                                                           
            nextProps.showCompleted!==this.props.showCompleted ||

            nextState.toProjectHeader !== this.state.toProjectHeader ||

            nextState.toProjectBody !== this.state.toProjectBody ||

            nextState.project !== this.state.project

        ){ return true }
            
        return false
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
    ) : Promise<(Todo | Heading)[]> => { 

        let onError = (error) => console.log(error);

        let byNotFuture = (t:Todo) => isNil(t.attachedDate) ? true : daysRemaining(t.attachedDate)<=0;
 
        let filters = [
            byNotDeleted, 
            showCompleted ? null : byNotCompleted, 

            showScheduled ? null : byNotFuture,
            showScheduled ? null : byNotSomeday
        ].filter( f => f );  


        return Promise.all( 
            layout.map(
                (item) => isString(item) ? 
                          getTodoById(onError,item as string) : 
                          new Promise(resolve => resolve(item))
            )
        )
        .then(filter((item:any) => isTodo(item) ? allPass(filters)(item) : true))
        .then(map((item:any) => isTodo(item) ? convertTodoDates(item) : item) as any) 
    }    

     
    render(){   
        let {todos} = this.props;
        let { 
            toProjectHeader,
            toProjectBody,  
            project
        } = this.state;  
 
        if(isNil(project)){ return null }

        let progress = getProgressStatus(project,todos);


        return  isNil(project) ? null : 
                <div>      
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
                    {  
                        not(haveScheduledTodos(project, this.props.todos)) ? null :
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
 