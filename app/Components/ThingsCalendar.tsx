import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react";  
import Star from 'material-ui/svg-icons/toggle/star';
import Plus from 'material-ui/svg-icons/content/add';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Alert from 'material-ui/svg-icons/alert/add-alert';
import Moon from 'material-ui/svg-icons/image/brightness-3';
import DayPicker from 'react-day-picker';  
import Popover from 'material-ui/Popover';
import BusinessCase from 'material-ui/svg-icons/places/business-center';  
import RaisedButton from 'material-ui/RaisedButton';
import { Category } from './MainContainer';  
import Clear from 'material-ui/svg-icons/content/clear'; 
 

interface ThingsCalendarProps{ 
    close : Function,
    open : boolean,
    origin : any,  
    anchorEl : HTMLElement,
    attachedDate : Date,
    point : any,  
    onDayClick : (day:Date, modifiers:Object, e:any) => void,
    onSomedayClick : (e:any) => void,  
    onTodayClick : (e:any) => void, 
    onThisEveningClick : (e:any) => void, 
    onAddReminderClick : (reminder:Date) => void,
    onClear : (e:any) => void 
}   
       
 

interface ThingsCalendarState{}
 
 

export class ThingsCalendar extends Component<ThingsCalendarProps,ThingsCalendarState>{

    constructor(props){
        super(props);
    }   
     
    
 
    render(){  
        return <Popover 
            open={this.props.open}
            anchorEl={this.props.anchorEl}
            style={{ 
                backgroundColor:"rgba(0,0,0,0)",
                background:"rgba(0,0,0,0)",  
                borderRadius:"20px",  
                transform:`scale(0.8,0.8)`
            }}   
            onRequestClose={() => this.props.close()}
            anchorOrigin={this.props.origin} 
            targetOrigin={this.props.point}
        >   
            <div 
            onClick={(e) => {e.stopPropagation();}}  
            style={{     
                display:"flex",
                flexDirection:"column",  
                backgroundColor:"rgb(39,43,53)", 
                borderRadius: "20px"
            }}>    
                
                <div style={{
                    color: "dimgray",
                    textAlign: "center",
                    padding: "5px",
                    cursor: "default"
                }}> 
                    When
                </div>

                <div className="hoverDateType"
                    onClick={this.props.onTodayClick}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        color: "white",
                        marginLeft: "20px",
                        marginRight: "20px",
                        cursor: "default",
                        WebkitUserSelect:"none"  
                    }}  
                >
                    <Star style={{
                        color:"gold", 
                        width:"15px",
                        height:"15px",
                        cursor:"default" 
                    }}/> 
                    <div style={{marginLeft:"15px"}}>Today</div>
                </div>

                <div className="hoverDateType"
                onClick={this.props.onThisEveningClick}
                style={{
                    display: "flex",
                    alignItems: "center",
                    color: "white",
                    cursor: "default",
                    marginLeft: "20px",
                    marginRight: "20px",
                    WebkitUserSelect:"none"  
                }}>
                    <Moon style={{ 
                        transform:"rotate(145deg)", 
                        color:"rgb(192,192,192)", 
                        width:"15px",
                        height:"15px",
                        cursor:"default" 
                    }}/>
                    <div style={{marginLeft:"15px"}}>This Evening</div>
                </div>

                <div style={{
                    display: "flex",
                    justifyContent: "center" 
                }}> 
                    <DayPicker onDayClick={this.props.onDayClick} />
                </div> 
                    
                <div  
                    className="hoverDateType"
                    onClick={this.props.onSomedayClick}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        color: "white",
                        cursor: "default",
                        marginLeft: "20px",
                        marginRight: "20px",
                        WebkitUserSelect:"none"  
                    }}
                >
                    <BusinessCase style={{  
                        color:"burlywood", 
                        width:"15px",
                        height:"15px",
                        cursor:"default"  
                    }}/>
                    <div style={{marginLeft:"15px"}}>
                        Someday
                    </div>
                </div>
                  
                <div style={{
                    border:"1px solid rgba(200,200,200,0.1)",
                    marginTop:"10px", 
                    width:"100%",   
                    marginBottom:"10px"
                }}>
                </div>   
    
                <CalendarFooter 
                    onAddReminder={this.props.onAddReminderClick}
                    attachedDate={this.props.attachedDate}
                    onClear={this.props.onClear}
                /> 
            </div>  
        </Popover> 
    } 
}  

 




interface CalendarFooterState{ 
    openReminderInput : boolean,
    time:any  
} 
 
interface CalendarFooterProps{   
    onAddReminder : (reminder : Date) => void,
    attachedDate : Date,
    onClear : (e:any) => void 
}
  
class CalendarFooter extends Component<CalendarFooterProps,CalendarFooterState>{

    constructor(props){ 
        super(props);
        this.state = {
           openReminderInput:false,
           time:null 
        };  
    }


    onTimeInput = (e) => { 
        console.log(e, "onTimeInput"); 
    }


