import { mainWindow } from './main';
import { loadApp, dev } from './loadApp'; 
import * as electron from 'electron'; 
import {ipcMain,dialog,app,BrowserWindow,Menu,MenuItem} from 'electron';
import { initWindow } from './initWindow';
import { remove } from 'ramda';
let uniqid = require("uniqid");
const {shell} = require('electron');   
const os = require('os');
const storage = require('electron-json-storage');
storage.setDataPath(os.tmpdir());
const log = require("electron-log");
import { autoUpdater, UpdateCheckResult, UpdateInfo } from "electron-updater";


type kind = "external";


let onAction = (event, action : any, id : number, spawnedWindows:BrowserWindow[]) : void => {
    let kind : kind = "external";
 
    if(id===undefined || id===null){
       return 
    }

    let windows = spawnedWindows.filter( w => !w.isDestroyed());
 
    for(let i=0; i<windows.length; i++){

        if(windows[i].id===id)
           continue;     
        
        windows[i].webContents.send("action", {...action, kind});
    }  
} 


let onReload = (event, id:number, spawnedWindows:BrowserWindow[]) : void => { 
                     
    spawnedWindows = spawnedWindows.filter( w => !w.isDestroyed() );

    let browserWindow = spawnedWindows.find( browserWindow => browserWindow.id===id );  

    if(browserWindow===undefined || browserWindow===null){
       return   
    }

    browserWindow.reload();  

    loadApp(browserWindow)
    .then(() => browserWindow.webContents.send(
        "loaded", 
        {type:"reload",load:browserWindow.id} 
    ));   
} 
 

let onCloneLoaded = (newWindow:BrowserWindow, storeWithId:any) => {       

    newWindow.webContents.send("loaded", {type:"clone",load:storeWithId}); 

    if(dev()){
        newWindow.webContents.openDevTools();    
    }
}
 

let onCloneWindow = (event, store, spawnedWindows:BrowserWindow[]) : void => { 

    let workingArea = electron.screen.getPrimaryDisplay().workAreaSize;
    let clonedWindowWidth : number =  dev() ? 100 : 30;
    let clonedWindowHeight : number = dev() ? 100 : 80;  
    
    let width = clonedWindowWidth*(workingArea.width/100);  
    let height = clonedWindowHeight*(workingArea.height/100); 
     
    let newWindow = initWindow({width, height}); 
    
    spawnedWindows.push(newWindow); 

    spawnedWindows = spawnedWindows.filter(w => !w.isDestroyed());
    
    let storeWithId = {...store, windowId:newWindow.id}; 

    loadApp(newWindow).then(() => onCloneLoaded(newWindow,storeWithId)); 
} 



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
    log.transports.file.level = "info";
    autoUpdater.logger = log; 
    autoUpdater.autoDownload = false;

    autoUpdater.on('error', (err) => {
        mainWindow.webContents.send("error", err);
    });
 
    autoUpdater.on('download-progress', (progress) => {
        mainWindow.webContents.send("download-progress",progress);
    });
}    
  


interface RegisteredListener{  
     name : string, 
     callback : (event:any,...args:any[]) => void
}; 
  

let onError = (e) => console.log(e);

 
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
                name : "cloneWindow", 
                callback : (event, store)  => onCloneWindow(event,store,this.spawnedWindows)
            },  
            { 
                name : "reload", 
                callback : (event, id:number) => onReload(event,id,this.spawnedWindows)
            },  
            { 
                name : "action", 
                callback : (event, action : any, id : number) => onAction(event,action,id,this.spawnedWindows)
            }, 
            {
                name:"folder",
                callback : (event) => selectFolder()
                                      .then(
                                        (path:string) => event.sender.send("folder", {foldername:path})
                                      )  
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











