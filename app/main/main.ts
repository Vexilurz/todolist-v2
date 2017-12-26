import { loadApp } from './loadApp'; 
import fs = require('fs');     
import electron = require('electron');
import {ipcMain,dialog,app,BrowserWindow,Menu,MenuItem} from 'electron';
import { Listeners } from "./listeners";
import { initWindow } from "./initWindow";
 

export let mainWindow;   
export let listeners; 


let mainWindowWidth : number = 70;
let mainWindowHeight : number = 80; 

 
let preventAnnoyingErrorPopups = () => dialog.showErrorBox = (title, content) => {};
 

let onReady = () => {  
    let workingArea = electron.screen.getPrimaryDisplay().workAreaSize;
 
    let width = mainWindowWidth*(workingArea.width/100); 
    let height = mainWindowHeight*(workingArea.height/100); 
 
    preventAnnoyingErrorPopups();     
     
    mainWindow = initWindow({width,height,transparent:false});          
        
    listeners = new Listeners(mainWindow);
   
    loadApp(mainWindow)    
    .then(() => {  

        mainWindow.webContents.send(
            "loaded",  
            {
                type:"open",
                load:mainWindow.id
            }
        ); 
  
        mainWindow.webContents.openDevTools();   

    });     
}            
 

process.on("unchaughtException" as any,(error) => console.log(error)); 
  

app.on('ready', onReady);  
 

app.on(     
  'window-all-closed', 
   () => {
        if(process.platform !== 'darwin') 
           app.quit();  
   }    
);    
   
   
 
         
                

  
  

  
     
 