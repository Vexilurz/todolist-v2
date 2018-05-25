import { reducer } from '../../../app/reducer';
import { evolve, not, mapObjIndexed, compose, values, equals, isNil, isEmpty, range, mergeAll, map } from 'ramda';
import { defaultConfig } from '../../../app/defaultConfig';
import { randomArrayMember, randomWord, randomDate, randomInteger } from '../../../randomDatabase/utils';
import { action, Config } from '../../../app/types';
import { defaultStoreItems } from './../../../app/defaultStoreItems';
import { requestFromMain } from '../../../app/utils/requestFromMain';
import { stateReducer } from '../../../app/stateReducer';
import { objectsReducer } from '../../../app/objectsReducer';
import { sleep } from '../../../app/utils/sleep';
import { fakeCalendar } from '../../../randomDatabase/fakeCalendar';
import { updateDatabase } from '../../../app/database/updateDatabase';
const chai = require('chai');
let assert = require('chai').assert;
let expect = require('chai').expect;
import { generateRandomDatabase } from "../../../randomDatabase/generateRandomDatabase";
import { getItemsFromDatabase } from '../../../app/database/databaseUtils';
const PouchDB = require('pouchdb-browser').default;


Date.prototype["addDays"] = function(days){
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat; 
}; 



describe(
    'updateDatabase', 
    () => {  
        it(    
            ``,
            function(){ 
                this.timeout(0);
                let applicationReducer = reducer(
                    [stateReducer, objectsReducer], 
                    config =>  new Promise(resolve => resolve({...config}))
                );
                let fc = () => fakeCalendar({
                    NsameDay:randomInteger(10) + 1,
                    NfullDay:randomInteger(10) + 1,
                    NmultipleDays:randomInteger(10) + 1,
                    Nrecurrent:randomInteger(5) + 1,
                }); 
                let opt = { todos:50, projects:5, areas:2 };
                let data = { calendars:range(0,10).map(() => fc()), ...generateRandomDatabase(opt, 0) };
                let { todos, projects, areas, calendars } = data;
                let store = applicationReducer(defaultStoreItems,{
                    type:"multiple",
                    load:[
                        {type:"setProjects", load:projects},
                        {type:"setAreas", load:areas},
                        {type:"setTodos", load:todos},
                        {type:"setCalendars", load:calendars}
                    ]
                });
                let dataNext = { 
                    calendars:range(0,10).map(() => fc()), 
                    ...generateRandomDatabase({ todos:100, projects:35, areas:2 }, 0) 
                };
                let result = compose(
                    s => applicationReducer(s,{
                        type:"multiple",
                        load:[
                            {type:"addTodos",load:dataNext.todos},
                            {type:"addProjects",load:dataNext.projects},   
                            {type:"addAreas",load:dataNext.areas},      
                            {type:"addCalendars",load:dataNext.calendars}   
                        ]
                    }), 
                    s => applicationReducer(s, {type:"erase", load:undefined}) 
                )(store); 
                let removeRev = (item) => {
                    delete item["_rev"];
                    item["_rev"] = undefined;
                    return item;
                };
                let todos_db = new PouchDB('todos',{auto_compaction: true});
                let projects_db = new PouchDB('projects',{auto_compaction: true});
                let areas_db = new PouchDB('areas',{auto_compaction: true}); 
                let databases = [todos_db,projects_db,areas_db];

                return Promise.all(
                databases.map(
                    db => getItemsFromDatabase(e => { throw new Error(e) }, db).then(r => ({[db.name]:r})) 
                )
                )
                .then(items => mergeAll(items))
                .then(evolve({todos:map(removeRev),areas:map(removeRev),projects:map(removeRev)}))
                .then(
                    result => {
                        let r = equals(result.todos,dataNext.todos);

                        if(!r){
                            debugger;
                        }

                        expect(dataNext.todos,'should be the same in database').to.deep.equal(result.todos);
                    }
                ) 
            } 
        );
    }
); 