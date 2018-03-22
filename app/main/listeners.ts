import { isDev } from './../utils/isDev';
import { 
    mainWindow, getClonedWindows, initAutoLaunch, toggleShortcut, findWindowByTitle, getConfig, updateConfig, clearStorage 
} from './main';
import { loadApp } from './loadApp'; 
import { ipcMain,app,BrowserWindow,screen,dialog } from 'electron';
import { initWindow } from './initWindow';
import { isEmpty, when, isNil, prop, path } from 'ramda';
import { autoUpdater } from "electron-updater";
import { isNotNil } from '../utils/utils';
import { isProject, isString } from '../utils/isSomething';
const fs = require('fs');
const pathTo = require('path');
const log = require("electron-log");
const os = require('os'); 


let move = () : Promise<void> => new Promise(
    resolve => {
        let {finalX,finalY} = getFinalNotificationPosition();
        const window = findWindowByTitle('Notification');
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
    const window = findWindowByTitle('Notification');
    const {width,height} = screen.getPrimaryDisplay().workAreaSize;
    const size = window.getSize();
    const offset = 25;
    const finalX = width-size[0]-offset;
    const finalY = height-size[1]-offset; 
    return {finalX,finalY};
};


let getInitialNotificationPosition = () : {initialX:number,initialY:number} => {
    const window = findWindowByTitle('Notification');
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
                callback:(event,[title]) => {
                    if(mainWindow){
                       mainWindow.setTitle(title);
                    }
                    event.sender.send('setWindowTitle');
                }
            },
            {
                name:'NremoveReminders',
                callback:(event,[todos]) => {
                    if(mainWindow){
                        mainWindow.webContents.send('removeReminders', todos); 
                    }
                    event.sender.send('NremoveReminders');
                }
            },
            {
                name:'openTodoInApp',
                callback:(event,[todo]) => {
                    if(mainWindow){
                        mainWindow.webContents.send('openTodo',todo);
                        mainWindow.webContents.send('removeReminder',todo);
                    }
                    event.sender.send('openTodoInApp');
                }
            },
            {
                name:'Nhide',
                callback:(event) => {
                    let window = findWindowByTitle('Notification');
                    if(window){
                        window.hide();
                    }
                    event.sender.send('Nhide');
                }
            },
            {
                name:'Nmove',
                callback:(event) => {
                    let window = findWindowByTitle('Notification');
                    let {initialX,initialY} = getInitialNotificationPosition();
                    window.setPosition(initialX, initialY);
                    window.show();
                    if(window){
                        move().then(() => event.sender.send('Nmove'))
                    }
                }
            },
            {
                name:'QEblur',
                callback:(event) => {
                    let window = findWindowByTitle('Add task');
                    if(window){
                        window.blur();
                    }
                    event.sender.send('QEblur');
                }
            },
            {
                name:'QEhide',
                callback:(event) => {
                    let window = findWindowByTitle('Add task');
                    if(window){
                        window.hide();
                    }
                    event.sender.send('QEhide');
                }
            },  
            {
                name:'QEsetSmallSize',
                callback:(event) => {
                    let window = findWindowByTitle('Add task');
                    let defaultWidth=500;
                    let defaultHeight=350;
                    if(window){
                        window.setSize(defaultWidth, defaultHeight); 
                    }
                    event.sender.send('QEsetSmallSize');
                }
            },
            {
                name:'QEsetBigSize',
                callback:(event) => {
                    let window = findWindowByTitle('Add task');
                    let defaultWidth=500;
                    let defaultHeight=350;
                    if(window){
                        window.setSize(defaultWidth, 400); 
                    }
                    event.sender.send('QEsetBigSize');
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
                    let target = pathTo.resolve(os.homedir(), "tasklist");

                    if(!fs.existsSync(target)){ 
                        fs.mkdirSync(target); 
                    }

                    let to = pathTo.resolve(target, `db_backup_${keyFromDate(new Date())}.json`);

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

                    event.sender.send("focusMainWindow");  
                } 
            },
            { 
                name:"updateQuickEntryData",
                callback:(event,[data]) => { 
                    let window = findWindowByTitle('Add task');
                    if(window){
                       window.webContents.send('data',data);
                    }
                    event.sender.send("updateQuickEntryData");  
                }
            },
            { 
                name:"remind",
                callback:(event,[todo]) => {
                    let notification : any = findWindowByTitle('Notification');
                    
                    if(notification){ 
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











