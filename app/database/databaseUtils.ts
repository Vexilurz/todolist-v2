Date.prototype["addDays"] = function(days){
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat; 
}; 
import './assets/styles.css'; 
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
const PouchDB = require('pouchdb-browser').default;
import { convertTodoDates, measureTimePromise } from '../utils/utils';
import { isNil, all, map, isEmpty, not, reduce } from 'ramda'; 
import { isArea, isString, isProject, isTodo } from '../utils/isSomething';
import { 
    Calendar, ChecklistItem, Category, RawDraftContentState, RepeatOptions, Todo, Project, Area, Query 
} from '../types';
import { isDev } from '../utils/isDev';
const Promise = require('bluebird');
const path = require('path');






 








  






  

 