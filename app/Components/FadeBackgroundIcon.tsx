import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { attachDispatchToProps, byCategory, byTags } from "../utils/utils"; 
import { connect } from "react-redux";
import { compose, equals, cond } from 'ramda';
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { 
    queryToTodos, getTodos, updateTodo, Todo, 
    removeTodo, addTodo 
} from '../database';
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
import Star from 'material-ui/svg-icons/toggle/star'; 
import BusinessCase from 'material-ui/svg-icons/content/archive';
import Layers from 'material-ui/svg-icons/maps/layers';
import Trash from 'material-ui/svg-icons/action/delete';
import Logbook from 'material-ui/svg-icons/av/library-books';
import { Category } from './MainContainer';
 




export let chooseFadeIcon = (container:HTMLElement, selectedCategory:Category) : JSX.Element => {
    
    let rect = container.getBoundingClientRect();

    let x = rect.width/2 - 85; 
    let y = rect.height/2 - 85; 

    let style = { 
        position: "absolute",
        color: "rgba(100,100,100,0.1)",
        top: y,
        left: x,
        fill: "currentcolor", 
        height: "170px",
        width: "170px", 
        userSelect: "none",
        WebkitUserSelect:"none"
    };

    return cond([
        [
            equals("inbox"),
            () => <Inbox style={style} /> 
        ],
        [
            equals("today"),
            () => <Star style={style}/>
        ],
        [
            equals("upcoming"),
            () => <CalendarIco style={style}/>
        ],
        [
            equals("next"),
            () => <Layers style={style}/>
        ],
        [
            equals("someday"),
            () => <BusinessCase style={style}/> 
        ],
        [
            equals("logbook"),
            () => <Logbook style={style}/> 
        ],
        [
            equals("trash"),
            () => <Trash style={style}/>
        ],
        [
            () => true,
            () => null
        ]
    ])(selectedCategory);
} 


 

interface FadeBackgroundIconProps{
    container:HTMLElement,
    show:boolean,
    selectedCategory:Category
} 



 
export class FadeBackgroundIcon extends Component<FadeBackgroundIconProps,any>{

    render(){
    
        if(this.props.container===null || this.props.container===undefined)
           return null;
         

        if(this.props.show) 
           return chooseFadeIcon(this.props.container,this.props.selectedCategory);
 

        return null;  
    } 
}


