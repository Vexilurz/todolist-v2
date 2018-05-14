import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';   
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { TodosList } from '../../Components/TodosList';
import { Todo,Project, Area, Calendar, Category, CalendarEvent, RepeatOptions, objectsByDate, CalendarObject } from '../../types';
import * as Waypoint from 'react-waypoint';
import { ContainerHeader } from '.././ContainerHeader';
import { 
    byTags, getDayName, getDatesRange, byNotCompleted, byNotDeleted,
    getTagsFromItems, getMonthName, yearFromDate, convertTodoDates,
    getRangeDays, isNotEmpty, typeEquals, compareByDate, monthFromDate,
    log, anyTrue, different, initDate, nDaysFromNow
} from '../../utils/utils';  
import {
    allPass, uniq, isNil, cond, compose, not, last, isEmpty, adjust,and, contains, where,
    map, flatten, prop, uniqBy, groupBy, defaultTo, all, pick, evolve, or, sortBy, any,
    mapObjIndexed, forEachObjIndexed, path, values, equals, append, reject, anyPass
} from 'ramda';
import { ProjectLink } from '../Project/ProjectLink';
import { filter } from 'lodash'; 
import { CalendarDay } from '../../Components/CalendarDay';
import { Hint } from './Today'; 
import { updateCalendars } from '../Calendar';
import { isDate, isArray, isArrayOfTodos, isNotNil, isString } from '../../utils/isSomething';
import { assert } from '../../utils/assert';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { timeOfTheDay, keyFromDate, addMonths, inPast } from '../../utils/time';
import { repeat } from '../RepeatPopup';
import { isDev } from '../../utils/isDev';
import { getSameDayEventElement } from '../../utils/getCalendarEventElement';
import { objectsToHashTableByDate } from '../../utils/objectsToHashTableByDate';
import { CalendarMonth } from '../CalendarMonth';
import { CalendarWeek } from '../CalendarWeek';
import { generateUpcomingSequence } from '../../utils/generateUpcomingSequence';
import { generateCalendarObjectsFromRange } from '../../utils/generateCalendarObjectsFromRange';



interface UpcomingDefaultProps{
    limit:Date, 
    hideHint:boolean,
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
    indicators:{ 
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
    selectedAreaId:string,
    selectedProjectId:string, 
    areas:Area[], 
    selectedTags:string[],
    rootRef:HTMLElement 
}  
 


interface UpcomingDefaultState{}


 
export class UpcomingDefault extends Component<UpcomingDefaultProps,UpcomingDefaultState>{

    

    constructor(props){
        super(props);
        this.state={};
    }    


    
    onError = (e) => globalErrorHandler(e);



    getObjects = (props:UpcomingDefaultProps,n:number) : CalendarObject[] => {  
        let { limit, dispatch } = this.props;
        let objectsByDate = objectsToHashTableByDate(props); 
        let range = getDatesRange(new Date(), n, true, true); 
        let objects = generateCalendarObjectsFromRange(range, objectsByDate); 
        return objects;
    }; 



