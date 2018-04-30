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
    limitInput, isNotEmpty, nDaysFromNow, log
} from '../utils/utils'; 
import { RepeatOptions, Category, ChecklistItem, Todo, Project, Area, LayoutItem, Group, Store } from '../types';
import { 
    remove, isNil, not, isEmpty, last, compose, map, cond, defaultTo, flatten, groupBy, difference,
    equals, all, when, prop, complement, adjust, path, drop, add, uniqBy, reduce, range, xprod 
} from 'ramda';
let uniqid = require("uniqid");    
import { extend } from './Categories/Upcoming';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import FlatButton from 'material-ui/FlatButton';
import { generateId } from '../utils/generateId';
import { isDate, isTodo, isArrayOfTodos, isNotDate, isNotNil, isString, isRepeatOptions } from '../utils/isSomething';
import { assert } from '../utils/assert';
import { isDev } from '../utils/isDev';
import { insideTargetArea } from '../utils/insideTargetArea';
import { normalize } from '../utils/normalize';
import { sameDay } from '../utils/time';
let RRule = require('rrule');


let test = (targets : {todo:Todo,options:RepeatOptions}[], limits : Date[]) : void => {
    let initial = limits[0];

    let groups : Todo[][] = map( 
        (target:{todo:Todo,options:RepeatOptions}) => {
            let groupId = generateId();

            let repeats = repeat(
                target.options,
                target.todo,
                defaultTo(new Date)(target.todo.attachedDate),
                initial,
                groupId
            );

            let repeatsHaveDate = all( t => isDate(t.attachedDate) )(repeats);
            let repeatsHaveGroup = all( t => isNotNil(t.group) )(repeats);
            
            assert(isArrayOfTodos(repeats), `repeats - incorrect type. test.`);
            assert(repeatsHaveDate, `repeats - missing date. test.`);
            assert(repeatsHaveGroup, `repeats - missing group. test.`);
            
            return [ 
                { 
                    ...target.todo, 
                    group:{
                        type:target.options.selectedOption, 
                        _id:groupId, 
                        options:target.options
                    } 
                },
                ...repeats
            ];
        },  
        targets 
    );

    let todos = flatten(groups);
    let withInitial = extend(initial,todos);

    let groupOne = groupBy(path(['group','_id']), todos);
    let groupTwo = groupBy(path(['group','_id']), withInitial);
    
    assert(isEmpty(withInitial), `extend with initial limit should be empty, have ${withInitial.length} instead.`);
  
    let remainingLimits = drop(1)(limits);
    let lastLimit = remainingLimits[remainingLimits.length-1];

    let gradually = remainingLimits.reduce((acc,val) => [...acc, ...extend(val,acc)], todos); 
    let immediately = [...todos,...extend(lastLimit,todos)];

    let graduallyDateUndefined = gradually.filter( t => isNil(t.attachedDate));
    let immediatelyDateUndefined = immediately.filter( t => isNil(t.attachedDate));


    assert( 
        all( t => targets.find( target => target.todo._id===t._id ))(graduallyDateUndefined), 
        `date undefined, graduallyDateUndefined, target is not a source. test.`
    )
    assert( 
        all( t => targets.find( target => target.todo._id===t._id ))(immediatelyDateUndefined) , 
        `date undefined, immediatelyDateUndefined, target is not a source. test.`
    )
    
    
    let diff = difference(
        gradually.map((t:Todo) => isDate(t.attachedDate) ? t.attachedDate.toString() : null), 
        immediately.map((t:Todo) => isDate(t.attachedDate) ? t.attachedDate.toString() : null)
    );


    if(gradually.length!==immediately.length){
        let groupGradually = groupBy(path(['group','_id']), gradually);
        let groupImmediately = groupBy(path(['group','_id']), immediately);
        console.log(diff); 
    }


    assert(
        gradually.length===immediately.length, 
        `
        lengths differ. gradually : ${gradually.length}; 
        immediately : ${immediately.length};
        diff : ${JSON.stringify(diff)}
        `
    );

 
    groups.forEach(
        (g:Todo[]) => {
            let withDates = g.filter( t => isDate(t.attachedDate) );
            let by = uniqBy( 
                t => isDate(t.attachedDate) ? t.attachedDate.toString() : null, 
                withDates 
            );

            assert(
                by.length===withDates.length, 
                `
                dates repeat. groups.forEach. test. ${g[0].group.options.selectedOption}. 
                withDates: ${JSON.stringify(withDates)}; 
                by : ${JSON.stringify(by)};
                `
            ); 
        }
    );
};


