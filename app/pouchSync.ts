import { cond, compose, equals, prop, isEmpty, when } from 'ramda';
import { host } from './utils/couchHost';
const typeEquals = (type:string) => compose(equals(type), prop(`type`))
const sendMessage = postMessage as any;
import PouchDB from 'pouchdb-browser';   
import {userNameToDatabaseName} from './utils/userNameToDatabaseName';
let todos_db = new PouchDB('todos');
let projects_db = new PouchDB('projects');
let areas_db = new PouchDB('areas'); 
let calendars_db = new PouchDB('calendars'); 
let databases = [todos_db, projects_db, areas_db, calendars_db];
let list = [];



let onChangeHandler = (dbName:string) => (info) => {
    sendMessage(`pouchSync change ${dbName} - ${info}`);
};



let onPausedHandler = (dbName:string) =>  (err) => {
    sendMessage(`pouchSync pause ${dbName} - ${err}`);
};



let onActiveHandler = (dbName:string) =>  () => {
    sendMessage(`pouchSync active ${dbName}`);
};



let onDeniedHandler = (dbName:string) =>  (err) => {
    sendMessage(`pouchSync denied ${err}`);
};



let onCompleteHandler = (dbName:string) =>  (info) => {
    sendMessage(`pouchSync completed ${info}`);
};



let onErrorHandler = (dbName:string) =>  (err) => {
    sendMessage(`pouchSync error ${err}`);
};
 


let initDatabaseSync = (username:string) => (database:any) => {
    let name : string = database.name;
    let dbCouchName = userNameToDatabaseName(username)(name); 

    let remoteDB = new PouchDB( 
        `${host}/${dbCouchName}`,
        { 
            skip_setup: true,  
            //ajax: { headers: {}, withCredentials: false }
        }
    );  

    let sync = remoteDB.sync(database, {live: true,retry: true}) 

    sync.on('change', onChangeHandler(name));
    sync.on('paused', onPausedHandler(name));
    sync.on('active', onActiveHandler(name));
    sync.on('denied', onDeniedHandler(name));
    sync.on('complete', onCompleteHandler(name));
    sync.on('error', onErrorHandler(name));  

    return sync;
};

 

let onStart = (username:string) : void => {
    let init = initDatabaseSync(username);
    list.push(...databases.map( db => init(db)));
};

 

let onStop = () => {
    list.map(s => s.cancel());  
    list = [];
};

 

let onMessage = cond([
    [
        typeEquals("start"), 
        ({type,load}) => when( () => isEmpty(list), () => onStart(load) )
    ],
    [
        typeEquals("stop"), onStop],
    [
        () => true, () => null
    ]    
]);

 

onmessage = (e) => {
    let [type,load] = e.data;

    sendMessage(`pouchSync received - ${type}`);

    onMessage({type,load});
}; 