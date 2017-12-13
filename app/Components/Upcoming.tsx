import '../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, uniq,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, any,
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, 
    groupBy, concat, flatten, toPairs, adjust, prepend, fromPairs, last 
} from 'ramda';
import { ipcRenderer } from 'electron'; 
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import Popover from 'material-ui/Popover';
import Button from 'material-ui-next/Button'; 
import { Footer } from '../Components/Footer'; 
import { Tags } from '../Components/Tags';
import { Category } from '../MainContainer';
import { TodosList } from '../Components/TodosList';
import { Todo,Event, Project, Area } from '../databaseCalls';
import { FadeBackgroundIcon } from '../Components/FadeBackgroundIcon';
import NewAreaIcon from 'material-ui/svg-icons/action/tab';

import * as Waypoint from 'react-waypoint';



let getDayName = (d:Date) => { 
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let dayName = days[d.getDay()];
    return dayName;
}


let addDays = (date:Date, days:number) => {
    let next = new Date();

    next.setDate(date.getDate() + days);

    return next;  
}
 

let getDatesRange = (startDate, stopDate) => {

    let dateArray = new Array();

    let currentDate = startDate; 

    while (currentDate <= stopDate) {
        dateArray.push(new Date (currentDate));
        currentDate = addDays(currentDate, 1);
    } 

    return dateArray;

}

 



interface UpcomingProps{
    todos:Todo[],
    projects:Project[],
    events:Event[],
    areas:Area[]
}


interface UpcomingState{
    range:Date[]
}


export class Upcoming extends Component<UpcomingProps,UpcomingState>{

    step:number;

    constructor(props){
        super(props);
        this.step = 10;  
        this.state = {
            range:[new Date()], 
        } 
    } 

 
    onError = (e) => console.log(e); 


    selectCurrentRange = () => {

        let start : Date = last(this.state.range);
        let end : Date = addDays(start, this.step);
 
        this.setState({range:getDatesRange(start,end)}); 

    }
  

    itemToComponent = (date:Date) => {

        let todosByDate = (date:Date) => (t:Todo) => { 
            
            return t.attachedDate.toDateString() === date.toDateString()
        
        }


        let eventsByDate = (date:Date) => (e:Event) => { 
            
            return e.date.toDateString() === date.toDateString()
        
        }


        let projectsByDate = (date:Date) => (p:Project) => {
            
            return any( todosByDate(date) )(p.attachedTodos)

        }


        let areasByDate = (date:Date) => (a:Area) =>  {
            
            return any( projectsByDate(date) )(a.attachedProjects)

        }

  
        return <div key={date.getTime()}>
            <CalendarDay 

                day={date.getDate()}
 
                dayName={getDayName(date)}

                todos={this.props.todos.filter(todosByDate(date))}

                projects={this.props.projects.filter(projectsByDate(date))}  

                events={this.props.events.filter(eventsByDate(date))}

                areas={this.props.areas.filter(areasByDate(date))}
 
            />
        </div>
 

    }
  

    render(){
        return <div style={{height:"100%"}}> 

                {this.state.range.map(this.itemToComponent)}

        </div> 
    }


 
}




interface CalendarDayProps{
    day:number, 
    dayName:string,
    events:Event[],
    projects:Project[],
    todos:Todo[],
    areas:Area[] 
}
 

interface CalendarDayState{

}

 
export class CalendarDay extends Component<CalendarDayProps,CalendarDayState>{

    constructor(props){

        super(props)
 
    }

 

    render(){

      return <div style={{
            display:"flex",
            flexDirection:"column", 
            paddingTop:"50px", 
            paddingBottom:"50px",
        }}> 







 
                <div style={{ 
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around"
                }}>

                    <div style={{
                        width: "10%",
                        fontWeight: 900,
                        fontSize: "45px",
                        fontFamily: "sans-serif"
                    }}>
                        {this.props.day} 
                    </div> 
                 
                    <div style={{
                        width: "82%",
                        fontSize: "17px",
                        color: "dimgray",
                        fontFamily: "sans-serif",
                        display: "flex",
                        height: "40px",
                        alignItems: "flex-end",
                        fontWeight: "bolder",
                        borderTop: "1px solid rgba(100,100,100,0.3)",
                        marginTop: "15px"
                    }}> 
                        {this.props.dayName}
                    </div>  

                </div>  
                 






               <div style={{display:"flex", flexDirection:"column", width:"100%"}}> 
               {
                  this.props.events.map((e:Event) => 

                    <div style={{
                        borderLeft:"5px solid black", 
                        fontSize:"14px", 
                        color:"rgba(100,100,100,0.1)"
                    }}>
                        {e.title}
                    </div>

                  )
               }
               </div>








               <div> 
                {
                    this.props.areas.map((a:Area) => 

                        <div style={{display:"flex"}}>
                            <div>
                            <NewAreaIcon 
                                style={{
                                    color:"lightblue", 
                                    width:"18px",
                                    height:"18px"
                                }}
                            />  
                           </div>  
 
                           <div 
                                style={{
                                    fontSize:"17px", 
                                    color:"rgba(10,10,10,1)"
                                }}
                           >   
                                {a.name} 
                           </div>
 
                        </div>
 
                    )
                }     
               </div>
          







               <div>  
                {
                    this.props.projects.map((p:Project) => 

                        <div style={{display:"flex"}}>
                            <div>
                                <div style={{ 
                                    width:"18px",     
                                    height:"18px", 
                                    borderRadius:"30px",
                                    border:"5px solid rgba(108, 135, 222, 0.8)",
                                    boxSizing:"border-box",
                                    marginRight:"5px" 
                                }}> 
                                </div>  
                           </div>
 
                           <div 
                                style={{
                                    fontSize:"17px", 
                                    color:"rgba(10,10,10,1)"
                                }}
                           >  
                                {p.name} 
                           </div>
 
                        </div> 
 
                    )
                }     
               </div>







               <div> 
                {
                    this.props.todos.map((t:Todo) =>  

                        <div style={{display:"flex"}}>


                            <div>
                                <div 
                                    style={{  
                                        width: "14px",
                                        border: "2px solid rgba(200,200,200,0.7)",
                                        borderRadius: "3px",
                                        backgroundColor:'', 
                                        height: "14px",    
                                        boxSizing: "border-box",   
                                        display: "flex", 
                                        alignItems: "center"
                                    }}>   
                                </div>   
                           </div>
 
                           <div 
                                style={{
                                    fontSize:"17px", 
                                    color:"rgba(10,10,10,1)"
                                }}
                           >  
                                {t.title} 
                           </div>
 
                        </div>
 
                    )
                }      
               </div>



               


      </div>      

    }
} 