import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { isNil, isEmpty, prop, when, ifElse } from 'ramda';
import { action, actionStartSync, actionSetKey, actionEncryptDatabase, actionEraseDatabase } from '../types';
import { nDaysFromNow } from '../utils/utils';
import { isNotNil } from '../utils/isSomething';
import axios from 'axios';
import { emailToUsername } from '../utils/emailToUsername';
import { server } from '../utils/couchHost';
import { getToken } from '../utils/getToken';
import { workerSendAction } from '../utils/workerSendAction';
import { pouchWorker } from '../app';
import { encryptKey, decryptKey, generateSecretKey } from '../utils/crypto/crypto';
import { LoginForm } from './LoginForm';
import { globalErrorHandler } from '../utils/globalErrorHandler';
const remote = require('electron').remote;
const session = remote.session;


let switchAccount = ([retrieved,requested]) => isNotNil(retrieved) && isNotNil(requested) && retrieved!==requested;
        

let requestKey = (token,password) => axios({
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



    eraseDatabase = () : Promise<void> => {
        let action : actionEraseDatabase = {type:"eraseDatabase", load:null};

        return workerSendAction(pouchWorker)(action);
    };



    setKeyInWorker = (key:any) => {
        let action = {type:"setKey", load:key} as actionSetKey;

        return workerSendAction(pouchWorker)(action).then(() => key); 
    };



    initSync = (username:string)  => () : Promise<void> => { 
        let action : actionStartSync = {type:"startSync", load:username};

        return workerSendAction(pouchWorker)(action);
    };



    selectKey = ([retrieved,requested]) : string => {
                
        if(isNil(retrieved) && isNotNil(requested)){

            //application have been launched on other devices or local roaming data was removed
            return requested;

        }else if(isNotNil(retrieved) && isNil(requested)){

            //What could be the reason for this ?
            //Network error ? Key could not exist locally and not exist remotely.
            //use retrieved
            return retrieved;

        }else if(isNotNil(retrieved) && isNotNil(requested)){

            return retrieved;
        }

        //first launch on first device
        //generate key, submit to server, save locally   
        return null;
    };


    
    //save key locally and remotely if needed
    preserveKey = (requested:string,retrieved:string,email:string,password:string) => (key:string) : Promise<string> => {
        let username = emailToUsername(email); 
        let submitKey = (key:string) => axios({method:'post', url:`${server}/users/key`, data:{ username, password, key }});
        let load = [{type:'sync',load:true},{type:'email',load:email}]; 
        
        if(isNil(key)){

            let newKey = generateSecretKey();
            let encryptedKey = encryptKey(password)(newKey);
            this.props.dispatch({type:'multiple',load:[ {type:"secretKey", load:newKey}, ...load ]});
            return submitKey(encryptedKey).then(resp => newKey);

        }else if(isNil(requested) && !isNil(retrieved)){

            this.props.dispatch({type:'multiple', load:[{ type:"secretKey", load:key }, ...load]});
            let encryptedKey = encryptKey(password)(key);
            return submitKey(encryptedKey).then(resp => key);

        }else{

            this.props.dispatch({type:'multiple', load:[{ type:"secretKey", load:key }, ...load]});
            return new Promise(resolve => resolve(key));
        }
    };



    onAuth = ({email,password} : {email:string,password:string}) => response => {
        if(response.status!==200){ return }
        
        let retrieveKey = (props) : Promise<string> => new Promise(resolve => resolve(props.secretKey));
        let username = emailToUsername(email); 
        let expire = nDaysFromNow(1000);
        let token = getToken({username, password});

        session.defaultSession.cookies.set( 
            {url:server,name:'AuthToken',value:token,expirationDate:expire.getTime()}, 
            when(isNotNil,globalErrorHandler)
        ); 

       
        
        return Promise
        .all([retrieveKey(this.props),requestKey(token, password)])
        .then(
            //return key or null
            ifElse(
                switchAccount,
                ([retrieved,requested]) => {
                    //login with different account
                    this.props.dispatch({type:"eraseDataStore", load:undefined});

                    return this.eraseDatabase().then(
                        (error) => {
                            if(isNotNil(error)){ globalErrorHandler(error) }
                            return this.preserveKey(requested, retrieved, email, password)(requested);
                        }
                    )
                },
                ([retrieved,requested]) => {
                    let key = this.selectKey([retrieved,requested]);
                    return this.preserveKey(requested, retrieved, email, password)(key);
                }
            )
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