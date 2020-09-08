import '../../../assets/styles.css';  
import '../../../assets/calendarStyle.css';  
import * as React from 'react';   
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { Todo,Project, Area, Calendar, Category, CalendarObject, Store } from '../../../types';
import { ContainerHeader } from '../.././ContainerHeader';
import { getDayName, getDatesRange, getTagsFromItems, getMonthName, isNotEmpty, compareByDate } from '../../../utils/utils';  
import {
    isNil, compose, last, isEmpty, concat, reverse,
    map, flatten, prop, all, any, always, ifElse,
    values
} from 'ramda';
import { CalendarDay } from '../../../Components/CalendarDay';
import { Hint } from './../Today'; 
import { isDate, isTodo, isProject } from '../../../utils/isSomething';
import { globalErrorHandler } from '../../../utils/globalErrorHandler';
import { objectsToHashTableByDate } from '../../../utils/objectsToHashTableByDate';
import { CalendarMonth } from '../../CalendarMonth';
import { CalendarWeek } from '../../CalendarWeek';
import { generateUpcomingSequence } from '../../../utils/generateUpcomingSequence';
import { generateCalendarObjectsFromRange } from '../../../utils/generateCalendarObjectsFromRange';
import { byTime } from '../../../utils/byTime';
import { detectChanges } from '../../../database/detectChanges'
import { FadeBackgroundIcon } from '../../FadeBackgroundIcon';



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



let getWeekTitle = (objects:CalendarObject[]) : { month:string, range:string } => {
    let dates = objects.map(prop('date'));

    if(isEmpty(dates)){ return {month:'', range:''} }
    else if(dates.length===1){  

        let date = dates[0] as Date;
        return {
            month:getMonthName(date), 
            range:`${date.getDate()}`
        };
    }else{
        let start = dates[0] as Date;
        let end = last(dates) as Date;
        let startMonth = getMonthName(start);
        let endMonth = getMonthName(end);

        if(startMonth===endMonth){
            return {
                month:startMonth, 
                range:`${start.getDate()}-${end.getDate()}`
            };
        }else{
            return {
                month:`${startMonth}-${endMonth}`, 
                range:`${start.getDate()}-${end.getDate()}`
            };
        }
    }
};



let todosChanged = (was:Todo[]) => (now:Todo[]) : boolean => {
    console.log("detectChanges in todosChanged");   
    console.log("state: ",{todos:was} as Store);
    console.log("newState: ",{todos:now} as Store); 
    let changes = detectChanges({todos:was} as Store)({todos:now} as Store);

    let changed = compose( 
        ifElse( isNil, always(false), compose(any(isNotEmpty), values) ),  
        prop('todos')
    )(changes); 
   
    return changed;
};


 
export class UpcomingDefault extends Component<UpcomingDefaultProps,UpcomingDefaultState>{

    

    constructor(props){
        super(props);
        this.state={};
    }    

    

    shouldComponentUpdate(nextProps){
        if(
            nextProps.hideHint!==this.props.hideHint ||
            nextProps.showCalendarEvents!==this.props.showCalendarEvents ||
            nextProps.groupTodos!==this.props.groupTodos ||
            nextProps.moveCompletedItemsToLogbook!==this.props.moveCompletedItemsToLogbook 
        ){
            return true;
        }


        if(nextProps.selectedTags!==this.props.selectedTags){
            return true;
        }


        if(todosChanged(this.props.todos)(nextProps.todos)){
            return true;
        }


        if(nextProps.calendars!==this.props.calendars){
            return true;
        }


        if(nextProps.projects!==this.props.projects){
            return true;
        }


        if(nextProps.indicators!==this.props.indicators){
            return true;
        }


        return false;
    }


    
    onError = (e) => globalErrorHandler(e);

  

    getObjects = (n:number) => (props:UpcomingDefaultProps) : CalendarObject[] => {  
        let { limit, dispatch } = this.props;
        let objectsByDate = objectsToHashTableByDate(props); 
        let range = getDatesRange(new Date(), n, true, true); 
        let objects = generateCalendarObjectsFromRange(range, objectsByDate); 
        return objects;
    }; 



