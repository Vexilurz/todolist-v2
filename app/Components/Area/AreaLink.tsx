import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import SortableContainer from '../../sortable-hoc/sortableContainer';
import SortableElement from '../../sortable-hoc/sortableElement';
import SortableHandle from '../../sortable-hoc/sortableHandle';
import {arrayMove} from '../../sortable-hoc/utils';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import IconButton from 'material-ui/IconButton'; 
import { Project, Area } from '../../database';
import NewAreaIcon from 'material-ui/svg-icons/maps/layers';
import { stringToLength, chooseIcon } from '../../utils';
import { SortableList } from '../SortableList';

   
export let getAreaLink = (iconSize, a:Area, index:number, dispatch:Function) : JSX.Element => {
 
    return <div key={`${a._id}-${index}`} style={{position:"relative", padding:"5px"}}>  
        <div    
            className="toggleFocus"   
            onClick = {() => {
                dispatch({type:"selectedCategory", load:"area"});
                dispatch({type:"selectedAreaId", load:a._id});
            }}   
            id = {a._id}        
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
            {chooseIcon({width:"20px", height:"20px"}, "area")} 
                
            <div      
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
            
                { a.name.length===0 ? "New Area" : stringToLength(a.name,18) }   

            </div>   
        </div> 
    </div> 
}
 
