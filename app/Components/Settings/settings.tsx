import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import ClearArrow from 'material-ui/svg-icons/content/backspace';  


import General from 'material-ui/svg-icons/action/description';   
import Cloud from 'material-ui/svg-icons/file/cloud';   
import QuickEntry from 'material-ui/svg-icons/content/add-box';  
import CalendarEvents from 'material-ui/svg-icons/action/date-range';  
import Siri from 'material-ui/svg-icons/av/mic';     
       

import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import NewProjectIcon from 'material-ui/svg-icons/image/timelapse';
import Popover from 'material-ui/Popover';
import { remove, isNil, not } from 'ramda';
let uniqid = require("uniqid");    
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx'; 
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
 
interface SettingsProps{

}

type section = 'General' | 'Cloud' | 'QuickEntry' | 'CalendarEvents' | 'Siri';
 
interface SettingsState{
    section:section
}

export class Settings extends Component<SettingsProps,SettingsState>{

    constructor(props){
        super(props);
        this.state={
            section:'General'
        }
    }

    render(){
        let {section} = this.state;
        let height = window.innerHeight/2;
        let width = window.innerWidth/2;
        let title = ``;

        return <div style={{display:"flex", flexDirection:"column", height:height, width:width}}>
            <div style={{height:"30%", width:"100%"}}>
                <div style={{
                    height:"20%", 
                    width:"100%", 
                    display:"flex", 
                    alignItems:"center"
                }}>
                    {title} 
                </div>
 
                <div style={{display:"flex", justifyContent:"space-between", width:"100%"}}>
                    <Section  
                        onClick={() => this.setState({section:'General'})} 
                        icon={<General style={{color:"dimgray", height:40, width:40}}/>}
                        name={'General'}
                    />
                    <Section
                        onClick={() => this.setState({section:'Cloud'})} 
                        icon={<Cloud style={{color:"rgba(10,50,240,0.8)", height:40, width:40}}/>}
                        name={'Cloud'}
                    />
                    <Section
                        onClick={() => this.setState({section:'QuickEntry'})} 
                        icon={<QuickEntry style={{color:"rgba(100,100,100,0.8)", height:40, width:40}}/>}
                        name={'Quick Entry'}
                    />
                    <Section
                        onClick={() => this.setState({section:'CalendarEvents'})} 
                        icon={<CalendarEvents style={{color:"rgba(150,10,10,0.8)", height:40, width:40}}/>}
                        name={'Calendar Events'}
                    />
                    <Section
                        onClick={() => this.setState({section:'Siri'})} 
                        icon={<Siri style={{color:"rgba(10,10,10,0.8)", height:40, width:40}}/>}
                        name={'Siri'} 
                    /> 
                </div>    
            </div>
            <div style={{height:"70%", width:"100%"}}>
                {
                    {
                        General : <GeneralSettings />,
                        Cloud : <CloudSettings />, 
                        QuickEntry : <QuickEntrySettings />, 
                        CalendarEvents : <CalendarEventsSettings />, 
                        Siri : <SiriSettings />
                    }[section] 
                }
            </div>
        </div>
    }
}



interface SectionProps{
    onClick:() => void,
    icon:JSX.Element,
    name:string
}

class Section extends Component<SectionProps,{}>{

    render(){
        let {icon,name,onClick} = this.props;
        
        return <div style={{
            display:'flex', 
            flexDirection:"column", 
            alignItems:"center", 
            justifyContent:"center"
        }}>
            <div style={{
                display:"flex",
                alignItems:"center",   
                justifyContent:"center"
            }}>
                {icon}
            </div>
            <div style={{
                color:"black", fontWeight:"bold", fontSize:"16px", 
                width:"100%", display:"flex", alignItems:"center",
                justifyContent:"center"
            }}> 
                {name}
            </div>
        </div>
    }   
}


 

  
interface GeneralSettingsProps{}

interface GeneralSettingsState{}

class GeneralSettings extends Component<GeneralSettingsProps,GeneralSettingsState>{

    constructor(props){
        super(props);
    }

    render(){
        return <div> </div>
    }
}




interface CloudSettingsProps{}

interface CloudSettingsState{}

class CloudSettings extends Component<CloudSettingsProps,CloudSettingsState>{

    constructor(props){
        super(props);
    }

    render(){
        return <div> </div>
    }
}




interface QuickEntrySettingsProps{}

interface QuickEntrySettingsState{}

class QuickEntrySettings extends Component<QuickEntrySettingsProps,QuickEntrySettingsState>{

    constructor(props){
        super(props);
    }

    render(){
        return <div> </div>
    }
}




interface CalendarEventsSettingsProps{}

interface CalendarEventsSettingsState{}

class CalendarEventsSettings extends Component<CalendarEventsSettingsProps,CalendarEventsSettingsState>{

    constructor(props){
        super(props);
    }

    render(){
        return <div> </div>
    }
}


 

interface SiriSettingsProps{}

interface SiriSettingsState{}

class SiriSettings extends Component<SiriSettingsProps,SiriSettingsState>{

    constructor(props){
        super(props);
    }

    render(){
        return <div> </div>
    } 
}
