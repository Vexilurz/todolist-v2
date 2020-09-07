import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { Component } from "react";  
// import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import Star from 'material-ui/svg-icons/toggle/star';
import Plus from 'material-ui/svg-icons/content/add';
import Minus from 'material-ui/svg-icons/content/remove';
import Alert from 'material-ui/svg-icons/alert/add-alert';
import Moon from 'material-ui/svg-icons/image/brightness-3';
import DayPicker from 'react-day-picker';  
import Popover from 'material-ui/Popover';
import BusinessCase from 'material-ui/svg-icons/content/archive';  
import RaisedButton from 'material-ui/RaisedButton'; 
import Clear from 'material-ui/svg-icons/content/clear'; 
import { isNil, not, merge, ifElse } from 'ramda';
import { Subscription } from 'rxjs/Rx';
import { Observable } from 'rxjs/Rx';
import { insideTargetArea } from '../utils/insideTargetArea';
import { isFunction, isDate } from '../utils/isSomething';
import { timeOfTheDay } from '../utils/time';
import TimeInput from 'react-keyboard-time-input';



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
    onRemoveReminderClick : () => void,
    onClear : (e:any) => void,
    onRepeatTodo? : (top:number,left:number) => void
}            
 

 
interface DateCalendarState{}
  


export class DateCalendar extends Component<DateCalendarProps,DateCalendarState>{
    subscriptions:Subscription[];
    ref:HTMLElement; 
    
    constructor(props){
        super(props);
        this.subscriptions = [];
    }



