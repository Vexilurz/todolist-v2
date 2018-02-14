import { loadApp, loadQuickEntry } from './loadApp'; 
import fs = require('fs');     
import electron = require('electron');
import { 
    ipcMain,dialog,app,BrowserWindow,Menu,MenuItem,
    globalShortcut,BrowserView,Tray,nativeImage,protocol
} from 'electron';
import { Listeners } from "./listeners";
import { initWindow, initQuickEntry } from "./initWindow";
import { isNil, isEmpty, not } from 'ramda';  
import { defaultTags } from './../utils/defaultTags';
import { isDev } from './../utils/isDev';

const os = require('os');
let path = require("path");
const log = require("electron-log");
const storage = require('electron-json-storage'); 
storage.setDataPath(os.tmpdir()); 
let AutoLaunch = require('auto-launch');
let appAutoLauncher = new AutoLaunch({
    name: 'Tasklist',
    isHidden: true 
});

//appAutoLauncher.enable();
//appAutoLauncher.disable();

appAutoLauncher
.isEnabled()
.then((enabled:boolean) => not(enabled) ? appAutoLauncher.enable() : null)
.catch((err) => console.log(err));




export let mainWindow : BrowserWindow;   
export let quickEntry : BrowserWindow;   
export let listeners : Listeners;  
export let dateCalendar : BrowserWindow; 
export let tray : Tray;
 
const CtrlAltT : string = 'Ctrl+Alt+T';

const CtrlD : string = 'Ctrl+D';


const shouldQuit = app.makeSingleInstance(
    (commandLine, workingDirectory) => {
        if(mainWindow){
            mainWindow.show();
            mainWindow.restore();  
            mainWindow.focus();
        } 
    }
);  


   
const defaultConfig = { 
    nextUpdateCheck:new Date(),
    firstLaunch:true,
    hideHint:false,
    defaultTags:defaultTags,  
    shouldSendStatistics:true,
    showCalendarEvents:true,
    groupTodos:false,
    preserveWindowWidth:true, //when resizing sidebar
    enableShortcutForQuickEntry:true,
    quickEntrySavesTo:"inbox", //inbox today next someday
    moveCompletedItemsToLogbook:"immediately"
}


interface Config{
    nextUpdateCheck:Date,
    firstLaunch:boolean, 
    defaultTags:string[],
    hideHint:boolean,
    shouldSendStatistics:boolean,
    showCalendarEvents:boolean,
    groupTodos:boolean,
    preserveWindowWidth:boolean, //when resizing sidebar
    enableShortcutForQuickEntry:boolean,
    quickEntrySavesTo:string, //inbox today next someday
    moveCompletedItemsToLogbook, //immediatelly
}



let getConfig = () : Promise<any> => {
    return new Promise( 
        resolve => {
            storage.get( 
                "config", 
                (error, data:any) => {  
                    if(isNil(data) || isEmpty(data)){ resolve(defaultConfig) }
                    else{ resolve({...data,firstLaunch:false} ) }
                }
            )   
        }
    )
}; 


let createTray = () : Tray => {
    let iconPath = path.join(__dirname,"icon.ico"); 
    let tray = null;

    if(fs.existsSync(iconPath)){
      tray =  new Tray(iconPath);   
    }else{
      tray = new Tray(nativeImage.createEmpty()); 
      //let image = nativeImage.createFromPath('/Users/somebody/images/icon.png')
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



    tray.setToolTip('Tasklist');
    tray.setContextMenu(contextMenu);
    return tray;
}



let onCtrlAltT = () : void => {
    if(isNil(quickEntry)){ return }  
    
    if(quickEntry.isVisible()){
       quickEntry.hide(); 
    }else{
       quickEntry.show();
       quickEntry.focus();
    }
} 
  


let onCtrlD = () : void => mainWindow.webContents.openDevTools();   
 


let preventAnnoyingErrorPopups = () => dialog.showErrorBox = (title, content) => {};
  


let initListeners = (window:BrowserWindow) => new Listeners(window);



let onAppLoaded = () : void => {    
    mainWindow.webContents.send("loaded");
    if(isDev()){ mainWindow.webContents.openDevTools(); }
};



let onQuickEntryLoaded = () : void => {    
    getConfig().then(
        (config:Config) => {
            quickEntry.webContents.send("loaded",config);
            quickEntry.on('blur', () => quickEntry.hide());  
            //if(dev()){ quickEntry.webContents.openDevTools() } 
        }
    )
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


let getQuickEntrySize = () : {width:number,height:number} => {
    let {width,height} = electron.screen.getPrimaryDisplay().workAreaSize;
  
    return {width:500,height:300};  
};  


let onReady = () => {       
    if(shouldQuit){
       app.exit();   
       return;
    }    

    tray = createTray();

    preventAnnoyingErrorPopups(); 

    if(globalShortcut){ 
       globalShortcut.register(CtrlAltT, onCtrlAltT);   
       globalShortcut.register(CtrlD, onCtrlD);
    }  

    mainWindow = initWindow(getWindowSize());   
    quickEntry = initQuickEntry(getQuickEntrySize());
    listeners = initListeners(mainWindow); 

    mainWindow.on(
        'show', 
        () => {
            tray.setToolTip('Hide Tasklist');
        }
    ) 
    mainWindow.on(
        'hide', 
        () => { 
            tray.setToolTip('Show hidden windows');
        }
    )

    loadApp(mainWindow).then(onAppLoaded);   
    loadQuickEntry(quickEntry).then(onQuickEntryLoaded);  
};               

 
app.on('ready', onReady);    
 

process.on( 
    "unchaughtException" as any,
    (error) => {
        if(isNil(mainWindow)){ 
            console.log(error);
        }else{ 
            mainWindow.webContents.send("error", error); 
        }
    }
);

 
app.on(     
   'window-all-closed', 
    () => { 
        if(globalShortcut){
           globalShortcut.unregister(CtrlAltT);
           globalShortcut.unregister(CtrlD);
        }  

        app.exit(); 
    }     
);     
   
   
 
         
                

  
  

  
     
 