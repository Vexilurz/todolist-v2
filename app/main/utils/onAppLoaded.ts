import { isDev } from './../../utils/isDev';
import {not} from 'ramda';
import { BrowserWindow } from 'electron';


export let onAppLoaded = (mainWindow:BrowserWindow, shouldHideApp:boolean) => {    
    mainWindow.webContents.send("loaded", null, mainWindow.id);

    if(not(shouldHideApp)){ mainWindow.focus(); }

    if(isDev()){ mainWindow.webContents.openDevTools(); }  
};
