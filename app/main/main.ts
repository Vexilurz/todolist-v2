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
const os = require('os');
const storage = require('electron-json-storage');
 
let tempFolder = os.tmpdir();

storage.setDataPath(tempFolder);
 

export let mainWindow;   
export let listeners;


 
let preventAnnoyingErrorPopups = () => dialog.showErrorBox = (title, content) => {};
 
let onReady = () => {  
    preventAnnoyingErrorPopups();   
    mainWindow = initWindow(
        merge(
            electron.screen.getPrimaryDisplay().workAreaSize
        )({transparent:true})
    );       
       
    listeners = new Listeners(mainWindow);
   
    loadApp(mainWindow)  
    .then(() => {  
      mainWindow.webContents.send("loaded");
      //mainWindow.webContents.openDevTools();   
    });     
}            
 

export let getEverythingFromStorage = (onError:Function) => 
    new Promise(
        resolve => storage.getAll((error, data) => { 
            if(error) onError(error); resolve(data); 
        })
    ); 


  
export let setItemToStorage = (
    onError:Function, key:string, item:any
) : Promise<void> => new Promise(
  resolve => {
    storage.set(key, item, (error) => { if(error) onError(error); resolve() } )
  }
)


export let removeFromStorage = (onError:Function, key:string) : Promise<void> => 
    new Promise( 
        resolve => storage.remove(
            key, 
            (e) => { if(e) onError(e); resolve(); }
        )  
    );
  


export let storageHasKey = (
    onError:Function, 
    key:string
) => new Promise(resolve => 
    storage.has(
        key, 
        (error, has:boolean) => { if(error) onError(error); resolve(has); }
    )
) 
  


export let clearStorage = (onError:Function) : Promise<void> => 
    new Promise(
        resolve => {
            storage.clear(function(error) {
                if (error) onError(error);
                resolve();
            });
        }
    )
 


export let getItemFromStorage = (onError:Function,key:string) => 
    new Promise(resolve => {
        storage.get(
            key,
            (error, item) => { if(error) onError(error); resolve(item); }
        )
    });




  
process.on("unchaughtException" as any,(error) => console.log(error)); 
  
app.disableHardwareAcceleration(); 
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
   
   
 
         
                

  
  

  
     
 