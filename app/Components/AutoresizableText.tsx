import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import IconButton from 'material-ui/IconButton'; 
import NewAreaIcon from 'material-ui/svg-icons/maps/layers';
import { 
    stringToLength, byNotCompleted, byNotDeleted, 
    daysRemaining, dateDiffInDays, assert, isArrayOfStrings, 
    isArrayOfProjects, isArea, isProject 
} from '../utils'; 
import PieChart from 'react-minimal-pie-chart';
import { 
    uniq, allPass, remove, toPairs, 
    intersection, isEmpty, contains, 
    assoc, isNil, not, all, merge  
} from 'ramda';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import ResizeObserver from 'resize-observer-polyfill';

interface AutoresizableTextProps{
    text:string,
    placeholder:string, 
    fontSize:number,
    style:any,
    placeholderStyle:any 
} 

interface AutoresizableTextState{
    stringLength:number
}

export class AutoresizableText extends Component<AutoresizableTextProps,AutoresizableTextState>{

    ref:HTMLElement;
    ro:ResizeObserver;

    constructor(props){
        super(props);
        this.state = {
            stringLength:25 
        }
    }

    initRo = () => {
        this.ro = new ResizeObserver((entries, observer) => {
            const offset = 45; 
            const {left, top, width, height} = entries[0].contentRect;
            const {text, style, fontSize} = this.props;
            let box = this.ref.getBoundingClientRect();
            let containerWidth = width-offset <=0 ? 0 : width-offset; 
            let stringLength = stringToContainer(containerWidth, text, fontSize);
            this.setState({stringLength});
        });      
          
        this.ro.observe(this.ref); 
    }

    suspendRo = () => { 
        this.ro.disconnect();
        this.ro = undefined;
    }

    componentDidMount(){
        this.initRo();
    }  

    componentWillUnmount(){
        this.suspendRo();
    } 

    render(){
        let {text, style, fontSize, placeholder, placeholderStyle} = this.props;
        let {stringLength} = this.state;
         
        let defaultStyle = {
            fontSize:`${fontSize}px`, 
            whiteSpace:"nowrap",
            height:"auto",
            width:"auto"
        }; 
 
        let textStyle = isEmpty(text) ? 
                        merge(placeholderStyle,defaultStyle) :
                        merge(style,defaultStyle); 
        
        return <div   
            ref={(e) => {this.ref = e;}} 
            style={textStyle}
        >  
            { 
                stringToLength( 
                  isEmpty(text) ? placeholder : text,
                  stringLength
                )    
            }
        </div>  
    } 
}


export let stringToContainer = (containerWidth:number, s:string, fontSize:number) : number => {
    let textWidth = getStringWidth(s,fontSize);
    let length = s.length; 
    let factor = length===0 ? 1 : textWidth/length;
    return factor===0 ? 1 : containerWidth/factor;
} 


export let getStringWidth = (s:string, fontSize:number) : number => {
    let container = document.createElement("div");
    container.style.position="absolute";
    container.style.fontSize=`${fontSize}px`;
    container.style.display="block"; 
    container.style.height="auto";
    container.style.width="auto";
    container.style.visibility="hidden";
    container.style.whiteSpace="nowrap"; 
    container.innerHTML=s;
    document.body.appendChild(container);
    let box = container.getBoundingClientRect();
    let width = box.width;
    container.remove();
    return width;       
}

