import { host } from './../utils/couchHost';
import { userNameToDatabaseName } from './../utils/userNameToDatabaseName';
import { prop, path } from 'ramda';
import { 
    action, Query, Databases, Changes, DatabaseChanges, PouchChanges, actionStartSync, 
    actionStopSync, actionChanges, actionLoadDatabase, actionSetDatabase, actionSetKey 
} from './../types';
import { isDev } from '../utils/isDev';
import { onError } from './onError'; 
import { isNotNil, isString } from '../utils/isSomething';
import { encryptDoc, decryptDoc } from '../utils/crypto/crypto';
const PouchDB = require('pouchdb-browser').default;
let window : any = self;


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


//TODO: check this sync!
export let startDatabaseSync = (username:string) => (database:any) => {
    let name : string = database.name;
    let options = { skip_setup:true, auto_compaction:true };
    let dbCouchName = userNameToDatabaseName(username)(name); 
    let url = `${host}/${dbCouchName}`;
    let remoteDB : any = new PouchDB(url, options);  

    let sync = database.sync(remoteDB, {live: true, retry: true}); 

    sync.on('change', onChangeHandler(name));
    sync.on('denied', onError);
    sync.on('error', onError);

    sync.on('paused', onPaused);
    sync.on('active', onActive);
  
    return sync;
};
 