import { compose, map } from 'ramda';
import { ipcMain, BrowserWindow } from 'electron';
import { mainWindow } from "./main";
import fs = require('fs');    
    

   
let templateLoader = (
    onDidFinishLoad : Function,  
    onDidFailLoad : Function,  
    window 
) =>   
    (url : string) : Promise<void> => 
        new Promise<void>(     
            (resolve,reject) => { 
                window.loadURL(url);
                window.webContents.once(
                    'did-finish-load',
                    () => onDidFinishLoad(resolve)
                );  
                
                window.webContents.once(
                    'did-fail-load', 
                    (event, errorCode, errorDescription) =>  
                        onDidFailLoad(reject, errorDescription)
                );       
            } 
        );   
      

 
export let loadApp = (window) : Promise<void> => 
       templateLoader(
           (resolve) => resolve(), 
           (reject, error) => reject(),
           window 
       )(
           `file://${__dirname}/app.html`
       );    
  


export let log = (info : any) => {
    console.log(info);
    return info;
};  


