import { loadApp } from './loadApp'; 
import fs = require('fs');   
import path = require("path");
import url = require('url'); 
import electron = require('electron');
import {ipcMain,dialog,app,BrowserWindow,Menu,MenuItem} from 'electron';  

 
 
export let initWindow = (
    {width,height} : {width:number,height:number}
) : BrowserWindow  => { 
        
    Menu.setApplicationMenu(null);   

    let icon = path.resolve(__dirname,'icon.ico');
    
    let handler = new BrowserWindow({    
        icon,
        width,         
        height,    
        transparent:false,    
        opacity:1, 
        title:'Tasklist',      
        center:true,       
        frame:true 
    } as any);               
              
    handler.on('ready-to-show', () => handler.show());
  
    handler.on('closed', () => {handler = null;}); 
  
    return handler; 
};         

  
export let initQuickEntry = (
    {width,height} : {width:number,height:number}
) : BrowserWindow  => { 
        
    Menu.setApplicationMenu(null);   
    
    let handler = new BrowserWindow({    
        width,          
        height,   
        transparent:false,    
        //useContentSize:true, 
        opacity:1, 
        title:'Quick Entry',      
        center:true,       
        frame:false  
    } as any);               
  
    return handler; 
};        