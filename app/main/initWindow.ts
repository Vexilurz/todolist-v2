import { loadApp } from './loadApp'; 
import fs = require('fs');   
import path = require("path");
import url = require('url'); 
import electron = require('electron');
import {ipcMain,dialog,app,BrowserWindow,Menu,MenuItem} from 'electron';  

 
 
export let initWindow = ({width,height,transparent})  => {
      
    Menu.setApplicationMenu(null);   
    let icon = path.resolve(__dirname,'icon.ico');
    
      
    let handler = new BrowserWindow({    
        icon,
        width,         
        height,   
        transparent,    
        opacity:transparent ? 0 : 1, 
        title:'Tasklist',      
        center:true,      
        frame:true 
    } as any);               
            
    //handler.setMovable(true);   

    handler.on('ready-to-show', () => handler.show());
  
    handler.on('closed', () => {handler = null;}); 
  
    return handler; 
};         