import { Project, Area, Todo, Calendar, Store, action, withId, Changes, DatabaseChanges } from '../types';
import { isDev } from '../utils/isDev';
import { ipcRenderer } from 'electron';
import { 
    byNotDeleted, typeEquals, byNotCompleted, convertTodoDates, 
    differentBy, compareByDate, isNotEmpty, measureTime, log 
} from '../utils/utils';
import { 
    adjust, cond, all, isEmpty, contains, not, remove, uniq, assoc, reverse, 
    findIndex, splitAt, last, assocPath, isNil, and, complement, compose, 
    reject, concat, map, when, find, prop, ifElse, identity, path, equals, any,
    allPass, evolve, pick, defaultTo, pickBy, mapObjIndexed, forEachObjIndexed  
} from 'ramda'; 
import { filter } from 'lodash';
import { 
    isTodo, isProject, isArea, isCalendar, isString, isArrayOfTodos, 
    isArrayOfProjects, isArrayOfAreas, isDate, isNumber, isNotNil 
} from '../utils/isSomething';
import { moveReminderFromPast } from '../utils/getData';
import { assert, assertC } from '../utils/assert';



let toObjById = (list:withId[]) => 
    list.reduce(
        (obj,item) => {  
            obj[item._id]=item; 
            return obj; 
        },
        {}
    );



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
                            if(!obj[item._id]){

                                changes.remove.push(item); //item does not exist in new state

                            }else if(item!==obj[item._id]){ 

                                changes.update.push(obj[item._id]);
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
