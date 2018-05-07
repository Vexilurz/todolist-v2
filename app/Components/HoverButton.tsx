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
            onClick={this.props.onClick}
            style={{
                cursor: "pointer",
                marginTop: "5px",
                minWidth:"170px",
                width: "auto",
                height: "25px",
                paddingLeft: "5px",
                paddingRight: "5px",
                display: "inline-block",
                color: "rgba(150,150,150,1)",
                borderRadius: "5px",
                backgroundColor: "rgba(255, 255, 255, 0)"
            }}
        > 
         { this.props.title }
        </div>
    }
};