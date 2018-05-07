import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { 
    attachDispatchToProps, byNotCompleted, byNotDeleted, getTagsFromItems, 
    generateDropStyle, isDeadlineTodayOrPast, isTodayOrPast, byTags, byCategory
} from "../../utils/utils";  
import { Todo, Project, Area, Calendar, Category, Store, CalendarEvent, action } from '../../types'; 
import { Tags } from '../../Components/Tags';
import { onDrop } from '.././TodosList'; 
import Moon from 'material-ui/svg-icons/image/brightness-3';
import { FadeBackgroundIcon } from '../FadeBackgroundIcon';
import { 
    allPass, isEmpty, not, isNil, flatten, ifElse,
    contains, intersection, or, prop, compose, map, cond,
    identity, all 
} from 'ramda';
import { TodoInput } from '../TodoInput/TodoInput'; 
import { filter } from 'lodash'; 
import { ipcRenderer } from 'electron';
import { TodoCreationForm } from '../TodoInput/TodoCreation';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { arrayMove } from '../../utils/arrayMove';
import { isTodo, isNotArray, isString, isDate, isArray, isNotTodo } from '../../utils/isSomething';
import { assert } from '../../utils/assert';
import { insideTargetArea } from '../../utils/insideTargetArea';
import { generateId } from '../../utils/generateId';
import { generateEmptyTodo } from '../../utils/generateEmptyTodo';
import { chooseIcon } from '../../utils/chooseIcon';
import { SortableContainer } from '../CustomSortableContainer';
import { GroupsByProjectArea } from '../GroupsByProjectArea';
import { isDev } from '../../utils/isDev';
import { timeOfTheDay, inTimeRange, keyFromDate } from '../../utils/time';
import { getSameDayEventElement } from '../../utils/getCalendarEventElement';
import { indexToPriority } from '../../utils/indexToPriority';
import { groupEventsByType } from '../../utils/groupEventsByType';
import { byTime } from '../../utils/byTime';


let Perf = require('react-addons-perf');
let p = require('react-dom/lib/ReactPerf'); 


class ThisEveningSeparator extends Component<{},{}>{
    ref:HTMLElement;

    componentDidMount(){
        if(this.ref){
           this.ref["preventDrag"] = true; 
        } 
    }

    componentWillReceiveProps(){ 
        if(this.ref){
           this.ref["preventDrag"] = true;  
        } 
    } 

    render(){    

        return  <div    
        ref={(e) => {this.ref=e;}}   
        style={{    
            color:"rgba(0,0,0,0.8)",
            fontWeight:"bold",
            fontSize:"16px", 
            userSelect:"none",
            marginTop:"5px", 
            marginBottom:"5px",
            height:"70px",  
            width:"100%",   
            WebkitUserSelect:"none",
            display:"flex",  
            position:"relative",     
            alignItems:"center",    
            justifyContent:"center" 
        }}   
        >        
        <div     
            style={{             
                width:"100%",   
                display:"flex",
                cursor:"default", 
                height:"30px",
                borderBottom:"1px solid rgba(0,0,0,0.1)",
                borderRadius:"5px", 
            }}    
        >     
            <Moon style={{    
                transform:"rotate(145deg)", 
                color:"cornflowerblue",  
                height: "25px",
                width: "25px", 
                cursor:"default"  
            }}/>   
            <div style={{marginLeft: "10px"}}>This Evening</div>
        </div>
        </div>
    } 
}
 


interface TodayProps{  
    dispatch:Function,
    clone:boolean,
    hideHint:boolean, 
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
    groupTodos:boolean,
    showCalendarEvents:boolean,  
    scrolledTodo:Todo, 
    moveCompletedItemsToLogbook:string,
    selectedProjectId:string, 
    selectedAreaId:string, 
    selectedCategory:Category,  
    selectedTodo:Todo,
    indicators : { 
        [key:string]:{
            active:number,
            completed:number,
            deleted:number
        }; 
    },
    areas:Area[],
    calendars:Calendar[],  
    projects:Project[],
    selectedTag:string,
    rootRef:HTMLElement,
    todos:Todo[]
} 
   

 
interface TodayState{}
type Evening = "evening";
type Separator = "separator";

interface TodaySeparator{
    type:Separator, 
    kind:Evening, 
    priority:number,
    _id:string 
}


 
export class Today extends Component<TodayProps,TodayState>{
    ref:HTMLElement;

