import { Store, withId, Changes, DatabaseChanges } from '../types';
import { measureTime } from '../utils/utils';
import { pick, pickBy, mapObjIndexed, compose } from 'ramda'; 



let toObjById = (list:withId[]) => {
    let tmp = list.reduce(
        (obj,item) => {  
            obj[item._id]=item; 
            return obj; 
        },
        {}
    );
    return tmp;
}



export let detectChanges : (state:Store) => (newState:Store) => Changes =
    state =>
    compose( 
        mapObjIndexed(
            (val:any[], key:string) : DatabaseChanges<any> => {
                let changes = { add:[], remove:[], update:[] };
                let prev = state[key];                
                let next = val; 

                if(prev.length===next.length){     //items updated

                    let obj = measureTime(toObjById, 'toObjById updated')(prev);

                    next.forEach( 
                        item => { 
                            if(item!==obj[item._id]){
                                changes.update.push(item);
                            }
                        } 
                    )                    

                }else if(prev.length<next.length){ //items added

                    let obj = measureTime(toObjById, 'toObjById added')(prev);

                    next.forEach( 
                        item => { 
                            if(!obj[item._id]){
                                changes.add.push(item);
                            }else if(item!==obj[item._id]){
                                changes.update.push(item);
                            }
                        } 
                    )

                }else if(prev.length>next.length){ //items removed

                    let obj = measureTime(toObjById, 'toObjById removed')(next);

                    prev.forEach( 
                        item => { 
                            let foundItem = next.find((val) => {val._id === item._id});
                            if (!foundItem) {
                                 //item does not exist in new state
                                changes.remove.push(item);
                            } else if (item !== foundItem) { 
                                changes.update.push(foundItem);
                            }
                        } 
                    )
                }

                return changes;
            }
        ),
        pickBy((val, key:string) => val!==state[key]),
        pick(['todos','projects','areas','calendars'])
    );