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
import RefreshIndicator from 'material-ui/RefreshIndicator';

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
    spin:boolean,
    error:string
}



export class LoginForm extends Component<LoginFormProps,LoginFormState>{

    constructor(props){
        super(props);

        this.state = {
            email:defaultTo('')(this.props.email), 
            password:'', 
            spin:false,
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
        this.setState({error:`${reason}`,spin:false}); 
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

        let load = [
            { type:'sync', load:true },  
            { type:'email', load:this.state.email },
            { type:'salt', load:username }
        ]; 

        this.props.dispatch({type:'multiple', load});

        let actionStartSync : actionStartSync = { type:"startSync", load:username };

        return workerSendAction(pouchWorker)(actionStartSync)
        .then(
            () => this.props.setAuthenticated(true)
        )
    };      



    submit = ({email,password}) => {
        let username = emailToUsername(email);

        return this.setStateP({spin:true})
        .then(
            () => axios({ 
                method:'post', 
                url:`${host}/_session`, 
                data:{ name:username, password }, 
                headers: {'Authorization': 'Basic ' + getToken({username, password})}
            })  
        )
        .then(this.onAuth) 
        .catch(this.setAuthError);
    };     



    render(){
        return <div style={{
            display:"flex",
            flexDirection:"column",
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
            <div style={{ display:"flex", flexDirection:"column" }}> 
                <a href={'#'} style={{paddingTop:"3px", paddingBottom:"3px"}}>Forget Password ?</a>
                <a href={'#'} style={{paddingTop:"3px", paddingBottom:"3px"}}>Register</a>
            </div>
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
                    justifyContent:"flex-start",
                    height:"20px",
                    borderRadius:"5px",
                    padding:"5px",
                    backgroundColor:"rgb(81, 144, 247)"
                }}   
            >   
                {
                    <div style={{visibility:this.state.spin ? "visible" : "hidden"}}>
                        <RefreshIndicator 
                            size={25}
                            left={0}
                            top={0}
                            status="loading"
                            style={{
                                display:'inline-block', 
                                position:'relative',
                                boxShadow:'none',
                                backgroundColor:'rgba(255,255,255,0)'
                            }}
                        />
                    </div>
                }
                <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px", paddingLeft:"10px"}}>  
                    Connect with Tasklist Cloud
                </div>    
            </div>   
        </div>
    }
};