let oneDayMore = (date:Date) : Date => { 
    if(isNotDate(date)){ return date }

    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;    
    };
      
    return new Date(date.getTime())["addDays"](1);
}; 



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


//let groupId : string = compose( defaultTo(generateId()), path(['group','_id']) )(todo);
export let repeat = (
    options:RepeatOptions, 
    todo:Todo, 
    start:Date, 
    end:Date,
    groupId:string
) : Todo[] => {

    assert(isTodo(todo),'todo is not of type Todo. repeat.');
    assert(isDate(start),'start is not of type Date. repeat.');
    assert(isDate(end),'end is not of type Date. repeat.');
    assert(isRepeatOptions(options),`options is not of type RepeatOptions. repeat. ${JSON.stringify(options)}`);
    

    let { 
        interval,
        freq, //'week' | 'day' | 'month' | 'year',
        until,
        count,
        selectedOption //'on' | 'after' | 'never',
    } = options;   
    

    let optionToDates = cond(
        [
            [ 
                equals('on'), 
                () : Date[] => {
                    let rule = new RRule({freq:getFreq(freq),interval,dtstart:start,until});
                    let dates = rule.between(start,end,false);
                     
                    if(path(['options','interval'],rule)===1 && path(['options','freq'],rule)===3){
                       dates = normalize(dates);
                    }

                    return dates;
                } 
            ], 
            [ 
                equals('after'), 
                () : Date[] => {
                    let rule = new RRule({freq:getFreq(freq),interval,dtstart:start,count:count+1,until:null});
                    let dates = rule.all();

                    if(path(['options','interval'],rule)===1 && path(['options','freq'],rule)===3){
                       dates = normalize(dates);
                    }

                    if(isNotEmpty(dates) && sameDay(start,dates[0])){
                       dates = drop(1)(dates);
                    }
                    
                    return dates;
                }  
            ],
            [ 
                equals('never'), 
                () : Date[] => {
                    let rule = new RRule({freq:getFreq(freq),interval,dtstart:start,until:null});
                    let dates = rule.between(start,end,false);

                    if(path(['options','interval'],rule)===1 && path(['options','freq'],rule)===3){
                       dates = normalize(dates);
                    }

                    return dates; 
                } 
            ],
            [ () => true, () => [] ],
        ]
    );  

 
    let todos = compose(
        map((t:Todo) : Todo => ({ ...t, reminder:null, group:{type:selectedOption, _id:groupId, options} })),
        selectedDatesToTodos(todo),
        //log('dates'),
        optionToDates
    )(selectedOption); 


    return todos;
}; 



//gtDate
let isBeforeLimit = (limit:Date) => (todo:Todo) => isNil(todo.attachedDate) ? false : 
                                     todo.attachedDate.getTime() < limit.getTime();  



interface RepeatPopupProps extends Store{}



interface RepeatPopupState extends RepeatOptions{
    error:string  
};   


 
@connect((store,props) => ({...store, ...props}), attachDispatchToProps) 
export class RepeatPopup extends Component<RepeatPopupProps,RepeatPopupState>{
    ref:HTMLElement;  
    subscriptions:Subscription[];  

    constructor(props){
        super(props);
        this.subscriptions = [];
        this.state = { 
            interval:1,
            freq:'day',
            until:oneDayMore(new Date()),
            count:1,
            selectedOption:'never',
            error:''
        };
    }   



