
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
    debounce, daysLeftMark, byNotCompleted, 
    byNotDeleted, generateDropStyle, hideChildrens, 
    makeChildrensVisible
} from '../../utils/utils'; 
import { TodoInput } from '../TodoInput/TodoInput';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import Checked from 'material-ui/svg-icons/navigation/check';
import PieChart from 'react-minimal-pie-chart';
import { ProjectLink } from '../Project/ProjectLink';
import { allPass, isNil, not, contains, isEmpty, flatten } from 'ramda';
import { Category, filter } from '../MainContainer';
import { changeProjectsOrder, removeFromArea, attachToArea } from './AreasList';
import { deleteProject } from '../Project/ProjectMenu';
import { assert } from '../../utils/assert';
import { isArrayOfProjects, isString } from '../../utils/isSomething';
import { GroupsByProjectArea } from '../GroupsByProjectArea';

 

interface AreaBodyProps{ 
    area:Area, 
    areas:Area[], 
    projects:Project[],
    moveCompletedItemsToLogbook:string, 
    selectedAreaId:string, 
    groupTodos:boolean, 
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
     
    render(){  
        let { 
            dispatch, selectedProjectId, groupTodos, moveCompletedItemsToLogbook, area,
            selectedAreaId, selectedCategory, selectedTag, rootRef, projects, todos 
        } = this.props;

        let projectsFilters=[
            byNotCompleted, 
            byNotDeleted,
            (p) => contains(p._id)(area.attachedProjectsIds),
            (p) => isNil(p.hide) ? true : 
                   isEmpty(p.hide) ? true : 
                   not(contains(selectedCategory)(p.hide))
        ];

        let selectedProjects = filter(projects, allPass(projectsFilters), "");
        let ids = flatten([area.attachedTodosIds,selectedProjects.map((p) => p.layout.filter(isString))]); 
        let selectedTodos = filter(
            todos, 
            allPass([byNotDeleted, byNotCompleted, (todo:Todo) => contains(todo._id)(ids)]), 
            ""
        );


        return <div ref={(e) => {this.ref=e;}} id={`${selectedCategory}-list`}> 
            <GroupsByProjectArea
                projectsFilters={projectsFilters}
                areasFilters={[]}
                dispatch={dispatch} 
                selectedProjectId={selectedProjectId}
                groupTodos={groupTodos}
                moveCompletedItemsToLogbook={moveCompletedItemsToLogbook}
                selectedAreaId={selectedAreaId}
                selectedCategory={selectedCategory}
                selectedTag={selectedTag}
                rootRef={rootRef}
                areas={[]}
                projects={projects} 
                todos={selectedTodos}
            />
        </div> 
    }
} 




  