import { mainWindow } from './main';
import { loadApp } from './loadApp'; 
import fs = require('fs');   
import request = require('request'); 
import path = require("path");
import url = require('url'); 
import child_process = require('child_process');
let randomstring = require("randomstring");  
import * as electron from 'electron'; 
import {ipcMain,dialog,app,BrowserWindow,Menu,MenuItem} from 'electron';
import { compose, contains, toPairs, curry, replace, mergeAll, addIndex, toUpper, equals,
         takeLast, map, fromPairs, isEmpty, flatten, defaultTo, range, all, splitEvery, ifElse,
         prepend, cond, isNil, intersection, insert, add, findIndex, filter, reject, find, split 
} from 'ramda'; 
import { Observable } from 'rxjs/Rx';
import { ChildProcess } from 'child_process';
let uniqid = require("uniqid");
let os = require('os');  
let FileReader = require('filereader');
const {shell} = require('electron'); 



interface RegisteredListener{ 
     name : string, 
     callback : (event:any,...args:any[]) => void
};
  

 
export class Listeners {
     
    registeredListeners : RegisteredListener[]; 
 
    constructor(window){
 
      this.registeredListeners = [ 
            {  
              name : "reload", 
              callback : () => { 
                window.reload();
                loadApp(window).then(() => window.webContents.send("loaded"));  
              }   
            },
              
            { name : "close", callback : () => window.close() }, 

            { name : "hide", callback : () => window.minimize() },  
 
            {    
              name : "size", 
              callback : (event, fullscreen:boolean) => {  
                 const {width,height} = electron.screen.getPrimaryDisplay().workAreaSize;
                 if(fullscreen)
                    window.setSize(width,height);
                 else 
                    window.setSize(960,720);   
                 window.center(); 
              }
            }
      ];    
      
      this.startToListenOnAllChannels(); 
    }; 
 
    registerListener(listener : RegisteredListener) : void{

        this.registeredListeners.push(listener);

    };  

    unregisterListener(name : string) : void{

        let filtered : RegisteredListener[] = reject( 
            (listener : RegisteredListener) => listener.name==name
        )(this.registeredListeners);
            
        if(filtered.length!==this.registeredListeners.length){
            this.registeredListeners=filtered;  
            ipcMain.removeAllListeners(name); 
        };    

    }; 
  
    startToListenOnAllChannels = () => 
        map(
            ({name,callback}) => 
                ipcMain.on(
                    name, 
                    callback
                ), 
            this.registeredListeners
        );  
    
  
    stopToListenOnAllChannels = () => 
        map( 
            ({name,callback}) => ipcMain.removeAllListeners(name),
            this.registeredListeners
        );  
    

};         











