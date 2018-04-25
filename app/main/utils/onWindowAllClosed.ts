import { unregisterAllShortcuts } from './../shortcuts';
import { listeners } from '../main';
import { app } from 'electron';


export let onWindowAllClosed = () => { 
    unregisterAllShortcuts();
    listeners.stopToListenOnAllChannels();
    app.exit(); 
};       
