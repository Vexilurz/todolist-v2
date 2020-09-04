import { ipcRenderer } from 'electron';
import { compose, isNil } from 'ramda';


export let requestFromMain = (type:string, args:any[], pick:(...args:any[]) => any) : Promise<any> => {
    return new Promise( 
        (resolve) => {
            let onDone = (...args) => {
               let data = pick(...args);
               console.log('requestFromMain data:');
               console.log(data);               
               resolve(data);
            }; 

            ipcRenderer.once(type,onDone); 
            ipcRenderer.send(type,args);
        }    
    ).catch( 
        (e) => {  
            if(!isNil(e)){ 
               return null;    
            }
        }
    );
};
 