    getCalendarMonth = (objects:CalendarObject[], idx:number) : JSX.Element => {
        if(isEmpty(objects)){ return null }

        let types = ["todos","events","projects"];
        let flattenObjects = (type:string) => compose( flatten, map(prop(type)) );
        let getDate = item => isDate(item.attachedDate) ? item.attachedDate : item.deadline;
            
        let todos = flattenObjects("todos")(objects);
        let projects = flattenObjects("projects")(objects);
        let events = flattenObjects("events")(objects);

        if(all(isEmpty)([todos,projects,events])){ return null; }
        
        let sortedItems = compose(reverse, items => items.sort(compareByDate(getDate)), concat(todos))(projects);
    
        let sortedEvents = events.sort(byTime);
        let { month, range } = getWeekTitle(objects);
    
        return <div key={`month-${idx}`} style={{WebkitUserSelect:"none", paddingTop:"3px", paddingBottom:"3px"}}>
            <CalendarMonth
                month={month}
                indicators={this.props.indicators} 
                filters={this.props.filters}
                groupTodos={this.props.groupTodos}
                sortedItems={sortedItems}
                sortedEvents={sortedEvents}
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



    getCalendarWeek = (objects:CalendarObject[], idx:number) : JSX.Element => {
        if(isEmpty(objects)){ return null }

        let types = ["todos","events","projects"];
        let flattenObjects = (type:string) => compose( flatten, map(prop(type)) );
        let getDate = item => isTodo(item) ? item.attachedDate : isProject(item) ? item.deadline : null;

        let todos = flattenObjects("todos")(objects);
        let projects = flattenObjects("projects")(objects);
        let events = flattenObjects("events")(objects);

        if(all(isEmpty)([todos,projects,events])){ return null; }

        let sortedItems = compose(reverse, items => items.sort(compareByDate(getDate)), concat(todos))(projects);
    
        let sortedEvents = events.sort(byTime);
        let { month, range } = getWeekTitle(objects);
    
        return <div key={`week-${idx}`} style={{WebkitUserSelect:"none", paddingTop:"3px", paddingBottom:"3px"}}>
            <CalendarWeek
                month={month}
                range={range}
                indicators={this.props.indicators}
                filters={this.props.filters}
                groupTodos={this.props.groupTodos}
                sortedItems={sortedItems}
                sortedEvents={sortedEvents}
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



    getCalendarDay = (object:CalendarObject, idx:number) : JSX.Element => {
        let { todos, projects, events, date } = object;
        let day = date.getDate();

        return all(isEmpty)([todos,projects,events]) ? null :
        <div key={`day-${idx}`} style={{WebkitUserSelect:"none", paddingTop:"3px", paddingBottom:"3px"}}>
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
        let {todos,projects,selectedTags,dispatch,selectedCategory,clone} = this.props;
        let tags = getTagsFromItems(todos);
        let { days, weeks, months } = compose( generateUpcomingSequence(7, 3, 5), this.getObjects(150) )(this.props);
        
        return <div id={`${selectedCategory}-list`} style={{WebkitUserSelect:"none"}}> 
                <div style={{paddingBottom:"20px"}}>
                    <ContainerHeader 
                        selectedCategory={selectedCategory} 
                        dispatch={dispatch}  
                        tags={tags}
                        showTags={true} 
                        selectedTags={selectedTags} 
                    />
                    <FadeBackgroundIcon    
                        container={this.props.rootRef} 
                        selectedCategory={this.props.selectedCategory}  
                        show={isEmpty(this.props.todos)}
                    />  
                </div>

                { this.getHint() }

                <div>{days.map(this.getCalendarDay)}</div>

                <div>{weeks.map(this.getCalendarWeek)}</div>

                <div>{months.map(this.getCalendarMonth)}</div>
        </div> 
    } 
}