    constructor(props){
        super(props);
    }  



    onError = (error) => globalErrorHandler(error);



    changeOrder = (oldIndex,newIndex,selected) : action => {
        let load = [];
        let category = "today";
        let items = arrayMove(selected,oldIndex,newIndex);

        for(let i=0; i<items.length; i++){
            let item = items[i]; 
           
            if(item.kind==="evening"){
               category="evening"; 
               continue; 
            }else{
               item.category=category;
               item.priority=i; 
            }
           
            load.push(item);
        }
 
        return {type:"updateTodos", load}; 
    };



    getItems = () : { items:(Todo|TodaySeparator)[], tags:string[] } => {
        let { todos, selectedTag } = this.props;

        let sorted = todos.sort((a:Todo,b:Todo) => a.priority-b.priority);

        let separator : TodaySeparator = { 
            type:"separator", 
            kind:"evening", 
            priority:0, 
            _id:`today-separator` 
        };    

        let tags = getTagsFromItems(todos); 

        let today = filter(sorted, allPass([byTags(selectedTag), (t:Todo) => t.category!=="evening"])); 
        let evening = filter(sorted, allPass([byTags(selectedTag), byCategory("evening")])); 
        
        if(isEmpty(today) && isEmpty(evening)){ return {items:[],tags} }
 
        let items = indexToPriority(
            [
                ...today, 
                separator, 
                ...evening 
            ]
        ); 
 
        return {items,tags};
    };
  


    getElement = (value:Todo | TodaySeparator, index:number) => {
        if(value.type==="separator"){ 

            return <div id={`today-separator`} key={`today-separator-key`}>
                <ThisEveningSeparator />
            </div>  

        }else if(value.type==="todo"){
            let todo = value as Todo; 

            return  <div  
                id={todo._id}
                key={`${todo._id}-todo`} 
                style={{position:"relative"}}
            >  
                <TodoInput   
                    id={todo._id}
                    key={todo._id}
                    scrolledTodo={this.props.scrolledTodo}
                    projects={this.props.projects}  
                    dispatch={this.props.dispatch}  
                    moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                    selectedProjectId={this.props.selectedProjectId}
                    selectedAreaId={this.props.selectedAreaId} 
                    groupTodos={this.props.groupTodos}
                    selectedCategory={this.props.selectedCategory as Category} 
                    rootRef={this.props.rootRef}  
                    todo={todo}
                />      
            </div> 
        }
    }; 
       


    onSortStart = (oldIndex:number,event:any) => {
        if(isDev()){
           Perf.start();
        }
        this.props.dispatch({type:"dragged",load:"todo"});  
    };
    


    onSortMove = (oldIndex:number,event:any) => { };


 
    onSortEnd = (oldIndex:number,newIndex:number,event:any) => { 
        let {todos, areas, projects, moveCompletedItemsToLogbook, filters} = this.props;
        let leftpanel = document.getElementById("leftpanel");
        let {items, tags} = this.getItems();
        let x = event.clientX; 
        let y = event.clientY;  
        let draggedTodo = items[oldIndex] as Todo;
        let actions = [{type:"dragged",load:null}];


        if(isNotTodo(draggedTodo)){
           this.props.dispatch({type:"multiple",load:actions});
           return;
        }


        if(insideTargetArea(null,leftpanel,x,y) && isTodo(draggedTodo)){ 
            let updated : { projects:Project[], todo:Todo } = onDrop({
                event, 
                draggedTodo, 
                projects, 
                config:{moveCompletedItemsToLogbook},
                filters
            }); 

            if(updated.projects){
               actions.push({type:"updateProjects", load:updated.projects});
            }

            if(updated.todo){
               actions.push({type:"updateTodo", load:updated.todo});
            }
        }else{     
 
            if(oldIndex===newIndex){ return }
            let changeOrderAction = this.changeOrder(oldIndex,newIndex,items);
            actions.push(changeOrderAction);  
        }    
        
        this.props.dispatch({type:"multiple",load:actions}); 

        if(isDev()){
            Perf.stop();
            Perf.getLastMeasurements(); 
            Perf.getWasted();
            Perf.printExclusive();
            Perf.printWasted();
        }
    };   
    


    selectElements = (index:number,items:any[]) => [index];



