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
        return <div
            style={{
                position:"fixed",
                top:"50%",
                left:"50%"
            }}
        > 
        
        <div style={{
            display:"flex", 
            flexDirection:"column",
            alignItems:"center",
            justifyContent:"flex-start",
            width:"100%",
            height:"100%"
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
                <div style={{color:"rgba(100,100,100,0.8)", fontSize:"15px"}}>
                    Repeat every
                </div>   
                <input 
                  style={{backgroundColor:"rgba(235,235,235,1)"}} 
                  type="number" 
                />
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

            <div style={{display:"flex", flexDirection:"column"}}>
                <div style={{color:"rgba(100,100,100,0.8)", fontSize:"15px"}}>Repeat on</div>

                <div style={{display:"flex"}}>
                {
                    ['M','T','W','T','F','S','S'].map((day:string) => WeekDay('W',day,(day) => {}))
                }
                </div>
            </div>

            <div>

                <div style={{color:"rgba(100,100,100,0.8)", fontSize:"15px"}}>Ends</div> 

                <div style={{display:"flex"}}>    
                    <div>
                        <div  onClick={(e) => {}}
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
                    <div style={{color:"rgba(100,100,100,0.8)", fontSize:"15px"}}>Never</div> 
                </div>         


                <div>
                    <div style={{display:"flex"}}>    
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
                        <div style={{color:"rgba(100,100,100,0.8)", fontSize:"15px"}}>On</div> 
                    </div>  
                    <div>
                        <input type="date"/>
                    </div>
                </div>


                <div>
                    <div style={{display:"flex"}}>    
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
                        <div style={{color:"rgba(100,100,100,0.8)", fontSize:"15px"}}>After</div> 
                    </div>  
                    <div style={{backgroundColor:"rgba(235,235,235,1)"}}>
                        <input style={{backgroundColor:"rgba(0,0,0,0)"}} type="number"/>
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
    }
}



let WeekDay = (selected:string, day:string, onClick:(day:string) => void) : JSX.Element => {
    return <div
        onClick={(e) => onClick(day)}  
        style={{   
            backgroundColor:selected===day ? 'rgb(10, 100, 240)' : 'rgba(235,235,235,1)',
            color:selected===day ? "white" : 'rgb(180,180,180)',
            width:"15px",  
            height:"15px",
            borderRadius:"50px",
            display:"flex",
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