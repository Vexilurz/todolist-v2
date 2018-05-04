import { isNil } from 'ramda';
import { isDate, isString } from './isSomething';
import { assert } from './assert';
import { isDev } from './isDev';


export let daysRemaining = (date:Date) : number => {
    if(isDev()){
       assert(!isNil(date), `Date is Nil. daysRemaining.`);
    }
    return dateDiffInDays(new Date(), date); 
}; 

export let dateDiffInDays = (A : Date, B : Date) : number  => {

    if(isDev()){
       assert(!isNil(A), `A is Nil. dateDiffInDays.`);
       assert(!isNil(B), `B is Nil. dateDiffInDays.`);
       assert(isDate(A), `A is not of type Date. dateDiffInDays.`);
       assert(isDate(B), `B is not of type Date. dateDiffInDays.`);
    }

    if(isString(A)){
       A = new Date(A);
    }
    
    if(isString(B)){
       B=new Date(B);
    } 

    let _MS_PER_DAY = 1000 * 60 * 60 * 24;

    let utc1 = Date.UTC(A.getFullYear(), A.getMonth(), A.getDate());

    let utc2 = Date.UTC(B.getFullYear(), B.getMonth(), B.getDate());
  
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
};
    
