import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';   
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { Provider, connect } from "react-redux"; 
import Popover from 'material-ui/Popover';
import { Tags } from '../../Components/Tags';
import { TodosList } from '../../Components/TodosList';
import { Todo,Project, Area, Calendar } from '../../database';
let moment = require("moment");
import * as Waypoint from 'react-waypoint';
import { ContainerHeader } from '.././ContainerHeader';
import {  
    byTags, 
    getDayName, 
    getDatesRange, 
    keyFromDate, 
    daysLeftMark,
    stringToLength,
    byNotCompleted,
    byNotDeleted,
    getTagsFromItems,
    assert,
    isDate,
    getMonthName,
    isTodo,
} from '../../utils';  
import { allPass, uniq, isNil, compose, not, last, isEmpty, toPairs, map, flatten, prop } from 'ramda';
import { ProjectLink } from '../Project/ProjectLink';
import { Category } from '../MainContainer';
import { repeat } from '../RepeatPopup';


type Item = Project | Todo;
 

interface objectsByDate{ 
    [key:string]:Item[]
}  



let objectsToHashTableByDate = (props:UpcomingProps) : objectsByDate => {
    
    let {showCalendarEvents,todos,projects,calendars} = props;

    let haveDate = (item : Project | Todo) : boolean => {  
        if(item.type==="project"){  
           return not(isNil(item.deadline)); 
        }else if(item.type==="todo"){ 
           return not(isNil(item["attachedDate"])) || not(isNil(item.deadline));
        }
    }

    let filters = [ 
        haveDate,  
        byTags(props.selectedTag),
        byNotCompleted, 
        byNotDeleted  
    ];       

    let items = [...todos, ...projects].filter(i => allPass(filters)(i)); 
    
    if(showCalendarEvents){
        calendars
        .filter((c:Calendar) => c.active)
        .forEach((c:Calendar) => items.push(...c.events))
    }

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
    dispatch:Function,
    showCalendarEvents:boolean,
    selectedTodoId:string,
    selectedCategory:string, 
    searched:boolean, 
    todos:Todo[],
    calendars:Calendar[], 
    projects:Project[], 
    selectedAreaId:string,
    selectedProjectId:string, 
    areas:Area[], 
    selectedTag:string,
    tags:string[],
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
        this.n = 15; 
        this.state = {objects:[], enter:1}; 
    }  
    
    onError = (e) => console.log(e);

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


    onEnter = ({ previousPosition, currentPosition }) => { 
        let objectsByDate = objectsToHashTableByDate(this.props);
        let from = last(this.state.objects);

        if(isNil(from)){ return }

        assert(isDate(from.date), `from.date is not Date. ${JSON.stringify(from)}. onEnter.`);

        let range = getDatesRange(from.date, this.n, false, true);
        let objects = this.generateCalendarObjectsFromRange(range, objectsByDate); 
 
        this.setState({objects:[...this.state.objects,...objects], enter:this.state.enter+1});
    } 
     

    generateCalendarObjectsFromRange = ( 
        range:Date[], 
        objectsByDate:objectsByDate   
    ) : {date:Date, todos:Todo[], projects:Project[], events:any[]}[] => {

        let objects = [];

        for(let i = 0; i<range.length; i++){

            let object = {
                date : range[i], 
                todos : [], 
                projects : [],
                events : [] 
            }
 
            let key : string = keyFromDate(range[i]);
            let entry : Item[] = objectsByDate[key];
 
            if(isNil(entry)){ 
               objects.push(object);
            }else{
               object.todos = entry.filter((el:Todo) => el.type==="todo"); 
               object.projects = entry.filter((el:Project) => el.type==="project"); 
               object.events = entry.filter((el:any) => isDate(el.start)); 
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
                searched={this.props.searched}
                dayName={getDayName(object.date)}
                selectedTodos={object.todos} 
                selectedEvents={object.events}
                todos={this.props.todos}
                areas={this.props.areas}
                scheduledProjects={object.projects}  
                projects={this.props.projects}
                selectedAreaId={this.props.selectedAreaId} 
                selectedCategory={this.props.selectedCategory as Category}
                selectedProjectId={this.props.selectedProjectId}
                dispatch={this.props.dispatch}
                selectedTodoId={this.props.selectedTodoId}
                selectedTag={this.props.selectedTag}
                rootRef={this.props.rootRef}
                tags={this.props.tags}
            />  
        </div>
    } 

 
    render(){ 
        
        let {todos,projects,selectedTag,dispatch} = this.props;

        let byScheduled = (item : Todo) : boolean => {
            if(isNil(item)){ return false } 
            return !isNil(item.deadline) || !isNil(item.attachedDate); 
        }   

        let tags = compose( 
            getTagsFromItems,
            (items : Item[]) => items.filter(
                allPass([
                    (t:Todo) => t.category!=="inbox",  
                    byScheduled,
                    byNotCompleted,  
                    byNotDeleted  
                ])  
            )
        )([...todos, ...projects]); 


        return <div style={{WebkitUserSelect:"none"}}> 
                <div style={{paddingBottom:"20px"}}>
                    <ContainerHeader 
                        selectedCategory={"upcoming"} 
                        dispatch={dispatch}  
                        tags={tags}
                        showTags={true} 
                        selectedTag={selectedTag}
                    />
                </div>
   
                <div>{this.state.objects.map(this.objectToComponent)}</div>

                <div style={{width:"100%", height:"1px"}}> 
                    <Waypoint  
                        onEnter={this.onEnter} 
                        onLeave={({ previousPosition, currentPosition, event }) => {}}
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
    searched:boolean, 
    selectedTodos:Todo[],
    selectedEvents:any[],
    todos:Todo[], 
    dispatch:Function, 
    selectedTodoId:string,
    selectedAreaId:string,
    selectedProjectId:string, 
    selectedCategory:Category,
    selectedTag:string,
    rootRef:HTMLElement, 
    tags:string[]
}

  
interface CalendarDayState{}

  
export class CalendarDay extends Component<CalendarDayProps,CalendarDayState>{

    constructor(props){
        super(props)
    }

    componentDidMount(){
        let {selectedTodos} = this.props;
        let last = selectedTodos.filter( 
            (todo:Todo) => isNil(todo.group) ? false :
                           todo.group.type!=="never" ? false :
                           todo.group.last 
        );

        console.log(JSON.stringify(last));

        if(!isEmpty(last)){ 
            last.forEach(
                (t:Todo) => {
                    let result = repeat(t.group.options, t);

                    if(isNil(result)){ return } 
                    if(isEmpty(result.todos)){ return }

                    let lastTodo = result.todos[result.todos.length-1];

                    result.todos[result.todos.length-1] = {
                        ...lastTodo,
                        group:{...lastTodo.group, last:true, options:t.group.options}
                    };

                    this.props.dispatch({type:"addTodos", load:result.todos}); 

                    this.props.dispatch({type:"updateTodo", load:{...t, group:{...t.group,last:false} }}); 
                    
                    console.log("request additional items...");    
                }
            )
        }
    }

    render(){   

        let {
            selectedTodos,todos,scheduledProjects,
            day,idx,dayName,dispatch,selectedEvents
        } = this.props; 

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
                        uniq(map((event:any) : string => event.summary, selectedEvents))
                        .map((summary:string) : JSX.Element => 
                            <div    
                                key={summary}
                                style={{ 
                                    display:"flex",
                                    height:"20px",
                                    paddingTop:"5px", 
                                    paddingBottom:"5px", 
                                    alignItems:"center"
                                }}
                            >
                                <div  
                                    style={{
                                        paddingRight:"5px",
                                        height:"100%",
                                        backgroundColor:"dimgray"
                                    }}
                                >
                                </div>
                                <div 
                                    style={{
                                        fontSize:"14px",
                                        userSelect:"none",
                                        cursor:"default",
                                        paddingLeft:"5px" 
                                    }}
                                > 
                                    {summary}
                                </div>  
                            </div>
                        )
                    }
                </div>
                {
                    scheduledProjects.length===0 ? null :
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
                                (p:Project, index:number) : JSX.Element => {
                                    return <div key={p._id}>
                                        <ProjectLink 
                                            dispatch={dispatch}
                                            index={index}
                                            selectedCategory={this.props.selectedCategory as Category}
                                            project={p}
                                            simple={true}
                                            todos={todos}
                                        /> 
                                    </div>
                                }
                            )     
                        }      
                    </div> 
                } 
                {   
                    selectedTodos.length===0 ? null :
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
                            selectedTodoId={this.props.selectedTodoId} 
                            searched={this.props.searched} 
                            selectedCategory={"upcoming"}
                            selectedAreaId={this.props.selectedAreaId}
                            selectedProjectId={this.props.selectedProjectId}
                            selectedTag={this.props.selectedTag}  
                            areas={this.props.areas}
                            projects={this.props.projects}
                            rootRef={this.props.rootRef}
                            todos={selectedTodos}   
                            tags={this.props.tags} 
                        />  
                    </div> 
                }
      </div>   
    }
} 