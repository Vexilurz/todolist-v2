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
import { insideTargetArea } from '../utils'; 
import { RightClickMenu } from './RightClickMenu';
import { TodoInput } from './TodoInput';
import { Data } from './ResizableHandle';
import SortableContainer from '../sortable-hoc/sortableContainer';
import SortableElement from '../sortable-hoc/sortableElement';
import SortableHandle from '../sortable-hoc/sortableHandle';
import {arrayMove} from '../sortable-hoc/utils';


let getElem = (value, index) => {

    return <div></div>
 
} 


let createSortableItem = (index) => SortableElement(({value}) => getElem(value,index)); 


let getSortableTodoList = (items:Todo[]) =>  {

    return <ul style={{ padding:0, margin:0 }}>    
        {     
            items.map(      
                (item:Todo, index) => {   
                    let SortableItem = createSortableItem(index); 
                    return <SortableItem  key={`item-${item._id}`} index={index} value={item} />
                }
            )  
        }   
    </ul> 

}    


const SortableList = SortableContainer(({items}) => getSortableTodoList(items),{withRef:true});



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
        getElem = this.getTodoElem;
     } 


     shouldComponentUpdate(nextProps:TodosListProps){
         let should = this.props.todos!==nextProps.todos   
         
         return should;
     }
 
  
     getTodoElem = (value:Todo, index:number) => {
     
        return <div style={{position:"relative"}}> 
                <TodoInput   
                    id={value._id}
                    key = {value._id} 
                    dispatch={this.props.dispatch}   
                    tags={this.props.tags} 
                    rootRef={this.props.rootRef} 
                    todo={value}
                    todos={this.props.todos}
                    selectedCategory={this.props.selectedCategory} 
                    idx={index}  
                />    
                </div>

     }
     

     shouldCancelStart = (e) => {

        let nodes = [].slice.call(e.path);

        for(let i=0; i<nodes.length; i++){
            if(nodes[i].preventDrag)
               return true;
        }

        return false; 

     }



     applyDropStyle = (elem:HTMLElement, x:number, y:number) => {
        
        let children = [].slice.call(elem.children);

        for(let i=0; i<children.length; i++){
            children[i].style.visibility = 'hidden';
            children[i].style.opacity = 0;
        }
    
        let numb = document.createElement("div");

        numb.innerText = "1";
    
        let parentStyle = {
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            width: "60px",
            height: "20px",
            background: "cadetblue"
        }
    
        let childStyle = {
            background: "brown",
            width: "20px",
            height: "20px",
            alignItems: "center",
            textAlign: "center",
            color: "aliceblue",
            borderRadius: "30px",
            marginBottom: "-20px" 
        }
        
        map((pair) => {
            numb["style"][pair[0]]=pair[1];
        })(toPairs(childStyle))
    
        map((pair) => {
            elem["style"][pair[0]]=pair[1];
        })(toPairs(parentStyle))
            
        elem.appendChild(numb);  
        elem["style"].transform = "none";
        elem["style"].position = "absolute"; 
        elem["style"].left = (x-60)+'px';
        elem["style"].top = y+'px';

     }   
     



     shouldCancelAnimation = (e) => {

        if(!this.props.rootRef)
            return true;

        let rect = this.props.rootRef.getBoundingClientRect();    

        let x = e.pageX;

        return x < rect.left;   

     } 

      
  
      
     render(){ 

         return <div style={{WebkitUserSelect: "none"}}> 
 
            <SortableList 
                shouldCancelStart={this.shouldCancelStart}  
                shouldCancelAnimation={this.shouldCancelAnimation}
                distance={1}      
                items={this.props.todos}  
                axis='y'     
                onSortEnd={({oldIndex, newIndex}) => { 

                    let load = arrayMove(this.props.todos,oldIndex,newIndex);

                    this.props.dispatch({type:"todos",load});

                }}  
                onSortStart={() => {}}
            />

            <RightClickMenu /> 

         </div> 
          
     }  
 } 
 