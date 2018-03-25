import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react";  
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import Star from 'material-ui/svg-icons/toggle/star';
import Plus from 'material-ui/svg-icons/content/add';
import Minus from 'material-ui/svg-icons/content/remove';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Alert from 'material-ui/svg-icons/alert/add-alert';
import Moon from 'material-ui/svg-icons/image/brightness-3';
import DayPicker from 'react-day-picker';  
import Popover from 'material-ui/Popover';
import BusinessCase from 'material-ui/svg-icons/content/archive';  
import RaisedButton from 'material-ui/RaisedButton';
import { Category, Store, Todo } from './../types';  
import Clear from 'material-ui/svg-icons/content/clear'; 
import { isNil, not } from 'ramda';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import ResizeObserver from 'resize-observer-polyfill';
import { Observable } from 'rxjs/Rx';
import { insideTargetArea } from '../utils/insideTargetArea';
import { isFunction, isDate, isToday } from '../utils/isSomething';
import { timeOfTheDay, getTime, setTime } from '../utils/time';
const moment = require("moment"); 
import { Provider, connect } from "react-redux";
import TimeInput from 'react-keyboard-time-input';
import { attachDispatchToProps } from '../utils/utils';
import { CalendarFooter } from './ThingsCalendar';


interface WhenCalendarProps extends Store{}
interface WhenCalendarState{
    todo:Todo
}


@connect((store,props) => ({...store, ...props}), attachDispatchToProps) 
export class WhenCalendar extends Component<WhenCalendarProps,WhenCalendarState>{
    ref:HTMLElement;  
    subscriptions:Subscription[];  

    constructor(props){
        super(props);

        this.subscriptions = [];

        let {whenTodo} = this.props;
    
        if(isNil(whenTodo)){ return }

        let todo = this.props.todos.find( t => t._id===whenTodo._id );

        this.state = {todo};
    }   



