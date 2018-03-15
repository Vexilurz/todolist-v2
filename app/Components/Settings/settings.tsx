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
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Popover from 'material-ui/Popover';
import { 
    remove, isNil, not, isEmpty, compose, toPairs, map, findIndex, equals,
    contains, last, cond, defaultTo, flatten, uniq, concat, all, identity 
} from 'ramda';
let uniqid = require("uniqid");    
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx'; 
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { debounce } from 'lodash';
import { Checkbox } from '../TodoInput/TodoInput';
import { attachDispatchToProps, keyFromDate, checkForUpdates, getCompletedWhen } from '../../utils/utils';
import { isNewVersion } from '../../utils/isNewVersion';
import { 
    Calendar, getCalendars, getProjects, getAreas, getTodos, Area, Project, 
    Todo, destroyEverything, initDB, addTodos, addProjects, addAreas, 
    addCalendars, getDatabaseObjects  
} from '../../database';
import {text,value} from '../../utils/text'; 
import { SimplePopup } from '../SimplePopup';
import { getIcalData, IcalData, AxiosError } from '../Calendar';
import { filter, getData } from '../MainContainer';
import { UpdateInfo, UpdateCheckResult } from 'electron-updater';
import { Store } from '../../app';
import { updateConfig } from '../../utils/config';
import { isArrayOfTodos } from '../../utils/isSomething';
import { assert } from '../../utils/assert';
import { defaultTags } from '../../utils/defaultTags';
import { uppercase } from '../../utils/uppercase';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { generateId } from '../../utils/generateId';
import { requestFromMain } from '../../utils/requestFromMain';
const Promise = require('bluebird');   
const path = require("path");

interface LicensePopupProps{
    showLicense:boolean,
    dispatch:Function
}
interface LicensePopupState{}
@connect(
    (store:Store,props) =>  ({ showLicense:store.showLicense }), 
    attachDispatchToProps,
    null,
    {
        areStatesEqual:(nextStore:Store, prevStore:Store) => {
           return nextStore.showLicense===prevStore.showLicense;
        }  
    }    
)  
export class LicensePopup extends Component<LicensePopupProps,LicensePopupState>{
    
    constructor(props){ super(props) }

    render(){
        return <SimplePopup 
            show={this.props.showLicense}
            onOutsideClick={() => this.props.dispatch({type:"showLicense",load:false})}
        > 
            <div 
            className="scroll"  
            style={{
                display:"flex", 
                flexDirection:"column",
                maxWidth:"650px", 
                maxHeight:"500px",
                minHeight:"400px",
                borderRadius:"5px",
                position:"relative", 
                backgroundColor:"rgba(254, 254, 254, 1)"
            }}>  
                <div style={{
                    width:"100%",
                    display:"flex",  
                    justifyContent:"center",
                    alignItems:"center",
                    flexDirection:"column",
                    backgroundColor:"rgb(234, 235, 239)",
                }}>   
                    <div style={{width:"100%",alignItems:"center",position:"relative",justifyContent:"center",display:"flex"}}>
                        <div style={{position:"absolute", top:0, right:5, cursor:"pointer", zIndex:200}}>   
                            <div   
                                style={{padding:"2px",alignItems:"center",cursor:"pointer",display:"flex"}} 
                                onClick={() => this.props.dispatch({type:"showLicense",load:false})}
                            >
                                <Clear style={{color:"rgba(100,100,100,0.5)",height:25,width:25}}/>
                            </div>
                        </div>
                    </div>  
                </div> 
                <div style={{whiteSpace:"pre", padding:"10px"}}>{value}</div>
                <div style={{padding:"10px"}}>{text}</div>
            </div>
        </SimplePopup> 
    }
};




interface SettingsPopupProps{
    openSettings:boolean,
    dispatch:Function
} //extends Store{}
interface SettingsPopupState{}

