import '../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import RefreshIndicator from 'material-ui/RefreshIndicator';


export class Spinner extends Component<{},{}>{
    constructor(props){
        super(props); 
    }

    shouldComponentUpdate(nextProps){
        return true;
    }
 
    render(){ 
        return <RefreshIndicator
            size={30}
            left={0}
            top={0}
            color={"rgb(51, 151, 151)"}
            percentage={80}
            status="ready"
            style={{
              display:'inline-block', 
              position:'relative',
              boxShadow:"none",
              backgroundColor:'rgb(248, 248, 248)'
            }}
        />
    }
};


/*
    <div 
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
            borderTopColor: "rgb(51, 151, 151)",
            animation: "spinner .6s linear infinite"
        }}
    >  
    </div> 
*/