import '../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import RefreshIndicator from 'material-ui/RefreshIndicator';
import { Subscription } from 'rxjs';
import { subscribeToChannel } from '../utils/subscribeToChannel';


interface SpinnerProps{
    
}

interface SpinnerState{
    active:boolean
}

export class Spinner extends Component<SpinnerProps,SpinnerState>{
    subscriptions:Subscription[]; 
    
    constructor(props){
        super(props); 
        this.state = { active : false };
        this.subscriptions = [];
    }
    
    componentDidMount(){
        this.subscriptions.push(
            subscribeToChannel( "active", () => this.setState({active:true}) ),
            subscribeToChannel( "paused", () => this.setState({active:false}) )
        )
    };

    componentWillUnmount(){ 
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = [];
    };  
  
    render(){ 
        return this.state.active ?
        <RefreshIndicator
            size={30}
            left={0}
            top={0}
            status="loading"
            style={{display:'inline-block', position:'relative'}}
        />
        :
        <RefreshIndicator
            size={30}
            left={0}
            top={0}
            color={"rgb(51, 151, 151)"}
            percentage={80}
            status={"ready"}
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