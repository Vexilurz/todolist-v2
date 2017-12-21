import { mainWindow } from './main';
import { loadApp } from './loadApp'; 
import * as electron from 'electron'; 
import {ipcMain,dialog,app,BrowserWindow,Menu,MenuItem} from 'electron';
import { initWindow } from './initWindow';
import { remove } from '../utils';
let uniqid = require("uniqid");
const {shell} = require('electron');  
 

interface RegisteredListener{ 
     name : string, 
     callback : (event:any,...args:any[]) => void
};
  

 
export class Listeners {
      
    registeredListeners : RegisteredListener[]; 


    spawnedWindows : any[];
 
 
    constructor(window){
  



      this.spawnedWindows = [mainWindow];  
 



      this.registeredListeners = [  


            { 
                name : "cloneWindow",
                callback : (event, store) => {

                    let workingArea = electron.screen.getPrimaryDisplay().workAreaSize;

                    let width = 40*(workingArea.width/100);  
                    let height = 80*(workingArea.height/100); 

                    let newWindow = initWindow({width, height, transparent:false}); 
                    
                    this.spawnedWindows.push(newWindow);

                    this.spawnedWindows = this.spawnedWindows.filter( w => !w.isDestroyed() );
                    
                    let storeWithId = {...store, ...{ windowId:newWindow.id }};
 
                    loadApp(newWindow)     
                    .then(() => {        
                        newWindow.webContents.send("loaded", {
                            type:"clone",  
                            load:storeWithId  
                        });
                        newWindow.webContents.openDevTools();    
                    });      

                } 
            }, 
            
            
            {  
                name : "reload", 
                callback : (event, id:number) => { 
                    
  
                       this.spawnedWindows = this.spawnedWindows.filter( w => !w.isDestroyed());
  
                       let browserWindow = this.spawnedWindows.find( browserWindow => browserWindow.id===id );  
  
                       if(browserWindow===undefined || browserWindow===null)
                          return;

  
                       browserWindow.reload();  

                        loadApp(browserWindow)
                        .then(
                          () => browserWindow.webContents.send(
                                    "loaded", 
                                    {
                                        type:"reload", 
                                        load:browserWindow.id
                                    }
                                )
                        );  

                       
  
  
                }     
            }, 


            {
                name : "action",
                callback : (event, action : any, id : number) => {

                    if(id===undefined || id===null)
                       return;  
 
                    let windows = this.spawnedWindows.filter( w => !w.isDestroyed());

                    for(let i=0; i<windows.length; i++){

                        if(windows[i].id===id)
                           continue;     
                        
                        windows[i].webContents.send("action", {...action,...{kind:"external"}});

                    }

                }
            }, 


            { 
                name : "close", 
                callback : (event, id:number) => {

                    this.spawnedWindows = this.spawnedWindows.filter( w => !w.isDestroyed());

                    let browserWindow = this.spawnedWindows.find( browserWindow => browserWindow.id===id );  
                    

                    if(browserWindow===undefined || browserWindow===null)
                       return;
                        
                    browserWindow.close(); 

                }
            }, 


            { 

                name : "hide", 
                callback : (event, id:number) => {

                    this.spawnedWindows = this.spawnedWindows.filter( w => !w.isDestroyed());

                    let browserWindow = this.spawnedWindows.find( browserWindow => browserWindow.id===id );  
                    

                    if(browserWindow===undefined || browserWindow===null)
                       return;
                   

                    browserWindow.minimize(); 

                } 
    
            },  
 

            { 
                
              name : "size", 
              callback : (event, id:number, fullscreen:boolean) => { 

                    this.spawnedWindows = this.spawnedWindows.filter( w => !w.isDestroyed());

                    const {width,height} = electron.screen.getPrimaryDisplay().workAreaSize;

                    let browserWindow = this.spawnedWindows.find( browserWindow => browserWindow.id===id );  
                     

                    if(browserWindow===undefined || browserWindow===null)
                       return;
                    
                    if(fullscreen)
                        browserWindow.setSize(width,height);
                    else 
                        browserWindow.setSize(960,720);  
                        
                        
                    browserWindow.center(); 
 
              }
 
            }
      ];    
      

      this.startToListenOnAllChannels(); 


    }; 
 




    registerListener(listener : RegisteredListener) : void{

        this.registeredListeners.push(listener);

    };  




    unregisterListener(name : string) : void{

        let idx = this.registeredListeners.findIndex((listener : RegisteredListener) => listener.name==name)
 
        if(idx===-1)
           return;
            
        this.registeredListeners = remove(this.registeredListeners, idx); 

        ipcMain.removeAllListeners(name); 

    }; 
  


 
    startToListenOnAllChannels = () => 
        this.registeredListeners.map(({name,callback}) => ipcMain.on(name, callback));  
    

    stopToListenOnAllChannels = () => 
        this.registeredListeners.map(({name,callback}) => ipcMain.removeAllListeners(name));  
    

};         











