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
        
     } 
 


     shouldComponentUpdate(nextProps:TodosListProps){
         
        return true;  
           
     } 
 

     componentDidMount(){

        let items = [...this.props.todos]; 
        let selectedItems = items.filter((item) => allPass(this.props.filters, item));
           
        this.setState({ items:selectedItems }, () => console.log(`selectedItems ${this.state.items} in ${this.props.selectedCategory}`));   

     }  
       
     
     componentWillReceiveProps(nextProps){

        if( 
            this.props.todos!==nextProps.todos  ||  
            this.props.selectedTag!==nextProps.selectedTag ||
            this.props.selectedCategory!==nextProps.selectedCategory  
        ){  
 
            let items = [...nextProps.todos];  
             
            let selectedItems = nextProps.todos.filter((item) => allPass(nextProps.filters, item));
                 
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
            //nested.style.left=e.clientX+"px"; 
            //nested.style.top=(e.clientY+this.props.rootRef.scrollTop)+"px";
                
        }else{ 

            makeChildrensVisible(helper); 
            nested.style.visibility="hidden";
            nested.style.opacity='0';  

        } 


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
                getElement={this.getTodoElem}
                items={this.state.items} 
                shouldCancelStart={this.shouldCancelStart}  
                shouldCancelAnimation={this.shouldCancelAnimation}
                onSortEnd={this.onSortEnd}    
                onSortMove={this.onSortMove} 
                onSortStart={this.onSortStart} 
                lockToContainerEdges={false}
                distance={3}
                useDragHandle={false}
                lock={true}
            /> 
              
            <RightClickMenu {...{} as any}/> 

         </div> 
            
     }  
 } 
 