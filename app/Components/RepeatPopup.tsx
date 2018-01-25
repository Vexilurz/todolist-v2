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
import { attachDispatchToProps, insideTargetArea, assert } from '../utils';
import { Todo, removeTodo, addTodo, generateId, Project, Area, LayoutItem } from '../database';
import { Store, isDev } from '../app';
import { ChecklistItem } from './TodoInput/TodoChecklist';
import { Category } from './MainContainer';
import { remove, isNil, not } from 'ramda';
let uniqid = require("uniqid");    
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';


let dateToDateInputValue = (date:Date) : string => {
    let month = date.getUTCMonth() + 1; 
    let d = date.getUTCDate();
    let year = date.getUTCFullYear();

    d = d < 10 ? `0${d}` : d.toString() as any;
    month = month < 10 ? `0${month}` : month.toString() as any;

    return year + "-" + month + "-" + d;
}



let getRepeatRange = (data:RepeatPopupState, todo:Todo) : Date[] => {

    Date.prototype["addDays"] = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }
   
    let dates = [];
    let start : Date = isNil(todo.attachedDate) ? new Date() : todo.attachedDate;
 
    let { 
        repeatEveryN,
        repeatEveryInterval,
        repeatOnDay,
        endsDate,
        endsAfter,
        selectedOption 
     } = data;

    let step = repeatEveryInterval==='week' ? 7 :
               repeatEveryInterval==='month' ? 31 :
               repeatEveryInterval==='year' ? 365 : 
               1; //TODO 
     

    if(selectedOption==='on'){
        let ends : Date = endsDate;
        let last = start;
  
        while(last.getTime() < ends.getTime()){
            let next = new Date(last.getTime())["addDays"]( step );
            dates.push(next);
            last = next;
        }

    }else if(selectedOption==='after'){
        let ends : number = endsAfter; 

        for(let i=1; i<ends; i++){
            let next = new Date(start.getTime())["addDays"]( i*step );
            dates.push(next); 
        }
        

    }else if(selectedOption==='never'){
 
        for(let i=1; i<1000; i++){
            let next = new Date(start.getTime())["addDays"]( i*step );
            dates.push(next); 
        }
    }

    return dates;
}



let repeatTodo = (data:RepeatPopupState, todo:Todo, group:string) : Todo[] => {

    let dates = getRepeatRange(data,todo);

    let todos = dates.map( date => ({ ...todo, deadline:null, _id:generateId(), attachedDate:date, group }) )

    return todos; 
}   

 

interface RepeatPopupProps extends Store{}
 
interface RepeatPopupState{
    repeatEveryN : number,
    repeatEveryInterval : 'week' | 'day' | 'month' | 'year',
    repeatOnDay : number,
    endsDate : Date,
    endsAfter : number,
    selectedOption : 'on' | 'after' | 'never'
}  
 
const initialState : RepeatPopupState = {
    repeatEveryN:1,
    repeatEveryInterval:'day',
    repeatOnDay:0,
    endsDate:new Date(),
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
        let {todos,repeatTodoId} = this.props;
        let todo = todos.find(todo => todo._id===repeatTodoId);

        if(!isNil(todo.group)){ return }
   
        let group = generateId();
        let load = repeatTodo(this.state, todo, group);
             

        this.props.dispatch({type:"addTodos", load});
        this.props.dispatch({type:"updateTodo", load:{...todo, group} }); 
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
      

    render(){
        let now = new Date(); 
        let month = now.getUTCMonth() + 1; //months from 1-12
        let d = now.getUTCDate();
        let year = now.getUTCFullYear();

        d = d < 10 ? `0${d}` : d.toString() as any;
        month = month < 10 ? `0${month}` : month.toString() as any;
        
        let start = dateToDateInputValue(new Date());
        let end = '2050' + "-" + month + "-" + d; 

        let {  
            repeatEveryN,
            repeatEveryInterval,
            repeatOnDay,
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
                <div style={{fontSize:"14px"}}>     
                    Repeat every
                </div>  
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
                           this.setState({selectedOption:'never', endsAfter:1, endsDate:new Date})
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
                                onClick={(e) => this.setState({selectedOption:'after', endsDate:new Date()})}
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

            <div style={{display:"flex", justifyContent:"flex-end"}}>
                <div 
                    onClick={() => this.setState({...initialState}, () => this.close())}
                    style={{color:"black", cursor:"pointer", padding:"5px"}}
                > 
                    Cancel 
                </div> 
 
                <div   
                    onClick={this.onDone}
                    style={{color:"rgb(10, 100, 240)", cursor:"pointer", padding:"5px"}}
                >
                    Done
                </div>
            </div>    

            </div> 
        </div>
        </div>
    }
}



