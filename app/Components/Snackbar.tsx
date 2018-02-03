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
import { insideTargetArea, attachDispatchToProps, threeDaysLater, setToJsonStorage, debounce } from '../utils';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { Store } from '../app';
import { ipcRenderer, remote } from 'electron';
import { downloadUpdates } from './MainContainer';

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





interface UpdateNotificationProps extends Store{}
interface UpdateNotificationState{ 
    canRestart:boolean,
    downloading:boolean  
} 

@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)
export class UpdateNotification extends Component<UpdateNotificationProps,UpdateNotificationState>{

    constructor(props){
        super(props);
        this.state={
            canRestart:false,
            downloading:false 
        };
    } 

 
    onClick = () => {
        let {dispatch} = this.props;
        let {canRestart} = this.state;

        if(canRestart){
            dispatch({type:"showUpdatesNotification", load:false});
            ipcRenderer.send("installUpdates");
        }else{
            this.setState({ downloading:true },  
            () => 
                downloadUpdates()
                .then( 
                    () => this.setState(
                        {downloading:false}, 
                        () => setToJsonStorage("lastUpdatesCheck", {lastUpdatesCheck:new Date()}
                    )
                ) 
                .then(
                    () => this.setState({canRestart:true})
                )
             
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
                    isNil(progress) ? 
                    "An update is available!" : 
                    not(canRestart) ?
                    `Updating... ${Math.round(progress.percent)}% left` :
                    "You updated to the last version. Please restart now." 
                }
            </div>   
            <div style={{  
                display:"flex",
                position:"absolute",
                right:0,
                alignItems:"center"
            }}>
            {   
                not(isNil(progress)) && not(canRestart) ? null :
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
                            canRestart ?
                            "Restart" :
                            "Install"  
                        } 
                    </div>   
                </div> 
            }
            </div> 
          </div> 
          </TopSnackbar>
    }
}