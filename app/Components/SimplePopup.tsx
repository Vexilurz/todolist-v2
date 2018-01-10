import '../assets/styles.css';  
import '../assets/calendarStyle.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import Popover from 'material-ui/Popover';
import { Transition } from 'react-transition-group';
import Restore from 'material-ui/svg-icons/navigation/refresh'; 
import { uniq, compose, contains, allPass, isNil, not, isEmpty } from 'ramda';
import { isString } from 'util';
import { insideTargetArea } from '../utils';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
 

interface SimplePopupProps{ 
    show:boolean, 
    onOutsideClick:() => void
}  
 

interface SimplePopupState{
    x:number, 
    y:number,
    show:boolean  
}    
   

export class SimplePopup extends Component<SimplePopupProps,SimplePopupState>{

    ref:HTMLElement; 
    subscriptions:Subscription[]; 

    constructor(props){ 
        super(props);
        this.subscriptions=[]; 
        this.state={x:0, y:0, show:false}; 
    }    
    
    
    onOutsideClick = (e) => {
        if(this.ref===null || this.ref===undefined){  
           return
        }  
        let rect = this.ref.getBoundingClientRect();
        let x = e.pageX;
        let y = e.pageY; 
         
        let inside:boolean = insideTargetArea(this.ref, x, y);
          
        if(!inside){  
            this.props.onOutsideClick();
        }  
    }  

   
    updatePosition = () : void => { 
        if(isNil(this.ref)){
           setTimeout(this.updatePosition, 10);    
           return;  
        }

        let box = this.ref.getBoundingClientRect();
        let rect = document.body.getBoundingClientRect();
        let centerX : number = window.innerWidth/2;
        let centerY : number = window.innerHeight/2;
          
        let x = centerX - box.width/2;    
        let y = centerY - box.height/2;
        this.setState({x,y,show:true});   
    } 
       
     
    componentDidMount(){
        let click = Observable 
                    .fromEvent(window, "click")
                    .subscribe(this.onOutsideClick);

        let resize = Observable  
                    .fromEvent(window, "resize")
                    .subscribe(() => this.updatePosition());            
        
        this.subscriptions.push(click,resize); 
        this.updatePosition();   
    }    


    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = [];
    } 
  

    render(){ 
        let {show, children} = this.props;
        let {x, y} = this.state;
 
        return not(show) ? null :
        <div     
            ref={(e) => { this.ref=e; }}
            onClick = {(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}  
            style={{      
                visibility:this.state.show ? "visible" : "hidden",  
                zIndex:40000,      
                position:"fixed",
                backgroundColor: "rgba(0,0,0,0)",
                left:`${x}px`,   
                top:`${y}px`   
            }}          
        >        
            {children}
        </div>
    } 
} 