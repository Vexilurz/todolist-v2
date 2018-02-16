import { collectSystemInfo } from './utils/collectSystemInfo';
import { getConfig, Config } from './utils/config';
import Analytics from 'electron-ga';
import { ipcRenderer, remote } from 'electron';
import { getMachineIdSync } from './utils/userid';
const storage = remote.require('electron-json-storage');

export const googleAnalytics = ({
    send:(type:string,load:any) =>
    getConfig(storage)
    .then(
        (config:Config) => {
            if(config.shouldSendStatistics){ analytics.send(type,load) }
        }            
    ) 
});     

 
const analytics = (() => {
    const sysInfo = collectSystemInfo();
    return new Analytics(
        'UA-113407516-1',
        {
            userId:getMachineIdSync(),
            appName:"tasklist",
            appVersion:remote.app.getVersion(),
            language:sysInfo.userLanguage,
            userAgent:navigator.userAgent,
            viewport:`${sysInfo.viewportSize.width}x${sysInfo.viewportSize.height}`,
            screenResolution:`${sysInfo.screenResolution.width}x${sysInfo.screenResolution.height}`
        }
    );
})()