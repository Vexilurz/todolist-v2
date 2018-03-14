import { isDev } from './../utils/isDev';
import { mainWindow, getClonedWindows, initAutoLaunch, toggleShortcut, findWindowByTitle } from './main';
import { loadApp } from './loadApp'; 
import { ipcMain,app,BrowserWindow,screen } from 'electron';
import { initWindow } from './initWindow';
import { isEmpty, when, isNil } from 'ramda';
import { autoUpdater } from "electron-updater";
import { isNotNil } from '../utils/utils';
import { isProject, isString } from '../utils/isSomething';
const fs = require('fs');
const path = require('path');
const log = require("electron-log");
const os = require('os'); 

//TODO remove
let keyFromDate = (d:Date) : string => {  
    //assert(isDate(date), `keyFromDate. input is not a date. ${date}`);
    
    if(isNil(d)){ return '' }
    let date = isString(d) ? new Date(d) : d;

    let year = date.getFullYear();
    let day = date.getDate(); 
    let month = date.getMonth();

    return [year,month+1,day].join('-'); 
};


let readJsonFile = (path:string) : Promise<any> => 
    new Promise(
        resolve => {
            fs.readFile(
                path, 
                'utf8', 
                (err, data) => {
                    if (err){ resolve(err) }
                    else{ resolve(JSON.parse(data)) }
                }
            );
        }
    );


let writeJsonFile = (obj:any,pathToFile:string) : Promise<any> => 
    new Promise(
        resolve => {
            let json : string = JSON.stringify(obj);
            fs.writeFile(
                pathToFile, 
                json, 
                'utf8', 
                (err) => {
                    if(err){ resolve(err) }
                    else{ resolve() }
                } 
            );
        }
    );


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
                name:"saveBackup",
                callback:(event,[data]) => {
                    let target = path.resolve(os.homedir(), "tasklist");

                    if(!fs.existsSync(target)){ 
                        fs.mkdirSync(target); 
                    }

                    let to = path.resolve(target, `db_backup_${keyFromDate(new Date())}.json`);


                    console.log(
                        `
                        saveBackup !
                        to:${to}
                        todos:${data.database.todos.length}, 
                        projects:${data.database.projects.length}, 
                        areas:${data.database.areas.length}, 
                        calendars:${data.database.calendars.length} 
                        `
                    ) 

                    writeJsonFile(data, to)
                    .then(
                        () => event.sender.send("saveBackup")
                    )  
                }  
            },
            {
                name:"focusMainWindow",
                callback:(event) => {
                    console.log('focusMainWindow')

                    if(mainWindow){
                       mainWindow.show();
                       mainWindow.focus();
                    }

                    event.sender.send("focusMainWindow");  
                } 
            },
            { 
                name:"updateQuickEntryData",
                callback:(event,[todos,projects,areas]) => { 
                    let window = findWindowByTitle('Add task');

                    if(window){
                       window.webContents.send('data',todos,projects,areas);
                    }
                    event.sender.send("updateQuickEntryData");  
                }
            },
            { 
                name:"remind",
                callback:(event,[todo]) => {
                    let notification : any = findWindowByTitle('Notification');
                    
                    console.log(`notification`,notification);

                    if(notification){ 
                       console.log(`remind`,todo);
                       notification.webContents.send('remind',todo); 
                    }
                    event.sender.send("remind");
                } 
            }, 
            { 
                name:"updateNotificationConfig",
                callback:(event,[config]) => {
                    let window = findWindowByTitle('Notification');

                    if(window){
                       window.webContents.send('config',config);
                    } 
                    event.sender.send("updateNotificationConfig");
                } 
            }, 
            { 
                name:"updateQuickEntryConfig",
                callback:(event,[config]) => {
                    let window = findWindowByTitle('Add task');

                    if(window){
                       window.webContents.send('config',config);
                    }
                    event.sender.send("updateQuickEntryConfig");
                }
            },
            { 
                name:"toggleShortcut",
                callback:(event,[enable,shortcut]) => {

                    toggleShortcut(enable,shortcut);
                    event.sender.send("toggleShortcut");
                }
            },
            {
                name:"autolaunch",
                callback:(event,[shouldEnable]) => {
                    
                    initAutoLaunch(shouldEnable);
                    event.sender.send("autolaunch");
                } 
            },
            {
                name:"getVersion",
                callback:(event) => {
                    
                    event.sender.send("getVersion",app.getVersion())
                }
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
                            if(isDev()){
                                newWindow.webContents.openDevTools(); 
                            }
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











