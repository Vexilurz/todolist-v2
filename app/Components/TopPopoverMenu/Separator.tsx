import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { Component } from "react";

export class Separator extends Component<{},{}>{
    render(){ 
        return <div style={{
            outline:"none",
            position:"relative",
            width:"100%",
            height:"2px",
            marginBottom:"2px",
            borderBottom:"1px solid rgba(220,220,220,1)"
        }}></div>
    } 
}
