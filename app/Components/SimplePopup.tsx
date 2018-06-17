import '../assets/styles.css';  
import '../assets/calendarStyle.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { not } from 'ramda';
import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Rx';
import { insideTargetArea } from '../utils/insideTargetArea';
 

interface SimplePopupProps{ 
    show:boolean, 
    onOutsideClick:() => void
}  
 

interface SimplePopupState{}    
   

export class SimplePopup extends Component<SimplePopupProps,SimplePopupState>{

    ref:HTMLElement; 
    subscriptions:Subscription[]; 

    constructor(props){ 
        super(props);
        this.subscriptions=[]; 
    }    
    
    
    onOutsideClick = (e) => {
        if(this.ref===null || this.ref===undefined){  
           return
        }  
        let rect = this.ref.getBoundingClientRect();
        let x = e.pageX;
        let y = e.pageY; 
         
        let inside:boolean = insideTargetArea(null, this.ref, x, y);
          
        if(!inside){  
            this.props.onOutsideClick();
        }  
    }  

     
    componentDidMount(){
        let click = Observable 
                    .fromEvent(window, "click")
                    .subscribe(this.onOutsideClick);

        this.subscriptions.push(click); 
    }    


    componentWillUnmount(){
        this.subscriptions.map( s => s.unsubscribe() );
        this.subscriptions = [];
    } 
  

    render(){ 
        let {show, children} = this.props;
 
        return not(show) ? null : 
        <div style={{ 
            width:"100%",
            position:"fixed",
            zIndex:4000000,
            left:0,   
            top:0, 
            justifyContent:"center",
            alignItems:"center",
            display:"flex", 
            height:"100%"
        }}>
            <div     
                ref={(e) => { this.ref=e; }}
                onClick = {(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}   
                style={{       
                    zIndex:40000,      
                    backgroundColor: "rgba(0,0,0,0)"
                }}           
            >        
                {children}
            </div>
        </div>
    } 
} 