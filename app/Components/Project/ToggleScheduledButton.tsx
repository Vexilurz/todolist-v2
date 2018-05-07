import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';   
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Component } from "react";  
import { HoverButton } from './../HoverButton';

interface ToggleScheduledButtonProps{
    onToggle:(e:any) => void,
    showScheduled:boolean
}

interface ToggleScheduledButtonState{}   

export class ToggleScheduledButton extends Component<ToggleScheduledButtonProps,ToggleScheduledButtonState>{

    constructor(props){ 
        super(props); 
    }
    
    render(){ 
        return <HoverButton
            title={`${this.props.showScheduled ? 'Hide' : 'Show'} later tasks`}
            onClick={this.props.onToggle}
        />
    }
};
