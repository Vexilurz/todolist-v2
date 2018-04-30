Date.prototype["addDays"] = function(days){
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat; 
}; 
import { action, Query, Databases } from './../types';
import { host } from './../utils/couchHost';
import { userNameToDatabaseName } from './../utils/userNameToDatabaseName';
import { cond, compose, equals, prop, isEmpty, when, fromPairs, isNil } from 'ramda';
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
     


let loadDatabase = (action:action) => {
    sendMessage({type:'log', load:`pouch log loadDatabase ${JSON.stringify(action)}`});
    
    getDatabaseObjects().then( load => sendMessage({type:'load', load}) );
};   



let dumpDatabase = (action:action) => {
    sendMessage({type:'log', load:`pouch log dumpDatabase ${JSON.stringify(action)}`});

    let path : string = action.load;

    /*getDatabaseObjects()
    .then( 
        database => requestFromMain(
            'saveDatabase', 
            [ { database }, path ], 
            (event) => event 
        )
    )
    .then(
        () => sendMessage({type:action.type, load:null})
    );*/
};



let backupDatabase = (action:action) => {
    /*getDatabaseObjects()
    .then( 
        database => requestFromMain('saveBackup', [ { database } ], (event, to) => to)
    ) 
    .then(
        (to) => sendMessage({type:action.type, load:to})
    );*/
};



let applyChanges = (action:action) => {
    sendMessage({type:'log', load:`pouch log applyChanges ${JSON.stringify(action)}`});
};



let startDatabaseSync = (username:string) => (database:any) => {
    let name : string = database.name;
    let dbCouchName = userNameToDatabaseName(username)(name); 
    let url = `${host}/${dbCouchName}`;
    let opt = { skip_setup: true,  /*ajax: { headers: {}, withCredentials: false }*/ };
    let remoteDB : any = new PouchDB(url, opt);  
    let sync = database.sync(remoteDB, {live: true,retry: true}); 

    sync.on('change',onChangeHandler(name));
    //sync.on('paused',onPausedHandler(name));
    //sync.on('active',onActiveHandler(name));
    sync.on('denied',onDeniedHandler(name));
    //sync.on('complete',onCompleteHandler(name));
    sync.on('error',onErrorHandler(name));  

    return sync;
};



let onChangeHandler = (dbName:string) => (info) => {
    sendMessage({type:'log', load:`pouchSync change ${dbName} - ${JSON.stringify(info)}`});

    sendMessage({type:'changes', load:info});
};



let onPausedHandler = (dbName:string) =>  (err) => {
    sendMessage({type:'log', load:`pouchSync pause ${dbName} - ${JSON.stringify(err)}`});
};



let onActiveHandler = (dbName:string) =>  () => {
    sendMessage({type:'log', load:`pouchSync active ${JSON.stringify(dbName)}`});
};



let onDeniedHandler = (dbName:string) =>  (err) => {
    sendMessage({type:'log', load:`pouchSync denied ${JSON.stringify(err)}`});
};



let onCompleteHandler = (dbName:string) =>  (info) => {
    sendMessage({type:'log', load:`pouchSync completed ${JSON.stringify(info)}`});
};



let onErrorHandler = (dbName:string) =>  (err) => {
    sendMessage({type:'log', load:`pouchSync error ${JSON.stringify(err)}`});
};
 


let uninitialized = () => isEmpty(list);



let initialized = () => !isEmpty(list);



let startSync = (action:action) => {
    sendMessage({type:'log', load:`pouch log startSync ${JSON.stringify(action)}`});

    let username = action.load;
    let start = startDatabaseSync(username);
    list.push(...databases.map( db => start(db) ));
};



let stopSync = (action:action) => { 
    sendMessage({type:'log', load:`pouch log stopSync ${JSON.stringify(action)}`});

    list.map(s => s.cancel());  list = []; 
};


let setItemsToDatabase = (onError:Function, db:any) => 
    (items:any[]) : Promise<void> => db.bulkDocs(items).catch(onError); 
  
  


let setDatabase = (action:action) => { 
    let {todos,projects,calendars,areas} = action.load;
    //TODO What todo with sync ?
    stopSync({type:'setDatabase',load:null}); //fix

    return destroy().then(() => init()).then(
        () => Promise.all([
           setItemsToDatabase(onError, todos_db)(todos),
           setItemsToDatabase(onError, projects_db)(projects),
           setItemsToDatabase(onError, areas_db)(areas),
           setItemsToDatabase(onError, calendars_db)(calendars)
        ])
    );
};


let updateItemInDatabase = (onError:Function, db:any) => {
    let count = 0;  

    let update = function(_id:string, changed:any) : Promise<any>{
        return db.get(_id)
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
                        return update(_id,changed);
                    }else {  
                        //onError(err);
                        return new Promise( resolve => resolve([]) )
                    } 
                }); 
    }; 
    
    return update;
};



let removeObject = (onError:Function, db:any) => 
    (_id:string) : Promise<void> => updateItemInDatabase(onError, db)(_id, {_deleted: true});
  
 

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



onmessage = function(e){

    sendMessage({type:'log', load:`pouch log get mess ${JSON.stringify(e.data)}`});

    compose(
        cond([
            [ typeEquals("startSync"), when(uninitialized, startSync) ],
            [ typeEquals("stopSync"), when(initialized, stopSync) ],
            [ typeEquals("changes"), applyChanges ],
            [ typeEquals("load"), loadDatabase ],
            //[ typeEquals("dump"),  dumpDatabase ],
            //[ typeEquals("backup"),  backupDatabase ],
            [ typeEquals("set"),  setDatabase ],
            [ () => true, () => null ]    
        ]),
        prop('data')
    )(e) 
}



