import { isString } from "./isSomething";
import { assert } from './assert';
import { isDev } from "./isDev";

export let uppercase = (str:string) : string => { 
    if(isDev()){
       assert(isString(str),`str is not a string ${str}. uppercase.`);
    }
    
    if(str.length===0){
       return str; 
    }
    
    return str.substring(0,1).toUpperCase() + str.substring(1,str.length);
}
 