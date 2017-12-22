import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import { Component } from "react";  
import { Todo } from '../../database';
import { TodosList } from '.././TodosList';
import { ContainerHeader } from '.././ContainerHeader';
import { byTags, byCategory } from '../../utils';
import { FadeBackgroundIcon } from '../FadeBackgroundIcon';

 
 
interface InboxProps{
    dispatch:Function,
    selectedTodoId:string, 
    selectedTag:string,
    rootRef:HTMLElement,
    todos:Todo[],
    tags:string[]
} 
 


interface InboxState{}

 

export class Inbox extends Component<InboxProps, InboxState>{

    constructor(props){
        super(props);
    }

    render(){
   
        return <div> 
 
            <ContainerHeader 
              selectedCategory={"inbox"} 
              dispatch={this.props.dispatch} 
              tags={this.props.tags}
              selectedTag={this.props.selectedTag}
            /> 
 
            <FadeBackgroundIcon    
                container={this.props.rootRef} 
                selectedCategory={"inbox"}  
                show={this.props.todos.length===0}
            />  
 
            <div   
                className="unselectable" 
                id="todos" 
                style={{
                    marginBottom: "100px", 
                    marginTop:"50px" 
                }} 
            >  
                <TodosList 
                    dispatch={this.props.dispatch}    
                    selectedCategory={"inbox"} 
                    selectedTag={this.props.selectedTag}  
                    rootRef={this.props.rootRef}
                    todos={this.props.todos}  
                    tags={this.props.tags} 
                /> 
            </div>

        </div>

    }

}