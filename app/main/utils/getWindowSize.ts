import { isDev } from './../../utils/isDev';
import {screen, BrowserWindow} from 'electron';

export let getWindowSize = () : {width:number,height:number} => {
    let mainWindowWidth : number = isDev() ? 100 : 60;  
    let mainWindowHeight : number = isDev() ? 100 : 70; 
    let workingArea = screen.getPrimaryDisplay().workAreaSize; 
    let width = mainWindowWidth*(workingArea.width/100); 
    let height = mainWindowHeight*(workingArea.height/100); 
 
    if(!isDev()){ width = width <= 800 ? width : 800; } 
     
    return {width,height};  
};  