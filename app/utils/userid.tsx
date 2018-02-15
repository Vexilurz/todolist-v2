import { ipcRenderer, remote } from 'electron';
const userid = remote.require('node-machine-id');
let { machineId, machineIdSync } = userid;

export let getMachineId = () : Promise<string> => machineId();

export let getMachineIdSync = () : string => {
    return machineIdSync();
};