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
import { attachDispatchToProps, insideTargetArea, assert, isTodo, isDate } from '../utils';
import { Todo, removeTodo, addTodo, generateId, Project, Area, LayoutItem, Group } from '../database';
import { Store, isDev } from '../app';
import { ChecklistItem } from './TodoInput/TodoChecklist';
import { Category } from './MainContainer';
import { remove, isNil, not } from 'ramda';
let uniqid = require("uniqid");    
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import FlatButton from 'material-ui/FlatButton';

let dateToDateInputValue = (date:Date) : string => {
    let month = date.getUTCMonth() + 1; 
    let d = date.getUTCDate();
    let year = date.getUTCFullYear();

    d = d < 10 ? `0${d}` : d.toString() as any;
    month = month < 10 ? `0${month}` : month.toString() as any;

    return year + "-" + month + "-" + d;
}


let dateToYearMonthDay = (date:Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);

let getRangeDays = (start:Date, endDate:Date, step:number) : Date[] => {

    Date.prototype["addDays"] = function(days) {
      let date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
    }
   
    let dates = [];
    let last = dateToYearMonthDay(start);
    let end = dateToYearMonthDay(endDate); 
    
    while(last.getTime() < end.getTime()){
      let next = new Date(last.getTime())["addDays"]( step );
      dates.push(next);
      last = dateToYearMonthDay(next);
    } 

    return dates;
}


let getRangeRepetitions = (start:Date, repetitions:number, step:number) : Date[] => {

    Date.prototype["addDays"] = function(days){
      let date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
    }
   
    let dates = [];

    for(let i = 1; i <= repetitions; i++){
        let next = new Date(start.getTime())["addDays"]( step*i );
        dates.push(next);
    }

    return dates;
}

/*
let repeatTodo = (data:RepeatPopupState, todo:Todo, group:string) : Todo[] => {

    let dates = getRepeatRange(data,todo);

    let todos = dates.map( date => ({ ...todo, deadline:null, _id:generateId(), attachedDate:date, group }) )

    return todos; 
}   
*/ 



let getMonth = (date:Date) : number => date.getMonth() + 1; //1 - 12

let getYear = (date:Date) : number => date.getFullYear();

let daysInMonth = (month:number, year:number) => new Date(year, month, 0).getDate();





let handleDay = (options:RepeatPopupState, todo:Todo) : {dates:Date[],group:Group} => {

    let {
        repeatEveryN,
        repeatEveryInterval,
        endsDate,
        endsAfter,
        selectedOption 
    } = options;       
    
    let groupId : string = generateId();
    let start : Date = isNil(todo.attachedDate) ? new Date() :
                       isDate(todo.attachedDate) ? todo.attachedDate :
                       new Date();

    if(selectedOption==='on'){

        let group : Group = {type:'on', _id:groupId};
        let ends : Date = endsDate;
        let step = repeatEveryN;
        assert(isDate(ends), 'endsDate is not of type Date.');
        let dates : Date[] = getRangeDays(start,ends,step);
        return {dates,group};

     }else if(selectedOption==='after'){

        let group : Group = {type:'after', _id:groupId};
        let step = repeatEveryN;
        let repetitions = endsAfter;
        let dates : Date[] = getRangeRepetitions(start, repetitions, step); 
        return {dates,group};

     }else if(selectedOption==='never'){

        let group : Group = {type:'never', _id:groupId}; 
        let step = repeatEveryN;
        let dates : Date[] = getRangeRepetitions(start, 1000, step); 
        return {dates,group};

     }


}




let handleWeek = (options:RepeatPopupState, todo:Todo) : {dates:Date[],group:Group} => {

    let {
        repeatEveryN,
        repeatEveryInterval,
        endsDate,
        endsAfter,
        selectedOption 
    } = options;       
    
    let groupId : string = generateId();
    let start : Date = isNil(todo.attachedDate) ? new Date() :
                       isDate(todo.attachedDate) ? todo.attachedDate :
                       new Date();

    if(selectedOption==='on'){

        let group : Group = {type:'on', _id:groupId};
        let ends : Date = endsDate;
        let weekLength = 7;
        let step = repeatEveryN * weekLength;
        assert(isDate(ends), 'endsDate is not of type Date.');
        let dates : Date[] = getRangeDays(start,ends,step);
        return {dates,group};

    }else if(selectedOption==='after'){

        let group : Group = {type:'after', _id:groupId};
        let weekLength = 7;
        let step = repeatEveryN * weekLength;
        let repetitions = endsAfter;
        let dates : Date[] = getRangeRepetitions(start, repetitions, step); 
        return {dates,group};

    }else if(selectedOption==='never'){

        let group : Group = {type:'never', _id:groupId};
        let weekLength = 7;
        let step = repeatEveryN * weekLength;
        let dates : Date[] = getRangeRepetitions(start, 1000, step); 
        return {dates,group};
    }
}


