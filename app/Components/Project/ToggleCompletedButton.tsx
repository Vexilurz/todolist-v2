import './../assets/styles.css';  
import './../assets/calendarStyle.css';   
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Component } from "react";  
import { HoverButton } from './../HoverButton';

interface ToggleCompletedButtonProps{
    onToggle:(e:any) => void,
    showCompleted:boolean
}

interface ToggleCompletedButtonState{}   

export class ToggleCompletedButton extends Component<ToggleCompletedButtonProps,ToggleCompletedButtonState>{

    constructor(props){ 
        super(props); 
    }
    
    render(){ 
        return <HoverButton
            title={`${this.props.showCompleted ? 'Hide' : 'Show'} completed tasks`}
            onClick={this.props.onToggle}
        />
    }
};