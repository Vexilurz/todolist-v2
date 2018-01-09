import { loadApp, dev } from './loadApp'; 
import fs = require('fs');     
import electron = require('electron');
import {ipcMain,dialog,app,BrowserWindow,Menu,MenuItem,globalShortcut, BrowserView} from 'electron';
import { Listeners } from "./listeners";
import { initWindow } from "./initWindow";
import { autoUpdater } from "electron-updater";
import { isNil } from 'ramda';


class AppUpdater {
    constructor() {
        const log = require("electron-log");
        log.transports.file.level = "info";
        autoUpdater.logger = log;
        autoUpdater.checkForUpdatesAndNotify();
    }   
}  
 
export let mainWindow : BrowserWindow;   
export let listeners : Listeners; 
 

const CtrlAltT : string = 'Ctrl+Alt+T';

let onCtrlAltT = () : void => {
    if(isNil(mainWindow)){
       return; 
    }        
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send(CtrlAltT);
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

    preventAnnoyingErrorPopups(); 

    mainWindow = initWindow(getWindowSize());  

    listeners = initListeners(mainWindow);

    loadApp(mainWindow).then(onAppLoaded);     
}               


process.on("unchaughtException" as any,(error) => console.log(error)); 
  
app.on('ready', onReady);  
 
app.on(     
   'window-all-closed', 
    () => { 
        globalShortcut.unregister(CtrlAltT);
        if(process.platform !== 'darwin'){ 
           app.quit();  
        }
    }    
);     
   
   
 
         
                

  
  

  
     
 