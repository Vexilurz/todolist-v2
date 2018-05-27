import { getConfig } from "./getConfig";
import { Config } from "../../types";
import { isNil } from 'ramda';
import { defaultConfig } from "../../defaultConfig";
const storage = require('electron-json-storage');
const os = require('os');
const path = require("path");
const configPath = path.resolve(os.homedir(), "Documents", "tasklist");
storage.setDataPath(configPath);

export let updateConfig = (load:any) : Promise<any> => {
    return getConfig().then( 
        (config:Config) => {
            let updated = { ...config, ...load } as Config;
            return new Promise(
                resolve => storage.set(  
                    "config", 
                    updated, 
                    (error) => {
                        if(!isNil(error)){ resolve(defaultConfig) }
                        resolve(updated as Config); 
                    }
                )
            )
        }
    )
}; 