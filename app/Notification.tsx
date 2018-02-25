import './assets/fonts/index.css'; 
import './assets/notification.css'; 
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import { Component } from "react";  
import { ipcRenderer, remote } from 'electron'; 
import { 
    cond, assoc, isNil, not, defaultTo, map, isEmpty, 
    uniq, remove, contains, append, adjust, compose, 
    flatten, concat, prop, ifElse, last
} from 'ramda';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import Clear from 'material-ui/svg-icons/content/clear';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { wrapMuiThemeLight } from './utils/wrapMuiThemeLight';
import { chooseIcon } from './utils/chooseIcon';
import { globalErrorHandler } from './utils/globalErrorHandler';
const path = require("path");
import ReactAudioPlayer from 'react-audio-player';
import { isDev } from './utils/isDev';
import { Config, getConfig } from './utils/config';
injectTapEventPlugin();  

 
window.onerror = function (msg, url, lineNo, columnNo, error) {
    let string = msg.toLowerCase();
    var message = [ 
        'Message: ' + msg,
        'URL: ' + url,
        'Line: ' + lineNo,
        'Column: ' + columnNo,
        'Error object: ' + JSON.stringify(error)
    ].join(' - ');
    globalErrorHandler(message);
    if(isDev()){ return false } 
    return true;
};


ipcRenderer.once( 
    'loaded',      
    (event) => { 
        let app=document.createElement('div'); 
        app.style.width="100%"; 
        app.style.height="100%";
        app.id='application';      
        document.body.appendChild(app);    
        getConfig().then(
            (config:Config) => ReactDOM.render(   
                wrapMuiThemeLight(<Notification config={config}/>),
                document.getElementById('application')
            )     
        ) 
    }
);   


interface NotificationProps{
    config:any
}   

interface  NotificationState{
    todo:any
}    

class Notification extends Component<NotificationProps,NotificationState>{
    subscriptions:Subscription[];
    queue:NotificationState[];
    beep:any;
    disable:boolean;
    soundPath:string;
    timeout:any;


    constructor(props){
        super(props);  
        this.subscriptions=[]; 
        let {enableReminder} = this.props.config;
        this.disable = not(enableReminder);
        //console.log(`initial this.disable:${this.disable}`,this.props.config)
        let defaultState={ todo:null };
        this.timeout=null;
        this.state={...defaultState};   
        this.queue=[]; 
        this.soundPath=path.resolve(__dirname,"sound.wav"); 
    };


    updateState = (state) => new Promise(resolve => this.setState(state, () => resolve()));


