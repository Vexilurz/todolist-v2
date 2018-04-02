import path = require("path");
import {BrowserWindow,Menu} from 'electron';  
import { mainWindow } from "./main";

export let initWindow = (
    {width,height}:{width:number,height:number},
    options={},
    onReady=(handler) => handler.show()
): BrowserWindow => {       
    Menu.setApplicationMenu(null);
        
    let icon = path.resolve(__dirname,'icon.ico');
    let handler = new BrowserWindow({
        icon,
        width,         
        height,   
        title:'Tasklist',      
        center:true,
        frame:true, 
        ...options
    }) as any;       
    
    handler.on('ready-to-show',() => onReady(handler));
    
    handler.on('will-prevent-unload', (event) => { event.preventDefault() });

    /*
    handler.on(
        'close', 
        (event) => {
            console.log(`callback ${handler.id}`)
            
            //hide if main window
            if(handler.id===1){ 
                console.log(`hide ${handler.id}`)
                event.preventDefault(); 
                handler.hide(); 
            }else{ 
                console.log(`close ${handler.id}`)
                
                //if separate window - close, update windows counter in main window 
                handler.close(); 

                //update counter
                mainWindow.webContents.send(
                    'separateWindowsCount', 
                    BrowserWindow.getAllWindows().filter(w => !w.isDestroyed()).length
                );
            }  
        } 
    );
    */

    handler.on(
        'closed', 
        () => {
            handler = null;
        }
    ); 

    return handler; 
};         


export let initQuickEntry = ({width,height}:{width:number,height:number}) : BrowserWindow => { 
    Menu.setApplicationMenu(null);   
    let icon = path.resolve(__dirname,'icon.ico');
    let handler = new BrowserWindow({   
        width,          
        icon,
        height,      
        show:false, 
        useContentSize:true,  
        title:'Add task',    
        center:true,       
        minimizable:true,
        frame:true    
    } as any);                 
  
    handler.setResizable(true); 
    handler.setMovable(true); 
    handler.setSkipTaskbar(true);
    handler.hide(); 
    return handler;  
};        


export let initNotification = ({width,height}:{width:number,height:number}):BrowserWindow => { 
    Menu.setApplicationMenu(null);   
    let handler = new BrowserWindow({    
        width,          
        height,      
        show:false, 
        useContentSize:true, 
        title:'Notification',    
        center:false,       
        frame:false  
    } as any);    

    handler.setAlwaysOnTop(true);
    handler.setResizable(false); 
    handler.setSkipTaskbar(true);
    handler.on('closed', () => {handler = null;}); 
    handler.hide(); 
    return handler;  
};   