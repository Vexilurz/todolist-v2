import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { 
    attachDispatchToProps, uppercase, insideTargetArea, 
    chooseIcon, byNotCompleted, byNotDeleted, getTagsFromItems, attachEmptyTodo, generateEmptyTodo, isToday, daysRemaining, isTodo, assert, makeChildrensVisible, hideChildrens, generateDropStyle, arrayMove, keyFromDate, setToJsonStorage, getFromJsonStorage 
} from "../../utils";  
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { 
    queryToTodos, getTodos, updateTodo, Todo, removeTodo, addTodo, 
    Project, Area, generateId, Calendar
} from '../../database'; 
import Popover from 'material-ui/Popover';
import { Tags } from '../../Components/Tags';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Repeat from 'material-ui/svg-icons/av/repeat';
import { Store, isDev } from '../../app';
import Inbox from 'material-ui/svg-icons/content/inbox';
import Duplicate from 'material-ui/svg-icons/content/content-copy';
import ShareIcon from 'material-ui/svg-icons/social/share';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import { TextField } from 'material-ui';
import AutosizeInput from 'react-input-autosize';
import { ContainerHeader } from '.././ContainerHeader';
import { TodosList, Placeholder, getPlaceholderOffset, onDrop } from '.././TodosList'; 
import Moon from 'material-ui/svg-icons/image/brightness-3';
import { byTags, byCategory } from '../../utils';
import { FadeBackgroundIcon } from '../FadeBackgroundIcon';
import { compose, allPass, isEmpty, not, assoc, isNil } from 'ramda';
import { TodoInput } from '../TodoInput/TodoInput'; 
import { Category } from '../MainContainer';
import { SortableContainer } from '../../sortable/CustomSortableContainer';
import { calculateAmount } from '../LeftPanel/LeftPanel';
import { isDate } from 'util';
import { ipcRenderer, remote } from 'electron';

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
    showCalendarEvents:boolean,  
    selectedTodoId:string,
    selectedProjectId:string, 
    selectedAreaId:string, 
    selectedCategory:string,  
    areas:Area[],
    calendars:Calendar[],  
    searched:boolean, 
    projects:Project[],
    selectedTag:string,
    rootRef:HTMLElement,
    todos:Todo[], 
    tags:string[]
} 
   

 
interface TodayState{
    showHint:boolean
}
 
 
type Evening = "evening";
type Separator = "separator";

interface TodaySeparator{
    type:Separator, 
    kind:Evening, 
    priority:number,
    _id:string 
}


 
export class Today extends Component<TodayProps,TodayState>{


