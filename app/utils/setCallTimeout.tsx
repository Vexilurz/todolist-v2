import {isDate} from '../utils/isSomething';
import {assert} from '../utils/assert';

export let setCallTimeout = (f:() => void, when:Date) : number => {
    assert(isDate(when),`when is not of type Date ${when}. setCallTimeout.`);
    let now = new Date();
    let timeMs = when.getTime() - now.getTime();
 
    // if now or past - make a call
    if(timeMs<=0){ 
        f(); 
        return null;
    // if in future - setup interval    
    }else{ 
        return setTimeout(f, timeMs) as any; 
    }   
}