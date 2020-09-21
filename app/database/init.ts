Date.prototype["addDays"] = function(days){
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat; 
}; 
import { compose, equals, prop, isNil, complement } from 'ramda';
let window : any = self;

const typeEquals = (type:string) => compose(equals(type), prop(`type`)); //TODO move to utils
let isNotNil = complement(isNil); //TODO move to utils
let isString = (item) : boolean => typeof item==="string"; //TODO move to utils 

const Promise = require('bluebird');
const PouchDB = require('pouchdb-browser').default;


export let init = () : any[] => {
    let todos_db = new PouchDB('todos',{auto_compaction:true}); 
    let projects_db = new PouchDB('projects',{auto_compaction:true});
    let areas_db = new PouchDB('areas',{auto_compaction:true}); 
    let calendars_db = new PouchDB('calendars',{auto_compaction:true}); 
    let license_db = new PouchDB('license',{auto_compaction:true}); 
    return [todos_db, projects_db, areas_db, calendars_db, license_db];
};  