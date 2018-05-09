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
import { mapObjIndexed, values, compose, map, equals, pick } from 'ramda';
const PouchDB = require('pouchdb-browser').default;


describe(
    'database', 
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

        let opt = {todos:150, projects:150, areas:150};
        let data = generateRandomDatabase(opt, 0); //{ todos, projects, areas }

        before(function(){ 
            this.timeout(0);
            window['key'] = generateSecretKey();
            return destroy(databases).then(() => init());
        });

        it(    
            `setItemsToDatabase getItemsFromDatabase`,
            function(){ 
                this.timeout(0);
                window['key'] = generateSecretKey();
                expect(window['key'].length,  'key length should be 16').to.equal(16);

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
                                result => {
                                    expect(
                                        result.length, 
                                        'length should be equal'
                                    ).to.equal(items.length);
                                    
                                    result.forEach( 
                                        (item,idx) => {
                                            expect(
                                                item.title,
                                                'should be equal'
                                            ).to.equal(items[idx].title)
                                        }
                                        
                                        /*expect(
                                            item,
                                            'should be equal'
                                        ).to.deep.equal(items[idx])*/

                                    );

                                    return result
                                }
                            ) 
                        }
                    )
                )([todos_db])
            } 
        );
    }
); 

