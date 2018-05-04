import { pouchWorker } from './../app';
import { removeCouchCookies } from './removeCouchCookies';
import { workerSendAction } from './workerSendAction';
import { host } from './couchHost';

export let logout = () : Promise<void> => {
    return workerSendAction(pouchWorker)({type:"stopSync", load:null})
    .then(() => removeCouchCookies(host))
};