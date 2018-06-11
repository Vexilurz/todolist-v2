Date.prototype["addDays"] = function(days){
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat; 
}; 
import { 
    getDatabaseObjects, addItems, removeItems, updateItems, setItemsToDatabase 
} from './databaseUtils';
import { singleItem } from './../utils/singleItem'; 
import { sleep } from './../utils/sleep'; 
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { 
    action, Query, Databases, Changes, DatabaseChanges, PouchChanges, actionStartSync, 
    actionStopSync, actionChanges, actionLoadDatabase, actionSetDatabase, actionSetKey, 
    actionEncryptDatabase 
} from './../types';
import { host } from './../utils/couchHost';
import { userNameToDatabaseName } from './../utils/userNameToDatabaseName';
import { 
    cond, compose, equals, prop, isEmpty, when, fromPairs, 
    isNil, forEachObjIndexed, toPairs, evolve, ifElse, last, 
    map, mapObjIndexed, values, flatten, path, pick, identity,
    complement 
} from 'ramda';
import { isDev } from '../utils/isDev';
import { encryptDoc, decryptDoc } from '../utils/crypto/crypto';
import { onError } from './onError'; 
import { init } from './init';
import { startDatabaseSync } from './startDatabaseSync';
import { getRangeMonthUntilDate } from '../utils/utils';
let window : any = self;

const typeEquals = (type:string) => compose(equals(type), prop(`type`)); //TODO move to utils
let isNotNil = complement(isNil); //TODO move to utils
let isString = (item) : boolean => typeof item==="string"; //TODO move to utils 

const sendMessage = postMessage as (action:action) => void;
const Promise = require('bluebird');


let databases = init();
let list = [];



Observable.fromEvent(self, 'message', event => event)
.concatMap(
    (e:any,index:number) => {
        if(isDev()){
            sendMessage({type:'log', load:`pouch log get action - ${e.data.type}`});
        }

        let action : action = e.data; 

        let result = cond([
            [ typeEquals("load"), load ], 

            [ typeEquals("changes"), changes ],

            [ typeEquals("startSync"), startSync ],

            [ typeEquals("stopSync"), stopSync ],

            [ typeEquals("setKey"), setKey ],

            [ typeEquals("encryptDatabase"), encryptDatabase ],
            
            [ () => true, () => new Promise( resolve => resolve(null) ) ]    
        ])(action);
         
        return result.then(
            load => {
               return {type:action.type, load, import:action.import};
            }
        );
    }
)
.catch(
    (err) => Observable.fromPromise(new Promise(resolve => resolve(err)))
)
.subscribe(
    (action:action) => sendMessage(action)
)









/**
 * load data from dbs in memory
 */
let load = (action:actionLoadDatabase) : Promise<Databases> => {
    if(isDev()){
       sendMessage({type:'log', load:`pouch log loadDatabase`});
    }

    return getDatabaseObjects(onError,databases);
};   



/**
 * start synchronization process
 */
let startSync = (action:actionStartSync) : Promise<void> => {
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



/**
 * stop synchronization process
 */
let stopSync = (action:actionStopSync) : Promise<any[]> => { 

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


 
/**
 * apply changes from redux store to dbs
 */
let changes = (action:actionChanges) : Promise<void> => {
    let changes : Changes = action.load;
  
    return compose(
        list => {
            return Promise.all(list).then(result => changes);
        },
        flatten, 
        values,
        mapObjIndexed(
            (change:DatabaseChanges<any>, dbname:string) => {
                let db = databases.find(d => d.name===dbname);

                if(isNil(db)){ return new Promise( resolve => resolve() ) } 

                let result = compose(
                    flatten,
                    values,
                    evolve({
                        add:addItems(db, onError),
                        remove:removeItems(db, onError),
                        update:updateItems(db, onError)
                    })
                )(change);
 
                return result;
            }
        )
    )(changes);
};



let encryptDatabase = (action:actionEncryptDatabase) : Promise<any> => 
    getDatabaseObjects(onError,databases)
    .then(
        evolve({
            todos:map(encryptDoc("todos",action.load, onError)), 
            projects:map(encryptDoc("projects",action.load, onError)), 
            areas:map(encryptDoc("areas",action.load, onError)), 
            calendars:map(encryptDoc("calendars",action.load, onError))
        })
    )
    .then(
        (data:Databases) => databases.forEach( 
            db => updateItems(db, onError)(data[db.name]) 
        )
    );



/**
 * assign encryption key to window object for further usage
 */
let setKey = (action:actionSetKey) : Promise<void> => {
    window.key = action.load;
    return new Promise( resolve => resolve(null) );
};



