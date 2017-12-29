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
import { insideTargetArea } from '../utils';
import { isNil } from 'ramda';
import { isDate } from 'util';
 

interface DateCalendarProps{ 
    close : Function,
    open : boolean,
    origin : any,  
    anchorEl : HTMLElement,
    rootRef : HTMLElement, 
    attachedDate : Date,
    reminder : Date, 
    point : any,  
    onDayClick : (day:Date, modifiers:Object, e:any) => void,
    onSomedayClick : (e:any) => void,  
    onTodayClick : (e:any) => void, 
    onThisEveningClick : (e:any) => void, 
    onAddReminderClick : (reminder:Date) => void,
    onClear : (e:any) => void 
}   
       
 

interface DateCalendarState{}
  


export class DateCalendar extends Component<DateCalendarProps,DateCalendarState>{

    ref:HTMLElement; 
    
    constructor(props){
        super(props);
    }


    componentDidMount(){ 
        document.body.addEventListener("click", this.onOutsideClick);
    }


    componentWillUnmount(){
        document.body.removeEventListener("click", this.onOutsideClick);
    } 
  

    onOutsideClick = (e) => {
        if(this.ref===null || this.ref===undefined)
            return; 

        let x = e.pageX;
        let y = e.pageY; 

        let inside = insideTargetArea(this.ref,x,y);
    
        if(!inside){
            this.props.close(); 
        }   
    }   
               
 
     
    render(){    

        return <Popover 
            open={this.props.open}
            scrollableContainer={this.props.rootRef}
            anchorEl={this.props.anchorEl}
            style={{
                backgroundColor:"rgba(0,0,0,0)",
                background:"rgba(0,0,0,0)",  
                borderRadius:"20px",  
                transform:`scale(0.8,0.8)` 
            }}   
            useLayerForClickAway={false} 
            onRequestClose={() => this.props.close()}
            anchorOrigin={this.props.origin} 
            targetOrigin={this.props.point}
        >    
            <div 
            ref={(e) => { this.ref=e; }}  
            onClick={(e) => {e.stopPropagation();}}  
            style={{     
                display:"flex",
                flexDirection:"column",  
                backgroundColor:"rgb(39,43,53)",  
                borderRadius: "20px",
                overflowX:"hidden"  
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
                    <div style={{marginLeft:"15px"}}>
                        Today
                    </div>
                </div>

                <div  
                    className="hoverDateType"
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
                    <div style={{marginLeft:"15px"}}>
                        This Evening
                    </div>
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
                    reminder={this.props.reminder}
                /> 
            </div>   
        </Popover> 
    } 
}  

 




interface CalendarFooterState{ 
    openReminderInput:boolean,
    time:any,
    timeSet:boolean   
} 
 
interface CalendarFooterProps{   
    onAddReminder:(reminder : Date) => void,
    attachedDate:Date,
    reminder:Date, 
    onClear:(e:any) => void 
}
  
class CalendarFooter extends Component<CalendarFooterProps,CalendarFooterState>{

    constructor(props){ 
        super(props);
        this.state = {
           timeSet:false,
           openReminderInput:false,
           time:this.props.attachedDate ? 
                this.props.attachedDate.toLocaleTimeString().replace(/[a-z]/ig, "").trim() : 
                ''
        };     
    }  
 

    onTimeInput = (e) => { 
        let time : string = e.target.value.replace(/[a-z]/ig, "").trim();
        this.setState({time, timeSet:true});
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
                                <div 
                                onClick={() => this.setState({time:''})}
                                style={{ 
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center", 
                                    justifyContent: "center"
                                }}>
                                    <Clear style={{color:"rgb(192, 192, 192)"}}/>
                                </div> 
                            </div>   
                        </div>
                    </div> 
                    <div style={{display:"flex"}}>  
                        <div>    
                            <RaisedButton
                                onClick={() => {
                                    this.setState({
                                        timeSet:false, 
                                        time:this.props.attachedDate ? 
                                             this.props.attachedDate
                                                 .toLocaleTimeString()
                                                 .replace(/[a-z]/ig, "")
                                                 .trim() : '',  
                                        openReminderInput:false
                                    }) 
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
                                Clear 
                            </RaisedButton>
                        </div>
                        <div>   
                            <RaisedButton  
                                disabled={!this.state.timeSet}
                                onClick={() => {
                                    let time = this.state.time; 
                                    let hours : number = Number(time.split(':')[0]); 
                                    let minutes : number = Number(time.split(':')[1]); 

                                    if(!isDate(this.props.attachedDate))
                                       throw new Error(`attachedDate is not of type Date. ${this.props.attachedDate}. Done.`); 
                                       
                                    let date = new Date(this.props.attachedDate.getTime());
                                    date.setHours(hours);
                                    date.setMinutes(minutes);
                                    this.props.onAddReminder(date); 
                                    this.setState({openReminderInput:false, timeSet:false}); 
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
                    {
                        this.props.reminder ? null :    
                        <AddReminderButton 
                            openReminderInput={(e) => this.setState({openReminderInput:true})}
                            disabled={isNil(this.props.attachedDate)}
                        />
                    }
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
 
 
 
interface AddReminderButtonProps{
    openReminderInput:Function,
    disable:boolean 
}


class AddReminderButton extends Component<any,{}>{

    constructor(props){
        super(props);
    }

 
    render(){
        return <div  
            className={this.props.disabled ? "" : "hoverDateType"}
            onClick = {(e) => { 
                this.props.disabled ? null : 
                this.props.openReminderInput(e);
            }} 
            style={{
                display:"flex", 
                cursor:"default", 
                alignItems:"center",    
                marginLeft:"15px", 
                marginRight:"15px"  
            }}  
        >       
            <Plus  style={{       
                color: this.props.disabled ? "rgba(70,70,70,0.5)" : "white",    
                width:"25px", 
                height:"25px"     
            }}/>   
            <div style={{
                fontFamily: "sans-serif",
                fontWeight: 600, 
                color: this.props.disabled ? "rgba(70,70,70,0.5)" : "white",  
                fontSize: "15px",  
                cursor: "default",
                WebkitUserSelect: "none"   
            }}> 
                Add reminder  
            </div>      
        </div>  
    }

} 
 

interface DeadlineCalendarProps{   
    close : Function,
    open : boolean,
    origin : any,  
    anchorEl : HTMLElement,
    point : any,    
    onDayClick : (day: Date, modifiers: Object, e : any) => void,
    onClear : (e:any) => void,
    rootRef : HTMLElement 
}   
 
interface DeadlineCalendarState{} 
  
export class DeadlineCalendar extends Component<DeadlineCalendarProps,DeadlineCalendarState>{
    ref:HTMLElement;
    constructor(props){
        super(props);
    }   


    componentDidMount(){ 
        document.body.addEventListener("click", this.onOutsideClick);
    }


    componentWillUnmount(){
        document.body.removeEventListener("click", this.onOutsideClick);
    } 
  

    onOutsideClick = (e) => {
        if(this.ref===null || this.ref===undefined)
            return; 

        let x = e.pageX;
        let y = e.pageY; 

        let inside = insideTargetArea(this.ref,x,y);
    
        if(!inside){
            this.props.close(); 
        }   
    }   
               
     
    render(){  
        return <Popover 
            scrollableContainer={this.props.rootRef}
            useLayerForClickAway={false} 
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
            ref={(e) => { this.ref=e; }}   
            style={{     
                display:"flex",
                overflowX:"hidden",
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

 