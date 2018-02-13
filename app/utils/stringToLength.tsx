import { isString } from "./isSomething";
import { assert } from "./assert";

export let stringToLength = (s : string, length : number) : string => {

    assert(isString(s),`s is not a string ${s}. stringToLength.`);
    assert(!isNaN(length),`length is not a number ${length}. stringToLength.`);

    return s.length<=length ? s : s.substring(0, length) + "...";
}    
 