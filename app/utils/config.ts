import { isNil, isEmpty, when } from 'ramda';
import { ipcRenderer } from 'electron';
import {defaultTags} from './defaultTags';
import { requestFromMain } from './requestFromMain';
import { isNotNil } from './utils';

export let getConfig = () : Promise<any> => requestFromMain<any>("getConfig", [], (event, config) => config);

export let updateConfig = (load:any) => requestFromMain<any>("updateConfig", [load], (event, config) => config);

let clearStorage = (onError:Function) : Promise<void> => requestFromMain<any>(
    "updateConfig", 
    [], 
    (event, err) => err
).then(
    when(isNotNil,onError)
);
