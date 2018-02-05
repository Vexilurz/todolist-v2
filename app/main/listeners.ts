import { mainWindow } from './main';
import { loadApp, dev } from './loadApp'; 
import * as electron from 'electron'; 
import {ipcMain,dialog,app,BrowserWindow,Menu,MenuItem, FileFilter} from 'electron';
import { initWindow } from './initWindow';
import { remove } from 'ramda';
let uniqid = require("uniqid");
const {shell} = require('electron');   
const os = require('os');
const storage = require('electron-json-storage');
storage.setDataPath(os.tmpdir());
const log = require("electron-log");
import { autoUpdater, UpdateCheckResult, UpdateInfo } from "electron-updater";


let getClonedWindowDimensions = () => {
    let workingArea = electron.screen.getPrimaryDisplay().workAreaSize;
    let clonedWindowWidth : number =  dev() ? 100 : 30;
    let clonedWindowHeight : number = dev() ? 100 : 80;  
    let width = clonedWindowWidth*(workingArea.width/100);  
    let height = clonedWindowHeight*(workingArea.height/100); 
    return {width,height};
}



let selectJsonDatabase = () : Promise<string> => 
    new Promise(
        resolve => {  
            dialog.showOpenDialog( 
                mainWindow,
                { 
                    title:`Select database file`,
                    buttonLabel:'Select',
                    properties:['openFile'],
                    filters:[ { 
                        extensions: ["json"],
                        name: ""
                    } ] 
                },  
                (value) => { 
                    if(value)    
                       resolve(value[0]); 
                    else
                       resolve(undefined);
                }
            ); 
        }  
    );



let selectFolder = () : Promise<string> => 
    new Promise(
        (resolve,reject) => {
            dialog.showOpenDialog( 
                mainWindow,
                { 
                    title:`Select data folder`,
                    buttonLabel:'Select',
                    properties:['openDirectory']
                },  
                (value) => {
                    if(value)   
                       resolve(value[0]); 
                    else
                       resolve(undefined);
                }
            ); 
        }    
    ); 
    

    
export let initAutoUpdater = () => {

    if(dev()){
        log.transports.file.level = "info";
        autoUpdater.logger = log; 
    }

    autoUpdater.autoDownload = false;
    autoUpdater.on('error', (err) => onError(err));
    autoUpdater.on('download-progress', (progress) => {
        mainWindow.webContents.send("download-progress",progress);
    });
}    
  


interface RegisteredListener{  
     name : string, 
     callback : (event:any,...args:any[]) => void
}; 
  

let onError = (e) => mainWindow.webContents.send("error", e);

 
export class Listeners{
       
    registeredListeners : RegisteredListener[]; 
    spawnedWindows : any[];
    
    constructor(window){
  
      this.spawnedWindows = [mainWindow];  
 
      this.registeredListeners = [   
            { 
                name : "installUpdates",
                callback : (event)  => {
                    autoUpdater.quitAndInstall(true,true)
                }   
            }, 
            { 
                name : "downloadUpdates",
                callback : (event)  => {
                    autoUpdater.checkForUpdates().then(
                        (updateCheckResult) => {
                            let {cancellationToken} = updateCheckResult;
                            autoUpdater.downloadUpdate(cancellationToken).then(
                                (path) => { 
                                    event.sender.send("downloadUpdates", path)
                                }
                            ); 
                        }
                    ) 
                } 
            }, 
            {  
                name : "checkForUpdates",
                callback : (event)  => {
                    autoUpdater.checkForUpdates().then(
                        (updateCheckResult:UpdateCheckResult) => {
                            event.sender.send("checkForUpdates", updateCheckResult);
                        }
                    )
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
                name : "reload", 
                callback : (event) =>{
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
            }, 
            {
                name:"jsonDatabase",
                callback : (event) => {
                    selectJsonDatabase().then(
                        (path:string) => event.sender.send("jsonDatabase",{path})
                    )
                }
            },
            {
                name:"folder",
                callback : (event) => {
                    selectFolder().then(
                        (path:string) => event.sender.send("folder", {foldername:path})
                    )  
                }
            }, 
            {
                name:"setStorage",
                callback : (event,data) => {
                    let {key, json} = data;
                    storage.set(key, json, (error) => {
                        if(error) onError(error);
                        event.sender.send("setStorage");
                    });
                }
            }, 
            { 
                name:"getStorage",
                callback : (event, key:string) => {
                    storage.get(
                        key, 
                        (error, data) => {
                            if (error){ onError(error) }   
                            event.sender.send("getStorage", data);
                        }
                    );
                }
            }, 
            {
                name:"clearStorage",
                callback : (event) => {
                    storage.clear(
                       (error) => {
                            if (error){ onError(error) }   
                            event.sender.send("clearStorage"); 
                        }
                    );  
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
 
        if(idx===-1){ 
           return
        }
            
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











