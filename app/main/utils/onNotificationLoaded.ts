import { BrowserWindow } from 'electron';
import { isDev } from "../../utils/isDev";

export let onNotificationLoaded = (window:BrowserWindow) => {
    window.webContents.send("loaded");

    if(isDev()){ 
        window.webContents.openDevTools(); 
     } 
};
