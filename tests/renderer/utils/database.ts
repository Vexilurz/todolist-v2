import { 
    updateItemsInDatabase, 
    getItemFromDatabase, 
    setItemToDatabase, 
    updateItemInDatabase, 
    getItemsFromDatabase, 
    setItemsToDatabase, 
    removeItems
} from "../../../app/database/databaseUtils";
const uniqid = require("uniqid");
let expect = require('chai').expect;
import { generateRandomDatabase } from "../../../randomDatabase/generateRandomDatabase";
import { mapObjIndexed, compose, ifElse, identity } from 'ramda';
import { init } from "../../../app/database/init";
import { userNameToDatabaseName } from "../../../app/utils/userNameToDatabaseName";
import { PouchChanges } from "../../../app/types";
import { fakeCalendar } from "../../../randomDatabase/fakeCalendar";
import { randomInteger } from "../../../randomDatabase/utils";
import { isString, isNotNil } from "../../../app/utils/isSomething";
import { encryptDoc, decryptDoc } from "../../../app/utils/crypto/crypto";

const PouchDB = require('pouchdb-browser').default;

let log = (append:string) => (load:any) : any => {
    console.log(append,load); 
    return load;
};


describe(
    'sync', 
    () => {  
        let onError = (err) => expect(false,`error: ${err.msg}${err.message}`).to.equal(true);
        
        let databases = [];

        beforeEach(
            function(){ 
                this.timeout(0);
               
            }
        );


        it(
            'init', 
            function(){ 
                        this.timeout(0);
                        let data = generateRandomDatabase({todos:3, projects:2, areas:2}, 0);
                        data['calendars'] = [];
                        
                        let username = 'test5';
                        let opt = {
                            ajax: {
                                cache: false,
                                timeout: 1000,
                                headers: {
                                    //'X-Some-Special-Header': 'foo'
                                },
                            },
                            auth: {
                                username,
                                password: 'Zuzun123'
                            }
                        };

                        let remote = [];

                        return Promise.all(
                            databases.map(
                                db => {
                                    let items = data[db.name];
                                    return setItemsToDatabase(onError,db)(items);
                                }
                            )
                        )
                        .then(
                            () => {
                                return Promise.all(
                                    databases.map( 
                                        db => {
                                            let name : string = db.name;
                                            let options = { skip_setup:true, auto_compaction:true, ...opt };
                                            let dbCouchName = userNameToDatabaseName(username)(name); 
                                            let url = `http://localhost:5984/${dbCouchName}`;
                                            let remoteDB : any = new PouchDB(url, options);  



                                            remoteDB.transform({
                                                outgoing:ifElse(
                                                    (doc) => {
                                                        return isNotNil(doc) && isString(window['key']) && !doc.enc
                                                    },
                                                    compose(
                                                        log('outgoing'),
                                                        doc => encryptDoc(name, window['key'], onError)(doc)
                                                    ),
                                                    identity
                                                ),
                                                incoming:ifElse(
                                                    (doc) => {
                                                        return isNotNil(doc) && isString(window['key']) && doc.enc
                                                    },
                                                    compose( 
                                                        log('incoming'),
                                                        doc => decryptDoc(name, window['key'], onError)(doc) 
                                                    ),
                                                    identity
                                                )
                                            }) 






                                            let sync = db.sync(remoteDB, {live: true, retry: true}); 
                                        
                                            remote.push(remoteDB);

                                            sync.on('denied', onError);
                                            sync.on('error', onError);

                                            
                                            return new Promise( 
                                                resolve => {
                                                    sync.on('paused', () =>  resolve());
                                                }
                                            );
                                        }
                                    )
                                );
                            }
                        )
                        .then(() => Promise.all(remote.map( db => getItemsFromDatabase(onError,db) )))
                        .then(
                            updated => {
                                debugger;
                            }
                        )
            }
        )
    }
); 

