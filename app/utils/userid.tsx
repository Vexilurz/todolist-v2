import { ipcRenderer, remote } from 'electron';

export let getMachineId = () : Promise<string> => new Promise(resolve => resolve(' '));

export let getMachineIdSync = () : string => { return ' ' };