@connect(
    (store:Store,props) =>  ({ openSettings:store.openSettings }), 
    attachDispatchToProps,
    null,
    {
        areStatesEqual:(nextStore:Store, prevStore:Store) => {
           return nextStore.openSettings===prevStore.openSettings;
        }
    }   
)  
export class SettingsPopup extends Component<SettingsPopupProps,SettingsPopupState>{
    constructor(props){ super(props) }
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


export type section = 'QuickEntry' | 'CalendarEvents' | 'Advanced' | 'Tags';
interface SettingsProps{
    selectedSettingsSection:section,
    dispatch?:Function
}// extends Store{}

interface SettingsState{}

@connect(
    (store:Store,props) : SettingsProps => ({ selectedSettingsSection:store.selectedSettingsSection }), 
    attachDispatchToProps,
    null, 
    {
        areStatesEqual:(nextStore:Store, prevStore:Store) => {
           return nextStore.selectedSettingsSection===prevStore.selectedSettingsSection;
        }
    }   
) 
export class Settings extends Component<SettingsProps,SettingsState>{

    constructor(props){ super(props) }
    
    render(){
        let {selectedSettingsSection, dispatch} = this.props;
        let height = window.innerHeight/1.7;
        let width = window.innerWidth/1.2;

        return <div style={{
            display:"flex", 
            flexDirection:"column", 
            height:height, 
            width:width,
            overflow:"hidden",
            maxWidth:"650px", 
            minHeight:"400px",
            borderRadius:"5px",
            position:"relative", 
            backgroundColor:"rgba(254, 254, 254, 1)",
            boxShadow:"0 0 18px rgba(0,0,0,0.5)", 
        }}> 
            <div style={{
                width:"100%",
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                flexDirection:"column",
                backgroundColor:"rgb(234, 235, 239)",
            }}>   
                <div style={{
                    width:"100%",
                    alignItems:"center",
                    position:"relative",
                    justifyContent:"center",
                    display:"flex"
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
                        Settings
                    </div> 
                    <div style={{position:"absolute", top:0, right:5, cursor:"pointer", zIndex:200}}>   
                        <div   
                            style={{padding:"2px",alignItems:"center",cursor:"pointer",display:"flex"}} 
                            onClick={() => dispatch({type:"openSettings",load:false})}
                        >
                            <Clear style={{color:"rgba(100,100,100,0.5)",height:25,width:25}}/>
                        </div>
                    </div>
                </div>
                <div style={{ 
                    display:"flex",
                    justifyContent:"space-around",
                    alignItems:"center",
                    width:"100%",
                    padding:"10px"  
                }}> 
                    <Section
                        onClick={() => dispatch({type:"selectedSettingsSection", load:'QuickEntry'})} 
                        icon={<QuickEntry style={{color:"rgba(100,100,100,0.8)", height:20, width:20}}/>}
                        name={'Quick Entry'}
                        selected={selectedSettingsSection==='QuickEntry'}
                    />
                    <Section
                        onClick={() => dispatch({type:"selectedSettingsSection", load:'CalendarEvents'})} 
                        icon={<CalendarEvents style={{color:"rgba(150,10,10,0.8)", height:20, width:20}}/>}
                        name={'Calendars'}
                        selected={selectedSettingsSection==='CalendarEvents'}
                    />
                    <Section
                        onClick={() => dispatch({type:"selectedSettingsSection", load:'Tags'})} 
                        icon={<TriangleLabel style={{color:"rgba(10,10,10,0.8)", height:20, width:20}}/>}
                        name={'Tags'} 
                        selected={selectedSettingsSection==='Tags'} 
                    /> 
                    <Section
                        onClick={() => dispatch({type:"selectedSettingsSection", load:'Advanced'})} 
                        icon={<Advanced style={{color:"rgba(10,10,10,0.8)", height:20, width:20}}/>}
                        name={'Advanced'} 
                        selected={selectedSettingsSection==='Advanced'}
                    />   
                </div>     
            </div> 
            <div 
              className="scroll"  
              style={{flexGrow:0.7,display:"flex",width:"100%",cursor:"default"}}
            >  
            {
                cond([   
                    [ 
                        (selectedSettingsSection:string) : boolean => selectedSettingsSection==="QuickEntry",  
                        () => <QuickEntrySettings {...{} as any} />
                    ], 
                    [ 
                        (selectedSettingsSection:string) : boolean => selectedSettingsSection==="CalendarEvents",  
                        () => <CalendarEventsSettings {...{} as any} />
                    ], 
                    [  
                        (selectedSettingsSection:string) : boolean => selectedSettingsSection==="Advanced",  
                        () => <AdvancedSettings {...{} as any} />
                    ],
                    [
                        (selectedSettingsSection:string) : boolean => selectedSettingsSection==="Tags",  
                        () => <TagsSettings {...{} as any} />
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
              color:"black", 
              whiteSpace:"nowrap", 
              display:"flex", 
              alignItems:"center", 
              justifyContent:"center",
              textAlign:"center", 
              paddingLeft:"2px"
            }}>   
                {name}  
            </div>
        </div>
    }   
}



interface QuickEntrySettingsProps{
    enableShortcutForQuickEntry:boolean, 
    quickEntrySavesTo:string,
    dispatch?:Function
} // extends Store{}
interface QuickEntrySettingsState{}

@connect(
    (store:Store,props) : QuickEntrySettingsProps => ({ 
        enableShortcutForQuickEntry:store.enableShortcutForQuickEntry, 
        quickEntrySavesTo:store.quickEntrySavesTo
    }), 
    attachDispatchToProps,
    null, 
    {
        areStatesEqual:(nextStore:Store, prevStore:Store) => {
           return all(
               identity,
               [
                 nextStore.enableShortcutForQuickEntry===prevStore.enableShortcutForQuickEntry, 
                 nextStore.quickEntrySavesTo===prevStore.quickEntrySavesTo
               ]
           )           
        }
    }   
)  
class QuickEntrySettings extends Component<QuickEntrySettingsProps,QuickEntrySettingsState>{

    constructor(props){ super(props) }



    enableQuickEntry = debounce(
        () => updateConfig({enableShortcutForQuickEntry:!this.props.enableShortcutForQuickEntry})
                .then(
                    (config) => {
                        this.props.dispatch({type:"updateConfig",load:config}); 
                        requestFromMain<any>(
                            'autolaunch',
                            [
                                config.enableShortcutForQuickEntry ||
                                not(config.disableReminder)
                            ],
                            (event) => event
                        );
                        requestFromMain<any>(  
                            'toggleShortcut', 
                            [config.enableShortcutForQuickEntry,'Ctrl+Alt+T'], 
                            (event) => event
                        );
                    } 
                ),
        50
    );
    


    quickEntrySavesTo = (event) => {
        let {dispatch} = this.props;
        updateConfig({quickEntrySavesTo:event.target.value})
        .then(
            (config) => {
                this.props.dispatch({type:"updateConfig",load:config}); 
                requestFromMain<any>(
                    'updateQuickEntryConfig',
                    [config],
                    (event) => event
                );
            }
        ); 
    };


    
    render(){
        let {enableShortcutForQuickEntry, quickEntrySavesTo} = this.props;

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
                    <Checkbox checked={enableShortcutForQuickEntry} onClick={this.enableQuickEntry}/>
                    <div style={{paddingLeft:"10px"}}>Enable shortcut for Quick Entry</div>
                </div> 
                <div style={{fontSize:"13px", width:"80%", color:"rgba(100,100,100,0.9)", cursor:"default"}}>
                    The Quick Entry window lets you enter new tasks into Things from anywhere
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
                        value={quickEntrySavesTo}
                        onChange={this.quickEntrySavesTo}  
                    >   
                        <option value="inbox">Inbox</option> 
                        <option value="today">Today</option> 
                        <option value="next">Next</option> 
                        <option value="someday">Someday</option> 
                    </select>
                </div>     
                <div>by default</div>
            </div>
        </div>
    }   
}



interface TagsSettingsProps{
    dispatch?:Function,
    todos:Todo[],
    defaultTags:string[]
}
interface TagsSettingsState{}

@connect(
    (store:Store,props) : TagsSettingsProps => ({
        todos:store.todos,
        defaultTags:store.defaultTags
    }), 
    attachDispatchToProps
)   
class TagsSettings extends Component<TagsSettingsProps,TagsSettingsState>{

    constructor(props){ super(props) }

    getTags = () => {
        let {todos,defaultTags} = this.props; 
        return compose(
          uniq,
          flatten,
          concat(defaultTags),
          () => todos.map((t:Todo) => t.attachedTags)
        )() as string[];
    }; 


    onRemoveTag = (tag:string) => () => {
        let {dispatch, todos, defaultTags} = this.props;
        
        let updatedTodos = compose(
            map( 
                (todo:Todo) : Todo => compose(
                    (idx) => ({...todo,attachedTags:remove(idx,1,todo.attachedTags)}),
                    findIndex((todoTag:string) => todoTag===tag),
                    () => todo.attachedTags
                )()
            ), 
            () => filter(todos, (t:Todo) => contains(tag)(t.attachedTags), "")
        )(); 

        assert(isArrayOfTodos(updatedTodos as Todo[]),'onRemoveTag');

        dispatch({type:"updateTodos", load:updatedTodos});

        if(contains(tag)(defaultTags)){
            compose(
                updateConfig(dispatch),
                (idx:number) => ({defaultTags:remove(idx,1,defaultTags)}),
                findIndex((item) => item===tag)
            )(defaultTags)
        }
    };


    onReset = () => {
        let {todos,dispatch} = this.props;

        updateConfig({defaultTags})
        .then((config) => {
            let updatedTodos = todos.map(
                (todo:Todo) => ({ 
                    ...todo, 
                    attachedTags:todo.attachedTags.filter((tag) => contains(tag)(defaultTags)) 
                })
            );

            dispatch({type:"updateConfig",load:config}); 
            dispatch({type:"updateTodos", load:updatedTodos});
        }) 
    };

     
    render(){
        let tags = this.getTags(); 
        
        return <div style={{
            width:"100%", display:"flex", paddingTop:"25px", height:"100%",
            alignItems:"center", paddingLeft:"25px", paddingRight:"25px",
            justifyContent:"space-between", flexDirection:"column" 
        }}>
        <div style={{
            display:"flex",justifyContent:"space-between",paddingTop:"5px",paddingBottom:"5px",flexWrap:"wrap"
        }}>
            {       
                tags
                .sort((a:string,b:string) : number => a.localeCompare(b))
                .map( 
                    (tag:string, index:number) => 
                        <div key={`${tag}-${index}`}>
                            <div style={{ 
                                borderRadius:"15px", 
                                border:"1px solid rgba(100,100,100,0.9)",
                                paddingLeft:"5px",
                                paddingRight:"5px", 
                                display:"flex",
                                alignItems:"center",
                                height:"20px",
                                margin:"2px"
                            }}>
                                <div style={{  
                                    height:"15px",
                                    display:"flex",
                                    alignItems:"center",
                                    padding:"4px", 
                                    color:"rgba(100,100,100,0.9)",
                                    fontWeight:500    
                                }}> 
                                    {uppercase(tag)} 
                                </div> 
                                <div  
                                    style={{padding:"2px",alignItems:"center",cursor:"pointer",display:"flex"}} 
                                    onClick={this.onRemoveTag(tag)}
                                >
                                    <Clear style={{color:"rgba(100,100,100,0.9)",height:20,width:20}}/>
                                </div>
                            </div>
                        </div> 
                )   
            } 
        </div>
        <div     
            onClick={this.onReset}
            style={{ 
              display:"flex",
              alignItems:"center",
              cursor:"pointer",
              marginTop:"30px", 
              justifyContent:"center",
              width: "30%",
              height:"20px", 
              borderRadius:"5px",
              paddingLeft:"25px",
              paddingRight:"25px",
              paddingTop:"5px", 
              paddingBottom:"5px",
              backgroundColor:"rgba(100,100,100,0.9)"   
            }}  
        >   
            <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px"}}>  
                Reset
            </div>   
        </div> 
        </div>
    }   
}

 


interface CalendarEventsSettingsProps{
    dispatch?:Function,
    calendars:Calendar[], 
    hideHint:boolean, 
    showCalendarEvents:boolean
    limit:Date
} // extends Store{}

interface CalendarEventsSettingsState{ url:string, error:string }

@connect(
    (store:Store,props) : CalendarEventsSettingsProps => ({
        calendars:store.calendars, 
        hideHint:store.hideHint, 
        limit:store.limit,
        showCalendarEvents:store.showCalendarEvents
    }), 
    attachDispatchToProps,
    null, 
    {
        areStatesEqual:(nextStore:Store, prevStore:Store) => {
           return all(
               identity,
               [
                 equals(nextStore.calendars,prevStore.calendars), 
                 nextStore.hideHint===prevStore.hideHint, 
                 equals(nextStore.limit,prevStore.limit), 
                 nextStore.showCalendarEvents===prevStore.showCalendarEvents
               ]
           )           
        }
    }   
)   
class CalendarEventsSettings extends Component<CalendarEventsSettingsProps,CalendarEventsSettingsState>{

    constructor(props){
        super(props);
        this.state = { url:'', error:'' };
    }

    onError = (e) => globalErrorHandler(e)

    onUrlChange = (e) => this.setState({url:e.target.value, error:''})

    onUrlSubmit = (e) => {
        let { url, error } = this.state;
        let { calendars, dispatch, hideHint, limit } = this.props;
        let urls = calendars.map( c => c.url );
 
        if(isEmpty(url)){ return null }
        if(contains(url)(urls)){ return null }

        let extension = last(url.split('.'));

        if(extension!=='ics'){    
           this.setState({error:"Incorrect format. Only (*.ics) extension supported."});
           return null;    
        }  
        
        if(url.startsWith("webcal")){
           url = url.replace("webcal","http");
        }
         
        getIcalData(limit,url) 
        .then( 
            (data:IcalData) => { 
                let {calendar,events,error} = data;
                
                if(not(hideHint)){ 
                    updateConfig({hideHint:true})
                    .then( 
                        config => {
                            this.props.dispatch({type:"updateConfig",load:config}) 
                        } 
                    ) 
                };  
                
                if(not(isNil(error))){  
                   this.setState({error:error.message}, () => this.onError(error));
                   return null;  
                };
                
                let load : Calendar = {
                    url, 
                    active:true,
                    _id:generateId(),
                    name:calendar.name, 
                    description:calendar.description,
                    timezone:calendar.timezone,
                    events,
                    type:"calendar"
                }; 

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
    );     
   

    onShowCalendarEvents = debounce(
        (e) => {
            let {showCalendarEvents,dispatch} = this.props;
            dispatch({type:"showCalendarEvents", load:!showCalendarEvents});
        },
        50
    ); 
    
    
    onRemoveCalendar = (_id:string) => (e) => this.props.dispatch({ type:"removeCalendar", load:_id });
      

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
                                  <Checkbox checked={calendar.active} onClick={() => this.onItemCheck(calendar)}/>   
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
                                    <Clear style={{color:"rgba(100,100,100,0.5)",height:30,width:30}}/> 
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
                            placeholder="Input Calendar URL (*.ics)" 
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


let selectFolder = () => requestFromMain<any>(
    'selectFolder',
    [],
    (event,folder) => folder
);


let selectJsonDatabase = () => requestFromMain<any>(
    'selectJsonDatabase',
    [],
    (event,folder) => folder
);



let closeClonedWindows = () => new Promise(resolve => {  
    ipcRenderer.removeAllListeners("closeClonedWindows");  
    ipcRenderer.send("closeClonedWindows");
    ipcRenderer.on("closeClonedWindows", (event) => resolve());
})

 

let correctFormat = (json:any) : boolean => not(isNil(json.database));

let removeRev = (item) => {
    delete item["_rev"];
    item["_rev"] = undefined;
    return item;
};

interface AdvancedProps{
    dispatch?:Function,
    clone:boolean,
    shouldSendStatistics,
    moveCompletedItemsToLogbook:any,
    groupTodos:boolean,
    disableReminder:boolean,
    todos:Todo[]
} 

interface AdvancedState{ 
    showPopup:boolean,
    importMessage:string,
    exportMessage:string,
    updateStatus:string 
    importPath:string, 
    exportPath:string
}   
  
@connect(
    (store,props) : AdvancedProps => ({ 
        clone:store.clone,
        shouldSendStatistics:store.shouldSendStatistics,
        moveCompletedItemsToLogbook:store.moveCompletedItemsToLogbook,
        groupTodos:store.groupTodos,
        disableReminder:store.disableReminder,
        todos:store.todos,
    }), 
    attachDispatchToProps
)  
class AdvancedSettings extends Component<AdvancedProps,AdvancedState>{
    limit:number;
    
    constructor(props){
        super(props);  
        this.limit = 1000000;

        this.state = {   
           showPopup:false,
           importMessage:'',
           exportMessage:'', 
           importPath:'',   
           exportPath:'',
           updateStatus:`Current version is : .`
        };       
    };
    
    componentDidMount(){
        requestFromMain<any>('getVersion',[],(event,version) => version)
        .then(
            (version) => this.setState({updateStatus:`Current version is : ${version}.`}) 
        )
    } 

    updateState = (state) => new Promise( resolve => this.setState(state, () => resolve()) );


    replaceDatabaseObjects = (json) : Promise<void> => {
        let { todos, projects, areas, calendars, limit } = json.database;
        let remRev = compose(map(removeRev), defaultTo([])); 

        return  closeClonedWindows()
                .then(() => destroyEverything()) 
                .then(() => initDB())
                .then(() => Promise.all([  
                    addTodos(this.onError, remRev(todos)),      
                    addProjects(this.onError, remRev(projects)), 
                    addAreas(this.onError, remRev(areas)),
                    addCalendars(this.onError, remRev(calendars))
                ])) 
                .then(() => getData(limit,this.onError,this.limit))  
                .then(
                    ({projects, areas, todos, calendars}) => this.setData({
                        projects:defaultTo([], projects), 
                        areas:defaultTo([], areas), 
                        todos:defaultTo([], todos), 
                        calendars:defaultTo([], calendars)
                    }) 
                )
    };  



    setData = ({projects, areas, todos, calendars}) : void => {
        let {clone,dispatch} = this.props;
        
        if(clone){ return } 
    
        dispatch({type:"setProjects", load:projects});
        dispatch({type:"setAreas", load:areas});
        dispatch({type:"setTodos", load:todos});
        dispatch({type:"setCalendars", load:calendars});
    };

    

    onError = (error) => globalErrorHandler(error);



    export = (folder:string) => {   
        if(isNil(folder)){ return }
        let to:string = path.resolve(folder, `${keyFromDate(new Date())}-${uniqid()}.json`);
        return getDatabaseObjects(this.onError,this.limit)
        .then(
            ([calendars,projects,areas,todos]) => requestFromMain<any>(
                'saveDatabase',
                [ { database : { todos, projects, areas, calendars } }, to ],
                (event) => event
            )
        )       
    };    



    backup = () => {
        return getDatabaseObjects(this.onError,this.limit)
        .then(
            ([calendars,projects,areas,todos]) => requestFromMain<any>(
                'saveBackup',
                [ { database : { todos, projects, areas, calendars } } ],
                (event, to) => to
            ) 
        )   
    };



    import = (pathToFile:string) => {  
        if(isNil(pathToFile)){ return }
        let place = '';
        let {dispatch} = this.props;
        let message = (place) => `Data was successfully imported. You can find a backup of your old database in ${place}.`;

        dispatch({type:"selectedCategory",load:"inbox"});
        
        return  requestFromMain<any>("readJsonFile",[pathToFile],(event,json) => json)  
                .then((json) => {  
                    if(correctFormat(json)){ 
                        this.backup()
                        .then( (to) => this.setState({importMessage:'Loading...'}, () => { place=to; }) )
                        .then( () => this.replaceDatabaseObjects(json) )
                        .then( () => this.setState({importMessage:message(place)}) )
                    }else{
                        this.setState({importMessage:"Incorrect format."})
                    }   
                })   
    };
    
     

    onSelectExportFolder = () => { 
        selectFolder()
        .then(
           (folder:string) => {
                if(isNil(folder) || isEmpty(folder)){ return }
                
                this
                .updateState({exportPath:folder})
                .then(() => this.export(folder))
                .then(({err,to}) => {
                    if(isNil(err)){ 
                       this.updateState({exportMessage:`Data was successfully exported to ${folder}.`})
                    }
                })
            }
        )
    }; 



    onSelectImportFile = () => {  
        selectJsonDatabase()
        .then(
            (path:string) => {
                if(isNil(path) || isEmpty(path)){ return }
                
                this.updateState({importPath:path}).then(() => this.import(path))
            }
        )
    };
      


    checkUpdates = debounce(() => { 
        let {dispatch} = this.props;
        this.setState({updateStatus:"Loading..."});
        checkForUpdates()  
        .then( 
           (updateCheckResult:UpdateCheckResult) => {  

            requestFromMain<any>('getVersion',[],(event,version) => version)
            .then(
                (version) => {
                    console.log('current version is :',version);
                    let {updateInfo} = updateCheckResult;
                    let currentAppVersion = version; 
                    let canUpdate = isNewVersion(currentAppVersion,updateInfo.version);
    
                    if(canUpdate){  
                       dispatch({type:"openSettings", load:false});  
                       dispatch({type:"showUpdatesNotification", load:true});
                    }else{   
                       this.setState({updateStatus:"Latest version is already installed."}); 
                    }; 
                }
            )
            }       
        );  
    },100); 
     

    shouldSendStatistics = debounce(() => {
        let {shouldSendStatistics,dispatch} = this.props;
        updateConfig({shouldSendStatistics:!shouldSendStatistics})
        .then(
            config => this.props.dispatch({type:"updateConfig",load:config}) 
        )
    },50);


    shouldGroup = debounce(() => {
        let {groupTodos,dispatch} = this.props;
        updateConfig({groupTodos:!groupTodos})
        .then(
            config => this.props.dispatch({type:"updateConfig",load:config}) 
        )
    },50);


    moveCompletedTo = (event) => {
        let {dispatch, todos} = this.props;
        updateConfig({moveCompletedItemsToLogbook:event.target.value})
        .then((config) => {
            let load = todos.map((todo:Todo) => {
                if(isNil(todo.completedSet)){ return todo; }
                let completedWhen = getCompletedWhen(config.moveCompletedItemsToLogbook,todo.completedSet);
                return {...todo, completedWhen};
            }); 

            dispatch({type:"updateConfig",load:config}); 
            dispatch({type:"updateTodos",load});
        }); 
    }; 


    disableReminder = (event) => 
        updateConfig({disableReminder:not(this.props.disableReminder)})
        .then(
            (config) => {
                this.props.dispatch({type:"updateConfig",load:config}); 

                requestFromMain<any>( 
                    'autolaunch',
                    [
                        config.enableShortcutForQuickEntry || 
                        not(config.disableReminder)
                    ],
                    (event) => event
                );

                requestFromMain<any>('updateNotificationConfig',[config],(event) => event);
            } 
        );
    

    render(){   
        let {importPath, exportPath, updateStatus, exportMessage, importMessage} = this.state;
        let {shouldSendStatistics,moveCompletedItemsToLogbook,groupTodos,disableReminder} = this.props;
        let buttonStyle = {      
            display:"flex",
            alignItems:"center",
            cursor:"pointer",
            marginRight:"15px", 
            justifyContent:"center",
            width: "40px", 
            height:"20px", 
            borderRadius:"5px", 
            paddingLeft:"25px",
            paddingRight:"25px",
            paddingTop:"5px", 
            paddingBottom:"5px",
            backgroundColor:"rgba(81, 144, 247, 1)"  
        } as any;

        return <div style={{paddingTop:"25px",width:"90%",paddingLeft:"25px"}}>
            <div style={{display:"flex",flexDirection:"column",justifyContent:"space-around",height:"90%"}}> 
           
            <div style={{display:"flex", alignItems:"center"}}>
                <Checkbox checked={shouldSendStatistics} onClick={this.shouldSendStatistics}/>
                <div style={{paddingLeft:"10px"}}>Send anonymous usage statistics</div>
            </div> 

            <div style={{display:"flex", alignItems:"center"}}>
                <Checkbox checked={not(disableReminder)} onClick={this.disableReminder}/>
                <div style={{paddingLeft:"10px"}}>Enable reminder</div>
            </div> 

            <div style={{display:"flex",alignItems:"center",width:"80%"}}>
                <Checkbox checked={groupTodos} onClick={this.shouldGroup}/>
                <div style={{paddingLeft:"10px"}}>Group tasks by project or area</div>
            </div> 

            <div style={{display:"flex", width:"100%"}}>
                <div style={{ 
                    display:"flex", alignItems:"flex-end",  
                    flexDirection:"column", justifyContent:"space-around", 
                    fontSize:"14px" 
                }}>      
                    <div>Move completed items to Logbook:</div>
                </div>  
                <div style={{display:"flex",alignItems:"flex-start",flexDirection:"column",justifyContent:"space-around"}}> 
                    <div style={{paddingLeft:"20px"}}>     
                        <select 
                            style={{backgroundColor:"white",outline:"none",borderRadius:"4px"}}  
                            name="text" 
                            value={moveCompletedItemsToLogbook}
                            onChange={this.moveCompletedTo}  
                        >  
                            <option value="immediately">Immediately</option> 
                            <option value="min">After 5 min</option> 
                            <option value="hour">After 1 hour</option> 
                            <option value="day">After 1 day</option> 
                        </select>   
                    </div>
                </div>
            </div>
            <div style={{height:"1px",width:"100%",borderBottom:"1px solid rgb(200,200,200)"}}></div>   
            <div style={{display:"flex",fontSize:"15px",alignItems:"center",fontWeight:500,color:"black",userSelect:"none"}}>       
                Database Backup  
            </div> 
            { 
                isEmpty(importMessage) ? null :
                <div style={{
                    display: "flex",
                    fontSize: "14px",
                    alignItems: "center",
                    fontWeight: 500,
                    color: importMessage==="Incorrect format." ? "red" : "green",
                    userSelect: "none"
                }}>       
                    {importMessage}  
                </div>  
            } 
            { 
                isEmpty(exportMessage) ? null :
                <div style={{
                    display: "flex",
                    fontSize: "14px",
                    alignItems: "center",
                    fontWeight: 500,
                    color: "green",
                    userSelect: "none"
                }}>       
                    {exportMessage}  
                </div>  
            }   
                <div style={{display:"flex"}}>
                    <div onClick={this.onSelectImportFile} style={buttonStyle}>   
                        <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px"}}>  
                            Import
                        </div>   
                    </div> 
                    <div onClick={this.onSelectExportFolder} style={buttonStyle}>   
                        <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px"}}>  
                            Export 
                        </div>   
                    </div> 
                </div> 

                <div style={{height:"1px",width:"100%",borderBottom:"1px solid rgb(200,200,200)"}}></div>  
                <div style={{display:"flex", justifyContent:"space-between"}}>
                    { 
                        isEmpty(updateStatus) ? null :
                        <div style={{
                            display: "flex",
                            fontSize: "14px",
                            alignItems: "center",
                            fontWeight: 500,
                            color: "green",
                            userSelect: "none"
                        }}>     
                            {updateStatus} 
                        </div>  
                    }     
                    <div     
                        onClick={this.checkUpdates} 
                        style={{     
                            display:"flex",
                            alignItems:"center",
                            cursor:"pointer",
                            justifyContent:"center",
                            height:"20px",
                            width:"100px",
                            borderRadius:"5px",
                            paddingLeft:"25px",
                            paddingRight:"25px",
                            paddingTop:"5px", 
                            paddingBottom:"5px",
                            backgroundColor:"rgba(81, 144, 247, 1)"  
                        }}   
                    >   
                        <div style={{color:"white",whiteSpace:"nowrap",fontSize:"16px"}}>  
                            Check for updates
                        </div>    
                    </div>    
                </div> 

                <div style={{cursor: "pointer", height: "30px"}}>
                    {   
                        <div     
                            onClick={(e) => {
                                this.props.dispatch({type:"openSettings",load:false});
                                this.props.dispatch({type:"showLicense",load:true});
                            }}
                            style={{
                                width:"100%",
                                height:"30px",
                                fontSize:"14px",
                                display:"flex",
                                alignItems:"center",
                                cursor:"pointer",  
                                color:"rgba(100, 100, 100, 0.6)"
                            }}
                        >     
                            Open Source libraries used at tasklist
                        </div>
                    }
                </div>
            </div>
        </div>    
    }   
}  