import { isDev } from './../utils/isDev';
import { mainWindow, getClonedWindows, initAutoLaunch, toggleShortcut, findWindowByTitle } from './main';
import { loadApp } from './loadApp'; 
import { ipcMain,app,BrowserWindow,screen } from 'electron';
import { initWindow } from './initWindow';
import { isEmpty, when } from 'ramda';
import { autoUpdater } from "electron-updater";
import { isNotNil } from '../utils/utils';
import { isProject } from '../utils/isSomething';

const log = require("electron-log");
const os = require('os'); 


let initAutoUpdater = () => {
    autoUpdater.logger = log;
    log.transports.file.level = "error";  
    log.transports.console.level = "error";

    autoUpdater.autoDownload = false; 
    autoUpdater.on( 
        'error', 
        (error) => { 
            if(mainWindow){ mainWindow.webContents.send("error",error) }
        }
    );

    autoUpdater.on( 
        'download-progress', 
        (progress) => {
            if(mainWindow){ mainWindow.webContents.send("progress",progress) }
        }  
    );
};     


let getClonedWindowDimensions = () => {
    let workingArea = screen.getPrimaryDisplay().workAreaSize;
    let clonedWindowWidth : number = isDev() ? 100 : 30;
    let clonedWindowHeight : number = isDev() ? 100 : 80;  
    let width = clonedWindowWidth*(workingArea.width/100);  
    let height = clonedWindowHeight*(workingArea.height/100); 
    return {width,height};
};


interface RegisteredListener{  
     name : string, 
     callback : (event:any,...args:any[]) => void
}; 
  

export class Listeners{
       
    registeredListeners : RegisteredListener[]; 
    
    constructor(window){

      initAutoUpdater(); 
 
      this.registeredListeners = [ 
            {
                name:"isMainWindow",
                callback:(event) => { 
                    console.log(event);
                    event.sender.send("isMainWindow", false)
                }
            },




            
            { 
                name:"updateQuickEntryData",
                callback:(event,todos:any,projects:any,areas:any) => {
                    let window = findWindowByTitle('Add task');
                    if(window){
                       window.webContents.send('data',todos,projects,areas);
                    }
                    event.sender.send("updateQuickEntryData");
                }
            },
            { 
                name:"remind",
                callback:(event,todo) => {
                    let notification : any = findWindowByTitle('Notification');
                    if(notification){ 
                       notification.webContents.send('remind',todo); 
                    };
                    event.sender.send("remind");
                } 
            }, 
            { 
                name:"updateNotificationConfig",
                callback:(event,config:any) => {
                    let window = findWindowByTitle('Notification');
                    if(window){
                       window.webContents.send('config',config);
                    } 
                    event.sender.send("updateNotificationConfig");
                } 
            }, 
            { 
                name:"updateQuickEntryConfig",
                callback:(event,config:any) => {
                    let window = findWindowByTitle('Add task');
                    if(window){
                       window.webContents.send('config',config);
                    }
                    event.sender.send("updateQuickEntryConfig");
                }
            },
            { 
                name:"toggleShortcut",
                callback:(event,enable:boolean,shortcut:string) => {
                    toggleShortcut(enable,shortcut);
                    event.sender.send("toggleShortcut");
                }
            },
            {
                name:"autolaunch",
                callback:(event,shouldEnable) => {
                    initAutoLaunch(shouldEnable);
                    event.sender.send("autolaunch");
                } 
            },
            {
                name:"getVersion",
                callback:(event) => event.sender.send("getVersion",app.getVersion())
            },
            {
                name:"hide",
                callback:(event) => BrowserWindow.getAllWindows().forEach((win:BrowserWindow) => win.hide())
            }, 
            {
                name:"downloadUpdates",
                callback:(event) => {
                    autoUpdater 
                    .checkForUpdates()
                    .then(
                        (updateCheckResult) => autoUpdater.downloadUpdate(updateCheckResult.cancellationToken)
                    )
                    .then(
                        (path) => mainWindow.webContents.send("downloadUpdates",path)
                    )
                }
            }, 
            {
                name:"checkForUpdates",
                callback : (event) => {
                    autoUpdater
                    .checkForUpdates()
                    .then(
                        (updateCheckResult) => mainWindow.webContents.send("checkForUpdates",updateCheckResult)
                    )
                }
            },
            {
                name:"quitAndInstall",
                callback : (event) => setImmediate(() => {
                    app.removeAllListeners("window-all-closed");
                    let windows = BrowserWindow.getAllWindows();
                    windows.forEach(w => w.destroy());
                    autoUpdater.quitAndInstall(true,true);
                })  
            }, 
            {
                name:"closeClonedWindows",
                callback : (event) => {  
                    let windows = getClonedWindows();
                    windows.forEach((window) =>  window.destroy());
                    event.sender.send("closeClonedWindows");  
                }    
            }, 
            {  
                name:"store", 
                callback : (event, store) => {
                    let newWindow = initWindow(getClonedWindowDimensions()); 
                    loadApp(newWindow)
                    .then(
                        () => {
                            newWindow.webContents.send("loaded",store); 
                            //newWindow.webContents.openDevTools(); 
                        } 
                    );  
                }
            },  
            {
                name:"quick-entry",
                callback : (event, todo, project, config) => { 
                    type kind="quick-entry";
                    let kind:kind="quick-entry";
                    let action={type:"addTodo",load:todo}; 
                    let windows=BrowserWindow.getAllWindows();

                    if(isEmpty(todo.title)){ return }

                    for(let i=0; i<windows.length; i++){
                        windows[i].webContents.send("action", {...action, kind});

                        if(isProject(project)){
                            let attachToProject={
                               type:"attachTodoToProject",
                               load:{projectId:project._id,todoId:todo._id}
                            }; 
                           
                            windows[i].webContents.send("action", {...attachToProject, kind});
                        }
                    }  
                }   
            },
            { 
                name:"action", 
                callback : (event, data:{id:number, action:{type:string,load:any}} ) => {
                    let {id,action} = data;
                    type kind = "external";
                    let kind : kind = "external";
                    let windows = BrowserWindow.getAllWindows();

                    windows.forEach(when(
                        (w) => w.id!==id, //prevent sending action back to window in which it was created
                        (w) => w.webContents.send("action", {...action, kind})
                    ));
                }
            }
        ];     
      
        this.startToListenOnAllChannels(); 
    } 
 
    
    startToListenOnAllChannels = () => {
        this.registeredListeners.forEach(({name,callback}) => ipcMain.on(name, callback));  
    }
    
 
    stopToListenOnAllChannels = () => {
        this.registeredListeners.forEach(({name,callback}) => ipcMain.removeAllListeners(name));  
    }
}         











