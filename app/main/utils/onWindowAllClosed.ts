import { unregisterAllGlobalShortcuts, unregisterAllLocalShortcuts } from './../shortcuts';
import { listeners } from '../main';
import { app } from 'electron';


export let onWindowAllClosed = () => { 
    unregisterAllGlobalShortcuts();
    listeners.stopToListenOnAllChannels();
    app.exit(); 
};       
