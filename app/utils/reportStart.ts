// import { googleAnalytics } from '../analytics';
import { collectSystemInfo } from './collectSystemInfo';
import { globalErrorHandler } from './globalErrorHandler';



export let reportStart = () => collectSystemInfo()
// .then(
//         ({ arch, cpus, platform, release, type }) => googleAnalytics.send(   
//            'event',    
//            {  
//                ec:'Start',   
//                ea:`
//                Application launched ${new Date().toString()}
//                System info :
//                arch ${arch}; 
//                cpus ${cpus.length};
//                platform ${platform};
//                release ${release};
//                type ${type}; 
//                `,  
//                el:'Application launched', 
//                ev:0
//            } 
//        ) 
//    )
//    .catch(err => globalErrorHandler(err));