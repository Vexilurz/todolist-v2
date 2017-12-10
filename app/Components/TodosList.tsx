import '../assets/styles.css';  
import '../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, uniq,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, any,
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, 
    groupBy, concat, flatten, toPairs, adjust, prepend, fromPairs, path 
} from 'ramda';
import { Todo } from '../databaseCalls';
import { Component } from 'react';
import { insideTargetArea, applyDropStyle } from '../utils';
import { RightClickMenu } from './RightClickMenu';
import { TodoInput } from './TodoInput';
import { Data } from './ResizableHandle';
import { DraggableCore, DraggableEventHandler, DraggableData } from 'react-draggable';

interface TodosListProps{
    dispatch:Function,
    selectedTodoId:string,
    selectedCategory:string,
    selectedTag:string,
    rootRef:HTMLElement,  
    todos:Todo[],
    tags:string[]     
}    

 
interface TodosListState{
    elements:any
}

      
  
export class TodosList extends Component<TodosListProps, TodosListState>{

     constructor(props){
        super(props);
     } 

     getTodoElem = (value:Todo, idx:number) => 
                    <TodoInput   
                        key = {value._id} 
                        dispatch={this.props.dispatch}   
                        tags={this.props.tags} 
                        rootRef={this.props.rootRef} 
                        todo={value}
                        todos={this.props.todos}
                        selectedCategory={this.props.selectedCategory} 
                        idx={idx}
                    />       
   

     byTags = (todo:Todo) : boolean => { 
         if(this.props.selectedCategory==="inbox" || this.props.selectedCategory==="someday")
            return true;  

         if(isNil(todo))
             return false;
         if(this.props.selectedTag==="All") 
             return true;    
 
         return contains(this.props.selectedTag,todo.attachedTags);
     } 


     byCategory = (todo:Todo) : boolean => { 
        if(isNil(todo))
            return false; 
 
        if(this.props.selectedCategory==="anytime")
           return true;
               
        return todo.category===this.props.selectedCategory;
     } 
 
    
     render(){ 
         return <div style={{WebkitUserSelect: "none"}}>
            {       
             compose(  
                  (todos:Todo[]) => <ul    
                          className="unselectable" 
                          onClick={(e) => {  
                              //e.stopPropagation(); 
                            }}
                          style={{padding:0,margin:0}}
                        >   
                            {      
                                todos.map((el, idx) => this.getTodoElem(el,idx))  
                            } 
                        </ul>,
                filter(this.byTags),
                filter(this.byCategory)
             )(this.props.todos)   
            }    
            <RightClickMenu /> 
         </div> 
     }  
 } 
 