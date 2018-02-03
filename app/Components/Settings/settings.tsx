import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import ClearArrow from 'material-ui/svg-icons/content/backspace';  
import FlatButton from 'material-ui/FlatButton';
import Clear from 'material-ui/svg-icons/content/clear';
import Advanced from 'material-ui/svg-icons/action/settings-applications';   
import General from 'material-ui/svg-icons/action/description';   
import Cloud from 'material-ui/svg-icons/file/cloud';   
import QuickEntry from 'material-ui/svg-icons/content/add-box';  
import CalendarEvents from 'material-ui/svg-icons/action/date-range';  
import Database from 'material-ui/svg-icons/device/storage';    
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import NewProjectIcon from 'material-ui/svg-icons/image/timelapse';
import Popover from 'material-ui/Popover';
import { remove, isNil, not, isEmpty, compose, toPairs, map, contains, last, cond } from 'ramda';
let uniqid = require("uniqid");    
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx'; 
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { Checkbox } from '../TodoInput/TodoInput';
import { attachDispatchToProps, isString, debounce } from '../../utils';
import { Store } from '../../app';
import { generateId, Calendar } from '../../database';
import { isDate } from 'util';
import { SimplePopup } from '../SimplePopup';
import { getIcalData, IcalData, AxiosError } from '../Calendar';



interface SettingsPopupProps extends Store{}

interface SettingsPopupState{}
 
@connect((store,props) =>  ({ ...store, ...props }), attachDispatchToProps)  
export class SettingsPopup extends Component<SettingsPopupProps,SettingsPopupState>{

    constructor(props){
        super(props);
    }

    render(){
        let {openSettings,dispatch} = this.props;

        return <SimplePopup
           show={openSettings} 
           onOutsideClick={() => dispatch({type:"openSettings",load:false})}
        >
            <Settings {...{} as any}/> 
        </SimplePopup>    
    }  
} 


interface SettingsProps extends Store{}

export type section =  'General' | 'QuickEntry' | 'CalendarEvents' | 'DataFolder' | 'Advanced';
  
interface SettingsState{}

@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps) 
export class Settings extends Component<SettingsProps,SettingsState>{

    constructor(props){ 
        super(props);
    }
 