    constructor(props){
        super(props);
        this.state = {
            showHint:false
        }
    }  

    
    componentDidMount(){ 
        hideHint()
        .then( (hide) => this.setState({showHint:!hide}) )     
    }     
  
    
    shouldComponentUpdate(nextProps:TodayProps,nextState:TodayState){

        if(
            this.props.selectedTodoId!==nextProps.selectedTodoId ||
            this.props.selectedCategory!==nextProps.selectedCategory || 
            this.props.searched!==nextProps.searched ||
            this.props.projects!==nextProps.projects ||
            this.props.selectedTag!==nextProps.selectedTag || 
            this.props.rootRef!==nextProps.rootRef ||
            this.props.todos!==nextProps.todos ||
            this.props.tags!==nextProps.tags ||
            this.props.showCalendarEvents!==nextProps.showCalendarEvents ||
            this.props.calendars!==nextProps.calendars ||
            this.state.showHint!==nextState.showHint
        ){     
            return true
        }


        return false   
    }


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
    }



    getItems = () : { items:(Todo|TodaySeparator)[], tags:string[] } => {

        let { todos, selectedTag } = this.props;

        let separator : TodaySeparator = { 
            type:"separator", 
            kind:"evening", 
            priority:0, 
            _id:`today-separator` 
        };   

        let isTodayOrPast = (date:Date) : boolean => 
            isNil(date) ?    
            false :  
            daysRemaining(date)<=0; 

        let filters = [   
            (t:Todo) => isTodayOrPast(t.attachedDate) || isTodayOrPast(t.deadline), 
            byNotCompleted,  
            byNotDeleted   
        ];    

        let todayFilters = [ 
            ...filters, 
            byTags(selectedTag),
            (t:Todo) => t.category!=="evening"
        ];

        let eveningFilters = [
            ...filters, 
            byTags(selectedTag),
            byCategory("evening")
        ];

        let tags = getTagsFromItems(todos.filter(allPass(filters)));

        let today = todos.filter(allPass(todayFilters)); 
        let evening = todos.filter(allPass(eveningFilters)); 

        if(isEmpty(today) && isEmpty(evening)){ return {items:[],tags} }

        let items = indexToPriority([...today, separator, ...evening]); 

        return {items,tags}
    }
  



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
                    projects={this.props.projects}  
                    dispatch={this.props.dispatch}  
                    selectedProjectId={this.props.selectedProjectId}
                    selectedAreaId={this.props.selectedAreaId} 
                    todos={this.props.todos}
                    selectedCategory={this.props.selectedCategory as Category} 
                    selectedTodoId={this.props.selectedTodoId}
                    tags={this.props.tags} 
                    searched={this.props.searched}
                    rootRef={this.props.rootRef}  
                    todo={todo}
                />      
            </div> 
        }

    } 
       

    shouldCancelStart = (e) => {

        let nodes = [].slice.call(e.path);

        for(let i=0; i<nodes.length; i++){
            if(nodes[i].preventDrag){
               return true 
            }
        }
           
        return false
    }  
     

    onSortStart = (oldIndex:number,event:any) => { 
        this.props.dispatch({type:"dragged",load:"todo"});  
    }

    
    onSortMove = (oldIndex:number,event:any) => { } 
 

    onSortEnd = (oldIndex:number,newIndex:number,event:any) => { 
        this.props.dispatch({type:"dragged",load:null});
        let leftpanel = document.getElementById("leftpanel");

        let {todos, dispatch, areas, projects} = this.props;
        let {items, tags} = this.getItems();

        let x = event.clientX; 
        let y = event.clientY;  

        let draggedTodo = items[oldIndex] as Todo;

        assert(isTodo(draggedTodo), `draggedTodo is not of type Todo. onSortEnd. ${JSON.stringify(draggedTodo)}`);

        if(insideTargetArea(null,leftpanel,x,y) && isTodo(draggedTodo)){ 
           onDrop(
             event, 
             draggedTodo, 
             dispatch,
             areas,
             projects
           ); 
        }else{     
            if(oldIndex===newIndex){ return }
            this.changeOrder(oldIndex,newIndex,items);  
        }     
    }   
 
     

    render(){
         
        let { todos, selectedTag, areas, projects, calendars, showCalendarEvents } = this.props;
        let { items, tags } = this.getItems();
        let empty = generateEmptyTodo(generateId(), "today", 0);  


        let {today} = calculateAmount(areas,projects,todos);  

        if(isDev() && selectedTag==="All" && items.length>0 && today>0){       
            assert(
             (today)===(items.length-1), 
               `
                 incorrect amount. 
                 items : ${items.length}; 
                 today : ${today}; 
               `
            );    
        }

        let decorators = [{  
            area:document.getElementById("leftpanel"),  
            decorator:generateDropStyle("nested"),
            id:"default"
        }];    

        let events = [];

        if(showCalendarEvents){

            let todayKey : string = keyFromDate(new Date()); 

            calendars 
            .filter((calendar:Calendar) => calendar.active)
            .forEach( 
                (calendar:Calendar) => {
                    let selected : any[] = calendar.events.filter( 
                        (event:any) : boolean => 
                            isNil(event) ? false :
                            not(isDate(event.start)) ? false :
                            todayKey===keyFromDate(event.start)
                    );

                    if(!isEmpty(selected)){
                        events.push(...selected); 
                    }; 
                } 
            ) 
        }
         

        return <div style={{
            disaply:"flex", 
            flexDirection:"column"
        }}> 
            <div style={{width: "100%"}}> 
                    <div style={{  
                        display:"flex", 
                        position:"relative",
                        alignItems:"center",
                        marginBottom:"20px"
                    }}>   
                        <div>
                            {chooseIcon({width:"50px",height:"50px"}, "today")}
                        </div> 
                        <div style={{  
                            fontFamily: "sans-serif",   
                            fontSize: "xx-large",
                            fontWeight: 600,
                            paddingLeft: "10px", 
                            cursor:"default" 
                        }}>   
                            {uppercase("today")} 
                        </div> 
                    </div> 
                    <FadeBackgroundIcon    
                        container={this.props.rootRef} 
                        selectedCategory={"today"}  
                        show={isEmpty(items)}
                    />  
                    <Tags  
                        selectTag={(tag) => this.props.dispatch({type:"selectedTag", load:tag})}
                        tags={tags} 
                        selectedTag={this.props.selectedTag}
                        show={true}  
                    />     
                    <TodaySchedule show={showCalendarEvents} events={events}/>  
  
                    {   
                        this.state.showHint ? 
                        <Hint {
                            ...{
                                hideHint:() => this.setState({showHint:false})
                            } as any 
                        }/> : 
                        null
                    } 
                <div   
                    id="todos" 
                    style={{marginBottom: "50px", marginTop:"20px"}} 
                >         
                    <TodoInput   
                        id={empty._id}  
                        key={"today-todo-creation-form"} 
                        dispatch={this.props.dispatch}  
                        selectedProjectId={this.props.selectedProjectId}
                        selectedAreaId={this.props.selectedAreaId} 
                        todos={this.props.todos}
                        selectedCategory={"today"} 
                        projects={this.props.projects} 
                        selectedTodoId={this.props.selectedTodoId}
                        tags={this.props.tags} 
                        rootRef={this.props.rootRef}  
                        searched={this.props.searched} 
                        todo={empty}
                        creation={true}
                    />   

                    <div style={{position:"relative"}}>   
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
                    </div>  
                </div>     
            </div>
    </div>
  } 
}









