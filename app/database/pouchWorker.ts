import { cond, compose, equals, prop, isEmpty, when } from 'ramda';
import { host } from './utils/couchHost';
const typeEquals = (type:string) => compose(equals(type), prop(`type`))
const sendMessage = postMessage as any;
const PouchDB = require('pouchdb-browser').default;
import {userNameToDatabaseName} from './utils/userNameToDatabaseName';
let todos_db = new PouchDB('todos');
let projects_db = new PouchDB('projects');
let areas_db = new PouchDB('areas'); 
let calendars_db = new PouchDB('calendars'); 
let databases = [todos_db, projects_db, areas_db, calendars_db];
let list = [];



let onChangeHandler = (dbName:string) => (info) => {
    sendMessage(`pouchSync change ${dbName} - ${JSON.stringify(info)}`);
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

    let remoteDB : any = new PouchDB( 
        `${host}/${dbCouchName}`,
        { 
            skip_setup: true,  
            //ajax: { headers: {}, withCredentials: false }
        }
    );  
 
    let sync = database.sync(remoteDB, {live: true,retry: true}) 

    sync.on('change',onChangeHandler(name));
    //sync.on('paused',onPausedHandler(name));
    //sync.on('active',onActiveHandler(name));
    sync.on('denied',onDeniedHandler(name));
    //sync.on('complete',onCompleteHandler(name));
    sync.on('error',onErrorHandler(name));  

    return sync;
};

 

let onStart = (username:string) : void => {
    console.log('start');
    let init = initDatabaseSync(username);
   
    list.push(...databases.map( db => init(db)));

    sendMessage(`pouchSync init list length - ${list.length}`);
};

 

let onStop = () => {
    list.map(s => s.cancel());  
    list = [];
};

 

let onMessage = cond([
    [
        typeEquals("start"), 
        when( () => isEmpty(list),  ({type,load}) => onStart(load) )
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