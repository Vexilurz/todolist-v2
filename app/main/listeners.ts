import { getClonedWindowDimensions } from './utils/getClonedWindowDimensions';
import { initWindow } from './utils/initWindow';
import { initAutoLaunch } from './utils/initAutoLaunch';
import { writeJsonFile } from './utils/writeJsonFile';
import { readFile } from './utils/readFile';
import { readJsonFile } from './utils/readJsonFile';
import { updateConfig } from './utils/updateConfig';
import { getClonedWindows } from './utils/getClonedWindows';
import { getInitialNotificationPosition } from './utils/getInitialNotificationPosition';
import { move } from './utils/move';
import { loadApp, loadQuickEntry } from './utils/loadApp';
import { clearStorage } from './utils/clearStorage';
import { isDev } from './../utils/isDev';
import { ipcMain, app, BrowserWindow, screen, dialog } from 'electron';
import { isEmpty, when, isNil, prop, path, compose, defaultTo, find, contains } from 'ramda';
import { isProject, isString, isNotNil } from '../utils/isSomething';
import { keyFromDate } from '../utils/time';
import { RegisteredListener, Config } from '../types';
import { mainWindow, quickEntry, notification } from './main';
import { getConfig } from './utils/getConfig';
import { toggleShortcut } from './shortcuts';
import { autoUpdater } from "electron-updater";
import { onAppLoaded } from './utils/onAppLoaded';
import { onQuickEntryLoaded } from './utils/onQuickEntryLoaded';
const fs = require('fs');
const pathTo = require('path');
const log = require("electron-log");
const os = require('os'); 
const rimraf = require('rimraf');
const Promise = require('bluebird');
const backupFolder = pathTo.resolve(os.homedir(), "Documents", "tasklist");
const shouldHideApp : boolean = contains("--hidden")(process.argv);

 
export class Listeners{ 
       
    registeredListeners : RegisteredListener[]; 
    
