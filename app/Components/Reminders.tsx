import './../assets/fonts/index.css'; 
import './../assets/styles.css';  
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
import {timeOfTheDay} from './../utils/time';
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

interface ReminderProps{
    message:string,
    date:Date
}

interface RemindersProps{
    reminders:ReminderProps[]
}
 
interface RemindersState{}

export class Reminders extends Component<RemindersProps,RemindersState>{

    constructor(props){
        super(props);
        this.state={};
    }

    render(){
        let {reminders} = this.props;

        return <div style={{
            backgroundColor:"rgb(234, 235, 239)",
            display:"flex",
            overflowX:"hidden",
            flexDirection:"column",
            justifyContent:"space-between",
            height:"100%"
        }}>     
               {reminders.map((reminder:ReminderProps) => <Reminder {...reminder}/>)}
        </div>
    }
}
 

interface ReminderState{}

class Reminder extends Component<ReminderProps,ReminderState>{

    render(){
        let { message, date } = this.props;

        return <div style={{
            display:"flex",
            height:"20px",
            alignItems:"center",
            backgroundColor:"white",
            color:"black"
        }}>
            <div style={{paddingLeft:"5px", fontSize:"15px", fontWeight:500}}>
                {timeOfTheDay(date)}
            </div>
            <div style={{
                fontSize:"15px",
                userSelect:"none",
                cursor:"default",
                fontWeight:500,
                paddingLeft:"5px",
                overflowX:"hidden"
            }}>   
                {message}  
            </div>
        </div>
    }
}