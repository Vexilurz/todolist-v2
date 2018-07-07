import { quickEntry, mainWindow } from './main';
import { isNil, forEachObjIndexed, ifElse, identity } from 'ramda';  
const electronLocalshortcut = require('electron-localshortcut');



let shortcuts = {
    'Ctrl+Alt+T':() => {
        if(isNil(quickEntry)){ return }

        quickEntry.show();
        quickEntry.focus();
        quickEntry.setSkipTaskbar(false); 
        quickEntry.webContents.send("focus"); 
    },

    'Ctrl+Alt+D':() => {
        if(!mainWindow['focused'] ){ return }

        mainWindow.webContents.openDevTools()
    },

    'Ctrl+B':() => {
        if(!mainWindow['focused'] ){ return }
        if(isNil(mainWindow)){ return }
 
        mainWindow.webContents.send("toggle");
    }
};


 
export let registerAllShortcuts = () : void => {
    forEachObjIndexed(
        (value:Function,key:string) => electronLocalshortcut.register(key, value)  
    )(shortcuts)
}; 
 


export let unregisterAllShortcuts = () => electronLocalshortcut.unregisterAll();



export let toggleShortcut : (enable:boolean, shortcut:string) => void =
    ifElse(
        identity,
        (enable, shortcut) => electronLocalshortcut.register(shortcut, shortcuts[shortcut]),
        (enable, shortcut) => electronLocalshortcut.unregister(shortcut)
    ); 
