import { not } from 'ramda';
import { globalErrorHandler } from "./globalErrorHandler";
import { isDev } from "./isDev";  
 
export let assert = (condition:boolean , error:string, throwError=true) : void => {
    if(not(condition)){ 
        globalErrorHandler(error)
        .then( 
            () => { 
                if(throwError && isDev()) { 
                    throw new Error(error) 
                }
            }
        )  
    }   
}  