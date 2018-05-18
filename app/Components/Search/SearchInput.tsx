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
    todoToKeywords,
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



interface SearchInputProps{
    dispatch:Function,
    searchQuery:string  
}  


interface SearchInputState{}  
 

export class SearchInput extends Component<SearchInputProps,SearchInputState>{
 
    shouldComponentUpdate(nextProps:SearchInputProps){
        return nextProps.searchQuery!==this.props.searchQuery;
    }


    constructor(props){ 
        super(props)
    } 


    onChange = (e) => { 
        let {dispatch} = this.props; 
        
        if(isEmpty(e.target.value)){
            dispatch({
                type:"multiple",
                load:[
                    {type:"searchQuery", load:""}, 
                    {type:"selectedCategory", load:"inbox"}
                ]
            }); 
        }else{ 
            dispatch({
                type:"multiple",
                load:[
                    {type:"searchQuery", load:e.target.value},
                    {type:"selectedCategory", load:"search"}
                ]
            }); 
        }       
    }
      
    
    render(){  
        return <div 
            style={{   
                zIndex:30000,
                backgroundColor:"rgb(248, 248, 248)",
                borderRadius:"5px",
                position:"relative",
                WebkitUserSelect:"none",  
                maxHeight:"30px",
                overflowY:"visible"
            }}  
        >       
            <div style={{
                backgroundColor:"rgb(217, 218, 221)", 
                borderRadius:"5px",
                display:"flex",
                height:"30px",  
                alignItems:"center"
            }}>  
                <div style={{padding:"5px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <SearchIcon style={{color:"rgb(100, 100, 100)",height:"20px",width:"20px"}}/>   
                </div>   
                <input 
                    style={{  
                      outline:"none",
                      border:"none", 
                      width:"100%", 
                      backgroundColor:"rgb(217,218,221)",
                      caretColor:"cornflowerblue"  
                    }} 
                    placeholder="Quick Find" 
                    type="text" 
                    name="search"  
                    value={this.props.searchQuery} 
                    onChange={this.onChange}
                />
            </div>   
        </div>
    }
}
