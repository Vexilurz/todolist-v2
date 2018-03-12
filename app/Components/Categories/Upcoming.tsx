import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';   
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { connect } from "react-redux"; 
import { TodosList } from '../../Components/TodosList';
import { Todo,Project, Area, Calendar, getTodos } from '../../database';
import * as Waypoint from 'react-waypoint';
import { ContainerHeader } from '.././ContainerHeader';
import {  
    byTags, 
    getDayName, 
    getDatesRange, 
    keyFromDate, 
    byNotCompleted,
    byNotDeleted,
    getTagsFromItems, 
    getMonthName,
    yearFromDate,
    convertTodoDates,
    getRangeDays,
    timeDifferenceHours,
    isNotNil, 
    setTime,
    isNotEmpty,
    typeEquals,
    compareByDate,
    monthFromDate,
    log,
} from '../../utils/utils';  
import {
    allPass, uniq, isNil, cond, compose, not, last, isEmpty, adjust,and, first,
    map, flatten, prop, uniqBy, groupBy, defaultTo, all, pick, evolve, or, sortBy,
    mapObjIndexed, forEachObjIndexed, path, values, equals, append, reject, anyPass
} from 'ramda';
import { ProjectLink } from '../Project/ProjectLink';
import { Category, filter } from '../MainContainer';
import { Hint } from './Today'; 
import { CalendarEvent, updateCalendars } from '../Calendar';
import { isDate, isArray, isArrayOfTodos } from '../../utils/isSomething';
import { assert } from '../../utils/assert';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { timeOfTheDay } from '../../utils/time';
import { repeat } from '../RepeatPopup';
import { isDev } from '../../utils/isDev';



export let byTime = (a:CalendarEvent,b:CalendarEvent) => { 
    let aTime = 0;
    let bTime = 0;

    if(isDate(a.start)){
        aTime = a.start.getTime(); 
    }

    if(isDate(b.start)){
        bTime = b.start.getTime(); 
    }
    
    return aTime-bTime;
};



export let groupEventsByType = (events:CalendarEvent[]) : { 
    sameDayEvents:CalendarEvent[], 
    fullDayEvents:CalendarEvent[]
} => compose(
    ({sameDayEvents,fullDayEvents}) => ({ 
        sameDayEvents:defaultTo([],sameDayEvents), 
        fullDayEvents:defaultTo([],fullDayEvents) 
    }),
    groupBy( 
        cond(
            [
                [
                    typeEquals('sameDayEvents'), () => 'sameDayEvents'
                ],
                [
                    typeEquals('fullDayEvents'), () => 'fullDayEvents'
                ],
                [
                    typeEquals('multipleDaysEvents'), 
                    cond([
                        [prop('sequenceEnd'), () => 'sameDayEvents'],
                        [prop('sequenceStart'), () => 'sameDayEvents'],
                        [() => true, () => 'fullDayEvents'],
                    ])
                ]
            ]
        )
    )
)(events);
 


export let extend = (limit:Date, todos:Todo[]) : Todo[] => {
    
    let isNotNeverGroup = compose(not, equals('never'), path(['group','type']));
    let getDate = (todo:Todo) => todo.attachedDate;
    let compareByAttachedDate = compareByDate(getDate);

    let groupButNotAfter = compose(
        anyPass([equals('never'),equals('on')]), 
        path(['group','type'])
    );

    let repeated = compose( 
        flatten, 
        values,
        map(
            compose(
               (todo:Todo) => {
                   if(isNil(todo)){ return [] }
                   let options = path(['group','options'], todo);
                   let start = todo.attachedDate;
                   let todos = repeat(options, todo, start, limit);
                   return todos; 
                },  
               (todos) => todos[0],
               (todos) => todos.sort(compareByAttachedDate)
            )
        ),
        groupBy(path(['group','_id'])),
        (todos) => filter(todos, groupButNotAfter)
    )(todos);

    if(isDev()){
       assert(isArrayOfTodos(repeated),`repeated is not of type array of todos. prolongateRepeated.`);
    }

    return repeated;
};



let haveDate = (item : Project | Todo) : boolean => {  
    if(item.type==="project"){  
        return isNotNil(item.deadline); 
    }else if(item.type==="todo"){ 
        return or(
           isNotNil(item["attachedDate"]), 
           isNotNil(item.deadline)
        );
    }
};



type Item = Project | Todo | CalendarEvent;
 

interface objectsByDate{ [key:string]:Item[] }  


