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
import { isTodo, isProject } from '../utils/isSomething';
import { TodoInput } from './TodoInput/TodoInput';
import { ExpandableList } from './ExpandableList';



interface CalendarMonthProps{ 
    month:string,
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



interface CalendarMonthState{}


  
export class CalendarMonth extends Component<CalendarMonthProps,CalendarMonthState>{

    constructor(props){ 
        super(props) 
    }

    componentDidMount(){
        console.log(`CalendarMonth MOUNT`)

    }

    componentWillUnmount(){
        console.log(`CalendarMonth UNMOUNT`)
    }


    shouldComponentUpdate(nextProps){
        if(
            this.props.month!==nextProps.month ||
            this.props.indicators!==nextProps.indicators ||
            this.props.sortedItems!==nextProps.sortedItems ||
            this.props.sortedEvents!==nextProps.sortedEvents ||
            this.props.groupTodos!==nextProps.groupTodos ||
            this.props.moveCompletedItemsToLogbook!==nextProps.moveCompletedItemsToLogbook ||
            this.props.selectedAreaId!==nextProps.selectedAreaId ||
            this.props.selectedProjectId!==nextProps.selectedProjectId ||
            this.props.selectedTags!==nextProps.selectedTags
        ){
            return true
        }
        
        return false;
    }

     
    render(){   
        let {sortedItems, sortedEvents, selectedTags, dispatch} = this.props; 
        let {sameDayEvents, fullDayEvents} = groupEventsByType(sortedEvents); 

        let getEventDay = (date) => {
            let day = date.getDate().toString();
            return day.length > 1 ? day : `0${day}`;
        };

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
                    </div>
                </div>


                <div>
                {
                    noEvents ? null :  
                    <div style={{
                        display:'flex', 
                        flexDirection:"column", 
                        alignItems:"flex-start", 
                        justifyContent:"flex-start"
                    }}>  
                        {
                           <ExpandableList
                                showAll={false}
                                minLength={10}
                                buttonOffset={0}
                                type={"events"}   
                            >{
                            
                            [...fullDayEvents, ...sameDayEvents]
                            .sort(byTime) 
                            .map(  
                                (event,index) => <div 
                                    key={`event-${event.name}-${index}`}
                                    style={{paddingTop:"1px", paddingBottom:"1px"}}
                                >
                                <div style={{display:"flex",/*height:"20px",*/alignItems:"flex-start"}}>
                                    <div style={{paddingRight:"5px",height:"100%"}}>
                                    {getEventDay(event.start)}
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
                                </div>  
                            )  
                            
                        }</ExpandableList>
                        } 
                    </div>
                }

                {   
                    noItems ? null :
                    <div style={{marginLeft:"-22px"}}>
                    <ExpandableList
                        showAll={false}
                        minLength={10}
                        buttonOffset={25}
                        type={"items"}   
                    >
                    {
                    sortedItems.map(
                        (item:any,idx) => {
                            if(isTodo(item)){
                                return <TodoInput      
                                    key={`${item._id}-${idx}`}
                                    id={item._id}
                                    groupTodos={this.props.groupTodos}
                                    scrolledTodo={this.props.scrolledTodo}
                                    moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                                    projects={this.props.projects}  
                                    dispatch={dispatch}  
                                    selectedProjectId={this.props.selectedProjectId}
                                    selectedAreaId={this.props.selectedAreaId} 
                                    selectedCategory={this.props.selectedCategory}  
                                    rootRef={this.props.rootRef}  
                                    todo={item as Todo}
                                />  
                            }else if(isProject(item)){
                                return <div 
                                key={`${item._id}-${idx}`}
                                style={{
                                    display:"flex",
                                    flexDirection:"column",
                                    width:"100%",
                                    paddingLeft:"4px"
                                }}>   
                                    <div style={{marginTop:"5px", marginBottom:"5px"}}>
                                        <ProjectLink 
                                            project={item} 
                                            indicator={defaultTo({completed:0, active:0})(this.props.indicators[item._id])}
                                            showMenu={false}
                                            dispatch={this.props.dispatch}
                                            selectedCategory={this.props.selectedCategory}
                                        />  
                                    </div>  
                                </div> 
                            }else{
                                return null;
                            }
                        }
                    )
                    } 
                    </ExpandableList>
                    </div>
                }
                </div>
            </div>
                
    }
} 