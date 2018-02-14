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
import { Todo, removeTodo, addTodo, Project, Area, LayoutItem } from '../database';
import { Store } from '../app';
import { ChecklistItem } from './TodoInput/TodoChecklist';
import { Category } from './MainContainer';
import { remove, isNil, not } from 'ramda';
let uniqid = require("uniqid");    
import { isDev } from '../utils/isDev'; 
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { attachDispatchToProps } from '../utils/utils';
import { insideTargetArea } from '../utils/insideTargetArea';
import { generateId } from '../utils/generateId';
import { assert } from '../utils/assert';
 
   


 
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
        let click = Observable 
                    .fromEvent(window, "click")
                    .subscribe(this.onOutsideClick);
        this.subscriptions.push(click); 
    }   


    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = [];
    } 


    onOutsideClick = (e) => {

        if(this.ref===null || this.ref===undefined){ return }

        let x = e.pageX;
        let y = e.pageY; 

        let inside = insideTargetArea(null,this.ref,x,y);
    
        if(!inside){
           this.props.dispatch({
                type: "openRightClickMenu",
                load: {
                    showRightClickMenu: false,
                    rightClickedTodoId: null,
                    rightClickMenuX: 0,
                    rightClickMenuY: 0
                }
           }); 
        }   
    }   
               


    onDeleteToDo = (e) => {
        let { todos, dispatch, rightClickedTodoId } = this.props; 
           
        let todo : Todo = todos.find( (t:Todo) => t._id===rightClickedTodoId );
         
        if(!isNil(todo.group)){  
           dispatch({type:"openChangeGroupPopup", load:true});         
        }else{ 
           dispatch({type:"updateTodo", load:{...todo,deleted:new Date()}});
        } 
    }  

 

    onDuplicate = (e) => {
        let todo : Todo = this.props.todos.find( (t:Todo) => t._id===this.props.rightClickedTodoId );
        
        let duplicate : Todo = {...todo};
        duplicate._id = generateId();
        delete duplicate['_rev']; 
 
        this.props.dispatch({type:"addTodo", load:duplicate}); 
    } 



    onComplete = (e) => {
        let todo = this.props.todos.find( (t:Todo) => t._id===this.props.rightClickedTodoId ); 

        if(!todo){  
            if(isDev()){ 
                throw new Error(`
                    todo undefined. 
                    ${JSON.stringify(todo)} 
                    ${this.props.rightClickedTodoId}. 
                    onComplete.
                `);  
            }
        } 
         
        this.props.dispatch({ 
            type:"updateTodo", 
            load:{ ...todo, ...{completed:new Date()}, checked:true } 
        });
    }
    
    

    onConvertToProject = (e) => { 
        let todo : Todo = this.props.todos.find( (t:Todo) => t._id===this.props.rightClickedTodoId); 

        assert(!isNil(todo),`todo undefined. ${todo} ${this.props.rightClickedTodoId}. onConvertToProject.`);
      
        let todos = todo.checklist.map( 
            (c : ChecklistItem) : Todo => ({ 
                    _id : uniqid(),  
                    category : "next", 
                    type : "todo",
                    title : c.text,  
                    priority : Math.random(),
                    note : '',  
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
        

        this.props.dispatch({type:"removeTodo", load:todo._id});
        this.props.dispatch({type:"addTodos", load:todos});
        this.props.dispatch({type:"addProject", load:converted});
    }
 
      

    removeFromProject = () => {

        let project : Project = this.props.projects.find((p:Project) => p._id===this.props.selectedProjectId);
        
        if(!project){ 
            if(isDev()){ 
                throw new Error(`
                    project undefined. 
                    ${JSON.stringify(project)} 
                    ${this.props.selectedProjectId}. 
                    removeFromProject.
                `);
            }
        } 

        if(project.type!=="project"){
            if(isDev()){ 
                throw new Error(`
                    project is not of type Project. 
                    ${JSON.stringify(project)} 
                    ${this.props.selectedProjectId}. 
                    removeFromProject .
                `); 
            }
        }  

        let layout : LayoutItem[] = [...project.layout]; 
        let idx : number = layout.findIndex((i:LayoutItem) => i===this.props.rightClickedTodoId);
             
        if(idx===-1){
            if(isDev()){ 
                throw new Error(  
                    `rightClickedTodo is not attached to project. 
                    ${JSON.stringify(project)}. 
                    ${this.props.rightClickedTodoId}. 
                    removeFromProject.`
                ) 
            }
        }  
 
        this.props.dispatch({type:"updateProject", load:{...project, layout:remove(idx,1,layout)}});

    }



    removeFromArea = () => {

        let area : Area = this.props.areas.find((a:Area) => a._id===this.props.selectedAreaId);
        
        if(!area){ 
            if(isDev()){ 
                throw new Error(`
                    area undefined. 
                    ${JSON.stringify(area)} 
                    ${this.props.selectedAreaId}. 
                    removeFromArea.
                `);
            }
        }  
 
        if(area.type!=="area"){
            if(isDev()){ 
                throw new Error(`
                    area is not of type Area. 
                    ${JSON.stringify(area)} 
                    ${this.props.selectedAreaId}. 
                    removeFromArea. 
                `); 
            }  
        } 
 
        let idx : number = area.attachedTodosIds.indexOf(this.props.rightClickedTodoId);

        if(idx===-1){ 
            if(isDev()){ 
                throw new Error(  
                    `rightClickedTodo is not attached to area. 
                    ${JSON.stringify(area)}. 
                    ${this.props.rightClickedTodoId}.
                    removeFromArea.` 
                )
            }
        }   

        this.props.dispatch({
            type:"updateArea", 
            load:{
                ...area,
                attachedTodosIds:remove(idx,1,area.attachedTodosIds)
            }
        });
 
    }
 


    onRemoveFromProjectArea = (e) => {

        let projectSelected : boolean = this.props.selectedCategory==="project" && 
                                        !!this.props.selectedProjectId;

        let areaSelected : boolean = this.props.selectedCategory==="area" && 
                                     !!this.props.selectedAreaId;
                            
        if(projectSelected){
           this.removeFromProject();
        }else if(areaSelected){
           this.removeFromArea();
        }   
    }  


    onWhen = (e) => {} 
    onMove = (e) => {}
    onShortcuts = (e) => {}
      
 
    onRepeatTodo = (e) => {
        let {
            rightClickedTodoId,
            rightClickMenuX,
            rightClickMenuY,
            todos 
        } = this.props;   

        let repeatTodo : Todo = todos.find( t => t._id===rightClickedTodoId );
        
        this.props.dispatch({
            type : "openRepeatPopup",
            load : {
                showRepeatPopup : true, 
                repeatTodo,
                repeatPopupX : rightClickMenuX, 
                repeatPopupY : rightClickMenuY,
                showRightClickMenu : false
            } 
        }); 
    }


    onShare = (e) => {}

 
    render(){ 
        let todo = this.props.todos.find( (t:Todo) => t._id===this.props.rightClickedTodoId );
        
        if(isNil(todo)){ return null }

        let projectSelected = this.props.selectedCategory==="project" && !!this.props.selectedProjectId;
        let areaSelected = this.props.selectedCategory==="area" && !!this.props.selectedAreaId;                          
        let canWhen = false; 
        let canMove = false;    
        let canComplete = isNil(todo.deleted) && isNil(todo.completedWhen);
        let canShortcuts = false;   
        let canRepeat = isNil(todo.deleted) && isNil(todo.group);
        let canDuplicate = isNil(todo.deleted); 
        let canConvert = isNil(todo.deleted);
        let canDelete = isNil(todo.deleted); 
        let canRemoveFromProjectArea = isNil(todo.deleted) && (projectSelected || areaSelected);
        let canShare = false; 
        
        return  !this.props.showRightClickMenu ? null:
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
                        style={{
                            display: "flex",
                            flexDirection: "column"
                        }}
                    > 

                        <RightClickMenuItem 
                            title={"When..."} 
                            dispatch={this.props.dispatch}
                            onClick={this.onWhen}
                            disabled={!canWhen}
                            icon={null}
                        />

                        <RightClickMenuItem  
                            title={"Move..."}
                            dispatch={this.props.dispatch}
                            onClick = {this.onMove}
                            disabled = {!canMove}
                            icon = {null}
                        />

                        <RightClickMenuItem 
                            title={"Complete"} 
                            dispatch={this.props.dispatch}
                            onClick = {this.onComplete}
                            disabled = {!canComplete}
                            icon = {null}
                        />

                        <RightClickMenuItem 
                            title = {"Shortcuts"}
                            dispatch={this.props.dispatch}
                            onClick = {this.onShortcuts}
                            disabled = {!canShortcuts}
                            icon={null}
                        />
 
                        <div style={{
                            border:"1px solid rgba(200,200,200,0.5)",
                            marginTop: "5px",
                            marginBottom: "5px"
                        }}>
                        </div>
                           
                        <RightClickMenuItem 
                            title={"Repeat..."} 
                            dispatch={this.props.dispatch}
                            onClick = {this.onRepeatTodo}
                            disabled={!canRepeat}
                            icon={null} 
                        />
                                 

                        <RightClickMenuItem 
                            title={"Duplicate To-Do"}
                            dispatch={this.props.dispatch}
                            onClick = {this.onDuplicate}
                            disabled = {!canDuplicate}
                            icon={null}
                        />
           

                        <RightClickMenuItem 
                            title={"Convert to Project"}
                            dispatch={this.props.dispatch}
                            onClick = {this.onConvertToProject}
                            disabled = {!canConvert}
                            icon={null}
                        />


                        <RightClickMenuItem 
                            title={"Delete To-Do"}
                            dispatch={this.props.dispatch}
                            onClick = {this.onDeleteToDo}
                            disabled = {!canDelete}
                            icon={null}
                        />

                        <div style={{
                            border:"1px solid rgba(200,200,200,0.5)",
                            marginTop: "5px",
                            marginBottom: "5px"
                        }}>
                        </div>  

                        <RightClickMenuItem 
                            title={"Remove From Project/Area"}
                            dispatch={this.props.dispatch}
                            onClick = {this.onRemoveFromProjectArea}
                            disabled = {!canRemoveFromProjectArea}
                            icon={null} 
                        />

                        <div style={{
                            border:"1px solid rgba(200,200,200,0.5)",
                            marginTop: "5px",
                            marginBottom: "5px"
                        }}>
                        </div>

                        <RightClickMenuItem 
                            title={"Share"}
                            dispatch={this.props.dispatch}
                            onClick = {this.onShare}
                            disabled = {!canShare}
                            icon={null} 
                        />
                       </div> 
               </div>
           };
}
 




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

         let disabledColor = "rgba(0,0,0,0.2)";
         
         return <div  
                    onClick = {
                        (e) => {
                            if(!this.props.disabled){
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
                        cursor: this.props.disabled ? "pointer" : "default",
                        paddingTop: "2px",
                        paddingBottom: "2px" 
                    }}
                >  
                    <div style={{color: !this.props.disabled ? "rgba(70,70,70,1)" : disabledColor}}>
                        {this.props.title} 
                    </div>
                    <div style={{
                        height: "14px",
                        display: "flex", 
                        alignItems: "center",   
                        margin: "0px", 
                        fontWeight: 600 
                    }}>
                        {this.props.icon}
                    </div>
                </div> 
    }

}