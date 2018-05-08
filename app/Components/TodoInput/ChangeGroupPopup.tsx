import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { equals } from 'ramda';
import { ipcRenderer } from 'electron'; 
import { Component } from "react";   
import { getMonthName, attachDispatchToProps } from '../../utils/utils'; 
import { Todo, Store } from '../../types';
import { SimplePopup } from '../SimplePopup';
import { OptionsPopup } from '../OptionsPopup';


interface ChangeGroupPopupProps{
    dispatch:Function,
    todos:Todo[],
    rightClickedTodoId:string
} 



interface ChangeGroupPopupState{}



export class ChangeGroupPopup extends Component<ChangeGroupPopupProps,ChangeGroupPopupState>{
    ref:HTMLElement; 

    constructor(props){
        super(props); 
    }   
 
    

    onClose = () => {
        let { dispatch } = this.props;     
        dispatch({type:"openChangeGroupPopup", load:false}); 
    };  



    getRightClickedTodo = () : Todo => {
        let { todos, dispatch, rightClickedTodoId } = this.props; 
        let todo : Todo = todos.find( (t:Todo) => t._id===rightClickedTodoId );
        return todo;
    };



    onCancel = (e) => {
        this.onClose();  
    };   
 


    onDeleteSingleItem = (e) => {
        let {dispatch} = this.props; 
        let todo = this.getRightClickedTodo();
        dispatch({type:"updateTodo", load:{...todo,reminder:null,deleted:new Date()}});
        this.onClose(); 
    }; 



    onDeleteFutureItems = (e) => {
        let {dispatch} = this.props; 
        let todo = this.getRightClickedTodo(); 
        dispatch({type:"removeGroupAfterDate", load:todo});
        this.onClose(); 
    };  

 

    onDeleteGroup = () => {
        let {dispatch} = this.props; 
        let todo = this.getRightClickedTodo();
        dispatch({type:"removeGroup", load:todo.group._id});
        this.onClose();   
    };
 


    render(){ 
       
        return <OptionsPopup
            title={'Delete recurring task'}
            message={
               `This task is part of a series of recurring tasks. 
                Do you want to delete only this task or all recurring tasks of this series?`
            }
            options={[
                {
                    title:'Delete single task', 
                    f:this.onDeleteSingleItem 
                },                  
                {       
                    title:'Delete all future tasks',             
                    f:this.onDeleteFutureItems   
                },
                {       
                    title:'Delete all recurring tasks',             
                    f:this.onDeleteGroup 
                }
            ]}
            onCancel={this.onCancel}
            onClose={this.onClose}
        />
        
    }
} 
 
   