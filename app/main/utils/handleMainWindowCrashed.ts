import { loadApp } from './loadApp';
import { BrowserWindow } from 'electron';
import { not } from 'ramda';
import { isDev } from '../../utils/isDev';
import { server } from '../../utils/couchHost';
const { crashReporter } = require('electron');

crashReporter.start({
    productName:`Tasklist`,
    companyName:`Pixelbutler`,
    submitURL:`${server}/crash`,
    uploadToServer:true,
    ignoreSystemCrashHandler:true
})

export let handleMainWindowCrashed = (mainWindow:BrowserWindow) => 
    (event,killed) => { 
        if(killed){ return }

        loadApp(mainWindow)
        .then(() => {    
            mainWindow.webContents.send("loaded",null,mainWindow.id);
            mainWindow.show();
            mainWindow.focus(); 

            if(isDev()){ mainWindow.webContents.openDevTools(); }  
        }) 
    };