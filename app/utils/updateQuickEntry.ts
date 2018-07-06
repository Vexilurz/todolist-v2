import { ipcRenderer } from 'electron';
import { Store, Indicators } from '../types';

export let updateQuickEntry = (nextProps:Store,indicators:Indicators) => 
ipcRenderer.send(
    'updateQuickEntryData',
    {
        todos:nextProps.todos,
        projects:nextProps.projects,
        areas:nextProps.areas,
        indicators
    }
);