    render(){
        let {selectedSettingsSection, dispatch} = this.props;
        let height = window.innerHeight/2;
        let width = window.innerWidth/1.2;
        let title = { 
            'General' : 'General',
            'Cloud' : 'Cloud',
            'QuickEntry' : 'Quick Entry',
            'CalendarEvents' : 'Calendar Events',
            'DataFolder' : 'Data folder',
            'Advanced' : 'Advanced'
        }[selectedSettingsSection];


        return <div style={{
            display:"flex", 
            flexDirection:"column", 
            height:height, 
            width:width,
            borderRadius:"5px",
            backgroundColor:"rgba(230, 230, 230, 1)",
            boxShadow:"0 0 18px rgba(0,0,0,0.5)", 
        }}>
            <div style={{
                width:"100%",
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                flexDirection:"column",
                background:"rgba(215,215,215,1)"
            }}> 
                <div style={{
                    padding:"5px",
                    width:"100%",
                    display:"flex",
                    fontWeight:"bold",
                    alignItems:"center",
                    color:"rgba(10,10,10,0.8)",
                    justifyContent:"center",
                    cursor:"default"  
                }}>
                    {title} 
                </div> 
 
                <div style={{ 
                    display:"flex",
                    justifyContent:"space-around",
                    alignItems:"center",
                    width:"100%",
                    padding:"10px"  
                }}> 
                    <Section  
                        onClick={() => dispatch({type:"selectedSettingsSection", load:'General'})} 
                        icon={<General style={{color:"dimgray", height:18, width:18}}/>}
                        name={'General'}
                        selected={selectedSettingsSection==='General'}
                    /> 
                    <Section
                        onClick={() => dispatch({type:"selectedSettingsSection", load:'QuickEntry'})} 
                        icon={<QuickEntry style={{color:"rgba(100,100,100,0.8)", height:18, width:18}}/>}
                        name={'Quick Entry'}
                        selected={selectedSettingsSection==='QuickEntry'}
                    />
                    <Section
                        onClick={() => dispatch({type:"selectedSettingsSection", load:'CalendarEvents'})} 
                        icon={<CalendarEvents style={{color:"rgba(150,10,10,0.8)", height:18, width:18}}/>}
                        name={'Calendar Events'}
                        selected={selectedSettingsSection==='CalendarEvents'}
                    />
                    <Section
                        onClick={() => dispatch({type:"selectedSettingsSection", load:'DataFolder'})} 
                        icon={<Database style={{color:"rgba(10,10,10,0.8)", height:18, width:18}}/>}
                        name={'Database'} 
                        selected={selectedSettingsSection==='DataFolder'}
                    />  
                     <Section
                        onClick={() => dispatch({type:"selectedSettingsSection", load:'Advanced'})} 
                        icon={<Advanced style={{color:"rgba(10,10,10,0.8)", height:18, width:18}}/>}
                        name={'Advanced'} 
                        selected={selectedSettingsSection==='Advanced'}
                    />  
                </div>     
            </div> 
            <div 
              className="scroll"  
              style={{
                 flexGrow:0.7,   
                 display:"flex",
                 width:"100%", 
                 cursor:"default"
              }}
            >  
            {
                cond([  
                [ 
                 (selectedSettingsSection:string) : boolean => selectedSettingsSection==="General",  
                 () => <GeneralSettings />
                ],  
                [ 
                 (selectedSettingsSection:string) : boolean => selectedSettingsSection==="QuickEntry",  
                 () => <QuickEntrySettings />
                ], 
                [ 
                 (selectedSettingsSection:string) : boolean => selectedSettingsSection==="CalendarEvents",  
                 () => <CalendarEventsSettings {...{} as any} />
                ], 
                [ 
                 (selectedSettingsSection:string) : boolean => selectedSettingsSection==="DataFolder",  
                 () => <DataFolderSettings />
                ],
                [ 
                 (selectedSettingsSection:string) : boolean => selectedSettingsSection==="Advanced",  
                 () => <AdvancedSettings />
                ]
                ])(selectedSettingsSection)
            }   
            </div>
        </div>
    }
}

 

interface SectionProps{
    onClick:() => void,
    icon:JSX.Element,
    name:string,
    selected:boolean
}

class Section extends Component<SectionProps,{}>{

    render(){

        let {icon, name, onClick, selected} = this.props;
          
        return <div  
            className={selected ? '' : "settingsSection"}
            onClick={() => onClick()}
            style={{
                paddingTop:"4px",
                paddingBottom:"4px",
                paddingLeft:"8px",
                paddingRight:"8px",
                borderRadius:"5px",
                display:'flex',  
                backgroundColor:selected ? "rgba(100,100,100,0.1)" : '',
                alignItems:"center", 
                justifyContent:"center", 
                cursor:"pointer"  
            }}
        >
            <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}> 
                {icon}
            </div>
            <div style={{
              color:"black", fontSize:"14px", whiteSpace:"nowrap", display:"flex", alignItems:"center", 
              justifyContent:"center", textAlign:"center", paddingLeft:"2px"
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
            width:"100%",
            justifyContent:"space-around" 
        }}>
            <div style={{
                paddingLeft:"25px",  
                display:"flex",  
                flexGrow:1,
                flexDirection:"column",  
                justifyContent:"space-around"
            }}> 
                <div style={{display:"flex",alignItems:"center",width:"80%"}}>
                    <Checkbox checked={false} onClick={() => {}}/>
                    <div style={{paddingLeft:"10px"}}>Group to-dos in the Today list by project or area</div>
                </div> 

                <div style={{display:"flex",alignItems:"center",width:"80%"}}>
                    <Checkbox checked={true} onClick={() => {}}/>
                    <div style={{paddingLeft:"10px"}}>Preserve window width when resizing sidebar</div>
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
            <div style={{display:"flex", flexGrow:0.7, width:"100%"}}>
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
            width:"100%",
            display:"flex",
            paddingLeft:"25px",
            flexDirection:"column",
            alignItems:"flex-start",
            justifyContent:"space-around"
        }}>

            <div style={{width:"100%"}}>
                <div style={{display:"flex",alignItems:"center"}}>
                    <Checkbox checked={false} onClick={() => {}}/>
                    <div style={{paddingLeft:"10px"}}>Enable shortcut for Quick Entry</div>
                </div> 
                <div style={{
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
                }}   
            > 
                <div>Quick Entry saves to</div>
                <div style={{paddingLeft:"5px", paddingRight:"5px"}}>
                    <select   
                        style={{
                            backgroundColor:"white",  
                            outline:"none",
                            paddingLeft:"5px",
                            paddingRight:"5px",
                            borderRadius:"4px"
                        }}  
                        name="text" 
                        value={"inbox"}
                        onChange={(event) => this.setState({})}  
                    >   
                        <option value="inbox">Inbox</option> 
                    </select>
                </div>    
                <div>by default</div>
            </div>
        </div>
    }   
}






