import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Todo } from '../database';
import { Component } from 'react';
import { 
    insideTargetArea, hideChildrens, makeChildrensVisible, 
    generateDropStyle, allPass, getTagsFromItems 
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
    filters:( (t:Todo) => boolean )[],
    selectedCategory:string,
    setSelectedTags:(tags:string[]) => void,
    isEmpty:(empty:boolean) => void,
    selectedTag:string,  
    rootRef:HTMLElement,   
    todos:Todo[], 
    tags:string[],
    disabled?:boolean     
}    


  
interface TodosListState{
    todos:Todo[] 
}

      
  
export class TodosList extends Component<TodosListProps, TodosListState>{

     constructor(props){

        super(props);

        this.state={todos:[]}

     } 
 


     shouldComponentUpdate(nextProps:TodosListProps, nextState:TodosListState){

        let should = false; 

        if(this.props.todos!==nextProps.todos) 
           should=true;   
 
        if(this.state.todos!==nextState.todos)
           should=true;        

        return should;

     }  
  


     init = (props:TodosListProps) => {
        let todos = props.todos; 
         
        if(props.filters.length>0)
           todos = todos.filter( (t:Todo) => allPass(props.filters,t) );
         
        if(typeof props.isEmpty==="function")
           props.isEmpty(todos.length===0); 
        
        if(typeof props.setSelectedTags==="function")   
            props.setSelectedTags(getTagsFromItems(todos)); 
           
        this.setState({todos}); 
     }


     componentDidMount(){
        this.init(this.props);  
     }

 
     componentWillReceiveProps(nextProps:TodosListProps){
        if(this.props.todos!==nextProps.todos)
           this.init(nextProps);
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
                container={this.props.rootRef ? this.props.rootRef : document.body}
                items={this.state.todos.sort((a:Todo,b:Todo) => a.priority-b.priority)}  
                shouldCancelStart={this.shouldCancelStart}  
                shouldCancelAnimation={this.shouldCancelAnimation}
                onSortEnd={this.onSortEnd}    
                onSortMove={this.onSortMove}  
                onSortStart={this.onSortStart} 
                lockToContainerEdges={false}
                distance={5}  
                useDragHandle={false}
                lock={false}
            /> 
             
            <RightClickMenu {...{} as any}/> 

         </div> 
            
     }  
 } 
 