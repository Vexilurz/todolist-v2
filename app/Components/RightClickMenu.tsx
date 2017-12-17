import '../assets/styles.css';  
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
import Button from 'material-ui-next/Button';
import { attachDispatchToProps, replace, remove, insert } from '../utils';
import { Todo, removeTodo, addTodo } from '../databaseCalls';
let uniqid = require("uniqid");   
 

 

 
interface RightClickMenuState{} 
 
@connect((store,props) => store, attachDispatchToProps) 
export class RightClickMenu extends Component<any,RightClickMenuState>{

   constructor(props){
       super(props);
   }
 

   updateTodo = (changedTodo:Todo) => {
       let idx = this.props.todos.findIndex((t:Todo) => changedTodo._id===t._id);
        
       if(idx!==-1)
           this.props.dispatch({
               type:"todos",
               load: replace(this.props.todos,changedTodo,idx)
           });
   }  
   
   
    
    removeTodoLocal = (_id:string) => {
        let idx = this.props.todos.findIndex((item:Todo) => item._id===_id);
 
        if(idx!==-1)
            this.props.dispatch({
                type:"todos",
                load: remove(this.props.todos,idx)
            }); 
    }  
   

   duplicateTodo = (_id:string) => {

        let idx = this.props.todos.findIndex((item:Todo) => item._id===_id);
        
        if(idx!==-1){

            let duplicatedTodo = this.props.todos[idx];

            if(duplicatedTodo===null || duplicatedTodo===undefined)
            return; 
            
            
            duplicatedTodo = {  ...duplicatedTodo, ...{_id:uniqid()}  };

            delete duplicatedTodo._rev;


            addTodo((e) => console.log(e), duplicatedTodo);
                
            this.props.dispatch({
                type:"todos",
                load:insert(this.props.todos, duplicatedTodo, idx)
            });
 
        }
             
   }  

    onDuplicate = (e) => {
       this.duplicateTodo(this.props.rightClickedTodoId); 
    } 

    onDeleteToDo = (e) => {
        this.removeTodoLocal(this.props.rightClickedTodoId);
        removeTodo(this.props.rightClickedTodoId);
    } 


   onWhen = (e) => {
   } 

   onMove = (e) => {
   }

   onComplete = (e) => {}

   onShortcuts = (e) => {}

   onRepeat = (e) => {
   }

  

   onConvertToProject = (e) => {
   }

 
   
  

   onRemoveFromProject = (e) => {
   }

   onShare = (e) => {
   }


