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
import NewAreaIcon from 'material-ui/svg-icons/action/tab';
import Popover from 'material-ui/Popover';
import { attachDispatchToProps } from '../utils';
import { Todo, removeTodo, addTodo, generateId, Project, Area, LayoutItem } from '../database';
import { Store } from '../App';
import { ChecklistItem } from './TodoInput/TodoChecklist';
import { Category } from './MainContainer';
import { remove } from 'ramda';
let uniqid = require("uniqid");   
 
 
  

 
interface RightClickMenuState{}  
 
@connect((store,props) => store, attachDispatchToProps) 
export class RightClickMenu extends Component<Store,RightClickMenuState>{

    constructor(props){
       super(props);
    }
 


    onDeleteToDo = (e) => {
        this.props.rightClickedTodoId
    }  

 

    onDuplicate = (e) => {
        let todo : Todo = this.props.todos.find( (t:Todo) => t._id===this.props.rightClickedTodoId );
        let id : string = this.props.rightClickedTodoId;
        
        let duplicate : Todo = {...todo};
        duplicate._id = generateId();
        delete duplicate['_rev']; 
 
        this.props.dispatch({type:"addTodo", load:duplicate); 

    } 



    onComplete = (e) => {
        let todo = this.props.todos.find( (t:Todo) => t._id===this.props.rightClickedTodoId ); 

        if(!todo) 
           throw new Error(`todo undefined. ${todo} ${this.props.rightClickedTodoId}. onComplete.`);  
         
        this.props.dispatch({ type:"updateTodo", load:{ ...todo, ...{completed:new Date()}, checked:true } });
    }
    
    

    onConvertToProject = (e) => { 
        let todo : Todo = this.props.todos.find( (t:Todo) => t._id===this.props.rightClickedTodoId); 

        if(!todo) 
           throw new Error(`todo undefined. ${todo} ${this.props.rightClickedTodoId}. onConvertToProject.`);  
      
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
                    completed : c.checked ? new Date() : null, 
                    checked:c.checked
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
            completed : todo.completed, 
            attachedTags : todo.attachedTags
        };
        

        this.props.dispatch({ type:"removeTodo", load:todo._id });
        this.props.dispatch({ type:"addTodos", load:todos });
        this.props.dispatch({ type:"addProject", load:converted });
    }
 
      

    removeFromProject = () => {

        let project : Project = this.props.projects.find((p:Project) => p._id===this.props.selectedProjectId);
        
        if(!project){ 
            throw new Error(`
              project undefined. ${project} ${this.props.selectedProjectId}. 
              removeFromProject .
            `);
        } 

        if(project.type!=="project"){
           throw new Error(`
              project is not of type Project. ${project} ${this.props.selectedProjectId}. 
              removeFromProject .
           `);
        } 

        let layout : LayoutItem[] = [...project.layout]; 
        let idx : number = layout.findIndex((i:LayoutItem) => i===this.props.rightClickedTodoId);
             
        if(idx===-1){
           throw new Error(  
              `rightClickedTodo is not attached to project. 
              ${JSON.stringify(project)}. 
              ${this.props.rightClickedTodoId}. 
               removeFromProject.`
           ) 
        }  
 
        this.props.dispatch({type:"updateProject", load:{...project, layout:remove(idx,1,layout)}});

    }



    removeFromArea = () => {

        let area : Area = this.props.areas.find((a:Area) => a._id===this.props.selectedAreaId);
        
        if(!area){ 
            throw new Error(`
              area undefined. ${area} ${this.props.selectedAreaId}. 
              removeFromArea.
            `);
        }  
 
        if(area.type!=="area"){
           throw new Error(`
              area is not of type Area. ${area} ${this.props.selectedAreaId}. 
              removeFromArea. 
           `);  
        } 

        let idx : number = area.attachedTodosIds.indexOf(this.props.rightClickedTodoId);

        if(idx===-1){
            throw new Error(  
               `rightClickedTodo is not attached to area. 
               ${JSON.stringify(area)}. 
               ${this.props.rightClickedTodoId}.
               removeFromArea.` 
            )
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



    onRepeat = (e) => {}



    onShare = (e) => {}

 

    render(){

        let todo = this.props.todos.find( (t:Todo) => t._id===this.props.rightClickedTodoId );
        
        if(!todo)  
           return null; 

        let projectSelected = this.props.selectedCategory==="project" && !!this.props.selectedProjectId;
 
        let areaSelected = this.props.selectedCategory==="area" && !!this.props.selectedAreaId;                       
             
        let canWhen = false; 
        let canMove = false; 
        let canComplete = !todo.deleted;
        let canShortcuts = false; 
        let canRepeat = false;
        let canDuplicate = !todo.deleted;
        let canConvert = !todo.deleted;
        let canDelete = !todo.deleted; 
        let canRemoveFromProjectArea = !todo.deleted && (projectSelected || areaSelected);
        let canShare = false; 

 
        return  !this.props.showRightClickMenu ? null:
                <div onClick = {(e) => {
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
                       width: "250px",  
                       position: "absolute",
                       backgroundColor: "rgba(238,237,239,1)",
                       left: this.props.rightClickMenuX+"px",
                       top: this.props.rightClickMenuY+"px"  
                    }}         
                >       
                    <div    
                        onClick = {(e) => {
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
                            onClick={this.onWhen}
                            disabled={!canWhen}
                            icon={null}
                        />

                        <RightClickMenuItem 
                            title={"Move..."}
                            onClick = {this.onMove}
                            disabled = {!canMove}
                            icon = {null}
                        />

                        <RightClickMenuItem 
                            title={"Complete"} 
                            onClick = {this.onComplete}
                            disabled = {!canComplete}
                            icon = {null}
                        />

                        <RightClickMenuItem 
                            title = {"Shortcuts"}
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
                            onClick = {this.onRepeat}
                            disabled={!canRepeat}
                            icon={null} 
                        />
                                

                        <RightClickMenuItem 
                            title={"Duplicate To-Do"}
                            onClick = {this.onDuplicate}
                            disabled = {!canDuplicate}
                            icon={null}
                        />
           

                        <RightClickMenuItem 
                            title={"Convert to Project"}
                            onClick = {this.onConvertToProject}
                            disabled = {!canConvert}
                            icon={null}
                        />


                        <RightClickMenuItem 
                            title={"Delete To-Do"}
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
                    onClick = {(e) => !this.props.disabled ? this.props.onClick(e) : null}
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