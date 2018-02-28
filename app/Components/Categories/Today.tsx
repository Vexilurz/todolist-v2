import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { 
    attachDispatchToProps, byNotCompleted, byNotDeleted, getTagsFromItems, 
    generateDropStyle,  keyFromDate, isDeadlineTodayOrPast, isTodayOrPast, 
    sameDay, byTags, byCategory
} from "../../utils/utils";  
import { connect } from "react-redux";
import { Todo, Project, Area, Calendar } from '../../database'; 
import { Tags } from '../../Components/Tags';
import { Store } from '../../app';
import { onDrop } from '.././TodosList'; 
import Moon from 'material-ui/svg-icons/image/brightness-3';
import { FadeBackgroundIcon } from '../FadeBackgroundIcon';
import { allPass, isEmpty, not, assoc, isNil, flatten, contains, intersection } from 'ramda';
import { TodoInput } from '../TodoInput/TodoInput'; 
import { Category, filter } from '../MainContainer';
import { isDate } from 'util';
import { ipcRenderer, remote } from 'electron';
import { CalendarEvent } from '../Calendar';
import { TodoCreationForm } from '../TodoInput/TodoCreation';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { arrayMove } from '../../utils/arrayMove';
import { isTodo, isNotArray, isString } from '../../utils/isSomething';
import { assert } from '../../utils/assert';
import { insideTargetArea } from '../../utils/insideTargetArea';
import { generateId } from '../../utils/generateId';
import { generateEmptyTodo } from '../../utils/generateEmptyTodo';
import { chooseIcon } from '../../utils/chooseIcon';
import { SortableContainer } from '../CustomSortableContainer';
import { updateConfig } from '../../utils/config';
import { GroupsByProjectArea } from '../GroupsByProjectArea';
import { isDev } from '../../utils/isDev';
import { timeOfTheDay } from '../../utils/time';


