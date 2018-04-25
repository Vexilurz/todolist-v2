import { isNil, isEmpty, when } from 'ramda';
import { ipcRenderer } from 'electron';
import { requestFromMain } from './requestFromMain';
import { isNotNil } from './isSomething';

export let getConfig = () : Promise<any> => requestFromMain("getConfig", [], (event, config) => config);

export let updateConfig = (load:any) => requestFromMain("updateConfig", [load], (event, config) => config);
