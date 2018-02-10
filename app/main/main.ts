import { loadApp, dev, loadQuickEntry } from './loadApp'; 
import fs = require('fs');     
import electron = require('electron');
import { ipcMain,dialog,app,BrowserWindow,Menu,MenuItem,globalShortcut,BrowserView,Tray } from 'electron';
import { Listeners } from "./listeners";
import { initWindow, initQuickEntry } from "./initWindow";
import { isNil } from 'ramda'; 
const os = require('os');
let path = require("path");
const log = require("electron-log");
const storage = require('electron-json-storage'); 
storage.setDataPath(os.tmpdir()); 

export let mainWindow : BrowserWindow;   
export let quickEntry : BrowserWindow;   
export let listeners : Listeners;  
export let tray : Tray;

const CtrlAltT : string = 'Ctrl+Alt+T';
const CtrlD : string = 'Ctrl+D';
const shouldQuit = app.makeSingleInstance(
    (commandLine, workingDirectory) => {
        if(mainWindow){
            if(mainWindow.isMinimized()){ mainWindow.restore() }
            mainWindow.focus();
        } 
    }
); 
  

let createTray = () => {
    tray = new Tray(path.resolve("icon.ico"))
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Hide', 
            type: 'normal', 
            click:() => {
                let windows = BrowserWindow.getAllWindows();
                windows.forEach((w) => w.hide())
            }
        },
        {
            label: 'Restore', 
            type: 'normal', 
            click:() => {
                let windows = BrowserWindow.getAllWindows();
                windows.forEach((w) => w.show())
            }
        },
        {
            label:'Quit', 
            type: 'normal', 
            click:() => app.quit()
        },
    ])

    tray.on('click', () => {
        let windows = BrowserWindow.getAllWindows();
        if(mainWindow){
            if(mainWindow.isVisible()){ windows.forEach((w) => w.hide()) }
            else{ windows.forEach((w) => w.show()) }
        }
    })


    tray.setToolTip('Tasklist')
    tray.setContextMenu(contextMenu)
}


let onCtrlAltT = () : void => {
    if(isNil(quickEntry)){ return }  
    
    if(quickEntry.isVisible()){
       quickEntry.hide();
    }else{
       quickEntry.show();
       quickEntry.focus();
    }
} 
  

let onCtrlD = () : void => mainWindow.webContents.openDevTools();   


let preventAnnoyingErrorPopups = () => dialog.showErrorBox = (title, content) => {};
  

let initListeners = (window:BrowserWindow) => new Listeners(window);


let onAppLoaded = () : void => {    
    mainWindow.webContents.send("loaded");
    if(dev()){ mainWindow.webContents.openDevTools() }
}


let onQuickEntryLoaded = () : void => {     
    quickEntry.webContents.send("loaded");
    quickEntry.on('blur', () => {   
        quickEntry.hide()  
    }) 
    //if(dev()){ quickEntry.webContents.openDevTools() }
}


let getWindowSize = () : {width:number,height:number} => {
    let mainWindowWidth : number = dev() ? 100 : 60;  
    let mainWindowHeight : number = dev() ? 100 : 70; 
    let workingArea = electron.screen.getPrimaryDisplay().workAreaSize; 
    let width = mainWindowWidth*(workingArea.width/100); 
    let height = mainWindowHeight*(workingArea.height/100); 
 
    if(!dev()){ width = width <= 800 ? width : 800; } 
    
    return {width,height}  
};  


let getQuickEntrySize = () : {width:number,height:number} => {
    let workingArea = electron.screen.getPrimaryDisplay().workAreaSize;
    let width = 40*(workingArea.width/100); 
    let height = 25*(workingArea.height/100); 
    return {width,height}  
};  


let onReady = () => {      
    if(shouldQuit){
       app.quit(); 
       return;
    }  

    createTray();

    if(globalShortcut){
       globalShortcut.register(CtrlAltT, onCtrlAltT);  
       globalShortcut.register(CtrlD, onCtrlD);
    }  

    preventAnnoyingErrorPopups(); 
    mainWindow = initWindow(getWindowSize());  
    quickEntry = initQuickEntry(getQuickEntrySize());
    quickEntry.hide(); 
    quickEntry.setSkipTaskbar(true)
    listeners = initListeners(mainWindow);

    loadApp(mainWindow).then(onAppLoaded);   
    loadQuickEntry(quickEntry).then(onQuickEntryLoaded);   
};               


app.on('ready', onReady);    


process.on( 
    "unchaughtException" as any,
    (error) => {
        if(isNil(mainWindow)){ 
            console.log(error);
        }else{ 
            mainWindow.webContents.send("error", error) 
        }
    }
);


app.on(     
   'window-all-closed', 
    () => { 

        if(globalShortcut){
           globalShortcut.unregister(CtrlAltT);
           globalShortcut.unregister(CtrlD);
        }
          
        if(process.platform !== 'darwin'){ 
           app.quit();   
        } 
    }    
);     
   
   
 
         
                

  
  

  
     
 