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
import { isNil, all, map, isEmpty, not, reduce, fromPairs, ifElse, compose } from 'ramda'; 
import { isArea, isString, isProject, isTodo } from '../utils/isSomething';
import { 
    Calendar, ChecklistItem, Category, RawDraftContentState, 
    RepeatOptions, Todo, Project, Area, Query, Databases 
} from '../types';
import { isDev } from '../utils/isDev';
import { singleItem } from '../utils/singleItem';
const Promise = require('bluebird');
const path = require('path');


export let destroy = (databases:any[]) => Promise.all(databases.map(db => db.destroy()));



let queryToObjects = (query:Query<any>) => query.rows.map(row => row.doc); 



let getItems = (onError:Function, db:any) => db.allDocs({include_docs:true}).catch(onError);



export let getDatabaseObjects = (onError:Function, databases:any[]) : Promise<Databases> => 
    Promise.map( 
        databases.map( db => () => getItems(onError, db).then(queryToObjects).then( items => [db.name,items] ) ),
        (f) => f(), 
        {concurrency: 1}
    ) 
    .then(fromPairs);


let updateItemInDatabase = (onError:Function, db:any) => {
    let count = 0;  

    let update = function(changed:any) : Promise<any>{
        return db.get(changed._id)
                .then((doc) => {   
                    if(isNil(doc) || isEmpty(doc)){ 
                        return new Promise(resolve => resolve(changed));
                    }else{
                        changed["_rev"] = doc["_rev"];
                        return db.put({...doc,...changed});  
                    }
                })
                .catch((err) => {
                    if(err.status===409 && count<5){
                        console.log(`409 retry`);
                        count++;
                        return update(changed);
                    }else {  
                        //onError(err);
                        return new Promise( resolve => resolve([]) )
                    } 
                }); 
    }; 
    
    return update;
};



export let setItemsToDatabase = (onError:Function, db:any) => 
        (items:any[]) : Promise<void> => db.bulkDocs(items).catch(onError); 
   
  

let getItemFromDatabase = (onError:Function, db:any) =>
    (_id:string) : Promise<any> => db.get(_id).catch(onError);
 


let setItemToDatabase = (onError:Function, db:any) => 
    (item:any) : Promise<void> => db.put(item).catch(onError);



let updateItemsInDatabase = (onError:Function, db:any) => {

    return (values:any[]) : Promise<any[]> => {
        let count = 0;

        let update = (values) : Promise<any[]> => {
            let items = values.filter(v => v);

            return db 
                .allDocs({ 
                    include_docs:true,  
                    //descending:true,
                    keys:items.map((item) => item["_id"])
                })    
                .then( (query:Query<any>) => queryToObjects(query) )
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
                    
                    return db.bulkDocs(items).catch(onError); 
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



let mapDatabaseItems = (withOne:Function, withMany:Function) => (db:any, onError:Function) => 
    ifElse(
        singleItem, 
        (items:any[]) => withOne(onError, db)(items[0]),
        (items:any[]) => withMany(onError, db)(items)
    ); 



export let addItems =  mapDatabaseItems(setItemToDatabase,setItemsToDatabase);



export let updateItems = mapDatabaseItems(updateItemInDatabase, updateItemsInDatabase);  



export let removeItems = (db:any, onError:Function) => 
            compose(
                updateItems(db, onError), 
                map(item => ({...item,_deleted: true}))
            );



 








  






  

 