import { isNil, isEmpty } from 'ramda';
import { ipcRenderer, remote } from 'electron';
import {defaultTags} from './defaultTags';
const storage = remote.require('electron-json-storage');
const os = remote.require('os');
storage.setDataPath(os.tmpdir());


export const defaultConfig = { 
    nextUpdateCheck:new Date(),
    firstLaunch:true,
    hideHint:false,
    defaultTags:defaultTags,  
    shouldSendStatistics:true,
    showCalendarEvents:true,
    groupTodos:false,
    preserveWindowWidth:true, //when resizing sidebar
    enableShortcutForQuickEntry:true,
    quickEntrySavesTo:"inbox", //inbox today next someday
    moveCompletedItemsToLogbook:"immediately"
}


export interface Config{
    nextUpdateCheck:Date,
    firstLaunch:boolean, 
    defaultTags:string[],
    hideHint:boolean,
    shouldSendStatistics:boolean,
    showCalendarEvents:boolean,
    groupTodos:boolean,
    preserveWindowWidth:boolean, //when resizing sidebar
    enableShortcutForQuickEntry:boolean,
    quickEntrySavesTo:string, //inbox today next someday
    moveCompletedItemsToLogbook, //immediatelly
}




export let getConfig = () : Promise<Config> => {
    return new Promise( 
        resolve => 
            storage.get( 
                "config", 
                (error, data:Config) => {  
                    if(isNil(data) || isEmpty(data)){resolve(defaultConfig)}
                    else{ resolve({...data,firstLaunch:false} ) } 
                }
            )  
    )
}; 



export let updateConfig = (dispatch:Function) => 
        (load:any) : Promise<any> => {
            return getConfig()
                    .then( 
                      (config:Config) => {
                        let updated = { ...config, ...load } as Config;
                        return new Promise(
                            resolve => 
                                storage.set(  
                                    "config", 
                                    updated, 
                                    (error) => {
                                        if(!isNil(error)){ resolve(defaultConfig) }
                                        dispatch({type:"updateConfig",load:updated}) 
                                        resolve(updated as Config); 
                                    }
                                )
                        )
                      }
                    )
        }


export let clearStorage = (onError:Function) : Promise<void> => {
    return new Promise( 
        (resolve) => { 
            storage.clear(
                (error) => {
                    if(!isNil(error)){ onError(error) }
                    resolve()
                }
            )
        }
    )
};