    onDone = () => {  
        let {interval, freq, until, count, selectedOption, error} = this.state; 
        let todo = {...this.props.repeatTodo};
        let groupId : string = generateId();
        let options = {interval, freq, until, count, selectedOption};


        let repeatedTodos : Todo[] = repeat(  
            options,
            todo, 
            defaultTo(new Date())(todo.attachedDate),
            new Date(this.props.limit),
            groupId
        );
        


        if(isDev()){
            let withStart = [
                ...repeatedTodos.map(t => t.attachedDate),
                defaultTo(new Date())(todo.attachedDate)
            ];

            let by = uniqBy(d => d.toString(), withStart);

            assert(
                by.length===withStart.length, 
               `dates repeat. onDone. ${selectedOption}. 
                length : ${withStart.length}; 
                by : ${by.length};`
            ); 

            for(let i = 0; i<10; i++){
                let types = xprod(['week' , 'day' , 'month' , 'year'], ['on' , 'never']);
                let testOptions = compose(
                    map(
                        (options) => ({
                            todo : this.props.todos[ Math.round( Math.random() * (this.props.todos.length-10) ) ],
                            options
                        })
                    ),
                    map( 
                        n => { 
                            let idx = Math.round( Math.random() * (types.length - 1) );
                            let options = types[idx];

                            return ({
                                interval : n,
                                freq : options[0],
                                until : options[1]==='on' ? nDaysFromNow(Math.round( Math.random() * 100 ) + 1) : null,
                                count : 0,
                                selectedOption : options[1]
                            }) 
                        }
                    ),
                    map(n => Math.round(Math.random() * n) + 1),  
                    range(0)  
                )(10);

                test(testOptions, compose(map(nDaysFromNow), map( n => n*20 ))(range(1,5)) );
                console.log(`iteration : ${i}`);
            }
        }


 
        this.props.dispatch({
            type:"multiple",
            load:[
                { 
                    type:"updateTodo", 
                    load:{
                        ...todo,
                        group:{type:selectedOption, _id:groupId, options}
                    } 
                },
                {type:"addTodos",load:repeatedTodos}
            ]
        }); 
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
        let error = null;
        let valid = true;
        
        let repeatEveryNValid = isNotNan(interval) && (interval > 0);
        
        let repeatEveryIntervalValid = frequency==='week' ||
                                       frequency==='day' ||
                                       frequency==='month' ||
                                       frequency==='year';


        if(!repeatEveryIntervalValid)    
            error = `Error: ${frequency} - incorrect frequency value.`;
        else if(!repeatEveryNValid)
            error = `Error: ${interval} - incorrect interval value.`;


        if(selectedOption==='never'){

            valid = repeatEveryIntervalValid && repeatEveryNValid;

        }else if(selectedOption==='on'){

            let now = new Date();
            let endsDateValid = isNotNil(until) && isDate(until) && ( until.getTime() > now.getTime() );

            valid = repeatEveryIntervalValid && repeatEveryNValid && endsDateValid;

            if(!endsDateValid){
                error = `Error: ${until} - incorrect date value.`;
            }

        }else if(selectedOption==='after'){

            let endsAfterValid = isNotNan(count) && count>0;

            valid = repeatEveryIntervalValid && repeatEveryNValid && endsAfterValid;

            if(!endsAfterValid){
                error = `Error: ${count} - incorrect ends after value.`;
            }
        }

        if(isNotNil(error) && isNotEmpty(error)){
           this.setState({error});   
        }
           
        return valid;
    };   



    onDateChange = (event) => {
        let now = new Date();
        let until = new Date(event.target.value);
        let endsDateValid = isNotNil(until) && isDate(until) && ( until.getTime() > now.getTime() );

        if(endsDateValid){ 
           this.setState({until,error:''}); 
        }else{
           this.setState({error:`Error: ${event.target.value} - incorrect date value.`}); 
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
                            onChange={this.onDateChange} 
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
                    paddingTop:"10px",
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
                            onClick={
                                () => this.setState(
                                    { 
                                        interval:1,
                                        freq:'day',
                                        until:oneDayMore(new Date()),
                                        count:1,
                                        selectedOption:'never',
                                        error:''
                                    }, 
                                    () => this.close()
                                )
                            } 
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
                            onClick={
                                (e) => this.setState(
                                    {error:''}, 
                                    () => {
                                        if(this.allInputsAreValid()){ 
                                           this.onDone(); 
                                           this.close(); 
                                        }
                                    }
                                ) 
                            }   
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



