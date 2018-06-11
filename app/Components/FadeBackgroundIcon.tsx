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
import { Category } from './../types';
 


export let chooseFadeIcon = (container:HTMLElement, selectedCategory:Category) : JSX.Element => {
    let rect = container.getBoundingClientRect();
    let x = rect.width/2 - 85; 
    let y = rect.height/2 - 85; 
    
    let style = {  
        color: "rgba(100,100,100,0.1)",
        fill: "currentcolor", 
        height: "170px",
        width: "170px", 
        userSelect: "none",
        WebkitUserSelect:"none"
    };

    let containerStyle = {
        position: "absolute",
        pointerEvents: "none",
        width: "90%",
        height: "80%",
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        userSelect: "none"
    }; 

    return cond([
        [
            equals("inbox"),
            () => <div style={containerStyle as any}><Inbox style={style} /></div> 
        ],
        [
            equals("today"),
            () => <div style={containerStyle as any}><Star style={style}/></div> 
        ],
        [
            equals("upcoming"),
            () => <div style={containerStyle as any}><CalendarIco style={style}/></div> 
        ],
        [
            equals("next"),
            () => <div style={containerStyle as any}><Layers style={style}/></div> 
        ],
        [
            equals("someday"),
            () => <div style={containerStyle as any}><BusinessCase style={style}/></div>  
        ],
        [
            equals("logbook"),
            () => <div style={containerStyle as any}><Logbook style={style}/></div>  
        ],
        [
            equals("trash"),
            () => <div style={containerStyle as any}><Trash style={style}/></div> 
        ],
        [
            () => true, () => null 
        ]
    ])(selectedCategory);
} 

 

interface FadeBackgroundIconProps{
    container:HTMLElement,
    show:boolean,
    selectedCategory:Category
}  


  
export class FadeBackgroundIcon extends Component<FadeBackgroundIconProps,any>{

    constructor(props){
        super(props);
    }

    shouldComponentUpdate(){
        return true; 
    }

    render(){
        if(this.props.container===null || this.props.container===undefined){
           return null;
        }else if(this.props.show){ 
           return chooseFadeIcon(this.props.container,this.props.selectedCategory);
        }else{
           return null;  
        }
    } 
}


