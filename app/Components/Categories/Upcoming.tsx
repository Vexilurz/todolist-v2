import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';   
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { Provider, connect } from "react-redux"; 
import Popover from 'material-ui/Popover';
import { Tags } from '../../Components/Tags';
import { TodosList } from '../../Components/TodosList';
import { Todo,Project, Area, Calendar, getTodos } from '../../database';
let moment = require("moment");
import * as Waypoint from 'react-waypoint';
import { ContainerHeader } from '.././ContainerHeader';
import {  
    byTags, 
    getDayName, 
    getDatesRange, 
    keyFromDate, 
    daysLeftMark,
    byNotCompleted,
    byNotDeleted,
    getTagsFromItems,
    getMonthName,
    selectNeverTodos,
    updateNeverTodos,
    sameDay,
    yearFromDate,
    convertTodoDates,
    getRangeDays,
} from '../../utils/utils';  
import {
    allPass, uniq, isNil, compose, not, last, isEmpty, toPairs, map, flatten, prop, uniqBy, groupBy, defaultTo 
} from 'ramda';
import { ProjectLink } from '../Project/ProjectLink';
import { Category, filter, selectTodos } from '../MainContainer';
import { repeat, setRepeatedTodos } from '../RepeatPopup';
import { Hint } from './Today'; 
import { CalendarEvent } from '../Calendar';
import { isDate } from '../../utils/isSomething';
import { assert } from '../../utils/assert';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { timeOfTheDay } from '../../utils/time';


type Item = Project | Todo | CalendarEvent
 
interface objectsByDate{ [key:string]:Item[] }  


 
let haveDate = (item : Project | Todo) : boolean => {  
    if(item.type==="project"){  
       return not(isNil(item.deadline)); 
    }else if(item.type==="todo"){ 
       return not(isNil(item["attachedDate"])) || not(isNil(item.deadline));
    }
}



let objectsToHashTableByDate = (props:UpcomingProps) : objectsByDate => {
    
    let {showCalendarEvents,todos,projects,calendars} = props;

    let filters = [  
        haveDate,  
        byTags(props.selectedTag),
        byNotCompleted, 
        byNotDeleted  
    ];    

    let splitLongEvents = (events:CalendarEvent[]) : CalendarEvent[] => {
        if(isNil(events) || isEmpty(events)){ return [] }

        return compose(
            flatten,
            map(
                (event:CalendarEvent) => {
                    return getRangeDays(event.start, event.end, 1, true).map((date) => ({...event,start:date}))
                }
            ) 
        )(events) as CalendarEvent[];  
    };
    
    let items = filter([...todos, ...projects], i => allPass(filters)(i), "upcoming");
    
    if(showCalendarEvents && !isNil(calendars)){ 
        let events : CalendarEvent[] = flatten(
            calendars  
            .filter((c:Calendar) => c.active)
            .map( 
                (c:Calendar) => c.events
                    .filter((event:CalendarEvent) => isDate(event.end) && isDate(event.start))
                    .map(
                        (event:CalendarEvent) => ({
                            ...event,
                            end:new Date(event.end.getTime()-1)
                        })
                    )  
            )
        );
 
        if(not(isEmpty(events))){
            let {sameDayEvents,multipleDaysEvents} = groupBy(
                (event) => sameDay(event.start,event.end) ? "sameDayEvents" : "multipleDaysEvents", 
                events 
            );
            
            items.push(...splitLongEvents(multipleDaysEvents)); 
            items.push(
                ...defaultTo([],sameDayEvents)
                    .map(
                        (event:CalendarEvent) => ({...event,end:new Date(event.end.getTime()+1)})
                    )
            );
        }
    };    

    let objectsByDate : objectsByDate = {};

    if(items.length===0){  
       return {objectsByDate:[],tags:[]};
    }
  
    for(let i=0; i<items.length; i++){
        let item = items[i] as any; 
        let keys = [];
        
        if(isDate(item.attachedDate)){
           keys.push(keyFromDate(item.attachedDate));
        }   

        if(isDate(item.deadline)){ 
           keys.push(keyFromDate(item.deadline));
        } 

        if(isDate(item.start)){
           keys.push(keyFromDate(item.start));
        }  

        uniq(keys)
        .map(  
            (key:string) => {
                if(isNil(objectsByDate[key])){
                   objectsByDate[key] = [items[i]];
                }else{
                   objectsByDate[key].push(items[i]);
                }
            } 
        )
    }    
    
    return objectsByDate; 
}   



