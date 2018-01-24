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
import Folder from 'material-ui/svg-icons/file/folder';     
       

import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import NewProjectIcon from 'material-ui/svg-icons/image/timelapse';
import Popover from 'material-ui/Popover';
import { remove, isNil, not } from 'ramda';
let uniqid = require("uniqid");    
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx'; 
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { Checkbox } from '../TodoInput/TodoInput';
 
interface SettingsProps{

}

type section = 'General' | 'Cloud' | 'QuickEntry' | 'CalendarEvents' | 'DataFolder';
 
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
        let width = window.innerWidth/1.5;
        let title =  {
            'General' : 'General',
            'Cloud' : 'Cloud',
            'QuickEntry' : 'Quick Entry',
            'CalendarEvents' : 'Calendar Events',
            'DataFolder' : 'Data folder'
        }[section]


        return <div style={{
            display:"flex", 
            flexDirection:"column", 
            height:height, 
            width:width,
            borderRadius:"20px",
            backgroundColor:"white",
            boxShadow:"0 0 18px rgba(0,0,0,0.5)", 
        }}>
            <div style={{
                height: "30%",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                background: "-webkit-linear-gradient(top, #eeeeee 0%,#cccccc 100%)"
            }}>
                <div style={{
                    height: "20%",
                    width: "100%",
                    display: "flex",
                    fontWeight: "bold",
                    alignItems: "center",
                    color: "rgba(10,10,10,0.8)",
                    justifyContent: "center",
                    cursor: "default"  
                }}>
                    {title} 
                </div> 
 
                <div style={{ 
                    display:"flex",
                    justifyContent:"space-around",
                    alignItems:"center", 
                    width:"80%", 
                    height:"80%"
                }}>
                    <Section  
                        onClick={() => this.setState({section:'General'})} 
                        icon={<General style={{color:"dimgray", height:40, width:40}}/>}
                        name={'General'}
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
                        onClick={() => this.setState({section:'DataFolder'})} 
                        icon={<Folder style={{color:"rgba(10,10,10,0.8)", height:40, width:40}}/>}
                        name={'Data folder'} 
                    /> 
                </div>    
            </div>
            <div style={{
                height:"70%", 
                width:"100%",
                cursor:"default",  
                backgroundColor:"rgba(200,200,200,0.3)"
            }}>
                {
                    {
                        General : <GeneralSettings />,
                        Cloud : <CloudSettings />, 
                        QuickEntry : <QuickEntrySettings />, 
                        CalendarEvents : <CalendarEventsSettings />, 
                        DataFolder : <DataFolderSettings />
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

        let {icon, name, onClick} = this.props;
         
        return <div  
            className="settingsSection"
            onClick={() => onClick()}
            style={{
                display:'flex', 
                flexDirection:"column", 
                alignItems:"center", 
                minWidth:"80px",
                height:"80px",
                justifyContent:"center", 
                cursor:"pointer"  
            }}
        >
            <div style={{
              display:"flex",
              alignItems:"center",   
              justifyContent:"center"
            }}> 
                {icon}
            </div>
            <div style={{
                color:"black", fontSize:"14px", whiteSpace:"nowrap",  
                display:"flex", alignItems:"center", justifyContent:"center", 
                textAlign:"center"
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
        return <div style={{
            display:"flex", 
            flexDirection:"column", 
            height:"100%",
            justifyContent:"space-around" 
        }}>



            <div style={{display:"flex", height:"50%", width:"100%"}}>

                <div style={{ 
                    display:"flex", alignItems:"flex-end",  
                    width:"50%", flexDirection:"column",
                    justifyContent:"space-around", fontSize:"14px" 
                }}>      
                    <div>Move completed items to Logbook:</div>
                    <div>Dock count:</div>  
                </div>   

                <div style={{  
                    display:"flex", alignItems:"flex-start", 
                    width:"50%", flexDirection:"column",
                    justifyContent:"space-around" 
                }}> 
                    <div style={{paddingLeft:"20px"}}>     
                        <select 
                            style={{
                                backgroundColor:"white",
                                outline:"none",
                                borderRadius:"4px"
                            }}  
                            name="text" 
                            value={"immediately"}
                            onChange={(event) => this.setState({})}  
                        >  
                            <option value="immediately">Immediately</option> 
                        </select>   
                    </div>

                    <div style={{paddingLeft:"20px"}}>
                        <select   
                            style={{
                                backgroundColor:"white",
                                outline:"none",
                                borderRadius:"4px"
                            }}  
                            name="text"
                            value={"duetoday"}
                            onChange={(event) => this.setState({})}  
                        >   
                            <option value="duetoday">Due + Today</option> 
                        </select>
                    </div>  
                </div>
            </div>



            <div 
                style={{
                    outline:"none",
                    position:"relative",
                    width:"100%",
                    borderBottom:"1px solid rgba(100,100,100,0.2)"
                }}
            >
            </div> 


            <div style={{
                width:"100%", 
                display:"flex",  
                height:"50%",
                flexDirection:"column", 
                justifyContent:"space-around"
            }}> 
                <div style={{display:"flex",alignItems:"center", paddingLeft:"30px"}}>
                    <Checkbox
                        checked={false}
                        onClick={() => {}} 
                    />
                    <div style={{paddingLeft:"10px"}}>Group to-dos in the Today list by project or area</div>
                </div> 

                <div style={{display:"flex",alignItems:"center", paddingLeft:"30px"}}>
                    <Checkbox
                        checked={true} 
                        onClick={() => {}} 
                    />
                    <div style={{paddingLeft:"10px"}}>Preserve window width when resizing sidebar</div>
                </div>
            </div> 
        </div>
    }
} 



interface QuickEntrySettingsProps{}

interface QuickEntrySettingsState{}

class QuickEntrySettings extends Component<QuickEntrySettingsProps,QuickEntrySettingsState>{

    constructor(props){
        super(props);
    }

    render(){
        return <div style={{
            height:"100%",
            display:"flex",
            flexDirection:"column",
            alignItems:"flex-start",
            justifyContent:"space-around"
        }}>

            <div style={{width:"100%"}}>
                <div style={{display:"flex",alignItems:"center", paddingLeft:"30px"}}>
                    <Checkbox
                        checked={false}
                        onClick={() => {}} 
                    />
                    <div style={{paddingLeft:"10px"}}>Enable shortcut for Quick Entry</div>
                </div> 
                <div style={{
                    paddingLeft:"55px",
                    fontSize:"13px",
                    width:"80%",
                    color:"rgba(100,100,100,0.9)",
                    cursor:"default" 
                }}>
                    The Quick Entry window lets you enter new to-dos into Things from anywhere
                    without having to switch applications. Use the keyboard shortcut to make 
                    the window appear.
                </div>
            </div>

            <div 
                style={{
                    width:"350px",
                    display:"flex",
                    fontSize:"15px",
                    color:"rgba(10,10,10,0.8)",
                    fontWeight:"bold", 
                    justifyContent:"space-around",
                    paddingLeft:"25px" 
                }}   
            > 
                <div>Quick Entry saves to</div>
 
                <select   
                    style={{
                        backgroundColor:"white",
                        outline:"none",
                        borderRadius:"4px"
                    }}  
                    name="text" 
                    value={"inbox"}
                    onChange={(event) => this.setState({})}  
                >   
                    <option value="inbox">Inbox</option> 
                </select>

                <div>by default</div>
            </div>
        </div>
    }   
}



interface CalendarEventsSettingsProps{}

interface CalendarEventsSettingsState{}

class CalendarEventsSettings extends Component<CalendarEventsSettingsProps,CalendarEventsSettingsState>{

    constructor(props){
        super(props);
    }

    render(){
        return <div style={{paddingTop:"20px"}}>
            <div style={{display:"flex", alignItems:"center", paddingLeft:"30px"}}>
                <Checkbox
                    checked={false}
                    onClick={() => {}} 
                />
                <div style={{paddingLeft:"10px"}}>Show Calendar Events in Today and Upcoming lists</div>
            </div>  

            <div style={{
                display:"flex", 
                paddingLeft:"40px",
                paddingRight:"40px",
                paddingTop:"20px",
                flexDirection:"column"
            }}>  
                {
                    ["Home", "Work", "Birthdays","Facebook Events"]
                    .map(
                        (name,index) => <div 
                            style={{
                                display:"flex", 
                                alignItems:"center", 
                                padding:"10px",  
                                backgroundColor:index%2 ? "white" : "rgba(200,200,200,0.5)"
                            }}
                        >  
                            <Checkbox
                                checked={false}   
                                onClick={() => {}} 
                            />
                            <div style={{paddingLeft:"10px"}}>{name}</div>
                        </div> 
                    )
                }
            </div> 
        </div>
    }
}

 

interface DataFolderProps{}

interface DataFolderState{}

class DataFolderSettings extends Component<DataFolderProps,DataFolderState>{

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
