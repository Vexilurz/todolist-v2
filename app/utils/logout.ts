import { pouchWorker } from './../app';
import { removeCouchCookies } from './removeCouchCookies';
import { removeAuthCookies } from './removeAuthCookies';
import { workerSendAction } from './workerSendAction';
import { host, server } from './couchHost';

export let logout = () : Promise<void> => 
        workerSendAction(pouchWorker)({type:"stopSync", load:null})
        .then(() => removeCouchCookies(host))
        .then(() => removeAuthCookies(server));