    render(){
        return <div>
            { 
            !this.state.openReminderInput ? null :
            <div>
                <div style={{
                    display:"flex", 
                    alignItems:"center", 
                    justifyContent:"center",
                    flexDirection:"column" 
                }}>
                    <div style={{
                        display:"flex",
                        width: "100%", 
                        alignItems: "center",
                        justifyContent: "space-around" 
                    }}> 
 
    

                        <div style={{  
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <div style={{position: "relative"}}>
                                <Alert style={{ 
                                    color:"rgb(192, 192, 192)",
                                    WebkitUserSelect: "none"  
                                }}/>
                                <div style={{
                                    width:"8px",
                                    height:"8px",
                                    top:"8px",
                                    left:"8px",
                                    position:"absolute",
                                    backgroundColor:"rgb(192, 192, 192)" 
                                }}> 
                                </div>
                            </div>
                            <div style={{ 
                                color:"rgb(192, 192, 192)",
                                WebkitUserSelect: "none", 
                                cursor:"default", 
                                paddingBottom: "5px",
                                paddingLeft: "5px"   
                            }}>  
                                Reminder
                            </div>
                        </div>   
                        <div>    
                            <div style={{
                                padding: "2px",
                                position:"relative", 
                                display:"flex", 
                                alignItems:"center", 
                                backgroundColor: "rgb(87, 87, 87)",
                                borderRadius: "5px"   
                            }}>
                                <input  
                                    style={{    
                                        outline:"none",
                                        border:"none",
                                        width:"100%",
                                        color:"aliceblue",
                                        fontSize:"18px",
                                        backgroundColor:"rgb(87, 87, 87)",
                                        caretColor:"cornflowerblue"  
                                    }}    
                                    placeholder=""    
                                    type="time"  
                                    name="time"  
                                    value={this.state.time}  
                                    onChange={this.onTimeInput}
                                />   
                                <div style={{
                                    position: "absolute",
                                    right: "0px", 
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center" 
                                }}>
                                    <Clear style={{color:"rgb(192, 192, 192)"}} />
                                </div> 
                            </div>   
                        </div>
                    </div> 
                    <div style={{display:"flex"}}>  
                        <div>    
                            <RaisedButton
                                onClick={this.props.onClear}
                                style={{
                                    margin:"15px",  
                                    color:"white", 
                                    backgroundColor:"rgb(87, 87, 87)"
                                }} 
                                buttonStyle={{  
                                    color:"white",  
                                    backgroundColor:"rgb(87, 87, 87)"
                                }}
                            > 
                                Clear 
                            </RaisedButton>
                        </div>
                        <div>  
                            <RaisedButton 
                                onClick={() => {
                                    this.props.onAddReminder
                                }}
                                style={{
                                    margin:"15px",  
                                    color:"white", 
                                    backgroundColor:"rgb(87, 87, 87)"
                                }} 
                                buttonStyle={{  
                                    color:"white",  
                                    backgroundColor:"rgb(87, 87, 87)"
                                }}
                            >
                                Done 
                            </RaisedButton>
                        </div>
                    </div>
                </div>
            </div>
            }
            {  
                this.state.openReminderInput ? null :
                <div> 
                    <div  
                    className="hoverDateType"
                    onClick = {(e) => this.setState({openReminderInput:true})} 
                    style={{
                        display:"flex", 
                        cursor:"default", 
                        alignItems:"center",
                        paddingLeft:"15px", 
                        paddingRight:"15px"  
                    }}>     
                        <Plus style={{       
                            color: "white",    
                            width:"25px",
                            height:"25px"    
                        }} /> 
                        <div style={{
                            fontFamily: "sans-serif",
                            fontWeight: 600, 
                            color: "white",  
                            fontSize: "15px",  
                            cursor: "default",
                            WebkitUserSelect: "none" 
                        }}> 
                            Add reminder  
                        </div>      
                    </div>  
                    <div style={{width:"90%"}}>
                    <RaisedButton
                        onClick={this.props.onClear}
                        style={{
                            width:"100%", 
                            margin:"15px",  
                            color:"white",  
                            backgroundColor:"rgb(87, 87, 87)"
                        }} 
                        buttonStyle={{  
                            color:"white",  
                            backgroundColor:"rgb(87, 87, 87)"
                        }}
                    >
                        Clear 
                    </RaisedButton>
                    </div>
                </div>
            }
        </div>
    } 
}

 
 

















interface ThingsCalendarSimpleProps{  
    close : Function,
    open : boolean,
    origin : any,  
    anchorEl : HTMLElement,
    point : any,    
    onDayClick : (day: Date, modifiers: Object, e : any) => void,
    onClear : (e:any) => void
}   

interface ThingsCalendarSimpleState{}
 
export class ThingsCalendarSimple extends Component<ThingsCalendarSimpleProps,ThingsCalendarSimpleState>{

    constructor(props){
        super(props);
    }   
     
    render(){  
        return <Popover 
            open={this.props.open}
            anchorEl={this.props.anchorEl}
            style={{
                backgroundColor:"rgba(0,0,0,0)",
                background:"rgba(0,0,0,0)",  
                borderRadius:"20px",  
                transform:`scale(0.8,0.8)`
            }}   
            onRequestClose={() => this.props.close()}
            anchorOrigin={this.props.origin} 
            targetOrigin={this.props.point}
        >   
            <div 
            onClick={(e) => {e.stopPropagation();}}  
            style={{     
                display:"flex",
                flexDirection:"column",  
                backgroundColor:"rgb(39,43,53)", 
                borderRadius: "20px"
            }}>    
                <div style={{
                    color: "dimgray",
                    textAlign: "center",
                    padding: "5px",
                    cursor: "default"
                }}> 
                    Deadline
                </div>
                <div style={{
                    display: "flex",
                    justifyContent: "center" 
                }}> 
                    <DayPicker onDayClick={this.props.onDayClick} />
                </div> 
                <RaisedButton
                    onClick={this.props.onClear}
                    style={{
                        margin:"15px",  
                        color:"white", 
                        backgroundColor:"rgb(49,53,63)"
                    }} 
                    buttonStyle={{  
                        color:"white",  
                        backgroundColor:"rgb(49,53,63)"
                    }}
                >
                    Clear 
                </RaisedButton>
            </div>  
        </Popover> 
    } 
}  

 