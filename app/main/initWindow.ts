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

 
 
export let initWindow = ({width,height,transparent})  => {
      
    Menu.setApplicationMenu(null);   
      
    let handler = new BrowserWindow({   
        icon:path.join(__dirname,'icon.ico'),
        width,         
        height,   
        transparent, 
        //'node-integration': true,
        opacity:transparent ? 0 : 1, 
        //backgroundColor:"#ffffff", 
        title:'tasklist',      
        center:true,     
        frame:false   
    } as any);              
            
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