let objectsToHashTableByDate = (props:UpcomingProps) : objectsByDate => {  
    let {showCalendarEvents,todos,projects} = props;
    let filters = [haveDate, byTags(props.selectedTag), byNotCompleted, byNotDeleted];    

    let items = filter([...todos, ...projects], i => allPass(filters)(i));
    
    if(showCalendarEvents && isNotNil(props.calendars)){
        compose(
            (events) => items.push(...events), 
            flatten,
            map(prop('events'))
        )(props.calendars)
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
};   



interface UpcomingProps{
    limit:Date, 
    dispatch:Function,
    clone:boolean,
    showCalendarEvents:boolean,
    selectedCategory:Category, 
    groupTodos:boolean, 
    todos:Todo[], 
    scrolledTodo:Todo,
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
    n:number;
    
    constructor(props){
        super(props);
        this.n=10;  
        this.state={objects:[],enter:1}; 
    }    
 

    updateLimit = (range:Date[]) => {
        let {dispatch,limit,todos,calendars} = this.props;
        let day = 1000 * 60 * 60 * 24;

        //threshold ->>> last date in range + 10 days ahead
        let threshold = last(range).getTime() + (day*this.n);

        //if extended range reached limit 
        if(threshold>=limit.getTime()){
            let newLimit = yearFromDate(limit);
 
            updateCalendars(
               newLimit,  
               calendars,  
               this.onError
            ).then(
               (result) => dispatch({
                   type:"setCalendars",
                   load:result
                })
            ) 

            let extended = extend(newLimit, todos);

            if(isNotEmpty(extended)){
               dispatch({type:"addTodos", load:extended}); 
            }

            dispatch({type:"limit", load:newLimit}); 
        } 
    }; 
 


    onEnter = ({previousPosition, currentPosition}) => { 
        let objectsByDate = objectsToHashTableByDate(this.props);
        let from = last(this.state.objects);
        let {dispatch,limit,areas,projects} = this.props;

        if(isNil(from)){ return }

        assert(isDate(from.date), `from.date is not Date. ${from}. onEnter.`);

        let range = getDatesRange(from.date, this.n, false, true);
        let objects = this.generateCalendarObjectsFromRange(range, objectsByDate); 
        
        this.setState(
            {
                objects:[...this.state.objects,...objects], 
                enter:this.state.enter+1
            },
            () => this.updateLimit(range)
        );
    };      

    
    onError = (e) => globalErrorHandler(e);


    getObjects = (props:UpcomingProps,n:number) : { 
        date: Date;
        todos: Todo[]; 
        projects: Project[]; 
        events: any[]
    }[] => {  
        let {limit,dispatch} = this.props;
        let objectsByDate = objectsToHashTableByDate(props); 
        let range = getDatesRange(new Date(), n, true, true); 
        let objects = this.generateCalendarObjectsFromRange(range, objectsByDate); 

        return objects;
    }; 


    componentDidMount(){
        this.setState({objects:this.getObjects(this.props,this.n)})
    }   
     
    
    componentWillReceiveProps(nextProps:UpcomingProps){
        if( 
            nextProps.projects!==this.props.projects ||
            nextProps.areas!==this.props.areas ||
            nextProps.calendars!==this.props.calendars ||
            nextProps.showCalendarEvents!==this.props.showCalendarEvents ||
            nextProps.todos!==this.props.todos
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
    };


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
                        fontWeight:"bold",
                        paddingTop:"20px"
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
                scrolledTodo={this.props.scrolledTodo}
                selectedProjectId={this.props.selectedProjectId}
                dispatch={this.props.dispatch}
                selectedTag={this.props.selectedTag}
                rootRef={this.props.rootRef}
            />  
        </div>
    }; 


    render(){ 
        let {todos,projects,selectedTag,dispatch,selectedCategory,clone} = this.props;
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
                {
                    clone ? null :
                    <div className={`no-print`}>
                        <Hint {
                            ...{
                                text:`These are your tasks for the next days. 
                                Do you also want to include the events from your calendar?`
                            } as any  
                        }/>
                    </div> 
                }
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
    scrolledTodo:Todo, 
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
        let {selectedTodos,todos,scheduledProjects,day,idx,dayName,dispatch,selectedEvents} = this.props; 
        let {sameDayEvents,fullDayEvents} = groupEventsByType(selectedEvents); 

        return <div style={{
            display:"flex",
            flexDirection:"column", 
            paddingTop:"15px",
            paddingBottom:"15px", 
            WebkitUserSelect:"none" 
        }}>  
                <div style={{width:"100%",display:"flex",paddingBottom:"10px",alignItems:"center",WebkitUserSelect:"none"}}>  
                    <div style={{width:"50px",fontWeight:900,fontSize:"35px",userSelect:"none"}}>
                        {day} 
                    </div>  
                    <div style={{
                        width:"100%",
                        fontSize:"17px",
                        color:"dimgray",
                        display:"flex",
                        height:"30px",
                        alignItems:"flex-end", 
                        fontWeight:"bolder",
                        borderTop:"1px solid rgba(100, 100, 100, 0.3)",
                        marginTop:"5px",
                        userSelect:"none" 
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
                  justifyContent:"flex-start",
                  marginLeft:"45px"
                }}>  
                        {
                            fullDayEvents
                            .map(  
                                (event,index) => 
                                <div  key={`event-${event.name}-${index}`} style={{padding:"1px"}}>
                                <div style={{display:"flex",height:"20px",alignItems:"center"}}>
                                    <div style={{paddingRight:"5px",height:"100%",backgroundColor:"dimgray"}}></div>
                                    <div style={{fontSize:"14px",userSelect:"none",cursor:"default",fontWeight:500,paddingLeft:"5px",overflowX:"hidden"}}>   
                                        {event.name}  
                                    </div>
                                </div>
                                { 
                                    isNil(event.description) ? null :
                                    isEmpty(event.description) ? null :
                                    <div style={{
                                        paddingLeft:"10px",
                                        textAlign:"left",
                                        fontSize:"14px",
                                        cursor:"default",
                                        userSelect:"none" 
                                    }}> 
                                        {event.description} 
                                    </div>
                                }
                                </div>  
                            )  
                        } 
                        {
                            sameDayEvents 
                            .sort(byTime)
                            .map((event,index) => 
                                <div key={`event-${event.name}-${index}`} style={{paddingTop:"1px",paddingBottom:"1px"}}>
                                    {
                                        cond([
                                            [ 
                                                //end
                                                (event) => {
                                                    let {sequenceEnd,sequenceStart} = event;
                                                    return not(sequenceStart) && sequenceEnd; 
                                                },
                                                (event) => <div style={{
                                                    display:"flex",
                                                    height:"20px",
                                                    alignItems:"center"
                                                }}>
                                                    <div style={{
                                                        fontSize:"14px",
                                                        userSelect:"none",
                                                        cursor:"default",
                                                        fontWeight:500, 
                                                        paddingRight:"5px",
                                                        overflowX:"hidden"
                                                    }}>   
                                                        {event.name}   
                                                    </div>
                                                    <div style={{fontSize:"14px",fontWeight:500}}>
                                                        {`(ending ${timeOfTheDay(event.end)})`} 
                                                    </div>
                                                </div>
                                            ],
                                            [
                                                //start
                                                (event) => true,
                                                (event) => <div style={{
                                                    display:"flex",
                                                    height:"20px",
                                                    alignItems:"center"
                                                }}>
                                                    <div style={{fontSize:"14px",fontWeight:500}}>
                                                        {timeOfTheDay(event.start)} 
                                                    </div>
                                                    <div style={{
                                                        fontSize:"14px",
                                                        userSelect:"none",
                                                        cursor:"default",
                                                        fontWeight:500,
                                                        paddingLeft:"5px",
                                                        overflowX:"hidden"
                                                    }}>   
                                                        {event.name}   
                                                    </div>
                                                </div>
                                            ]
                                        ])(event)
                                    }
                                    { 
                                        isNil(event.description) ? null :
                                        isEmpty(event.description) ? null :
                                        <div style={{
                                            textAlign:"left",
                                            fontSize:"14px",
                                            cursor:"default",
                                            userSelect:"none" 
                                        }}> 
                                            {event.description} 
                                        </div>
                                    }
                                </div> 
                            )  
                        }
                </div>
                {
                    isEmpty(scheduledProjects) ? null :
                    <div style={{
                        display:"flex", 
                        flexDirection:"column", 
                        width:"100%",
                        paddingTop:"10px",
                        paddingBottom:"10px",
                        paddingLeft:"25px"
                    }}>    
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
                        display:"flex",
                        flexDirection:"column",
                        width:"100%",
                        paddingTop:"10px",
                        paddingBottom:"10px",
                        paddingLeft:"20px"
                    }}>   
                        <TodosList    
                            dispatch={this.props.dispatch}  
                            groupTodos={this.props.groupTodos}
                            sortBy={(a:Todo,b:Todo) => a.priority-b.priority}
                            selectedCategory={this.props.selectedCategory}
                            scrolledTodo={this.props.scrolledTodo} 
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