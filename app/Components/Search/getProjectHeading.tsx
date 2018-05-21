import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';   
import { ipcRenderer } from 'electron'; 
import IconButton from 'material-ui/IconButton';  
import { Component } from "react";  
import { Provider, connect } from "react-redux";
import Chip from 'material-ui/Chip';  
import Star from 'material-ui/svg-icons/toggle/star';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import CheckBoxEmpty from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import CheckBox from 'material-ui/svg-icons/toggle/check-box'; 
import BusinessCase from 'material-ui/svg-icons/content/archive';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import Checked from 'material-ui/svg-icons/navigation/check';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz'; 
import Adjustments from 'material-ui/svg-icons/image/tune';
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Plus from 'material-ui/svg-icons/content/add'; 
import Trash from 'material-ui/svg-icons/action/delete';
import SearchIcon from 'material-ui/svg-icons/action/search'; 
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Calendar from 'material-ui/svg-icons/action/date-range';
import Logbook from 'material-ui/svg-icons/av/library-books';
import Clear from 'material-ui/svg-icons/content/clear';
import List from 'material-ui/svg-icons/action/list';
import Reorder from 'material-ui/svg-icons/action/reorder';  
let uniqid = require("uniqid");  
import * as Waypoint from 'react-waypoint';
import Popover from 'material-ui/Popover';
import {  
    daysLeftMark, 
    generateTagElement, 
    attachDispatchToProps, 
    byNotDeleted, 
    findAttachedProject, 
    getTagsFromItems,
    byTags
} from '../../utils/utils'; 
import { Category, ChecklistItem, Todo, ObjectType, Area, Project, Heading, Store } from '../../types';
import { allPass, isNil, not, isEmpty, contains, flatten, prop, compose, any, intersection, defaultTo, all } from 'ramda';
import { filter } from 'lodash'; 
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import PieChart from 'react-minimal-pie-chart';
import { TodoInput } from './../TodoInput/TodoInput';
import { Tags } from './../Tags';
import { isArray, isString, isDate, isNotDate } from '../../utils/isSomething';
import { chooseIcon } from '../../utils/chooseIcon';
import { FadeBackgroundIcon } from './../FadeBackgroundIcon';
import { isDev } from '../../utils/isDev';
import { assert } from '../../utils/assert';
import { sortByCompletedOrNot } from './sortByCompletedOrNot';



export let getProjectHeading = (
    project:Project, 
    indicator:{
        active:number,
        completed:number,
        deleted:number
    }
) : JSX.Element => {
    let done = indicator.completed;
    let left = indicator.active;
    let totalValue = (done+left)===0 ? 1 : (done+left);
    let currentValue = done;

    return <div   
        id = {project._id}        
        style={{    
            height:"30px",   
            paddingLeft:"6px", 
            paddingRight:"6px",  
            cursor:"default",
            width:"100%",
            display:"flex",  
            alignItems:"center", 
            overflowX:"hidden", 
            borderBottom:"1px solid rgba(100, 100, 100, 0.6)"
        }}
    >     
        <div style={{     
            marginLeft:"1px",
            width:"18px",
            height:"18px",
            position: "relative",
            borderRadius: "100px",
            display: "flex",
            justifyContent: "center",
            transform: "rotate(270deg)",
            cursor:"default",
            alignItems: "center",
            border: "1px solid rgb(108, 135, 222)",
            boxSizing: "border-box" 
        }}> 
            <div style={{
                width: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center", 
                cursor:"default",
                justifyContent: "center",
                position: "relative" 
            }}>  
                <PieChart 
                    animate={false}    
                    totalValue={totalValue}
                    data={[{      
                        value:currentValue, 
                        key:1,  
                        color:"rgb(108, 135, 222)" 
                    }]}    
                    style={{  
                        color: "rgb(108, 135, 222)",
                        width: "12px",
                        height: "12px",
                        position: "absolute",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"  
                    }}
                />     
            </div>
        </div> 
        <div   
            id = {project._id}   
            style={{   
                fontFamily: "sans-serif",
                fontSize: "15px",    
                cursor: "default",
                paddingLeft: "5px", 
                WebkitUserSelect: "none",
                fontWeight: "bolder", 
                color: "rgba(0, 0, 0, 0.8)" 
            }}
        >    
            { isEmpty(project.name) ? "New Project" : project.name } 
        </div> 
    </div>
};

