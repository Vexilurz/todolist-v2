import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import Clear from 'material-ui/svg-icons/content/clear';
import VerifiedUserIcon from 'material-ui/svg-icons/hardware/security';
import QuickEntry from 'material-ui/svg-icons/content/add-box';  
import CalendarEvents from 'material-ui/svg-icons/action/date-range';  
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import { section, Calendar, Todo, ImportActionLoad, License } from '../../types';
import { Section } from './section';
import Advanced from 'material-ui/svg-icons/action/settings-applications'; 
import { cond } from 'ramda';
import { QuickEntrySettings } from './QuickEntrySettings';
import { CalendarEventsSettings } from './CalendarEventsSettings';
import { AdvancedSettings } from './AdvancedSettings';
import { TagsSettings } from './TagsSettings';
import { LicenseManagement } from './LicenseManagement';
// import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import { SyncSettings } from './SyncSettings';

 
export interface SettingsProps{
    hideHint:boolean,
    selectedSettingsSection:section,
    secretKey:string,
    import:ImportActionLoad,

    enableShortcutForQuickEntry:boolean,
    quickEntrySavesTo:string,

    calendars:Calendar[],
    showCalendarEvents:boolean,
    limit:Date,
    lastImport:Date,

    shouldSendStatistics:boolean,
    moveCompletedItemsToLogbook:string,
    groupTodos:boolean,
    disableReminder:boolean,

    todos:Todo[],
    defaultTags:string[],

    email:string,
    sync:boolean, 
    lastSync:Date,

    license:License,
    dispatch:Function
}


interface SettingsState{}


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
                minHeight:"82px",   
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
                     {/* <Section
                        onClick={() => dispatch({type:"selectedSettingsSection", load:'Sync'})} 
                        icon={<Refresh style={{color:"rgba(10,10,10,0.8)", height:20, width:20}}/>}
                        name={'Sync'} 
                        selected={selectedSettingsSection==='Sync'} 
                    />  */}
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
                    <Section
                        onClick={() => dispatch({type:"selectedSettingsSection", load:'LicenseManagement'})} 
                        icon={<VerifiedUserIcon style={{color:"rgba(100,100,100,0.8)", height:20, width:20}}/>}
                        name={'License Management'} 
                        selected={selectedSettingsSection==='LicenseManagement'} 
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
                        () => <QuickEntrySettings 
                            enableShortcutForQuickEntry={this.props.enableShortcutForQuickEntry} 
                            quickEntrySavesTo={this.props.quickEntrySavesTo} 
                            disableReminder={this.props.disableReminder}
                            defaultTags={this.props.defaultTags}
                            dispatch={this.props.dispatch} 
                        />
                    ], 
                    [ 
                        (selectedSettingsSection:string) : boolean => selectedSettingsSection==="CalendarEvents",  
                        () => <CalendarEventsSettings 
                            calendars={this.props.calendars}
                            hideHint={this.props.hideHint}
                            showCalendarEvents={this.props.showCalendarEvents}
                            limit={this.props.limit}
                            dispatch={this.props.dispatch}
                        />
                    ], 
                    [  
                        (selectedSettingsSection:string) : boolean => selectedSettingsSection==="Advanced",  
                        () => <AdvancedSettings 
                            limit={this.props.limit}
                            import={this.props.import}
                            secretKey={this.props.secretKey}
                            shouldSendStatistics={this.props.shouldSendStatistics}
                            moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                            groupTodos={this.props.groupTodos}
                            lastImport={this.props.lastImport}
                            disableReminder={this.props.disableReminder}
                            enableShortcutForQuickEntry={this.props.enableShortcutForQuickEntry}
                            todos={this.props.todos}
                            dispatch={this.props.dispatch}
                        />
                    ],
                    [ 
                        (selectedSettingsSection:string) : boolean => selectedSettingsSection==="Tags",  
                        () => <TagsSettings 
                            todos={this.props.todos}
                            defaultTags={this.props.defaultTags}
                            dispatch={this.props.dispatch}
                        />
                    ],
                    [ 
                        (selectedSettingsSection:string) : boolean => selectedSettingsSection==="LicenseManagement", 
                        () => <LicenseManagement
                            license={this.props.license}
                            dispatch={this.props.dispatch as any}
                        />
                    ],
                    // [ 
                    //     (selectedSettingsSection:string) : boolean => selectedSettingsSection==="Sync", 
                    //     () => <SyncSettings
                    //         dispatch={this.props.dispatch as any}
                    //         secretKey={this.props.secretKey}
                    //         email={this.props.email}
                    //         sync={this.props.sync}
                    //         lastSync={this.props.lastSync}
                    //     />
                    // ],
                    [    
                        () => true, 
                        () => null   
                    ]
                ])(selectedSettingsSection) 
            }   
            </div>
        </div>
    } 
};





