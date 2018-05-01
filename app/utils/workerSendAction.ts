import { 
    isEmpty, last, isNil, contains, all, not, assoc, flatten, reduce, prop, evolve, uniq,
    toPairs, map, compose, allPass, cond, defaultTo, reject, when, ifElse, identity, and 
} from 'ramda';
import { isNotArray, isDate, isTodo, isString, isNotNil } from '../utils/isSomething';
import { Observable, Subscription } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { typeEquals } from './utils';
import { action } from '../types';


export let workerSendAction = (worker:any) => 
    <T> (action:action) : Promise<T> => 
        new Promise(
            resolve => {
                Observable
                .fromEvent(worker,'message',(event) => event.data as action)
                .filter(typeEquals(action.type))
                .first()
                .map(prop("load"))
                .subscribe((load:T) => resolve(load));

                worker.postMessage(action);
            }
        );



