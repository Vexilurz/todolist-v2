import { loadApp, loadQuickEntry, loadNotification } from './loadApp'; 
import fs = require('fs');     
import {dialog,app,BrowserWindow,Menu,screen,globalShortcut,Tray,nativeImage} from 'electron';
import { Listeners } from "./listeners";
import { initWindow, initQuickEntry, initNotification } from "./initWindow";
import { isNil, not, forEachObjIndexed, when, contains, compose, equals, ifElse, reject } from 'ramda';  
import { isDev } from './../utils/isDev';
const os = require('os');
const path = require("path");
let AutoLaunch = require('auto-launch');


export const AppName = 'Tasklist';
export let mainWindow : BrowserWindow;   
export let quickEntry : BrowserWindow;   
export let notification : BrowserWindow;
export let listeners : Listeners;  
export let dateCalendar : BrowserWindow; 
export let tray : Tray;


let appAutoLauncher = new AutoLaunch({name: AppName, isHidden: true});

appAutoLauncher
    .isEnabled()
    .then((enabled:boolean) => not(enabled) ? appAutoLauncher.enable() : null) //appAutoLauncher.disable();
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


export let getClonedWindows = () : BrowserWindow[] => {
    let defaultWindowsTitles = ['Quick Entry','Notification'];
    let mainWindowId = isNil(mainWindow) ? 1 : mainWindow.id;
    let windows = BrowserWindow.getAllWindows();

    if(isNil(windows)){ return [] }
    
    return windows
            .filter(v => v)
            .filter((window:BrowserWindow) => {
                let title = window.getTitle();
                let id = window.id;

                let isDefaultWindow = contains(title)(defaultWindowsTitles);
                let isMainWindow = equals(id,mainWindowId);

                return not(isDefaultWindow) && not(isMainWindow);
            }); 
};


let shortcuts = {
    'Ctrl+Alt+T':() => {
        if(isNil(quickEntry)){ return }  
        
        if(quickEntry.isVisible()){
           quickEntry.hide(); 
        }else{
           quickEntry.show();
           quickEntry.focus();
           quickEntry.webContents.send("focus"); 
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
    

    let getWindows = () : BrowserWindow[] => {
        let windows = BrowserWindow.getAllWindows();
        let defaultWindowsTitles = ['Quick Entry','Notification'];

        return reject(
            compose(
                (title:string) : boolean => contains(title)(defaultWindowsTitles),
                (w:BrowserWindow) : string => w.getTitle()
            ),
            windows
        )
    };


    const contextMenu = Menu.buildFromTemplate([
        {
            label:'Hide', 
            type:'normal', 
            click:() => getWindows().forEach(w => w.hide()) 
        }, 
        {
            label:'Restore', 
            type:'normal',  
            click:() => getWindows().forEach(w => w.show()) 
        },
        {
            label:'Quit', 
            type: 'normal', 
            click:() => {
                let windows = BrowserWindow.getAllWindows();
                windows.forEach((w) => w.destroy());
                app.exit();
            }
        },
    ]);


    tray.on(
        'click', 
        () => {
            if(isNil(mainWindow)){ return }

            let visible : boolean = mainWindow.isVisible();
            let windows = getWindows();
            if(visible){ 
               windows.forEach((w) => w.hide()); 
            }else if(not(visible)){ 
               windows.forEach((w) => w.show()); 
            }  
        }
    );


    tray.setToolTip(AppName);
    tray.setContextMenu(contextMenu);
    return tray;
};

    
let getWindowSize = () : {width:number,height:number} => {
    let mainWindowWidth : number = isDev() ? 100 : 60;  
    let mainWindowHeight : number = isDev() ? 100 : 70; 
    let workingArea = screen.getPrimaryDisplay().workAreaSize; 
    let width = mainWindowWidth*(workingArea.width/100); 
    let height = mainWindowHeight*(workingArea.height/100); 
 
    if(not(isDev())){ width = width <= 800 ? width : 800; } 
     
    return {width,height};  
};  


let onReady = () => {  
    if(shouldQuit){ app.exit(); return; }  
    
    registerAllShortcuts();

    dialog.showErrorBox = (title, content) => {};
    tray = createTray();
    listeners = new Listeners(mainWindow); 
    
    
    mainWindow = initWindow(
        getWindowSize(), 
        {  
            maximizable:false,
            show:false
        },
        (handler) => {} 
    );   
    

    quickEntry = initQuickEntry({
        width:500,
        height:300
    }); 


    notification = initNotification({
        width:250, 
        height:300,
    }); 


    mainWindow.on('show', ()=>tray.setToolTip(`Hide ${AppName}`));
    mainWindow.on('hide', ()=>tray.setToolTip(`Show ${AppName}`));
      
    
    loadApp(mainWindow)  
    .then(() => {    
        mainWindow.webContents.send("loaded");
        mainWindow.setMaximizable(true);
        mainWindow.minimize();  
        
        if(isDev()){ mainWindow.webContents.openDevTools(); }  
    });    
    

    loadQuickEntry(quickEntry) 
    .then(() => {
        quickEntry.webContents.send("loaded");
        quickEntry.on('blur', () => quickEntry.hide());  
    });  


    loadNotification(notification)
    .then(
        () => notification.webContents.send("loaded")
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
   
   
          
                

  
  

  
     
 