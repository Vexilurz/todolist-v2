import './../assets/styles.css';  
import './../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { connect } from "react-redux";
import { attachDispatchToProps, dateToDateInputValue, dateInputUpperLimit, isNotNan, limitInput, isNotEmpty } from '../utils/utils'; 
import { RepeatOptions, Todo, Store, Project, TodoBelonging } from '../types';
import { isNil, not, isEmpty, compose, map, cond, defaultTo, equals, when, adjust, path, drop, uniqBy, evolve, contains, prop } from 'ramda';
import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Rx';
import { generateId } from '../utils/generateId';
import { isDate, isTodo,isNotDate, isNotNil, isRepeatOptions, isString } from '../utils/isSomething';
import { assert } from '../utils/assert';
import { isDev } from '../utils/isDev';
import { insideTargetArea } from '../utils/insideTargetArea';
import { normalize } from '../utils/normalize';
import { sameDay } from '../utils/time';
import { stopPropagation } from '../utils/stopPropagation';
import { RRule } from 'rrule';


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


export let repeat = (
    options:RepeatOptions, 
    todo:Todo, 
    start:Date, 
    end:Date,
    groupId:string,
    todoBelonging:TodoBelonging
) : Todo[] => {

    if(isDev()){
       assert(isTodo(todo),'todo is not of type Todo. repeat.');
       assert(isDate(start),'start is not of type Date. repeat.');
       assert(isDate(end),'end is not of type Date. repeat.');
       //assert(isRepeatOptions(options),`options is not of type RepeatOptions. repeat. ${JSON.stringify(options)}`);
    }

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

                    if(
                        isNotEmpty(dates) && 
                        sameDay(start,dates[0])
                    ){
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


    let setLast = items => adjust( items.length-1, evolve({group:(group) => ({...group, last:true})}),  items );


    let todos = compose(
        when(isNotEmpty, setLast),
        map((t:Todo) : Todo => ({ ...t, reminder:null, group:{type:selectedOption, _id:groupId, options, projectId:prop('_id')(prop('project')(todoBelonging))} })),
        selectedDatesToTodos(todo),
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


//@ts-ignore 
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
        let todoBelonging = {...this.props.repeatTodoBelonging};
        let groupId : string = generateId();
        let options = {interval, freq, until, count, selectedOption};
        let start = new Date();
        // let project = this.props.projects.find((project:Project) => contains(todo._id)(project.layout.filter(isString)));

        let repeatedTodos : Todo[] = repeat(  
            options,
            todo, 
            defaultTo(start)(todo.attachedDate),
            new Date(this.props.limit),
            groupId,
            todoBelonging
        );
        
        if(isDev()){
            let withStart = [
                ...repeatedTodos.map(t => t.attachedDate),
                defaultTo(start)(todo.attachedDate)
            ];

            let by = uniqBy(d => d.toString(), withStart);

            assert(
                by.length===withStart.length, 
               `dates repeat. onDone. ${selectedOption}. 
                length : ${withStart.length}; 
                by : ${by.length};`
            ); 
        }

        let load = [
            {
                type:"updateTodo", 
                load:{
                    ...todo, 
                    attachedDate:defaultTo(start)(todo.attachedDate), 
                    category:isNil(todo.attachedDate) ? "today" : todo.category,
                    group:{ 
                        projectId:prop('_id')(prop('project')(todoBelonging)), 
                        type:selectedOption, 
                        _id:groupId, 
                        options
                    }
                }
            },
            {type:"addTodos", load:repeatedTodos}            
        ];

        if(isNotNil(todoBelonging.project)){
            load.push({
               type:"updateProject", 
               load:{...todoBelonging.project,layout:[...todoBelonging.project.layout,...repeatedTodos.map(prop('_id')) ]} 
            } as any) 

            // repeatedTodos.forEach((todoItem) => 
            //     load.push({type:"attachTodoToProject", 
            //     load:{ projectId:todoBelonging.project._id, todoId:todoItem._id, targetHeading:todoBelonging.heading }} as any)
            // )
        }

        this.props.dispatch({type:"multiple", load}); 
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
                        onKeyDown={stopPropagation}
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
                            onKeyDown={stopPropagation}
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
                                    onKeyDown={stopPropagation}
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
                            onClick={() => 
                                this.setState(
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
                            onClick={e => this.setState(
                                {error:''}, 
                                () => {
                                    if(this.allInputsAreValid()){ 
                                       this.onDone(); 
                                       this.close(); 
                                    }
                                }
                            )}   
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



