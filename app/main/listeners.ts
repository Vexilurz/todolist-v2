import { mainWindow } from './main';
import { loadApp, dev } from './loadApp'; 
import * as electron from 'electron'; 
import {ipcMain,dialog,app,BrowserWindow,Menu,MenuItem} from 'electron';
import { initWindow } from './initWindow';
import { remove } from 'ramda';
let uniqid = require("uniqid");
const {shell} = require('electron');   

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




interface RegisteredListener{  
     name : string, 
     callback : (event:any,...args:any[]) => void
}; 
  



 
export class Listeners{
       
    registeredListeners : RegisteredListener[]; 

    spawnedWindows : any[];
 
    constructor(window){
  
      this.spawnedWindows = [mainWindow];  
 
      this.registeredListeners = [   
            { 
                name : "cloneWindow", 
                callback : (event, store)  => onCloneWindow(event,store,this.spawnedWindows)},  
            { 
                name : "reload", 
                callback : (event, id:number) => onReload(event,id,this.spawnedWindows)},  
            { 
                name : "action", 
                callback : (event, action : any, id : number) => onAction(event,action,id,this.spawnedWindows)
            },
            {
                name:"folder",
                callback : (event) => selectFolder().then((path:string) => event.sender.send("folder", {foldername:path}))  
            }, 
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











