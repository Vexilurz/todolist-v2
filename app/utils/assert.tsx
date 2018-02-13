import { not } from 'ramda';
import { globalErrorHandler } from "./globalErrorHandler";
 
export let assert = (condition:boolean , error:string, throwError=true) : void => {
    if(not(condition)){ 
        globalErrorHandler(error)
        .then( 
            () => { 
                if(throwError) { 
                    throw new Error(error) 
                }
            }
        )  
    }   
}  