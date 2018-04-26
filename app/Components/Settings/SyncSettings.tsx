import Refresh from 'material-ui/svg-icons/navigation/refresh';
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { isNil } from 'ramda';
import Cloud from 'material-ui/svg-icons/file/cloud-done';
import { action, AuthenticatedUser } from '../../types';
import { getMonthName } from '../../utils/utils';
import Toggle from 'material-ui/Toggle';
import { timeOfTheDay } from '../../utils/time';
import { isToday } from '../../utils/isSomething';


interface SyncSettingsProps{
    dispatch:(action:action) => void,
    authenticatedUser:AuthenticatedUser
    sync:boolean,
    lastSync:Date
} 

 
interface SyncSettingsState{}


export class SyncSettings extends Component<SyncSettingsProps,SyncSettingsState>{

    constructor(props){
        super(props);
    }

    toggleSync = () => this.props.dispatch({type:'sync', load:!this.props.sync});

    validateCredentials = () => {}

    submitCredentials = () => {}

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
                    disabled={isNil(this.props.authenticatedUser)}
                    defaultToggled={this.props.sync}
                />
            </div>
            <div style={{width:"50%",height:"80%", display:"flex", alignItems:"center"}}> 
                { 
                    isNil(this.props.authenticatedUser) ? 
                    <LoginForm 
                    
                    /> 
                    : 
                    <SignedUp 
                        authenticatedUser={this.props.authenticatedUser}
                        sync={this.props.sync}
                        lastSync={this.props.lastSync}
                    /> 
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
    authenticatedUser:any,
    sync:boolean,
    lastSync:Date
}

interface SignedUpState{}


export class SignedUp extends Component<SignedUpProps,SignedUpState>{

    constructor(props){
        super(props);
    }



    render(){ 
        if(isNil(this.props.lastSync) || isNil(this.props.authenticatedUser)){ return }

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
                    {this.props.authenticatedUser.email}
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
                    marginLeft:"15px"       
                }}>
                    {lastUpdateMessage}
                </div>
            </div>
        </div>
    }
} 



interface LoginFormProps{}

interface LoginFormState{}

//validation??
export class LoginForm extends Component<LoginFormProps,LoginFormState>{

    constructor(props){
        super(props);
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
                    value={''}
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
                    onChange={(e) => e.target.value}
                /> 
            </div>
            <div>
                <input 
                    type="password"     
                    value={''}
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
                    onChange={(e) => e.target.value}
                />  
            </div>
            </div>

            <div     
                onClick={() => {}} 
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