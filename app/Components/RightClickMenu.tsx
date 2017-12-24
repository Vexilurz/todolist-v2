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
import { attachDispatchToProps, replace, remove, insert } from '../utils';
import { Todo, removeTodo, addTodo, generateId, Project, Area } from '../database';
import { Store } from '../App';
import { ChecklistItem } from './TodoInput/TodoChecklist';
import { Category } from './MainContainer';
let uniqid = require("uniqid");   
 

 

 
interface RightClickMenuState{}  
 
@connect((store,props) => store, attachDispatchToProps) 
export class RightClickMenu extends Component<Store,RightClickMenuState>{

    constructor(props){
       super(props);
    }
 

    onDuplicate = (e) => {

       this.props.dispatch({ type:"duplicateTodo", load: this.props.rightClickedTodoId }); 
 
    } 
 

    onDeleteToDo = (e) => {

        let todo = this.props.todos.find( (t:Todo) => t._id===this.props.rightClickedTodoId );

        if(!todo)
           return;  

        this.props.dispatch({ type:"updateTodo", load:{...todo, deleted:new Date()} }); 

    }  

 
    onComplete = (e) => {
        
        let todo = this.props.todos.find( (t:Todo) => t._id===this.props.rightClickedTodoId ); 

        if(!todo) 
           return;  
         
        this.props.dispatch({ type:"updateTodo", load:{ ...todo, ...{completed:new Date()}, checked:true } });
     
    } 


    onConvertToProject = (e) => { 

        let todo : Todo = this.props.todos.find( (t:Todo) => t._id===this.props.rightClickedTodoId); 
        let todos = todo.checklist.map( 
            (c : ChecklistItem) : Todo =>  ({ 
                    _id : uniqid(), 
                    category : "anytime" as Category, 
                    type : "todo",
                    title : c.text,  
                    priority : Math.random(),
                    note : '',  
                    checklist : [],
                    reminder : null,  
                    attachedTags : [], 
                    status : '',
                    deadline : null,
                    created : new Date(),
                    deleted : null,
                    attachedDate : null, 
                    completed : c.checked ? new Date() : null, 
                    history : [],
                    attachments : [], 
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
            attachedTodosIds : [],  
            attachedTags : todo.attachedTags
        };
        
        this.props.dispatch({ type:"removeTodo", load:todo._id });
        this.props.dispatch({ type:"addTodos", load:todos });
        this.props.dispatch({ type:"newProject", load:converted });

    }
 
      

    onRemoveFromProjectArea = (e) => {
        let projectSelected : boolean = this.props.selectedCategory==="project" && 
                                        !!this.props.selectedProjectId;

        let areaSelected : boolean = this.props.selectedCategory==="area" && 
                                     !!this.props.selectedAreaId;
                           
                           
        if(projectSelected){
              
            let project = this.props.projects.find((p:Project) => p._id===this.props.selectedProjectId);

            if(!project)
               return; 

            let attachedTodosIds = [...project.attachedTodosIds]; 
            let idx = attachedTodosIds.indexOf(this.props.rightClickedTodoId);

            if(idx===-1)
               return;

            attachedTodosIds = remove(attachedTodosIds,idx); 
            
            let layoutIdx = project.layout.findIndex( i => i===this.props.selectedProjectId );
            let layout = remove(project.layout,layoutIdx);
 
            this.props.dispatch({type:"updateProject", load:{...project, attachedTodosIds, layout}});

        }else if(areaSelected){

            let area = this.props.areas.find((a:Area) => a._id===this.props.selectedAreaId);

            if(!area)
               return;

            let ids = area.attachedTodosIds;
            let idx = ids.indexOf(this.props.rightClickedTodoId);

            if(idx===-1)
               return;
 
            this.props.dispatch({type:"updateArea", load:{...area, attachedTodosIds:remove(ids,idx)}});

        }  
    }

    onWhen = (e) => {} 

    onMove = (e) => {}

    onShortcuts = (e) => {}

    onRepeat = (e) => {}

    onShare = (e) => {}

 

    render(){

        let todo = this.props.todos.find( (t:Todo) => t._id===this.props.rightClickedTodoId);

        if(!todo)
           return null; 

        let projectSelected = this.props.selectedCategory==="project" && 
                              !!this.props.selectedProjectId;
 
        let areaSelected = this.props.selectedCategory==="area" && 
                           !!this.props.selectedAreaId;                       
             

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
                            icon={null
                            //<p style={{ margin: "0px", fontWeight: 600 }}> &#8984; S </p>
                            }
                        />

                        <RightClickMenuItem 
                            title={"Move..."}
                            onClick = {this.onMove}
                            disabled = {!canMove}
                            icon = {null 
                            //<p style={{ margin: "0px", fontWeight: 600 }}> &#8679;&#8984; M </p> 
                            }
                        />

                        <RightClickMenuItem 
                            title={"Complete"} 
                            onClick = {this.onComplete}
                            disabled = {!canComplete}
                            icon = {null
                            //<ArrowDropRight style={{padding: 0, margin: 0}}/>
                            }
                        />

                        <RightClickMenuItem 
                            title = {"Shortcuts"}
                            onClick = {this.onShortcuts}
                            disabled = {!canShortcuts}
                            icon={null
                            //<ArrowDropRight style={{padding: 0, margin: 0}}/>
                            }
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
                            icon={null
                            //<p style={{margin: "0px", fontWeight: 600}}>&#8679;&#8984;R </p>
                            } 
                        />
                                

                        <RightClickMenuItem 
                            title={"Duplicate To-Do"}
                            onClick = {this.onDuplicate}
                            disabled = {!canDuplicate}
                            icon={null
                            //<p style={{margin: "0px", fontWeight: 600,}}>&#8984;D</p>
                            }
                        />
           

                        <RightClickMenuItem 
                            title={"Convert to Project"}
                            onClick = {this.onConvertToProject}
                            disabled = {!canConvert}
                            icon={null
                            //<p style={{margin: "0px", fontWeight: 600,}}>&#8984;D</p>
                            }
                        />


                        <RightClickMenuItem 
                            title={"Delete To-Do"}
                            onClick = {this.onDeleteToDo}
                            disabled = {!canDelete}
                            icon={null
                            //<ClearArrow  style={{padding:0, margin:0, height:"14px"}}/>
                            }
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