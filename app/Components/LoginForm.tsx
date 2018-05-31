import Refresh from 'material-ui/svg-icons/navigation/refresh';
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { isNil, isEmpty, compose, path, toLower, cond, contains, defaultTo, ifElse, prop } from 'ramda';
import Cloud from 'material-ui/svg-icons/file/cloud-done';
import { action, actionStartSync, actionSetKey } from '../types';
import { getMonthName } from '../utils/utils';
import Toggle from 'material-ui/Toggle';
import { timeOfTheDay } from '../utils/time';
import { isToday, isNotNil } from '../utils/isSomething';
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



interface LoginFormProps{
    email:string,
    onAuth:(data:{email:string,password:string}) => (response:any) => Promise<void>
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



    setStateP = (state:any) : Promise<LoginFormState> => new Promise(
        resolve => this.setState(state, () => resolve(this.state))
    );



    setCredentialsError = ({email, password}) : void => {
        let emailValid = validateEmail(email);
        let passwordBrokenRules = validatePassword(password);
        let passwordValid = isEmpty(passwordBrokenRules);
        
        if(!emailValid){
            this.setState({error:`Email address has invalid format`});
        }else if(!passwordValid){
            this.setState({
                error:`Incorrect password` //getPasswordErrorMessage(passwordBrokenRules)
            });
        }
    };



    setAuthError = err => {
        let reason = path(["response","data","reason"], err);

        if(isNil(reason) && prop("message")(err)==="Network Error"){
           reason = "No internet connection"; 
        }

        this.setState({error:`${reason}`,spin:false}); 
    };



    credentialsAreValid = ({email, password}) : boolean => {
        let emailValid = validateEmail(email);
        let passwordBrokenRules = validatePassword(password);
        let passwordValid = isEmpty(passwordBrokenRules);
        return emailValid; //passwordValid && emailValid;
    };



    onSubmit = () => 
        this.setStateP({error:''})
        .then(
            ifElse(
                this.credentialsAreValid,
                this.submit,
                this.setCredentialsError
            )
        );
         


    submit = () => {
        let username = emailToUsername(this.state.email);
        let password = this.state.password;

        return this.setStateP({spin:true})
        .then(
            () => axios({ 
                method:'post', 
                url:`${host}/_session`, 
                data:{ name:username, password }, 
                headers: {'Authorization': 'Basic ' + getToken({username, password})}
            })  
        )
        .then(this.props.onAuth({email:this.state.email,password})) 
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
            </div>
            {
                isEmpty(this.state.error) ? null :    
                <div style={{fontSize:"14px", color:'red', marginTop:"5px", marginBottom:"5px"}}> 
                    {this.state.error}
                </div>
            }
            {
                this.state.spin ?
                <div
                    style={{
                        display:"flex",
                        justifyContent:"center",
                        height:"20px",
                        borderRadius:"5px",
                        padding:"5px",
                        backgroundColor:"rgba(200,200,200,0.1)"
                    }}
                >
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
                :
                <div     
                    onClick={this.onSubmit} 
                    style={{     
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        justifyContent: "space-evenly",
                        height: "20px",
                        borderRadius: "5px",
                        padding: "5px",
                        backgroundColor: "rgb(81, 144, 247)",
                        marginTop:"10px",
                        marginBottom: "10px"
                    }}   
                >   
                    <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px"}}>  
                        Connect with Tasklist Cloud
                    </div>    
                </div> 
            }
            <div style={{ display:"flex", flexDirection:"column" }}> 
                <div style={{
                    paddingTop:"5px",
                    color:"rgb(81, 144, 247)",
                    borderBottom:"1px solid rgb(81, 144, 247)",
                    display:"inline-table",
                    lineHeight:"1em",
                    fontSize:"14px",
                    cursor:"pointer"
                }}>
                    Forget Password ?
                </div>
                <div style={{
                    paddingTop:"5px",
                    color:"rgb(81, 144, 247)",
                    borderBottom:"1px solid rgb(81, 144, 247)",
                    display:"inline-table",
                    lineHeight:"1em",
                    fontSize:"14px",
                    cursor:"pointer"
                }}>
                    Register
                </div>
            </div>
        </div>
    }
};