import '../assets/styles.css';  
import '../assets/calendarStyle.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import Popover from 'material-ui/Popover';
import { Transition } from 'react-transition-group';
import Restore from 'material-ui/svg-icons/navigation/refresh'; 
import { uniq, compose, contains, allPass, isNil, not, isEmpty } from 'ramda';
import { isString } from 'util';
import { 
    insideTargetArea, attachDispatchToProps, threeDaysLater, 
    setToJsonStorage, debounce, downloadUpdates 
} from '../utils';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { Store, googleAnalytics, globalErrorHandler } from '../app';
import { ipcRenderer, remote } from 'electron';
import { TopSnackbar } from './Snackbar';

 


interface UpdateNotificationProps extends Store{}
interface UpdateNotificationState{ 
    canRestart:boolean
} 

@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)
export class UpdateNotification extends Component<UpdateNotificationProps,UpdateNotificationState>{

    downloading:boolean;
    
    constructor(props){
        super(props);
        this.state={
            canRestart:false
        };
    }; 

    onError = (error) => globalErrorHandler(error)
    
    onClick = () => {
        let {dispatch} = this.props;
        let {canRestart} = this.state;

        if(this.downloading){ return }

        if(canRestart){
            let timeSeconds = Math.round( new Date().getTime() / 1000 );
            dispatch({type:"showUpdatesNotification", load:false});
            
            googleAnalytics.send(   
                'event',   
                { 
                   ec:'Updates', 
                   ea:`Updates downloaded ${new Date().toString()}`, 
                   el:'Updates downloaded', 
                   ev:timeSeconds 
                } 
            )  
            .then(() => ipcRenderer.send("quitAndInstall")); 
  
        }else{
            this.downloading = true;

            downloadUpdates() 
            .then(() => { this.downloading = false; })
            .then(() => setToJsonStorage("lastUpdatesCheck", {lastUpdatesCheck:new Date()}, this.onError)) 
            .then(() => this.setState({canRestart:true}))
        } 
    }
  
    render(){ 
        let {showUpdatesNotification, progress, dispatch} = this.props;
        let {canRestart} = this.state;

        return <TopSnackbar open={showUpdatesNotification}>
        <div style={{
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            width:"100%",
            height:"50px",  
            position:"relative", 
            overflow:"hidden"
        }}>
            <div 
                style={{
                    cursor:"default", 
                    display:"flex",
                    alignItems:"center", 
                    fontSize:"14px", 
                    userSelect:"none",
                    color:"rgba(100,100,100,1)",
                    fontWeight:500
                }}            
            >       
                { 
                    isNil(progress) ? "An update is available!" : 
                    not(canRestart) ? `Updating... ${Math.round(progress.percent)}% left` :
                    "You updated to the last version. Please restart now." 
                }
            </div>   
            <div style={{  
                display:"flex",
                position:"absolute",
                right:0,
                alignItems:"center"
            }}>
                <div     
                    onClick={this.onClick}
                    style={{      
                        display:"flex",
                        marginLeft:"15px", 
                        marginRight:"15px",
                        alignItems:"center",
                        cursor:"pointer",
                        justifyContent:"center",
                        height:"20px",
                        paddingLeft:"25px",
                        paddingRight:"25px",
                        paddingTop:"5px", 
                        paddingBottom:"5px",
                        backgroundColor:"rgba(81, 144, 247, 1)"  
                    }}    
                >   
                    <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px"}}>  
                        {
                            canRestart ? "Restart" : "Update now"  
                        } 
                    </div>   
                </div> 
            </div> 
          </div> 
          </TopSnackbar>
    }
}