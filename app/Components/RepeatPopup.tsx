import './../assets/styles.css';  
import './../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import ClearArrow from 'material-ui/svg-icons/content/backspace';   
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
 import NewProjectIcon from 'material-ui/svg-icons/image/timelapse';
import Popover from 'material-ui/Popover';
import {  
    attachDispatchToProps, getMonthName, dateToYearMonthDay, getRangeDays, getRangeRepetitions, 
    daysInMonth, getRangeMonthUntilDate, getRangeMonthRepetitions, getRangeYearUntilDate, 
    getRangeYearRepetitions, dateToDateInputValue, dateInputUpperLimit
} from '../utils/utils'; 
import { Todo, removeTodo, addTodo,  Project, Area, LayoutItem, Group } from '../database';
import { Store } from '../app'; 
import { ChecklistItem } from './TodoInput/TodoChecklist'; 
import { Category, filter } from './MainContainer';
import { remove, isNil, not, isEmpty, last } from 'ramda';
let uniqid = require("uniqid");    
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import FlatButton from 'material-ui/FlatButton';
import { generateId } from '../utils/generateId';
import { isDate, isTodo } from '../utils/isSomething';
import { assert } from '../utils/assert';
import { isDev } from '../utils/isDev';
import { insideTargetArea } from '../utils/insideTargetArea';

const never : number = 100;


let limit = (down:number,up:number) => 
            (value:number) => value<down ? down :
                              value>up ? up :
                              value;

                              
let limitInput = limit(1,1000); 


let limitDate = (date:Date) : Date => {
    let end = new Date(2050, 12, 0);
    let start = new Date();

    return date.getTime() > end.getTime() ? end :
           date.getTime() < start.getTime() ? start :
           date;  
}


let selectedDatesToTodos = (todo:Todo, data:{dates:Date[],group:Group}) : Todo[] => {
    let { dates, group } = data;

    return dates.map( 
        (date:Date,index:number) : Todo => {
            let withoutRev : any = {...todo, _rev:undefined};
            delete withoutRev["_rev"];

            return { 
              ...withoutRev, 
              deadline : null, 
              category : "upcoming",
              _id : generateId(), 
              attachedDate : date,  
              group : {...group},
              priority:index,       
              reminder:null,  
              created:new Date(),
              deleted:undefined, 
              completed:undefined,
              checked:false
            } as Todo
        }
    )
}
   

let getStartDate = (todo:Todo) : Date => 
    isNil(todo.attachedDate) ? new Date() :
    isDate(todo.attachedDate) ? todo.attachedDate :
    new Date();


let handleDay = (options:RepeatPopupState, todo:Todo) : {dates:Date[],group:Group} => {

    let {repeatEveryN,endsDate,endsAfter,selectedOption} = options;       
     
    let groupId : string = generateId();
    let start : Date = getStartDate(todo);
 
    switch(selectedOption){
        case "on":
            return {
                dates : getRangeDays(start,endsDate,repeatEveryN),
                group : { type:selectedOption, _id:groupId }
            };
        case "after": 
            return {
                dates:getRangeRepetitions(start, endsAfter, repeatEveryN),
                group:{ type:selectedOption, _id:groupId }
            }; 
        case "never":
            return {
                dates:getRangeRepetitions(start, never, repeatEveryN),
                group:{ type:selectedOption, _id:groupId }
            };
    }  
}


let handleWeek = (options:RepeatPopupState, todo:Todo) : {dates:Date[],group:Group} => {
    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }

    let {repeatEveryN, endsDate, endsAfter, selectedOption} = options;       
    
    let groupId : string = generateId();
    let start : Date = getStartDate(todo);

    switch(selectedOption){
        case "on":
            return {
                dates:getRangeDays( start, endsDate, repeatEveryN * 7 ),
                group:{type:selectedOption, _id:groupId}
            };
        case "after":
            return {
                dates:getRangeRepetitions(start, endsAfter, repeatEveryN * 7),
                group:{type:selectedOption, _id:groupId}
            }; 
        case "never":
            return {
                dates:getRangeRepetitions(start, never, repeatEveryN * 7),
                group:{type:selectedOption, _id:groupId}
            };  
    }
}


let handleMonth = (options:RepeatPopupState, todo:Todo) : {dates:Date[],group:Group} => {

    let {repeatEveryN,endsDate,endsAfter,selectedOption} = options;       
    
    let groupId : string = generateId();
    let start : Date = getStartDate(todo);

    switch(selectedOption){  
        case "on": 
            return {
                dates:getRangeMonthUntilDate(start, endsDate, repeatEveryN),
                group:{type:selectedOption, _id:groupId}
            };
        case "after":
            return {
                dates:getRangeMonthRepetitions(start, endsAfter, repeatEveryN),
                group:{type:selectedOption, _id:groupId}
            };
        case "never":
            return {
                dates:getRangeMonthRepetitions(start, never, repeatEveryN),
                group:{type:selectedOption, _id:groupId}
            };
    } 
} 
  

