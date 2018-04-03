import { loadApp, loadQuickEntry, loadNotification } from './loadApp'; 
import fs = require('fs');     
import { dialog,app,BrowserWindow,Menu,screen,globalShortcut,Tray,nativeImage } from 'electron';
import { Listeners } from "./listeners";
import { initWindow, initQuickEntry, initNotification } from "./initWindow";
import { 
    isNil, not, forEachObjIndexed, when, contains, compose, equals, 
    ifElse, reject, isEmpty, defaultTo, map, identity, toLower 
} from 'ramda';  
import { isDev } from './../utils/isDev';
import { defaultTags } from '../utils/defaultTags';
import { isNotNil } from '../utils/isSomething';
const os = require('os');
const path = require("path");
const storage = require('electron-json-storage');
storage.setDataPath(os.tmpdir());



interface Config{
    nextUpdateCheck:Date,
    firstLaunch:boolean, 
    defaultTags:string[],
    hideHint:boolean,
    shouldSendStatistics:boolean,
    showCalendarEvents:boolean,
    disableReminder:boolean,
    groupTodos:boolean,
    preserveWindowWidth:boolean, //when resizing sidebar
    enableShortcutForQuickEntry:boolean,
    quickEntrySavesTo:string, //inbox today next someday
    moveCompletedItemsToLogbook, //immediatelly
};


const defaultConfig : Config = { 
    nextUpdateCheck:new Date(),
    firstLaunch:true,
    hideHint:false,
    defaultTags:defaultTags,  
    shouldSendStatistics:true,
    showCalendarEvents:true,
    groupTodos:false,
    preserveWindowWidth:true, //when resizing sidebar
    enableShortcutForQuickEntry:true,
    disableReminder:false,
    quickEntrySavesTo:"inbox", //inbox today next someday
    moveCompletedItemsToLogbook:"immediately"
};



