import { prop } from 'ramda';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { typeEquals } from './utils';
import { action } from '../types';


export let workerSendAction = (worker:any) => 
    <T> (action:action) : Promise<T> => 
        new Promise(
            resolve => {
                Observable
                .fromEvent(worker,'message',(event) => event.data as action)
                .filter(typeEquals(action.type) as any)
                .first()
                .map(prop("load"))
                .subscribe((load:T) => resolve(load));

                worker.postMessage(action);
            }
        );



