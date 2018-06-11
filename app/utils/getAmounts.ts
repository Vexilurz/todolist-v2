import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import { Component } from "react";  
import { ipcRenderer } from 'electron';
import { 
    attachDispatchToProps, convertTodoDates, convertProjectDates, convertAreaDates, 
    initDate, measureTimePromise,  onErrorWindow, log, typeEquals, generateEmptyProject, generateEmptyArea, isNotEmpty 
} from "../utils/utils";  
import { wrapMuiThemeLight } from '../utils/wrapMuiThemeLight'; 
import { isNotNil, isString } from '../utils/isSomething';
import { createStore } from "redux"; 
import { Provider, connect } from "react-redux";
import { LeftPanelMenu } from '../Components/LeftPanelMenu/LeftPanelMenu';
import { MainContainer } from '../Components/MainContainer'; 
import { filter } from 'lodash';
import { 
    Project, Todo, Calendar, Config, Store, Indicators, action, 
    PouchChanges, PouchError, PouchChange, DatabaseChanges, Area, actionStartSync, actionSetKey 
} from '../types';
import { 
    isNil, map, when, evolve, prop, isEmpty, path, 
    compose, ifElse, mapObjIndexed, reject, values, allPass,
    cond, identity, any, defaultTo, fromPairs, anyPass 
} from 'ramda';
import { Observable, Subscription } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
export const pouchWorker = new Worker('pouchWorker.js');
const remote = require('electron').remote;
const session = remote.session;
import axios from 'axios';
import { getFilters } from './getFilters';
import { generateAmounts } from './generateAmounts';



export let getAmounts = (props:Store) : { 
    inbox:number,
    today:number,
    hot:number,
    next:number,
    someday:number,
    logbook:number,
    trash:number
} => {
    let filters : {
        inbox:((todo:Todo) => boolean)[],
        today:((todo:Todo) => boolean)[], 
        hot:((todo:Todo) => boolean)[],
        next:((todo:Todo) => boolean)[],
        someday:((todo:Todo) => boolean)[],
        upcoming:((todo:Todo) => boolean)[],
        logbook:((todo:Todo) => boolean)[],
        trash:((todo:Todo) => boolean)[]
    } = getFilters(props.projects);

    let amounts = generateAmounts(props.todos, filters);

    return amounts;
};