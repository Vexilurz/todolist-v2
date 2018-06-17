import '../assets/styles.css';  
import '../assets/calendarStyle.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 

interface TopSnackbarProps{
    open:boolean
}  
interface TopSnackbarState{}  
export class TopSnackbar extends Component<TopSnackbarProps,TopSnackbarState>{

    constructor(props){ 
        super(props);
    }    

    render(){ 
        return <div style={{ 
            width:"100%",
            position:"fixed",
            zIndex:4000000,
            borderBottom:"1px solid rgba(120,120,120,0.2)",
            left:0,   
            top:0, 
            overflow:"hidden",
            transition:"max-height 0.5s ease-in-out",
            maxHeight:this.props.open ? "50px" : "0px", 
            justifyContent:"center", 
            alignItems:"center",  
            backgroundColor:"#FFF9C4",
            display:"flex"
        }}> 
            {this.props.children}
        </div>
    } 
} 