    componentDidMount(){  
        this.subscriptions.push( 
            Observable
            .fromEvent(window, "click")
            .subscribe(this.onOutsideClick) 
        ); 

        let {whenTodo} = this.props;
    
        if(isNil(whenTodo)){ return }

        let todo = this.props.todos.find( t => t._id===whenTodo._id );
       
        if(isNil(todo)){ return }

        this.setState({todo});
    }   



    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = [];
    } 



    componentWillReceiveProps(nextProps:WhenCalendarProps){
    
        let {
            showWhenCalendar, 
            whenTodo,
            whenCalendarPopupX, 
            whenCalendarPopupY,
            showRightClickMenu
        } = nextProps;
    
        if(isNil(whenTodo)){ return }

        let todo = nextProps.todos.find( t => t._id===whenTodo._id );
       
        if(isNil(todo)){ return }

        this.setState({todo}); 
    }



    onOutsideClick = (e) => {
        if(isNil(this.ref)){ return }

        let x = e.pageX;
        let y = e.pageY; 

        let inside = insideTargetArea(null,this.ref,x,y);

        if(not(inside)){ this.close(); }   
    };   
 


    close = () => {
        this.props.dispatch({
            type: "openWhenCalendar",
            load: {
                showWhenCalendar : false, 
                whenTodo : null,
                whenCalendarPopupX : 0, 
                whenCalendarPopupY : 0
            }
        }); 
    }; 
      


    onTodayClick = (e) => {
        e.stopPropagation();

        if(isNil(this.state.todo)){ return }


        let attachedDate = new Date();
        let reminder = this.state.todo.reminder;

        if(isDate(reminder)){
            let time = getTime(reminder);
            attachedDate = setTime(attachedDate,time); 
            reminder = new Date(attachedDate.getTime());
        } 

        this.props.dispatch({ 
            type:"updateTodo", 
            load:{ 
                ...this.state.todo, 
                attachedDate,
                reminder
            } 
        });

        this.close();
    };



    onThisEveningClick = (e) => {
        e.stopPropagation();

        if(isNil(this.state.todo)){ return }

        let attachedDate = new Date();
        let reminder = this.state.todo.reminder;

        if(isDate(reminder)){
           let time = getTime(reminder);
           attachedDate = setTime(attachedDate,time); 
           reminder = new Date(attachedDate.getTime());
        }

        this.props.dispatch({ 
            type:"updateTodo", 
            load:{ 
                ...this.state.todo, 
                category:"evening",
                attachedDate,
                reminder
            } 
        });

        this.close();
    };



    onDayClick = (day:Date, modifiers:Object, e:any) => {
        e.stopPropagation(); 

        if(isNil(this.state.todo)){ return }

        let attachedDate = new Date(day.getTime());
        let reminder = this.state.todo.reminder;
        let category = this.state.todo.category;

        if(isDate(reminder)){
           let time = getTime(reminder);
           attachedDate = setTime(attachedDate,time); 
           reminder = new Date(attachedDate.getTime());
        }

        this.props.dispatch({ 
            type:"updateTodo", 
            load:{  
                ...this.state.todo, 
                category:isToday(attachedDate) ? "today" : category,
                attachedDate,
                reminder
            } 
        });

        this.close();
    };
 


    onSomedayClick = (e) => {
        e.stopPropagation();

        if(isNil(this.state.todo)){ return }

        this.props.dispatch({ 
            type:"updateTodo", 
            load:{ 
                ...this.state.todo, 
                category:"someday",
                deadline:null,
                attachedDate:null
            } 
        });

        this.close();
    };



    onRepeatTodo = () => {   
        let {
            showWhenCalendar, 
            whenCalendarPopupX, 
            whenCalendarPopupY,
            showRightClickMenu
        } = this.props;

        if(isNil(this.state.todo)){ return }

        this.props.dispatch({
            type : "openRepeatPopup",
            load : {  
                showRepeatPopup : true, 
                repeatTodo : {...this.state.todo}, 
                repeatPopupX : whenCalendarPopupX,    
                repeatPopupY : whenCalendarPopupY
            }
        });
        this.close();
    };



    onAddReminderClick = (reminder:Date) => {
        if(isNil(this.state.todo)){ return }
        
        this.props.dispatch({ 
            type:"updateTodo", 
            load:{ 
                ...this.state.todo, 
                attachedDate:reminder,
                reminder
            } 
        });
    };



    onRemoveReminderClick = () => {
        if(isNil(this.state.todo)){ return }

        this.props.dispatch({ 
            type:"updateTodoById", 
            load:{id:this.state.todo._id,props:{reminder:null}}
        });
    };



    onClear = (e) => {
        if(isNil(this.state.todo)){ return }
        
        this.props.dispatch({ 
            type:"updateTodo", 
            load:{ 
                ...this.state.todo, 
                attachedDate:null,
                reminder:null
            } 
        });

        this.close();
    };



    render(){
        let hideRepeatButton = false;
        let {
            showWhenCalendar, 
            whenCalendarPopupX, 
            whenCalendarPopupY,
            showRightClickMenu
        } = this.props;

        let offsetX = 0.1*213.6;
        let offsetY = 0.1*(hideRepeatButton ? 368.8 : 391.2);

        if(isNil(this.state.todo)){ return }
    
        let { attachedDate, reminder } = this.state.todo; 
 
        return not(showWhenCalendar) ? null : 
        <div 
            ref={ e => {this.ref =e ;}}
            onClick = {e => {e.stopPropagation(); e.preventDefault();}}  
            style={{ 
                WebkitUserSelect:"none", 
                position:"absolute", 
                transform:"scale(0.8,0.8)",
                left:(whenCalendarPopupX-offsetX)+"px",
                top:(whenCalendarPopupY-offsetY)+"px",
                zIndex:30000  
            }}                  
        >    
            <div 
                onClick={(e) => {
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                }}  
                style={{    
                    display:"flex",
                    flexDirection:"column",  
                    backgroundColor:"rgb(39,43,53)",  
                    borderRadius:"20px", 
                    overflowX:"hidden"  
                }}
            >    
                <div style={{
                    color: "white",
                    textAlign: "center",
                    padding: "5px",
                    cursor: "default"
                }}> 
                    When
                </div>

                <div className="hoverDateType"
                    onClick={this.onTodayClick}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        color: "white",
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
                    onClick={this.onThisEveningClick}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        color: "white",
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
                    <DayPicker onDayClick={this.onDayClick}/>
                </div> 
                <div  
                    className="hoverDateType"
                    onClick={this.onSomedayClick}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        color: "white",
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
                        onClick={() => this.onRepeatTodo()}  
                        style={{
                            display:"flex",
                            alignItems:"center",
                            color:"white",
                            cursor:"default",
                            marginLeft:"15px",
                            marginRight:"15px",
                            padding:"2px",
                            userSelect:"none", 
                            marginBottom:"2px"
                        }}
                    >
                        <Refresh style={{  
                            paddingLeft:"2px",
                            color:"white", 
                            width:"18px", 
                            height:"18px", 
                            cursor:"default"  
                        }}/>
                        <div style={{marginLeft:"13px"}}> 
                            Recurring task
                        </div>
                    </div> 
                } 
                <CalendarFooter 
                    onAddReminder={this.onAddReminderClick}
                    onRemoveReminder={this.onRemoveReminderClick}
                    onClear={this.onClear}
                    attachedDate={attachedDate}
                    reminder={reminder}
                /> 
            </div> 
        </div>
    }
}