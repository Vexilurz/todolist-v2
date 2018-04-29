import './../assets/styles.css';  
import './../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import ClearArrow from 'material-ui/svg-icons/content/backspace';   
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
 import NewProjectIcon from 'material-ui/svg-icons/image/timelapse';
import Popover from 'material-ui/Popover';
import { Category, ChecklistItem, Todo, Project, Area, LayoutItem, Store } from '../types';
import { remove, isNil, not, and, equals } from 'ramda';
let uniqid = require("uniqid");    
import { isDev } from '../utils/isDev'; 
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { attachDispatchToProps, getCompletedWhen } from '../utils/utils';
import { insideTargetArea } from '../utils/insideTargetArea';
import { generateId } from '../utils/generateId';
import { assert } from '../utils/assert';
import { noteFromState, getNotePlainTextFromRaw } from '../utils/draftUtils';
import { isNotNil } from '../utils/isSomething';
 

 
interface RightClickMenuState{
    offset:number
}   
 
@connect((store,props) => ({...store, ...props}), attachDispatchToProps) 
export class RightClickMenu extends Component<Store,RightClickMenuState>{

    ref:HTMLElement;  
    subscriptions:Subscription[];  

    constructor(props){
       super(props);
       this.state = {offset:0}; 
       this.subscriptions = [];
    }
    


