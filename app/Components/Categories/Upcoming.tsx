import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';   
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron'; 
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
} from '../../utils';  
import { getProjectLink } from '../Project/ProjectLink';
import { allPass, uniq, isNil, compose } from 'ramda';
  
type Item = Project | Todo;
 
interface objectsByDate{ 
    [key:string]:Item[]
}  


let objectsToHashTableByDate = (props:UpcomingProps) : objectsByDate => {
     
    let todos = props.todos;

    let projects = props.projects; 

    let haveDate = (item : Project | Todo) : boolean => {
        if(item.type==="project"){ 
           return !!item.deadline; 
        }else if(item.type==="todo"){ 
           return !!item["attachedDate"];
        }
    }

    let filters = [ 
        haveDate,  
        (t:Todo) => t.category!=="inbox", 
        byTags(props.selectedTag),
        byNotCompleted, 
        byNotDeleted  
    ];      

    let objects = [...todos, ...projects].filter( i => allPass(filters)(i)); 
 
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
    todos:Todo[],
    projects:Project[],
    selectedTag:string,
    tags:string[],
    rootRef:HTMLElement 
} 
 
 

interface UpcomingState{
    objects : { date : Date, todos:Todo[], projects:Project[] }[]
}



export class Upcoming extends Component<UpcomingProps,UpcomingState>{


    constructor(props){
        super(props);
        this.state = {objects:[]}; 
    }  
 

    onError = (e) => console.log(e); 



    generateCalendarObjects = (n) : { date : Date, todos:Todo[], projects:Project[] }[] => {
        
        let objects = [...this.state.objects];
 
        let objectsByDate = objectsToHashTableByDate(this.props);
 
        let range : Date[] = [];

        if(objects.length===0){
            range = getDatesRange( new Date(), n, true, true); 
        }else{  
            range = getDatesRange( objects[ objects.length - 1 ].date, n, false, true);
        }
 
        for(let i = 0; i<range.length; i++){

            let object = {
                date : range[i], 
                todos : [], 
                projects : [] 
            }
 
            let key : string = keyFromDate(range[i]);

            let entry : Item[] = objectsByDate[key];
 
            if(entry===undefined){
               objects.push(object);
            }else{
               object.todos = entry.filter((el:Todo) => el.type==="todo"); 
               object.projects = entry.filter((el:Project) => el.type==="project"); 
               objects.push(object);
            }
        } 
         
        return objects;
    }



    componentDidMount(){  
        let objects  = this.generateCalendarObjects(15);
        this.setState({objects}); 
    }    



    componentWillReceiveProps(nextProps:UpcomingProps){
        if(nextProps.projects!==this.props.projects)
            this.updateCalendarObjects();
        else if(nextProps.todos!==this.props.todos)
            this.updateCalendarObjects();
        else if(nextProps.selectedTag!==this.props.selectedTag)
            this.updateCalendarObjects();
    } 


     
    updateCalendarObjects = () => {
        let n = this.state.objects.length;
        this.setState({objects:this.generateCalendarObjects(n)}); 
    }
  


    objectToComponent = (
        object : { date : Date, todos:Todo[], projects:Project[] }, 
        idx:number
    ) : JSX.Element => {

        return <div key={idx}>
            <CalendarDay 
                idx={idx} 
                day={object.date.getDate()}
                dayName={getDayName(object.date)}
                todos={object.todos}
                projects={object.projects}  
                dispatch={this.props.dispatch}
                selectedTodoId={this.props.selectedTodoId}
                selectedTag={this.props.selectedTag}
                rootRef={this.props.rootRef}
                tags={this.props.tags}
             /> 
        </div>
    }

    

    onEnter = ({ previousPosition, currentPosition }) => {
        let objects = this.generateCalendarObjects(50);
        this.setState({objects});  
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


        return <div> 
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
    todos:Todo[],
    dispatch:Function, 
    selectedTodoId:string,
    selectedTag:string,
    rootRef:HTMLElement,
    tags:string[]
}

  

interface CalendarDayState{ 

}

  
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
                                getProjectLink({width:"15px", height:"15px"}, p, index, this.props.dispatch)
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
                            selectedCategory={"upcoming"}
                            selectedTag={this.props.selectedTag}  
                            rootRef={this.props.rootRef}
                            todos={this.props.todos}  
                            tags={this.props.tags} 
                        />  
                    </div> 
                }
                   
      </div>      

    }
} 