interface UpcomingProps{
    limit:Date, 
    dispatch:Function,
    showCalendarEvents:boolean,
    selectedCategory:Category, 
    groupTodos:boolean, 
    todos:Todo[], 
    selectedTodo:Todo,
    moveCompletedItemsToLogbook:string, 
    calendars:Calendar[], 
    projects:Project[],  
    selectedAreaId:string,
    selectedProjectId:string, 
    areas:Area[], 
    selectedTag:string,
    rootRef:HTMLElement 
}  
 


interface UpcomingState{
    objects : {date:Date, todos:Todo[], projects:Project[]}[],
    enter : number
}


 
export class Upcoming extends Component<UpcomingProps,UpcomingState>{

    n:number
    
    constructor(props){
        super(props);
        this.n = 10;  
        this.state = {objects:[], enter:1}; 
    }    
     

    onEnter = ({ previousPosition, currentPosition }) => { 
        let objectsByDate = objectsToHashTableByDate(this.props);
        let from = last(this.state.objects);
        let {dispatch,limit,areas,projects} = this.props;

        if(isNil(from)){ return }

        assert(isDate(from.date), `from.date is not Date. ${from}. onEnter.`);

        let range = getDatesRange(from.date, this.n, false, true);
        let objects = this.generateCalendarObjectsFromRange(range, objectsByDate); 
        let todos = flatten(objects.map((object) => object.todos)) as any[];

        let never = selectNeverTodos(todos);
        let day = 1000 * 60 * 60 * 24;

        if( (last(range).getTime() + day) >= limit.getTime() ){
            getTodos(this.onError)(true, 1000000)
            .then(todos => todos.map(convertTodoDates)) 
            .then (todos => selectTodos(areas, projects, todos, limit))
            .then(
                (selected:Todo[]) => {
                    dispatch({type:"setTodos", load:selected});
                    dispatch({type:"limit", load:yearFromDate(limit)}); 
                }
            )  
        }
        
        if(isEmpty(never)){
            this.setState({objects:[...this.state.objects,...objects], enter:this.state.enter+1});
        }else{
            this.setState({enter:this.state.enter+1}, () => updateNeverTodos(dispatch,never,limit));
        }   
    }   


    onError = (e) => globalErrorHandler(e);


    getObjects = (props:UpcomingProps,n:number) : { 
        date: Date;
        todos: Todo[]; 
        projects: Project[];
        events: any[]
    }[] => { 
        let objectsByDate = objectsToHashTableByDate(props);
        let range = getDatesRange(new Date(), n, true, true); 
        let objects = this.generateCalendarObjectsFromRange(range, objectsByDate); 
        return objects;
    } 


    componentDidMount(){
        this.setState({objects:this.getObjects(this.props,this.n)})
    }   
     
    
    componentWillReceiveProps(nextProps:UpcomingProps){
        if( 
            nextProps.projects!==this.props.projects ||
            nextProps.todos!==this.props.todos ||
            nextProps.areas!==this.props.areas ||
            nextProps.calendars!==this.props.calendars ||
            nextProps.showCalendarEvents!==this.props.showCalendarEvents
        ){       
            
            this.setState({objects:this.getObjects(nextProps, this.n * this.state.enter)});

        }else if(nextProps.selectedTag!==this.props.selectedTag){  

            this.setState({objects:this.getObjects(nextProps, this.n), enter:1}); 
        }   
    } 


