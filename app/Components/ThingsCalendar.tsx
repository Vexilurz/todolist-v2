import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, uniq,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, 
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, 
    groupBy, concat, flatten, toPairs, adjust, prepend 
} from 'ramda';
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react";  
import Star from 'material-ui/svg-icons/toggle/star';
import Plus from 'material-ui/svg-icons/content/add';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Moon from 'material-ui/svg-icons/image/brightness-3';
import DayPicker from 'react-day-picker';  
import Popover from 'material-ui/Popover';
import Button from 'material-ui-next/Button';
import BusinessCase from 'material-ui/svg-icons/places/business-center';  

interface ThingsCalendarProps{ 
    close : Function,
    open : boolean,
    origin : any,  
    anchorEl : HTMLElement,
    point : any,
    simple : boolean,   
    onDayClick? : (day: Date, modifiers: Object, e : any) => void,
    onSomedayClick? : (e:any) => void, 
    onTodayClick? : (e:any) => void, 
    onThisEveningClick? : (e:any) => void, 
    onAddReminderClick? : (e:any) => void,
    onClear : (e:any) => void
}   
     

 


export class ThingsCalendar extends Component<ThingsCalendarProps,{}>{

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
            <div style={{  
                display:"flex",
                flexDirection:"column", 
                backgroundColor:"rgb(39,43,53)", 
                borderRadius: "20px"
            }}>    
                
                {      
                    this.props.simple ? null :  
                    <div style={{
                        color: "dimgray",
                        textAlign: "center",
                        padding: "5px",
                        cursor: "default"
                    }}> 
                        When
                    </div>
                }
 
 
                {
                    this.props.simple ? null :
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
                }
                {    
                    this.props.simple ? null :
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
                }

    
                <div style={{
                    display: "flex",
                    justifyContent: "center" 
                }}> 
                    <DayPicker onDayClick={this.props.onDayClick} />
                </div> 
 
                {    
                    this.props.simple ? null :
                    <div className="hoverDateType"
                    onClick={this.props.onSomedayClick}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        color: "white",
                        cursor: "default",
                        marginLeft: "20px",
                        marginRight: "20px",
                        WebkitUserSelect:"none"  
                    }}>
                        <BusinessCase style={{  
                            color:"burlywood", 
                            width:"15px",
                            height:"15px",
                            cursor:"default"  
                        }}/>
                        <div style={{marginLeft:"15px"}}>Someday</div>
                    </div>
                }
 
                {
                    this.props.simple ? null :
                    <div style={{display:"flex",alignItems:"center"}}>  
                        <IconButton   
                        onClick = {this.props.onAddReminderClick} 
                        iconStyle={{    
                            color:"rgb(79, 79, 79)",
                            width:"25px",
                            height:"25px"    
                        }} 
                        >        
                            <Plus /> 
                        </IconButton>
                        <div style={{
                            fontFamily: "sans-serif",
                            fontWeight: 600, 
                            color: "rgba(100,100,100,0.7)",
                            fontSize:"15px",  
                            cursor: "default",
                            WebkitUserSelect: "none" 
                        }}> 
                            Add reminder 
                        </div>    
                    </div> 
                }
 
                <Button 
                onClick={this.props.onClear}
                raised dense style={{
                    margin:"15px", 
                    color:"white", 
                    backgroundColor:"rgb(49,53,63)"
                }}>
                    Clear
                </Button>
            </div>  
        </Popover> 
    } 

}
