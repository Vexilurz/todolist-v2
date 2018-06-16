import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import { isEmpty, merge } from 'ramda';
import ResizeObserver from 'resize-observer-polyfill';
import { stringToLength } from '../utils/stringToLength';



interface AutoresizableTextProps{
    text:string,
    placeholder:string, 
    width:number,
    fontSize:number,
    style:any,
    offset:number,
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
        this.state={stringLength:0}; 
    } 
 


    /*shouldComponentUpdate(nextProps:AutoresizableTextProps,nextState:AutoresizableTextState){
        return this.props.text!==nextProps.text || 
               this.props.width!==nextProps.width ||
               this.state.stringLength!==nextState.stringLength;
    }*/



    onResize = (entries, observer) => { 
        const {left, top, width, height} = entries[0].contentRect;
        const {text, style, fontSize, offset, placeholder} = this.props;
        let containerWidth = width-offset <= 0 ? 0 : width-offset; 
        let name = isEmpty(text) ? placeholder : text;
        let stringLength = stringToContainer(containerWidth, name, fontSize); 
        this.setState({stringLength}); 
    };      
  

   
    initRo = () => {  
        this.ro = new ResizeObserver(this.onResize);  
        this.ro.observe(this.ref);   
    };
 


    suspendRo = () => {      
        this.ro.disconnect();
        this.ro = undefined;
    };
 


    componentDidMount(){
        this.initRo();
    };
    


    componentWillUnmount(){
        this.suspendRo(); 
    }; 


 
    render(){
        let {text, style, fontSize, placeholder, placeholderStyle} = this.props;
        let {stringLength} = this.state;
        let defaultStyle = {fontSize:`${fontSize}px`, whiteSpace:"nowrap", width:"inherit"};  
        let textStyle = merge(isEmpty(text) ? placeholderStyle : style, defaultStyle);  
        
        return <div ref={(e) => {this.ref = e;}} style={textStyle}>  
            { stringToLength(isEmpty(text) ? placeholder : text, stringLength) }
        </div>  
    } 
};



export let stringToContainer = (containerWidth:number, s:string, fontSize:number) : number => {

    let textWidth = getStringWidth(s,fontSize);
    let length = s.length; 
    let remainder = textWidth - containerWidth;

    if(remainder<=0){
       return length; 
    }else{
       let widthOfSingleLetter = textWidth/length; 
       let remainderLength = remainder / widthOfSingleLetter;
       return length - remainderLength;
    }
};  



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
};




/*
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import { uniq, allPass, remove, toPairs, intersection, isEmpty, contains, isNil, not, all, merge } from 'ramda';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import ResizeObserver from 'resize-observer-polyfill';

export let stringToLength = (s : string, length : number) : string => {
    return s.length<=length ? s : s.substring(0, length) + "...";
}  



let getWidthOfText = ({
    text, 
    fontSize,
    fontFamily,
    fontStyle,
    fontVariant,
    fontWeight
} : {text:string,fontSize:number,fontFamily:string,fontStyle:string,fontVariant:string,fontWeight:string}) => {
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    context.font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${fontFamily}`;
    return context.measureText(text).width;
};



interface AutoresizableTextProps{
    text:string,
    fontSize:number,
    fontFamily:string,
    fontStyle:string, 
    fontVariant:string, 
    fontWeight:string
} 



interface AutoresizableTextState{
    stringLength:number
}



export class AutoresizableText extends Component<AutoresizableTextProps,AutoresizableTextState>{
    ref:HTMLElement;
    ro:ResizeObserver;
 
    constructor(props){
        super(props);
        this.state={stringLength:0}; 
    } 
    
 
   
    initRo = () => {  
        this.ro = new ResizeObserver(this.onResize);  
        this.ro.observe(this.ref);   
    };
 


    suspendRo = () => {      
        this.ro.disconnect();
        this.ro = undefined;
    };
 


    componentDidMount(){
        this.initRo();
    };
    


    componentWillUnmount(){
        this.suspendRo(); 
    }; 



    onResize = (entries, observer) => { 
        const {width} = entries[0].contentRect;
        const {text, fontSize, fontFamily, fontStyle, fontVariant, fontWeight} = this.props;
        const threeDotsOffset = 2;
        let containerWidth = width < 0 ? 0 : width; 
        let string = isEmpty(text) ? '' : text;
        let textWidth = getWidthOfText({text,fontSize,fontFamily,fontStyle,fontVariant,fontWeight});
        let stringLength = ((string.length*containerWidth)/textWidth);
        this.setState({stringLength:stringLength<string.length ? stringLength-threeDotsOffset : string.length}); 
    };      


  
    render(){
        const {text, fontSize, fontFamily, fontStyle, fontVariant, fontWeight} = this.props;
        let {stringLength} = this.state;
        
        return <div 
            ref={(e) => {this.ref = e;}} 
            style={{
                fontSize:`${fontSize}px`,
                whiteSpace:'nowrap',
                width:'inherit',
                fontFamily,
                fontStyle,
                fontVariant,
                fontWeight
            } as any}
        >  
            { stringToLength(text, stringLength) }
        </div>  
    } 
};

*/