    generateCalendarObjectsFromRange = ( 
        range:Date[], 
        objectsByDate:objectsByDate   
    ) : {date:Date, todos:Todo[], projects:Project[], events:CalendarEvent[]}[] => {

        let objects = [];

        for(let i = 0; i<range.length; i++){

            let object = {
                date : range[i], 
                todos : [], 
                projects : [],
                events : [] 
            }
 
            let key : string = keyFromDate(range[i]);
            let entry = objectsByDate[key];
 
            if(isNil(entry)){ 
               objects.push(object);
            }else{
               object.todos = entry.filter((el:Todo) => el.type==="todo"); 
               object.projects = entry.filter((el:Project) => el.type==="project"); 
               object.events = entry.filter((el:CalendarEvent) => isDate(el.start)); 
               objects.push(object);  
            }
        } 
         
        return objects; 
    }


    objectToComponent = (
        object : { date : Date, todos:Todo[], projects:Project[], events : any[] }, 
        idx:number
    ) : JSX.Element => {

        let day = object.date.getDate();
        let month = getMonthName(object.date);
        let showMonth = idx===0 || day===1;

        return <div  style={{WebkitUserSelect:"none"}} key={idx}>

            { 
                not(showMonth) ? null :  
                <div 
                    style={{
                        WebkitUserSelect: "none", 
                        display:"flex",
                        cursor:"default", 
                        fontSize:"x-large",
                        width:"100%", 
                        fontWeight:"bold"
                    }} 
                >  
                    {month}  
                </div>
            }
 
            <CalendarDay 
                idx={idx} 
                day={day} 
                dayName={getDayName(object.date)}
                groupTodos={this.props.groupTodos}
                selectedTodos={object.todos} 
                selectedEvents={object.events}
                todos={this.props.todos}
                areas={this.props.areas}
                scheduledProjects={object.projects}  
                moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                projects={this.props.projects}
                selectedAreaId={this.props.selectedAreaId} 
                selectedCategory={this.props.selectedCategory as Category}
                selectedTodo={this.props.selectedTodo}
                selectedProjectId={this.props.selectedProjectId}
                dispatch={this.props.dispatch}
                selectedTag={this.props.selectedTag}
                rootRef={this.props.rootRef}
            />  
        </div>
    } 


    render(){ 
        let {todos,projects,selectedTag,dispatch,selectedCategory} = this.props;
        let tags = getTagsFromItems(todos);

        return <div id={`${selectedCategory}-list`} style={{WebkitUserSelect:"none"}}> 
                <div style={{paddingBottom:"20px"}}>
                    <ContainerHeader 
                        selectedCategory={selectedCategory} 
                        dispatch={dispatch}  
                        tags={tags}
                        showTags={true} 
                        selectedTag={selectedTag} 
                    />
                </div>
                <div className={`no-print`}>
                    <Hint {
                        ...{
                            text:`These are your tasks for the next days. 
                            Do you also want to include the events from your calendar?`
                        } as any  
                    }/>
                </div> 
                <div>{this.state.objects.map(this.objectToComponent)}</div>
                <div className={`no-print`} style={{width:"100%", height:"1px"}}> 
                    <Waypoint  
                        onEnter={this.onEnter} 
                        onLeave={({previousPosition, currentPosition, event}) => {}}
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
    scheduledProjects:Project[],
    areas:Area[], 
    selectedTodos:Todo[],
    selectedTodo:Todo, 
    groupTodos:boolean,
    selectedEvents:CalendarEvent[],
    todos:Todo[], 
    moveCompletedItemsToLogbook:string, 
    dispatch:Function, 
    selectedAreaId:string,
    selectedProjectId:string, 
    selectedCategory:Category,
    selectedTag:string,
    rootRef:HTMLElement
}

  
interface CalendarDayState{}

  
export class CalendarDay extends Component<CalendarDayProps,CalendarDayState>{

    constructor(props){ super(props) }

