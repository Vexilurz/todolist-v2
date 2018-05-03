import { all, identity } from 'ramda';
import { globalErrorHandler } from "./globalErrorHandler";
import { isDev } from "./isDev";  



export let assertC = (test:Function, msg:string) => (value:any) => {
    if(test(value)){ return value; }

    globalErrorHandler(msg) 
    .then( 
        () => {
            if(isDev()){ throw new Error(`assertion failed:${msg}`) }
        }
    )  

    return value; 
};



export let assert = (value:boolean, msg:string) => {
    if(value){ return }

    globalErrorHandler(msg)
    .then( 
        () => { 
            if(isDev()){ throw new Error(`assertion failed:${msg}`) }
        }
    )  
};


