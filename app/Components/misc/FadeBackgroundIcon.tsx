import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { 
    attachDispatchToProps, uppercase, insideTargetArea, 
    chooseIcon, byCategory, byTags, allPass 
} from "../../utils"; 
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { 
    queryToTodos, getTodos, updateTodo, Todo, 
    removeTodo, generateId, addTodo 
} from '../../database';
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
import Star from 'material-ui/svg-icons/toggle/star';
import BusinessCase from 'material-ui/svg-icons/places/business-center';
import Layers from 'material-ui/svg-icons/maps/layers';
import Trash from 'material-ui/svg-icons/action/delete';
import Logbook from 'material-ui/svg-icons/av/library-books';
import { Category } from '../MainContainer';





export let chooseFadeIcon = (container:HTMLElement, selectedCategory:Category) => {
    
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
        userSelect: "none"
    };


    switch(selectedCategory){  
        case "inbox":
            return <Inbox style={style} /> 

        case "today":
            return <Star style={style}/>

        case "upcoming":
            return <CalendarIco style={style}/>

        case "anytime":
            return <Layers style={style}/>

        case "someday":
            return <BusinessCase  style={style}/> 

        case "logbook":
            return <Logbook style={style}/>  

        case "trash":
            return <Trash style={style}/>

        default:
            return null 
    }
} 


 

interface FadeBackgroundIconProps{
    container:HTMLElement,
    objects:Todo[],
    filters:Function[], 
    selectedCategory:Category,
    selectedTag:string    
} 



 
export class FadeBackgroundIcon extends Component<FadeBackgroundIconProps,any>{

    show = () => { 
        let objects = this.props.objects.filter((item) => allPass(this.props.filters as any[], item));   
        
        return objects.length===0; 
    } 

    render(){

        if(this.props.container===null || this.props.container===undefined)
           return null;
         

        if(this.show()) 
           return chooseFadeIcon(this.props.container,this.props.selectedCategory);
 

        return null;  

    } 

}


