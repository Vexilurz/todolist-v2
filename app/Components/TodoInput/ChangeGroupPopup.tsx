import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron'; 
import { Component } from "react";   
import { connect } from "react-redux";
import { isToday, getMonthName, attachDispatchToProps } from '../../utils/utils'; 
import { Todo } from '../../database';
import { Store } from '../../app';
import { SimplePopup } from '../SimplePopup';

interface ChangeGroupPopupProps extends Store{} 
            
interface ChangeGroupPopupState{}
  
@connect((store,props) => ({...store, ...props}), attachDispatchToProps) 
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
        let {rightClickedTodoId, dispatch, todos} = this.props; 
        let todo : Todo = todos.find( (todo) => todo._id===rightClickedTodoId );
        dispatch({type:"updateTodo", load:{...todo,reminder:null,deleted:new Date()}});
        this.onClose(); 
    }; 


    onDeleteGroup = () => {
        let {rightClickedTodoId, dispatch, todos} = this.props; 
        let todo : Todo = todos.find( (todo) => todo._id===rightClickedTodoId );
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
                    <div style={{display:"flex", alignItems:"center"}}>  
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
                                Delete Todo
                            </div>
                            <div style={{
                                fontSize:"14px", 
                                color:"rgba(0,0,0,1)",
                                textAlign:"center" 
                            }}>
                                This todo is part of a group, 
                                do you want to remove only this Todo or a group ? 
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
                                    width:"150px",
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
                                <div style={{color:"white", fontSize:"16px"}}>      
                                    Delete single item 
                                </div>    
                            </div>
                        </div> 
                        <div style={{padding: "2px"}}>
                            <div    
                                onClick={this.onDeleteGroup} 
                                style={{       
                                    width:"150px",
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
                                <div style={{color:"white", fontSize:"16px"}}>      
                                    Delete group
                                </div>  
                            </div>
                        </div> 
                        <div style={{padding:"2px"}}>
                            <div     
                                onClick={this.onCancel} 
                                style={{      
                                    width:"150px", 
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
                                <div style={{color:"rgba(0,0,0,0.9)", fontSize:"16px"}}>  
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
 
   