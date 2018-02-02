import { loadApp, dev } from './loadApp'; 
import fs = require('fs');     
import electron = require('electron');
import { ipcMain,dialog,app,BrowserWindow,Menu,MenuItem,globalShortcut,BrowserView } from 'electron';
import { Listeners } from "./listeners";
import { initWindow } from "./initWindow";
import { autoUpdater } from "electron-updater";
import { isNil } from 'ramda';
const os = require('os');
let path = require("path");
const log = require("electron-log");
const storage = require('electron-json-storage');


storage.setDataPath(os.tmpdir()); 


let update = () => {
    log.transports.file.level = "info";
    autoUpdater.logger = log;
    
    autoUpdater.on('checking-for-update', () => {
        console.log('Checking for update...');
    })

    autoUpdater.on('update-available', (info) => {
        console.log('Update available.');
    })

    autoUpdater.on('update-not-available', (info) => {
        console.log('Update not available.');
    })

    autoUpdater.on('error', (err) => {
        console.log('Error in auto-updater. ' + err);
    })

    autoUpdater.on('download-progress', (progressObj) => {
        let log_message = "Download speed: " + progressObj.bytesPerSecond;
        log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
        log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
        console.log(log_message);
    })

    autoUpdater.on('update-downloaded', (info) => {
        console.log('Update downloaded');
    });

    autoUpdater.checkForUpdates()
    .then(
        (result) => console.log("checkForUpdatesAndNotify",result)
    );
}    


 
export let mainWindow : BrowserWindow;   
export let listeners : Listeners; 

const CtrlAltT : string = 'Ctrl+Alt+T';
const CtrlD : string = 'Ctrl+D';

let onCtrlAltT = () : void => {
    if(isNil(mainWindow)){
       return; 
    }        
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send(CtrlAltT);
} 
  

let onCtrlD = () : void => {
    mainWindow.webContents.openDevTools();   
}


let preventAnnoyingErrorPopups = () => dialog.showErrorBox = (title, content) => {};
 

let initListeners = (window:BrowserWindow) => new Listeners(window);


let onAppLoaded = () : void => {   

    mainWindow.webContents.send("loaded", {type:"open", load:mainWindow.id});

    if(dev()){
       mainWindow.webContents.openDevTools();   
    }
}


let getWindowSize = () : {width:number,height:number} => {
    let mainWindowWidth : number = dev() ? 100 : 60;  
    let mainWindowHeight : number = dev() ? 100 : 70; 
    let workingArea = electron.screen.getPrimaryDisplay().workAreaSize;
    let width = mainWindowWidth*(workingArea.width/100); 
    let height = mainWindowHeight*(workingArea.height/100); 
 
    if(!dev()){
        width = width <= 800 ? width : 800;  
    }

    return {width,height}  
}


let onReady = () => {  

    globalShortcut.register(CtrlAltT, onCtrlAltT);  
    globalShortcut.register(CtrlD, onCtrlD);  
    
    preventAnnoyingErrorPopups();
    update();
    mainWindow = initWindow(getWindowSize());  
    listeners = initListeners(mainWindow);
    loadApp(mainWindow).then(onAppLoaded );     
}               


process.on("unchaughtException" as any,(error) => console.log(error)); 
  
app.on('ready', onReady);  
 
app.on(     
   'window-all-closed', 
    () => { 
        globalShortcut.unregister(CtrlAltT);
        globalShortcut.unregister(CtrlD);
          
        if(process.platform !== 'darwin'){ 
           app.quit();   
        } 
    }    
);     
   
   
 
         
                

  
  

  
     
 