import { mainWindow, setItemToStorage, getEverythingFromStorage, clearStorage, removeFromStorage, getItemFromStorage } from './main';
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
import { ChildProcess } from 'child_process';
import { initWindow } from './initWindow';
import { Store } from '../App';
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
    spawnedWindows : any;
    mainWindowID : string;
 
    constructor(window){
  
      this.mainWindowID = uniqid();  

      this.spawnedWindows = fromPairs([this.mainWindowID, mainWindow]);  
 
      this.registeredListeners = [  
            {
                name : "cloneWindow",
                callback : (event, store:Store, id:string) => {
                let newWindow = initWindow({width:840,height:680, transparent:false}); 
                let newWindowId = uniqid(); 
                this.spawnedWindows[newWindowId] = newWindow;
                    
                    loadApp(newWindow)     
                    .then(() => {        
                        newWindow.webContents.send("loaded", store, newWindowId);
                        //mainWindow.webContents.openDevTools();   
                    });       
                } 
            },    

            {  
              name : "reload", 
              callback : (event, id:string) => { 

                let wnd = this.spawnedWindows[id];  

                if(isNil(wnd)){
                    window.reload();   
                    loadApp(window).then(() => window.webContents.send("loaded", null, this.mainWindowID));  
                }else{
                    wnd.reload();  
                    loadApp(wnd).then(() => wnd.webContents.send("loaded", null, id));  
                } 
              }     
            },

            { 
                name : "close", 
                callback : (event, id:string) => {
                    let wnd = this.spawnedWindows[id];  
                    
                    if(isNil(wnd)){
                        window.close();  
                    }else{
                        wnd.close();  
                    } 
                }
            }, 

            { 
                name : "hide", 
                callback : (event, id:string) => {
                    let wnd = this.spawnedWindows[id];  
                    
                    if(isNil(wnd)){
                        window.minimize();  
                    }else{  
                        wnd.minimize();  
                    }  
                } 
            },  
 
            /*{    
              name : "size", 
              callback : (event, fullscreen:boolean) => {  
                 const {width,height} = electron.screen.getPrimaryDisplay().workAreaSize;
                 if(fullscreen)
                    window.setSize(width,height);
                 else 
                    window.setSize(960,720);   
                 window.center(); 
              }
            },*/ 
 
            { 
                name : "getItemFromStorage", callback : (event, key:string) => {
                getItemFromStorage((e) => event.sender.send("error", e), key)
                .then( 
                    (item) => event.sender.send("getItemFromStorage",item) 
                )  
            }}, 

            { 
                name : "addItemToStorage", callback : (event, { key, item }) => {
                setItemToStorage((e) => event.sender.send("error", e), key, item)
                .then(
                    () => event.sender.send("addItemToStorage")
                )
            }},
  
            { name : "removeItemFromStorage", callback : (event, key:string) => {
                removeFromStorage((e) => event.sender.send("error", e), key)
                .then(() => { 
                    () => event.sender.send("removeItemFromStorage")
                })
            }}, 
 
            { 
                name : "clearStorage", callback : (event) => {
                clearStorage((e) => event.sender.send("error",e))
                .then(
                    () => event.sender.send("clearStorage")
                )
            }},

            { 
                name : "getEverythingFromStorage", callback : (event) => {
                getEverythingFromStorage(
                    (e) => event.sender.send("error",e)
                ).then(
                    (data:any) => event.sender.send("getEverythingFromStorage",data)
                )
            }},  
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











