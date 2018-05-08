import { host } from './../utils/couchHost';
import { userNameToDatabaseName } from './../utils/userNameToDatabaseName';
import { 
    cond, compose, equals, prop, isEmpty, when, fromPairs, 
    isNil, forEachObjIndexed, toPairs, evolve, ifElse, last, 
    map, mapObjIndexed, values, flatten, path, pick, identity 
} from 'ramda';
import { 
    action, Query, Databases, Changes, DatabaseChanges, PouchChanges, actionStartSync, 
    actionStopSync, actionChanges, actionLoadDatabase, actionSetDatabase, actionSetKey 
} from './../types';
import { isDev } from '../utils/isDev';
import { onError } from './onError'; 



let onPaused = () => sendMessage({type:'paused', load:null});



let onActive = () => sendMessage({type:'active', load:null});



const sendMessage = postMessage as (action:action) => void;



let onChangeHandler = (dbName:string) => (info:PouchChanges) => {
    if(isDev()){
       sendMessage({type:'log', load:`pouchSync change ${dbName} - ${path(["change","docs","length"])(info)}`});
    }

    if(info && prop('direction')(info)==="pull"){
       sendMessage({ type:'changes', load:{ dbname:dbName, changes:info } });
    }
};



export let startDatabaseSync = (username:string) => (database:any) => {
    let name : string = database.name;
    let dbCouchName = userNameToDatabaseName(username)(name); 
    let url = `${host}/${dbCouchName}`;
    let opt = { skip_setup: true, auto_compaction: true };
    let remoteDB : any = new PouchDB(url, opt);  
    let sync = database.sync(remoteDB, {live: true, retry: true}); 

    sync.on('change', onChangeHandler(name));
    sync.on('denied', onError);
    sync.on('error', onError);

    sync.on('paused', onPaused);
    sync.on('active', onActive);
  
      
    return sync;
};
 