interface TodayScheduleProps{
    show:boolean,
    events:string[]  
}

export class TodaySchedule extends Component<TodayScheduleProps,{}>{

    constructor(props){
        super(props);
    }

    render(){
        let {show, events} = this.props;

        return not(show) ? null : 
        <div style={{paddingTop:"20px"}}>   
            <div style={{          
                display:"flex",
                flexDirection:"column",
                borderRadius:"10px", 
                backgroundColor:"rgba(100,100,100,0.1)",
                width:"100%",
                fontFamily: "sans-serif", 
                height:"auto"
            }}>{
                events.map(  
                    (event) => 
                    <div style={{padding:"10px"}}>
                        <div style={{
                            display:"flex",
                            height:"20px",
                            alignItems:"center"
                        }}>
                            <div style={{
                                paddingRight:"5px",
                                height:"100%", 
                                backgroundColor:"dimgray"
                            }}>
                            </div>
                            <div style={{
                                fontSize:"14px",
                                userSelect:"none",
                                cursor:"default",
                                paddingLeft:"5px" 
                            }}>   
                                {event}
                            </div>
                        </div>
                    </div> 
                )  
            }</div>
        </div>
    }   
}



let setHideHint = (hide:boolean) : Promise<void> => setToJsonStorage("hideHint", {hideHint:hide}); 

let hideHint = () : Promise<boolean> => getFromJsonStorage("hideHint")
                                        .then((data) => data ? data.hideHint : null);       
 
interface HintProps extends Store{ hideHint : Function }

interface HintState{} 
 
@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps) 
class Hint extends Component<HintProps,HintState>{

    constructor(props){
        super(props);
    }

    onLoad = (e) => { 
        let {hideHint,dispatch} = this.props;
        hideHint();
        setHideHint(true);
        dispatch({type:"selectedSettingsSection", load:'CalendarEvents'});
        dispatch({type:"openSettings",load:true}); 
    }
    
    onClose = (e) => { 
        let {hideHint,dispatch} = this.props;
        hideHint(); 
        setHideHint(true);
    }

    render(){
        return <div style={{
            display:"flex",
            padding:"10px",
            flexDirection:"column",
            borderRadius:"5px",
            height:"160px", 
            cursor:"default",
            userSelect:"none", 
            backgroundColor:"rgb(238, 237, 239)"
        }}>    
            <div style={{  
                display:"flex",
                flexDirection:"column",
                alignItems:"flex-start",
                justifyContent:"flex-start",
                padding:"10px" 
            }}> 
                <div style={{
                    display:"flex",
                    justifyContent:"center",
                    paddingTop:"10px",
                    height:"100%",
                    alignItems:"flex-start"
                }}>  
                    { chooseIcon({width:"40px", height:"40px"}, "upcoming") }  
                </div>
                <div style={{
                    paddingBottom:"10px", 
                    fontWeight:"bold", 
                    fontSize:"15px", 
                    color:"rgba(0,0,0,1)"
                }}>   
                    Calendar events
                </div>
            </div>

            <div style={{fontSize:"14px", color:"rgba(0,0,0,1)"}}>
                You can load calendar events, they will be displayed in upcoming and today section.
                Do you want to do it now ?   
            </div>

            <div style={{  
                display:"flex",  
                alignItems: "flex-end", 
                justifyContent: "space-around",
                height: "50%"
            }}>
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
                            border:"1px solid rgba(100,100,100,0.5)",
                            backgroundColor:"rgb(10, 90, 250)"  
                        }}
                    > 
                        <div style={{
                            color:"white",
                            fontSize:"15px",
                            whiteSpace:"nowrap"  
                        }}>    
                            Load events
                        </div>   
                    </div> 
                </div>

                <div style={{padding: "10px"}}>
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
                            border:"1px solid rgba(100,100,100,0.5)",
                            backgroundColor:"white"  
                        }}
                    > 
                        <div style={{
                            color:"black",
                            fontSize:"15px",
                            whiteSpace:"nowrap"  
                        }}>    
                            Later
                        </div>   
                    </div> 
                </div> 
            </div>
        </div>  
    }
} 