let handleMonth = (options:RepeatPopupState, todo:Todo) : {dates:Date[],group:Group} => {

    let {
        repeatEveryN,
        repeatEveryInterval,
        endsDate,
        endsAfter,
        selectedOption 
    } = options;       
    
    let groupId : string = generateId();
    let start : Date = isNil(todo.attachedDate) ? new Date() :
                       isDate(todo.attachedDate) ? todo.attachedDate :
                       new Date();

    if(selectedOption==='on'){
        let group : Group = {type:'on', _id:groupId};
        let ends : Date = endsDate;
        let step = repeatEveryN;
        assert(isDate(ends), 'endsDate is not of type Date.');

        let dayOfTheMonth : number = start.getDate();
        let daysInSelectedMonth : number = daysInMonth(getMonth(start), getYear(start));

        let dates = [];

        let last = dateToYearMonthDay(start);
        let end = dateToYearMonthDay(ends); 

        for(let i = 1; last.getTime() <= end.getTime(); i++){
            let next = new Date(start.getTime());
            let month = getMonth(start);

            next.setMonth( (i*step) + month );
            let daysInNextMonth : number = daysInMonth(getMonth(next), getYear(next));

            if(dayOfTheMonth>daysInNextMonth){
                next.setDate(daysInNextMonth);
            }else{
                next.setDate(dayOfTheMonth);
            }   

            last = next;
            dates.push(next);
        }

        return {dates,group};

    }else if(selectedOption==='after'){
        let group : Group = {type:'after', _id:groupId};
        let repetitions : number = endsAfter;
        let step = repeatEveryN;
        let dayOfTheMonth : number = start.getDate();
        let daysInSelectedMonth : number = daysInMonth(getMonth(start), getYear(start));

        let dates = [];

        for(let i = 0; i<repetitions; i++){
            let next = new Date(start.getTime());
            let month = getMonth(start);
 
            next.setMonth( (i*step) + month ); 
            let daysInNextMonth : number = daysInMonth(getMonth(next), getYear(next));

            if(dayOfTheMonth>daysInNextMonth){  
                next.setDate(daysInNextMonth);
            }else{
                next.setDate(dayOfTheMonth);
            }

            dates.push(next);
        } 

        return {dates,group};
    }else if(selectedOption==='never'){
        let group : Group = {type:'never', _id:groupId};

        let step = repeatEveryN;
        let dayOfTheMonth : number = start.getDate();
        let daysInSelectedMonth : number = daysInMonth(getMonth(start), getYear(start));

        let dates = [];

        for(let i = 1; i<1000; i++){
            let next = new Date(start.getTime());
            let month = getMonth(start);

            next.setMonth( (i*step) + month ); 
            let daysInNextMonth : number = daysInMonth(getMonth(next), getYear(next));

            if(dayOfTheMonth>daysInNextMonth){
                next.setDate(daysInNextMonth);
            }else{
                next.setDate(dayOfTheMonth);
            } 

            dates.push(next);
        } 

        return {dates,group};
    }
}




let handleYear = (options:RepeatPopupState, todo:Todo) : {dates:Date[],group:Group} => {

    let {
        repeatEveryN,
        repeatEveryInterval,
        endsDate,
        endsAfter,
        selectedOption 
    } = options;       
    
    let groupId : string = generateId();
    let start : Date = isNil(todo.attachedDate) ? new Date() :
                       isDate(todo.attachedDate) ? todo.attachedDate :
                       new Date();

    if(selectedOption==='on'){
        let group : Group = {type:'on', _id:groupId};
        //leap year ? TODO 
        let ends : Date = endsDate;
        let step : number = repeatEveryN;
        assert(isDate(ends), 'endsDate is not of type Date.');

        let last = start;
        let dates = [];

        for(let i = 1; last.getTime() <= ends.getTime(); i++){
            let next = new Date(start.getTime());
            let year = next.getFullYear();
            next.setFullYear(year + (i*step));
            last = next;
            dates.push(next);
        } 
         
        return {dates,group};

    }else if(selectedOption==='after'){

        let group : Group = {type:'after', _id:groupId};

        let repetitions : number = endsAfter;
        let step = repeatEveryN;
        let dates = [];

        for(let i = 1; i<=repetitions; i++){
            let next = new Date(start.getTime());
            let year = next.getFullYear();
            next.setFullYear(year + (i*step));
            dates.push(next);
        }

        return {dates,group};

    }else if(selectedOption==='never'){
        
        let group : Group = {type:'never', _id:groupId};

        let step = repeatEveryN;
        let dates = [];

        for(let i = 1; i<=100; i++){
            let next = new Date(start.getTime());
            let year = next.getFullYear();
            next.setFullYear(year + (i*step));
            dates.push(next);
        }

        return {dates,group};
    }
}

 

