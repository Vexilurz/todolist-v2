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
    getRangeYearRepetitions, dateToDateInputValue, dateInputUpperLimit, limitDate, isNotNan, 
    limitInput, isNotEmpty
} from '../utils/utils'; 
import { removeTodo, addTodo } from '../database';
import { RepeatOptions, Category, ChecklistItem, Todo, Project, Area, LayoutItem, Group, Store } from '../types';
import { 
    remove, isNil, not, isEmpty, last, compose, map, cond, defaultTo,
    equals, all, when, prop, complement, adjust, path, drop, add 
} from 'ramda';
let uniqid = require("uniqid");    
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import FlatButton from 'material-ui/FlatButton';
import { generateId } from '../utils/generateId';
import { isDate, isTodo, isArrayOfTodos, isNotDate, isNotNil, isString } from '../utils/isSomething';
import { assert } from '../utils/assert';
import { isDev } from '../utils/isDev';
import { insideTargetArea } from '../utils/insideTargetArea';
import { normalize } from '../utils/normalize';
import { sameDay } from '../utils/time';
let RRule = require('rrule');



let oneDayMore = (date:Date) : Date => { 
    if(isNotDate(date)){ return date }

    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;    
    };
      
    return new Date(date.getTime())["addDays"](1);
}; 



let getStartDate = (todo:Todo) : Date => 
    isNil(todo.attachedDate) ? new Date() :
    isString(todo.attachedDate) ? new Date(todo.attachedDate) :
    isDate(todo.attachedDate) ? todo.attachedDate :
    new Date();



let getFreq = cond([
    [equals('year'), () => RRule.YEARLY ],
    [equals('month'), () => RRule.MONTHLY ],
    [equals('week'), () => RRule.WEEKLY ],
    [() => true, () => RRule.DAILY ],
]);    



let selectedDatesToTodos = (todo:Todo) => (dates:Date[]) : Todo[] => 
    dates.map( 
        (date:Date,index:number) : Todo => {
            let withoutRev : any = {...todo, _rev:undefined};
            delete withoutRev["_rev"];

            return { 
              ...withoutRev, 
              deadline : null, 
              category : "upcoming",
              _id : generateId(), 
              attachedDate : date,  
              priority:index,       
              reminder:null,  
              created:new Date(),
              deleted:undefined, 
              completedSet:undefined, 
              completedWhen:undefined, 
              checked:false
            } as Todo
        }
    ); 



export let repeat = (options:RepeatOptions, todo:Todo, start:Date, limit:Date) : Todo[] => {
    let groupId : string = compose( defaultTo(generateId()), path(['group','_id']) )(todo);
     
    assert(isTodo(todo), 'todo is not of type Todo. repeat.');

    let dtstart : Date = getStartDate(todo); 

    let { 
        interval,
        freq, //'week' | 'day' | 'month' | 'year',
        until,
        count,
        selectedOption //'on' | 'after' | 'never',
    } = options;     
 
    let todos = compose(
        (items) => adjust(
            (todo:Todo) => ({ ...todo, group:{...todo.group, last:true} }), 
            items.length-1, 
            items
        ),
        map((t:Todo) : Todo => ({ ...t, reminder:null, group:{type:selectedOption, _id:groupId, options} })),
        selectedDatesToTodos(todo),
        cond(
            [
                [ 
                    equals('on'), 
                    () : Date[] => {
                        let rule = new RRule({freq:getFreq(freq),interval,dtstart,until});
                        let dates = rule.between(start,limit,false);  

                        if(
                            path(['options','interval'],rule)===1 &&
                            path(['options','freq'],rule)===3
                        ){
                            dates = normalize(dates);
                        }
                        
                        return dates;
                    } 
                ], 
                [ 
                    equals('after'), 
                    () : Date[] => {
                        let rule = new RRule({freq:getFreq(freq),interval,dtstart,count:count+1,until:null});
                        let dates = rule.all();

                        if(
                            path(['options','interval'],rule)===1 &&
                            path(['options','freq'],rule)===3
                        ){
                            dates = normalize(dates);
                        }

                        if(isNotEmpty(dates) && sameDay(dtstart,dates[0])){
                            dates = drop(1)(dates);
                        }
                        
                        return dates;
                    }  
                ],
                [ 
                    equals('never'), 
                    () => {
                        let rule = new RRule({freq:getFreq(freq),interval,dtstart,until:null});
                        let dates = rule.between(start,limit,false);

                        if(
                            path(['options','interval'],rule)===1 &&
                            path(['options','freq'],rule)===3
                        ){
                            dates = normalize(dates);
                        }
                        
                        return dates; 
                    } 
                ],
                [ () => true, () => [] ],
            ]
        ) 
    )(selectedOption); 

    if(isDev()){ 
       assert(all(t => isDate(t.attachedDate),todos),`not all repeated have date. repeat.`);
    }

    return todos;
}; 