    componentDidMount(){  
        this.subscriptions.push(
            Observable.fromEvent(window, "click").subscribe(this.onOutsideClick)
        ); 
    }   



    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = [];
    } 



    onOutsideClick = (e) => {
        if(isNil(this.ref)){ return }
        let {dispatch} = this.props;

        let x = e.pageX;
        let y = e.pageY; 

        let inside = insideTargetArea(null,this.ref,x,y);
    
        if(not(inside)){
            dispatch({
                type: "openRightClickMenu",
                load: {
                    showRightClickMenu:false,
                    rightClickedTodoId:null,
                    rightClickMenuX:0,
                    rightClickMenuY:0
                }
            }); 
        }   
    };



    getRightClickedTodo = () : Todo => {
        let { todos, dispatch, rightClickedTodoId } = this.props; 
        let todo : Todo = todos.find( (t:Todo) => t._id===rightClickedTodoId );
        return todo;
    };



    onDeleteToDo = (e) => {
        let { dispatch } = this.props; 
        let todo : Todo = this.getRightClickedTodo();

        if(isNil(todo)){ return }
         
        if(isNotNil(todo.group)){  
           dispatch({type:"openChangeGroupPopup", load:true});         
        }else{ 
           dispatch({type:"updateTodo", load:{...todo,reminder:null,deleted:new Date()}});
        } 
    };
    


    onDuplicate = (e) => {
        let { dispatch } = this.props; 
        let todo : Todo = this.getRightClickedTodo();
        
        if(isNil(todo)){ return }
        
        let duplicate : Todo = {...todo};
        duplicate._id = generateId();
        delete duplicate['_rev']; 
 
        dispatch({type:"addTodo", load:duplicate}); 
    }; 



    onComplete = (e) => {
        let { dispatch, moveCompletedItemsToLogbook } = this.props; 
        let todo : Todo = this.getRightClickedTodo();

        if(isNil(todo)){ return }

        dispatch({ 
            type:"updateTodo", 
            load:{ 
                ...todo, 
                completedSet:isNil(todo.completedSet) ? new Date() : todo.completedSet, 
                completedWhen:getCompletedWhen(moveCompletedItemsToLogbook,new Date())
            } 
        });
    };
    
    

    onConvertToProject = (e) => { 
        let {dispatch} = this.props;
        let todo : Todo = this.getRightClickedTodo();

        if(isNil(todo)){ return }

        let todos = todo.checklist.map( 
            (c : ChecklistItem) : Todo => ({ 
                    _id : uniqid(),  
                    category : "next", 
                    type : "todo",
                    title : c.text,  
                    priority : Math.random(),
                    note : noteFromState(null),  
                    checklist : [],
                    reminder : null,  
                    attachedTags : [], 
                    deadline : null,
                    created : new Date(),
                    deleted : null,
                    attachedDate : null, 
                    completedSet : c.checked ? new Date() : null,
                    completedWhen : c.checked ? new Date() : null
            })
        );

        let layout : string[] = todos.map( (t:Todo) : string => t._id ); 

        let converted : Project = {   
            _id : generateId(),  
            type : "project", 
            name : todo.title,   
            description : todo.note, 
            layout,   
            priority : todo.priority, 
            created : todo.created, 
            deadline : todo.deadline,
            deleted : todo.deleted,
            completed : todo.completedWhen, 
            attachedTags : todo.attachedTags
        };

        dispatch({
            type:"multiple",
            load:[
                {type:"removeTodo", load:todo._id},
                {type:"addTodos", load:todos},
                {type:"addProject", load:converted}
            ]
        }); 
    };
 

    
    removeFromProject = () => {
        let {projects, dispatch, selectedProjectId, rightClickedTodoId} = this.props;
        let project : Project = projects.find((p:Project) => p._id===selectedProjectId);
        
        if(isNil(project)){ return }
        
        let layout : LayoutItem[] = [...project.layout]; 
        let idx : number = layout.findIndex((i:LayoutItem) => i===rightClickedTodoId);
 
        if(idx!==-1){
            dispatch({
                type:"updateProject", 
                load:{
                    ...project, 
                    layout:remove(idx,1,layout)
                }
            });
        }
    };


 
    onRemoveFromProjectArea = (e) => {
        let {selectedCategory, selectedProjectId, selectedAreaId} = this.props;

        let projectSelected : boolean = and(
            equals(selectedCategory,"project"),
            not(isNil(selectedProjectId))
        );
           
        if(projectSelected){
           this.removeFromProject();
        }
    };  



    onRepeatTodo = (e) => {
        let {rightClickMenuX,rightClickMenuY,dispatch} = this.props;   

        let repeatTodo : Todo = this.getRightClickedTodo();
        
        dispatch({
            type : "openRepeatPopup",
            load : {
                showRepeatPopup : true, 
                repeatTodo,
                repeatPopupX : rightClickMenuX, 
                repeatPopupY : rightClickMenuY,
                showRightClickMenu : false
            } 
        }); 
    };



    onWhen = (e) => {
        let {rightClickMenuX,rightClickMenuY,dispatch} = this.props;   
        let whenTodo : Todo = this.getRightClickedTodo();
        
        dispatch({
            type : "openWhenCalendar", 
            load : {
                showWhenCalendar : true, 
                whenTodo,
                whenCalendarPopupX : rightClickMenuX, 
                whenCalendarPopupY : rightClickMenuY,
                showRightClickMenu : false
            } 
        }); 
    };  


 
    render(){ 
        let todo : Todo = this.getRightClickedTodo();
        
        if(isNil(todo)){ return null }

        let {selectedCategory,selectedProjectId,selectedAreaId,showRightClickMenu} = this.props;

        let projectSelected : boolean = and( equals(selectedCategory,"project"), not(isNil(selectedProjectId)) );
        let areaSelected : boolean = and( equals(selectedCategory,"area"), not(isNil(selectedAreaId)) );    

        let canComplete = isNil(todo.deleted) && isNil(todo.completedSet);
        let canRepeat = isNil(todo.deleted) && isNil(todo.group);
        let canDuplicate = isNil(todo.deleted); 
        let canConvert = isNil(todo.deleted);
        let canDelete = isNil(todo.deleted); 
        let canRemoveFromProjectArea = isNil(todo.deleted) && (projectSelected || areaSelected);
        
        let canWhen = isNil(todo.deleted) && isNil(todo.completedSet); 
        
        let canMove = false;  
        let canShortcuts = false;  
        let canShare = false;  

        return  not(showRightClickMenu) ? null:
                <div  
                    ref={(e) => { this.ref=e; }}   
                    onClick = {(e) => {
                       e.stopPropagation();
                       e.preventDefault();
                    }} 
                    style={{  
                       paddingLeft: "20px",
                       paddingRight: "5px", 
                       paddingTop: "5px",
                       paddingBottom: "5px",
                       boxShadow: "0 0 18px rgba(0,0,0,0.2)", 
                       margin: "5px",
                       borderRadius: "5px",
                       zIndex: 30000, 
                       WebkitUserSelect:"none", 
                       width: "250px",      
                       position: "absolute",
                       backgroundColor: "rgba(238,237,239,1)", 
                       left: this.props.rightClickMenuX+"px",
                       top: this.props.rightClickMenuY+"px"  
                    }}         
                >       
                    <div      
                        onClick = {(e) =>  { 
                            e.stopPropagation();
                            e.preventDefault(); 
                        }}  
                        style={{display:"flex",flexDirection:"column"}}
                    > 
                        <RightClickMenuItem 
                            title={"Schedule task"} 
                            dispatch={this.props.dispatch}
                            onClick={this.onWhen}
                            disabled={!canWhen}
                            icon={null}
                        />
                        {
                        /*    
                        <RightClickMenuItem  
                            title={"Move..."}
                            dispatch={this.props.dispatch}
                            onClick={this.onMove}
                            disabled={!canMove}
                            icon={null}
                        />
                        */
                        }
                        <RightClickMenuItem 
                            title={"Complete"} 
                            dispatch={this.props.dispatch}
                            onClick={this.onComplete}
                            disabled={!canComplete}
                            icon={null}
                        />
                        {
                        /*
                        <RightClickMenuItem 
                            title={"Shortcuts"}
                            dispatch={this.props.dispatch}
                            onClick={this.onShortcuts}
                            disabled={!canShortcuts}
                            icon={null}
                        />
                        */
                        }
                        
                        <div style={{border:"1px solid rgba(200,200,200,0.5)", marginTop:"5px",marginBottom:"5px"}}></div>  

                        <RightClickMenuItem 
                            title={"Repeat task"} 
                            dispatch={this.props.dispatch}
                            onClick={this.onRepeatTodo}
                            disabled={!canRepeat}
                            icon={null} 
                        />
                        <RightClickMenuItem 
                            title={"Duplicate Task"}
                            dispatch={this.props.dispatch}
                            onClick={this.onDuplicate}
                            disabled={!canDuplicate}
                            icon={null}
                        />
                        <RightClickMenuItem 
                            title={"Convert to Project"}
                            dispatch={this.props.dispatch}
                            onClick={this.onConvertToProject}
                            disabled={!canConvert}
                            icon={null}
                        />
                        <RightClickMenuItem 
                            title={"Delete Task"}
                            dispatch={this.props.dispatch}
                            onClick={this.onDeleteToDo}
                            disabled={!canDelete}
                            icon={null}
                        />

                        <div style={{border:"1px solid rgba(200,200,200,0.5)", marginTop:"5px",marginBottom:"5px"}}></div>  

                        <RightClickMenuItem 
                            title={"Remove From Project/Area"}
                            dispatch={this.props.dispatch}
                            onClick={this.onRemoveFromProjectArea}
                            disabled={not(canRemoveFromProjectArea)}
                            icon={null} 
                        />
                        { 
                        /*       
                        <div style={{border:"1px solid rgba(200,200,200,0.5)", marginTop:"5px",marginBottom:"5px"}}></div>  

                        <RightClickMenuItem 
                            title={"Share"}
                            dispatch={this.props.dispatch}
                            onClick={this.onShare}
                            disabled={not(canShare)}
                            icon={null} 
                        />
                        */
                        }
                       </div> 
               </div>
           };
};

 

