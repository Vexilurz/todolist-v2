import { isNil, isEmpty, when } from 'ramda';
import { ipcRenderer } from 'electron';
import {defaultTags} from './defaultTags';
import { requestFromMain } from './requestFromMain';
import { isNotNil } from './isSomething';

export let getConfig = () : Promise<any> => requestFromMain<any>("getConfig", [], (event, config) => config);

export let updateConfig = (load:any) => requestFromMain<any>("updateConfig", [load], (event, config) => config);
