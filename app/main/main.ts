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
         prepend, cond, isNil, intersection, insert, add, findIndex, filter, reject } from 'ramda'; 
import * as R from 'ramda';  
import { Listeners } from "./listeners";
import { initWindow } from "./initWindow";
 
 
let preventAnnoyingErrorPopups = () => dialog.showErrorBox = (title, content) => {};

 
export let mainWindow;   
export let listeners;
 
 
let onReady = () => {  
    preventAnnoyingErrorPopups();   
    mainWindow = initWindow(); 
     
    listeners = new Listeners(mainWindow);
   
    loadApp(mainWindow)  
    .then(() => { 
      mainWindow.webContents.send("loaded");
      //mainWindow.webContents.openDevTools();   
    });    
}    
  
 
process.on("unchaughtException" as any,(error) => console.log(error)); 
 

app.on('ready', onReady); 


let clearDir = (directory) => new Promise( resolve => {
    
       fs.readdir( 
           directory, 
          (err, files)  => compose(
                               (done : Promise<any>) => done.then( 
                                  () => fs.rmdir(directory, () => resolve())
                               ),
                               (promises) => Promise.all(promises),
                               map((file:string) =>  
                                   ifElse(
                                     (pathToFile) => fs.lstatSync(pathToFile).isDirectory(),
   
                                     (pathToFile) => clearDir(pathToFile),
   
                                     (pathToFile) => new Promise(resolve => fs.unlink(pathToFile, () => resolve()))
                                   )(path.join(directory, file))
                               )  
                           )(files)  
       ); 
     
   });


app.on(     
  'window-all-closed', 
   () => {
        if(process.platform !== 'darwin') 
           app.quit();  
   }    
);    
   
   
 
         
               

  
  

  
     
 