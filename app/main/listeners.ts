import { mainWindow } from './main';
import { loadApp, dev } from './loadApp'; 
import * as electron from 'electron'; 
import {ipcMain,dialog,app,BrowserWindow,Menu,MenuItem,FileFilter} from 'electron';
import { initWindow } from './initWindow';
import { remove } from 'ramda';
let uniqid = require("uniqid");  
const os = require('os');
const storage = require('electron-json-storage');
storage.setDataPath(os.tmpdir());
import { autoUpdater } from "electron-updater";
const log = require("electron-log");

let initAutoUpdater = () => {

    if(dev()){
        log.transports.file.level = "info";
        autoUpdater.logger = log; 
    };

    autoUpdater.autoDownload = false; 
    autoUpdater.on(
        'error', 
        (error) => mainWindow.webContents.send("error",error)
    );

    autoUpdater.on( 
        'download-progress', 
        (progress) => mainWindow.webContents.send("progress",progress)
    );
}     

let getClonedWindowDimensions = () => {
    let workingArea = electron.screen.getPrimaryDisplay().workAreaSize;
    let clonedWindowWidth : number =  dev() ? 100 : 30;
    let clonedWindowHeight : number = dev() ? 100 : 80;  
    let width = clonedWindowWidth*(workingArea.width/100);  
    let height = clonedWindowHeight*(workingArea.height/100); 
    return {width,height};
}

interface RegisteredListener{  
     name : string, 
     callback : (event:any,...args:any[]) => void
}; 
  

export class Listeners{
       
    registeredListeners : RegisteredListener[]; 
    spawnedWindows : any[];
    
    constructor(window){
  
      this.spawnedWindows = [mainWindow];  

      initAutoUpdater(); 
 
      this.registeredListeners = [ 
            {
                name:"downloadUpdates",
                callback : (event) => {
                    autoUpdater 
                    .checkForUpdates()
                    .then((updateCheckResult) => autoUpdater.downloadUpdate(updateCheckResult.cancellationToken))
                    .then((path) => mainWindow.webContents.send("downloadUpdates",path))
                }
            }, 
            {
                name:"checkForUpdates",
                callback : (event) => {
                    autoUpdater
                    .checkForUpdates()
                    .then((updateCheckResult) => mainWindow.webContents.send("checkForUpdates",updateCheckResult))
                }
            },
            {
                name:"quitAndInstall",
                callback : (event) => autoUpdater.quitAndInstall(true,true)
            },
            {  
                name : "reload", 
                callback : (event) => {
                    mainWindow.reload();  
                    loadApp(mainWindow).then(() => mainWindow.webContents.send("loaded"));   
                }
            },  
            {
                name : "closeClonedWindows",
                callback : (event) => { 
                    this.spawnedWindows
                    .filter(w => !w.isDestroyed())
                    .forEach((window) => window.id===mainWindow.id ? null : window.destroy())
                    this.spawnedWindows = [mainWindow]; 
                    event.sender.send("closeClonedWindows");  
                }   
            },
            { 
                name : "store", 
                callback : (event, store) => {
                    let newWindow = initWindow(getClonedWindowDimensions()); 
                    this.spawnedWindows.push(newWindow); 
                    this.spawnedWindows = this.spawnedWindows.filter(w => !w.isDestroyed());
                    loadApp(newWindow)
                    .then(
                        () => {
                            newWindow.webContents.send("loaded", store); 
                            if(dev()){ newWindow.webContents.openDevTools() }
                        }   
                    );  
                }
            },  
            { 
                name : "action", 
                callback : (event, data:{id:number, action:{type:string,load:any}} ) => {
                    let {id,action} = data;
                    type kind = "external";
                    let kind : kind = "external";
                    let windows = this.spawnedWindows.filter(w => !w.isDestroyed());
                    for(let i=0; i<windows.length; i++){
                        if(windows[i].id===id){ continue }   
                        windows[i].webContents.send("action", {...action, kind});
                    }  
                }
            }
        ];     
      
        this.startToListenOnAllChannels(); 
    } 
 

    registerListener(listener : RegisteredListener) : void{
        this.registeredListeners.push(listener);
    }  
    

    unregisterListener(name : string) : void{
        let idx = this.registeredListeners.findIndex((listener : RegisteredListener) => listener.name==name)
        if(idx===-1){ return }
        this.registeredListeners = remove(idx, 1, this.registeredListeners); 
        ipcMain.removeAllListeners(name); 
    } 
  
 
    startToListenOnAllChannels = () => {
        this.registeredListeners.map(({name,callback}) => ipcMain.on(name, callback));  
    }
    
 
    stopToListenOnAllChannels = () => {
        this.registeredListeners.map(({name,callback}) => ipcMain.removeAllListeners(name));  
    }
}         











