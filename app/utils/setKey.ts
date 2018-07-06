import { server } from './couchHost';
import { getCredentialsFromToken } from './getCredentialsFromToken';
import axios from 'axios';
import { decryptKey } from './crypto/crypto';
import { isNil, prop, isEmpty } from 'ramda';
import { workerSendAction } from './workerSendAction';
import { pouchWorker } from '../app';
import { Config, actionSetKey } from '../types';
const remote = require('electron').remote;
const session = remote.session;



export let setKey = (config:Config) => {
    let key = config.secretKey;
    let action : actionSetKey = {type:"setKey", load:key};
    return new Promise( 
        resolve => {
            session.defaultSession.cookies.get(
                {url: server}, 
                (error, cookies) => {
                    let cookie = cookies[0];
                    if(cookie && cookie.name==="AuthToken" && isNil(key)){
                        let token = cookie.value; 
                        let {password} = getCredentialsFromToken(token);

                        return axios({method:'get',url:`${server}/users/key`,headers:{'AuthToken':token}}) 
                        .then(prop("data"))
                        .then((key:any) => {
                            if(isNil(key) || isEmpty(key)){
                               return null;
                            }else{
                               return decryptKey(password)(key);
                            } 
                        })
                        .then((key:any) => {
                            if(!isEmpty(key) && !isNil(key)){
                               action.load = key;
                               config.secretKey = key;
                            }
                            return workerSendAction(pouchWorker)(action).then(() => resolve(config));
                        })
                        .catch(e => workerSendAction(pouchWorker)(action).then(() => resolve(config))) 
                    }else{
                        return workerSendAction(pouchWorker)(action).then(() => resolve(config));
                    }
                }
            )
        } 
    ) 
};