interface CalendarEventsSettingsProps extends Store{}

interface CalendarEventsSettingsState{
    url:string,
    error:string 
}


@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)   
class CalendarEventsSettings extends Component<CalendarEventsSettingsProps,CalendarEventsSettingsState>{

    constructor(props){
        super(props);
        this.state = { url:'', error:'' };
    }


    onUrlChange = (e) => this.setState({url:e.target.value, error:''})


    onUrlSubmit = (e) => {
        let { url, error } = this.state;
        let { calendars, dispatch } = this.props;
        let urls = calendars.map( c => c.url );
 
        if(isEmpty(url)){ return null }
        if(contains(url)(urls)){ return null }

        let extension = last(url.split('.'));

        if(extension!=='ics'){    
           this.setState({error:"Incorrect format. Only ics extension supported."});
           return null;    
        }
        
        if(url.startsWith("webcal")){
           url = url.replace("webcal","http");
        }
         
        getIcalData(url)
        .then( 
            (data:IcalData) => {
                let {calendar,events,error} = data;
                
                if(!isNil(error)){  
                   this.setState({error:error.message});
                   return null;  
                }
                
                let load : Calendar = {
                    url, 
                    active:true,
                    _id:generateId(),
                    name:calendar.name, 
                    description:calendar.description,
                    timezone:calendar.timezone,
                    events,
                    type:"calendar"
                } 

                dispatch({type:'addCalendar', load});

                this.setState({url:'', error:''});
            } 
        )   
    }
    
 
    onItemCheck = debounce(
        (calendar:Calendar) : void => this.props.dispatch({
            type:"updateCalendar", 
            load:{ ...calendar, active:!calendar.active }
        }), 
        50
    )     
   

    onShowCalendarEvents = debounce(
        (e) => {
            let {showCalendarEvents,dispatch} = this.props;
            dispatch({type:"showCalendarEvents", load:!showCalendarEvents});
        },
        50
    ) 
    
    
    onRemoveCalendar = (_id:string) => (e) => this.props.dispatch({ type:"removeCalendar", load:_id })
      

