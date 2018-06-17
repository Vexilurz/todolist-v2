import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { stopPropagation } from '../utils/stopPropagation';


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
                    textAlign:"left",
                    paddingLeft:"10px",
                    alignItems:"center",
                    display:"flex",
                    justifyContent:"center",
                    height:"30px",
                    width:"95%",  
                    borderRadius:"4px",  
                    border:"1px solid rgba(100,100,100,0.3)"
                }}
                onKeyDown={stopPropagation}
                onChange={this.props.onChange as any}
            /> 
        </div>
    };
};
