import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';   
import { ipcRenderer } from 'electron'; 
import IconButton from 'material-ui/IconButton';  
import { Component } from "react";  
import { Provider, connect } from "react-redux";
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
    byTags,
    isNotEmpty,
    different
} from '../../utils/utils'; 
import { Category, ChecklistItem, Todo, ObjectType, Area, Project, Heading, Store } from '../../types';
import { 
    reject, allPass, isNil, not, isEmpty, contains, flatten, prop, identity,
    compose, any, intersection, defaultTo, all, evolve, map, ifElse 
} from 'ramda';
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
import { getProjectHeading } from '../Search/getProjectHeading';
import { sortByCompletedOrNot } from '../Search/sortByCompletedOrNot';
import { getSuggestions } from '../Search/getSuggestions';

interface TagProps extends Store{}
interface TagState{}

@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)
export class Tag extends Component<TagProps,TagState>{ 

    constructor(props){ super(props); }    



    scrollTop = () => {
        let rootRef = document.getElementById("maincontainer");
        if(rootRef){ rootRef.scrollTop=0 }   
    }



    componentDidMount(){ this.scrollTop() }


    
    getTodoComponent = (todo:Todo,index:number) : JSX.Element => {
        return <div key={`todo-${index}`}>
            <TodoInput        
                id={todo._id} 
                key={todo._id} 
                moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                scrolledTodo={this.props.scrolledTodo}
                groupTodos={this.props.groupTodos}
                projects={this.props.projects}  
                dispatch={this.props.dispatch}  
                selectedProjectId={this.props.selectedProjectId}
                selectedAreaId={this.props.selectedAreaId} 
                selectedCategory={this.props.selectedCategory} 
                rootRef={document.getElementById("maincontainer")}  
                todo={todo} 
            />   
        </div>
    };



    render(){
        let {todos, projects, areas, dispatch, selectedTags, groupTodos, selectedCategory} = this.props;  
        let items = todos
        .sort((a:Todo,b:Todo) => a.priority-b.priority)
        .sort(sortByCompletedOrNot)
        .filter(byTags(selectedTags));



        return <div id={`${selectedCategory}-list`}>   
            <div style={{display:"flex", position:"relative", alignItems:"center", marginBottom:"20px"}}>   
                <div style={{zoom:"0.8", display:"flex", alignItems:"center"}}>
                    {chooseIcon({width:"45px", height:"45px"}, selectedCategory)}
                </div> 
                <div style={{  
                    fontFamily:"sans-serif",   
                    fontSize:"xx-large",
                    whiteSpace:"nowrap",
                    overflowX:"hidden",
                    fontWeight:600,
                    paddingLeft:"10px", 
                    cursor:"default" 
                }}>   
                    {selectedTags[0]} 
                </div>  
            </div> 
            {items.map(this.getTodoComponent)}
            {
            /*
            <div className="no-print" style={{paddingTop:"15px", paddingBottom:"15px"}}>
                <Tags  
                    selectTags={tags => dispatch({type:"selectedTags", load:tags})}
                    tags={tags} 
                    selectedTags={selectedTags}
                    show={true}  
                />  
            </div>
            */
            } 
        </div>  
    }
}

