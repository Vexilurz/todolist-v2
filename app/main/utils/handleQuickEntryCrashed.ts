import { isDev } from './../../utils/isDev';
import { loadQuickEntry } from './loadApp';
import { BrowserWindow } from 'electron';

export let handleQuickEntryCrashed = (quickEntry:BrowserWindow) => (event,killed) => {
    if(killed){ return; }

    loadQuickEntry(quickEntry) 
    .then(
        () => {
            quickEntry.webContents.send("loaded", quickEntry.id); 

            if(isDev()){ quickEntry.webContents.openDevTools(); } 
        }
    );  
};