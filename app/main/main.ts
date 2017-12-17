import { loadApp } from './loadApp'; 
import fs = require('fs');   
import request = require('request'); 
import path = require("path");
import http = require('http');
import url = require('url'); 
import child_process = require('child_process');  
let randomstring = require("randomstring");  
import electron = require('electron');
import {ipcMain,dialog,app,BrowserWindow,Menu,MenuItem} from 'electron';
import { compose, contains, toPairs, curry, replace, mergeAll, addIndex, ifElse,
         takeLast, map, fromPairs, isEmpty, flatten, defaultTo, range, all,
         prepend, cond, isNil, intersection, insert, add, findIndex, filter, reject, merge } from 'ramda'; 
import * as R from 'ramda';  
import { Listeners } from "./listeners";
import { initWindow } from "./initWindow";
 
 
export let mainWindow;   
export let listeners; 


 
let preventAnnoyingErrorPopups = () => dialog.showErrorBox = (title, content) => {};
 
let onReady = () => {  
    preventAnnoyingErrorPopups();   
    mainWindow = initWindow(
        merge(
            //{width:900,height:750} 
            electron.screen.getPrimaryDisplay().workAreaSize
        )({transparent:false})
    );        
        
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
  
//app.disableHardwareAcceleration(); 

app.on('ready', onReady);  
 

app.on(     
  'window-all-closed', 
   () => {
        if(process.platform !== 'darwin') 
           app.quit();  
   }    
);    
   
   
 
         
                

  
  

  
     
 