import {loadApp} from './loadApp'; 
import fs = require('fs');   
import path = require("path");
import url = require('url'); 
import electron = require('electron');
import {ipcMain,dialog,app,BrowserWindow,Menu,MenuItem} from 'electron';  

export let initWindow = ({width,height}:{width:number,height:number}):BrowserWindow => {       
    Menu.setApplicationMenu(null);   
    let icon = path.resolve(__dirname,'icon.ico');
    let handler = new BrowserWindow({    
        icon,
        width,         
        height,   
        title:'Tasklist',      
        center:true,       
        frame:true 
    } as any);               
 
    handler.on('ready-to-show', () => handler.show());
    handler.on(
        'close', 
        (event) => {
            event.preventDefault(); 
            if(handler.id===1){ 
               handler.hide(); 
            }else{ 
               handler.close(); 
            }  
        }
    );
    handler.on('closed', () => {handler = null;}); 
    return handler; 
};         

  
export let initQuickEntry = ({width,height}:{width:number,height:number}):BrowserWindow => { 
    Menu.setApplicationMenu(null);   
    let handler = new BrowserWindow({   
        width,          
        height,      
        show:false, 
        useContentSize:true, 
        title:'Quick Entry',    
        center:true,       
        frame:false  
    } as any);               
  
    //handler.setAlwaysOnTop(true); 
    handler.setResizable(false); 
    handler.setMovable(true); 
    handler.setSkipTaskbar(true);
    handler.on('closed', () => {handler = null;}); 
    handler.hide(); 
    return handler;  
};        
