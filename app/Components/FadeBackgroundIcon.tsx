import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { equals, cond } from 'ramda';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Inbox from 'material-ui/svg-icons/content/inbox';
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


