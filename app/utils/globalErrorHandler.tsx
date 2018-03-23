import { stringToLength } from './stringToLength';
import { googleAnalytics } from './../analytics';
import { isNil } from 'ramda';
import { isString } from './isSomething';
import { getMachineIdSync } from './userid';
const Promise = require('bluebird'); 

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
    
    console.log(message);

    let machineId = getMachineIdSync();

    return Promise.all(
        [
            googleAnalytics.send(
                'event',  
                { ec:'Error', ea:stringToLength(`Error : ${message}`, 400), el:`Error occured : ${machineId}`, ev:value }
            ),
            googleAnalytics.send(  
                'exception',  
                { exd:stringToLength(`Error : ${message}`, 120), exf:1 } 
            )  
        ]
    )
    .then(() => console.log('Error report submitted'))
};    