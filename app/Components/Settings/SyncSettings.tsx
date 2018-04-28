import Refresh from 'material-ui/svg-icons/navigation/refresh';
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { isNil, isEmpty, compose, path } from 'ramda';
import Cloud from 'material-ui/svg-icons/file/cloud-done';
import { action } from '../../types';
import { getMonthName } from '../../utils/utils';
import Toggle from 'material-ui/Toggle';
import { timeOfTheDay } from '../../utils/time';
import { isToday } from '../../utils/isSomething';
import * as EmailValidator from 'email-validator';
import axios from 'axios';
import { isString } from 'util';
import { updateConfig } from '../../utils/config';
import { emailToUsername } from '../../utils/emailToUsername';
const ADLER32 = require('adler-32');  
 

//TODO Remove
axios.defaults.headers.common['AuthToken'] = 'YWRtaW46WnV6dW4xMjM=';

const passwordValidator = require('password-validator');
const proxy = 'https://tasklist-server.herokuapp.com';
const couch = 'https://couchdb-604ef9.smileupps.com';


let validateEmail = (email:string) : boolean => {
    let emailValid = EmailValidator.validate(email);
    return emailValid;
};

let validatePassword = (password:string) => {
    let schema = new passwordValidator();

    schema
    .is().min(8)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits()                                 // Must have digits
    .has().not().spaces()                           // Should not have spaces

    return schema.validate(password, { list: true });   
};



interface SyncSettingsProps{
    dispatch:(action:action) => void,
    authSession:string,
    userEmail:string,
    sync:boolean,
    lastSync:Date
} 

 
interface SyncSettingsState{
    error:string
}


export class SyncSettings extends Component<SyncSettingsProps,SyncSettingsState>{

    constructor(props){
        super(props);
        this.state = { error : '' };
    }



    toggleSync = () => this.props.dispatch({type:'sync', load:!this.props.sync});



    validateCredentials = ({email,password}) : boolean => {
        let emailValid = validateEmail(email);
        let passwordBrokenRules = validatePassword(password);
        let passwordValid = isEmpty(passwordBrokenRules);

        if(!emailValid){
            this.setState({error:`Email address has invalid format`}, () => console.log(this.state.error));
        }

        if(!passwordValid){
            this.setState({error:`${passwordBrokenRules.join()}`}, () => console.log(this.state.error));
        }

        return passwordValid && emailValid;
    };



    submitCredentials = ({email,password}) => {
        let valid = this.validateCredentials({email,password});
         
        if(valid){
            axios({
                method:'post',
                url:`${proxy}/users/login`,
                data:{ username:emailToUsername(email), password }
            })
            .then(
                response => {
                    if(response.status===200 && isString(response.data)){
                        updateConfig({authSession:response.data, userEmail:email})
                        .then(
                            (config) => { 
                                console.log(config);  
                                this.props.dispatch({
                                    type:"multiple",
                                    load:[{type:"userEmail",load:email},{type:"authSession",load:response.data}]
                                })
                            }
                        ) 
                    }
                }   
            ) 
            .catch(
                err => {
                    let reason = path(["response","data"], err);

                    if(reason==="unauthorized"){
                       this.setState({error:`Incorrect email or password`}, () => console.log(this.state.error));
                    }else{
                       this.setState({error:`Unexpected error occurred:${reason}`}, () => console.log(this.state.error)); 
                    }
                }
            );
        }
    };



    render(){
        return <div style={{
            display:"flex", 
            justifyContent:"center",
            alignItems:"center",
            width:"100%"
        }}>

            <div style={{
                display:"flex", 
                flexDirection:"column",
                alignItems:"center",
                justifyContent:"space-around",
                width:"50%",
                height:"90%" 
            }}>     
                <Cloud style={{color:"cornflowerblue",height:150,width:150}}/>
                <div style={{display:"flex",justifyContent:"center", alignItems:"center"}}>
                    <div style={{fontWeight:"bold", color:"rgba(100,100,100,1)"}}>Tasklist</div>
                    <div>Cloud</div>
                </div>
                <SyncSwitch  
                    toggleSync={this.toggleSync}
                    disabled={isNil(this.props.authSession)}
                    defaultToggled={this.props.sync}
                />
            </div>
            <div style={{width:"50%",height:"80%", display:"flex", alignItems:"center"}}> 
                { 
                    //isNil(this.props.authSession) ? 
                    <LoginForm 
                        error={this.state.error}  
                        submitCredentials={this.submitCredentials}
                    />  
                    /*: 
                    <SignedUp 
                        userEmail={this.props.userEmail}
                        sync={this.props.sync}
                        lastSync={this.props.lastSync}
                    /> */
                } 
            </div>
        </div>
    }
}