    componentDidMount(){
        this.hide();

        this.subscriptions.push(
            Observable 
                .fromEvent(ipcRenderer, 'remind', (event,todo) => todo)
                .subscribe((todo) => {
                    if(isNil(todo) || isNil(todo.reminder)){ return } 

                    if(isEmpty(this.queue)){
                        this.queue.push({todo});
                        this.notify();
                    }else{ 
                        this.queue.push({todo});
                    }
                }),

            Observable
                .fromEvent(ipcRenderer,"config",(event,config) => config)
                .subscribe((config) => { 
                    let {enableReminder} = config;
                    this.disable = not(enableReminder);
                    const window = remote.getCurrentWindow();
                    if(this.disable){
                        window.hide(); 
                    }else{
                        window.show();  
                    }
                })     
        )
    };


    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = [];
    };


    getInitialPosition = () : {initialX:number,initialY:number} => {
        const window = remote.getCurrentWindow();
        const {width,height} = remote.screen.getPrimaryDisplay().workAreaSize;
        const size = window.getSize();
        const offset = 25; 
        const initialX = width-size[0]-offset;
        const initialY = height+size[1];
        return {initialX,initialY};
    };


    getFinalPosition = () : {finalX:number,finalY:number} => {
        const window = remote.getCurrentWindow();
        const {width,height} = remote.screen.getPrimaryDisplay().workAreaSize;
        const size = window.getSize();
        const offset = 25;
        const finalX = width-size[0]-offset;
        const finalY = height-size[1]-offset; 
        return {finalX,finalY};
    };


    notify = () => {  
        if(isEmpty(this.queue)){return}
        let next = this.queue[0];
        this.updateState(next)
        .then(() => { 
            if(this.beep){ 
                if(not(this.disable)){
                    this.beep.audioEl.play();
                } 
            }   
        }) 
        .then(() => this.open()) 
    };


    open = () => new Promise( 
        resolve => { 
            const window = remote.getCurrentWindow();
            let {initialX, initialY} = this.getInitialPosition();
            let {finalX, finalY} = this.getFinalPosition();

            let move = () => {
                let currentPosition = window.getPosition();
                let [x,y] = currentPosition;
                let delta = 20;

                if(y<=finalY){ 
                   window.setPosition(finalX, finalY);
                   resolve();
                }else{
                   window.setPosition(x, y-delta);
                   requestAnimationFrame(move);   
                }
            };

            window.setPosition(initialX, initialY);

            if(not(this.disable)){ window.show() };

            move();
        } 
    );
    
    
    hide = () => {
        const window = remote.getCurrentWindow();
        let {initialX, initialY} = this.getInitialPosition();
        window.setPosition(initialX, initialY);
        window.hide();
    };
     

    close = () => {
        let {todo} = this.state;
        this.hide();
        let mainWindow = remote.BrowserWindow.getAllWindows().find(w => w.id===1);
        if(mainWindow && todo){ 
           mainWindow.webContents.send('removeReminder', todo);
        } 
        this.queue.shift(); 
        this.notify(); 
    };

    
    openTodoInApp = (e) => { 
        let {todo} = this.state;
        if(todo){
            let mainWindow = remote.BrowserWindow.getAllWindows().find( w => w.id===1 );
            if(mainWindow){
               mainWindow.webContents.send('openTodo', todo);
               mainWindow.webContents.send('removeReminder', todo);
            }
            this.close();
        }
    };

      
    render(){  
        let {todo} = this.state;
        let title = isNil(todo) ? '' : todo.title;
        let reminder = isNil(todo) ? new Date() : todo.reminder;

        return <div style={{display:"flex",flexDirection:"column",width:"100%",height:"100%"}}>
            <ReactAudioPlayer
                ref={(e) => { this.beep = e; }}
                src={this.soundPath}
                autoPlay={false}
                controls={false}
            />
            <div style={{
                width:"100%",  
                position:"relative",
                height:"15%",
                backgroundColor:"rgba(81, 144, 247, 1)",
                display:"flex",
                alignItems:"center",
                textAlign:"center", 
                justifyContent:"flex-start" 
            }}> 
                <div style={{
                    paddingLeft:"5px",
                    display:"flex", 
                    alignItems:"center"
                }}>
                    {chooseIcon({width:"",height:""},"reminder")}
                </div>
                <div style={{
                    paddingLeft:"5px",
                    fontWeight:600,
                    fontSize:"16px",
                    display:"flex",
                    alignItems:"center",
                    color:"white"
                }}> 
                    Task Reminder
                </div>                
                <div style={{position:"absolute",right:5,cursor:"pointer",zIndex:200}}>   
                    <div    
                        style={{padding:"2px",alignItems:"center",cursor:"pointer",display:"flex"}} 
                        onClick={() => this.close()}
                    >
                        <Clear style={{color:"rgba(255,255,255,1)",height:25,width:25}}/>
                    </div>
                </div>
            </div> 
            <div style={{      
                padding:"10px",              
                display:"flex",
                overflowX:"hidden", 
                justifyContent:"space-around",
                height:"85%",
                position:"relative",
                alignItems:"flex-start", 
                flexDirection:"column"  
            }}>     
                <div style={{color:"rgba(100,100,100,0.8)"}}>
                    A task is due:
                </div>
                <div style={{
                    fontWeight:600,
                    fontSize:"17px",
                    display:"flex",
                    alignItems:"flex-start",
                    color:"black"
                }}>
                    {title}  
                </div>
                <div style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div  
                        onClick={this.openTodoInApp} 
                        style={{      
                            display:"flex",
                            alignItems:"center",
                            cursor:"pointer",
                            justifyContent:"center",
                            width:"90%",  
                            height:"20px", 
                            borderRadius:"5px", 
                            paddingLeft:"25px",
                            paddingRight:"25px",
                            paddingTop:"10px", 
                            paddingBottom:"10px", 
                            backgroundColor:"rgba(81, 144, 247, 1)"  
                        }}
                    >    
                        <div style={{color:"white",whiteSpace:"nowrap",fontSize:"16px"}}>  
                            Open Task 
                        </div>   
                    </div> 
                </div>
            </div> 
    </div>  
  } 
}

