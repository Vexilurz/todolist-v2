import { collectSystemInfo } from './utils/collectSystemInfo';
import Analytics from 'electron-ga';
import { isNil } from 'ramda';
import { requestFromMain } from './utils/requestFromMain';

let analytics = null;

export const googleAnalytics = ({ 
    send:(type:string,load:any) => 
        requestFromMain("getConfig", [], (event, config) => config)
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
                                        userId:config.email,
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