export let getConfig = () : Promise<any> => {  
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
                        disableReminder:false,
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



export let updateConfig = (load:any) : Promise<any> => {
    return getConfig().then( 
        (config:Config) => {
            let updated = { ...config, ...load } as Config;
            return new Promise(
                resolve => storage.set(  
                    "config", 
                    updated, 
                    (error) => {
                        if(!isNil(error)){ resolve(defaultConfig) }
                        resolve(updated as Config); 
                    }
                )
            )
        }
    )
};


export let clearStorage = () : Promise<void> => {
    return new Promise( 
        (resolve) => storage.clear(
            (error) => {
                if(!isNil(error)){ 
                    resolve(error) 
                }else{ 
                    resolve() 
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
 


export let findWindowByTitle = (title:string) => {
    let windows = BrowserWindow.getAllWindows();
    let target = windows.find((w) => toLower(w.getTitle())===toLower(title)); 
    return target;
};



export let getClonedWindows = () : BrowserWindow[] =>  
            BrowserWindow
            .getAllWindows()
            .filter(
                (window:BrowserWindow) => {
                    let mainWindowId = isNil(mainWindow) ? 1 : mainWindow.id;
                    let title = window.getTitle();
                    let id = window.id;

                    let isDefaultWindow = contains(title)(['Add task','Notification']);
                    let isMainWindow = equals(id,mainWindowId);

                    return not(isDefaultWindow) && not(isMainWindow);
                }
            ); 



let shortcuts = {
    'Ctrl+Alt+T':() => {
        if(isNil(quickEntry)){ return }   
        quickEntry.show();
        quickEntry.focus();
        quickEntry.setSkipTaskbar(false); 
        quickEntry.webContents.send("focus"); 
    },
    'Ctrl+Alt+D+P':() => mainWindow.webContents.openDevTools(),
    'Ctrl+B':() => {
        if(isNil(mainWindow)){ return }

        if( mainWindow.isVisible() && mainWindow.isFocused() ){  
            mainWindow.webContents.send("toggle");
        }
    }
};


 
let registerAllShortcuts = () : void => {
    forEachObjIndexed(
        (value:Function,key:string) => globalShortcut.register(key, value)  
    )(shortcuts)
}; 
 


let unregisterAllShortcuts = () => globalShortcut.unregisterAll();



export let toggleShortcut : (enable:boolean, shortcut:string) => void =
    ifElse(
        identity,
        (enable, shortcut) => globalShortcut.register(shortcut, shortcuts[shortcut]),
        (enable, shortcut) => globalShortcut.unregister(shortcut)
    ); 



let createTray = () : Tray => {
    let iconPath = path.join(__dirname, "icon.ico"); 
    let tray = null;

    if(fs.existsSync(iconPath)){
       tray = new Tray(iconPath);   
    }else{
       tray = new Tray(nativeImage.createEmpty()); 
    }   
    
    let getWindows = () : BrowserWindow[] => {
        let windows = BrowserWindow.getAllWindows();
        let defaultWindowsTitles = ['Add task','Notification'];

        return reject(
            compose(
                (title:string) : boolean => contains(title)(defaultWindowsTitles),
                (w:BrowserWindow) : string => w.getTitle()
            ),
            windows
        ); 
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


export let initAutoLaunch = (shouldEnable:boolean) : Promise<void> => {
    let appAutoLauncher = new AutoLaunch({name: AppName, isHidden: true});

    return appAutoLauncher.isEnabled()
    .then((enabled:boolean) => {
        if(enabled){
           appAutoLauncher.disable();
        }
    })
    .then(() => { 
        if(shouldEnable){
           appAutoLauncher.enable();
        }
    })
    .catch((err) => console.log(err));
};


let onReady = (showTray:boolean, config:any) => {  


    let {disableReminder, enableShortcutForQuickEntry} = config;

    if(shouldQuit){ app.exit(); return; }  

    let shouldHideApp : boolean = contains("--hidden")(process.argv);
    
    listeners = new Listeners(mainWindow); 

    dialog.showErrorBox = (title, content) => {};

    registerAllShortcuts(); 

    toggleShortcut(enableShortcutForQuickEntry, 'Ctrl+Alt+T');
    
    initAutoLaunch(enableShortcutForQuickEntry && not(disableReminder));   


    
    mainWindow = initWindow(
        getWindowSize(), 
        {maximizable:true, show:false},
        (handler:BrowserWindow) => shouldHideApp ? handler.hide() : handler.show() 
    );    

    quickEntry = initQuickEntry({
        width:500,
        height:300 
    });  

    notification = initNotification({ 
        width:250,
        height:200
    });   
    


    if(showTray){ 
       tray = createTray();
       mainWindow.on('show', () => tray.setToolTip(`Hide ${AppName}`));
       mainWindow.on('hide', () => tray.setToolTip(`Show ${AppName}`));
    }



    mainWindow.on(
        'unresponsive', 
        (e) => {
            
            mainWindow.webContents.send("error", `application unresponsive...`);

            dialog.showMessageBox(
                mainWindow,
                {
                    type: "none", 
                    buttons: ["Restart application", "Wait"],
                    title: `${AppName} is not responding`,
                    message: `${AppName} is not responding`
                },
                (response) => {
                    let restart = 0;
                    if(response===restart){
                       app.relaunch();
                       app.exit(0);
                    }
                }   
            )
        }
    )

 

    mainWindow.webContents.on(
        'crashed', 
        (event,killed) => {
            if(killed){ console.log('killed'); return; }
            console.log(`CRASHED`);

            mainWindow.webContents.send("error", `main window crashed...`);
 
            loadApp(mainWindow)
            .then(() => {    
                mainWindow.webContents.send("loaded",null,mainWindow.id);

                if(not(shouldHideApp)){ mainWindow.focus(); }

                if(isDev()){ mainWindow.webContents.openDevTools(); }  
            }) 
        }
    )



    quickEntry.webContents.on(
        'crashed', 
        (event,killed) => {
            if(killed){ console.log('killed'); return; }
            console.log(`CRASHED`);

            mainWindow.webContents.send("error", `quick entry crashed...`);

            loadQuickEntry(quickEntry) 
            .then(() => {
                quickEntry.webContents.send("loaded", quickEntry.id); 
                if(isDev()){ quickEntry.webContents.openDevTools(); } 
            });  
        }
    )
    

    
    loadNotification(notification).then(() => notification.webContents.send("loaded"));


    loadQuickEntry(quickEntry) 
    .then(() => {
        quickEntry.webContents.send("loaded"); 
 
        if(isDev()){ quickEntry.webContents.openDevTools(); } 
    });  


    loadApp(mainWindow)
    .then(() => {    
        mainWindow.webContents.send("loaded",null,mainWindow.id);

        if(not(shouldHideApp)){ mainWindow.focus(); }

        if(isDev()){ mainWindow.webContents.openDevTools(); }  
    });  
};               

 

app.on('ready', () => getConfig().then((config) => onReady(true, config)));    



process.on( 
    "unchaughtException" as any,
    (error) => when(
        () => isNotNil(mainWindow),
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
   
   
          
                

  
  

  
     
 