    render(){
        let {calendars,showCalendarEvents} = this.props; 
        let {error} = this.state;

        return  <div style={{width:"100%", paddingTop:"25px", paddingLeft:"25px"}}>
                <div style={{display:"flex", alignItems:"center"}}>
                    <Checkbox checked={showCalendarEvents} onClick={this.onShowCalendarEvents}/>
                    <div style={{paddingLeft:"10px"}}>Show Calendar Events in Today and Upcoming lists</div>
                </div>  
                <div style={{
                    display:"flex", 
                    paddingTop:"20px", 
                    paddingBottom:"20px",  
                    flexDirection:"column"
                }}>   
                    {
                        calendars
                        .map( 
                            (calendar,index) => <div 
                                key={index}
                                style={{
                                    display:"flex", 
                                    alignItems:"center", 
                                    padding:"10px",  
                                    justifyContent:"space-between",
                                    backgroundColor:index%2 ? "white" : "rgba(200,200,200,0.3)",
                                    overflowX:"hidden"
                                }}
                            >   
                                <div>
                                    <Checkbox 
                                        checked={calendar.active}   
                                        onClick={() => this.onItemCheck(calendar)} 
                                    />   
                                </div>
                                <div style={{
                                    paddingLeft:"10px", 
                                    whiteSpace:"nowrap", 
                                    width:"85%", 
                                    overflowX:"hidden"
                                }}>
                                    {calendar.name}
                                </div> 
                                <div  
                                style={{alignItems:"center", display:"flex", cursor:"pointer"}} 
                                onClick={this.onRemoveCalendar(calendar._id)}
                                >  
                                    <Clear 
                                        style={{
                                            color:"rgba(100,100,100,0.5)",
                                            height:30,
                                            width:30 
                                        }}
                                    /> 
                                </div>
                            </div> 
                        )
                    } 
                </div> 
                <div style={{display:"flex",alignItems:"center",paddingBottom:"20px",paddingRight:"10px"}}>
                    <div style={{width:"100%", paddingRight:"15px"}}> 
                        <input 
                            type="url"     
                            value={this.state.url}
                            placeholder="Input Calendar URL" 
                            style={{
                                backgroundColor:"white",
                                color:"rgba(100, 100, 100, 0.9)",   
                                outline:"none", 
                                textAlign:"center",
                                alignItems:"center",
                                display:"flex",
                                justifyContent:"center",
                                height:"30px",
                                width:"100%",  
                                borderRadius:"4px",  
                                border:"1px solid rgba(100,100,100,0.3)"
                            }}
                            onChange={this.onUrlChange}
                        />  
                    </div> 
                    <div     
                        onClick={this.onUrlSubmit}
                        style={{     
                            display:"flex",
                            alignItems:"center",
                            cursor:"pointer",
                            justifyContent:"center",
                            height:"20px",
                            borderRadius:"5px",
                            paddingLeft:"25px",
                            paddingRight:"25px",
                            paddingTop:"5px", 
                            paddingBottom:"5px",
                            backgroundColor:"rgba(81, 144, 247, 1)"  
                        }}  
                    >   
                        <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px"}}>  
                            Add Calendar 
                        </div>   
                    </div> 
                </div>  
                {
                    isEmpty(error) ? null :
                    <div style={{
                        paddingLeft:"30px",
                        paddingBottom:"10px",
                        fontSize:"15px",
                        color:"red",
                        userSelect:"none"
                    }}>   
                        {error}
                    </div> 
                }  
        </div>
    }
}



 

let selectFolder = () => new Promise(
    resolve => { 
        ipcRenderer.removeAllListeners("folder");  
        ipcRenderer.send("folder");
        ipcRenderer.on("folder", (event,data) => {
            let {foldername} = data;
            resolve(foldername)
        })
    } 
)



interface DataFolderProps{}

interface DataFolderState{
    folder:string
}

class DataFolderSettings extends Component<DataFolderProps,DataFolderState>{

    constructor(props){
        super(props);
        this.state={ 
            folder:'...'
        };  
    }

    onSelectFolder = () => selectFolder().then(
        (folder:string) => isNil(folder) ? null : 
                           isEmpty(folder) ? null :
                           this.setState({folder})
    )
      
    render(){   
        let {folder} = this.state;

        return <div style={{display:"flex", width:"100%", paddingTop:"25px", paddingLeft:"25px"}}>
            <div style={{ 
                backgroundColor:"white",
                color:"rgba(100, 100, 100, 0.9)",   
                outline:"none",
                textAlign:"center",
                alignItems:"center",
                display:"flex",
                marginRight:"15px",
                justifyContent:"center",
                height:"30px",
                width:"100%",  
                borderRadius:"4px",  
                border:"1px solid rgba(100,100,100,0.3)"
            }}>           
                {folder}
            </div>
            <div     
                onClick={this.onSelectFolder}
                style={{     
                    display:"flex",
                    alignItems:"center",
                    cursor:"pointer",
                    justifyContent:"center",
                    height:"20px",
                    borderRadius:"5px",
                    paddingLeft:"25px",
                    paddingRight:"25px",
                    paddingTop:"5px", 
                    paddingBottom:"5px",
                    backgroundColor:"rgba(81, 144, 247, 1)"  
                }}  
            >   
                <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px"}}>  
                    Select folder
                </div>   
            </div> 
        </div>
    }   
}   



interface AdvancedProps{}

interface AdvancedState{
}

class AdvancedSettings extends Component<AdvancedProps,AdvancedState>{

    constructor(props){
        super(props);
        this.state={  };  
    }

    render(){   

        return <div style={{
            display:"flex", width:"100%", paddingTop:"25px", paddingLeft:"25px"
        }}>
        </div>
    }   
} 