import './assets/fonts/index.css'; 
import './assets/notification.css'; 
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
// import * as injectTapEventPlugin from 'react-tap-event-plugin';
import { Component } from "react";  
import { ipcRenderer } from 'electron'; 
import { cond, isNil, defaultTo, isEmpty, compose, prop, ifElse, identity } from 'ramda';
import Clear from 'material-ui/svg-icons/content/clear';
import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Rx';
import { wrapMuiThemeLight } from './utils/wrapMuiThemeLight';
import { chooseIcon } from './utils/chooseIcon';
import { globalErrorHandler } from './utils/globalErrorHandler';
import ReactAudioPlayer from 'react-audio-player';
import { isDev } from './utils/isDev';
import { isOneElementArray, isManyElementsArray, isNotNil } from './utils/isSomething';
import { Todo } from './types';
const pathToFile = require("path");
// injectTapEventPlugin();  



window.onerror = (msg:any, url, lineNo, columnNo, error) => {
    let string = msg.toLowerCase();
    var message = [ 
        'Notification Component ',
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

        ReactDOM.render( wrapMuiThemeLight(<Notification />), document.getElementById('application') );  
    }
);   



interface NotificationProps{}   
interface NotificationState{todos:Todo[]}
class Notification extends Component<NotificationProps,NotificationState>{
    soundPath:string;
    subscriptions:Subscription[];
    beep:any;
    open:boolean;
    


    move = () : void => ipcRenderer.send('Nmove'); 



    hide = () : void => ipcRenderer.send('Nhide');



    constructor(props){
        super(props);  
        this.subscriptions = []; 
        this.state = { todos:[] };
        this.open = false;
        this.soundPath = pathToFile.resolve(__dirname,"sound.wav"); 
    };



    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = [];
    };



    componentDidMount(){
        this.subscriptions.push(

            Observable 
                .fromEvent(ipcRenderer, "remind", (event,todo) => todo)
                .do((todo) => ipcRenderer.send("receive", todo))
                .buffer(
                    Observable
                        .interval(4000)
                        .switchMap(
                            () => Observable
                                    .of(this.open)
                                    .skipWhile(val => val)
                        )
                )
                .subscribe(
                    ifElse(
                        isEmpty,
                        identity,
                        (todos:Todo[]) => {
                            //prevent next
                            this.open = true;
                            this.setState( 
                                {todos},
                                () => {
                                   ipcRenderer.send('NremoveReminders',this.state.todos);

                                   if(this.beep){ this.beep.audioEl.play(); }   
 
                                   setTimeout(() => this.move(), 20);
                                }
                            ) 
                        }
                    )  
                )  
        );
    };



    suspend = () => {
        this.hide();
        
        setTimeout(
            () => {
                //allow next
                this.open = false;
            },
            1000
        );
    };
    


    onOpen = () => {
        this.suspend();
        
        if(isNotNil(this.state.todos[0])){
           ipcRenderer.send('openTodoInApp',this.state.todos[0]);
        }
    };



    getTextElements = (todos:Todo[]) : {
        title:JSX.Element,
        header:string, 
        button:string
    } => cond([
        [
            isOneElementArray, 
            (todos:Todo[]) => ({
                title:(
                    <div style={{
                        fontWeight:600,
                        fontSize:"17px",
                        display:"flex",
                        alignItems:"flex-start",
                        color:"black",
                        position:"relative"
                    }}>
                    { compose(defaultTo('Task'),prop('title'))(todos[0]) }
                    </div>
                ),
                header:'A task is due:', 
                button:'Open Task' 
            })
        ],

        [
            isManyElementsArray, 
            (todos:Todo[]) => ({
                title:(
                    <div>
                        {
                            todos.map(
                                (t,i) : JSX.Element => (
                                    <div style={{
                                        fontWeight:600,
                                        fontSize:"17px",
                                        display:"flex",
                                        alignItems:"flex-start",
                                        color:"black",
                                        position:"relative"
                                    }}>
                                        {`${i+1}. ${t.title}`}
                                    </div>
                                )
                            )
                        }
                    </div>
                ),
                header:`${todos.length} tasks due:`, 
                button:'Open'
            })
        ]
    ])(todos);



    render(){    
        let {todos} = this.state;
        if(isNil(todos) || isEmpty(todos)){ return null };
        let { title, header, button }  = this.getTextElements(todos);

        return <div style={{display:"flex",flexDirection:"column",width:"100%",height:"100%"}}>
            <ReactAudioPlayer
                ref={(e) => {this.beep = e;}}
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
                        onClick={this.onOpen} 
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
};

