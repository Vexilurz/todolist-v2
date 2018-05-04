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
import { isToday, isString, isDate } from '../../utils/isSomething';
import axios from 'axios';
import { emailToUsername } from '../../utils/emailToUsername';
import { host } from '../../utils/couchHost';
import { getCouchCookies } from '../../utils/getCouchCookies';
import { isCouchSessionExpired } from '../../utils/isCouchSessionExpired';
import { Connected } from '../Connected';
import { LoginForm } from '../LoginForm';
import { debounce } from 'lodash';
import { checkAuthenticated } from '../../utils/checkAuthenticated';
import { pouchWorker } from '../../app';


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
        checkAuthenticated()
        .then(
            auth => this.setAuthenticated( auth && isString(this.props.email) && isDate(this.props.lastSync) )
        )
    }

    

    toggleSync = debounce(
        () => {
            let shouldSync = !this.props.sync && isString(this.props.email);

            if(shouldSync && this.state.authenticated){

               pouchWorker.postMessage({type:"startSync", load:emailToUsername(this.props.email)});

            }else if(!shouldSync && this.state.authenticated){

               pouchWorker.postMessage({type:"stopSync", load:null}); 
            }

            this.props.dispatch({type:'sync', load:shouldSync});
        }, 
        250
    );



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
                    toggled={this.props.sync && this.state.authenticated}
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
                onToggle={this.props.toggleSync}
                disabled={this.props.disabled}
            />
        </div>  
    } 
};



