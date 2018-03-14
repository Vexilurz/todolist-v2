import { ipcRenderer } from 'electron';
import { compose } from 'ramda';
import { isNotNil } from './utils';

export function requestFromMain<T>(
    type:string,
    args:any[],
    pick:(event:any,...args: any[]) => T
) : Promise<T>{

    return new Promise( 
        resolve => {
            ipcRenderer.removeAllListeners(type);  
            ipcRenderer.send(type,...args);
            ipcRenderer.on(type, compose((data:T) => resolve(data), pick)); 
        } 
    ).catch(e => { 
        if(isNotNil(e)){ 
           console.log(type,e); 
           return null ; 
        }
    });
};
 