let handleYear = (options:RepeatPopupState, todo:Todo) : {dates:Date[],group:Group} => {

    let {repeatEveryN,endsDate,endsAfter,selectedOption} = options;       
    
    let groupId : string = generateId();
    let start : Date = getStartDate(todo); 

    switch(selectedOption){
        case 'on':
            return {
                dates:getRangeYearUntilDate(start,endsDate,repeatEveryN),
                group:{type:selectedOption, _id:groupId}
            };
        case 'after':
            return {
                dates:getRangeYearRepetitions(start,endsAfter,repeatEveryN),
                group:{type:selectedOption, _id:groupId} 
            };
        case 'never': 
            return {
                dates:getRangeYearRepetitions(start,never,repeatEveryN),
                group:{type:selectedOption, _id:groupId} 
            };
    }
}
 

export let repeat = (options:RepeatPopupState, todo:Todo) : Todo[] => {

    assert(isTodo(todo), 'todo is not of type Todo. repeat.');
    
    let { repeatEveryInterval } = options;     

    switch(repeatEveryInterval){
        case "day":
            return selectedDatesToTodos(todo, handleDay(options, todo));
        case "week":
            return selectedDatesToTodos(todo, handleWeek(options,todo));
        case "month":
            return selectedDatesToTodos(todo, handleMonth(options,todo));
        case "year":
            return selectedDatesToTodos(todo, handleYear(options,todo));
    }
} 


export let setRepeatedTodos = ({
    dispatch,
    todo, 
    repeatedTodos,
    options,
    limit
}) : void => { 

    if(isEmpty(repeatedTodos)){ return }

    let isBeforeLimit = (limit:Date) => 
                        (todo:Todo) => isNil(todo.attachedDate) ? true : 
                                       todo.attachedDate.getTime() <
                                       limit.getTime();  
 
    let newLastTodo : Todo = repeatedTodos[repeatedTodos.length - 1];

    let oldLastTodoGroup = {
        _id:newLastTodo.group._id,  
        type:newLastTodo.group.type,  
        last:false
    }; 

    let newLastTodoGroup = {
        _id:newLastTodo.group._id,   
        type:newLastTodo.group.type, 
        last:true,
        options
    };
    
    repeatedTodos[repeatedTodos.length - 1] = {...newLastTodo, group:newLastTodoGroup};    
    
    dispatch({
        type:"addTodos", 
        load:filter(repeatedTodos, isBeforeLimit(limit), "setRepeatedTodos")  
    });  
    dispatch({type:"updateTodo", load:{...todo, group:oldLastTodoGroup}}); 
}

    
interface RepeatPopupProps extends Store{}
 

export interface RepeatPopupState{
    repeatEveryN : number,
    repeatEveryInterval : 'week' | 'day' | 'month' | 'year',
    endsDate : Date,
    endsAfter : number,
    selectedOption : 'on' | 'after' | 'never',
    error:string 
}   
 

let oneDayAhead = () : Date => { 

    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;   
    }
      
    return new Date()["addDays"](1);
} 

const initialState : RepeatPopupState = { 
    repeatEveryN:1,
    repeatEveryInterval:'day',
    endsDate:oneDayAhead(),
    endsAfter:1,
    selectedOption:'never',
    error:''
}    

 
@connect((store,props) => ({...store, ...props}), attachDispatchToProps) 
export class RepeatPopup extends Component<RepeatPopupProps,RepeatPopupState>{

    ref:HTMLElement;  
    subscriptions:Subscription[];  

    constructor(props){
        super(props);
        this.subscriptions = [];
        this.state = {...initialState};
    }   

    onDone = (e) => {  
        let { todos, repeatTodo, dispatch, limit } = this.props;
        let todo = { ...repeatTodo};
        let options = { 
            ...this.state,
            endsDate:limitDate(this.state.endsDate)
        }; 
 
        if(!isNil(todo.group)){
            options = todo.group.options ? todo.group.options : this.state;
        }

        let repeatedTodos : Todo[] = repeat(options, todo);  

        setRepeatedTodos({dispatch,todo,repeatedTodos,options,limit});
                
        this.close();   
    }    


