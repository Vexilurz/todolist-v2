import { reduce } from 'ramda';

export let reduceP = reduce(

    (acc,p) => acc.then(  val => p.then( next => [...val, next] )  ), 

    new Promise(resolve => resolve([]))
);