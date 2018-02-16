import './assets/fonts/index.css'; 
import './assets/notification.css'; 
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react";  
import spacing from 'material-ui/styles/spacing';  
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import Moon from 'material-ui/svg-icons/image/brightness-3';
import Star from 'material-ui/svg-icons/toggle/star';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import CheckBoxEmpty from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import CheckBox from 'material-ui/svg-icons/toggle/check-box';  
import BusinessCase from 'material-ui/svg-icons/places/business-center';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz'; 
import Layers from 'material-ui/svg-icons/maps/layers'; 
import Adjustments from 'material-ui/svg-icons/image/tune';
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none'; 
import Flag from 'material-ui/svg-icons/image/assistant-photo'; 
import NewProjectIcon from 'material-ui/svg-icons/image/timelapse';
import NewAreaIcon from 'material-ui/svg-icons/maps/layers'; 
import Plus from 'material-ui/svg-icons/content/add';
import Trash from 'material-ui/svg-icons/action/delete';
import Search from 'material-ui/svg-icons/action/search'; 
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Logbook from 'material-ui/svg-icons/av/library-books';
import Audiotrack from 'material-ui/svg-icons/image/audiotrack';
import Calendar from 'material-ui/svg-icons/action/date-range';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import { ipcRenderer, remote } from 'electron'; 
import TextField from 'material-ui/TextField';  
import List from 'material-ui/svg-icons/action/list';
import { 
    cond, assoc, isNil, not, defaultTo, map, isEmpty, 
    uniq, remove, contains, append, adjust, compose, 
    flatten, concat, prop  
} from 'ramda';
let moment = require("moment");
import Popover from 'material-ui/Popover';
import Alert from 'material-ui/svg-icons/alert/add-alert';
import Checked from 'material-ui/svg-icons/navigation/check';
import Inbox from 'material-ui/svg-icons/content/inbox';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import Clear from 'material-ui/svg-icons/content/clear';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { Provider, connect } from "react-redux";
import RaisedButton from 'material-ui/RaisedButton';
import { Config } from './utils/config';
import { generateId } from './utils/generateId';
import { daysRemaining } from './utils/daysRemaining';
import { wrapMuiThemeLight } from './utils/wrapMuiThemeLight';
import { chooseIcon } from './utils/chooseIcon';
import { Reminders } from './Components/Reminders';

injectTapEventPlugin();  


ipcRenderer.once( 
    'loaded',     
    (event) => { 
        let app=document.createElement('div'); 
        app.style.width="100%"; 
        app.style.height="100%";
        app.id='application';      
        document.body.appendChild(app);    

        ReactDOM.render(   
            wrapMuiThemeLight(<Notification/>),
            document.getElementById('application')
        )     
    }
);   


interface NotificationProps{}   

interface  NotificationState{
    title:string,
    message:string,
    iconName:string
}    

class Notification extends Component<NotificationProps,NotificationState>{
    subscriptions:Subscription[];

    constructor(props){
        super(props);  
        let defaultState={title:'', message:'', iconName:'inbox'};    
        this.state={...defaultState};       
    }

    updateState = (state) => new Promise(resolve => this.setState(state, () => resolve()));

    componentDidMount(){
        let update = Observable 
                        .fromEvent(ipcRenderer, 'remind', (event,state:NotificationState) => state)
                        .flatMap((state) => this.updateState(state))
                        .subscribe(() => this.show());

        this.subscriptions.push(update);
    }

    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = [];
    }

    
    show = () => {  }


    changeSize = ({width,height}) =>  remote.getCurrentWindow().setSize(width, height); 


    close = () => remote.getCurrentWindow().hide();


    getPosition = () : number[] => remote.getCurrentWindow().getPosition();
    

    setPosition = (x:number,y:number) => remote.getCurrentWindow().setPosition(x, y);


    render(){  
        let {title, message, iconName} = this.state;

        return <div style={{display:"flex",flexDirection:"column",width:"100%",height:"100%"}}>
            <div 
                style={{
                    width:"100%",
                    position:"relative",
                    height:"10%",
                    backgroundColor:"rgba(40,45,40,1)",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center" 
                }}
            >
                <div style={{fontWeight:500,color:"rgba(255,255,255,1)"}}>{title}</div>
                <div style={{position:"absolute",right:10,cursor:"pointer",zIndex:200}}>   
                    <div    
                        style={{padding:"2px",alignItems:"center",cursor:"pointer",display:"flex"}} 
                        onClick={() => this.close()}
                    >
                        <Clear style={{color:"rgba(255,255,255,1)",height:25,width:25}}/>
                    </div>
                </div>
            </div>
            <div 
                style={{
                    width:"100%",
                    position:"relative",
                    height:"20%",
                    backgroundColor:"rgba(100,100,100,0.8)",
                    display:"flex",
                    alignItems:"center",
                    textAlign:"center", 
                    justifyContent:"center"
                }} 
            >
                <div style={{fontWeight:500,color:"white"}}>{message}</div>
            </div>

            <div  
                style={{                    
                    display:"flex",
                    overflowX:"hidden", 
                    justifyContent:"center",
                    height:"70%",
                    position:"relative", 
                    alignItems:"center", 
                    flexDirection:"column"  
                }}   
            >     
                <div>{chooseIcon({width:"30px",height:"30px"},iconName as any)}</div>

                <div>
                    <Reminders reminders={[]}/> 
                </div>
            </div> 
    </div>  
  } 
}


