import { defaultConfig, Config, getConfig } from './../utils/config';
import { loadApp, loadQuickEntry, loadNotification } from './loadApp'; 
import fs = require('fs');     
import electron = require('electron');
import { 
    ipcMain,dialog,app,BrowserWindow,Menu,MenuItem,
    globalShortcut,BrowserView,Tray,nativeImage,protocol
} from 'electron';
import { Listeners } from "./listeners";
import { initWindow, initQuickEntry, initNotification } from "./initWindow";
import { isNil, isEmpty, not, forEachObjIndexed, when, contains, compose } from 'ramda';  
import { defaultTags } from './../utils/defaultTags';
import { isDev } from './../utils/isDev';
const os = require('os');
let path = require("path");
const log = require("electron-log");
const storage = require('electron-json-storage'); 
storage.setDataPath(os.tmpdir()); 
let AutoLaunch = require('auto-launch');
const AppName = 'Tasklist';
let appAutoLauncher = new AutoLaunch({name: AppName, isHidden: true});

//appAutoLauncher.enable();
//appAutoLauncher.disable();

appAutoLauncher
    .isEnabled()
    .then((enabled:boolean) => not(enabled) ? appAutoLauncher.enable() : null)
    .catch((err) => console.log(err));


const shouldQuit = app.makeSingleInstance(
    (commandLine, workingDirectory) => {
        if(mainWindow){
            mainWindow.show();
            mainWindow.restore();  
            mainWindow.focus();
        } 
    }
);  


export let mainWindow : BrowserWindow;   
export let quickEntry : BrowserWindow;   
export let notification : BrowserWindow;
export let listeners : Listeners;  
export let dateCalendar : BrowserWindow; 
export let tray : Tray;


let shortcuts = {
    'Ctrl+Alt+T':() => {
        if(isNil(quickEntry)){ return }  
        
        if(quickEntry.isVisible()){
           quickEntry.hide(); 
        }else{
           quickEntry.show();
           quickEntry.focus();
        }
    },
    'Ctrl+D':() => mainWindow.webContents.openDevTools()
};


let registerAllShortcuts = () : void => {
    forEachObjIndexed(
        (value:Function,key:string) => globalShortcut.register(key, value)  
    )(shortcuts)
};


let unregisterAllShortcuts = () => globalShortcut.unregisterAll();


let createTray = () : Tray => {
    let iconPath = path.join(__dirname,"icon.ico"); 
    let tray = null;

    if(fs.existsSync(iconPath)){
       tray = new Tray(iconPath);   
    }else{
       tray = new Tray(nativeImage.createEmpty()); 
    }  
    
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Hide', 
            type: 'normal', 
            click:() => {
                let windows = BrowserWindow.getAllWindows();
                windows.forEach((w) => w.hide())
            }   
        }, 
        {
            label: 'Restore', 
            type: 'normal',  
            click:() => {
                let windows = BrowserWindow.getAllWindows();
                windows.forEach((w) => {
                    if(w.getTitle()!=='Quick Entry'){ w.show() }
                })
            }
        },
        {
            label:'Quit', 
            type: 'normal', 
            click:() => {
                let windows = BrowserWindow.getAllWindows();
                windows.forEach((w) => {w.destroy();});
                app.exit();
            }
        },
    ])

    tray.on(
        'click', 
        () => {
            let windows = BrowserWindow.getAllWindows();
            if(mainWindow){
                if(mainWindow.isVisible()){ 
                   windows.forEach((w) => w.hide()); 
                }else{ 
                   windows.forEach((w) => { if(w.getTitle()!=='Quick Entry'){ w.show() } }); 
                }
            }
        }
    )

    tray.setToolTip(AppName);
    tray.setContextMenu(contextMenu);
    return tray;
};

    
let getWindowSize = () : {width:number,height:number} => {
    let mainWindowWidth : number = isDev() ? 100 : 60;  
    let mainWindowHeight : number = isDev() ? 100 : 70; 
    let workingArea = electron.screen.getPrimaryDisplay().workAreaSize; 
    let width = mainWindowWidth*(workingArea.width/100); 
    let height = mainWindowHeight*(workingArea.height/100); 
 
    if(!isDev()){ width = width <= 800 ? width : 800;} 
     
    return {width,height};  
};  


let onReady = () => {  
    if(shouldQuit){ app.exit(); return; }  
    
    registerAllShortcuts();

    dialog.showErrorBox = (title, content) => {};
    tray = createTray();
    listeners = new Listeners(mainWindow); 
    

    mainWindow = initWindow(getWindowSize());   
    quickEntry = initQuickEntry({width:500,height:300});
    notification = initNotification({width:300,height:350});
    
 
    mainWindow.on('show', () => tray.setToolTip(`Hide ${AppName}`)); 
    mainWindow.on('hide', () => tray.setToolTip(`Show ${AppName}`));


    loadApp(mainWindow)
    .then(() => {    
        mainWindow.webContents.send("loaded");
        if(isDev()){ mainWindow.webContents.openDevTools(); }
    });   


    loadQuickEntry(quickEntry)
    .then(() => getConfig(storage))
    .then((config:Config) => {
        quickEntry.webContents.send("loaded",config);
        quickEntry.on('blur', () => quickEntry.hide());  
    });  


    loadNotification(notification)
    .then(
        () => {
            notification.webContents.send("loaded");
        }
    );
};               


app.on('ready', onReady);    
 

process.on( 
    "unchaughtException" as any,
    (error) => when(
        () => compose(not, isNil)(mainWindow),
        (error) => mainWindow.webContents.send("error", error)
    )(error)
);

 
app.on(     
   'window-all-closed', 
    () => { 
        unregisterAllShortcuts();
        listeners.stopToListenOnAllChannels();
        app.exit(); 
    }     
);     
   
   
          
                

  
  

  
     
 