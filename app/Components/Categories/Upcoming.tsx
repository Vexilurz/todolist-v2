import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';   
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron'; 
import { Component } from "react"; 
import { Provider, connect } from "react-redux"; 
import Popover from 'material-ui/Popover';
import { Footer } from '../../Components/Footer'; 
import { Tags } from '../../Components/Tags';
import { TodosList } from '../../Components/TodosList';
import { Todo,Project, Area } from '../../database';
import NewAreaIcon from 'material-ui/svg-icons/action/tab';
let moment = require("moment");
import * as Waypoint from 'react-waypoint';
import { ContainerHeader } from '.././ContainerHeader';
import { 
    byTags, 
    getDateFromObject, 
    getDayName, 
    getDatesRange, 
    keyFromDate, 
    daysLeftMark,
    stringToLength,
    byNotCompleted,
    byNotDeleted,
    allPass
} from '../../utils';  
import { getProjectLink } from '../Project/ProjectLink';
  
 

let objectsToHashTableByDate = (props) => {
    
    let todos = props.todos;

    let projects = props.projects;

    let filters = [
        byTags(props.selectedTag),
        byNotCompleted, 
        byNotDeleted  
    ];    

    let objects = [...todos, ...projects].filter( i => allPass(filters,i)); 

    let objectsByDate = {};

    if(objects.length===0)
        return [];


    for(let i=0; i<objects.length; i++){


        let date : Date = getDateFromObject(objects[i]);

        let key : string = keyFromDate(date);

        if(objectsByDate[key]===undefined){

            objectsByDate[key] = [objects[i]];

        }else{

            objectsByDate[key].push(objects[i]);

        }


    }   

    return objectsByDate;

}   







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
    
        return true;
 
    }



    componentDidMount(){
        
        this.setState({objects:this.generateCalendarObjects(20)})

    }  


    generateCalendarObjects = (n) : { date : Date, todos:Todo[], projects:Project[] }[] => {
        
        let objects = [...this.state.objects];


        var t0 = performance.now();
        let table = objectsToHashTableByDate(this.props);
        var t1 = performance.now();
        console.log("Call to objectsToHashTableByDate (Upcoming) took " + (t1 - t0) + " milliseconds.");
         
        

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
                            
                            var t0 = performance.now();
                            let objects = this.generateCalendarObjects(20);
                            var t1 = performance.now();
 
                            console.log("Call to generateCalendarObjects(20) (Upcoming) took " + (t1 - t0) + " milliseconds.");
                             
                            this.setState({objects});

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
                            .map((p:Project, index:number) : JSX.Element => 
                                getProjectLink({width:"15px", height:"15px"},p, index, this.props.dispatch)
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
                            filters={[]} 
                            isEmpty={(empty:boolean) => {}} 
                            dispatch={this.props.dispatch}     
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