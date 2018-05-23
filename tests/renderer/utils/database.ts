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
import { mapObjIndexed, values, compose, map, equals, pick, evolve, keys, forEachObjIndexed } from 'ramda';
import { getTransformations } from "../../../app/utils/crypto/crypto";
import { fixIncomingData } from "../../../app/utils/fixIncomingData";
import { convertAreaDates, convertProjectDates, convertTodoDates } from "../../../app/utils/utils";
const PouchDB = require('pouchdb-browser').default;



let getBeforeAfter = (dbname,originalItems,doc) => {
    let fields = map( keys )( getTransformations( null ))[dbname];
    let initial = originalItems.find(item => item._id===item._id);
    let afterItem = pick(fields)(doc);
    let beforeItem = pick(fields)(initial);

    return {beforeItem,afterItem};
}; 



describe(
    'database with key', 
    () => {  
        let onError = (err) => expect(false,`error: ${err.msg}${err.message}`).to.equal(true);
        let generateSecretKey = () => ( uniqid()+uniqid() ).substring(0, 16);

        let todos_db = new PouchDB('todos',{auto_compaction: true});
        let projects_db = new PouchDB('projects',{auto_compaction: true});
        let areas_db = new PouchDB('areas',{auto_compaction: true}); 
        let databases = [todos_db,projects_db,areas_db];
        
        let init = () => {
            todos_db = new PouchDB('todos',{auto_compaction: true});
            projects_db = new PouchDB('projects',{auto_compaction: true});
            areas_db = new PouchDB('areas',{auto_compaction: true}); 
            databases = [todos_db,projects_db,areas_db];
        };

        let destroy = (databases) => Promise.all(databases.map(db => db.destroy()));

        let opt = { todos:150, projects:150, areas:150 };
        let data = { calendars:[], ...generateRandomDatabase(opt, 0) }; 

        before(function(){ 
            this.timeout(0);
            window['key'] = generateSecretKey();
            return destroy(databases).then(() => init());
        });

        it(    
            `should work with key setItemsToDatabase getItemsFromDatabase`,
            function(){ 
                this.timeout(0);
                expect(window['key'].length,  'key length should be 16').to.equal(16);

                return compose(
                    ps => Promise.all(ps),
                    map(
                        (db:any) => {
                            let items = data[db.name];
                            expect(items).to.be.an('array');
                            //here docs will be encrypted
                            return setItemsToDatabase(onError,db)(items)
                            .then((data) => 

                                //get docs without decryption
                                db
                                .allDocs({include_docs:true})
                                .then(query => query.rows.map(row => row.doc))
                                .then(
                                    docs => {
                                        expect(docs).to.be.an('array');

                                        expect(docs.length, 'length should be equal docs').to.equal(items.length);

                                        docs.forEach( 
                                            doc => {
                                                let {beforeItem,afterItem} = getBeforeAfter(db.name,items,doc); 
                                                expect(
                                                    doc.enc,  
                                                    `enc should be true`
                                                ).to.equal(true);

                                                forEachObjIndexed(
                                                    (value,key) => {
                                                        let property = value;

                                                        expect(
                                                            after[key],  
                                                            `value ${value} equals to after[key] ${after[key]}`
                                                        ).to.not.equal(value);
                                                    },
                                                    before 
                                                );

                                                //assert all docs are encrypted
                                            }
                                        )
                                       
                                    }
                                )
                            )
                            .then(() => getItemsFromDatabase(onError,db))
                            .then( 
                                result => {
                                    expect(result).to.be.an('array');
                                    
                                    expect(result.length, 'length should be equal').to.equal(items.length);
                                    
                                    
                                    result.forEach( 
                                        (item,idx) => {
                                            expect(item.enc,`enc should be false`).to.equal(false);

                                            let {beforeItem,afterItem} = getBeforeAfter(db.name, items, item); 
 
                                            forEachObjIndexed(
                                                (value,key) => {
                                                    //all should be as they were

                                                    if(!equals(after[key],value)){
                                                        debugger;
                                                    }

                                                    expect(
                                                        after[key],  
                                                        `value ${value} not equals to after[key] ${after[key]}`
                                                    ).to.equal(value);
                                                },
                                                before 
                                            );
                                        }
                                    );

                                    return result;
                                }
                            ) 
                        }
                    )
                )(databases)
            } 
        );
    }
); 







describe(
    'database without key', 
    () => {  
        let onError = (err) => expect(false,`error: ${err.msg}${err.message}`).to.equal(true);
        let generateSecretKey = () => ( uniqid()+uniqid() ).substring(0, 16);

        let todos_db = new PouchDB('todos',{auto_compaction: true});
        let projects_db = new PouchDB('projects',{auto_compaction: true});
        let areas_db = new PouchDB('areas',{auto_compaction: true}); 
        let databases = [todos_db,projects_db,areas_db];
        
        let init = () => {
            todos_db = new PouchDB('todos',{auto_compaction: true});
            projects_db = new PouchDB('projects',{auto_compaction: true});
            areas_db = new PouchDB('areas',{auto_compaction: true}); 
            databases = [todos_db,projects_db,areas_db];
        };

        let destroy = (databases) => Promise.all(databases.map(db => db.destroy()));

        let opt = { todos:150, projects:150, areas:150 };
        let data = { calendars:[], ...generateRandomDatabase(opt, 0) }; 


        before(function(){ 
            this.timeout(0);
            window['key'] = null;
            return destroy(databases).then(() => init());
        });


        it(    
            `should work without key setItemsToDatabase getItemsFromDatabase`,
            function(){ 
                this.timeout(0);
                expect(window['key'],'key should be null').to.equal(null);

                return compose(
                    ps => Promise.all(ps),
                    map(
                        (db:any) => {

                            let items = data[db.name];

                            return setItemsToDatabase(onError,db)(items)
                            .then((data) => {
                                return getItemsFromDatabase(onError,db);
                            })
                            .then( 
                                data => {

                                    let result = data.map(
                                        i => {
                                            if(i.type==="todo"){
                                                return convertTodoDates(i);
                                            }else if(i.type==="project"){
                                                return convertProjectDates(i);
                                            }else if(i.type==="area"){
                                                return convertAreaDates(i);
                                            }
                                        }
                                    );


                                    expect(result).to.be.an('array');
                                    expect(result.length, 'length should be equal').to.equal(items.length);
                                    
                                    result.forEach( 
                                        (item,idx) => {
                                            let old = items[idx];

                                            expect(item,`item should exist`).to.not.equal(undefined);
                                            expect(old,`old should exist`).to.not.equal(undefined);
                                            
                                            
                                            expect(item.enc,`enc should be undefined`).to.equal(undefined);

                                            expect(item._id,'should be equal ids').to.equal(old._id);

                                            delete old._rev 
                                            delete old.enc

                                            delete item._rev 
                                            delete item.enc

                                            delete item.deleted
                                            delete old.deleted
                                            
                                            expect(item,'should be equal').to.deep.equal(old)
                                        }

                                    );

                                    return result
                                }
                            ) 
                        }
                    )
                )(databases)
            } 
        );
    }
); 
