import { isDev } from './../../utils/isDev';
import { screen } from 'electron'; 

export let getClonedWindowDimensions = () => {
    let workingArea = screen.getPrimaryDisplay().workAreaSize;
    let clonedWindowWidth : number = isDev() ? 100 : 30;
    let clonedWindowHeight : number = isDev() ? 100 : 80;  
    let width = clonedWindowWidth*(workingArea.width/100);  
    let height = clonedWindowHeight*(workingArea.height/100); 
    return {width,height};
};
