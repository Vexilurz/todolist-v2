import { handleMainWindowCrashed } from './utils/handleMainWindowCrashed';
import { createTray } from './utils/createTray';
import { initAutoUpdater } from './utils/initAutoUpdater';
import { handleQuickEntryCrashed } from './utils/handleQuickEntryCrashed';
import { dialog,app,BrowserWindow,Tray } from 'electron';
import { Listeners } from "./listeners";
import { not } from 'ramda';  
import { getWindowSize } from './utils/getWindowSize';
import { Config } from '../types'; 
import { getConfig } from './utils/getConfig';
import { initWindow, initQuickEntry, initNotification } from './utils/initWindow';
import { initAutoLaunch } from './utils/initAutoLaunch';
import { AppName } from './utils/AppName';
import { handleMainWindowUnresponsive } from './utils/handleMainWindowUnresponsive';
import { loadNotification, loadQuickEntry, loadApp } from './utils/loadApp';
import { onAppLoaded } from './utils/onAppLoaded';
import { onNotificationLoaded } from './utils/onNotificationLoaded'; 
import { onQuickEntryLoaded } from './utils/onQuickEntryLoaded'; 
import { onWindowAllClosed } from './utils/onWindowAllClosed';
import { registerAllGlobalShortcuts, registerAllLocalShortcuts, toggleGlobalShortcut, toggleLocalShortcut } from './shortcuts';
const storage = require('electron-json-storage');
const os = require('os');
const path = require("path");
const configPath = path.resolve(os.homedir(), "Documents", "tasklist");
storage.setDataPath(configPath);

import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
 
export let mainWindow : BrowserWindow;   
export let quickEntry : BrowserWindow;   
export let notification : BrowserWindow;
export let listeners : Listeners;  
export let dateCalendar : BrowserWindow; 
export let tray : Tray;


app.requestSingleInstanceLock()

const shouldQuit = app.on('second-instance',
    (commandLine, workingDirectory) => {
        if(mainWindow){
            mainWindow.show();
            mainWindow.restore();  
            mainWindow.focus();
        } 
    }
);  



let onReady = (config:Config) => {  
    let {disableReminder, enableShortcutForQuickEntry} = config;
    let mainWindowSize = getWindowSize();
    let options = {maximizable:true, show:false};
    let onMainWindowReady = (handler:BrowserWindow) => {};

    // if(shouldQuit){ app.exit(); return; }  
      
    dialog.showErrorBox = (title, content) => {};
   
    mainWindow = initWindow(mainWindowSize, options, onMainWindowReady);    
    quickEntry = initQuickEntry({width:500,height:300});  
    notification = initNotification({width:250,height:200});  
    tray = createTray(mainWindow);
 

    listeners = new Listeners(mainWindow);
    registerAllGlobalShortcuts(); 
    registerAllLocalShortcuts(); 

    toggleGlobalShortcut(enableShortcutForQuickEntry, 'Ctrl+Alt+T');
    initAutoUpdater();
    initAutoLaunch(enableShortcutForQuickEntry && not(disableReminder));   
    

    mainWindow.on('show', () => tray.setToolTip(`Hide ${AppName}`));
    mainWindow.on('hide', () => tray.setToolTip(`Show ${AppName}`));
    mainWindow.on('focus', () => {  
        mainWindow['focused'] = true; 
        toggleLocalShortcut(true, 'Ctrl+B');
    }); 
    mainWindow.on('blur', () => { 
        mainWindow['focused'] = false; 
        toggleLocalShortcut(false, 'Ctrl+B');
    }); 
    mainWindow.on('unresponsive', handleMainWindowUnresponsive);
    mainWindow.webContents.on('crashed', handleMainWindowCrashed(mainWindow));
    quickEntry.webContents.on('crashed', handleQuickEntryCrashed(quickEntry));
    

    loadNotification(notification).then(() => onNotificationLoaded(notification));
    loadQuickEntry(quickEntry).then(() => onQuickEntryLoaded(quickEntry));  
    loadApp(mainWindow).then(() => onAppLoaded(mainWindow));  
};                



app.on('ready', () => {
    installExtension(REACT_DEVELOPER_TOOLS)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));
        
    getConfig().then((config) => onReady(config))
});    



app.on('window-all-closed', onWindowAllClosed);     



process.on( 
    "unchaughtException" as any,
    error => {
        console.log(error);
        if(mainWindow){
           mainWindow.webContents.send("error", error);
        }
    }
);


 

   
          
                

  
  

  
     
 