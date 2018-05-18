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
import { sortByCompletedOrNot } from './sortByCompletedOrNot';
import { getProjectHeading } from './getProjectHeading';
import { limitGroups } from './limitGroups';



export let getSuggestions = (
    todos:Todo[], 
    projects:Project[], 
    areas:Area[],
    searchQuery:string,
    limit:number
) : {
    attached : { project:Project, todos:Todo[] }[],
    detached : Todo[],
    limitReached : boolean 
} => { 
    let limitedGroups = limitGroups(3, todos);  
    let cutBy = (by:String, words:string[]) => words.map(word => word.substring(0,by.length));
    let table = {};
    let detached = []; 
    let attached = []; 
    let limitReached = true;
    let match = (searchKeywords:string[],keywords:string[]) => 
        any(
            (searchKeyword:string) => contains(searchKeyword)(cutBy(searchKeyword,keywords))
        )(searchKeywords); 

    for(let i=0; i<limitedGroups.length; i++){

        if((attached.length + detached.length) > limit){ 
            limitReached = false;
            break; 
        }
    
        let todo = limitedGroups[i];
        let keywords = todoToKeywords(todo); //lowered and trimmed words from todo title + attachedTags
        let searchKeywords = searchQuery
                             .trim()
                             .toLowerCase()
                             .split(' ')
                             .filter(compose(not,isEmpty)); 
        
        if(match( searchKeywords , keywords )){
            let project = projects.find((p) => contains(todo._id)(p.layout as any)); 

            if(isNil(project)){ detached.push(todo) }
            else{ 
                attached.push(todo);

                if(isNil(table[project._id])){
                   table[project._id] = [todo]; 
                }else if(isArray(table[project._id])){ 
                   table[project._id].push(todo); 
                }  
            }
        } 
    }

    return {    
        attached:projects
                .map((project:Project) => ({project, todos:table[project._id]}))
                .filter(({project,todos}) => isNil(todos) ? false : !isEmpty(todos)),
        detached,
        limitReached   
    }; 
};   



