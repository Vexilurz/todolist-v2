import { Config } from './../../types';
const storage = require('electron-json-storage');
import { isNil, isEmpty } from 'ramda';
import { defaultConfig } from './../../defaultConfig';
const os = require('os');
const path = require("path");
const configPath = path.resolve(os.homedir(), "Documents", "tasklist");
storage.setDataPath(configPath);

export let getConfig = () : Promise<Config> => {  
    return new Promise( 
        resolve => storage.get(   
            "config",  
            (error, data) => {  
                if(isNil(data) || isEmpty(data)){
                    // console.log('defaultConfig');                    
                    resolve(defaultConfig);
                }else{  
                    // console.log('not defaultConfig', {...data,firstLaunch:false});
                    resolve({...data,firstLaunch:false}); 
                } 
            }
        )  
    )
}; 
