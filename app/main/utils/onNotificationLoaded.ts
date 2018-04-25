import { BrowserWindow } from 'electron';

export let onNotificationLoaded = (window:BrowserWindow) => {
    window.webContents.send("loaded");
};
