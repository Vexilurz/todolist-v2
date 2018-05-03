import { pouchWorker } from './../app';
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
    reject, concat, map, when, find, prop, ifElse, identity, path, equals, 
    allPass, evolve, pick, defaultTo, pickBy, mapObjIndexed, forEachObjIndexed  
} from 'ramda'; 
import { filter } from 'lodash';
import { 
    isTodo, isProject, isArea, isCalendar, isString, isArrayOfTodos, 
    isArrayOfProjects, isArrayOfAreas, isDate, isNumber, isNotNil 
} from '../utils/isSomething';
import { moveReminderFromPast } from '../utils/getData';



let toObjById = (list:withId[]) => 
    list.reduce(
        (obj,item) => {  
            obj[item._id]=item; 
            return obj; 
        },
        {}
    );



let detectChanges : (state:Store) => (newState:Store) => Changes =
    state =>
    compose( 
        when(isNotEmpty, log('database changes')),
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
                                changes.remove.push(item);
                            }else if(item!==obj[item._id]){
                                changes.update.push(item);
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


let ignoredActions = ["setCalendars","setTodos","setProjects","setAreas","updateCalendars"];
    

export let updateDatabase = (state:Store, load:action[]) => (newState:Store) : Store => { 

    let actions = reject(
        a => contains(a.type)(ignoredActions) || a.kind==="sync",
    )(load); 

    // ok so here is the problem
    // i have a loop in case sync actions mixed with user actions at this point
    // because actions will not be empty and infinite loop will be created : 
    // user changes data -> db changes -> sync -> db changes on different point -> as if user change data -> database changes 
    //... etc...
    // this wont happen if actions will not be mixed 
    // assert --->>> all sync or none sync

    if(isEmpty(actions)){ return newState }

    let changes = detectChanges(state)(newState);
    
    if(isNotEmpty(changes)){ 
       pouchWorker.postMessage({type:"changes", load:changes}); 
    } 

    return newState; 
};     