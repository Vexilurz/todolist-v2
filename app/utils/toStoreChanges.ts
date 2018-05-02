import { DatabaseChanges } from './../types';
import { isNil } from 'ramda';


export let toStoreChanges = (local:any[]) => (docs:any[]) : DatabaseChanges<any> => {
    return docs.reduce(
        (change,doc) => {  
            let current = local.find( item => item._id===doc._id );

            if(isNil(current)){
                change.add.push(doc); 
            }else if(doc._deleted){
                change.remove.push(doc);
            }else{
                change.update.push(doc) 
            } 

            return change; 
        },
        { add:[], remove:[], update:[] }
    );
};