    componentDidMount(){ 
        let click = Observable
                    .fromEvent(document.body,"click")
                    .subscribe(this.onOutsideClick); 
         
        this.subscriptions.push(click);
    }



    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = []; 
    } 
  


    onOutsideClick = (e) => {
        if(isNil(this.ref)){ return }

        let x = e.pageX;
        let y = e.pageY; 

        let inside = insideTargetArea(null,this.ref,x,y);
    
        if(not(inside)){
           this.props.close(); 
        }   
    };   
        
    
     
    render(){    
        let {onRepeatTodo, close} = this.props;
        let hideRepeatButton = not(isFunction(onRepeatTodo));

        return <Popover 
            open={this.props.open}
            scrollableContainer={this.props.rootRef}
            useLayerForClickAway={false} 
            anchorEl={this.props.anchorEl} 
            style={{
                backgroundColor:"rgba(0,0,0,0)",
                background:"rgba(0,0,0,0)",  
                zIndex:40005,
                borderRadius:"20px",  
                transform:`scale(0.8,0.8)` 
            }}   
            canAutoPosition={true}
            onRequestClose={() => this.props.close()}
            anchorOrigin={this.props.origin}           
            targetOrigin={this.props.point}
        >    
            <div 
                ref={(e) => { this.ref=e; }}  
                onClick={(e) => {
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                }}  
                style={{     
                    display:"flex",
                    flexDirection:"column",  
                    backgroundColor:"white", //"rgb(39,43,53)",  
                    borderRadius:"20px",
                    overflowX:"hidden"  
                }}
            >    
                <div style={{
                    color: "black",
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
                        color: "black",
                        marginLeft: "20px",
                        marginRight: "20px",
                        marginBottom:"2px",
                        padding:"2px",
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
                        color: "black",
                        cursor: "default",
                        marginLeft: "20px",
                        padding:"2px",
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
                <div style={{display:"flex",justifyContent:"center"}}> 
                    <DayPicker 
                        {
                            ...ifElse(
                                () => isDate(this.props.attachedDate),
                                merge({selectedDays:[this.props.attachedDate]}),
                                merge({})
                            )({onDayClick:this.props.onDayClick})
                        }
                    />
                </div> 
                <div  
                    className="hoverDateType"
                    onClick={this.props.onSomedayClick}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        color: "black",
                        cursor: "default",
                        marginLeft: "20px",
                        marginRight: "20px",
                        WebkitUserSelect:"none",
                        padding:"2px"  
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
                {    
                    hideRepeatButton ? null :    
                    <div  
                        className="hoverDateType"
                        onClick={() => { 
                            let {top, left} = this.ref.getBoundingClientRect();
                            this.props.close(); 
                            this.props.onRepeatTodo(top,left); 
                        }}  
                        style={{
                            display:"flex",
                            alignItems:"center",
                            color:"black",
                            cursor:"default",
                            marginLeft:"15px",
                            marginRight:"15px",
                            padding:"2px",
                            userSelect:"none", 
                            marginBottom:"2px"
                        }}
                    >
                        {/* <Refresh style={{  
                            paddingLeft:"2px",
                            color:"black", 
                            width:"18px", 
                            height:"18px", 
                            cursor:"default"  
                        }}/> */}
                        <div style={{marginLeft:"13px"}}> 
                            Recurring task
                        </div>
                    </div> 
                } 
                <CalendarFooter 
                    onAddReminder={this.props.onAddReminderClick}
                    onRemoveReminder={this.props.onRemoveReminderClick}
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
    onRemoveReminder:() => void,
    attachedDate:Date,
    reminder:Date, 
    onClear:(e:any) => void 
}
  


export class CalendarFooter extends Component<CalendarFooterProps,CalendarFooterState>{

    constructor(props){ 
        super(props);

        this.state = {
           timeSet:true,
           openReminderInput:false,
           time://this.props.attachedDate ? 
                //this.props.attachedDate.toLocaleTimeString().replace(/[a-z]/ig, "").trim() : 
                '12:00' 
        };     
    }  

    

    componentDidMount(){
        let {attachedDate,reminder} = this.props;
        if(isDate(reminder)){
           this.setState({openReminderInput:false}); 
        }
    }

    

    componentDidUpdate(){
        let timeInput : any = document.getElementsByClassName("TimeInput-input")[0];
        if(timeInput){
           timeInput.focus();       
        }
    }



    componentWillReceiveProps(nextProps){
        let {attachedDate,reminder} = nextProps;
        if(isDate(reminder)){
           this.setState({openReminderInput:false}); 
        }
    } 

    

    render(){
        let {openReminderInput} = this.state;
        let {reminder,attachedDate} = this.props;
        
        return <div>
            {  
            not(openReminderInput) ? null : 
            <div>
                <div style={{  
                    display:"flex", 
                    alignItems:"center", 
                    justifyContent:"center",
                    flexDirection:"column" 
                }}>
                    <div style={{
                        display:"flex",
                        width:"95%",
                        marginLeft:"22px",
                        marginTop:"5px",
                        marginRight:"15px",
                        alignItems:"center",
                        justifyContent:"space-around"
                    }}> 
                        <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                            <div style={{zoom:"0.8",position:"relative"}}>
                                <Alert style={{color:"rgb(157, 157, 157)",WebkitUserSelect:"none"}}/>
                                <div style={{
                                    width:"8px",
                                    height:"8px",
                                    top:"8px",
                                    left:"8px",
                                    position:"absolute",
                                    backgroundColor:"rgb(157, 157, 157)" 
                                }}> 
                                </div>
                            </div>
                            <div style={{  
                                color:"black",
                                userSelect:"none",
                                cursor:"default",
                                paddingBottom:"5px",
                                paddingLeft:"11px"
                            }}>  
                                Reminder
                            </div>
                        </div> 
                        <div style={{
                            padding:"2px",
                            position:"relative", 
                            display:"flex", 
                            alignItems:"center", 
                            backgroundColor:"rgb(157, 157, 157)",
                            borderRadius:"5px"   
                        }}>
                            {/* <TimeInput
                                key={`time-input`}
                                onChange={(time) => this.setState({time,timeSet:true})}
                                value={this.state.time} 
                            /> */}
                            <div  
                            onClick={() => this.setState({time:'12:00', timeSet:false})}
                            style={{ 
                              cursor:"pointer",
                              display:"flex",
                              alignItems:"center", 
                              justifyContent:"center"
                            }}>
                                <Clear style={{color:"white"}}/>
                            </div> 
                        </div> 
                    </div> 
                    <div style={{display:"flex"}}>  
                        <div>    
                            <RaisedButton
                                onClick={() => 
                                    this.setState({
                                        timeSet:false, 
                                        time:'12:00', 
                                        openReminderInput:false
                                    })
                                }
                                style={{
                                    margin:"15px",  
                                    color:"white", 
                                    backgroundColor:"rgb(157, 157, 157)"
                                }} 
                                buttonStyle={{  
                                    color:"white",  
                                    backgroundColor:"rgb(157, 157, 157)"
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

                                    let date = new Date(this.props.attachedDate.getTime());
                                    date.setHours(hours);
                                    date.setMinutes(minutes); 
                                    this.props.onAddReminder(date); 
                                    this.setState({openReminderInput:false, timeSet:false}); 
                                }}
                                style={{
                                    margin:"15px",    
                                    color:"white", 
                                    backgroundColor:"rgb(157, 157, 157)"
                                }} 
                                buttonStyle={{  
                                    color:"white",  
                                    backgroundColor:"rgb(157, 157, 157)"
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
                openReminderInput ? null :
                <div>  
                    {
                        isDate(reminder) ? 
                        <ClearReminderButton 
                            clearReminder={(e) => this.props.onRemoveReminder()}
                            reminder={reminder}
                            disable={isNil(this.props.reminder)}
                        />
                        :     
                        <AddReminderButton 
                            openReminderInput={(e) => this.setState({openReminderInput:true})}
                            disable={isNil(this.props.attachedDate)}
                        />
                    }
                    <div style={{width:"90%"}}>
                        <RaisedButton
                            onClick={this.props.onClear}
                            style={{
                                width:"100%", 
                                margin:"15px",  
                                color:"white",  
                                backgroundColor:"rgb(157, 157, 157)"
                            }} 
                            buttonStyle={{color:"white", backgroundColor:"rgb(157, 157, 157)"}}
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



class AddReminderButton extends Component<AddReminderButtonProps,{}>{

    constructor(props){
        super(props);
    }

    render(){
        let {disable,openReminderInput} = this.props;

        return <div  
            className={disable ? "" : "hoverDateType"}
            onClick={(e) => disable ? null : openReminderInput(e)} 
            style={{
                display:"flex",
                cursor:"default",
                alignItems:"center",
                marginLeft:"15px",
                marginRight:"15px",
                padding:"1px"
            }}   
        >       
            <Plus style={{       
                color:disable ? "rgba(70,70,70,0.5)" : "",    
                width:"25px", 
                height:"25px"     
            }}/>   
            <div style={{
                paddingLeft:"10px",
                fontFamily:"sans-serif",
                color:disable ? "rgba(70,70,70,0.5)" : "black",  
                fontSize:"15px",  
                cursor:"default",
                WebkitUserSelect:"none"  
            }}> 
                Add reminder  
            </div>      
        </div>  
    }
} 
 


interface ClearReminderButtonProps{
    clearReminder:Function,
    reminder:Date,
    disable:boolean
}



class ClearReminderButton extends Component<ClearReminderButtonProps,{}>{

    constructor(props){
        super(props);
    }

    render(){
        let {disable,clearReminder,reminder} = this.props;

        return <div  
            className={disable ? "" : "hoverDateType"}
            onClick={(e) => disable ? null : clearReminder()} 
            style={{
                display:"flex", 
                cursor:"default", 
                alignItems:"center",    
                marginLeft:"15px", 
                marginRight:"15px"  
            }}  
        >       
            <Minus style={{       
                color:disable?"rgba(70,70,70,0.5)":"",    
                width:"25px", 
                height:"25px"     
            }}/>   
            <div style={{
                paddingLeft:"10px",
                fontFamily:"sans-serif",
                color:disable?"rgba(70,70,70,0.5)":"black",  
                fontSize:"15px",  
                cursor:"default",
                WebkitUserSelect:"none"   
            }}> 
                Remove reminder at {timeOfTheDay(reminder)}
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
    deadline : Date,
    onClear : (e:any) => void,
    rootRef : HTMLElement 
} 



interface DeadlineCalendarState{} 



export class DeadlineCalendar extends Component<DeadlineCalendarProps,DeadlineCalendarState>{
    subscriptions:Subscription[];
    ref:HTMLElement; 
    
    constructor(props){
        super(props);
        this.subscriptions = [];
    }


    componentDidMount(){ 
        let click = Observable
                    .fromEvent(document.body,"click")
                    .subscribe(this.onOutsideClick); 
         
        this.subscriptions.push(click);
    }


    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = []; 
    } 
  

    onOutsideClick = (e) => {
        if(isNil(this.ref)){ return }

        let x = e.pageX;
        let y = e.pageY; 

        let inside = insideTargetArea(null,this.ref,x,y);
    
        if(not(inside)){
           this.props.close(); 
        }   
    };   
               
      
    render(){  
        return <Popover 
            scrollableContainer={this.props.rootRef}
            useLayerForClickAway={false} 
            open={this.props.open}
            anchorEl={this.props.anchorEl}
            canAutoPosition={true} 
            style={{
                backgroundColor:"rgba(0,0,0,0)",
                background:"rgba(0,0,0,0)",  
                zIndex:40005, 
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
                backgroundColor:"white",//"rgb(39,43,53)", 
                borderRadius: "20px"
            }}>    
                <div style={{color:"black",textAlign:"center",padding:"5px",cursor:"default"}}> 
                    Deadline
                </div>
                <div style={{display:"flex",justifyContent:"center"}}> 
                    <DayPicker 
                        {
                            ...ifElse(
                                () => isDate(this.props.deadline),
                                merge({selectedDays:[this.props.deadline]}),
                                merge({})
                            )({onDayClick:this.props.onDayClick})
                        }
                    />
                </div> 
                <RaisedButton
                    onClick={this.props.onClear}
                    style={{
                       margin:"15px",
                       color:"white",
                       backgroundColor:"rgb(157, 157, 157)"
                    }} 
                    buttonStyle={{ 
                       color:"white",
                       backgroundColor:"rgb(157, 157, 157)"
                    }}
                >
                    Clear 
                </RaisedButton>
            </div>  
        </Popover> 
    } 
}  
