
import '../../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Provider } from "react-redux";
import { Transition } from 'react-transition-group';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Popover from 'material-ui/Popover';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Repeat from 'material-ui/svg-icons/av/repeat';
import Inbox from 'material-ui/svg-icons/content/inbox';
import Duplicate from 'material-ui/svg-icons/content/content-copy';
import ShareIcon from 'material-ui/svg-icons/social/share';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import { TextField } from 'material-ui';
import AutosizeInput from 'react-input-autosize';
import { Todo, Project, Heading, LayoutItem, Area } from '../../database';
import { uppercase, debounce, stringToLength, diffDays, daysRemaining, daysLeftMark, chooseIcon } from '../../utils';
import { arrayMove } from '../../sortable-hoc/utils';
import { SortableList, Data } from '../SortableList';
import { TodoInput } from '../TodoInput/TodoInput';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import Checked from 'material-ui/svg-icons/navigation/check';
import PieChart from 'react-minimal-pie-chart';

  

export let getProjectLink = (iconSize, value:Project, index:number, dispatch:Function) : JSX.Element => { 
       
        return  <div 
            key={`${value._id}-${index}`}   
            style={{position:"relative", padding:"5px"}}
        >  
            <div   
                className="toggleFocus"    
                onClick = {() => dispatch({ type:"selectedProjectId", load:value._id })} 
                id = {value._id}       
                style={{     
                    marginLeft:"4px",
                    marginRight:"4px", 
                    padding:"5px", 
                    position:"relative", 
                    height:"20px",
                    width:"95%",
                    display:"flex",
                    alignItems: "center" 
                }}
            >             
                        { chooseIcon(iconSize, "project") }
                        
                    <div    
                        id = {value._id}   
                        style={{  
                            paddingLeft:"5px",
                            fontFamily: "sans-serif",
                            fontWeight: 600, 
                            color: "rgba(0, 0, 0, 1)",
                            fontSize: "18px", 
                            whiteSpace: "nowrap",
                            cursor: "default",
                            WebkitUserSelect: "none" 
                        }}
                    > 
                    
                        { stringToLength(value.name, 25) }

                    </div>          
    
                    {   true ? null :  
                        <div style={{position:"absolute", right:"5px",  WebkitUserSelect: "none"}}>
                            
                            { daysLeftMark(false, value.deadline, false) }
                        
                        </div>
                    }
                        
            </div> 
        </div>   
    }   
     