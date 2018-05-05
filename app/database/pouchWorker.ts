import { getDatabaseObjects, destroy, setItemsToDatabase, addItems, removeItems, updateItems } from './databaseUtils';
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
    map, mapObjIndexed, values, flatten, path, pick 
} from 'ramda';
import { isDev } from '../utils/isDev';
import { isHeading } from '../utils/isSomething';
let CryptoJS = require("crypto-js");

const typeEquals = (type:string) => compose(equals(type), prop(`type`)); //TODO move to utils
const sendMessage = postMessage as (action:action) => void;
const Promise = require('bluebird');
const PouchDB = require('pouchdb-browser').default;
PouchDB.plugin(require('transform-pouch'));

let secret = null;
let todos_db = new PouchDB('todos',{auto_compaction: true});
let projects_db = new PouchDB('projects',{auto_compaction: true});
let areas_db = new PouchDB('areas',{auto_compaction: true}); 
let calendars_db = new PouchDB('calendars',{auto_compaction: true}); 

let databases = [todos_db, projects_db, areas_db, calendars_db];
let list = [];



let encryptData = (secret:string) => (data:string) : string => CryptoJS.AES.encrypt(data, secret);



let decryptData = (secret:string) : (ciphertext:string) => string => 
    compose(
        bytes => bytes.toString(CryptoJS.enc.Utf8),
        ciphertext => CryptoJS.AES.decrypt(ciphertext.toString(), secret)
    );



let getTransformations = (f:Function) => ({
    todos:{
        title:f,
        checklist:map( evolve({text:f}) )
        //note(RawDraftContentState) TODO
    },
    projects:{
        name:f, 
        layout:map( 
            when( 
                isHeading, 
                evolve({title:f}) 
            ) 
        )
        //description(RawDraftContentState) TODO
    },
    areas:{
        name:f, 
        description:f
    },
    calendars:{
        events:map( 
            evolve({
                name:f,
                description:f
            })  
        )
    }
});



let getOutgoingTransformations = (secret) => getTransformations(decryptData(secret));



let getIncomingTransformations = (secret) => getTransformations(encryptData(secret));



let salt = CryptoJS.lib.WordArray.random(128 / 8);
//CryptoJS.PBKDF2(passwordInput, salt, { keySize: 128/32, iterations: 10 });



let setTransform = (secret:any) => (db:any) => {
    let incoming = getIncomingTransformations(secret)[db.name];
    let outgoing = getOutgoingTransformations(secret)[db.name];

    db.transform({
        incoming: compose( 
            
            evolve( incoming ) 

        ),
        outgoing: compose(

            evolve( outgoing ) 

        )
    });

    return db;
};



let setEncryption = (action:action) : Promise<void> => {
    secret = action.load;

    databases.forEach( db => setTransform(secret)(db) );
    
    return new Promise( resolve => resolve() );
};




let onError = (error) => sendMessage({type:'error', load:`pouch error ${JSON.stringify(error)}`});



let onChangeHandler = (dbName:string) => (info:PouchChanges) => {
    if(isDev()){
       sendMessage({type:'log', load:`pouchSync change ${dbName} - ${path(["change","docs","length"])(info)}`});
    }

    if(info && prop('direction')(info)==="pull"){
       sendMessage({ type:'changes', load:{ dbname:dbName, changes:info } });
    }
};



let init = () => {
    todos_db = new PouchDB('todos',{auto_compaction: true});
    projects_db = new PouchDB('projects',{auto_compaction: true});
    areas_db = new PouchDB('areas',{auto_compaction: true}); 
    calendars_db = new PouchDB('calendars',{auto_compaction: true}); 

    databases = [todos_db, projects_db, areas_db, calendars_db];

    return databases;
};
 
 

let loadDatabase = (action:action) : Promise<Databases> => {
    if(isDev()){
       sendMessage({type:'log', load:`pouch log loadDatabase`});
    }
    
    return getDatabaseObjects(onError,databases);
};   



let startDatabaseSync = (username:string) => (database:any) => {
    let name : string = database.name;
    let dbCouchName = userNameToDatabaseName(username)(name); 
    let url = `${host}/${dbCouchName}`;
    let opt = { skip_setup: true, auto_compaction: true /*ajax: { headers: {}, withCredentials: false }*/ };
    let remoteDB : any = new PouchDB(url, opt);  
    let sync = database.sync(remoteDB, {live: true, retry: true}); 

    sync.on('change',onChangeHandler(name));
    sync.on('denied',onError);
    sync.on('error',onError);

    //sync.on('completed',onError);  
      
    return sync;
};
 




let startSync = (action:action) : Promise<void> => {
    list = list.filter(s => !s.canceled);

    if(!isEmpty(list)){ return new Promise(resolve => resolve(null)); }

    if(isDev()){
       sendMessage({type:'log', load:`pouch log startSync ${JSON.stringify(action)}`});
    }

    let username = action.load;
    let start = startDatabaseSync(username);
    list = databases.map( db => start(db) );
 
    return new Promise( resolve => resolve(null) );
};



let stopSync = (action:action) : Promise<any[]> => { 

    if(isDev()){
       sendMessage({type:'log', load:`pouch log stopSync ${JSON.stringify(action)}`});
    }

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



let setDatabase = (action:action) : Promise<void> => 
    stopSync({type:'stopSync',load:null})  
    .then(() => destroy(databases))
    .then(() => init())
    .then((databases) => Promise.all( 
        databases.map( db => setItemsToDatabase(onError, db)(action.load[db.name])) 
    ));



let applyChanges = (action:action) : Promise<void> => {
    if(isDev()){
       sendMessage({type:'log', load:`pouch log applyChanges ${action.type}`});
    }

    let changes : Changes = action.load;

    return compose(
        list => Promise.all(list),
        flatten,
        mapObjIndexed(
            (change:DatabaseChanges<any>, dbname:string) => {
                let db = databases.find( d => d.name===dbname );

                return compose(
                    values,
                    evolve(
                        {
                            add:addItems(db, onError),
                            remove:removeItems(db, onError),
                            update:updateItems(db, onError)
                        }
                    )
                )(change);
            }
        )
    )(changes);
};


onmessage = function(e){
    if(isDev()){
       sendMessage({type:'log', load:`pouch log get action - ${e.data.type}`});
    }

    let action = e.data; 

    compose(
        p => p.then(load => sendMessage({type:action.type, load})),
        cond([
            [ typeEquals("startSync"), startSync ],
            [ typeEquals("stopSync"), stopSync ],
            [ typeEquals("changes"), applyChanges ],
            [ typeEquals("load"), loadDatabase ],
            [ typeEquals("set"),  setDatabase ],
            [ typeEquals("encryption"),  setEncryption ],
            [ () => true, () => new Promise( resolve => resolve(null) ) ]    
        ])
    )(action) 
};