let repeat = (options:RepeatPopupState, todo:Todo) : void => {

    assert(isTodo(todo), 'todo is not of type Todo. repeat.');
    
    if(!isNil(todo.group)){ return }
    
    let { repeatEveryInterval } = options;     
    
    let dates = [];

    if(repeatEveryInterval==='day'){

        let {dates,group} = handleDay(options, todo);

        console.log(dates,group)
        
    }else if(repeatEveryInterval==='week'){

        let { dates,group } = handleWeek(options,todo);

        console.log(dates,group)
        

    }else if(repeatEveryInterval==='month'){

        let { dates,group } = handleMonth(options,todo);

        console.log(dates,group) 
        
        
    }else if(repeatEveryInterval==='year'){

        let { dates,group } = handleYear(options,todo);

        console.log(dates,group);      
    }   
} 


let oneDayAhead = () : Date => { 

    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;   
    }
      
    return new Date()["addDays"](1);
}

    
interface RepeatPopupProps extends Store{}
 
interface RepeatPopupState{
    repeatEveryN : number,
    repeatEveryInterval : 'week' | 'day' | 'month' | 'year',
    endsDate : Date,
    endsAfter : number,
    selectedOption : 'on' | 'after' | 'never'
}  
 
const initialState : RepeatPopupState = {
    repeatEveryN:1,
    repeatEveryInterval:'day',
    endsDate:oneDayAhead(),
    endsAfter:1,
    selectedOption:'never'
};   

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
        let { todos, repeatTodoId } = this.props;
        let todo = todos.find(todo => todo._id===repeatTodoId);

        if(!isNil(todo.group)){ return }
   
        let load = repeat(this.state, todo);
        //this.props.dispatch({type:"addTodos", load});
        //this.props.dispatch({type:"updateTodo", load:{...todo, group} }); 
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
                repeatTodoId : null,
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
        let now = new Date(); 
        let month = now.getUTCMonth() + 1; //months from 1-12
        let d = now.getUTCDate();
        let year = now.getUTCFullYear();

        d = d < 10 ? `0${d}` : d.toString() as any;
        month = month < 10 ? `0${month}` : month.toString() as any;
        
        let start = dateToDateInputValue(new Date());
        let end = '2070' + "-" + month + "-" + d; 

        let {  
            repeatEveryN,
            repeatEveryInterval,
            endsDate,
            endsAfter,
            selectedOption
        } = this.state; 

        return !this.props.showRepeatPopup ? null : 
        <div 
            onClick = {(e) =>  { 
                e.stopPropagation();
                e.preventDefault(); 
            }}  
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
                        max="10000"
                        onChange={(event) => this.setState({repeatEveryN:Number(event.target.value)})}
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


            {/*       
            <div style={{display:"flex", flexDirection:"column", width:"100%"}}>
                <div style={{fontSize:"14px"}}>Repeat on</div> 
                
                <div style={{display:"flex", paddingTop:"5px"}}>
                {  
                    ['M','T','W','T','F','S','S']
                    .map(
                      (value:string, index:number) => {
                            return <div
                                key={index}
                                onClick={(e) => this.setState({repeatOnDay:index})}    
                                style={{   
                                    backgroundColor:repeatOnDay===index ? 'rgb(10, 100, 240)' : 'rgba(235,235,235,1)',
                                    color:repeatOnDay===index ? "white" : 'rgb(100,100,100)',
                                    width:"20px",  
                                    height:"20px",
                                    alignItems:"center",
                                    borderRadius:"50px",
                                    display:"flex",
                                    fontSize:"13px",
                                    justifyContent:"center",
                                    position:"relative", 
                                    boxSizing:"border-box",  
                                    marginRight:"5px",  
                                    marginLeft:"5px" 
                                }}
                            >
                                {value}
                            </div> 
                      } 
                    )
                }
                </div>
            </div>
            */} 


            <div style={{
                height:"100px",
                display:"flex",
                flexDirection:"column",  
                justifyContent:"space-between"
            }}>

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
    
 
                <div style={{
                   display:"flex",
                   justifyContent:"space-between", 
                   alignItems:"center"
                }}>
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
                            onChange={(event) => this.setState({endsDate:new Date(event.target.value)})}
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
                                    onChange={(event) => this.setState({endsAfter:Number(event.target.value)})}
                                    disabled={selectedOption!=='after'}
                                    value={String(this.state.endsAfter)}
                                    min="1"  
                                    max="10000"
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
                            <div style={{
                                paddingLeft:"5px",
                                paddingRight:"5px",
                                backgroundColor:"rgba(0,0,0,0)"
                            }}>
                                repetitions
                            </div>
                        </div>
                    </div>
                </div> 
            </div>  

            <div style={{
                display:"flex", 
                justifyContent:"space-around",
                alignItems:"center"
            }}>
                <div>  
                    <FlatButton 
                        onClick={() => this.setState({...initialState}, () => this.close())} 
                        label="Cancel" 
                    />
                </div> 
                <div>
                    <FlatButton 
                        onClick={this.onDone} 
                        label="Done"  
                        disabled={not(this.allInputsAreValid())}
                        style={{color:'rgb(10, 100, 240)'}}
                        primary={true}
                    /> 
                </div>
            </div>   
            </div>  
        </div>
        </div>
    }
}



