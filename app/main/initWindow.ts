import { loadApp } from './loadApp'; 
import fs = require('fs');   
import request = require('request');  
import path = require("path");
import url = require('url'); 
import child_process = require('child_process');
let randomstring = require("randomstring");  
import electron = require('electron');
import {ipcMain,dialog,app,BrowserWindow,Menu,MenuItem} from 'electron';
import { compose, contains, toPairs, curry, replace, mergeAll, addIndex,
         takeLast, map, fromPairs, isEmpty, flatten, defaultTo, range, all,
         prepend, cond, isNil, intersection, insert, add, findIndex, filter, reject } from 'ramda'; 

 
 
export let initWindow = ()  => {
    const {width,height} = electron.screen.getPrimaryDisplay().workAreaSize;
      
    Menu.setApplicationMenu(null);   
      
    let handler = new BrowserWindow({   
        icon:path.join(__dirname,'icon.ico'),
        width,         
        height,  
        transparent:true, 
        //'node-integration': true,
        opacity:0, 
        //backgroundColor:"#ffffff", 
        title:'tasklist',      
        center:true,     
        frame:false 
    });              
            
    handler.setMovable(true);   

    handler.on(
        'ready-to-show', 
        () => handler.show()
    );
 
    handler.on( 
        'closed', 
        () => {
            handler = null;
        } 
    ); 
  
    return handler; 
};         