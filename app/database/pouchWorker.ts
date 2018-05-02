import { singleItem } from './../utils/singleItem';
Date.prototype["addDays"] = function(days){
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat; 
}; 
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { action, Query, Databases, Changes, DatabaseChanges, PouchChanges } from './../types';
import { host } from './../utils/couchHost';
import { userNameToDatabaseName } from './../utils/userNameToDatabaseName';
import { 
    cond, compose, equals, prop, isEmpty, when, fromPairs, 
    isNil, forEachObjIndexed, toPairs, evolve, ifElse, last, 
    map, mapObjIndexed, values, flatten, path 
} from 'ramda';
const sendMessage = postMessage as (action:action) => void;
const Promise = require('bluebird');
const PouchDB = require('pouchdb-browser').default;

let todos_db = new PouchDB('todos');
let projects_db = new PouchDB('projects');
let areas_db = new PouchDB('areas'); 
let calendars_db = new PouchDB('calendars'); 

let databases = [todos_db, projects_db, areas_db, calendars_db];

let onError = (error) => sendMessage({type:'error', load:`pouch error ${JSON.stringify(error)}`});
let list = [];



let typeEquals = (type:string) => compose(equals(type), prop(`type`))



let destroy = () => Promise.all(databases.map(db => db.destroy()));



let init = () => {
    todos_db = new PouchDB('todos');
    projects_db = new PouchDB('projects');
    areas_db = new PouchDB('areas'); 
    calendars_db = new PouchDB('calendars'); 

    databases = [todos_db, projects_db, areas_db, calendars_db];

    return databases;
};
 
 

let queryToObjects = (query:Query<any>) => query.rows.map(row => row.doc); 



let getItems = (onError:Function, db:any) => db.allDocs({include_docs:true}).catch(onError);



let getDatabaseObjects = () : Promise<Databases> => 
    Promise.map( 
        databases.map( db => () => getItems(onError, db).then(queryToObjects).then( items => [db.name,items] ) ),
        (f) => f(), 
        {concurrency: 1}
    ) 
    .then(fromPairs);
     


let loadDatabase = (action:action) : Promise<Databases> => {
    sendMessage({type:'log', load:`pouch log loadDatabase`});
    
    return getDatabaseObjects();
};   





let startDatabaseSync = (username:string) => (database:any) => {
    let name : string = database.name;
    let dbCouchName = userNameToDatabaseName(username)(name); 
    let url = `${host}/${dbCouchName}`;
    let opt = { skip_setup: true,  /*ajax: { headers: {}, withCredentials: false }*/ };
    let remoteDB : any = new PouchDB(url, opt);  
    let sync = database.sync(remoteDB, {live: true,retry: true}); 

    sync.on('change',onChangeHandler(name));
    sync.on('denied',onDeniedHandler(name));
    sync.on('error',onErrorHandler(name));
    sync.on('completed',onErrorHandler(name));  
      
    return sync;
};
 


let onChangeHandler = (dbName:string) => (info:PouchChanges) => {
    sendMessage({type:'log', load:`pouchSync change ${dbName} - ${path(["change","docs","length"])(info)}`});

    if(info && prop('direction')(info)==="pull"){
       sendMessage({ type:'changes', load:{ dbname:dbName, changes:info } });
    }
};



let onDeniedHandler = (dbName:string) =>  (err) => {
    sendMessage({type:'log', load:`pouchSync denied ${JSON.stringify(err)}`});
};



let onErrorHandler = (dbName:string) =>  (err) => {
    sendMessage({type:'error', load:err});
};
 


let startSync = (action:action) : Promise<void> => {
    list = list.filter(s => !s.canceled);

    if(!isEmpty(list)){ return new Promise(resolve => resolve(null)); }

    sendMessage({type:'log', load:`pouch log startSync ${JSON.stringify(action)}`});

    let username = action.load;
    let start = startDatabaseSync(username);
    list = databases.map( db => start(db) );
 
    return new Promise( resolve => resolve(null) );
};



let stopSync = (action:action) : Promise<any[]> => { 

    sendMessage({type:'log', load:`pouch log stopSync ${JSON.stringify(action)}`});

    return Promise.all(
        list.map(
            s => new Promise( 
                resolve => { 
                    if(s.canceled){ resolve(true) }

                    Observable
                    .fromEvent(s, 'complete', (event) => event)
                    .first()
                    .subscribe(complete => resolve(complete));

                    s.cancel(); 
                } 
            )
        )
    ).then(
        events => {
            list = []; 
            return events;
        }
    );  
};



let setItemsToDatabase = (onError:Function, db:any) => 
    (items:any[]) : Promise<void> => db.bulkDocs(items).catch(onError); 
   
  

let setDatabase = (action:action) : Promise<void> => 
    stopSync({type:'stopSync',load:null})  
    .then(() => destroy())
    .then(() => init())
    .then((databases) => Promise.all( databases.map( db => setItemsToDatabase(onError, db)(action.load[db.name])) ));



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
                        //onError(err);
                        return new Promise(resolve => resolve([]));
                    } 
                });     
        };
        
        return update(values);
    }  
};



let mapDatabaseItems = (withOne:Function, withMany:Function) => (dbname:string) => 
    ifElse(
        singleItem, 
        (items:any[]) => {
            let item = items[0];
            let db = databases.find( d => d.name===dbname );
            return withOne(onError, db)(item); 
        },
        (items:any[]) => {
            let db = databases.find( d => d.name===dbname );
            return withMany(onError, db)(items); 
        }
    ); 


let addItems = mapDatabaseItems(setItemToDatabase,setItemsToDatabase);
let updateItems = mapDatabaseItems(updateItemInDatabase,updateItemsInDatabase);  
let removeItems = dbname => compose(updateItems(dbname), map(item => ({...item,_deleted: true})));


let applyChanges = (action:action) : Promise<void> => {
    sendMessage({type:'log', load:`pouch log applyChanges ${action.type}`});

    let changes : Changes = action.load;

    return compose(
        list => Promise.all(list),
        flatten,
        mapObjIndexed(
            (change:DatabaseChanges<any>,dbname:string) => 
                compose(
                    values,
                    evolve(
                        {
                            add:addItems(dbname),
                            remove:removeItems(dbname),
                            update:updateItems(dbname)
                        }
                    )
                )(change)
        )
    )(changes);
};


onmessage = function(e){
    sendMessage({type:'log', load:`pouch log get action - ${e.data.type}`});

    let action = e.data; 

    compose(
        p => p.then(load => sendMessage({type:action.type, load})),
        cond([
            [ typeEquals("startSync"), startSync ],
            [ typeEquals("stopSync"), stopSync ],
            [ typeEquals("changes"), applyChanges ],
            [ typeEquals("load"), loadDatabase ],
            [ typeEquals("set"),  setDatabase ],
            [ () => true, () => new Promise( resolve => resolve(null) ) ]    
        ])
    )(action) 
}



