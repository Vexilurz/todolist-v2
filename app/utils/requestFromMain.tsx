import { ipcRenderer } from 'electron';
import { compose } from 'ramda';
import { isNotNil } from './isSomething';

export function requestFromMain<T>(
    type:string,
    args:any[],
    pick:(...args:any[]) => T
) : Promise<T>{
    return new Promise( 
        (resolve) => {
            let onDone = (...args) => {
               let data = pick(...args);
               resolve(data);
            }; 

            ipcRenderer.removeAllListeners(type);  
            ipcRenderer.send(type,args);
            ipcRenderer.on(type,onDone); 
        }    
    ).catch(
        (e) => {  
            if(isNotNil(e)){ 
               return null;    
            }
        }
    );
};
 