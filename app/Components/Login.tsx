import Refresh from 'material-ui/svg-icons/navigation/refresh';
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { isNil, isEmpty, compose, path, toLower, cond, contains, defaultTo, ifElse, prop, when, allPass } from 'ramda';
import Cloud from 'material-ui/svg-icons/file/cloud-done';
import { action, actionStartSync, actionSetKey, actionEncryptDatabase } from '../types';
import { getMonthName, isNotEmpty, nDaysFromNow } from '../utils/utils';
import Toggle from 'material-ui/Toggle';
import { timeOfTheDay } from '../utils/time';
import { isToday, isNotNil } from '../utils/isSomething';
import axios from 'axios';
import { emailToUsername } from '../utils/emailToUsername';
import { host, server } from '../utils/couchHost';
import { validateEmail } from '../utils/validateEmail';
import { validatePassword, getPasswordErrorMessage } from '../utils/validatePassword';
import { LoginFormInput  } from './LoginFormInput';
import { getToken } from '../utils/getToken';
import { workerSendAction } from '../utils/workerSendAction';
import { pouchWorker } from '../app';
import { isDev } from '../utils/isDev';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import { encryptDoc, encryptData, decryptData, encryptKey, decryptKey, generateSecretKey } from '../utils/crypto/crypto';
import { LoginForm } from './LoginForm';
import { globalErrorHandler } from '../utils/globalErrorHandler';
const remote = require('electron').remote;
const session = remote.session;



interface LoginProps{
    dispatch:(action:action) => void,
    setAuthenticated:Function,
    secretKey:string,
    email:string
}



interface LoginState{}



export class Login extends Component<LoginProps,LoginState>{

    constructor(props){
        super(props);
    } 



    encryptDatabase = (key:string) : Promise<void> => {
        let action : actionEncryptDatabase = {type:"encryptDatabase", load:key};

        return workerSendAction(pouchWorker)(action);
    };



    initSync = (username:string)  => () : Promise<void> => { 
        let action : actionStartSync = {type:"startSync", load:username};

        return workerSendAction(pouchWorker)(action);
    };



    digestKeys = ([retrieved,requested]) : string => {
                
        if(isNil(retrieved) && isNotNil(requested)){

            //application have been launched on other devices or local roaming data was removed
            return requested;

        }else if(isNotNil(retrieved) && isNil(requested)){

            //What could be the reason for this ?
            //Network error ? Key could not exist locally and not exist remotely.
            //use retrieved

            return retrieved;

        }else if(isNotNil(retrieved) && isNotNil(requested)){

            if(retrieved===requested){
                return retrieved;
            }else{
                //something goes wrong this scenario should not be possible
                //throw an error ?
                return retrieved;
            }

        }else if(isNil(retrieved) && isNil(requested)){

            //first launch on first device
            //generate key, submit to server, save locally   
            return null;

        }else{
            if(isDev()){ throw new Error('Incorrect logic') }
        }
    };

    
    //"U2FsdGVkX1/OANF01CahKJ+gCiyPx8dw/QWJIJs3HmrXr/pFf2DCuOVni9uMXLI5"
    //save key locally and remotely if needed
    preserveKey = (requested:string,retrieved:string,email:string,password:string) => (key:string) => {
        let username = emailToUsername(email); 
        let submitKey = (key:string) => axios({
            method:'post',
            url:`${server}/users/key`,
            data:{ username, password, key }
        });
        let load = [{type:'sync',load:true},{type:'email',load:email}]; 
        
        if(isNil(key)){
            let newKey = generateSecretKey();
            let encryptedKey = encryptKey(password)(newKey);

            this.props.dispatch({type:'multiple',load:[ {type:"secretKey", load:newKey}, ...load ]});

            return submitKey(encryptedKey).then(
                (resp) => {
                   return newKey;
                }
            );
        }else if(isNil(requested) && !isNil(retrieved)){

            this.props.dispatch({type:'multiple', load:[{ type:"secretKey", load:key }, ...load]});
            let encryptedKey = encryptKey(password)(key);

            return submitKey(encryptedKey).then(
                (resp) => {
                   return key;
                }
            );
        }else{

            this.props.dispatch({type:'multiple', load:[{ type:"secretKey", load:key }, ...load]});
            return new Promise(resolve => resolve(key));
        }
    };



    setKeyInWorker = (key:string) => {
        let action = {type:"setKey", load:key} as actionSetKey;

        return workerSendAction(pouchWorker)(action).then(() => key); 
    };



    onAuth = ({email,password} : {email:string,password:string}) => response => {
        if(response.status!==200){ return }
        let decrypt = when(allPass([isNotNil, isNotEmpty]),decryptKey(password));
        let retrieveKey = () : Promise<string> => new Promise(resolve => resolve(this.props.secretKey));
        let username = emailToUsername(email); 
        let expire = nDaysFromNow(1000);
      
        let token = getToken({username, password});

        session.defaultSession.cookies.set( 
            {url:server,name:'AuthToken',value:token,expirationDate:expire.getTime()}, 
            globalErrorHandler
        );

        let requestKey = () => axios({
            method:'get', 
            url:`${server}/users/key`, 
            headers: { 'AuthToken' : token }
        })
        .then(prop("data"))
        .then((key:any) => {
            if(isNil(key) || isEmpty(key)){
               return null;
            }else{
               return decryptKey(password)(key);
            }
        }); 
        
        return Promise
        .all([retrieveKey(),requestKey()])
        .then(
            ([retrieved,requested]) => [retrieved,requested,this.digestKeys([retrieved,requested])]
    
        ) //return key or null
        .then(
            ([retrieved,requested,key]) => this.preserveKey(
                requested, 
                retrieved,
                email,
                password
            )(key)
        )
        .then(this.setKeyInWorker)
        .then(this.encryptDatabase)
        .then(this.initSync(username))
        .then(() => this.props.setAuthenticated(true))
    };      



    render(){
        return <LoginForm email={this.props.email} onAuth={this.onAuth}/>
    }
};