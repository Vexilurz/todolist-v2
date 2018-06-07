Date.prototype["addDays"] = function(days){
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat; 
}; 
import { 
    getDatabaseObjects, addItems, removeItems, updateItems, setItemsToDatabase 
} from './databaseUtils';
import { singleItem } from './../utils/singleItem'; 
import { sleep } from './../utils/sleep'; 
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { 
    action, Query, Databases, Changes, DatabaseChanges, PouchChanges, actionStartSync, 
    actionStopSync, actionChanges, actionLoadDatabase, actionSetDatabase, actionSetKey 
} from './../types';
import { host } from './../utils/couchHost';
import { userNameToDatabaseName } from './../utils/userNameToDatabaseName';
import { 
    cond, compose, equals, prop, isEmpty, when, fromPairs, 
    isNil, forEachObjIndexed, toPairs, evolve, ifElse, last, 
    map, mapObjIndexed, values, flatten, path, pick, identity,
    complement 
} from 'ramda';
import { isDev } from '../utils/isDev';
import { encryptDoc, decryptDoc } from '../utils/crypto/crypto';
import { onError } from './onError'; 

let window : any = self;

const typeEquals = (type:string) => compose(equals(type), prop(`type`)); //TODO move to utils
let isNotNil = complement(isNil); //TODO move to utils
let isString = (item) : boolean => typeof item==="string"; //TODO move to utils 

const Promise = require('bluebird');
const PouchDB = require('pouchdb-browser').default;


export let init = () : any[] => {
    let todos_db = new PouchDB('todos',{auto_compaction:true, revs_limit:1});
    let projects_db = new PouchDB('projects',{auto_compaction:true, revs_limit:1});
    let areas_db = new PouchDB('areas',{auto_compaction:true, revs_limit:1}); 
    let calendars_db = new PouchDB('calendars',{auto_compaction:true, revs_limit:1}); 
    return [todos_db, projects_db, areas_db, calendars_db];
};