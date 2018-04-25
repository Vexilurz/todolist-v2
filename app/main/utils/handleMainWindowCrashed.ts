import { loadApp } from './loadApp';
import { BrowserWindow } from 'electron';
import { not } from 'ramda';
import { isDev } from '../../utils/isDev';

export let handleMainWindowCrashed = (mainWindow:BrowserWindow) => 
    (event,killed) => {
        if(killed){ return; }

        loadApp(mainWindow)
        .then(() => {    
            mainWindow.webContents.send("loaded",null,mainWindow.id);
            mainWindow.show();
            mainWindow.focus(); 

            if(isDev()){ mainWindow.webContents.openDevTools(); }  
        }) 
    };