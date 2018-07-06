import { ipcRenderer } from 'electron';

export let onCloseWindow = (isMainWindow:boolean) => () => {
    if(isMainWindow){
       ipcRenderer.send('Mhide'); 
       return false; 
    }else{
       ipcRenderer.send('separateWindowsCount'); 
       return undefined;
    }
};