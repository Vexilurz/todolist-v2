import './assets/fonts/index.css'; 
import './assets/notification.css'; 
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import { Component } from "react";  
import { ipcRenderer } from 'electron'; 
import { 
    cond, assoc, isNil, not, defaultTo, map, isEmpty, 
    uniq, remove, contains, append, adjust, compose, 
    flatten, concat, prop, ifElse, last, path, uniqBy,
    identity
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
const pathToFile = require("path");
import ReactAudioPlayer from 'react-audio-player';
import { isDev } from './utils/isDev';
import { isArray } from './utils/isSomething';
import { getConfig } from './utils/config';
import { requestFromMain } from './utils/requestFromMain';
const Promise = require('bluebird'); 
injectTapEventPlugin();  
 

window.onerror = (msg, url, lineNo, columnNo, error) => {
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
    (event, id:number) => { 
        let app=document.createElement('div'); 
        app.style.width="100%"; 
        app.style.height="100%";
        app.id='application';      
        document.body.appendChild(app);  
        getConfig()
        .then(
            (config) => ReactDOM.render(   
                wrapMuiThemeLight(<Notification config={config}/>),
                document.getElementById('application')
            )   
        ); 
    }
);   


let oneElement = (list:any[]) : boolean => {
    if(isArray(list)){ return list.length===1; }
    return false;
};


let manyElements = (list:any[]) : boolean => {
    if(isArray(list)){ return list.length>1; }
    return false;
};


interface NotificationProps{config:any}   
interface NotificationState{todos:any[]}
class Notification extends Component<NotificationProps,NotificationState>{
    soundPath:string;
    subscriptions:Subscription[];
    beep:any;
    disable:boolean;
    open:boolean;
    
    constructor(props){
        super(props);  
        this.subscriptions = []; 
        this.state = { todos:[] };
        let {disableReminder} = this.props.config;
        this.disable = disableReminder;
        this.open = false;
        this.soundPath = pathToFile.resolve(__dirname,"sound.wav"); 
    };


    move = () : Promise<void> => requestFromMain<any>(
        'Nmove',
        [],
        (event) => event
    ); 


    hide = () : Promise<void> => requestFromMain<any>(
        'Nhide',
        [],
        (event) => event
    );


    removeReminders = (todos) : Promise<void> => requestFromMain<any>(
        'NremoveReminders',
        [todos],
        (event) => event
    ); 


    openTodoInApp = (todo:any) : Promise<void> => requestFromMain<any>(
        'openTodoInApp',
        [todo],
        (event) => event
    ); 



    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = [];
    };
   


    componentDidMount(){
        this.hide();

        let onConfig = (config) => { 
            let {disableReminder} = config;
            this.disable = disableReminder;
            if(this.disable){
               this.suspend(); 
            }
        };

        let shouldNotify = () => Observable.of(this.open || this.disable).skipWhile(val => val);

        this.subscriptions.push(
            Observable
                .fromEvent(ipcRenderer,"config",(event,config) => config)
                .subscribe((config) => onConfig(config)),  

            Observable 
                .fromEvent(ipcRenderer,"remind",(event,todo) => todo)
                .buffer(Observable.interval(5000).switchMap(shouldNotify))
                .subscribe(
                    ifElse(
                        isEmpty,
                        identity,
                        compose( 
                            (todos:any[]) => this.setState({todos},this.notify),
                            uniqBy(prop('_id'))
                        )   
                    ) 
                )
        );
    };



    notify = () => new Promise(resolve => { 
        this.open = true;
        if(this.beep){ 
           this.beep.audioEl.play();
        }   
        this.move();
    });
    


    suspend = () => {
        let {todos} = this.state;
        this.open = false; 
        this.removeReminders(todos)
        .then(
            () => this.setState({ todos:[] }, this.hide)
        ); 
    };
 


    render(){  
        let {todos} = this.state;

        if(isEmpty(todos)){ return null }

        let fontStyle = {
            fontWeight:600,
            fontSize:"17px",
            display:"flex",
            alignItems:"flex-start",
            color:"black",
            position:"relative"
        };
        let title = <div></div>;
        let header = '';
        let button = '';
        let reminder = new Date();


        if(oneElement(todos)){
           let todo = todos[0];
           reminder = isNil(todo) ? new Date() : todo.reminder;
           header = 'A task is due:';
           button = 'Open Task';
           title = <div style={fontStyle as any}>{todos[0].title}</div>;
        }else if(manyElements(todos)){
           reminder = new Date();
           header = `${todos.length} tasks due:`;
           button = 'Open';
           title = <div>{todos.map((t,i) => <div style={fontStyle as any}>{`${i+1}. ${t.title}`}</div>)}</div>;
        }


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
                height:"25%",
                backgroundColor:"rgba(81, 144, 247, 1)",
                display:"flex",
                alignItems:"center",
                textAlign:"center", 
                justifyContent:"flex-start" 
            }}> 
                <div style={{paddingLeft:"5px",display:"flex",alignItems:"center"}}>
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
                        onClick={this.suspend}
                    >
                        <Clear style={{color:"rgba(255,255,255,1)",height:25,width:25}}/>
                    </div>
                </div>
            </div> 
            <div 
            className="scroll"
            style={{       
                padding:"10px",              
                display:"flex",
                overflowX:"hidden", 
                height:"100%",
                justifyContent:"space-between",
                alignItems:"flex-start", 
                flexDirection:"column"  
            }}>     
                <div style={{color:"rgba(100,100,100,0.8)"}}>{header}</div>
                    {title}
                <div style={{
                    width:"100%",
                    display:"flex",
                    minHeight:"50px",
                    alignItems:"center",
                    justifyContent:"center",
                    bottom:"10px"                    
                }}>
                    <div  
                        onClick={() => {
                            this.openTodoInApp(todos[0]);
                            this.suspend(); 
                        }} 
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
                           {button}
                        </div>   
                    </div> 
                </div>
            </div> 
    </div>  
  } 
}

