
import '../../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Provider } from "react-redux";
import { Transition } from 'react-transition-group';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
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
import { 
    uppercase, debounce, stringToLength, daysLeftMark, byNotCompleted, 
    byNotDeleted, generateDropStyle, hideChildrens, 
    makeChildrensVisible, assert, isArrayOfProjects, isProject, isCategory, 
    isString, arrayMove 
} from '../../utils'; 
import { TodoInput } from '../TodoInput/TodoInput';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import Checked from 'material-ui/svg-icons/navigation/check';
import PieChart from 'react-minimal-pie-chart';
import { ProjectLink } from '../Project/ProjectLink';
import { allPass, isNil, not, contains, isEmpty } from 'ramda';
import { TodosList } from '../TodosList';
import { Category, filter } from '../MainContainer';
import { changeProjectsOrder, removeFromArea, attachToArea } from './AreasList';
import { isDev } from '../../app';
import { deleteProject } from '../Project/ProjectMenu';
import { ExpandableTodosList } from '../Categories/Next';
import { SortableContainer } from '../../sortable/CustomSortableContainer';


 

interface AreaBodyProps{ 
    area:Area, 
    areas:Area[], 
    projects:Project[],
    moveCompletedItemsToLogbook:string, 
    selectedAreaId:string, 
    selectedProjectId:string, 
    todos:Todo[], 
    selectedCategory:Category, 
    selectedTag:string, 
    rootRef:HTMLElement,
    dispatch:Function
} 
 

interface AreaBodyState{} 
 
 
  
export class AreaBody extends Component<AreaBodyProps,AreaBodyState>{

    ref:HTMLElement; 

    constructor(props){
        super(props); 
    }
    

    selectProjects = (props:AreaBodyProps) : Project[] => {
        let { selectedCategory } = this.props;
        let projectsIds : string[] = props.area.attachedProjectsIds;

        let filters = [
            (p:Project) => 
                isNil(p.hide) ? true : 
                isEmpty(p.hide) ? true : 
                not(contains(selectedCategory)(p.hide)), 
            byNotCompleted,
            byNotDeleted,
            (p:Project) => projectsIds.indexOf(p._id)!==-1
        ];
 
        let selected = props.projects.filter( allPass(filters) );

        assert(
            isArrayOfProjects(selected), 
            `selected is not an array of projects. selectProjects. AreaBody. ${JSON.stringify(selected)}`
        );
 
        return selected;
    }
      
 
    getProjectElement = (value:Project,index:number) : JSX.Element => {
        return <div key={`${value._id}-key`} id={value._id}> 
            <ProjectElement  
                project={value}
                todos={this.props.todos}
                index={index}
                dispatch={this.props.dispatch}
                moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                selectedTag={this.props.selectedTag}
                rootRef={this.props.rootRef}
                selectedAreaId={this.props.selectedAreaId}
                selectedProjectId={this.props.selectedProjectId}
                selectedCategory={this.props.selectedCategory} 
                areas={this.props.areas} 
                projects={this.props.projects}
            />
        </div> 
    }

    
    render(){  
        let selectedProjects = this.selectProjects(this.props)
        .sort((a:Project, b:Project) => a.priority-b.priority);
        
        return <div ref={(e) => {this.ref=e;}}>    
            <div id={`area-list`} style={{paddingTop:"20px", paddingBottom:"20px"}}> 
               {selectedProjects.map((item,index) => this.getProjectElement(item,index))}
            </div> 
        </div>
    }
} 




interface ProjectElementProps{
    project:Project,
    index:number,
    todos:Todo[],
    moveCompletedItemsToLogbook:string,
    dispatch:Function,
    selectedTag:string, 
    rootRef:HTMLElement,  
    selectedCategory:Category,
    selectedAreaId:string,  
    selectedProjectId:string, 
    areas:Area[],  
    projects:Project[]   
}

interface ProjectElementState{
    canDrag:boolean
}

class ProjectElement extends Component<ProjectElementProps,ProjectElementState>{

    constructor(props){  
        super(props);
    } 

    render(){

        let {
            project, todos, index, dispatch, selectedTag, 
            rootRef, selectedAreaId, selectedProjectId, 
            selectedCategory, areas, projects,
        } = this.props;

        let attachedTodosIds = project.layout.filter(isString) as string[];

        let selected = filter(
            todos,
            (t:Todo) => 
                contains(t._id)(attachedTodosIds) && 
                byNotCompleted(t as (Project & Todo)) &&
                byNotDeleted(t),
            "" 
        );   
  
        return  isEmpty(todos) ? null : 
                <div style={{display:"flex", flexDirection:"column"}}>
                    <ProjectLink {...{project,showMenu:true} as any}/>  
                    <ExpandableTodosList
                        dispatch={dispatch}   
                        selectedTag={this.props.selectedTag}  
                        rootRef={this.props.rootRef} 
                        selectedAreaId={this.props.selectedAreaId}
                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                        selectedProjectId={this.props.selectedProjectId}
                        todos={selected} 
                        project={project}  
                        areas={this.props.areas} 
                        projects={this.props.projects}
                    />  
                </div>
    }
}




  