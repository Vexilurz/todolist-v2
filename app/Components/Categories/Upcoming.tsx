import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';   
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { Provider, connect } from "react-redux"; 
import Popover from 'material-ui/Popover';
import { Tags } from '../../Components/Tags';
import { TodosList } from '../../Components/TodosList';
import { Todo,Project, Area } from '../../database';
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
    getTagsFromItems,
    assert,
    isDate,
} from '../../utils';  
import { getProjectLink } from '../Project/ProjectLink';
import { allPass, uniq, isNil, compose, not, last, isEmpty } from 'ramda';
  

type Item = Project | Todo;
 

interface objectsByDate{ 
    [key:string]:Item[]
}  


let objectsToHashTableByDate = (props:UpcomingProps) : objectsByDate => {
     
    let todos : Todo[] = props.todos;
    let projects : Project[] = props.projects; 

    let haveDate = (item : Project | Todo) : boolean => {
        if(item.type==="project"){ 
           return not(isNil(item.deadline)); 
        }else if(item.type==="todo"){ 
           return not(isNil(item["attachedDate"]));
        }
    }

    let filters = [ 
        haveDate,  
        (t:Todo) => t.category!=="inbox", 
        byTags(props.selectedTag),
        byNotCompleted, 
        byNotDeleted  
    ];       

    let objects = [...todos, ...projects].filter(i => allPass(filters)(i)); 
 
    let objectsByDate : objectsByDate = {};

    if(objects.length===0){ 
       return {objectsByDate:[],tags:[]};
    }
  
    for(let i=0; i<objects.length; i++){
        let date : Date = getDateFromObject(objects[i]);

        if(!date)
           continue;  

        let key : string = keyFromDate(date);

        if(isNil(objectsByDate[key])){
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
    selectedCategory:string, 
    searched:boolean, 
    todos:Todo[],
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
    }[] => { 
        let objectsByDate = objectsToHashTableByDate(props);
        let range = getDatesRange(new Date(), n, true, true); 
        let objects = this.generateCalendarObjectsFromRange(range, objectsByDate); 
        return objects;
    }
    
    componentDidMount(){
        this.setState({objects:this.getObjects(this.props,this.n)}); 
    }  
    
    componentWillReceiveProps(nextProps:UpcomingProps){
        if(
            nextProps.projects!==this.props.projects ||
            nextProps.todos!==this.props.todos ||
            nextProps.areas!==this.props.areas 
        ){

            this.setState({objects:this.getObjects(nextProps,this.n * this.state.enter)});

        }else if(nextProps.selectedTag!==this.props.selectedTag){

            this.setState({objects:this.getObjects(nextProps,this.n), enter:1}); 

        }  
    } 

    onEnter = ({ previousPosition, currentPosition }) => { 
        let objectsByDate = objectsToHashTableByDate(this.props);
        let from = last(this.state.objects);

        assert(isDate(from.date), `from.date is not Date. ${JSON.stringify(from)}. onEnter.`);

        let range = getDatesRange(from.date, this.n, false, true);
        let objects = this.generateCalendarObjectsFromRange(range, objectsByDate); 
 
        this.setState({objects:[...this.state.objects,...objects], enter:this.state.enter+1});
    } 
     

    generateCalendarObjectsFromRange = ( 
        range:Date[], 
        objectsByDate:objectsByDate   
    ) : {date:Date, todos:Todo[], projects:Project[]}[] => {

        let objects = [];

        for(let i = 0; i<range.length; i++){

            let object = {
                date : range[i], 
                todos : [], 
                projects : [] 
            }
 
            let key : string = keyFromDate(range[i]);
            let entry : Item[] = objectsByDate[key];
 
            if(isNil(entry)){ 
               objects.push(object);
            }else{
               object.todos = entry.filter((el:Todo) => el.type==="todo"); 
               object.projects = entry.filter((el:Project) => el.type==="project"); 
               objects.push(object);
            }
        } 
         
        return objects; 
    }


    objectToComponent = (
        object : { date : Date, todos:Todo[], projects:Project[] }, 
        idx:number
    ) : JSX.Element => {

        return <div  style={{WebkitUserSelect:"none"}} key={idx}>
            <CalendarDay 
                idx={idx} 
                day={object.date.getDate()} 
                searched={this.props.searched}
                dayName={getDayName(object.date)}
                todos={object.todos}
                areas={this.props.areas}
                projects={object.projects}  
                selectedAreaId={this.props.selectedAreaId}
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
        
        let tags = compose(
            getTagsFromItems,
            (items : Item[]) => items.filter(
                allPass([
                    (t:Todo) => t.category!=="inbox",  
                    byNotCompleted,  
                    byNotDeleted  
                ])  
            )
        )([...this.props.todos, ...this.props.projects]); 


        return <div style={{WebkitUserSelect:"none"}}> 
                <ContainerHeader 
                    selectedCategory={"upcoming"} 
                    dispatch={this.props.dispatch}  
                    tags={tags}
                    showTags={true} 
                    selectedTag={this.props.selectedTag}
                />
   
                <div>{ this.state.objects.map(this.objectToComponent) }</div>

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
    areas:Area[], 
    searched:boolean, 
    todos:Todo[],
    dispatch:Function, 
    selectedTodoId:string,
    selectedAreaId:string,
    selectedProjectId:string, 
    selectedTag:string,
    rootRef:HTMLElement,
    tags:string[]
}

  
interface CalendarDayState{}

  
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
                            this.props.projects.map((p:Project, index:number) : JSX.Element => 
                                getProjectLink(
                                    p, this.props.todos,  this.props.dispatch, index
                                ) 
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
                            selectedTodoId={this.props.selectedTodoId} 
                            searched={this.props.searched} 
                            selectedCategory={"upcoming"}
                            selectedAreaId={this.props.selectedAreaId}
                            selectedProjectId={this.props.selectedProjectId}
                            selectedTag={this.props.selectedTag}  
                            areas={this.props.areas}
                            projects={this.props.projects}
                            rootRef={this.props.rootRef}
                            todos={this.props.todos}  
                            tags={this.props.tags} 
                        />  
                    </div> 
                }
      </div>   
    }
} 