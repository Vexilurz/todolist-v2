import { stringToLength } from './stringToLength';
import { googleAnalytics } from './../analytics';
import { isNil } from 'ramda';
import { isString } from './isSomething';


export let globalErrorHandler = (error:any) : Promise<void> => {
    let message = '';
    let value = 0;     

    if(isNil(error)){
        message = 'Unknown error occured.';
    }else if(isString(error)){
        message = error;
    }else if(error.response || error.request){
        if(error.response){
           message = [error.response.data,error.response.status,error.response.headers].join(' ');
        }else if(error.request){
           message = [error.request,error.config].join(' ');
        }
    }else if(error.message){
        message = [error.fileName,error.name,error.message,error.stack].join(' ');
    }else{
        try{ message = JSON.stringify(error) }catch(e){ }
    }

    if(!isNil(error)){
        if(error.code){ value = error.code; }
        else if(error.lineNumber){ value = error.lineNumber; } 
    } 
           
    return Promise.all(
        [
            googleAnalytics.send(
                'event',  
                { ec:'Error', ea:stringToLength(message, 400), el:'Error occured', ev:value }
            ),
            googleAnalytics.send(
                'exception',  
                { exd:stringToLength(message, 120), exf:1 } 
            )  
        ]
    )
    .then(() => console.log('Error report submitted'))
};    