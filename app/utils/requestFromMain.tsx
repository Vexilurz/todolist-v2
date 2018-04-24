import { ipcRenderer } from 'electron';
import { compose } from 'ramda';
import { isNotNil } from './isSomething';


export let requestFromMain = (type:string, args:any[], pick:(...args:any[]) => any) : Promise<any> => {
    return new Promise( 
        (resolve) => {
            let onDone = (...args) => {
               let data = pick(...args);
               resolve(data);
            }; 

            ipcRenderer.once(type,onDone); 
            ipcRenderer.send(type,args);
        }    
    ).catch( 
        (e) => {  
            if(isNotNil(e)){ 
               return null;    
            }
        }
    );
};
 