    shouldCancelStart = (e:any,item:any) => {
        let nodes = [].slice.call(e.path);

        for(let i=0; i<nodes.length; i++){
            if(nodes[i].preventDrag){
               return true; 
            }
        }
           
        return false;
    };



    render(){ 
        let { items, tags } = this.getItems();
        let empty = generateEmptyTodo(generateId(), "today", 0);  
        let decorators = [{
            area:document.getElementById("leftpanel"),
            decorator:generateDropStyle("nested"),
            id:"default"
        }];    
  

        if(isDev()){
            assert(
               this.props.selectedTag==="All" ? true : 
               all( todo => contains(this.props.selectedTag)(todo.attachedTags), filter(items, isTodo) ), 
               `missing tag. Today. ${this.props.selectedTag}`
            ); 
        }
        
        
        return <div 
            id={`${this.props.selectedCategory}-list`}
            ref={(e) => {this.ref=e;}}             
            style={{disaply:"flex",flexDirection:"column",width:"100%"} as any}
        > 
            <div style={{ display:"flex", position:"relative", alignItems:"center", marginBottom:"20px"}}>   
                <div style={{ zoom:"0.8", display:"flex", alignItems:"center" }}>
                    {chooseIcon({width:"45px", height:"45px"}, "today")}
                </div> 
                <div style={{  
                    fontFamily: "sans-serif",   
                    fontSize: "xx-large",
                    fontWeight: 600,
                    paddingLeft: "10px", 
                    cursor:"default" 
                }}>   
                    Today  
                </div> 
            </div> 
            <FadeBackgroundIcon    
                container={this.props.rootRef} 
                selectedCategory={this.props.selectedCategory as Category}
                show={isEmpty(items)}
            />  
            <div className={`no-print`}>
                <Tags  
                    selectTag={(tag) => this.props.dispatch({type:"selectedTag", load:tag})}
                    tags={tags} 
                    selectedTag={this.props.selectedTag}
                    show={true}  
                />  
                {
                    ifElse(
                        identity,
                        () => compose(
                            events => <TodaySchedule show={true} events={events}/>,
                            events => filter(events, event => keyFromDate(new Date())===keyFromDate(event.start)),  
                            flatten,    
                            map(prop('events'))
                        )(this.props.calendars),
                        () => null
                    )(this.props.showCalendarEvents)
                }
                {  
                    this.props.hideHint || this.props.clone ? null :
                    <div 
                        style={{paddingTop:"10px", paddingBottom:"10px"}}
                        className={`no-print`}
                    >
                    <Hint  
                        text={`These are your tasks for today.Do you also want to include the events from your calendar?`}
                        dispatch={this.props.dispatch}
                        hideHint={this.props.hideHint}          
                    /> 
                    </div>
                }
            </div>
            <div id="todos">  
                <div className={`no-print`}>        
                    <TodoCreationForm  
                        dispatch={this.props.dispatch}   
                        selectedTodo={this.props.selectedTodo}
                        selectedCategory={this.props.selectedCategory} 
                        selectedProjectId={this.props.selectedProjectId}
                        selectedAreaId={this.props.selectedAreaId} 
                        todos={this.props.todos} 
                        projects={this.props.projects} 
                        rootRef={this.props.rootRef} 
                        todo={empty as any}  
                    /> 
                </div>
                <div style={{position:"relative"}}>   
                    {
                        this.props.groupTodos ?
                        <GroupsByProjectArea
                            dispatch={this.props.dispatch}
                            filters={this.props.filters}
                            scrolledTodo={this.props.scrolledTodo}
                            selectedProjectId={this.props.selectedProjectId}
                            selectedAreaId={this.props.selectedAreaId}
                            selectedCategory={this.props.selectedCategory}
                            groupTodos={this.props.groupTodos} 
                            indicators={this.props.indicators}
                            moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                            selectedTag={this.props.selectedTag}
                            rootRef={this.props.rootRef}
                            areas={this.props.areas} 
                            projectsFilters={[byNotCompleted, byNotDeleted]}
                            areasFilters={[byNotDeleted]}
                            projects={this.props.projects} 
                            todos={this.props.todos}
                        />
                        :
                        <SortableContainer   
                            items={items}
                            scrollableContainer={this.props.rootRef}
                            selectElements={this.selectElements}
                            shouldCancelStart={this.shouldCancelStart}  
                            decorators={decorators}
                            onSortStart={this.onSortStart}   
                            onSortMove={this.onSortMove} 
                            onSortEnd={this.onSortEnd}   
                        >   
                            {items.map((item,index) => this.getElement(item,index))}
                        </SortableContainer> 
                    } 
                </div>  
            </div> 
        </div>
  } 
}



