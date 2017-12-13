import '../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, uniq,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, any,
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, 
    groupBy, concat, flatten, toPairs, adjust, prepend, fromPairs 
} from 'ramda';
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import Popover from 'material-ui/Popover';
import Button from 'material-ui-next/Button'; 
import { Footer } from '../Components/Footer';
import { Tags } from '../Components/Tags';
import { Transition } from 'react-transition-group';
import { Category } from '../MainContainer';
import { TodosList } from '../Components/TodosList';
import { Todo } from '../databaseCalls';
import Star from 'material-ui/svg-icons/toggle/star';
import Plus from 'material-ui/svg-icons/content/add';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Moon from 'material-ui/svg-icons/image/brightness-3';
import Chip from 'material-ui/Chip';
import BusinessCase from 'material-ui/svg-icons/places/business-center';  
import Flag from 'material-ui/svg-icons/image/assistant-photo'; 
let moment = require("moment");

interface DeadlineLabelProps{
    onRemoveDeadline:Function,
    deadline:Date
}

interface DeadlineLabelState{
    
} 



export class DeadlineLabel extends Component<DeadlineLabelProps,DeadlineLabelState>{

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
                    onRequestDelete={this.props.onRemoveDeadline}
                    onClick={(e) => {}}
                    style={{
                        backgroundColor:"",
                        background:"",
                        transform:"scale(0.9,0.9)" 
                    }}  
                >
                    <div style={containerStyle}>
                        <Flag style={{   
                            color:"black",  
                            height: "25px",
                            width: "25px",
                            cursor:"default"  
                        }}/>
                        <div style={{marginLeft:"15px", color:"black"}}>Deadline: {moment(this.props.deadline).format('MMMM D')}</div>
                    </div>
                </Chip>
    }
  
}