interface SyncSwitchProps{
    toggleSync:() => void,
    disabled:boolean,
    defaultToggled:boolean
}

interface SyncSwitchState{}


export class SyncSwitch extends Component<SyncSwitchProps,SyncSwitchState>{
    render(){
        return <div style={{zoom:1.8,marginRight:"8px"}}> 
            <Toggle 
                toggled={this.props.defaultToggled}
                disabled={this.props.disabled}
            />
        </div> 
    }
}



interface SignedUpProps{
    userEmail:string,
    sync:boolean,
    lastSync:Date
}

interface SignedUpState{}


export class SignedUp extends Component<SignedUpProps,SignedUpState>{

    constructor(props){
        super(props);
    }



    render(){ 
        if(isNil(this.props.lastSync) || isNil(this.props.userEmail)){ return }

        let month = getMonthName(this.props.lastSync);
        let day = this.props.lastSync.getDate();
        let lastUpdateMessage = isToday(this.props.lastSync) ? 
                                `Today at ${timeOfTheDay(this.props.lastSync)}` :
                                `${month} ${day} at ${timeOfTheDay(this.props.lastSync)}`;


        return <div style={{ 
            display:"flex", 
            flexDirection:"column",  
            justifyContent:"space-around", 
            height:"50%"
        }}> 
            <div style={{display:"flex"}}>
                <div style={{ 
                    fontSize:"16px",
                    fontWeight:500,
                    color:"rgba(100,100,100,1)",
                    cursor:"default"   
                }}>
                    Account:
                </div>
                <div style={{ 
                    fontSize:"15px",
                    fontWeight:"bold",
                    color:"rgba(10,10,10,1)",
                    cursor:"default",
                    marginLeft:"40px"   
                }}>
                    {this.props.userEmail}
                </div>
            </div>
            <div style={{display:"flex"}}>
                <div style={{ 
                    fontSize:"16px",
                    fontWeight:500,
                    color:"rgba(100,100,100,1)",
                    cursor:"default"
                }}>
                    Status:
                </div>
                <div style={{ 
                    fontSize:"15px",
                    fontWeight:"bold",
                    color:"rgba(10,10,10,1)",
                    cursor:"default",
                    marginLeft:"55px"      
                }}>
                    {`Your account is active`}
                </div>
            </div>
            <div style={{display:"flex"}}>
                <div style={{ 
                    fontSize:"16px",
                    fontWeight:500,
                    color:"rgba(100,100,100,1)",
                    cursor:"default"
                }}>
                    Last update:
                </div>
                <div style={{ 
                    fontSize:"15px",
                    fontWeight:"bold",
                    color:"rgba(10,10,10,1)",
                    cursor:"default",
                    marginLeft:"12px" //"15px"       
                }}>
                    {lastUpdateMessage}
                </div>
            </div>
        </div>
    }
} 



interface LoginFormProps{
    error:string,
    submitCredentials:(data:{email:string,password:string}) => void
}

interface LoginFormState{
    email:string,
    password:string
}

export class LoginForm extends Component<LoginFormProps,LoginFormState>{

    constructor(props){
        super(props);
        this.state = {email:'', password:''}
    } 

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
            <div> 
                <input  
                    type="email"      
                    value={this.state.email}
                    placeholder="Email" 
                    style={{
                        backgroundColor:"white",
                        color:"rgba(100, 100, 100, 0.9)",   
                        outline:"none", 
                        textAlign:"center",
                        alignItems:"center",
                        display:"flex",
                        justifyContent:"center",
                        height:"30px",
                        width:"100%",  
                        borderRadius:"4px",  
                        border:"1px solid rgba(100,100,100,0.3)"
                    }}
                    onChange={(e) => this.setState({email:e.target.value})}
                /> 
            </div>
            <div>
                <input 
                    type="password"     
                    value={this.state.password}
                    placeholder="Password" 
                    style={{
                        backgroundColor:"white",
                        color:"rgba(100, 100, 100, 0.9)",   
                        outline:"none", 
                        textAlign:"center",
                        alignItems:"center",
                        display:"flex",
                        justifyContent:"center",
                        height:"30px",
                        width:"100%",  
                        borderRadius:"4px",  
                        border:"1px solid rgba(100,100,100,0.3)"
                    }}
                    onChange={(e) => this.setState({password:e.target.value})}
                />  
            </div>
            </div>
            {
                isEmpty(this.props.error) ? null :    
                <div style={{fontSize:"14px", color:'red', marginTop:"5px", marginBottom:"5px"}}> 
                    {this.props.error}
                </div>
            }
            <div     
                onClick={() => this.props.submitCredentials({email:this.state.email, password:this.state.password})} 
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
}