interface RightClickMenuItemProps{
    title:string, 
    onClick:(e) => void,
    dispatch:Function, 
    disabled:boolean,
    icon:JSX.Element 
} 

interface RightClickMenuItemState{}

export class RightClickMenuItem extends Component<RightClickMenuItemProps,RightClickMenuItemState>{

    constructor(props){
        super(props);
    }  

    render(){ 
         let {disabled} = this.props;   
         let disabledColor = "rgba(0,0,0,0.2)";
         
         return <div  
            onClick = {
                (e) => {
                    if(not(disabled)){
                       this.props.onClick(e);
                       this.props.dispatch({type:"showRightClickMenu",load:false});
                    } 
                }
            } 
            className="rightclickmenuitem"
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontFamily: "sans-serif",
                paddingLeft: "5px",
                paddingRight: "5px",
                fontSize: "14px",
                cursor: disabled ? "pointer" : "default",
                paddingTop: "2px",
                paddingBottom: "2px" 
            }}
        >  
            <div style={{color:not(disabled) ? "rgba(70,70,70,1)" : disabledColor}}>
                {this.props.title} 
            </div>
            <div style={{
                height:"14px",
                display:"flex", 
                alignItems:"center",   
                margin:"0px", 
                fontWeight:600 
            }}>
                {this.props.icon}
            </div>
        </div>  
    }
}