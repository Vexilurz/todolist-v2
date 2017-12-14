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
 

let getDatesRange = (range:number) => (start:Date) => {

    let dateArray = [];

    for(let i=0; i<range; i++)
        dateArray.push(addDays(start,i))
    
    return dateArray;

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
    range:Date[]
}


export class Upcoming extends Component<UpcomingProps,UpcomingState>{


    step:number;


    constructor(props){
        super(props);
        this.step = 20;   
        this.state = {
            range:[new Date()], 
        } 
    } 
 

    
 
    shouldComponentUpdate(nextProps:UpcomingProps, nextState:UpcomingState){


        if(this.state.range.length!==nextState.range.length){
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

        this.setState({
  
            range : compose(
              concat(this.state.range),  
              getDatesRange(this.step), 
              last as any,   
            )(this.state.range)
            

        }); 
 
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
        



    itemToComponent = (date:Date) => {


        let todosByDate = (date:Date) => (t:Todo) : boolean => { 

            if(isNil(t.attachedDate))
               return false; 

            return moment(t.attachedDate).isSame(date, 'day');
        
        }



        let eventsByDate = (date:Date) => (e:Event) => {  

            if(isNil(e.date)) 
               return false; 
            
            return moment(e.date).isSame(date, 'day'); 
        
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

                todos={
                    
                    
                    this.props.todos
                    .filter(this.byTags)
                    .filter(todosByDate(date))
                
                
                }

                projects={
                    
                     
                    this.props.projects
                    .filter(this.byTags)
                    .filter(projectsByDate(date))
                
                
                }  

                events={
                    

                    this.props.events
                    .filter(this.byTags)
                    .filter(eventsByDate(date))
                

                }

                areas={
                    

                    this.props.areas
                    .filter(this.byTags)
                    .filter(areasByDate(date))
                

                }

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
                    
                    this.state.range.map(this.itemToComponent)
                    
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
        }}> 

 
                <div style={{ 
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    paddingTop : "10px",
                    paddingBottom : "10px"
                }}>     

                    <div style={{ 
                        width: "80px",
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