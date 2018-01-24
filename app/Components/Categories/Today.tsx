import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { 
    attachDispatchToProps, uppercase, insideTargetArea, 
    chooseIcon, byNotCompleted, byNotDeleted, getTagsFromItems, attachEmptyTodo, generateEmptyTodo, isToday, daysRemaining, isTodo, assert, makeChildrensVisible, hideChildrens, generateDropStyle, arrayMove 
} from "../../utils";  
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { queryToTodos, getTodos, updateTodo, Todo, removeTodo, addTodo, Project, Area, generateId } from '../../database';
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
    selectedTodoId:string,
    selectedProjectId:string, 
    selectedAreaId:string, 
    selectedCategory:string,  
    areas:Area[],
    searched:boolean, 
    projects:Project[],
    selectedTag:string,
    rootRef:HTMLElement,
    todos:Todo[], 
    tags:string[]
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


    constructor(props){
        super(props);
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
            this.props.tags!==nextProps.tags
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
         
        let { todos, selectedTag, areas, projects } = this.props;
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
                    <TodaySchedule show={true}/>
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
    show:boolean  
}

export class TodaySchedule extends Component<TodayScheduleProps,any>{

    constructor(props){
        super(props);
    }

    render(){

        return !this.props.show ? null :
           
        <div style={{    
            paddingTop: "10px", 
            paddingBottom: "10px", 
            marginBottom: "20px", 
            display:"flex",
            flexDirection:"column",
            borderRadius:"10px", 
            backgroundColor:"rgba(100,100,100,0.1)",
            width:"100%",
            fontFamily: "sans-serif", 
            height:"auto"
        }}> 

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
                        {" Paul Martin's Birthday"}
                    </div>
                </div>
                


                <div style={{  
                    fontSize:"14px", 
                    color:"rgba(100, 100, 100, 0.9)",
                    paddingTop:"5px",
                    
                }}> 
                    {"08:30 Blinkist // Quora"}
                </div>


                <div style={{
                    fontSize:"14px", 
                    color:"rgba(100, 100, 100, 0.9)",
                    paddingTop:"5px",
                }}>
                    {"11:00 Newton // Marketing"}
                </div>


                <div style={{
                    fontSize:"14px", 
                    color:"rgba(100, 100, 100, 0.9)",
                    paddingTop:"5px",
                }}>
                    {"12:00 FlashSticks // Marketing"}
                </div>
 

                <div style={{
                    fontSize:"14px", 
                    color:"rgba(100, 100, 100, 0.9)",
                    paddingTop:"5px",
                }}>
                    {"18:00 Scott Woods"}
                </div> 

            </div> 
                
        </div>

    }

}



 