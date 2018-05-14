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



interface CalendarWeekProps{ 
    month:string,
    range:string,
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
    sortedItems:(Project | Todo) []
    sortedEvents:CalendarEvent[],
    projects:Project[],
    areas:Area[], 
    scrolledTodo:Todo, 
    groupTodos:boolean,
    moveCompletedItemsToLogbook:string, 
    dispatch:Function, 
    selectedAreaId:string,
    selectedProjectId:string, 
    selectedCategory:Category,
    selectedTags:string[],
    rootRef:HTMLElement
}



interface CalendarWeekState{}


  
export class CalendarWeek extends Component<CalendarWeekProps,CalendarWeekState>{

    constructor(props){ 
        super(props) 
    }

     
    render(){   
        let {sortedItems, sortedEvents, selectedTags, dispatch} = this.props; 
        let {sameDayEvents, fullDayEvents} = groupEventsByType(sortedEvents); 

        let noEvents = isEmpty(fullDayEvents) && isEmpty(sameDayEvents);
        let noItems = isEmpty(sortedItems);
       

        return <div style={{display:"flex", flexDirection:"column", WebkitUserSelect:"none"}}>  
                <div 
                    style={{
                        WebkitUserSelect: "none", 
                        display:"flex",
                        cursor:"default", 
                        fontSize:"15px",
                        width:"100%", 
                        fontWeight:"bold",
                        marginTop:"10px",
                        paddingTop:"5px",
                        borderTop:"1px solid rgba(100, 100, 100, 0.3)",
                        paddingBottom:"15px"
                    }} 
                >  
                    <div style={{display:"flex"}}>
                        <div>{this.props.month}</div>
                        <div
                            style={{
                                paddingLeft:"5px",
                                color:"rgba(50,50,50,0.7)"
                            }}
                        >{this.props.range}</div>
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

                {/*   
                    <div style={{
                        display:"flex",
                        flexDirection:"column",
                        width:"100%",
                        paddingLeft:"20px"
                    }}>   
                         <div 
                                    style={{marginTop:"5px", marginBottom:"5px"}} 
                                    key={project._id}
                                >
                                    <ProjectLink 
                                        project={project} 
                                        indicator={defaultTo({completed:0, active:0})(this.props.indicators[project._id])}
                                        showMenu={false}
                                        dispatch={this.props.dispatch}
                                        selectedCategory={this.props.selectedCategory}
                                    />  
                                </div>  
                    </div> 
                */}
                </div>
        </div>   
    }
} 