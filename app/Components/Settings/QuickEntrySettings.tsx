
import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { Calendar, Area, Project, Todo, section } from '../../types';
import { ipcRenderer } from 'electron';
import { not } from 'ramda';
import { Checkbox } from '../TodoInput/TodoInput';


interface QuickEntrySettingsProps{
    enableShortcutForQuickEntry:boolean, 
    disableReminder:boolean,
    quickEntrySavesTo:string,
    defaultTags:string[], 
    dispatch:Function
} 



interface QuickEntrySettingsState{}



export class QuickEntrySettings extends Component<QuickEntrySettingsProps,QuickEntrySettingsState>{

    constructor(props){ super(props) }



    enableQuickEntry = () => {
        let next = !this.props.enableShortcutForQuickEntry;
        let enableReminder = !this.props.disableReminder;
        let shouldAutolaunch = next || enableReminder;

        ipcRenderer.send('autolaunch', shouldAutolaunch);
        ipcRenderer.send('toggleShortcut', next,'Ctrl+Alt+T');

        this.props.dispatch({type:"enableShortcutForQuickEntry", load:next});
    };



    quickEntrySavesTo = (event) => {
        ipcRenderer.send(
            'updateQuickEntryConfig', 
            { quickEntrySavesTo:event.target.value, defaultTags:this.props.defaultTags }
        );
        this.props.dispatch({type:"quickEntrySavesTo", load:event.target.value}); 
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
};

