import { Config } from './../../types';
const storage = require('electron-json-storage');
import { isNil, isEmpty } from 'ramda';
import { defaultConfig } from './../../defaultConfig';

export let getConfig = () : Promise<Config> => {  
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