    componentDidMount(){  
        let click = Observable  
                    .fromEvent(window, "click")
                    .subscribe(this.onOutsideClick);

        this.subscriptions.push(click); 
    }   


    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = [];
    } 


    onOutsideClick = (e) => {
        if(this.ref===null || this.ref===undefined){ return }

        let x = e.pageX;
        let y = e.pageY; 

        let inside = insideTargetArea(null,this.ref,x,y);

        if(!inside){ this.close(); }   
    }   
 

    close = () => {
        this.props.dispatch({
            type: "openRepeatPopup",
            load: {
                showRepeatPopup : false,
                repeatTodo : null,
                repeatPopupX : 0, 
                repeatPopupY : 0 
            }
        }); 
    } 
      

    allInputsAreValid = () => {
        let {
            repeatEveryN,
            repeatEveryInterval,
            endsDate,
            endsAfter,
            selectedOption
        } = this.state;


        let repeatEveryIntervalValid = repeatEveryInterval==='week' ||
                                       repeatEveryInterval=== 'day' ||
                                       repeatEveryInterval=== 'month' ||
                                       repeatEveryInterval=== 'year';

        let repeatEveryNValid = !isNaN(repeatEveryN) && repeatEveryN>0;

        let now = new Date();

        let endsDateValid = !isNil(endsDate) && isDate(endsDate) && ( endsDate.getTime() > now.getTime() );
        
        let endsAfterValid = !isNaN(endsAfter) && endsAfter>0;

        let selectedOptionValid = selectedOption==='on' || selectedOption==='after' || selectedOption==='never';
               
        let valid = repeatEveryIntervalValid &&
                    repeatEveryNValid &&
                    endsDateValid &&
                    endsAfterValid &&
                    selectedOptionValid; 
          
        return valid;              
    }   


    render(){
        let start = dateToDateInputValue(new Date());
        let end = dateInputUpperLimit();  
        let {repeatEveryN,repeatEveryInterval,endsDate,endsAfter,selectedOption} = this.state; 
        let {showRepeatPopup} = this.props;
 
        return not(showRepeatPopup) ? null : 
        <div 
            onClick = {(e) => {e.stopPropagation(); e.preventDefault();}}  
            ref={ e => {this.ref=e;}}
            style={{
                WebkitUserSelect:"none", 
                position:"absolute",
                left:this.props.repeatPopupX+"px",
                top:this.props.repeatPopupY+"px",
                zIndex:30000  
            }}                 
        >    
        <div style={{
            borderRadius:"10px", 
            cursor: "default",
            boxShadow:"0 0 18px rgba(0,0,0,0.5)", 
            backgroundColor:"white",
            display:"flex", 
            flexDirection:"column", 
            alignItems:"center",
            justifyContent:"flex-start",
            width:"100%",
            height:"100%"
        }}> 
            <div style={{
                padding:"10px",
                height:"250px",
                justifyContent:"space-between",
                display:"flex",
                flexDirection:"column"
            }}>  
            <div    
                style={{
                    fontSize:"18px", 
                    fontWeight:"bold", 
                    color:"black",
                    paddingTop:"10px",
                    paddingBottom:"10px",
                    width:"100%",
                    alignItems:"center",
                    justifyContent:"flex-start"
                }}
            >
                Repeat task
            </div>
 
            <div style={{display:"flex", alignItems:"center"}}>
                <div style={{fontSize:"14px"}}>Repeat every</div>  
                <div style={{width:"50px", paddingLeft:"10px", paddingRight:"10px"}}> 
                    <input   
                        value={String(this.state.repeatEveryN)}  
                        style={{ 
                            outline:"none",   
                            backgroundColor:"rgba(235,235,235,1)",
                            border:"none",
                            textAlign:"center",
                            width:"100%"  
                        }} 
                        min="1"
                        max="1000"
                        onChange={(event) => this.setState({repeatEveryN:limitInput( Number(event.target.value) )})}
                        type="number"  
                    />
                </div>
                <select 
                    style={{backgroundColor:"rgba(235,235,235,1)", border:"none", outline:"none"}}  
                    name="text"
                    value={repeatEveryInterval}
                    onChange={(event) => this.setState({repeatEveryInterval:event.target.value as any})}  
                >  
                    <option value="day"> Day </option> 
                    <option value="week"> Week </option>
                    <option value="month"> Month </option>
                    <option value="year"> Year </option>
                </select>   
            </div> 
            
            <div style={{height:"100px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
                <div style={{fontSize:"14px"}}>Ends</div> 
                {
                    <div style={{display:"flex", alignItems:"center"}}>    
                        <div>
                            <div onClick={(e) => {
                                this.setState({selectedOption:'never', endsAfter:1, endsDate:oneDayAhead()})
                            }}
                                style={{ 
                                    backgroundColor:selectedOption==='never' ? 'rgb(10, 100, 240)' : '',
                                    width:"15px",   
                                    height:"15px", 
                                    borderRadius:"50px", 
                                    display:"flex",
                                    justifyContent:"center",  
                                    position:"relative", 
                                    border:selectedOption==='never' ? '' : "2px solid rgb(10, 100, 240)",
                                    boxSizing:"border-box",
                                    marginRight:"5px",
                                    marginLeft:"5px" 
                                }}    
                            >        
                            </div>  
                        </div> 
                        <div style={{fontSize:"14px"}}>Never</div> 
                    </div> 
                } 
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex", alignItems:"center"}}>     
                        <div>
                            <div    
                                onClick={(e) => this.setState({selectedOption:'on',endsAfter:1})}
                                style={{
                                    backgroundColor:selectedOption==='on' ? 'rgb(10, 100, 240)' : '',
                                    width:"15px",  
                                    height:"15px",
                                    borderRadius:"50px",
                                    display:"flex",
                                    justifyContent:"center",
                                    position:"relative", 
                                    border:selectedOption==='on' ? '' : "2px solid rgb(10, 100, 240)",
                                    boxSizing:"border-box",
                                    marginRight:"5px",
                                    marginLeft:"5px" 
                                }}     
                            >        
                            </div>  
                        </div> 
                        <div style={{fontSize:"14px"}}>On</div> 
                    </div>  
                    <div>
                        <input 
                            type="date"    
                            min={start}   
                            disabled={selectedOption!=='on'}
                            max={end}
                            value={dateToDateInputValue(this.state.endsDate)}
                            onChange={(event) => { 
                                let endsDate = new Date(event.target.value);
                                 
                                if(isDate(endsDate)){ this.setState({endsDate}) } 
                            }} 
                            style={{         
                               outline:"none",  
                               backgroundColor:"rgba(235,235,235,1)",
                               border:"none",
                               textAlign:"center", 
                               width:"100%"    
                            }}     
                        />
                    </div> 
                </div>  
    
                <div style={{display:"flex", justifyContent:"space-between"}}>
                    <div style={{display:"flex", alignItems:"center"}}>    
                        <div>
                            <div  
                                onClick={(e) => this.setState({selectedOption:'after', endsDate:oneDayAhead()})}
                                style={{ 
                                    backgroundColor:selectedOption==='after' ? 'rgb(10, 100, 240)' : '',
                                    width:"15px",  
                                    height:"15px",
                                    borderRadius:"50px",
                                    display:"flex",
                                    justifyContent:"center",
                                    position:"relative", 
                                    border:selectedOption==='after'  ? '' : "2px solid rgb(10, 100, 240)",
                                    boxSizing:"border-box",
                                    marginRight:"5px",
                                    marginLeft:"5px" 
                                }}    
                            >        
                            </div>  
                        </div> 
                        <div style={{fontSize:"14px"}}>After</div> 
                    </div>  
                       
                    <div>  
                        <div style={{display:"flex", backgroundColor:"rgba(235,235,235,1)"}}>
                            <div style={{width:"50px"}}> 
                                <input   
                                    onChange={(event) => this.setState({
                                        endsAfter:limitInput( Number(event.target.value) )
                                    })}
                                    disabled={selectedOption!=='after'}
                                    value={String(this.state.endsAfter)}
                                    min="1"  
                                    max="1000"
                                    style={{   
                                      outline:"none",  
                                      backgroundColor:"rgba(0,0,0,0)",
                                      border:"none",
                                      textAlign:"center",
                                      width:"100%"    
                                    }}   
                                    type="number" 
                                />  
                            </div>    
                            <div style={{paddingLeft:"5px", paddingRight:"5px", backgroundColor:"rgba(0,0,0,0)"}}>
                                repetitions
                            </div> 
                        </div>
                    </div>
                </div> 
            </div> 

            <div 
                style={{   
                  display:"flex",  
                  alignItems:"center", 
                  justifyContent:"space-between",
                  flexGrow:1, 
                  padding:"5px"  
                }}  
            >
                    <div style={{padding:"2px"}}>
                        <div    
                            onClick={() => this.setState({...initialState}, () => this.close())} 
                            style={{       
                                width:"90px",
                                display:"flex",
                                alignItems:"center",
                                cursor:"pointer", 
                                justifyContent:"center",
                                borderRadius:"5px",
                                height:"25px",   
                                backgroundColor:"rgba(179,182,189,1)"  
                            }}  
                        > 
                            <div style={{color:"white", fontSize:"16px"}}>      
                                Cancel 
                            </div>  
                        </div>   
                    </div> 
                    <div style={{padding:"2px"}}>
                        <div     
                            onClick={(e) => this.allInputsAreValid() ? this.onDone(e) : null} 
                            style={{     
                                width:"90px",
                                display:"flex",
                                alignItems:"center",
                                cursor:"pointer",
                                justifyContent:"center",
                                borderRadius:"5px",
                                height:"25px",  
                                backgroundColor:"rgba(81, 144, 247, 1)"  
                            }}
                        >  
                            <div style={{color:"white", fontSize:"16px"}}>  
                                Repeat
                            </div>   
                        </div> 
                    </div>
                </div> 
 
            </div>   
        </div>
        </div>
    }
}



