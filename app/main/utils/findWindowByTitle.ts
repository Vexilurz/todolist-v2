import { BrowserWindow } from "electron";
import { toLower } from 'ramda'; 

export let findWindowByTitle = (title:string) => {
    let windows = BrowserWindow.getAllWindows();
    let target = windows.find((w) => toLower(w.getTitle())===toLower(title)); 
    return target;
};