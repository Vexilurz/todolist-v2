import { pouchWorker } from './../app';
import { action } from './../types';
import { prop } from 'ramda';
import { typeEquals } from './utils';
import { Observable, Subscription } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';

export let subscribeToChannel = (
    channel:string, 
    subscriber:(action:action) => void
) : Subscription => 
    Observable
    .fromEvent(pouchWorker,'message',(event) => event)
    .map(prop('data'))
    .filter(typeEquals(channel)) 
    .subscribe(subscriber);
