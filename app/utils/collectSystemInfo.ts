import { ipcRenderer, remote } from 'electron';
const os = remote.require('os'); 


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


export let getScreenResolution = () : {width:number,height:number} => 
           remote.screen.getPrimaryDisplay().workAreaSize;



export let collectSystemInfo = () : SystemInfo => 
        ({ 
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
