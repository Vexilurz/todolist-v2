import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react";  
import { 
    attachDispatchToProps, byTags, byNotCompleted, byNotDeleted, byCategory, 
    getTagsFromItems, attachEmptyTodo, log
} from "./../utils/utils";  
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { Todo, Project, Area, LayoutItem, Category, Item, Store } from './../types';
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
import { TodosList } from './TodosList';
import { ContainerHeader } from './ContainerHeader';
import { Tags } from './Tags';
import { FadeBackgroundIcon } from './FadeBackgroundIcon';
import { 
    uniq, allPass, isEmpty, isNil, not, any, contains, all, applyTo,
    compose, groupBy, cond, defaultTo, reject, flatten, map 
} from 'ramda';
import { TodoInput } from './TodoInput/TodoInput';
import { ProjectLink } from './Project/ProjectLink';
import { filter } from 'lodash'; 
import { TodoCreationForm } from './TodoInput/TodoCreation';
import { generateId } from './../utils/generateId';
import { generateEmptyTodo } from './../utils/generateEmptyTodo';
import { isString, isDate, isProject, isNotArray } from '../utils/isSomething';
import { groupProjectsByArea } from './Area/groupProjectsByArea';
import {  generateLayout } from './Area/generateLayout';
import { isDev } from '../utils/isDev';
import { assert } from '../utils/assert';



interface ExpandableListProps{
    showAll?:boolean,
    minLength:number,
    buttonOffset:number,
    type:string   
} 
 


interface ExpandableListState{
    expanded:boolean
}   


 
export class ExpandableList extends Component<ExpandableListProps,ExpandableListState>{

    constructor(props){
        super(props);
        this.state={
            expanded:false
        };
    } 



    onToggle = () => this.setState({expanded:!this.state.expanded})



    render(){ 
        let { minLength, showAll, buttonOffset } = this.props;
        let { expanded } = this.state;
        let maxLength = React.Children.count(this.props.children);
        let length = expanded || showAll ? maxLength : minLength;
        let children = React.Children.toArray(this.props.children);

        
        return <div>          
                {
                    children.slice(0,length)
                }
                {   
                    showAll ? null :
                    (maxLength-length) <= 0 ? null :
                    <div style={{cursor: "pointer", height: "30px", paddingLeft:`${buttonOffset}px`}}>
                        {   
                            <div     
                                onClick={this.onToggle}
                                style={{
                                    width:"100%",
                                    height:"30px",
                                    fontSize:"14px",
                                    display:"flex",
                                    alignItems:"center",
                                    cursor:"pointer",  
                                    color:"rgba(100, 100, 100, 0.6)"
                                }}
                            >     
                                { 
                                    not(expanded) ? 
                                    `Show ${ maxLength-length } more ${this.props.type}` :
                                    `Hide` 
                                } 
                            </div>
                        }
                    </div>
                }
            </div>
    }
} 