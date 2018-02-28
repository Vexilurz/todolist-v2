import { loadApp, loadQuickEntry, loadNotification } from './loadApp'; 
import fs = require('fs');     
import {dialog,app,BrowserWindow,Menu,screen,globalShortcut,Tray,nativeImage} from 'electron';
import { Listeners } from "./listeners";
import { initWindow, initQuickEntry, initNotification } from "./initWindow";
import { isNil, not, forEachObjIndexed, when, contains, compose, equals, ifElse, reject, isEmpty, defaultTo, map } from 'ramda';  
import { isDev } from './../utils/isDev';
import { defaultTags } from '../utils/defaultTags';
const os = require('os');
const path = require("path");
const storage = require('electron-json-storage');
storage.setDataPath(os.tmpdir());
import AWS = require('aws-sdk');
import { isNewVersion } from '../utils/isNewVersion';
AWS.config.update({ 
    "accessKeyId": "AKIAJIB2J2OEHLXZYACQ", 
    "secretAccessKey": "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", 
    "region": "us-east-1" 
});
let s3 = new AWS.S3();

interface s3Item{ 
    Key: string,
    LastModified: string,
    ETag: string,
    Size: number,
    StorageClass: string,
    Owner: any 
}

interface s3List{ 
    IsTruncated?: boolean,
    Marker?: string,
    Contents: s3Item[],
    Name: string,
    Prefix: string,
    MaxKeys: number,
    CommonPrefixes: any[] 
}

const Bucket = "todoappupdates";

let getS3List = () : Promise<s3Item[]> => new Promise(
    resolve => s3.listObjects(
        {Bucket}, 
        (err,data) => {

            if(isNil(err)){
                let list = data.Contents;
                resolve(list as any)
            }else{
                resolve([])
            }
        }
    )
);


let removeObjects = (keys:string[]) : Promise<any> => new Promise(
    resolve => {
        s3.deleteObjects(
            {
                Bucket, 
                Delete:{ Objects:compose(map( Key => ({Key}) ), defaultTo([]))(keys) }
            }, 
           (err, data) => {
                if(isNil(err)){
                    resolve(data)
                }else{
                    resolve(undefined)
                }
            }
        );
    }
);


let removeOlderVersions = () : Promise<any> => {
    let lastValuableVersion = 'tasklist Setup 1.3.0-master.exe';

    return getS3List()
    .then(
        compose(
            (items) => items.filter((Key) => isNewVersion(Key,lastValuableVersion)), 
            (items) => items.filter((Key) => contains('tasklist')(Key)),
            map((item:s3Item) => item.Key),
            defaultTo([])
        )
    ).then(
        (keys:any[]) => {
            console.log(`items to remove`,keys);
            return keys;
        }
    ).then( 
        (keys:string[]) => removeObjects(keys)
    ).then(
        (result) => console.log(result)
    )
};



let getConfigMain = () : Promise<any> => {  
    return new Promise( 
        resolve => storage.get(   
            "config",  
            (error, data) => {  
                if(isNil(data) || isEmpty(data)){
                    resolve({ 
                        nextUpdateCheck:new Date(),
                        firstLaunch:true,
                        hideHint:false, 
                        defaultTags:defaultTags,  
                        shouldSendStatistics:true,
                        showCalendarEvents:true,
                        groupTodos:false,
                        preserveWindowWidth:true, //when resizing sidebar
                        enableShortcutForQuickEntry:true,
                        enableReminder:true,
                        quickEntrySavesTo:"inbox", //inbox today next someday
                        moveCompletedItemsToLogbook:"immediately"
                    });
                }else{  
                    resolve({...data,firstLaunch:false}); 
                } 
            }
        )  
    )
}; 


export const AppName = 'Tasklist';
export let mainWindow : BrowserWindow;   
export let quickEntry : BrowserWindow;   
export let notification : BrowserWindow;
export let listeners : Listeners;  
export let dateCalendar : BrowserWindow; 
export let tray : Tray;


const AutoLaunch = require('auto-launch');


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



let initAutoLaunch = () : Promise<void> => {
    let appAutoLauncher = new AutoLaunch({name: AppName, isHidden: true});

    return appAutoLauncher.isEnabled()
    .then((enabled:boolean) => enabled ? appAutoLauncher.disable() : null)
    .then(() => appAutoLauncher.enable())
    .catch((err) => console.log(err));
};



let onReady = (showTray:boolean, config:any) => {  
    let {enableReminder, enableShortcutForQuickEntry} = config;

    if(shouldQuit){ 
       app.exit(); 
       return; 
    }  

    let shouldHideApp : boolean = contains("--hidden")(process.argv); 

    removeOlderVersions()
    .then(
        () => {
            getS3List()
            .then((list) => console.log(`after cleanup`, list))
        }   
    );


    registerAllShortcuts(); 
    initAutoLaunch();   

    dialog.showErrorBox = (title, content) => {}; 
    
    listeners = new Listeners(mainWindow); 
    
    mainWindow = initWindow(
        getWindowSize(), 
        {  
            maximizable:true,
            show:false
        },
        (handler:BrowserWindow) => shouldHideApp ? 
                                    handler.hide() : 
                                    handler.show() 
    );    


    quickEntry = initQuickEntry({width:500,height:300}); 
    //quickEntry.webContents.openDevTools();  
      
    notification = initNotification({
        width:250, 
        height:200 
    });   
    
 
    if(showTray){ 
        tray = createTray();
        mainWindow.on('show', () => tray.setToolTip(`Hide ${AppName}`));
        mainWindow.on('hide', () => tray.setToolTip(`Show ${AppName}`));
    }
       
    loadApp(mainWindow)  
    .then(() => {    
        mainWindow.webContents.send("loaded");

        if(not(shouldHideApp)){
           mainWindow.focus(); 
        }

        if(isDev()){ 
           mainWindow.webContents.openDevTools(); 
        }  
    });    
    

    loadQuickEntry(quickEntry) 
    .then(() => {
        quickEntry.webContents.send("loaded"); 
 
        quickEntry.on('blur',(event) => {
            event.preventDefault(); 
            quickEntry.hide()
        });   
        quickEntry.on('close',(event) => {
            event.preventDefault(); 
            quickEntry.hide();
        });
    });  


    loadNotification(notification)
    .then(
        () => notification.webContents.send("loaded")
    );
};               


app.on(
    'ready', 
    () =>  getConfigMain().then((config) => onReady(true,config))
);    
 

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
   
   
          
                

  
  

  
     
 