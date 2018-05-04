import '../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 



export class Spinner extends Component<{},{}>{
    constructor(props){
        super(props); 
    }

    shouldComponentUpdate(nextProps){
        return true;
    }
 
    render(){ 
        return <div 
        className={'spinner'}
        style={{    
            content: '',
            boxSizing: "border-box",
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "20px",
            height:"20px",
            marginTop: "-10px",
            marginLeft: "-10px",
            borderRadius: "50%",
            border: "2px solid #ccc",
            borderTopColor: "#333",
            animation: "spinner .6s linear infinite"
        }}>  
        
        </div> 
    }
};


