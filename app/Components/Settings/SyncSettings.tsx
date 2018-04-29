import Refresh from 'material-ui/svg-icons/navigation/refresh';
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { isNil, isEmpty, compose, path, toLower, cond, contains } from 'ramda';
import Cloud from 'material-ui/svg-icons/file/cloud-done';
import { action } from '../../types';
import { getMonthName } from '../../utils/utils';
import Toggle from 'material-ui/Toggle';
import { timeOfTheDay } from '../../utils/time';
import { isToday } from '../../utils/isSomething';
import axios from 'axios';
import { updateConfig } from '../../utils/config';
import { emailToUsername } from '../../utils/emailToUsername';
import { host } from '../../utils/couchHost';
import { getCouchCookies } from '../../utils/getCouchCookies';
import { isCouchSessionExpired } from '../../utils/isCouchSessionExpired';
import { Connected } from '../Connected';
import { LoginForm } from '../LoginForm';
import { debounce } from 'lodash';



interface SyncSettingsProps{
    dispatch:(action:action) => void,
    email:string,
    sync:boolean,
    lastSync:Date
} 


 
interface SyncSettingsState{
    authenticated:boolean
}



export class SyncSettings extends Component<any,SyncSettingsState>{

    constructor(props){
        super(props);
        this.state = { authenticated:false };
    }



    componentDidMount(){
        this.checkAuthenticated().then(this.setAuthenticated)
    }



    checkAuthenticated = () : Promise<boolean> => getCouchCookies(host).then( list => !isCouchSessionExpired(list) )



    toggleSync = debounce(() => this.props.dispatch({type:'sync', load:!this.props.sync}), 150);



    setAuthenticated = (value:boolean) => this.setState({authenticated:value}); 



    render(){
        return <div style={{display:"flex", justifyContent:"center", alignItems:"center", width:"100%"}}>
            <div style={{
                display:"flex", 
                flexDirection:"column",
                alignItems:"center",
                justifyContent:"space-around",
                width:"50%",
                height:"90%" 
            }}>     
                <Cloud style={{color:"cornflowerblue", height:150, width:150}}/>

                <div style={{display:"flex",justifyContent:"center", alignItems:"center"}}>
                    <div style={{fontWeight:"bold", color:"rgba(100,100,100,1)"}}>Tasklist</div>
                    <div>Cloud</div>
                </div>

                <SyncSwitch  
                    toggleSync={this.toggleSync}
                    disabled={!this.state.authenticated}
                    toggled={this.props.sync}
                />
            </div>
            <div style={{width:"50%",height:"80%", display:"flex", alignItems:"center"}}> 
                { 
                    this.state.authenticated ?
                    <Connected
                        setAuthenticated={this.setAuthenticated}
                        dispatch={this.props.dispatch}
                        email={this.props.email}
                        sync={this.props.sync}
                        lastSync={this.props.lastSync}
                    />
                    :
                    <LoginForm 
                        setAuthenticated={this.setAuthenticated}
                        dispatch={this.props.dispatch}
                        email={this.props.email}
                    />  
                } 
            </div>
        </div>
    }
}


interface SyncSwitchProps{
    toggleSync:() => void,
    disabled:boolean,
    toggled:boolean
}

interface SyncSwitchState{}

export class SyncSwitch extends Component<SyncSwitchProps,SyncSwitchState>{
    render(){
        return <div style={{zoom:1.8,marginRight:"8px"}}> 
            <Toggle 
                toggled={this.props.toggled}
                disabled={this.props.disabled}
            />
        </div> 
    } 
};



