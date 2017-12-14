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
let moment = require("moment");
import * as Waypoint from 'react-waypoint';
import { ContainerHeader } from './ContainerHeader';



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


 

interface UpcomingProps{
    dispatch:Function,
    tags:string[],
    selectedTag:string, 
    todos:Todo[],
    projects:Project[],
    events:Event[],
    areas:Area[],
    selectedTodoId:string, 
    rootRef:HTMLElement
}




 


interface UpcomingState{
    dates:Date[]
}






export class Upcoming extends Component<UpcomingProps,UpcomingState>{

    step : number; 

    constructor(props){
        super(props);

        this.step = 10;

        this.state = {
            dates:[new Date()] 
        } 

    }  
   

  
    shouldComponentUpdate(nextProps:UpcomingProps, nextState:UpcomingState){
 
 
        if(this.state.dates!==nextState.dates){
           return true; 
        }
        

        if(this.props.todos!==nextProps.todos){
            return true;
        }


        if(this.props.events!==nextProps.events){
            return true;
        }


        if(this.props.tags!==nextProps.tags){
            return true;
        }


        if(this.props.projects!==nextProps.projects){
            return true;
        }


        if(this.props.areas!==nextProps.areas){
            return true;
        }


        if(this.props.selectedTag!==nextProps.selectedTag){
            return true;
        }


        if(this.props.selectedTodoId!==nextProps.selectedTodoId){
            return true;
        }


        return false;
 
    }

  
    
    onError = (e) => console.log(e); 
 
 

    selectCurrentRange = () => {

        Date.prototype["addDays"] = function(days) {
            var dat = new Date(this.valueOf());
            dat.setDate(dat.getDate() + days);
            return dat;
        };

        let dates = [...this.state.dates];

        let start = new Date(dates[this.state.dates.length-1]);

        for(let i=1; i<=this.step; i++){

            let next = new Date(start)["addDays"](i);

            dates.push(next);

        }

        this.setState({ dates });  
 
    }   

       
 
    componentDidMount(){
        
        this.selectCurrentRange();

    }

 

    byTags = (item:any) : boolean => { 
        
        if(this.props.selectedTag==="All") 
            return true;    
    

        if(this.props.selectedTag==="") 
            return true; 

    
        if(isNil(item))
            return false;

        
        if(isNil(item.attachedTags))    
            return false; 
            
            
        return contains(this.props.selectedTag,item.attachedTags);
            
    } 
    
    
    todosByDate = (date:Date, t:Todo) : boolean => { 
        
        if(isNil(t.attachedDate)) 
            return false; 

        let attachedDate = new Date(t.attachedDate);   
        
        date.setHours(0, 0, 0, 0); 
        attachedDate.setHours(0, 0, 0, 0);  

        return date.getTime() === attachedDate.getTime();

    }



    eventsByDate = (date:Date, e:Event) => {  

        if(isNil(e.date)) 
            return false;  

        let attachedDate = new Date(e.date);      

        date.setHours(0, 0, 0, 0); 
        attachedDate.setHours(0, 0, 0, 0);  

        return date.getTime() === attachedDate.getTime();
        
    } 



    itemToComponent = (date:Date, idx:number) : JSX.Element => {

        let todos = this.props.todos.filter((i:Todo) => this.byTags(i) && this.todosByDate(date,i));

        let events = this.props.events.filter((i:Event) => this.byTags(i) && this.eventsByDate(date,i));


        let todosIds : any = map((t:Todo) => t._id)(todos);

        let eventsIds : any = map((e:Event) => e._id)(events); 
  

        let projects = this.props.projects.filter((p:Project) => {

                if(isNil(p.attachedTodosIds))
                    return false;
                
                if(isEmpty(p.attachedTodosIds))
                    return false;   

                for(let i=0; i<p.attachedTodosIds.length; i++){

                    if(contains(p.attachedTodosIds[i])(todosIds))

                    return true; 
                }

                return false;

        })  
        

        let projectIds : any = map((p : Project) => p._id)(projects); 


        let areas = this.props.areas.filter((a:Area) => {
            
                if(isNil(a.attachedProjectsIds))
                    return false;
                
                if(isEmpty(a.attachedProjectsIds))
                    return false;   

                for(let i=0; i<a.attachedProjectsIds.length; i++){

                    if(contains(a.attachedProjectsIds[i])(projectIds))

                        return true;
                } 

                return false;

        })

  
        return <div key={idx}>
            <CalendarDay 
 
                idx={idx} 
   
                day={date.getDate()}
 
                dayName={getDayName(date)}
 
                todos={todos}

                projects={projects}  

                events={events}

                areas={areas}    
 
                dispatch={this.props.dispatch}

                selectedTodoId={this.props.selectedTodoId}

                selectedTag={this.props.selectedTag}

                rootRef={this.props.rootRef}

                tags={this.props.tags}
 
            /> 
        </div>
  
    }
  

