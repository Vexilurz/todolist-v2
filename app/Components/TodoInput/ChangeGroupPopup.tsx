import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { equals } from 'ramda';
import { ipcRenderer } from 'electron'; 
import { Component } from "react";   
import { connect } from "react-redux";
import { isToday, getMonthName, attachDispatchToProps } from '../../utils/utils'; 
import { Todo } from '../../database';
import { Store } from '../../app';
import { SimplePopup } from '../SimplePopup';

interface ChangeGroupPopupProps{
    dispatch?:Function,
    todo:Todo,
    openChangeGroupPopup:boolean
} // extends Store{} 
            
interface ChangeGroupPopupState{}
  
@connect(
    (store,props) : ChangeGroupPopupProps => ({
        openChangeGroupPopup:store.openChangeGroupPopup,
        todo:store.todos.find((todo) => todo._id===store.rightClickedTodoId),
    }), 
    attachDispatchToProps,
    null,
    {
        areStatesEqual: (nextStore:Store, prevStore:Store) => {
            let todoNext = nextStore.todos.find((todo) => todo._id===nextStore.rightClickedTodoId);
            let todoPrev = prevStore.todos.find((todo) => todo._id===prevStore.rightClickedTodoId);
            
            return  nextStore.openChangeGroupPopup===prevStore.openChangeGroupPopup &&
                    nextStore.rightClickedTodoId===prevStore.rightClickedTodoId &&
                    equals(todoNext,todoPrev);
        }
    }
) 
export class ChangeGroupPopup extends Component<ChangeGroupPopupProps,ChangeGroupPopupState>{
    ref:HTMLElement; 

    constructor(props){
        super(props); 
    }   
 
    onClose = () => {
        let { dispatch } = this.props;     
        dispatch({type:"openChangeGroupPopup", load:false}); 
    };  


    onCancel = (e) => {
        this.onClose();  
    };   
 

    onDeleteSingleItem = (e) => {
        let {todo,dispatch} = this.props; 
        dispatch({type:"updateTodo", load:{...todo,reminder:null,deleted:new Date()}});
        this.onClose(); 
    }; 


    onDeleteGroup = () => {
        let {todo,dispatch} = this.props; 
        dispatch({type:"removeGroup", load:todo.group._id});
        this.onClose();   
    };
 

    render(){ 
        let { openChangeGroupPopup } = this.props; 
       
        return <SimplePopup
          show={openChangeGroupPopup}
          onOutsideClick={this.onClose} 
        >   
            <div style={{
                backgroundColor:"rgba(0,0,0,0)",  
                zIndex:40000,  
                display:"flex",   
                alignItems:"center",  
                justifyContent:"center", 
                flexDirection:"column"   
            }}>  
                <div style={{   
                    borderRadius:"10px",
                    boxShadow:"0 0 18px rgba(0,0,0,0.5)", 
                    width:`${window.innerWidth/4}px`,   
                    minWidth:"180px",  
                    backgroundColor:"white" 
                }}> 
                    <div style={{display:"flex",alignItems:"center"}}>  
                        <div style={{  
                            display:"flex",
                            flexDirection:"column",
                            justifyContent:"flex-start",
                            padding:"10px",
                            cursor:"default",
                            userSelect:"none" 
                        }}>
                            <div style={{ 
                                paddingBottom:"10px", 
                                fontWeight:"bold", 
                                fontSize:"15px", 
                                color:"rgba(0,0,0,1)",
                                textAlign:"center"
                            }}>    
                                Delete recurring task
                            </div>
                            <div style={{fontSize:"14px",color:"rgba(0,0,0,1)",textAlign:"center"}}>
                                This task is part of a series of recurring tasks. 
                                Do you want to delete only this task or all recurring tasks of this series? 
                            </div>   
                        </div>
                    </div> 
                    <div style={{  
                        display:"flex",  
                        alignItems:"center", 
                        flexDirection:"column", 
                        justifyContent:"flex-end",
                        padding:"10px"
                    }}>
                        <div style={{padding: "2px"}}>
                            <div     
                                onClick={this.onDeleteSingleItem} 
                                style={{       
                                    width:"170px",
                                    display:"flex",
                                    alignItems:"center",
                                    cursor:"pointer",
                                    justifyContent:"center", 
                                    borderRadius:"5px",
                                    height:"25px",  
                                    border:"1px solid rgba(100,100,100,0.7)",
                                    backgroundColor:"rgb(10, 90, 250)"  
                                }}  
                            > 
                                <div style={{color:"white", fontSize:"14px"}}>      
                                    Delete single task 
                                </div>    
                            </div>
                        </div> 
                        <div style={{padding: "2px"}}>
                            <div    
                                onClick={this.onDeleteGroup} 
                                style={{       
                                    width:"170px",
                                    display:"flex",
                                    alignItems:"center",
                                    cursor:"pointer",
                                    justifyContent:"center",
                                    borderRadius:"5px",
                                    height:"25px",  
                                    border:"1px solid rgba(100,100,100,0.7)",
                                    backgroundColor:"rgb(10, 90, 250)"   
                                }}   
                            > 
                                <div style={{color:"white", fontSize:"14px"}}>      
                                    Delete all recurring tasks
                                </div>  
                            </div>
                        </div> 
                        <div style={{padding:"2px"}}>
                            <div     
                                onClick={this.onCancel} 
                                style={{      
                                    width:"170px", 
                                    display:"flex",
                                    alignItems:"center",
                                    cursor:"pointer",
                                    justifyContent:"center",
                                    borderRadius:"5px",
                                    height:"25px",  
                                    border:"1px solid rgba(100,100,100,0.5)",
                                    backgroundColor:"white" 
                                }}  
                            >   
                                <div style={{color:"rgba(0,0,0,0.9)", fontSize:"14px"}}>  
                                    Cancel
                                </div>    
                            </div>  
                        </div> 
                    </div> 
                </div>   
            </div>  
        </SimplePopup>    
    }
} 
 
   