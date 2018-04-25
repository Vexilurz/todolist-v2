import { quickEntry, mainWindow } from './main';
import { 
    isNil, not, forEachObjIndexed, when, contains, compose, equals, 
    ifElse, reject, isEmpty, defaultTo, map, identity, toLower 
} from 'ramda';  
import { globalShortcut } from 'electron';



let shortcuts = {
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
    },

    'Ctrl+B':() => {
        if(!mainWindow['focused'] ){ return }
        if(isNil(mainWindow)){ return }
 
        mainWindow.webContents.send("toggle");
    }
};


 
export let registerAllShortcuts = () : void => {
    forEachObjIndexed(
        (value:Function,key:string) => globalShortcut.register(key, value)  
    )(shortcuts)
}; 
 


export let unregisterAllShortcuts = () => globalShortcut.unregisterAll();



export let toggleShortcut : (enable:boolean, shortcut:string) => void =
    ifElse(
        identity,
        (enable, shortcut) => globalShortcut.register(shortcut, shortcuts[shortcut]),
        (enable, shortcut) => globalShortcut.unregister(shortcut)
    ); 
