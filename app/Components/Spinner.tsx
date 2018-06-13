import '../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import RefreshIndicator from 'material-ui/RefreshIndicator';
import { Subscription } from 'rxjs';
import { subscribeToChannel } from '../utils/subscribeToChannel';
import IconButton from 'material-ui/IconButton'; 
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import { checkAuthenticated } from '../utils/checkAuthenticated';



interface SpinnerProps{
    sync:boolean,
    dispatch:Function,
    openSyncSettings:(e:any) => void
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
   


    onRefresh = (e) => {
        checkAuthenticated() 
        .then(
            auth => {
                if(auth && this.props.sync){
                    this.setState(
                        {active:true},  
                        () => setTimeout(
                            () => this.setState({active:false}, () => this.props.dispatch({ type:"lastSync", load:new Date() })), 
                            1000
                        )
                    );
                }else{
                    this.props.openSyncSettings(e);
                }
            }
        )
    }
    
    

    render(){ 
        return this.state.active ?
        <RefreshIndicator 
            size={25}
            left={0}
            top={0}
            status="loading"
            style={{display:'inline-block', position:'relative'}}
        />
        : 
        <IconButton    
            onClick = {this.onRefresh}  
            iconStyle={{   
                color:"rgba(100, 100, 100, 1)",
                width:"25px", 
                height:"25px"   
            }}
            style={{width:"auto", height:"auto", padding:"0px"}}
        >        
            <Refresh style={{color:"rgba(10,10,10,0.8)", height:20, width:20}}/>
        </IconButton>  
    }
};
