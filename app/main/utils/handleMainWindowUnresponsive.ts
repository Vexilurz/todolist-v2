import { isNil } from 'ramda';
import { BrowserWindow, dialog, app } from 'electron';
import { AppName } from './AppName';


export let handleMainWindowUnresponsive = (mainWindow:BrowserWindow) => (e) => {
    if(isNil(mainWindow)){ return }
    
    dialog.showMessageBox(
        mainWindow,
        {
            type: "none", 
            buttons: ["Restart application", "Wait"],
            title: `${AppName} is not responding`,
            message: `${AppName} is not responding`
        }).then(result => {
            let restart = 0;
            if(result.response===restart){
               app.relaunch();
               app.exit(0);
            }
        })    
};