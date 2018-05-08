import Refresh from 'material-ui/svg-icons/navigation/refresh';
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { isNil, isEmpty, compose, path, toLower, cond, contains, defaultTo, ifElse } from 'ramda';
import Cloud from 'material-ui/svg-icons/file/cloud-done';
import { action, actionStartSync, actionSetKey } from '../types';
import { getMonthName } from '../utils/utils';
import Toggle from 'material-ui/Toggle';
import { timeOfTheDay } from '../utils/time';
import { isToday } from '../utils/isSomething';
import axios from 'axios';
import { emailToUsername } from '../utils/emailToUsername';
import { host } from '../utils/couchHost';
import { validateEmail } from '../utils/validateEmail';
import { validatePassword, getPasswordErrorMessage } from '../utils/validatePassword';
import { LoginFormInput  } from './LoginFormInput';
import { getToken } from '../utils/getToken';
import { workerSendAction } from '../utils/workerSendAction';
import { pouchWorker } from '../app';
import { isDev } from '../utils/isDev';
const uniqid = require('uniqid');
let CryptoJS = require("crypto-js");



interface LoginFormProps{
    dispatch:(action:action) => void,
    setAuthenticated:Function,
    secretKey:string,
    email:string
}



interface LoginFormState{
    email:string,
    password:string,
    error:string
}



export class LoginForm extends Component<LoginFormProps,LoginFormState>{

    constructor(props){
        super(props);

        this.state = {
            email:defaultTo('')(this.props.email), 
            password:'', 
            error:''
        };
    } 



    setStateP = (state:any) : Promise<LoginFormState> => 
        new Promise(
            resolve => this.setState(state, () => resolve(this.state))
        );



    clearError = () => this.setStateP({error:''});



    setCredentialsError = ({email, password}) : void => {
        let emailValid = validateEmail(email);
        let passwordBrokenRules = validatePassword(password);
        let passwordValid = isEmpty(passwordBrokenRules);
        
        if(!emailValid){
            this.setState({error:`Email address has invalid format`});
        }else if(!passwordValid){
            this.setState({
                error:getPasswordErrorMessage(passwordBrokenRules)
            });
        }
    };



    setAuthError = err => {
        let reason = path(["response","data","reason"], err);
        this.setState({error:`${reason}`}); 
    };



    credentialsAreValid = ({email, password}) : boolean => {
        let emailValid = validateEmail(email);
        let passwordBrokenRules = validatePassword(password);
        let passwordValid = isEmpty(passwordBrokenRules);
        return passwordValid && emailValid;
    };



    onSubmit = () => 
        this.clearError()
        .then(
            ifElse(
                this.credentialsAreValid,
                this.submit,
                this.setCredentialsError
            )
        );
        


    onAuth = response => {
        if(response.status!==200){ return }

        let username = emailToUsername(this.state.email);
        let password = this.state.password;
        let key = this.props.secretKey;

        let load = [
            { type:'sync', load:true },  
            { type:'email', load:this.state.email },
            { type:'salt', load:username }
        ]; 

        //login for the first time
        if(isNil(key) || isDev()){
            let opt = { keySize: 512/32, iterations: 10 };
            key = CryptoJS.PBKDF2(uniqid(), uniqid(), opt).toString();
            load.push({ type:'secretKey', load:key });
        }

        this.props.dispatch({type:'multiple', load});

        let actionSetKey : actionSetKey = { type:"setKey", load:key };
        let actionStartSync : actionStartSync = { type:"startSync", load:username };

        workerSendAction(pouchWorker)(actionSetKey)
        .then(
            () => workerSendAction(pouchWorker)(actionStartSync)
        )
        .then(
            () => this.props.setAuthenticated(true)
        )
    };      



    submit = ({email,password}) => {
        let username = emailToUsername(email);

        return axios({ 
            method:'post', 
            url:`${host}/_session`, 
            data:{ name:username, password }, 
            headers: {'Authorization': 'Basic ' + getToken({username, password})}
        })  
        .then(this.onAuth) 
        .catch(this.setAuthError);
    };     



    render(){
        return <div style={{
            display:"flex",
            flexDirection:"column",
            height:"50%",
            width:"90%",
            justifyContent:"space-between"
        }}>
            <div style={{
                height:"60%",
                display:"flex",
                flexDirection:"column",
                justifyContent:"space-around"
            }}>
            <LoginFormInput 
                 type="email"
                 value={this.state.email}
                 placeholder="Email" 
                 onChange={(e) => this.setState({email:e.target.value})}
            />
            <LoginFormInput 
                 type="password"   
                 value={this.state.password}
                 placeholder="Password" 
                 onChange={(e) => this.setState({password:e.target.value})}
            />
            </div>
            {
                isEmpty(this.state.error) ? null :    
                <div style={{fontSize:"14px", color:'red', marginTop:"5px", marginBottom:"5px"}}> 
                    {this.state.error}
                </div>
            }
            <div     
                onClick={this.onSubmit} 
                style={{     
                    display:"flex",
                    alignItems:"center", 
                    cursor:"pointer",
                    justifyContent:"center", 
                    height:"20px",
                    borderRadius:"5px", 
                    paddingLeft:"25px",
                    paddingRight:"25px",
                    paddingTop:"5px", 
                    paddingBottom:"5px", 
                    backgroundColor:"rgba(81, 144, 247, 1)"  
                }}   
            >   
                <div style={{color:"white",whiteSpace:"nowrap",fontSize:"16px"}}>  
                    Connect with Tasklist Cloud
                </div>    
            </div>   
        </div>
    }
};