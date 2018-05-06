import { 
    updateItemsInDatabase, 
    getItemFromDatabase, 
    setItemToDatabase, 
    updateItemInDatabase, 
    getItemsFromDatabase, 
    setItemsToDatabase 
} from "../../../app/database/databaseUtils";
const uniqid = require("uniqid");
let expect = require('chai').expect;
import { generateRandomDatabase } from "../../../randomDatabase/generateRandomDatabase";
import { pwdToKey } from "../../../app/utils/crypto/crypto";
import { mapObjIndexed } from 'ramda';
import { destroy } from './../../../app/database/databaseUtils';
const PouchDB = require('pouchdb-browser').default;


describe(
    'database', 
    () => {  
        let onError = (err) => expect(false,`error: ${err.msg}${err.message}`).to.equal(true);

        let todos_db = new PouchDB('todos',{auto_compaction: true});
        let projects_db = new PouchDB('projects',{auto_compaction: true});
        let areas_db = new PouchDB('areas',{auto_compaction: true}); 
        //let calendars_db = new PouchDB('calendars',{auto_compaction: true}); 
        
        let init = () => {
            todos_db = new PouchDB('todos',{auto_compaction: true});
            projects_db = new PouchDB('projects',{auto_compaction: true});
            areas_db = new PouchDB('areas',{auto_compaction: true}); 
            //calendars_db = new PouchDB('calendars',{auto_compaction: true}); 
        };

        let destroy = () => Promise.all([
            todos_db.destroy(),
            projects_db.destroy(),
            areas_db.destroy(),
            //calendars_db.destroy()
        ]);

        let databases = { 
            todos:todos_db, 
            projects:projects_db, 
            areas:areas_db 
        };
        

        let opt = {todos:150, projects:150, areas:150};
        let data = generateRandomDatabase(opt, 0); //{ todos, projects, areas }

        let salt = uniqid();
        let pwd = uniqid();
        let randomKey = pwdToKey(salt)(pwd); 


        beforeEach(() => {
            init();
            return destroy().then(() => init());
        });

        

        it(    
            `setItemsToDatabase getItemsFromDatabase`,
            function(){ 
                this.timeout(0);

                mapObjIndexed(
                    (db:any, dbname:string) => {
                        let items = data[dbname];

                        return setItemsToDatabase(onError,db,randomKey)(items)
                        .then(
                            () => getItemsFromDatabase(onError,db,randomKey)
                        )
                        .then(
                            result => {
                                expect(
                                    result.length, 
                                    'length should be equal'
                                ).to.equal(items.length);
                                
                                result.forEach( 
                                    (item,idx) => expect(
                                        item,
                                        'should be equal'
                                    ).to.deep.equal(items[idx])
                                );
                            }
                        )
                    },
                    databases
                );
            } 
        );



        it(    
            `updateItemsInDatabase`,
            function(){ 
                this.timeout(0);
                
                mapObjIndexed(
                    (db:any, dbname:string) => {
                        let items = data[dbname];
                        let newData = generateRandomDatabase(opt, 0); //{ todos, projects, areas }
                        let substitute = newData[db.name];

                        return setItemsToDatabase(onError,db,randomKey)(items)
                        .then(() => getItemsFromDatabase(onError,db,randomKey))
                        .then(
                            result => {
                                return updateItemsInDatabase(onError,db,randomKey)(
                                    result.map( 
                                        (item,idx) => {
                                            let s = substitute[idx];
                                            delete s._rev;
                                            delete s._id;

                                            return {...item,...s};
                                        }
                                    )
                                );
                            }
                        )
                        .then(
                            updated => getItemsFromDatabase(onError,db,randomKey)
                        ).then(
                            updated => {
                                updated.forEach( (item,idx) => {
                                    let s = substitute[idx];
                                    delete s._rev;
                                    delete s._id;
                                    delete item._rev;
                                    delete item._id;

                                    expect(
                                        item,
                                        'should be equal updateItemsInDatabase'
                                    ).to.deep.equal(s)
                                } ) 
                            }
                        )
                    },
                    databases
                );
            } 
        );



        it(    
            `getItemFromDatabase setItemToDatabase`,
            function(){ 
                this.timeout(0);

                mapObjIndexed(
                    (db:any, dbname:string) => {
                        let items = data[dbname];

                        return setItemToDatabase(onError,db,randomKey)(items[0])
                        .then(
                            () => getItemFromDatabase(onError,db,randomKey)(items[0]._id)
                        )
                        .then(
                            result => {
                                expect(
                                    result,
                                    'should be equal getItemFromDatabase setItemToDatabase'
                                )
                                .to.deep.equal(items[0])
                            }
                        )
                    },
                    databases
                );
            } 
        );



        it(    
            `updateItemInDatabase`,
            function(){ 
                this.timeout(0);

                mapObjIndexed(
                    (db:any, dbname:string) => {
                        let items = data[dbname];
                        let newData = generateRandomDatabase(opt, 0); //{ todos, projects, areas }
                        let substitute = newData[db.name];

                        return setItemToDatabase(onError,db,randomKey)(items[0])
                        .then(() => getItemFromDatabase(onError,db,randomKey))
                        .then(
                            result => {
                                return updateItemInDatabase(onError,db,randomKey)(
                                    {...result,...substitute[0]}
                                );
                            }
                        )
                        .then(
                            updated => getItemFromDatabase(onError,db,randomKey)(items[0]._id)
                        )
                        .then(
                            updated => {
                                delete substitute[0]._rev;
                                delete substitute[0]._id;
                                delete updated._rev;
                                delete updated._id;

                                expect(
                                    updated,
                                    'should be equal updateItemInDatabase'
                                ).to.deep.equal(substitute[0])
                            }
                        )
                    },
                    databases
                );
            } 
        );
    }
); 

