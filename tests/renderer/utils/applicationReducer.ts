import { reducer } from '../../../app/reducer';
import { evolve, not, mapObjIndexed, compose, values, equals, isNil, isEmpty } from 'ramda';
import { defaultConfig } from '../../../app/defaultConfig';
import { randomArrayMember, randomWord, randomDate } from '../../../randomDatabase/utils';
import { action, Config } from '../../../app/types';
import { defaultStoreItems } from './../../../app/defaultStoreItems';
import { requestFromMain } from '../../../app/utils/requestFromMain';
import { stateReducer } from '../../../app/stateReducer';
import { objectsReducer } from '../../../app/objectsReducer';
import { sleep } from '../../../app/utils/sleep';
const chai = require('chai');
let assert = require('chai').assert;
let expect = require('chai').expect;



/*
const storage = require('electron').remote.require('electron-json-storage');

let getConfig = () : Promise<Config> => {  
    return new Promise( 
        resolve => storage.get(   
            "config",  
            (error, data) => {  
                if(isNil(data) || isEmpty(data)){
                    resolve(defaultConfig);
                }else{  
                    resolve({...data,firstLaunch:false}); 
                } 
            }
        )  
    )
};

let updateConfig = (load:Config) : Promise<any> => {
    return getConfig().then( 
        (config:Config) => {
            let updated : Config = { ...config, ...load };

            return new Promise(
                resolve => storage.set(  
                    "config", 
                    updated, 
                    (error) => {
                        if(!isNil(error)){ resolve(defaultConfig) }
                        resolve(updated); 
                    }
                )
            )
        }
    )
}; 
*/



Date.prototype["addDays"] = function(days){
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat; 
}; 



describe(
    'applicationReducer', 
    () => {  
        it(    
            ``,
            function(){ 
                
                this.timeout(0);

                let config = defaultConfig;

                let test = {...defaultConfig};

                let changeConfig = evolve({
                    secretKey:randomWord,
                    salt:randomWord, 
                    email:randomWord,
                    nextBackupCleanup:() => randomDate( new Date()["addDays"](10), new Date()["addDays"](100) ),
                    nextUpdateCheck:() => randomDate( new Date()["addDays"](10), new Date()["addDays"](100) ),
                    defaultTags:() => [randomWord(),randomWord(),randomWord()],
                    firstLaunch:not, 
                    sync:not,    
                    hideHint:not, 
                    shouldSendStatistics:not, 
                    showCalendarEvents:not, 
                    disableReminder:not, 
                    groupTodos:not, 
                    preserveWindowWidth:not, 
                    enableShortcutForQuickEntry:not, 
                    quickEntrySavesTo:() => randomArrayMember(['inbox', 'today', 'next', 'someday']),
                    moveCompletedItemsToLogbook:() => randomArrayMember(["immediately","min","hour","day"])   
                });

                let applicationReducer = reducer(
                    [stateReducer, objectsReducer], 
                    config => {
                        test = {...test,...config}
                        return new Promise( resolve => resolve(test) );
                    }
                );

                let next = changeConfig(config);  

                let actions : action[] = compose(
                    values,
                    mapObjIndexed((value:any, key:string) => ({type:key,load:value}))
                )(next);

                let result = actions.reduce( 
                    (store,action) => applicationReducer(store,action), 
                    defaultStoreItems
                );

                let retrieved = {...defaultStoreItems,...test}; 

                let eq = equals(retrieved, result); 

                expect(eq).to.equal(true);
            } 
        );
    }
); 