    render(){ 
        return <div> 
             
                <ContainerHeader 
                    selectedCategory={"upcoming"} 
                    dispatch={this.props.dispatch} 
                    tags={this.props.tags}
                    selectedTag={this.props.selectedTag}
                />
  

                <div>{ 
                    
                    this.state.dates.map(this.itemToComponent)
                    
                }</div>

    
                <div style={{width:"100%", height:"1px"}}> 
                    <Waypoint 
                        onEnter={({ previousPosition, currentPosition, event }) => {
                            
                            this.selectCurrentRange()
                              
                        }}
                        onLeave={({ previousPosition, currentPosition, event }) => {
                            


                        }}
                    />
                </div>
 
        </div> 
    }
 

 
}




interface CalendarDayProps{ 
    idx:number,
    day:number, 
    dayName:string,
    events:Event[],
    projects:Project[],
    todos:Todo[],
    areas:Area[],
    dispatch:Function, 
    selectedTodoId:string,
    selectedTag:string,
    rootRef:HTMLElement,
    tags:string[]
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
            WebkitUserSelect: "none" 
        }}> 

 
                <div style={{ 
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    paddingTop : "10px",
                    paddingBottom : "10px",
                    WebkitUserSelect: "none" 
                }}>     

                    <div style={{ 
                        width: "80px",
                        fontWeight: 900,
                        fontSize: "45px",
                        fontFamily: "sans-serif",
                        WebkitUserSelect: "none" 
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
                        marginTop: "15px",
                        WebkitUserSelect: "none" 
                    }}>  
                        {
                            this.props.idx===0 ? "Today" :
                            this.props.idx===1 ? "Tomorrow" :
                            this.props.dayName
                        }
                    </div>   

                </div>  
                 

                {

                    isEmpty(this.props.events) ? null :
                    <div style={{
                        display:"flex", 
                        flexDirection:"column", 
                        width:"100%",
                        paddingTop : "10px",
                        paddingBottom : "10px"
                    }}> 
                    {  
                        this.props.events
                        .map((e:Event) => 

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

                }
 

                {

                    isEmpty(this.props.areas) ? null :

                    <div style={{
                        display:"flex", 
                        flexDirection:"column", 
                        width:"100%",
                        paddingTop : "10px",
                        paddingBottom : "10px"
                    }}> 
                    {
                        this.props.areas
                        .map((a:Area) => 

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

                }
                   

                {

                    isEmpty(this.props.projects) ? null :
 
                    <div style={{
                            display:"flex", 
                            flexDirection:"column", 
                            width:"100%",
                            paddingTop : "10px",
                            paddingBottom : "10px"
                    }}>    
                        {
                            this.props.projects
                            .map((p:Project) => 

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

                }


                { 

                    isEmpty(this.props.todos) ? null :

                    <div style={{
                        display:"flex", 
                        flexDirection:"column", 
                        width:"100%",
                        paddingTop : "10px",
                        paddingBottom : "10px"
                    }}>   
                        <TodosList 
                            dispatch={this.props.dispatch}   
                            selectedCategory={"upcoming"}
                            selectedTodoId={this.props.selectedTodoId}
                            selectedTag={this.props.selectedTag}  
                            rootRef={this.props.rootRef} 
                            todos={this.props.todos} 
                            tags={this.props.tags} 
                        /> 
                    </div>

                }
                   
      </div>      

    }
} 