interface TodayScheduleProps{
    show:boolean,
    events:CalendarEvent[]  
}

export class TodaySchedule extends Component<TodayScheduleProps,{}>{

    constructor(props){
        super(props);
    }

    render(){
        let {show, events} = this.props;
        let {sameDayEvents,fullDayEvents} = groupEventsByType(events); 
        let empty : boolean = isEmpty(sameDayEvents) && isEmpty(fullDayEvents);

        
        return not(show) ? null : empty ? null :  
        <div style={{paddingTop:"20px",paddingLeft:"25px"}}>    
            <div style={{          
                display:"flex",
                flexDirection:"column", 
                borderRadius:"10px",  
                padding:"5px",
                width:"95%",
                backgroundColor:"rgba(100,100,100,0.1)",
                fontFamily:"sans-serif", 
                height:"auto"
            }}> 
            {
                fullDayEvents
                .map(  
                    (event,index) => 
                    <div key={`event-${event.name}-${index}`} style={{paddingTop:"1px", paddingBottom:"1px"}}>
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
                            event.type!=="multipleDaysEvents" ? null :
                            <div style={{paddingRight:"5px",height:"100%",backgroundColor:"dimgray"}}></div>
                        }
                        <div style={{paddingLeft:event.type!=="multipleDaysEvents" ? "0px":"5px"}}>
                            {getSameDayEventElement(event,false)}
                        </div> 
                    </div> 
                )   
            }
            </div>
        </div>
    }   
} 



interface HintProps{ 
    dispatch:Function,
    hideHint:boolean,
    text:string 
}
interface HintState{} 
export class Hint extends Component<HintProps,HintState>{

    constructor(props){ 
        super(props);
    } 


    onError = (error) => globalErrorHandler(error);

     
    onLoad = (e) => this.props.dispatch({
        type:"multiple",
        load:[
            {type:"hideHint", load:true}, 
            {type:"selectedSettingsSection", load:'CalendarEvents'},
            {type:"openSettings", load:true}
        ]
    })  
    
    
    onClose = (e) => this.props.dispatch({type:"hideHint", load:true}); 
    

    render(){
        let {hideHint} = this.props;
        return hideHint ? null :
        <div style={{
            display:"flex",
            padding:"20px",
            flexDirection:"column",
            borderRadius:"5px",
            height:"120px",
            justifyContent:"space-between",
            cursor:"default",
            userSelect:"none",
            alignItems:"center",
            backgroundColor:"rgb(238, 237, 239)" 
        }}>   

            <div style={{
                fontSize:"15px",
                fontWeight:500, 
                color:"rgba(100, 100, 100, 0.9)",
                width:"90%",
                height:"50%",
                overflow:"hidden",
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                textAlign:"center"
            }}>
                {this.props.text}
            </div>   
            <div style={{  
                display:"flex",
                alignItems:"flex-end",
                justifyContent:"center",
                height:"50%",
                width:"100%",
                overflow:"hidden"
            }}>
                <div style={{padding:"10px"}}>
                    <div     
                        onClick={this.onClose} 
                        style={{      
                            width:"130px",
                            display:"flex",
                            alignItems:"center",
                            cursor:"pointer",
                            justifyContent:"center",
                            borderRadius:"5px",
                            height:"35px",
                            backgroundColor:"rgb(81, 151, 246)" 
                        }}    
                    > 
                        <div style={{color:"white",fontSize:"15px",fontWeight:500,whiteSpace:"nowrap"}}>
                            No
                        </div>   
                    </div> 
                </div> 
                <div style={{padding: "10px"}}>
                    <div     
                        onClick={this.onLoad}
                        style={{      
                            width:"130px",
                            display:"flex",
                            alignItems:"center",
                            cursor:"pointer",
                            justifyContent:"center",
                            borderRadius:"5px",
                            height:"35px",
                            backgroundColor:"rgb(81, 151, 246)" 
                        }}
                    > 
                        <div style={{color:"white",fontSize:"15px",fontWeight:500,whiteSpace:"nowrap"}}>    
                            Include Events
                        </div>   
                    </div> 
                </div>
            </div>
        </div>  
    } 
} 