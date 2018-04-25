import {isNil} from 'ramda';
import {screen, BrowserWindow} from 'electron';

export let getInitialNotificationPosition = (window:BrowserWindow) : {initialX:number,initialY:number} => {
    if(isNil(window)){ return {initialX:0,initialY:0}; }
    
    const {width,height} = screen.getPrimaryDisplay().workAreaSize;
    const size = window.getSize();
    const offset = 25; 
    const initialX = width-size[0]-offset;
    const initialY = height+size[1];
    return {initialX,initialY};
};