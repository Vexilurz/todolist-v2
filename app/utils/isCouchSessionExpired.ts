import { inPast } from './time';
import { host } from './couchHost';
import { Project, Area, Category, Todo, Calendar, Config, Store, action, Indicators, Cookie } from '../types';
import { 
    isNil, not, map, compose, contains, prop, when, evolve, isEmpty,
    ifElse, applyTo, flatten, reject, assoc, range, toLower, all 
} from 'ramda';
import { isString, isDate, isNumber, isNotNil } from '../utils/isSomething';


export let isCouchSessionExpired = (list:Cookie[]) : boolean => {
    let type = "AuthSession";
    let auth : Cookie[] = list.filter(
        (item) => 
        item.name===type && 
        item.domain===host && 
        isNumber(item.expirationDate)
    );

    if(isEmpty(auth)){ 
        return true; 
    }else{
        return compose(
            all(inPast),
            map(t =>  new Date(new Date().getTime() + t)),
            map(prop('expirationDate'))
        )(auth);
    }
}; 