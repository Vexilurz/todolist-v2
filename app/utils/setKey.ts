import { server, host } from './couchHost';
import { getCredentialsFromToken } from './getCredentialsFromToken';
import axios from 'axios';
import { decryptKey } from './crypto/crypto';
import { isNil, prop, isEmpty } from 'ramda';
import { workerSendAction } from './workerSendAction';
import { pouchWorker } from '../app';
import { Config, actionSetKey } from '../types';
import { getToken } from './getToken';
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

                    if(cookie && cookie.name==="AuthToken"){

                        let token = cookie.value; 
                        let { password, username } = getCredentialsFromToken(token);

                        return axios({
                            method:'get',
                            url:`${server}/users/key`,
                            headers:{'AuthToken':token}
                        }) 
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

                            return axios({ 
                                method:'post', 
                                url:`${host}/_session`, 
                                data:{ name:username, password }, 
                                headers: {'Authorization': 'Basic ' + getToken({username, password})}
                            })
                            .then(
                                response => {
                                    console.log('response.status', response.status)
                                    console.log('response.statusText', response.statusText)
                                    console.log('response.data', response.data)
                                    return response
                                }
                            )
                            .then(
                                () => workerSendAction(pouchWorker)(action).then(() => resolve(config))
                            );
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