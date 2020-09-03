import { quickEntry, mainWindow } from './main';
import { isNil, forEachObjIndexed, ifElse, identity, keys, contains } from 'ramda';  
const localShortcut = require('electron-localshortcut');
import { globalShortcut } from 'electron';



let globalShortcuts = {
    'Ctrl+Alt+T':() => {
        if(isNil(quickEntry)){ return }

        quickEntry.show();
        quickEntry.focus();
        quickEntry.setSkipTaskbar(false); 
        quickEntry.webContents.send("focus"); 
    },
    'Ctrl+Alt+D+P':() => {
        if(!mainWindow['focused'] ){ return }

        mainWindow.webContents.openDevTools()
    }
};

let localShortcuts = {
    'Ctrl+B':() => {
        if(!mainWindow['focused'] ){ return }
        if(isNil(mainWindow)){ return }
 
        mainWindow.webContents.send("toggle");
    }
};


 
export let registerAllLocalShortcuts = () : void => {
    forEachObjIndexed(
        (value:Function,key:string) => localShortcut.register(key, value)  
    )(localShortcuts)
}; 
 


export let registerAllGlobalShortcuts = () : void => {
    forEachObjIndexed(
        (value:() => void,key:string) => globalShortcut.register(key, value)          
    )(globalShortcuts)
}; 



export let unregisterAllLocalShortcuts = () => localShortcut.unregisterAll();



export let unregisterAllGlobalShortcuts = () => globalShortcut.unregisterAll();



export let toggleShortcut = (enable:boolean, shortcut:string) : void => {
    let localShortcutsKeys = keys(localShortcuts);
    let globalShortcutsKeys = keys(globalShortcuts);

    if(contains(shortcut)(localShortcutsKeys)){
       toggleLocalShortcut(enable, shortcut);
    }else if(contains(shortcut)(globalShortcutsKeys)){
       toggleGlobalShortcut(enable, shortcut);
    }
};
    


export let toggleGlobalShortcut : (enable:boolean, shortcut:string) => void =
    ifElse(
        identity,
        (enable, shortcut) => globalShortcut.register(shortcut, globalShortcuts[shortcut]),
        (enable, shortcut) => globalShortcut.unregister(shortcut)
    ); 



export let toggleLocalShortcut : (enable:boolean, shortcut:string) => void =
    ifElse(
        identity,
        (enable, shortcut) => localShortcut.register(shortcut, localShortcuts[shortcut]),
        (enable, shortcut) => localShortcut.unregister(shortcut)
    ); 
