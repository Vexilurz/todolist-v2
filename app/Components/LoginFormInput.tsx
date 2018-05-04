import Refresh from 'material-ui/svg-icons/navigation/refresh';
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { isNil, isEmpty, compose, path, toLower, cond, contains } from 'ramda';
import Cloud from 'material-ui/svg-icons/file/cloud-done';
import { action } from '../types';
import { getMonthName } from '../utils/utils';
import Toggle from 'material-ui/Toggle';
import { timeOfTheDay } from '../utils/time';
import { isToday } from '../utils/isSomething';
import axios from 'axios';
import { host } from '../utils/couchHost';



interface LoginFormInputProps{
    type:string,
    value:string,
    placeholder:string,
    onChange:Function
} 

interface LoginFormInputState{}

export class LoginFormInput extends Component<LoginFormInputProps,LoginFormInputState>{

    render(){
        return <div> 
            <input  
                type={this.props.type}      
                value={this.props.value}
                placeholder={this.props.placeholder} 
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
                onChange={this.props.onChange as any}
            /> 
        </div>
    };
};
