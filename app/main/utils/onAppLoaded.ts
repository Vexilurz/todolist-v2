import { isDev } from './../../utils/isDev';
import {not} from 'ramda';
import { BrowserWindow } from 'electron';


export let onAppLoaded = (mainWindow:BrowserWindow) => {    
    mainWindow.webContents.send("loaded", null, mainWindow.id);

    if(isDev()){ mainWindow.webContents.openDevTools(); }  
};
