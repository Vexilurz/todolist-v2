import { BrowserWindow, screen } from 'electron';
import { isNil } from 'ramda';

export let getFinalNotificationPosition = (window:BrowserWindow) : {finalX:number,finalY:number} => {
    if(isNil(window)){ return {finalX:0,finalY:0}; }
    
    const {width,height} = screen.getPrimaryDisplay().workAreaSize;
    const size = window.getSize();
    const offset = 25;
    const finalX = width-size[0]-offset;
    const finalY = height-size[1]-offset; 
    return {finalX,finalY};
};



