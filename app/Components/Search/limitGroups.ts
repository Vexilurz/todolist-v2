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
import { getProjectHeading } from './getProjectHeading';

/*
*
* Limit search results from Repeat groups to n items from each group.
* We sort todos by date, and then we walk through sorted todos,
* collecting items for each group until n limit is exceeded for this particular group.
*/
export let limitGroups = (n:number, todos:Todo[]) : Todo[] => {
    let table = {};
    let result = [];

    let sorted = todos.sort(
        (a:Todo,b:Todo) => {
            let A = a.attachedDate;
            let B = b.attachedDate;

            if(isNil(A) || isNil(B)){ return 0 };

            return A.getTime()-B.getTime();
        }
    ); 

    for(let i=0; i<sorted.length; i++){ 
        let todo = todos[i];

        if(isNil(todo.group)){ result.push(todo) }
        else{
            let groupId = todo.group._id;
            let entry = table[groupId];

            if(isNil(entry)){
                table[groupId] = 1;
                result.push(todo);
            }else{
                if(entry<n){  
                    table[groupId] = table[groupId] + 1; 
                    result.push(todo);   
                }
            } 
        }
    }

    return result;
}; 
