Date.prototype["addDays"] = function(days){
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat; 
}; 
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
const PouchDB = require('pouchdb-browser').default;
import { convertTodoDates, measureTimePromise } from '../utils/utils';
import { 
    isNil, all, map, isEmpty, not, reduce, fromPairs, 
    ifElse, compose, evolve, when, prop, identity, defaultTo 
} from 'ramda'; 
import { isArea, isString, isProject, isTodo } from '../utils/isSomething';
import { 
    Calendar, ChecklistItem, Category, RawDraftContentState, 
    RepeatOptions, Todo, Project, Area, Query, Databases 
} from '../types';
import { isDev } from '../utils/isDev';
import { singleItem } from '../utils/singleItem';
import { encryptData, decryptData, decryptDoc, encryptDoc } from '../utils/crypto/crypto';
import { sleep } from '../utils/sleep';
const Promise = require('bluebird');
const path = require('path');


export let destroy = (databases:any[]) => Promise.all(databases.map(db => db.destroy()));



let queryToObjects = (query:Query<any>) => query ? query.rows.map(row => row.doc) : []; 


   
//get one
let getItemFromDatabase = (onError:Function, db:any, key:string) =>
    (_id:string) : Promise<any> => {
        let decrypt = decryptDoc(db.name,key);
        return db.get(_id).then(doc => decrypt(doc)).catch(onError);
    };
 


//set one    
let setItemToDatabase = (onError:Function, db:any, key:string) => 
    (item:any) : Promise<void> => {
        let doc = encryptDoc(db.name,key)(item);
        return db.put(doc).catch(onError);
    };



//update one    
let updateItemInDatabase = (onError:Function, db:any, key:string) => {
    let count = 0;  

    let update = function(changed:any) : Promise<any>{
        return getItemFromDatabase(onError,db,key)(changed._id)
                .then(
                    (doc) => {   
                        if(isNil(doc) || isEmpty(doc)){ 
                           return new Promise(resolve => resolve(changed));
                        }else{
                           changed["_rev"] = doc["_rev"];
                           return setItemToDatabase(onError,db,key)({...doc,...changed});  
                        }
                    }
                )
                .catch((err) => {
                    if(err.status===409 && count<5){
                        console.log(`409 retry`);
                        count++;
                        return update(changed);
                    }else{  
                        onError(err);
                        return new Promise( resolve => resolve([]) )
                    } 
                }); 
    }; 
    
    return update;
};



//get all
let getItemsFromDatabase = (onError:Function, db:any, key:string, opt?:any) => {
    let options = defaultTo({include_docs:true})(opt);
    let decrypt = map(decryptDoc(db.name,key));
    return db.allDocs(options).then(queryToObjects).then(docs => decrypt(docs)).catch(onError);
};



//set many
export let setItemsToDatabase = (onError:Function, db:any, key:string) => 
    (items:any[]) : Promise<void> => {
        let docs = map( encryptDoc(db.name,key), items );
        return db.bulkDocs(docs).catch(onError); 
    };



//update many    
let updateItemsInDatabase = (onError:Function, db:any, key:string) => {

    return (values:any[]) : Promise<any[]> => {
        let count = 0;

        let update = (values) : Promise<any[]> => {
            let items = values.filter(v => v);
            let opt = { include_docs:true, keys:items.map((item) => item["_id"]) };

            return getItemsFromDatabase(onError,db,key,opt)
                .then( (result:any[]) => {
                    let itemsWithRev = result.filter(v => v);
                    let revs = {};

                    for(let i=0; i<itemsWithRev.length; i++){
                        let item = itemsWithRev[i];
                        if(!isNil(item)){
                            revs[item["_id"]] = item["_rev"];
                        }
                    }

                    for(let i=0; i<items.length; i++){
                        let item = items[i];  
                        if(!isNil(item)){
                            item[`_rev`] = revs[item["_id"]];
                        }
                    }    
                    
                    return setItemsToDatabase(onError, db, key)(items); 
                })
                .catch((err) => {
                    if(err.status===409 && count<5){
                        console.log(`409 retry`);
                        count++;
                        return update(values);
                    }else{  
                        onError(err);
                        return new Promise(resolve => resolve([]));
                    } 
                });     
        };
        
        return update(values);
    }  
};
    
    

export let getDatabaseObjects = (onError:Function, databases:any[], key:string) : Promise<Databases> => 
    Promise.map( 
        databases.map( 
            db => () => getItemsFromDatabase(onError, db, key, null)
                        .then(items => [db.name,items]) 
        ),
        (f) => f(), 
        {concurrency: 1}
    ) 
    .then(fromPairs);



type withOne = (onError:Function, db:any, key:string) => (doc:any) => Promise<any>;

type withMany = (onError:Function, db:any, key:string) => (docs:any[]) => Promise<any>;

let mapDatabaseItems = (withOne:withOne, withMany:withMany) => (db:any, onError:Function, key:string) => 
    ifElse(
        singleItem, 
        (items:any[]) => withOne(onError, db, key)(items[0]),
        (items:any[]) => withMany(onError, db, key)(items)
    ); 



export let addItems = mapDatabaseItems(setItemToDatabase,setItemsToDatabase);

export let updateItems = mapDatabaseItems(updateItemInDatabase, updateItemsInDatabase);  

export let  removeItems = (db:any, onError:Function, key:string) => 
            compose(
                updateItems(db, onError, key), 
                map(item => ({...item,_deleted: true}))
            );



 








  






  

 