import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import { isEmpty, merge } from 'ramda';
import ResizeObserver from 'resize-observer-polyfill';
import { stringToLength } from '../utils/stringToLength';
import { isNumber, isNotNil } from '../utils/isSomething';



interface AutoresizableTextProps{
    text:string,
    placeholder:string, 
    fontSize:number,
    fontWeight:string,
    style:any,
    placeholderStyle:any,
    offset?:number 
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
 


    onResize = (entries) => { 
        const {width} = entries[0].contentRect;
        const {text, fontSize, placeholder, fontWeight, offset} = this.props;
        let containerWidth = width; 
        let name = isEmpty(text) ? placeholder : text;
        let textWidth = getWidthOfText({
            text:name, 
            fontSize,
            fontFamily:'sans-serif',
            fontStyle:"normal",
            fontVariant:"normal",
            fontWeight
        });
        let stringLength = Math.round((name.length*containerWidth)/textWidth);

        if(isNotNil(offset) && isNumber(offset)){
           stringLength-=offset;
        }

        this.setState({stringLength:stringLength<name.length ? (stringLength) : name.length}); 
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
        if(this.ref){
           let rect = this.ref.getBoundingClientRect();
           this.onResize([ {contentRect:rect} ]) 
        }

        this.initRo();
    };
    


    componentWillUnmount(){
        this.suspendRo(); 
    }; 


 
    render(){
        let {text, style, fontSize, placeholder, placeholderStyle} = this.props;
        let {stringLength} = this.state;
        let defaultStyle = {fontSize:`${fontSize}px`, whiteSpace:"nowrap", width:"100%"};  
        let textStyle = merge(isEmpty(text) ? placeholderStyle : style, defaultStyle);  
        
        return <div ref={(e) => {this.ref = e;}} 
          //style={textStyle}
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            fontWeight: 500,
            fontSize: "18px",  
            color: "rgba(10, 10, 10, 0.9)", 
            WebkitUserSelect:"none"
          }}
        >  
            { stringToLength(isEmpty(text) ? placeholder : text, stringLength) }
        </div>  
    } 
};



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
