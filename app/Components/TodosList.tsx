import '../assets/styles.css';  
import '../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, uniq,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, any,
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, 
    groupBy, concat, flatten, toPairs, adjust, prepend, fromPairs, path, allPass 
} from 'ramda';
import { Todo } from '../databaseCalls';
import { Component } from 'react';
import { insideTargetArea, hideChildrens, makeChildrensVisible, generateDropStyle } from '../utils';  
import { RightClickMenu } from './RightClickMenu';
import { TodoInput } from './TodoInput';
import { Data } from './ResizableHandle';
import SortableContainer from '../sortable-hoc/sortableContainer';
import SortableElement from '../sortable-hoc/sortableElement';
import SortableHandle from '../sortable-hoc/sortableHandle';
import {arrayMove} from '../sortable-hoc/utils';
import {  byTags, byCategory } from '../utils';



 
 

let getElem = (value, index) => {

    return null
 
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
    filters:Function[],
    selectedCategory:string,
    selectedTag:string,
    rootRef:HTMLElement,  
    todos:Todo[],
    tags:string[]     
}    

  
interface TodosListState{
    items:any[]
}

      
  
export class TodosList extends Component<TodosListProps, TodosListState>{

     constructor(props){
        super(props);

        this.state={items:[]};
 
        getElem = this.getTodoElem;
     } 
 


     shouldComponentUpdate(nextProps:TodosListProps){
         
         //if(this.props.todos!==nextProps.todos)
            //return true; 

            
         //if(this.props.selectedTag !== nextProps.selectedTag)
           // return true;   
 

         //if(this.props.selectedCategory !== nextProps.selectedCategory)
           // return true;
             
        // return false; 

        return true;  
           
     } 
 

     componentDidMount(){

        let items = [...this.props.todos]; 
        let selectedItems = items.filter(allPass(this.props.filters as any[]));
          
        this.setState({ items:selectedItems }, () => console.log(`selectedItems ${this.state.items} in ${this.props.selectedCategory}`));   

     }  
       
     
     componentWillReceiveProps(nextProps){

        if( 
            this.props.todos!==nextProps.todos  ||  
            this.props.selectedTag!==nextProps.selectedTag ||
            this.props.selectedCategory!==nextProps.selectedCategory  
        ){  
 
            let items = [...nextProps.todos]; 
             
            let selectedItems = nextProps.todos.filter(allPass(nextProps.filters as any[]));
                 
            this.setState({ items:selectedItems }, () => console.log(`selectedItems ${this.state.items} in ${this.props.selectedCategory}`));  
 
        }     
  
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
     
     

     shouldCancelAnimation = (e) => {

        if(!this.props.rootRef)
            return true;

        let rect = this.props.rootRef.getBoundingClientRect();    

        let x = e.pageX;

        return x < rect.left;   

     }  
 
 

     onSortEnd = ({oldIndex, newIndex, collection}, e) => { 
         
        let x = e.clientX;
        let y = e.clientY+this.props.rootRef.scrollTop;  
        let draggedTodo = this.state.items[oldIndex];
 
         
        let areas = document.getElementById("areas");
        let projects = document.getElementById("projects");


        if(insideTargetArea(areas)(x,y) || insideTargetArea(projects)(x,y)){

            let el = document.elementFromPoint(e.clientX, e.clientY);
            
            let id = el.id || el.parentElement.id;
             
            this.props.dispatch({type:"attachTodoToProject", load : {projectId:id,todoId:draggedTodo._id} });

        }else{  
 
            let items = this.state.items; /// this.props.todos; 
            
            let fromId = items[oldIndex]._id;
    
            let toId = items[newIndex]._id; 
    
            this.props.dispatch({type:"swapTodos", load:{fromId,toId}});

        }

     }
 
   
 
 
       
       
     render(){  

         
         return <div style={{WebkitUserSelect: "none"}}> 
 
            <SortableList  
                shouldCancelStart={this.shouldCancelStart}  
                shouldCancelAnimation={this.shouldCancelAnimation}
                distance={1}        
                items={this.state.items}  
                axis='y'     
                onSortEnd={this.onSortEnd}  
                onSortMove={(e, helper : HTMLElement) => {

                    let x = e.clientX;
                    let y = e.clientY+this.props.rootRef.scrollTop;  

                     
                    let areas = document.getElementById("areas");
                    let projects = document.getElementById("projects");
                    let nested = document.getElementById("nested");

                    if(insideTargetArea(areas)(x,y) || insideTargetArea(projects)(x,y)){

                        hideChildrens(helper);

                        nested.style.visibility="";
                        nested.style.opacity='1';    
                        //nested.style.left=e.clientX+"px"; 
                        //nested.style.top=(e.clientY+this.props.rootRef.scrollTop)+"px";
                         
                    }else{ 

                        makeChildrensVisible(helper); 
                        nested.style.visibility="hidden";
                        nested.style.opacity='0';  
                    } 
 
  
                }} 
                onSortStart={({node, index, collection}, e, helper) => { 

                    let helperRect = helper.getBoundingClientRect();
                    let offset = e.clientX - helperRect.left;


   
                    let el = generateDropStyle("nested"); 
                    el.style.left=`${offset}px`;  
                    el.style.visibility="hidden";
                    el.style.opacity='0'; 
                    
                    helper.appendChild(el);  
                
                }} 
            /> 
 
            <RightClickMenu /> 

         </div> 
            
     }  
 } 
 