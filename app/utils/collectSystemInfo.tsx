import { isNil } from 'ramda';
import { ipcRenderer, remote } from 'electron';



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
    userLanguage : string 
}


export let getScreenResolution = () : {width:number,height:number} => {
    return remote.screen.getPrimaryDisplay().workAreaSize;
}
 


export let collectSystemInfo = () : SystemInfo => {
    const os = remote.require('os'); 
    return ({ 
            arch : os.arch(),
            cpus : os.cpus(),
            hostname : os.hostname(),
            platform : os.platform(),
            release : os.release(),
            type : os.type(),
            screenResolution : getScreenResolution(),
            viewportSize : {
                width:window.innerWidth,
                height:window.innerHeight
            },
            documentEncoding : document.characterSet,
            userLanguage : remote.app.getLocale()
        })
}