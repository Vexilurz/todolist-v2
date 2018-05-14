import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';   
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { TodosList } from '../../Components/TodosList';
import { Todo,Project, Area, Calendar, Category, CalendarEvent, RepeatOptions, objectsByDate } from '../../types';
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
import { generateCalendarObjectsFromRange } from '../../utils/generateCalendarObjectsFromRange';
import { extend } from '../../utils/extend';


interface UpcomingProps{
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
 


interface UpcomingState{
    objects : {date:Date, todos:Todo[], projects:Project[], events:CalendarEvent[]}[],
    enter : number
}


 
export class Upcoming extends Component<UpcomingProps,UpcomingState>{
    n:number;
    stop:Date;

    constructor(props){
        super(props);
        this.n=10;  
        this.stop = addMonths(new Date(), 5);
        this.stop.setDate(1);
        this.state={objects:[],enter:1}; 
    }    


    updateLimit = (range:Date[]) => {
        let {dispatch,limit,todos,calendars} = this.props;
        let day = 1000 * 60 * 60 * 24;
        if(isEmpty(range)){ return }
        //threshold ->>> last date in range + 10 days ahead
        let threshold = last(range).getTime() + (day*this.n);

        //if extended range reached limit  
        if(threshold>=limit.getTime()){
            let newLimit = yearFromDate(limit);
            let actions = [];
            let extended = extend(newLimit, todos);

            if(isNotEmpty(extended)){
               actions.push({type:"addTodos", load:extended}); 
            }
            
            actions.push({type:"limit", load:newLimit}); 

            updateCalendars(
                newLimit,  
                calendars,  
                this.onError
            ).then(
                (load) => {
                    actions.push({type:"setCalendars",load});
                    
                    dispatch({type:"multiple",load:actions});
                }
            ) 
        } 
    }; 
 

    onEnter = ({previousPosition, currentPosition}) => { 
        let objectsByDate = objectsToHashTableByDate(this.props);
        let from = last(this.state.objects);
        let {dispatch,limit,areas,projects} = this.props;
        
        if(isNil(from)){ return }

        let range = getDatesRange(from.date, this.n, false, true, this.stop);
        let objects = generateCalendarObjectsFromRange(range, objectsByDate); 
         
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
        let range = getDatesRange(new Date(), n, true, true, this.stop); 
        let objects = generateCalendarObjectsFromRange(range, objectsByDate); 

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
        }else if(nextProps.selectedTags!==this.props.selectedTags){  
            this.setState({objects:this.getObjects(nextProps, this.n), enter:1}); 
        }   
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
                        fontWeight:"bold",
                        paddingTop:"20px",
                        paddingBottom:"15px"
                    }} 
                >  
                    {month}  
                </div>
            }
            <CalendarDay 
                idx={idx} 
                day={day}  
                indicators={this.props.indicators}
                dayName={getDayName(object.date)}
                filters={this.props.filters}
                groupTodos={this.props.groupTodos}
                selectedTodos={object.todos} 
                selectedEvents={object.events}
                areas={this.props.areas}
                scheduledProjects={object.projects}  
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


    render(){ 
        let {todos,projects,selectedTags,dispatch,selectedCategory,clone} = this.props;
        let tags = getTagsFromItems(todos);

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
                {  
                    clone ? null :
                    this.props.hideHint ? null :
                    <div className={`no-print`}>
                    <Hint  
                        text={`These are your tasks for the next days. Do you also want to include the events from your calendar?`}
                        dispatch={this.props.dispatch} 
                        hideHint={this.props.hideHint}          
                    /> 
                    </div>
                }
                <div>{
                    this.state
                    .objects
                    .filter(object => any(isNotEmpty)([object.todos,object.projects,object.events]))
                    .map(this.objectToComponent)
                }</div>
                <div className={`no-print`} style={{width:"100%", height:"1px"}}> 
                    <Waypoint  
                        onEnter={this.onEnter} 
                        onLeave={({previousPosition, currentPosition, event}) => {}}
                    />
                </div> 
        </div> 
    } 
}
