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



interface RepeatPopupProps{

}


interface RepeatPopupState{

}

export class RepeatPopup extends Component<RepeatPopupProps,RepeatPopupState>{

    constructor(props){
        super(props)
    }



    render(){
        let now = new Date();
        let month = now.getUTCMonth() + 1; //months from 1-12
        let day = now.getUTCDate();
        let year = now.getUTCFullYear();

        day = day < 10 ? `0${day}` : day.toString() as any;
        month = month < 10 ? `0${month}` : month.toString() as any;
        
        let start = year + "-" + month + "-" + day;
        let end = '2050' + "-" + month + "-" + day;

        return <div  
            style={{
                position:"fixed",
                top:"50%",
                left:"50%"
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
                height:"300px",
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
                Custom repeat
            </div>

            <div style={{display:"flex"}}>
                <div style={{fontSize:"14px"}}>
                    Repeat every
                </div>  
                <div style={{width:"50px", paddingLeft:"10px", paddingRight:"10px"}}> 
                <input   
                  style={{ 
                    outline:"none",  
                    backgroundColor:"rgba(235,235,235,1)",
                    border:"none",
                    textAlign:"center",
                    width:"100%"  
                  }} 
                  type="number" 
                />
                </div>
                <select 
                    style={{backgroundColor:"rgba(235,235,235,1)"}}  
                    name="text"
                > 
                    <option value="day">Day</option> 
                    <option value="week" selected={true}>Week</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                </select>   
            </div>  

            <div style={{display:"flex", flexDirection:"column", width:"100%"}}>
                <div style={{fontSize:"14px"}}>Repeat on</div> 
                
                <div style={{display:"flex", paddingTop:"5px"}}>
                {  
                    ['M','T','W','T','F','S','S'].map((day:string,index:number) => WeekDay('W',day,index,(day) => {}))
                }
                </div>
            </div>

            <div style={{
                height:"100px",
                display:"flex",
                flexDirection:"column",  
                justifyContent:"space-between"
            }}>

                <div style={{fontSize:"14px"}}>Ends</div> 

                <div style={{display:"flex", alignItems:"center"}}>    
                    <div>
                        <div onClick={(e) => {}}
                             style={{
                                backgroundColor:true ? 'rgb(10, 100, 240)' : '',
                                width:"15px",  
                                height:"15px",
                                borderRadius:"50px",
                                display:"flex",
                                justifyContent:"center",
                                position:"relative", 
                                border:true ? '' : "2px solid rgb(10, 100, 240)",
                                boxSizing:"border-box",
                                marginRight:"5px",
                                marginLeft:"5px" 
                             }}    
                        >        
                        </div>  
                    </div> 
                    <div style={{fontSize:"14px"}}>Never</div> 
                </div>         


                <div style={{
                   display:"flex",
                   justifyContent:"space-between", 
                   alignItems:"center"
                }}>
                    <div style={{display:"flex", alignItems:"center"}}>     
                        <div>
                            <div   
                                onClick={(e) => {}}
                                style={{
                                    backgroundColor:true ? 'rgb(10, 100, 240)' : '',
                                    width:"15px",  
                                    height:"15px",
                                    borderRadius:"50px",
                                    display:"flex",
                                    justifyContent:"center",
                                    position:"relative", 
                                    border:true ? '' : "2px solid rgb(10, 100, 240)",
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
                            max={end}
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
                    <div style={{display:"flex",alignItems:"center"}}>    
                        <div>
                            <div onClick={(e) => {}}
                                style={{ 
                                    backgroundColor:true ? 'rgb(10, 100, 240)' : '',
                                    width:"15px",  
                                    height:"15px",
                                    borderRadius:"50px",
                                    display:"flex",
                                    justifyContent:"center",
                                    position:"relative", 
                                    border:true ? '' : "2px solid rgb(10, 100, 240)",
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
              <div style={{color:"black", cursor:"default", padding:"5px"}}>
                    Cancel
              </div> 
              <div style={{color:"rgb(10, 100, 240)", cursor:"default", padding:"5px"}}>
                    Done
              </div>
            </div>    


            </div>

        </div>
        </div>
    }
}



let WeekDay = (selected:string, day:string, index:number, onClick:(day:string) => void) : JSX.Element => {
    return <div
        key={day}
        onClick={(e) => onClick(day)}  
        style={{   
            backgroundColor:selected===day ? 'rgb(10, 100, 240)' : 'rgba(235,235,235,1)',
            color:selected===day ? "white" : 'rgb(100,100,100)',
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
        {day}
    </div> 
}   