    constructor(window){

      this.registeredListeners = [ 
            {
                name:"backupCleanup",
                callback: (event) => rimraf(
                    backupFolder, 
                    () => { 
                        event.sender.send("backupCleanup");
                    }
                )
            },
            {  
                name:"reloadMainWindow", 
                callback : () => mainWindow ? loadApp(mainWindow).then(() => onAppLoaded(mainWindow)) : null
            },
            {  
                name:"reloadQuickEntry", 
                callback : () => quickEntry ? loadQuickEntry(quickEntry).then(() => onQuickEntryLoaded(quickEntry)) : null    
            }, 
            {
                name:'separateWindowsCount',
                callback:(event) => 
                mainWindow ?
                mainWindow.webContents.send('separateWindowsCount', BrowserWindow.getAllWindows().length) : 
                null
            },
            { 
                name:"updateQuickEntryData",
                callback:(event,data) => quickEntry ? quickEntry.webContents.send('data',data) : null
            },
            { 
                name:"remind",
                callback:(event,todo) => notification ? notification.webContents.send("remind", todo) : null
            }, 
            { 
                name:"receive",
                callback:(event,todo) => mainWindow ? mainWindow.webContents.send("receive", todo) : null
            },
            {
                name:'openTodoInApp',
                callback:(event,todo) => mainWindow && isNotNil(todo) ? mainWindow.webContents.send('openTodo',todo) : null
            },
            {
                name:'NremoveReminders',
                callback:(event,todos) => mainWindow ? mainWindow.webContents.send('removeReminders',todos) : null
            },
            {
                name:'Mhide',
                callback:(event) => mainWindow ? mainWindow.hide() : null
            },
            {
                name:'Nhide',
                callback:(event) => notification ? notification.hide() : null 
            },
            {
                name:'Nmove',
                callback:(event) => {
                    if(isNil(notification)){ return; }

                    let {initialX,initialY} = getInitialNotificationPosition(notification);

                    notification.setPosition(initialX, initialY);
                    notification.show();
                    move(notification);
                }
            },
            {
                name:'getFilenames',
                callback:(event,[dir]) => {

                    if(fs.existsSync(dir)){ 
                        fs.readdir(
                            dir, 
                            (err,files) => {
                                if(isNil(err)){    
                                   event.sender.send('getFilenames',files);
                                }
                            } 
                        );
                    }else{
                        event.sender.send('getFilenames',[]);
                    }
                }
            },
            {
                name:'setWindowTitle',
                callback:(event,title,id) => {
                    let windows = BrowserWindow.getAllWindows();
                    let window = compose(defaultTo(mainWindow),find((w) => w.id===id))(windows);
                    if(window){ window.setTitle(title); }
                }
            }, 
            {
                name:'QEblur',
                callback:(event) => quickEntry ? quickEntry.blur() : null
            },
            {
                name:'QEhide',
                callback:(event) => quickEntry ? quickEntry.hide() : null
            },  
            {
                name:'QEsetSmallSize',
                callback:(event) => {
                    let window = quickEntry;
                    let defaultWidth=500;
                    let defaultHeight=350;
                    if(window){
                       window.setSize(defaultWidth, defaultHeight); 
                    }
                } 
            },
            {
                name:'QEsetBigSize',
                callback:(event,size) => {
                    let window = quickEntry;
                    let defaultWidth=500;
                    let defaultHeight=350;
                    if(window){
                       window.setSize(defaultWidth, size); 
                    }
                }
            },
            {
                name:'collectSystemInfo',
                callback:(event) => {
                    let info = { 
                        version : app.getVersion(), 
                        arch : os.arch(),
                        cpus : os.cpus(),
                        hostname : os.hostname(),
                        platform : os.platform(),
                        release : os.release(),
                        type : os.type(),
                        screenResolution : screen.getPrimaryDisplay().workAreaSize,
                        userLanguage : app.getLocale()
                    };
                    event.sender.send('collectSystemInfo',info);
                }
            }, 
            { 
                name:"getConfig",
                callback:(event) => getConfig().then(
                    (data:Config) => {
                        event.sender.send("getConfig",data)
                    }
                )    
            },
            {
                name:"updateConfig",
                callback:(event,[load]) => updateConfig(load).then(
                    (data) => {
                        event.sender.send("updateConfig",data)
                    }
                )    
            },
            {
                name:"clearStorage",
                callback:(event) => clearStorage().then(
                    (err) => {
                        event.sender.send(`clearStorage`,err);
                    }
                )    
            },
            {
                name:"readJsonFile",
                callback:(event,[to]) => 
                    readJsonFile(to)
                    .then(
                        (data) => {
                            event.sender.send("readJsonFile",data)
                        }
                    )  
            },
            { 
                name:"readFile",
                callback:(event,[to]) => readFile(to).then((data) => event.sender.send("readFile",data))  
            },
            {
                name:"saveDatabase",
                callback:(event,[data,to]) => {
                    writeJsonFile(data,to)
                    .then(
                        () => {
                            event.sender.send("saveDatabase")
                        }
                    )  
                }  
            },
            {
                name:"saveBackup",
                callback:(event,[data]) => {
                    if(!fs.existsSync(backupFolder)){ fs.mkdirSync(backupFolder); }

                    let to = pathTo.resolve(backupFolder, `db_backup_${keyFromDate(new Date())}.json`);

                    writeJsonFile(data, to) 
                    .then( 
                        () => {
                            event.sender.send("saveBackup",to)
                        }
                    )  
                }  
            },
            {
                name:"selectFolder",
                callback:(event) => {
                    dialog.showOpenDialog( 
                        { 
                            title:`Select data folder`,
                            buttonLabel:'Select',
                            properties:['openDirectory']
                        },  
                        (value) => {
                            if(value)   
                                event.sender.send("selectFolder",value[0]); 
                            else
                                event.sender.send("selectFolder",undefined);
                        }
                    )
                }  
            },
            {
                name:"selectJsonDatabase",
                callback:(event) => {
                    dialog.showOpenDialog( 
                        { 
                            title:`Select database file`,
                            buttonLabel:'Select',
                            properties:['openFile'],
                            filters:[{extensions: ["json"], name: ""}]
                        },  
                        (value) => { 
                            if(value)    
                               event.sender.send("selectJsonDatabase",value[0]); 
                            else
                               event.sender.send("selectJsonDatabase",undefined); 
                        }
                    )
                }  
            },
            { 
                name:"action", 
                callback : ( event, data:{ action:{type:string,load:any}, id:number } ) => {
                    type kind = "external";
                    let kind : kind = "external";
                    let windows = BrowserWindow.getAllWindows();

                    windows.forEach(when(
                        (w) => w.id!==data.id, //prevent sending action back to window in which it was created
                        (w) => w.webContents.send("action", {...data.action, kind})
                    ));
                }
            },
            {
                name:"focusMainWindowOnStart",
                callback:(event) => {
                    if(shouldHideApp){ return }

                    if(mainWindow){
                       mainWindow.show();
                       mainWindow.focus();
                    }
                } 
            },
            {
                name:"focusMainWindow",
                callback:(event) => {
                    if(mainWindow){
                       mainWindow.show();
                       mainWindow.focus();
                    }
                } 
            },
            { 
                name:"updateQuickEntryConfig",
                callback:(event,[config]) => {
                    let window = quickEntry;
                    if(window){
                       window.webContents.send('config',config);
                    }
                }
            },
            { 
                name:"toggleShortcut",
                callback:(event,enable,shortcut) => toggleShortcut(enable,shortcut)
            },
            {
                name:"autolaunch",
                callback:(event,shouldEnable) => initAutoLaunch(shouldEnable)
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
                    let windows = getClonedWindows(mainWindow);
                    windows.forEach((window) =>  window.destroy());
                }    
            }, 
            {  
                name:"store", 
                callback : (event, store) => {
                    let newWindow = initWindow(getClonedWindowDimensions()); 
                    loadApp(newWindow)
                    .then(
                        () => {
                            newWindow.webContents.send("loaded",store,newWindow.id); 
                            
                            if(isDev()){
                               newWindow.webContents.openDevTools(); 
                            }
                        } 
                    );  
                }
            },  
            {
                name:"quick-entry",
                callback : (event, todo, project) => {  
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
                            windows[i].webContents.send("action", {...attachToProject,kind});
                        }
                    }  
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











