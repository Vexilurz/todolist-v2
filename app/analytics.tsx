import { collectSystemInfo } from './utils/collectSystemInfo';
import { getConfig } from './utils/config';
import Analytics from 'electron-ga';
import { isNil } from 'ramda';
import { ipcRenderer } from 'electron';
import { getMachineIdSync } from './utils/userid';

let analytics = null;

export const googleAnalytics = ({ 
    send:(type:string,load:any) => 
        getConfig()
        .then(
            (config) => {
                if(config.shouldSendStatistics){ 
                    if(isNil(analytics)){
                        collectSystemInfo()
                        .then(
                            (sysInfo) => {
                                analytics = new Analytics(
                                    'UA-113407516-1',
                                    {
                                        userId:getMachineIdSync(),
                                        appName:"tasklist",
                                        appVersion:sysInfo.version,
                                        language:sysInfo.userLanguage,
                                        userAgent:navigator.userAgent,
                                        viewport:`${sysInfo.viewportSize.width}x${sysInfo.viewportSize.height}`,
                                        screenResolution:`${sysInfo.screenResolution.width}x${sysInfo.screenResolution.height}`
                                    }
                                );
                                analytics.send(type,load);
                            }
                        )
                    }else{
                        analytics.send(type,load); 
                    }
                }
            }            
        ) 
});     
