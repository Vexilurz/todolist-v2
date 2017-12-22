import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Todo } from '../database';
import { Component } from 'react';
import { 
    insideTargetArea, hideChildrens, makeChildrensVisible, 
    generateDropStyle, allPass 
} from '../utils';  
import { RightClickMenu } from './RightClickMenu';
import SortableContainer from '../sortable-hoc/sortableContainer';
import SortableElement from '../sortable-hoc/sortableElement';
import SortableHandle from '../sortable-hoc/sortableHandle';
import {arrayMove} from '../sortable-hoc/utils';
import {  byTags, byCategory } from '../utils';
import { SortableList } from './SortableList';
import { TodoInput } from './TodoInput/TodoInput';



interface TodosListProps{
    dispatch:Function,
    selectedCategory:string,
    selectedTag:string, 
    rootRef:HTMLElement,   
    todos:Todo[],
    tags:string[],
    disabled?:boolean     
}    


  
interface TodosListState{}

      
  
export class TodosList extends Component<TodosListProps, TodosListState>{

     constructor(props){

        super(props);

     } 
 


     shouldComponentUpdate(nextProps:TodosListProps){
         
        return true;  
           
     }  
 

  
     getTodoElement = (value:Todo, index:number) => {
     
        return <div style={{position:"relative"}}> 
                    <TodoInput   
                        id={value._id}
                        key = {value._id} 
                        dispatch={this.props.dispatch}   
                        tags={this.props.tags} 
                        rootRef={this.props.rootRef} 
                        todo={value}
                    />     
                </div> 

     }
      

 
     shouldCancelStart = (e) => {

        if(this.props.disabled)
           return true;

        let nodes = [].slice.call(e.path);

        for(let i=0; i<nodes.length; i++)
            if(nodes[i].preventDrag)
               return true;
         

        return false; 

     } 
     
      

     shouldCancelAnimation = (e) => {
 
        if(this.props.disabled)
           return true;

        if(!this.props.rootRef)
            return true;

        let rect = this.props.rootRef.getBoundingClientRect();    

        let x = e.pageX;

        return x < rect.left;   

     }  



     onSortStart = ({node, index, collection}, e, helper) => { 
        
        let helperRect = helper.getBoundingClientRect();
        let offset = e.clientX - helperRect.left;



        let el = generateDropStyle("nested"); 
        el.style.left=`${offset}px`;  
        el.style.visibility="hidden";
        el.style.opacity='0'; 
        
        helper.appendChild(el);  

     }

     

     onSortMove = (e, helper : HTMLElement) => {
        
        let x = e.clientX;
        let y = e.clientY+this.props.rootRef.scrollTop;  

            
        let areas = document.getElementById("areas");
        let projects = document.getElementById("projects");
        let nested = document.getElementById("nested");

        if(insideTargetArea(areas)(x,y) || insideTargetArea(projects)(x,y)){

            hideChildrens(helper);

            nested.style.visibility="";
            nested.style.opacity='1';    
                
        }else{ 

            makeChildrensVisible(helper); 
            nested.style.visibility="hidden";
            nested.style.opacity='0';  

        } 


     }
 
 

     onSortEnd = ({oldIndex, newIndex, collection}, e) => { 
         
        let x = e.clientX;
        let y = e.clientY+this.props.rootRef.scrollTop;  
        let draggedTodo = this.props.todos[oldIndex];
 
         
        let areas = document.getElementById("areas");
        let projects = document.getElementById("projects");


        if(insideTargetArea(areas)(x,y) || insideTargetArea(projects)(x,y)){

            let el = document.elementFromPoint(e.clientX, e.clientY);
            
            let id = el.id || el.parentElement.id;
              
            this.props.dispatch({type:"attachTodoToProject", load : {projectId:id,todoId:draggedTodo._id} });
            

        }else{  
 
            let items = this.props.todos; 
            
            let fromId = items[oldIndex]._id;
    
            let toId = items[newIndex]._id; 
    
            this.props.dispatch({type:"swapTodos", load:{fromId,toId}});

        }

     }
 
   
 
 
       
       
     render(){  

          
         return <div style={{WebkitUserSelect: "none"}}> 
 
            <SortableList   
                getElement={this.getTodoElement}
                items={this.props.todos}  
                shouldCancelStart={this.shouldCancelStart}  
                shouldCancelAnimation={this.shouldCancelAnimation}
                onSortEnd={this.onSortEnd}    
                onSortMove={this.onSortMove} 
                onSortStart={this.onSortStart} 
                lockToContainerEdges={false}
                distance={3}  
                useDragHandle={false}
                lock={false}
            /> 
             
            <RightClickMenu {...{} as any}/> 

         </div> 
            
     }  
 } 
 