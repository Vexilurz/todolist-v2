import { isDev } from './../utils/isDev';
import { 
    mainWindow, getClonedWindows, initAutoLaunch, toggleShortcut, 
    getConfig, updateConfig, clearStorage, quickEntry, notification 
} from './main';
import { loadApp, loadQuickEntry, loadNotification } from './loadApp'; 
import { ipcMain,app,BrowserWindow,screen,dialog } from 'electron';
import { initWindow } from './initWindow';
import { isEmpty, when, isNil, prop, path, compose, defaultTo, find } from 'ramda';
import { autoUpdater } from "electron-updater";
import { isProject, isString, isNotNil } from '../utils/isSomething';
const fs = require('fs');
const pathTo = require('path');
const log = require("electron-log");
const os = require('os'); 
const rimraf = require('rimraf');



let backupFolder = pathTo.resolve(os.homedir(), "Documents", "tasklist");



let move = () : Promise<void> => new Promise(
    resolve => {
        let {finalX,finalY} = getFinalNotificationPosition();
        const window = notification;

        if(isNil(window)){ resolve(); }

        let currentPosition = window.getPosition();
        let [x,y] = currentPosition;
        let delta = 20;

        if(y<=finalY){ 
            window.setPosition(finalX, finalY);
            resolve();
        }else{
            window.setPosition(x, y-delta);
            setTimeout(() => move(), 30);   
        }
    }
);



let getFinalNotificationPosition = () : {finalX:number,finalY:number} => {
    const window = notification;
    if(isNil(window)){ return {finalX:0,finalY:0}; }
    const {width,height} = screen.getPrimaryDisplay().workAreaSize;
    const size = window.getSize();
    const offset = 25;
    const finalX = width-size[0]-offset;
    const finalY = height-size[1]-offset; 
    return {finalX,finalY};
};



let getInitialNotificationPosition = () : {initialX:number,initialY:number} => {
    const window = notification;
    if(isNil(window)){ return {initialX:0,initialY:0}; }

    const {width,height} = screen.getPrimaryDisplay().workAreaSize;
    const size = window.getSize();
    const offset = 25; 
    const initialX = width-size[0]-offset;
    const initialY = height+size[1];
    return {initialX,initialY};
};



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



let readFile = (path:string) : Promise<any> => 
    new Promise(
        resolve => fs.readFile(
            path, 
            'utf8', 
            (err, data) => {
                if(err){ 
                   resolve(null); 
                }else{ 
                   resolve(data);  
                }
            }
        )
    );

   

let readJsonFile = (path:string) : Promise<any> => 
    new Promise(
        resolve => {
            try{
                fs.readFile(
                    path, 
                    'utf8', 
                    (err, data) => {
                        if (err){ resolve(err) }
                        else{ 
                            let result = {};

                            try{
                                result = JSON.parse(data);
                            }catch(e){
                                resolve(result);
                            }

                            resolve(result);  
                        }
                    }
                );
            }catch(e){
                resolve({});
            }
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
                name:"backupCleanup",
                callback: (event) => {
                    rimraf(
                        backupFolder, 
                        () => { 
                            event.sender.send("backupCleanup");
                        }
                    );
                }
            },
            {  
                name:"reloadMainWindow", 
                callback : () => isNil(mainWindow) ? null :
                loadApp(mainWindow)
                .then(() => {    
                    mainWindow.webContents.send("loaded",null,mainWindow.id);
                    if(isDev()){  
                       mainWindow.webContents.openDevTools(); 
                    }  
                }) 
            },
            {  
                name:"reloadQuickEntry", 
                callback : () => isNil(quickEntry) ? null :
                loadQuickEntry(quickEntry)
                .then(() => {
                    quickEntry.webContents.send("loaded"); 

                    if(isDev()){ 
                       quickEntry.webContents.openDevTools(); 
                    } 
                })  
            }, 
            {
                name:'separateWindowsCount',
                callback:(event) => { 
                    let windows = BrowserWindow.getAllWindows();
                    if(mainWindow){
                       mainWindow.webContents.send('separateWindowsCount', windows.length);
                    }
                } 
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
                    let window = notification;
                    if(isNil(window)){ return; }

                    let {initialX,initialY} = getInitialNotificationPosition();

                    window.setPosition(initialX, initialY);
                    window.show();
                    move();
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
                    (data) => {
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
                    let windows = getClonedWindows();
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
                           
                            windows[i].webContents.send("action", {...attachToProject, kind});
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











