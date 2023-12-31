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
    isNil, all, map, isEmpty, not, reduce, fromPairs, reject, cond, T,
    ifElse, compose, evolve, when, prop, identity, defaultTo 
} from 'ramda'; 
import { isArea, isString, isProject, isTodo } from '../utils/isSomething';
import { 
    Calendar, ChecklistItem, Category, RawDraftContentState, 
    RepeatOptions, Todo, Project, Area, Query, Databases, withOne, withMany, action 
} from '../types';
import { isDev } from '../utils/isDev';
import { singleItem } from '../utils/singleItem';
import { encryptData, decryptData, decryptDoc, encryptDoc } from '../utils/crypto/crypto';
import { sleep } from '../utils/sleep';
import { onError } from './onError';
const Promise = require('bluebird');
const path = require('path');
let window : any = self;
const sendMessage = postMessage as (action:action) => void;

let queryToObjects = (query:Query<any>) => query ? query.rows.map(row => row.doc) : []; 
let removeRev = (item) => {
    delete item["_rev"];
    item["_rev"] = undefined;
    return item;
};

let remRev = compose(map(removeRev), defaultTo([])); 

 
//get all
export let getItemsFromDatabase = (onError:Function, db:any, opt?:any) => {
    let options = defaultTo({})(opt);
    let decrypt = decryptDoc(db.name, window.key, onError);
    
    return db.allDocs({...options,include_docs:true})
             .then(query => queryToObjects(query)) 
             .then(reject(isNil))
             .then(map(decrypt))
             .catch(
                error => {
                    if(isDev()){
                       console.log(error);
                       onError(error);
                    }
                    return [];
                }
             );
};



//set many
export let setItemsToDatabase = (onError:Function, db:any) => 
    (docs:any[]) : Promise<void> => {
        let encrypt = encryptDoc(db.name, window.key, onError);
        let encrypted = map(encrypt, docs);

        return db.bulkDocs(encrypted).then(() => encrypted)
        .catch(
           error => {
                if(isDev()){
                   console.log(error,docs,encrypted);
                   onError(error);
                }
                return [];
           }
        );
    }; 

    
   
//get one
export let getItemFromDatabase = (onError:Function, db:any) =>
    (_id:string) : Promise<any> => {
        let decrypt = decryptDoc(db.name, window.key, onError);

        return db.get(_id).then(decrypt).catch(
            error => {
                
                if(isDev()){
                   console.log(error);
                   onError(error);
                }
                return null;
            }
        );
    };
 


//set one    
export let setItemToDatabase = (onError:Function, db:any) => 
    (doc:any) : Promise<void> => {
        let encrypt = encryptDoc(db.name, window.key, onError);
        let encrypted = encrypt(doc);

        return db.put(encrypted).catch(
            error => {
                if(error.status===409){
                    return updateItemInDatabase(onError,db)(encrypted);
                }else{
                    
                    if(isDev()){ 
                       console.log(error,doc,encrypted);
                       onError(error);
                    }
                    return null;
                }
            }
        );
};

    

//update one    
export let updateItemInDatabase = (onError:Function, db:any) => {
    let count = 0;  

    let update = function(changed:any) : Promise<any>{
        return getItemFromDatabase(onError,db)(changed._id)
                .then(
                    (doc) => {   
                        if(isNil(doc) || isEmpty(doc)){ 
                           return new Promise(resolve => resolve(changed));
                        }else{
                           changed["_rev"] = doc["_rev"];
                           return setItemToDatabase(onError,db)({...doc,...changed});  
                        }
                    }
                )
                .catch((err) => {
                    if(err.status===409 && count<5){
                        console.log(`409 retry`);
                        count++;
                        return update(changed);
                    }else{  
                        if(isDev()){
                           onError(err);
                        }
                        return new Promise( resolve => resolve([]) )
                    } 
                }); 
    }; 
    
    return update;
};



//update many    
export let updateItemsInDatabase = (onError:Function, db:any) => {

    return (values:any[]) : Promise<any[]> => {
        let count = 0;

        let update = (values) : Promise<any[]> => {
            let items = values.filter(v => v);
            let opt = { keys:items.map((item) => item["_id"]) };

            return getItemsFromDatabase(onError,db,opt)
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
                    
                    return setItemsToDatabase(onError, db)(items); 
                })
                .catch((err) => {
                    if(err.status===409 && count<5){
                        console.log(`409 retry`);
                        count++;
                        return update(values);
                    }else{  
                        if(isDev()){
                           onError(err);
                        }
                        return new Promise(resolve => resolve([]));
                    } 
                });     
        };
        
        return update(values);
    }  
};
     
     

export let getDatabaseObjects = (onError:Function, databases:any[]) : Promise<Databases> => 
    Promise.map( 
        databases.map( 
            db => () => getItemsFromDatabase(onError, db).then(items => [db.name,items]) 
        ), 
        f => f(), 
        {concurrency: 1}
    ) 
    .then(fromPairs);



let mapDatabaseItems = (withOne:withOne, withMany:withMany) => (db:any, onError:Function) => 
    cond([
        [
            isEmpty, 
            () => {
                let p = Promise.resolve();
                return p.then( () => { return [] });
            }
        ], 
        [
            singleItem, (items:any[]) => withOne(onError, db)(items[0])
        ],
        [
            T, (items:any[]) => withMany(onError, db)(items) 
        ]
    ]); 

  

export let addItems = mapDatabaseItems(setItemToDatabase,setItemsToDatabase);



export let updateItems = mapDatabaseItems(updateItemInDatabase, updateItemsInDatabase);  


 
export let removeItems = (db, onError:Function) => items => {
    return compose(
        updateItems(db, onError), 
        map(item => ({...item,_deleted: true}))
    )(items);
};



 








  






  

 