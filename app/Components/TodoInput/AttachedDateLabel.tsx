import '../../assets/styles.css';   
import * as React from 'react';  
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import Popover from 'material-ui/Popover';
import { Transition } from 'react-transition-group';
import { Category } from '../MainContainer';
import Star from 'material-ui/svg-icons/toggle/star';
import Plus from 'material-ui/svg-icons/content/add';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Moon from 'material-ui/svg-icons/image/brightness-3';
import Chip from 'material-ui/Chip';
import BusinessCase from 'material-ui/svg-icons/places/business-center';  
import Flag from 'material-ui/svg-icons/image/assistant-photo';  
import { chooseIcon } from '../../utils';
let moment = require("moment"); 
 

interface AttachedDateLabelProps{
    onRemoveAttachedDate:Function,
    date:Date  
} 


interface AttachedDateLabelState{} 



export class  AttachedDateLabel extends Component<AttachedDateLabelProps, AttachedDateLabelState>{

    constructor(props){
        super(props); 
    }

 
    render(){
        let containerStyle : any = {
            display: "flex",
            alignItems: "center",
            color: "rgba(0,0,0,1)",
            fontWeight: "bold", 
            cursor: "default",
            marginLeft: "20px",
            marginRight: "20px",
            userSelect: "none"
        };
 
           
        return  <Chip 
                    onRequestDelete={this.props.onRemoveAttachedDate}
                    onClick={(e) => {}}
                    style={{
                        backgroundColor:"",
                        background:"",
                        transform:"scale(0.9,0.9)" 
                    }}  
                >
                    <div style={containerStyle}>
                        {
                            chooseIcon({height: "25px", width: "25px"}, "upcoming")
                        } 
                        <div style={{marginLeft:"15px", color:"black"}}>
                            When : {moment(this.props.date).format('MMMM D')}
                        </div>   
                    </div>
                </Chip>
    }
  
}

