import { AppName } from './AppName';
import { Tray, BrowserWindow, Menu, app } from 'electron';
const path = require("path");
import { isNil, not, contains, compose, reject } from 'ramda';  


export let createTray = (mainWindow:BrowserWindow) : Tray => {
    let iconPath = path.join(__dirname, "icon.ico"); 
    let tray = new Tray(iconPath);   
   
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
            type:'normal', 
            click:() => {
                let windows = BrowserWindow.getAllWindows();
                windows.forEach((w) => w.destroy());
                app.quit();
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


    

