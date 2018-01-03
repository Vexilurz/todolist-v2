
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
import { uppercase, debounce, stringToLength, daysRemaining, daysLeftMark, chooseIcon, dateDiffInDays } from '../../utils';
import { arrayMove } from '../../sortable-hoc/utils';
import { SortableList, Data } from '../SortableList';
import { TodoInput } from '../TodoInput/TodoInput';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import Checked from 'material-ui/svg-icons/navigation/check';
import PieChart from 'react-minimal-pie-chart';
import Restore from 'material-ui/svg-icons/content/undo';
import { isString } from 'util';
import { contains, isNil } from 'ramda';
   







export let getProjectLink = (p:Project, todos:Todo[],  dispatch:Function, index:number) : JSX.Element => { 
        
        let days = !isNil(p.deadline) ? dateDiffInDays(p.created,p.deadline) : 0;      
        let remaining = !isNil(p.deadline) ? daysRemaining(p.deadline) : 0;   
        
        let restoreProject = (p:Project) : void => { 
            
            let relatedTodosIds : string[] = p.layout.filter(isString);
    
            let selectedTodos : Todo[] = todos.filter(
                (t:Todo) : boolean => contains(t._id)(relatedTodosIds)
            );   
            dispatch({
                type:"updateTodos", 
                load:selectedTodos.map((t:Todo) => ({...t,deleted:undefined}))
            })
            dispatch({type:"updateProject", load:{...p,deleted:undefined}});
        }
             
         
        return <li  
            onClick={() => {
                if(p.deleted) 
                   return;   
                dispatch({type:"selectedCategory",load:"project"});
                dispatch({type:"selectedProjectId",load:p._id});
            }}    
            style={{width:"100%"}} 
            key={index} 
        >   
            <div   
                id = {p._id}        
                className="leftpanelmenuitem" 
                style={{    
                    height:"25px",  
                    padding:"6px", 
                    overflowX: "hidden",
                    width:"95%",
                    display:"flex",
                    alignItems:"center" 
                }}
            >     
                    { 
                        !p.deleted ? null : 
                        <div       
                            onClick={(e) => restoreProject(p)}  
                            style={{ 
                                display:"flex", 
                                cursor:"pointer",
                                alignItems:"center",
                                height:"14px",
                                paddingLeft:"20px",
                                paddingRight:"5px"  
                            }} 
                        >  
                            <Restore style={{width:"20px", height:"20px"}}/> 
                        </div>  
                    }   
                    
                    <div style={{    
                        width: "18px",
                        height: "18px",
                        position: "relative",
                        borderRadius: "100px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "1px solid rgb(108, 135, 222)",
                        boxSizing: "border-box" 
                    }}> 
                        <div style={{
                            width: "18px",
                            height: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative" 
                        }}>  
                            <PieChart 
                                animate={false}    
                                totalValue={days}
                                data={[{    
                                    value:p.completed ? days : (days-remaining), 
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
                        id = {p._id}   
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
                        { p.name.length==0 ? "New Project" : stringToLength(p.name,25) } 
                    </div>     
 
            </div>
        </li>  
}     
      