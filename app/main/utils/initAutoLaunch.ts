import { AppName } from "./AppName";

const AutoLaunch = require('auto-launch');

export let initAutoLaunch = (shouldEnable:boolean) : Promise<void> => {
    let appAutoLauncher = new AutoLaunch({name: AppName, isHidden: true});

    return appAutoLauncher.isEnabled()
    .then((enabled:boolean) => {
        if(enabled){
           appAutoLauncher.disable();
        }
    })
    .then(() => { 
        if(shouldEnable){
           appAutoLauncher.enable();
        }
    })
    .catch((err) => console.log(err));
};