   render(){
       return  !this.props.showRightClickMenu  ? null:
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
                       height: "240px", 
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
                       }}> 
                            <div 
                            
                            onClick = {this.onWhen}
                            
                            className="rightclickmenuitem"
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontFamily: "sans-serif",
                                paddingLeft: "5px",
                                paddingRight: "5px",
                                fontSize: "14px",
                                cursor: "pointer",
                                paddingTop: "2px",
                                paddingBottom: "2px" 
                            }}>
                               <div>
                                   When...
                               </div>
                               <p style={{    
                                   margin: "0px",
                                   fontWeight: 600,
                                   color: "rgba(70,70,70,1)"
                               }}> 
                                   &#8984; S
                               </p>
                           </div>   

                           <div 
                           
                           onClick = {this.onMove}

                           className="rightclickmenuitem"
                           style={{
                               display: "flex",
                               justifyContent: "space-between",
                               alignItems: "center",
                               fontFamily: "sans-serif",
                               paddingLeft: "5px",
                               paddingRight: "5px",
                               fontSize: "14px",
                               cursor: "pointer",
                               paddingTop: "2px",
                               paddingBottom: "2px" 
                           }}>
                               <div>
                                   Move...
                               </div>
                               <p style={{    
                                   margin: "0px",
                                   fontWeight: 600,
                                   color: "rgba(70,70,70,1)"
                               }}>
                               &#8679;&#8984; M
                               </p>   
                           </div>

                           <div 
                           
                           onClick = {this.onComplete}

                           className="rightclickmenuitem"
                           style={{
                               display: "flex",
                               justifyContent: "space-between",
                               alignItems: "center",
                               fontFamily: "sans-serif",
                               paddingLeft: "5px",
                               paddingRight: "5px",
                               fontSize: "14px",
                               cursor: "pointer",
                               paddingTop: "2px",
                               paddingBottom: "2px" 
                           }}>
                               <div>
                                   Complete
                               </div>
                               <div style={{
                                   height: "14px",
                                   display: "flex",
                                   alignItems: "center" 
                               }}>
                                   <ArrowDropRight style={{
                                       padding: 0,
                                       margin: 0,
                                       color: "rgba(0, 0, 0, 0.6)"
                                   }}/>
                               </div>
                           </div>

                           <div 
                           
                           onClick = {this.onShortcuts}

                           className="rightclickmenuitem"
                           style={{
                               display: "flex",
                               justifyContent: "space-between",
                               alignItems: "center",
                               fontFamily: "sans-serif",
                               paddingLeft: "5px",
                               paddingRight: "5px",
                               fontSize: "14px",
                               cursor: "pointer",
                               paddingTop: "2px",
                               paddingBottom: "2px" 
                           }}>
                               <div>
                                   Shortcuts
                               </div>
                               <div style={{
                                   height: "14px",
                                   display: "flex",
                                   alignItems: "center" 
                               }}>
                                   <ArrowDropRight style={{
                                       padding: 0,
                                       margin: 0, 
                                       color: "rgba(0, 0, 0, 0.6)"
                                   }}/>
                               </div>
                           </div> 
                           
                           <div style={{
                                border:"1px solid rgba(200,200,200,0.5)",
                                marginTop: "5px",
                                marginBottom: "5px"
                           }}>
                           </div>

                           <div 
                           onClick = {this.onRepeat}
                           className="rightclickmenuitem"
                           style={{
                               display: "flex",
                               justifyContent: "space-between",
                               alignItems: "center",
                               fontFamily: "sans-serif",
                               paddingLeft: "5px",
                               paddingRight: "5px",
                               fontSize: "14px",
                               cursor: "pointer",
                               paddingTop: "2px",
                               paddingBottom: "2px" 
                           }}>
                               <div>
                                   Repeat...
                               </div>
                               <p style={{    
                                   margin: "0px",
                                   fontWeight: 600,
                                   color: "rgba(70,70,70,1)"
                               }}>&#8679;&#8984;R</p>
                           </div>

                           <div  
                           onClick = {this.onDuplicate}
                           className="rightclickmenuitem"
                           style={{
                               display: "flex",
                               justifyContent: "space-between",
                               alignItems: "center",
                               fontFamily: "sans-serif",
                               paddingLeft: "5px",
                               paddingRight: "5px",
                               fontSize: "14px",
                               cursor: "pointer",
                               paddingTop: "2px",
                               paddingBottom: "2px" 
                           }}>
                               <div>
                                   Duplicate To-Do
                               </div>
                               <p style={{    
                                   margin: "0px",
                                   fontWeight: 600,
                                   color: "rgba(70,70,70,1)"
                               }}>&#8984;D</p>
                           </div>
                           
                           <div 
                           onClick = {this.onConvertToProject}
                           className="rightclickmenuitem"
                           style={{
                               display: "flex",
                               justifyContent: "space-between",
                               alignItems: "center",
                               fontFamily: "sans-serif",
                               paddingLeft: "5px",
                               paddingRight: "5px",
                               fontSize: "14px",
                               cursor: "pointer",
                               paddingTop: "2px",
                               paddingBottom: "2px" 
                           }}>
                               <div>
                                   Convert to Project
                               </div>
                           </div>

                           <div 
                           onClick = {this.onDeleteToDo}
                           className="rightclickmenuitem"
                           style={{
                               display: "flex",
                               justifyContent: "space-between",
                               alignItems: "center",
                               fontFamily: "sans-serif",
                               paddingLeft: "5px",
                               paddingRight: "5px",
                               fontSize: "14px",
                               cursor: "pointer",
                               paddingTop: "2px",
                               paddingBottom: "2px" 
                           }}> 
                               <div>
                                   Delete To-Do
                               </div>
                               <ClearArrow  style={{
                                   padding: 0,
                                   margin: 0,
                                   color: "rgba(0, 0, 0, 0.6)",
                                   height: "14px"
                               }}/>
                           </div>
                           
                           <div style={{
                                border:"1px solid rgba(200,200,200,0.5)",
                                marginTop: "5px",
                                marginBottom: "5px"
                           }}>
                           </div>

                           <div 
                           onClick = {this.onRemoveFromProject}
                           className="rightclickmenuitem"
                           style={{
                               display: "flex",
                               justifyContent: "space-between",
                               alignItems: "center",
                               fontFamily: "sans-serif",
                               paddingLeft: "5px",
                               paddingRight: "5px",
                               fontSize: "14px",
                               cursor: "pointer",
                               paddingTop: "2px",
                               paddingBottom: "2px"  
                           }}>
                               <div>Remove From Project/Area</div>
                           </div>

                           <div style={{
                               border:"1px solid rgba(200,200,200,0.5)",
                               marginTop: "5px",
                               marginBottom: "5px"
                           }}>
                           </div>

                           <div   
                           onClick = {this.onShare}
                           className="rightclickmenuitem"
                           style={{
                               display: "flex",
                               justifyContent: "space-between",
                               alignItems: "center",
                               fontFamily: "sans-serif",
                               paddingLeft: "5px",
                               paddingRight: "5px",
                               fontSize: "14px",
                               cursor: "pointer",
                               paddingTop: "2px",
                               paddingBottom: "2px" 
                           }}> 
                               <div>Share</div>
                           </div>

                       </div> 
               </div>
           };
}
