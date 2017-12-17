import '../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
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
import { byTags, getDateFromObject, getDayName, objectsToHashTableByDate, getDatesRange, keyFromDate } from '../utils';



  


interface UpcomingProps{
    dispatch:Function,
    selectedTodoId:string,
    todos:Todo[],
    projects:Project[],
    selectedTag:string,
    tags:string[],
    rootRef:HTMLElement 
}
 



interface UpcomingState{
    objects : { date : Date, todos:Todo[], projects:Project[] }[]
}






export class Upcoming extends Component<UpcomingProps,UpcomingState>{


    constructor(props){
        super(props);


        this.state = {
            objects:[] 
        } 

    }  


   
    onError = (e) => console.log(e); 


  
    shouldComponentUpdate(nextProps:UpcomingProps, nextState:UpcomingState){
 
        if(this.state.objects!==nextState.objects){
           return true; 
        }
        

        if(this.props.todos!==nextProps.todos){
            return true;
        }


        if(this.props.tags!==nextProps.tags){
            return true;
        }


        if(this.props.projects!==nextProps.projects){
            return true;
        }


        if(this.props.selectedTag!==nextProps.selectedTag){
            return true;
        }


        return false;
 
    }



    componentDidMount(){
        
        this.setState({objects:this.generateCalendarObjects(20)})

    }  


    generateCalendarObjects = (n) : { date : Date, todos:Todo[], projects:Project[] }[] => {
        
        let objects = [...this.state.objects];

        let table = objectsToHashTableByDate(this.props);

        let range : Date[] = [];


        if(objects.length===0){

            range = getDatesRange( new Date(), n, true, true ); 
        
        }else{  

            range = getDatesRange( objects[ objects.length - 1 ].date, n, false, true );

        }
 

        for(let i = 0; i<range.length; i++){

            let object = {
                date : range[i], 
                todos : [], 
                projects : [] 
            }

            let key = keyFromDate(range[i]);

            let entry : any[] = table[key];

            if(entry===undefined){

               objects.push(object);

            }else{

               object.todos = entry.filter( (el:Todo) => el.type==="todo" ); 
               object.projects = entry.filter( (el:Project) => el.type==="project" ); 
               objects.push(object);

            }

            

        }
        

        return objects;


    }


    objectToComponent = (

        object : { date : Date, todos:Todo[], projects:Project[] }, 

        idx:number

    ) : JSX.Element => {


        return <div key={idx}>
            <CalendarDay 
 
                idx={idx} 
   
                day={object.date.getDate()}
 
                dayName={getDayName(object.date)}
 
                todos={object.todos}

                projects={object.projects}  

                events={[]}

                areas={[]}   
                
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
  

                <div>{ this.state.objects.map(this.objectToComponent) }</div>

    
                <div style={{width:"100%", height:"1px"}}> 
                    <Waypoint 
                        onEnter={({ previousPosition, currentPosition, event }) => {
                            
                            this.setState({objects:this.generateCalendarObjects(20)})

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

                    this.props.events.length===0 ? null :

                    <div 
                    style={{
                        display:"flex", 
                        flexDirection:"column", 
                        width:"100%",
                        paddingTop : "10px",
                        paddingBottom : "10px"
                    }}> 
                    {  
                        this.props.events
                        .map((e:Event) =>  
                            <div 
                            key={e._id}
                            style={{
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

                    this.props.areas.length===0 ? null :

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

                            <div key={a._id} style={{display:"flex", padding: "18px"}}>
                                <div style={{ marginRight:"5px" }}>
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
                                        fontWeight: "bold",
                                        WebkitUserSelect: "none",
                                        cursor:"default", 
                                        color: "rgb(100, 100, 100)",
                                        fontFamily: "sans-serif"
                                    }}
                                >    
                                    {a.name.length===0 ? "New Area" : a.name} 
                                </div>

                            </div>

                        )
                    }     
                    </div>

                }
                   

                {

                    this.props.projects.length===0 ? null :
 
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

                                <div key={p._id} style={{display:"flex", padding: "18px"}}>
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
                                            fontWeight: "bold",
                                            color: "rgb(100, 100, 100)",
                                            fontFamily: "sans-serif",
                                            WebkitUserSelect: "none", 
                                            cursor:"default" 
                                        }}
                                >  
                                       {p.name.length===0 ? "New Project" : p.name} 
                                </div>
        
                                </div>   
        
                            )
                        }     
                    </div>

                } 


                { 

                    this.props.todos.length===0 ? null :
 
                    <div style={{
                        display:"flex",  
                        flexDirection:"column", 
                        width:"100%",
                        paddingTop : "10px",
                        paddingBottom : "10px" 
                    }}>   
 
                        <TodosList 
                            dispatch={this.props.dispatch}    
                            filters={[byTags(this.props.selectedTag)]}
                            selectedCategory={"upcoming"}
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