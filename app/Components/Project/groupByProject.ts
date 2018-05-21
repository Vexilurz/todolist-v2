import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react";  
import { 
    attachDispatchToProps, byTags, byNotCompleted, byNotDeleted, byCategory, 
    getTagsFromItems, attachEmptyTodo, log
} from "../../utils/utils";  
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { Todo, Project, Area, LayoutItem, Category, Item, Store } from '../../types';
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
import { 
    uniq, allPass, isEmpty, isNil, not, any, contains, all, applyTo,
    compose, groupBy, cond, defaultTo, reject, flatten, map 
} from 'ramda';
import { filter } from 'lodash'; 
import { generateId } from '../../utils/generateId';
import { generateEmptyTodo } from '../../utils/generateEmptyTodo';
import { isString, isDate, isProject, isNotArray } from '../../utils/isSomething';
import { isDev } from '../../utils/isDev';
import { assert } from '../../utils/assert';


export let groupByProject = (projects:Project[]) => (todos:Todo[]) => compose(
    applyTo(todos),
    groupBy,
    cond,
    projects => [
        ...projects.map(
            (project:Project) : [(todo:Todo) => boolean,(todo:Todo) => string] => [
               (todo:Todo) : boolean => contains(todo._id)(project.layout),
               (todo:Todo) : string => project._id
            ]
        ),
        [() => true, () => `detached`]
    ]
)(projects);