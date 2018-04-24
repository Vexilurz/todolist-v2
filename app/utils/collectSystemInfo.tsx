import { isNil } from 'ramda';
import { ipcRenderer } from 'electron';
import { requestFromMain } from './requestFromMain';



export interface SystemInfo{ 
    arch : string,
    cpus : any[], 
    hostname : string,
    platform : string,
    release : string,
    type : string,
    screenResolution : {width:number,height:number},
    viewportSize : {width:number,height:number},
    documentEncoding : string,
    userLanguage : string,
    version?:string 
}



export let collectSystemInfo = () : Promise<SystemInfo> => 
    requestFromMain(
        'collectSystemInfo',
        [],
        (event,info) => info
    ).then(
        info => ({
            ...info, 
            viewportSize:{
                width:window.innerWidth,
                height:window.innerHeight
            },
            documentEncoding:document.characterSet
        })
    ); 
 