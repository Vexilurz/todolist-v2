import {isDate} from '../utils/isSomething';
import {assert} from '../utils/assert';
import { isDev } from './isDev';

export let setCallTimeout = (f:() => void, when:Date) : number => {
    if(isDev()){
       assert(isDate(when),`when is not of type Date ${when}. setCallTimeout.`);
    }
     
    let now = new Date();
    let timeMs = when.getTime() - now.getTime();
 
    // if now or past - make a call
    if(timeMs<=0){  
        f(); 
        return null;
    // if in future - setup interval    
    }else{ 
        //if will cause overflow - dont register (more than two weeks ahead)
        if(timeMs >= 0x7FFFFFFF){ 
           return null; //TODO: show some error message
        }else{
           return setTimeout(f, timeMs) as any; 
        }
    }   
}