//gtDate
let isBeforeLimit = (limit:Date) => (todo:Todo) => isNil(todo.attachedDate) ? false : 
                                     todo.attachedDate.getTime() < limit.getTime();  



interface RepeatPopupProps extends Store{}




interface RepeatPopupState extends RepeatOptions{
    error:string  
};   




const initialState : RepeatPopupState = { 
    interval:1,
    freq:'day',
    until:oneDayMore(new Date()),
    count:1,
    selectedOption:'never',
    error:''
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



    onDone = () => {  
        let { todos, repeatTodo, dispatch, limit } = this.props;
        let { interval,freq,until,count,selectedOption,error } = this.state; 
        let todo = {...repeatTodo};
        let actions = [];

        let repeatedTodos : Todo[] = repeat(  
            {
                interval, 
                freq, 
                until, 
                count, 
                selectedOption 
            },
            todo, 
            new Date(),
            new Date(limit)
        );
        

        console.log('repeat todo',todo.attachedDate);
        console.log('repeat todos',repeatedTodos.map( t => t.attachedDate ));
        

        if(isEmpty(repeatedTodos)){ return }

        assert(isArrayOfTodos(repeatedTodos),'repeatedTodos is not of type array of todos.');
        assert(all((todo) => isDate(todo.attachedDate), repeatedTodos),'not all repeatedTodos have attachedDate.');
        assert(
            compose(equals(true), path(['group', 'last']), last)(repeatedTodos),
            'last item does not have last flag.'
        );
  
        //attach group to repeated todo
        compose(
            (group) => actions.push({ type:"updateTodo", load:{...todo,group:{...group,last:false}} }),
            prop('group'),
            (items) => items[0]
        )(repeatedTodos) 

        //add repeated todos to state
        actions.push({type:"addTodos",load:repeatedTodos});  

        dispatch({type:"multiple",load:actions}); 
    };    



    componentDidMount(){  
        this.subscriptions.push( 
            Observable
            .fromEvent(window, "click")
            .subscribe(this.onOutsideClick) 
        ); 
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

        if(not(inside)){ this.close(); }   
    };   
 


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
    }; 
      


    allInputsAreValid = () => {
        let {interval,freq,until,count,selectedOption} = this.state; 
        
        let frequency = freq.trim().toLowerCase();

        let repeatEveryIntervalValid = frequency==='week' ||
                                       frequency==='day' ||
                                       frequency==='month' ||
                                       frequency==='year';

        let repeatEveryNValid = isNotNan(interval) && interval>0;



        if(selectedOption==='on'){

            let now = new Date();
            let endsDateValid = isNotNil(until) && isDate(until) && ( until.getTime() > now.getTime() );
            let valid = repeatEveryIntervalValid && repeatEveryNValid && endsDateValid;

            if(!valid){
                let error = ``;
                if(!endsDateValid)
                    error = `Error: ${until} - incorrect date value.`;
                else if(!repeatEveryIntervalValid)    
                    error = `Error: ${frequency} - incorrect frequency value.`;
                else if(!repeatEveryNValid)
                    error = `Error: ${interval} - incorrect interval value.`;

                this.setState({error});    
            }

            return valid;

        }else if(selectedOption==='after'){

            let endsAfterValid = isNotNan(count) && count>0;
            let valid = repeatEveryIntervalValid && repeatEveryNValid && endsAfterValid;

            if(!valid){
                let error = ``;
                if(!endsAfterValid)
                    error = `Error: ${count} - incorrect ends after value.`;
                else if(!repeatEveryIntervalValid)    
                    error = `Error: ${frequency} - incorrect frequency value.`;
                else if(!repeatEveryNValid)
                    error = `Error: ${interval} - incorrect interval value.`;
                    
                this.setState({error});    
            }

            return valid;
        }else if(selectedOption==='never'){

            let valid = repeatEveryIntervalValid && repeatEveryNValid;

            if(!valid){
                let error = ``;
                if(!repeatEveryIntervalValid)    
                    error = `Error: ${frequency} - incorrect frequency value.`;
                else if(!repeatEveryNValid)
                    error = `Error: ${interval} - incorrect interval value.`;
                    
                this.setState({error});    
            }

            return valid;
        }else{
            return false;
        }
             
    };   



    render(){
        let start = dateToDateInputValue(new Date());
        let end = dateInputUpperLimit();  
        let {interval,freq,until,count,selectedOption} = this.state; 
        let {showRepeatPopup} = this.props;
 
        return not(showRepeatPopup) ? null : 
        <div 
            onClick = {e => {e.stopPropagation(); e.preventDefault();}}  
            ref={e => {this.ref=e;}}
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
                Recurring task
            </div>
 
            <div style={{display:"flex", alignItems:"center"}}>
                <div style={{fontSize:"14px"}}>Repeat every</div>  
                <div style={{width:"50px", paddingLeft:"10px", paddingRight:"10px"}}> 
                    <input   
                        value={String(interval)}  
                        style={{ 
                            outline:"none",   
                            backgroundColor:"rgba(235,235,235,1)",
                            border:"none",
                            textAlign:"center",
                            width:"100%"  
                        }} 
                        min="1"
                        max="1000"
                        onChange={(event) => this.setState({interval:limitInput( Number(event.target.value) )})}
                        type="number"  
                    />
                </div>
                <select 
                    style={{backgroundColor:"rgba(235,235,235,1)", border:"none", outline:"none"}}  
                    name="text"
                    value={freq}
                    onChange={(event) => this.setState({freq:event.target.value as any})}  
                >  
                    <option value="day"> { `Day${this.state.interval > 1 ? 's' : ''}` } </option> 
                    <option value="week"> { `Week${this.state.interval > 1 ? 's' : ''}` } </option>
                    <option value="month"> { `Month${this.state.interval > 1 ? 's' : ''}` } </option>
                    <option value="year"> { `Year${this.state.interval > 1 ? 's' : ''}` } </option>
                </select>   
            </div> 
            
            <div style={{height:"100px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
                <div style={{fontSize:"14px"}}>Ends</div> 
                {
                    <div style={{display:"flex", alignItems:"center"}}>    
                        <div>
                            <div onClick={(e) => {
                                this.setState({ selectedOption:'never', count:1, until:oneDayMore(new Date()) })
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
                                onClick={(e) => this.setState({selectedOption:'on',count:1})}
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
                            defaultValue={dateToDateInputValue(until)}
                            onChange={(event) => { 
                                let now = new Date();
                                let until = new Date(event.target.value);
                                let endsDateValid = isNotNil(until) && isDate(until) && ( until.getTime() > now.getTime() );
                                if(endsDateValid){ 
                                   console.log(`date is valid : ${until}`); 
                                   this.setState({until}); 
                                } 
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
                                onClick={(e) => this.setState({ selectedOption:'after', until:oneDayMore(new Date()) })}
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
                                        count:limitInput( Number(event.target.value) )
                                    })}
                                    disabled={selectedOption!=='after'}
                                    value={String(count)}
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
                            <div style={{paddingLeft:"5px", paddingRight:"5px", backgroundColor:"white"}}>
                                repetitions
                            </div> 
                        </div>
                    </div> 
                </div> 
            </div> 

            {      
                isNil(this.state.error) && isEmpty(this.state.error) ? null :                 
                <div style={{
                    width:"100%", 
                    display:"flex",
                    alignItems:"center", 
                    justifyContent:"center",
                    color:"red",
                    fontSize:"14px",
                }}> 
                    {this.state.error}
                </div>       
            }                 

            <div style={{   
                display:"flex",  
                alignItems:"center", 
                justifyContent:"space-between",
                flexGrow:1, 
                padding:"5px"  
            }}>
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
                            onClick={(e) => {
                                this.setState(
                                    {error:''}, 
                                    () => {
                                        if(this.allInputsAreValid()){ 
                                           this.onDone(); 
                                           this.close(); 
                                        }
                                    }
                                ) 
                            }}   
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
};