export let indexToPriority = (items:any[]) : any[] => {
    return items.map((item,index:number) => assoc("priority",index,item)) 
}


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
    groupTodos:boolean,
    showCalendarEvents:boolean,  
    selectedTodo:Todo, 
    moveCompletedItemsToLogbook:string,
    selectedProjectId:string, 
    selectedAreaId:string, 
    selectedCategory:Category,  
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


    calculateTodayAmount = (props:TodayProps) => {
        let {todos,dispatch} = this.props

        let todayFilters = [   
            (t:Todo) => isTodayOrPast(t.attachedDate) || isTodayOrPast(t.deadline), 
            byNotCompleted,  
            byNotDeleted   
        ];    
    
        let hotFilters = [ 
            (todo:Todo) => isDeadlineTodayOrPast(todo.deadline),
            byNotCompleted,  
            byNotDeleted  
        ]; 

        dispatch({
            type:"todayAmount",
            load:todos.filter((t:Todo) => allPass(todayFilters)(t)).length
        });
        dispatch({
            type:"hotAmount",
            load:todos.filter((t:Todo) => allPass(hotFilters)(t as (Project & Todo))).length
        });
    };


    onError = (error) => globalErrorHandler(error);
    

    componentDidMount(){ 
        this.calculateTodayAmount(this.props);
    };     
  

    componentWillReceiveProps(nextProps:TodayProps){
        this.calculateTodayAmount(nextProps); 
    };


    changeOrder = (oldIndex,newIndex,selected) => {
        let load = [];
        let category = "today";
        let items = arrayMove(selected,oldIndex,newIndex);

        for(let i=0; i<items.length; i++){
           let item = items[i]; 
           
           if(item.kind==="evening"){
              category="evening"; 
              continue; 
           }else{
              item.category = category;
              item.priority = i; 
           }
           
           load.push(item);
        }

        this.props.dispatch({type:"updateTodos", load});
    };


    getItems = () : { items:(Todo|TodaySeparator)[], tags:string[] } => {
        let { todos, selectedTag } = this.props;

        let separator : TodaySeparator = { 
            type:"separator", 
            kind:"evening", 
            priority:0, 
            _id:`today-separator` 
        };    

        let tags = getTagsFromItems(todos); 
        let today = filter(todos,allPass([byTags(selectedTag), (t:Todo) => t.category!=="evening"]),"today"); 
        let evening = filter(todos,allPass([byTags(selectedTag), byCategory("evening")]),"evening"); 
        
        if(isEmpty(today) && isEmpty(evening)){ return {items:[],tags} }
 
        let items = indexToPriority([...today, separator, ...evening]); 
 
        return {items,tags}
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
                    selectedTodo={this.props.selectedTodo}
                    projects={this.props.projects}  
                    dispatch={this.props.dispatch}  
                    moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                    selectedProjectId={this.props.selectedProjectId}
                    selectedAreaId={this.props.selectedAreaId} 
                    groupTodos={this.props.groupTodos}
                    todos={this.props.todos}
                    selectedCategory={this.props.selectedCategory as Category} 
                    rootRef={this.props.rootRef}  
                    todo={todo}
                />      
            </div> 
        }
    }; 
       

    shouldCancelStart = (e) => {

        let nodes = [].slice.call(e.path);

        for(let i=0; i<nodes.length; i++){
            if(nodes[i].preventDrag){
               return true; 
            }
        }
           
        return false;
    };


    onSortStart = (oldIndex:number,event:any) => { 
        this.props.dispatch({type:"dragged",load:"todo"});  
    };


    onSortMove = (oldIndex:number,event:any) => { };

 
    onSortEnd = (oldIndex:number,newIndex:number,event:any) => { 
        this.props.dispatch({type:"dragged",load:null});
        let leftpanel = document.getElementById("leftpanel");

        let {todos, dispatch, areas, projects, moveCompletedItemsToLogbook} = this.props;
        let {items, tags} = this.getItems();

        let x = event.clientX; 
        let y = event.clientY;  

        let draggedTodo = items[oldIndex] as Todo;

        assert(isTodo(draggedTodo), `draggedTodo is not of type Todo. onSortEnd. ${draggedTodo}`);

        if(insideTargetArea(null,leftpanel,x,y) && isTodo(draggedTodo)){ 

            let updated : { projects:Project[], todo:Todo } = onDrop({
                event, 
                draggedTodo, 
                projects, 
                config:{moveCompletedItemsToLogbook}
            }); 

            if(updated.projects){
               dispatch({type:"updateProjects", load:updated.projects});
            }

            if(updated.todo){
               dispatch({type:"updateTodo", load:updated.todo});
            }
            
        }else{     
            if(oldIndex===newIndex){ return }
            this.changeOrder(oldIndex,newIndex,items);  
        }     
    };   
    

    render(){ 
        let { 
            todos,  
            selectedTag, 
            areas,  
            projects, 
            calendars, 
            showCalendarEvents, 
            groupTodos, 
            dispatch, 
            selectedProjectId, 
            moveCompletedItemsToLogbook,
            selectedAreaId,
            selectedCategory,
            rootRef, 
            selectedTodo,
            clone  
        } = this.props;
        let { items, tags } = this.getItems();
        let empty = generateEmptyTodo(generateId(), "today", 0);  

        if(isDev()){
            let todos = filter(items, isTodo, "");
            let hiddenProjects = filter(
                projects, 
                (p:Project) => isNotArray(p.hide) ? false : contains(selectedCategory)(p.hide),
                ""
            );
            let ids : string[] = flatten(hiddenProjects.map((p:Project) => filter(p.layout,isString,"")));
            let hiddenTodos = filter(todos, (todo:Todo) => contains(todo._id)(ids), "");
            let tagsFromTodos : string[] = flatten(hiddenTodos.map((todo:Todo) => todo.attachedTags));

            assert(
                isEmpty(intersection(tags,tagsFromTodos)),
                `tags from hidden Todos still displayed ${selectedCategory}.`
            ); 
        }

        
        let decorators = [{
            area:document.getElementById("leftpanel"),
            decorator:generateDropStyle("nested"),
            id:"default"
        }];    

        let events : CalendarEvent[] = [];

        if(showCalendarEvents){
            let todayKey : string = keyFromDate(new Date()); 
            calendars 
            .filter((calendar:Calendar) => calendar.active)
            .forEach( 
                (calendar:Calendar) => {
                    let selected = calendar.events.filter( 
                        (event:CalendarEvent) : boolean => 
                            isNil(event) ? false :
                            not(isDate(event.start)) ? false :
                            todayKey===keyFromDate(event.start)
                    );

                    if(!isEmpty(selected)){ events.push(...selected) }; 
                }   
            ) 
        }
        
        

        return <div 
            id={`${selectedCategory}-list`}
            ref={(e) => {this.ref=e;}}             
            style={{disaply:"flex", flexDirection:"column", width: "100%"}}
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
                selectedCategory={selectedCategory as Category}
                show={isEmpty(items)}
            />  
            <div className={`no-print`}>
                <Tags  
                    selectTag={(tag) => this.props.dispatch({type:"selectedTag", load:tag})}
                    tags={tags} 
                    selectedTag={this.props.selectedTag}
                    show={true}  
                />  
                <TodaySchedule show={showCalendarEvents} events={events}/>  
                {  
                    clone ? null :
                    <Hint 
                        {
                            ...{
                            text:`These are your tasks for today. 
                            Do you also want to include the events from your calendar?`
                            } as any  
                        } 
                    /> 
                }
            </div>
            <div id="todos">  
                <div className={`no-print`}>        
                    <TodoCreationForm  
                        dispatch={this.props.dispatch}  
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
                        groupTodos ? 
                        <GroupsByProjectArea
                            dispatch={dispatch}
                            selectedProjectId={selectedProjectId}
                            selectedAreaId={selectedAreaId}
                            selectedCategory={selectedCategory}
                            groupTodos={groupTodos}
                            selectedTodo={selectedTodo}
                            moveCompletedItemsToLogbook={moveCompletedItemsToLogbook}
                            selectedTag={selectedTag}
                            rootRef={rootRef}
                            areas={areas} 
                            projectsFilters={[byNotCompleted, byNotDeleted]}
                            areasFilters={[byNotDeleted]}
                            projects={projects} 
                            todos={todos}
                        />
                        :
                        <SortableContainer   
                            items={items}
                            scrollableContainer={this.props.rootRef}
                            selectElements={(index:number,items:any[]) => [index]}
                            shouldCancelStart={(event:any,item:any) => this.shouldCancelStart(event)}  
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
        let wholeDay : CalendarEvent[] = events.filter((event) => not(sameDay(event.start,event.end)));
        let timed : CalendarEvent[] = events.filter((event) => sameDay(event.start,event.end));
        let empty : boolean = isEmpty(wholeDay) && isEmpty(timed);
        
        return not(show) ? null : empty ? null :  
        <div style={{paddingTop:"20px",paddingLeft:"25px"}}>    
            <div style={{          
                display:"flex",
                flexDirection:"column",
                borderRadius:"10px", 
                backgroundColor:"rgba(100,100,100,0.1)",
                width:"100%",
                fontFamily: "sans-serif", 
                height:"auto"
            }}> 
            {
                wholeDay
                .map(  
                    (event) => 
                    <div key={`event-${event.name}`} style={{padding:"1px"}}>
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
                timed
                .sort((a:CalendarEvent,b:CalendarEvent) => { 
                    let aTime = 0;
                    let bTime = 0;
                
                    if(isDate(a.start)){
                        aTime = a.start.getTime(); 
                    }

                    if(isDate(b.start)){
                        bTime = b.start.getTime(); 
                    }
                    
                    return aTime-bTime;
                })
                .map(   
                    (event) => 
                    <div key={`event-${event.name}`} style={{padding:"1px"}}>
                        <div style={{display:"flex",height:"20px",alignItems:"center"}}>
                        <div style={{paddingLeft:"5px", fontSize:"14px", fontWeight:500}}>
                            {timeOfTheDay(event.start)}
                        </div>
                        <div style={{fontSize:"14px",userSelect:"none",cursor:"default",fontWeight:500,paddingLeft:"5px",overflowX:"hidden"}}>   
                            {event.name}  
                        </div>
                        </div>
                    </div> 
                )  
            }
            </div>
        </div>
    }   
} 

 

interface HintProps extends Store{ text : string }

interface HintState{} 
 
@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps) 
export class Hint extends Component<HintProps,HintState>{

    constructor(props){ 
        super(props);
    } 

    onError = (error) => globalErrorHandler(error);
     
    onLoad = (e) => { 
        let {dispatch} = this.props; 
        updateConfig(dispatch)({hideHint:true})
        .then(
            () => {
                dispatch({type:"selectedSettingsSection",load:'CalendarEvents'});
                dispatch({type:"openSettings",load:true}); 
            }
        );
    };
    
    onClose = (e) => {  
        let {dispatch} = this.props;
        updateConfig(dispatch)({hideHint:true});
    }; 

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