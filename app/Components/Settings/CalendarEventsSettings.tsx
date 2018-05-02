
import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { Calendar, Area, Project, Todo, section } from '../../types';
import { not, ifElse, when } from 'ramda';
import { Checkbox } from '../TodoInput/TodoInput';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { isEmpty, contains, last } from 'ramda';
import { getIcalData } from '../Calendar';
import { generateId } from '../../utils/generateId';
import Clear from 'material-ui/svg-icons/content/clear';
import { isNotNil } from '../../utils/isSomething';


interface CalendarEventsSettingsProps{
    calendars:Calendar[], 
    hideHint:boolean, 
    showCalendarEvents:boolean
    limit:Date,
    dispatch:Function
} 


interface CalendarEventsSettingsState{ url:string, error:string }


export class CalendarEventsSettings extends Component<CalendarEventsSettingsProps,CalendarEventsSettingsState>{

    constructor(props){
        super(props);
        this.state={ url:'', error:'' };
    }



    onError = (e) => globalErrorHandler(e);



    onUrlChange = (e) => this.setState({url:e.target.value, error:''});



    onUrlSubmit = (e) => {
        let { url, error } = this.state;
        let urls = this.props.calendars.map( c => c.url );
 
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
         
        return getIcalData(this.props.limit,url).then( 
            ifElse(
                ({calendar,events,error}) => isNotNil(error),
                ({calendar,events,error}) => this.setState({error:error.message}, () => this.onError(error)),
                ({calendar,events,error}) => this.props.dispatch({
                    type:'addCalendar', 
                    load:{
                        url, 
                        active:true,
                        _id:generateId(),
                        name:calendar.name, 
                        description:calendar.description,
                        timezone:calendar.timezone,
                        events,
                        type:"calendar"
                    }
                })
            )
        )
        .then(
            when(
                () => not(this.props.hideHint), 
                () => this.props.dispatch({type:"hideHint",load:true}) 
            )
        )
        .then(
            () => this.setState({url:'', error:''})
        ) 
    };
    

 
    onItemCheck = (calendar:Calendar) : void => this.props.dispatch({
        type:"updateCalendar", 
        load:{...calendar, type:"calendar", active:not(calendar.active)}
    });   
   
 

    onShowCalendarEvents = (e) => this.props.dispatch({
        type:"showCalendarEvents", 
        load:not(this.props.showCalendarEvents)
    });
   

    
    onRemoveCalendar = (_id:string) => (e) => this.props.dispatch({type:"removeCalendar", load:_id});
      


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
};