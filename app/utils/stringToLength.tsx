import { isString } from "./isSomething";
import { assert } from "./assert";
import { isDev } from "./isDev";

export let stringToLength = (s : string, length : number) : string => {
    if(isDev()){
       assert(isString(s),`s is not a string ${s}. stringToLength.`);
       assert(!isNaN(length),`length is not a number ${length}. stringToLength.`);
    }

    return s.length<=length ? s : s.substring(0, length) + "...";
}    
 