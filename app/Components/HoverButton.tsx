import './../assets/styles.css';  
import './../assets/calendarStyle.css';   
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Component } from "react";  

interface HoverButtonProps{
    title:string
    onClick:(e:any) => void
}

interface HoverButtonState{}   

export class HoverButton extends Component<HoverButtonProps,HoverButtonState>{

    constructor(props){ 
        super(props); 
    }
    
    render(){ 
        return <div 
            className="showHideButton"
            style={{
                cursor:"pointer",
                width:"70px",
                height:"25px",
                borderRadius:"5px",
                backgroundColor:"rgba(255,255,255,0)"
            }}
        > 
         { this.props.title }
        </div>
    }
};