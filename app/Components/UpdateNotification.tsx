import '../assets/styles.css';  
import '../assets/calendarStyle.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { isNil, not } from 'ramda';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { ipcRenderer } from 'electron';
import { TopSnackbar } from './Snackbar';
import { downloadUpdates } from '../utils/utils';
import { globalErrorHandler } from '../utils/globalErrorHandler';
import { googleAnalytics } from '../analytics';
import { threeDaysLater } from '../utils/time';
 


interface UpdateNotificationProps {
    showUpdatesNotification:boolean, 
    progress:any, 
    dispatch:Function
} 
interface UpdateNotificationState{ 
    canRestart:boolean,
    downloading:boolean 
} 

export class UpdateNotification extends Component<UpdateNotificationProps,UpdateNotificationState>{
    downloading:boolean;
    
    constructor(props){
        super(props);
        this.state={
            canRestart:false,
            downloading:false
        };
    }; 



    onError = (error) => globalErrorHandler(error);

    

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
            this.setState({downloading:true});

            downloadUpdates() 
            .then(() => {  
              this.downloading=false; 
              this.setState({downloading:false});
            })
            .then(
                () => this.props.dispatch({ type:"nextUpdateCheck", load:threeDaysLater(new Date()) }) 
            )
            .then( 
                () => this.setState({canRestart:true}) 
            )
        }  
    };
    
    
  
    render(){ 
        let {showUpdatesNotification, progress, dispatch} = this.props;
        let {canRestart,downloading} = this.state;

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
            <div style={{
                cursor:"default", 
                display:"flex",
                alignItems:"center", 
                fontSize:"14px", 
                userSelect:"none",
                color:"rgba(100,100,100,1)",
                fontWeight:500
            }}>       
                { 
                    isNil(progress) ? "An update is available!" : 
                    not(canRestart) ? `Updating... ${Math.round(progress.percent)}%` :
                    "You updated to the last version. Please restart now." 
                }    
            </div>  
            {
                downloading ? null :
                <div style={{display:"flex",position:"absolute",right:0,alignItems:"center"}}>
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
                            { canRestart ? "Restart" : "Update now" } 
                        </div>   
                    </div> 
                </div> 
            }
          </div> 
          </TopSnackbar>
    }
}