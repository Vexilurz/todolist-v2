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
    byTags,
    isNotEmpty
} from '../../utils/utils'; 
import { Category, ChecklistItem, Todo, ObjectType, Area, Project, Heading, Store } from '../../types';
import { 
    allPass, isNil, not, isEmpty, contains, flatten, prop, 
    compose, any, intersection, defaultTo, all
} from 'ramda';
import { filter } from 'lodash/fp'; 
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import PieChart from 'react-minimal-pie-chart';
import { TodoInput } from './../TodoInput/TodoInput';
import { Tags } from './../Tags';
import { isArray, isString, isDate, isNotDate, isHeading, isNotNil } from '../../utils/isSomething';
import { chooseIcon } from '../../utils/chooseIcon';
import { FadeBackgroundIcon } from './../FadeBackgroundIcon';
import { isDev } from '../../utils/isDev';
import { assert } from '../../utils/assert';
import { groupByProject } from '../project/groupByProject';
import { sortByCompletedOrNot } from './sortByCompletedOrNot';
import { getProjectHeading } from './getProjectHeading';
import { limitGroups } from './limitGroups';
import { groupProjectsByArea } from '../Area/groupProjectsByArea';
import { getNotePlainText, getNotePlainTextFromRaw } from '../../utils/draftUtils';
import { stringToKeywords } from './stringToKeywords';
import { todoToKeywords } from './todoToKeywords';
import { cutBy } from './cutBy';




export let match = (searchKeywords:string[],keywords:string[]) => 
        any(
            (searchKeyword:string) => contains(searchKeyword)(cutBy(searchKeyword)(keywords))
        )(searchKeywords); 


const categories = ["inbox", "today", "upcoming", "next", "someday", "logbook", "trash"];



let projectToKeywords = table => (p:Project) : string[] => {
    let todos = table[p._id];
    if(isNil(todos)){ return [] }

    let keywords = flatten(todos.map(todoToKeywords));
    let headings = p.layout.filter(isHeading) as Heading[];
    let description = getNotePlainTextFromRaw(p.description);

    keywords.push( ...stringToKeywords(p.name) );
    keywords.push( ...stringToKeywords(description) );
    keywords.push( ...flatten( headings.map((h => stringToKeywords(h.title))) ) );
    
    if(isDate(p.completed)){  keywords.push(p.completed.toJSON()); }
    if(isDate(p.deadline)){  keywords.push(p.deadline.toJSON()); }
    if(isDate(p.deleted)){  keywords.push(p.deleted.toJSON()); }

    if(isDev()){
        assert(
           all(isString,keywords), 
           `not all keywords are of type string. projectToKeywords. ${JSON.stringify(keywords)}`
        )
    }

    return keywords;
};



let areaToKeywords = tableWithTodos => tableWithProjects => (a:Area) : string[] => {
    let projects = tableWithProjects[a._id];
    if(isNil(projects)){ return [] }

    let todos = flatten( projects.map( p => tableWithTodos[p._id] ) );

    let keywords = [];

    keywords.push( ...flatten( todos.map( todoToKeywords ) ) );
    keywords.push( ...flatten( projects.map( projectToKeywords(tableWithTodos) ) ) );
    keywords.push( ...stringToKeywords(a.name) )
    keywords.push( ...stringToKeywords(a.description) )

    
    if(isDate(a.deleted)){  keywords.push(a.deleted.toJSON()); }


    if(isDev()){
        assert(
           all(isString,keywords), 
           `not all keywords are of type string. areaToKeyWords. ${JSON.stringify(keywords)}`
        )
    }

    return keywords;
};



let tagToKeywords = (t:string) : string[] => {
    return stringToKeywords(t);
};



let categoryToKeywords = (c:Category) : string[] => {
    return [c];
};



export let todoMatch = (searchQuery:string) => (todo:Todo) : boolean => {
    //let keywords = compose(cutBy(searchQuery),todoToKeywords)(todo);
    let keywords = todoToKeywords(todo);
    
    return match(stringToKeywords(searchQuery),keywords);
    //contains(searchQuery)(keywords);
};



let tagMatch = (searchQuery:string) => (tag:string) : boolean => {
    //let keywords = compose(cutBy(searchQuery),tagToKeywords)(tag);
    let keywords = tagToKeywords(tag);
    
    return match(stringToKeywords(searchQuery),keywords);
    //return contains(searchQuery)(keywords);
};



let projectMatch = (searchQuery:string,tableWithTodos) => 
    (project:Project) : boolean => {
        let toKeywords = projectToKeywords(tableWithTodos);
        //let keywords = compose(cutBy(searchQuery),toKeywords)(project);
        let keywords = toKeywords(project);
        
        return match(stringToKeywords(searchQuery),keywords);
        //return contains(searchQuery)(keywords);
    };



let areaMatch = (searchQuery:string,tableWithTodos,tableWithProjects) => 
    (area:Area) : boolean => {
        let toKeywords = areaToKeywords(tableWithTodos)(tableWithProjects);
        //let keywords = compose(cutBy(searchQuery),toKeywords)(area);
        let keywords = toKeywords(area);
        
        return match(stringToKeywords(searchQuery),keywords);
        //return contains(searchQuery)(keywords);
    };



let categoryMatch = (searchQuery:string) => (category:Category) : boolean => {
    //let keywords = compose(cutBy(searchQuery),categoryToKeywords)(category);
    let keywords = categoryToKeywords(category);
    
    return match(stringToKeywords(searchQuery),keywords);
    //return contains(searchQuery)(keywords);
};



let takeObjectsWhile = (condition,limit,setLimitReached) => (objects) => {
    let result = [];

    for(let i=0; i<objects.length; i++){
        let target = objects[i];
        if(condition(target)){
           result.push(target); 
        }

        if(result.length>=limit){ 
            setLimitReached(false);
            return result; 
        }
    }

    setLimitReached(true);
    return result;
};



export let getQuickFindSuggestions = (
    todos:Todo[], 
    projects:Project[], 
    areas:Area[],
    tags:string[],
    searchQuery:string,
    limit:number
) : {
    areas:Area[],
    projects:Project[],
    todos:Todo[],
    tags:string[],
    categories:Category[],
    byProject:any,
    byArea:any,
    limitReached:boolean
} => {  
    let sortedTags = tags.sort((a:string,b:string) : number => a.localeCompare(b));
    let sortedCategories = categories.sort((a:string,b:string) : number => a.localeCompare(b));
    let selectedTodos = compose(
        todos => todos.sort((a:Todo,b:Todo) => a.priority-b.priority),    
        todos => limitGroups(3,todos)
    )(todos);  
    
    let byProject = groupByProject(projects)(selectedTodos);
    let byArea = groupProjectsByArea(projects,areas);
    let limitReached = true;
    let setLimitReached = reached => { limitReached=(limitReached && reached) }; 

    let am = areaMatch(searchQuery,byProject,byArea.table);
    let pm = projectMatch(searchQuery,byProject);
    let tm = todoMatch(searchQuery);
    let tagm = tagMatch(searchQuery);
    let cm = categoryMatch(searchQuery);

    let result = {
        areas:takeObjectsWhile(am,limit,setLimitReached)(areas),
        projects:takeObjectsWhile(pm,limit,setLimitReached)(projects),
        todos:takeObjectsWhile(tm,limit,setLimitReached)(selectedTodos), 
        tags:takeObjectsWhile(tagm,limit,setLimitReached)(sortedTags),  
        categories:takeObjectsWhile(cm,limit,setLimitReached)(sortedCategories), 
        byProject,
        byArea
    };

    return {...result, limitReached};
};   



