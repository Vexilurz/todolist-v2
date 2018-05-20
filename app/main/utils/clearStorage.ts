import { isNil } from 'ramda';
const storage = require('electron-json-storage');
const os = require('os');
const path = require("path");
const configPath = path.resolve(__dirname);

storage.setDataPath(configPath);

export let clearStorage = () : Promise<void> => {
    return new Promise( 
        (resolve) => storage.clear(
            (error) => {
                if(!isNil(error)){ 
                    resolve(error) 
                }else{ 
                    resolve() 
                }
            }
        )
    )
};
