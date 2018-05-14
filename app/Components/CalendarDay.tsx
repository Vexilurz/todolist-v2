import './../assets/styles.css';    
import './../assets/calendarStyle.css';  
import * as React from 'react';   
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { TodosList } from '../Components/TodosList';
import { Todo,Project, Area, Calendar, Category, CalendarEvent, RepeatOptions } from '../types';
import * as Waypoint from 'react-waypoint';
import { ContainerHeader } from './ContainerHeader';
import { 
    byTags, getDayName, getDatesRange, byNotCompleted, byNotDeleted,
    getTagsFromItems, getMonthName, yearFromDate, convertTodoDates,
    getRangeDays, isNotEmpty, typeEquals, compareByDate, monthFromDate,
    log, anyTrue, different, initDate, nDaysFromNow
} from '../utils/utils';  
import {
    allPass, uniq, isNil, cond, compose, not, last, isEmpty, adjust,and, contains, where,
    map, flatten, prop, uniqBy, groupBy, defaultTo, all, pick, evolve, or, sortBy, any,
    mapObjIndexed, forEachObjIndexed, path, values, equals, append, reject, anyPass
} from 'ramda';
import { ProjectLink } from './Project/ProjectLink';
import { groupEventsByType } from '../utils/groupEventsByType';
import { isDev } from '../utils/isDev';
import { assert } from '../utils/assert';
import { byTime } from '../utils/byTime';
import { getSameDayEventElement } from '../utils/getCalendarEventElement';


interface CalendarDayProps{ 
    day:number, 
    dayName:string,
    indicators : { 
        [key:string]:{
            active:number,
            completed:number,
            deleted:number
        }; 
    },
    filters:{
        inbox:((todo:Todo) => boolean)[],
        today:((todo:Todo) => boolean)[],
        hot:((todo:Todo) => boolean)[],
        next:((todo:Todo) => boolean)[],
        someday:((todo:Todo) => boolean)[],
        upcoming:((todo:Todo) => boolean)[],
        logbook:((todo:Todo) => boolean)[],
        trash:((todo:Todo) => boolean)[]
    },
    projects:Project[],
    scheduledProjects:Project[],
    areas:Area[], 
    selectedTodos:Todo[],
    scrolledTodo:Todo, 
    groupTodos:boolean,
    selectedEvents:CalendarEvent[],
    moveCompletedItemsToLogbook:string, 
    dispatch:Function, 
    selectedAreaId:string,
    selectedProjectId:string, 
    selectedCategory:Category,
    selectedTags:string[],
    rootRef:HTMLElement
}


interface CalendarDayState{}

  
export class CalendarDay extends Component<CalendarDayProps,CalendarDayState>{
    constructor(props){ super(props) }

     
    render(){   
        let {selectedTodos,selectedTags,scheduledProjects,day,dayName,dispatch,selectedEvents} = this.props; 
        let {sameDayEvents,fullDayEvents} = groupEventsByType(selectedEvents); 

        let noEvents = isEmpty(fullDayEvents) && isEmpty(sameDayEvents);
        let noProjects = isEmpty(scheduledProjects);
        let noTodos = isEmpty(selectedTodos);

        return <div style={{display:"flex", flexDirection:"column", WebkitUserSelect:"none"}}>  
                <div style={{
                    width:"100%",
                    display:"flex",
                    paddingBottom:noEvents ? "0px" : noTodos ? "0px" : "10px",
                    alignItems:"center",
                    WebkitUserSelect:"none"
                }}>  
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
                        { dayName }
                    </div> 
                </div>   

                <div>
                {
                    noEvents ? null :  
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
                                (event,index) => <div 
                                    key={`event-${event.name}-${index}`}
                                    style={{paddingTop:"1px", paddingBottom:"1px"}}
                                >
                                <div style={{display:"flex",height:"20px",alignItems:"center"}}>
                                    <div style={{paddingRight:"5px",height:"100%",backgroundColor:"dimgray"}}></div>
                                    <div style={{fontSize:"14px",userSelect:"none",cursor:"default",fontWeight:500,paddingLeft:"5px",overflowX:"hidden"}}>   
                                        {event.name}  
                                    </div>
                                </div>
                                </div>  
                            )  
                        } 
                        {
                            sameDayEvents 
                            .sort(byTime) 
                            .map(
                                (event,index) => <div 
                                    key={`event-${event.name}-${index}`} 
                                    style={{
                                        paddingTop:"1px",
                                        paddingBottom:"1px",
                                        display:"flex",
                                        height:"20px",
                                        alignItems:"center"
                                    }}  
                                >
                                    {
                                        event.type!=='multipleDaysEvents' ? null :
                                        <div style={{paddingRight:"5px",height:"100%",backgroundColor:"dimgray"}}></div>
                                    }
                                    <div style={{paddingLeft:event.type!=="multipleDaysEvents" ? "0px":"5px"}}>
                                        {getSameDayEventElement(event,false)}
                                    </div>  
                                </div> 
                            )  
                        }
                    </div>
                }
                {
                    noProjects ? null :
                    <div style={{
                        display:"flex", 
                        flexDirection:"column", 
                        width:"100%",
                        paddingLeft:"25px"
                    }}>    
                    { 
                        scheduledProjects.map(
                            (project:Project, index:number) : JSX.Element => {
                                return <div style={{marginTop:"5px", marginBottom:"5px"}} key={project._id}>
                                    <ProjectLink 
                                        project={project} 
                                        indicator={
                                            defaultTo({completed:0, active:0})(
                                                this.props.indicators[project._id]
                                            )
                                        }
                                        showMenu={false}
                                        dispatch={this.props.dispatch}
                                        selectedCategory={this.props.selectedCategory}
                                    />  
                                </div>  
                            } 
                        )     
                    }      
                    </div> 
                } 
                {   
                    noTodos ? null :
                    <div style={{
                        display:"flex",
                        flexDirection:"column",
                        width:"100%",
                        paddingLeft:"20px"
                    }}>   
                        <TodosList    
                            dispatch={this.props.dispatch}  
                            filters={this.props.filters}
                            groupTodos={this.props.groupTodos}
                            sortBy={(a:Todo,b:Todo) => a.priority-b.priority}
                            selectedCategory={this.props.selectedCategory}
                            scrolledTodo={this.props.scrolledTodo} 
                            moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                            selectedAreaId={this.props.selectedAreaId}
                            selectedProjectId={this.props.selectedProjectId}
                            areas={this.props.areas}
                            projects={this.props.projects}
                            rootRef={this.props.rootRef}
                            todos={selectedTodos}   
                        />  
                    </div> 
                }
                </div>
        </div>   
    }
} 