    getCalendarDay = ( 
        object:CalendarObject
    ) => {
        let todos = [];
        let events = [];
        let projects = [];
        let title = 'day';
        let month = 'month';
        let day = 1;
        let date = new Date();

        let showMonth = true; //todo fix idx===0 || day===1;

        return <div  style={{WebkitUserSelect:"none"}}>
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
                        paddingTop:"20px",
                        paddingBottom:"15px"
                    }} 
                >  
                    {month}  
                </div>
            }
            <CalendarDay 
                day={day}  
                indicators={this.props.indicators}
                dayName={getDayName(date)}
                filters={this.props.filters}
                groupTodos={this.props.groupTodos}
                selectedTodos={todos} 
                selectedEvents={events}
                areas={this.props.areas}
                scheduledProjects={projects}  
                moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                projects={this.props.projects}
                selectedAreaId={this.props.selectedAreaId} 
                selectedCategory={this.props.selectedCategory as Category}
                scrolledTodo={this.props.scrolledTodo}
                selectedProjectId={this.props.selectedProjectId}
                dispatch={this.props.dispatch}
                selectedTags={this.props.selectedTags}
                rootRef={this.props.rootRef}
            />  
        </div>
    };



    getCalendarWeek = (objects:CalendarObject[]) : JSX.Element => {

        let todos = [];
        let events = [];
        let projects = [];
        let title = 'week';

        return <div style={{WebkitUserSelect:"none"}}>
            { 
                <div 
                    style={{
                        WebkitUserSelect: "none", 
                        display:"flex",
                        cursor:"default", 
                        fontSize:"x-large",
                        width:"100%", 
                        fontWeight:"bold",
                        paddingTop:"20px",
                        paddingBottom:"15px"
                    }} 
                >  
                    {title}  
                </div>
            }
            <CalendarWeek
                indicators={this.props.indicators}
                filters={this.props.filters}
                groupTodos={this.props.groupTodos}
                selectedTodos={todos} 
                selectedEvents={events}
                areas={this.props.areas}
                scheduledProjects={projects}  
                moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                projects={this.props.projects}
                selectedAreaId={this.props.selectedAreaId} 
                selectedCategory={this.props.selectedCategory as Category}
                scrolledTodo={this.props.scrolledTodo}
                selectedProjectId={this.props.selectedProjectId}
                dispatch={this.props.dispatch}
                selectedTags={this.props.selectedTags}
                rootRef={this.props.rootRef}
            />  
        </div>
    };



    getCalendarMonth = (objects:CalendarObject[]) : JSX.Element => {

        let todos = [];
        let events = [];
        let projects = [];
        let month = 'month';

        return <div style={{WebkitUserSelect:"none"}}>
            { 
                <div 
                    style={{
                        WebkitUserSelect: "none", 
                        display:"flex",
                        cursor:"default", 
                        fontSize:"x-large",
                        width:"100%", 
                        fontWeight:"bold",
                        paddingTop:"20px",
                        paddingBottom:"15px"
                    }} 
                >  
                    {month}  
                </div>
            }
            <CalendarMonth
                indicators={this.props.indicators}
                filters={this.props.filters}
                groupTodos={this.props.groupTodos}
                selectedTodos={todos} 
                selectedEvents={events}
                areas={this.props.areas}
                scheduledProjects={projects}  
                moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                projects={this.props.projects}
                selectedAreaId={this.props.selectedAreaId} 
                selectedCategory={this.props.selectedCategory as Category}
                scrolledTodo={this.props.scrolledTodo}
                selectedProjectId={this.props.selectedProjectId}
                dispatch={this.props.dispatch}
                selectedTags={this.props.selectedTags}
                rootRef={this.props.rootRef}
            />  
        </div>
    };



    getHint = () => {
        return this.props.clone ? null :
        this.props.hideHint ? null :
        <div className={`no-print`}>
        <Hint  
            text={`These are your tasks for the next days. Do you also want to include the events from your calendar?`}
            dispatch={this.props.dispatch} 
            hideHint={this.props.hideHint}          
        /> 
        </div>
    };
    


    render(){ 
        let removeEmptyObjects =  objects => objects.filter(
            object => any(isNotEmpty)([object.todos,object.projects,object.events])
        );

        let {todos,projects,selectedTags,dispatch,selectedCategory,clone} = this.props;
        let tags = getTagsFromItems(todos);
        let objects = this.getObjects(this.props, 150);

        let { days, weeks, months } = generateUpcomingSequence(7, 3, 10)(objects); 



        return <div id={`${selectedCategory}-list`} style={{WebkitUserSelect:"none"}}> 
                <div style={{paddingBottom:"20px"}}>
                    <ContainerHeader 
                        selectedCategory={selectedCategory} 
                        dispatch={dispatch}  
                        tags={tags}
                        showTags={true} 
                        selectedTags={selectedTags} 
                    />
                </div>
                { this.getHint() }
                <div>{ days.map(day => this.getCalendarDay(day)) }</div>
                <div>{ weeks.map(week => this.getCalendarWeek(week)) }</div>
                <div>{ months.map(month => this.getCalendarMonth(month)) }</div>
        </div> 
    } 
}