    render(){   
        
        let {
            selectedTodos,todos,scheduledProjects,
            day,idx,dayName,dispatch,selectedEvents
        } = this.props; 
         
        let events = uniqBy(prop("name"), selectedEvents) as CalendarEvent[];
        let wholeDay : CalendarEvent[] = events.filter((event) => not(sameDay(event.start,event.end)));
        let timed : CalendarEvent[] = events.filter((event) => sameDay(event.start,event.end));
               

        return <div style={{
            display:"flex",
            flexDirection:"column", 
            paddingTop:"20px", 
            paddingBottom:"20px",
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
                        {day} 
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
                            idx===0 ? "Today" :
                            idx===1 ? "Tomorrow" :
                            dayName
                        }
                    </div> 
                </div>    
                <div style={{
                    display:'flex', 
                    flexDirection:"column", 
                    alignItems:"flex-start", 
                    justifyContent:"flex-start"
                }}>  
                        {
                            wholeDay
                            .map(  
                                (event) => 
                                <div  key={`event-${event.name}`} style={{padding:"10px"}}>
                                <div style={{display:"flex",height:"20px",alignItems:"center"}}>
                                    <div style={{paddingRight:"5px",height:"100%",backgroundColor:"dimgray"}}></div>
                                    <div style={{fontSize:"14px",userSelect:"none",cursor:"default",fontWeight:500,paddingLeft:"5px",overflowX:"hidden"}}>   
                                        {event.name}  
                                    </div>
                                </div>
                                { 
                                    isNil(event.description) ? null :
                                    isEmpty(event.description) ? null :
                                    <div 
                                        style={{
                                            paddingLeft:"10px",
                                            textAlign:"left",
                                            fontSize:"14px",
                                            cursor:"default",
                                            userSelect:"none" 
                                        }}
                                    > 
                                        {event.description} 
                                    </div>
                                }
                                </div> 
                            )  
                        }
                        {
                            timed
                            .map(  
                                (event) => 
                                <div  key={`event-${event.name}`} style={{padding:"10px"}}>
                                    <div style={{display:"flex",height:"20px",alignItems:"center"}}>
                                    <div style={{paddingLeft:"5px", fontSize:"14px", fontWeight:500}}>
                                        {timeOfTheDay(event.start)}
                                    </div>
                                    <div style={{fontSize:"14px",userSelect:"none",cursor:"default",fontWeight:500,paddingLeft:"5px",overflowX:"hidden"}}>   
                                        {event.name}  
                                    </div>
                                    </div>
                                    { 
                                        isNil(event.description) ? null :
                                        isEmpty(event.description) ? null :
                                        <div 
                                            style={{
                                                paddingLeft:"10px",
                                                textAlign:"left",
                                                fontSize:"14px",
                                                cursor:"default",
                                                userSelect:"none" 
                                            }}
                                        > 
                                            {event.description} 
                                        </div>
                                    }
                                </div> 
                            )  
                        }
                </div>
                {
                    isEmpty(scheduledProjects) ? null :
                    <div 
                        style={{
                            display:"flex", 
                            flexDirection:"column", 
                            width:"100%",
                            paddingTop : "10px",
                            paddingBottom : "10px"
                        }}
                    >    
                        { 
                            scheduledProjects.map(
                                (project:Project, index:number) : JSX.Element => {
                                    return <div key={project._id}>
                                        <ProjectLink {...{project,showMenu:false} as any}/>  
                                    </div>  
                                } 
                            )     
                        }      
                    </div> 
                } 
                {   
                    isEmpty(selectedTodos) ? null :
                    <div style={{
                        display:"flex",flexDirection:"column",width:"100%",paddingTop:"10px",paddingBottom:"10px"
                    }}>   
                        <TodosList    
                            dispatch={this.props.dispatch}  
                            groupTodos={this.props.groupTodos}
                            sortBy={(a:Todo,b:Todo) => a.priority-b.priority}
                            selectedCategory={this.props.selectedCategory}
                            selectedTodo={this.props.selectedTodo} 
                            moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                            selectedAreaId={this.props.selectedAreaId}
                            selectedProjectId={this.props.selectedProjectId}
                            selectedTag={this.props.selectedTag}  
                            areas={this.props.areas}
                            projects={this.props.projects}
                            rootRef={this.props.rootRef}
                            todos={selectedTodos}   
                        />  
                    </div> 
                }
      </div>   
    }
} 