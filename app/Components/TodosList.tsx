import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Todo, generateId } from '../database';
import { Component } from 'react';
import { 
    insideTargetArea, 
    hideChildrens, 
    makeChildrensVisible, 
    generateDropStyle, 
    getTagsFromItems,  
    generateEmptyTodo
} from '../utils';  
import { RightClickMenu } from './RightClickMenu';
import SortableContainer from '../sortable-hoc/sortableContainer';
import SortableElement from '../sortable-hoc/sortableElement';
import SortableHandle from '../sortable-hoc/sortableHandle';
import {arrayMove} from '../sortable-hoc/utils';
import {  byTags, byCategory } from '../utils';
import { SortableList } from './SortableList';
import { TodoInput } from './TodoInput/TodoInput';
import { allPass, isNil, prepend, isEmpty } from 'ramda';
import { Category } from './MainContainer';



interface TodosListProps{
    dispatch:Function,
    filters:( (t:Todo) => boolean )[],
    selectedTodoId:string, 
    selectedCategory:Category,
    isEmpty:(empty:boolean) => void,
    selectedTag:string,  
    rootRef:HTMLElement,   
    todos:Todo[],  
    tags:string[],
    attachEmptyTodo?:(todos:Todo[]) => Todo[], 
    disabled?:boolean     
}    


  
interface TodosListState{
    todos:Todo[],
    currentIndex:number, 
    helper:HTMLElement,
    showPlaceholder:boolean 
}
  
       
   
export class TodosList extends Component<TodosListProps, TodosListState>{


     constructor(props){ 
        super(props);
        this.state={todos:[], currentIndex:0, helper:null, showPlaceholder:false}; 
     }  
         

     componentDidMount(){

        let todos = this.props 
                        .todos
                        .filter(allPass(this.props.filters)) 
                        .sort((a:Todo,b:Todo) => a.priority-b.priority);

        if(typeof this.props.attachEmptyTodo==="function"){
           todos = this.props.attachEmptyTodo(todos); 
        }                 

        if(typeof this.props.isEmpty==="function"){ 
           this.props.isEmpty(todos.length===0);  
        }
        
        this.setState({todos});  
            
     } 



     componentWillReceiveProps(nextProps:TodosListProps, nextState:TodosListState){

        if(
            this.props.todos!==nextProps.todos ||  
            this.props.selectedTag!==nextProps.selectedTag 
        ){  
            let todos = nextProps 
                        .todos    
                        .filter(allPass(nextProps.filters)) 
                        .sort((a:Todo,b:Todo) => a.priority-b.priority);
                

            if(typeof nextProps.attachEmptyTodo==="function"){
                todos = nextProps.attachEmptyTodo(todos); 
            }                 

            if(typeof nextProps.isEmpty==="function"){ 
                nextProps.isEmpty(todos.length===0);  
            }     
             
            this.setState({todos});    
        }  
 
     }
 
  

     shouldComponentUpdate(nextProps:TodosListProps, nextState:TodosListState){
        let should = false; 

        if(this.props.todos!==nextProps.todos) 
           should=true;   
 
        if(this.props.selectedTag!==nextProps.selectedTag)
           should=true;   

        if(this.state.todos!==nextState.todos)
           should=true;   
 
        if(this.state.currentIndex!==nextState.currentIndex)
           should=true;   

        if(this.state.helper!==nextState.helper)
           should=true;    
       
        if(this.state.showPlaceholder!==nextState.showPlaceholder)
           should=true;        
            
        return should;
     }  
    

     
     getTodoElement = (value:Todo, index:number) => {
       
        return  <div style={{position:"relative"}}> 
                    <TodoInput   
                        id={value._id}
                        key={value._id} 
                        dispatch={this.props.dispatch}  
                        selectedCategory={this.props.selectedCategory} 
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

        this.setState({showPlaceholder:true});
         
        let helperRect = helper.getBoundingClientRect();
        let offset = e.clientX - helperRect.left;

        let el = generateDropStyle("nested"); 
        el.style.left=`${offset}px`;  
        el.style.visibility="hidden";
        el.style.opacity='0'; 
        
        helper.appendChild(el);  
     }
 
     
 
     onSortMove = (e, helper : HTMLElement, newIndex:number) => {
        let x = e.clientX; 
        let y = e.clientY+this.props.rootRef.scrollTop;   

        this.setState({currentIndex:newIndex,helper}); 

        let leftpanel = document.getElementById("leftpanel");
        let nested = document.getElementById("nested");

        if(insideTargetArea(leftpanel,x,y)){
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
          
        if(oldIndex===newIndex)
           return; 

        this.setState({showPlaceholder:false});
          
        let x = e.clientX; 
        let y = e.clientY+this.props.rootRef.scrollTop;  
        let draggedTodo = this.state.todos[oldIndex];

        if(isEmpty(draggedTodo.title))
           return;
 
        let leftpanel = document.getElementById("leftpanel");

        if(insideTargetArea(leftpanel,x,y)){   

            let el = document.elementFromPoint(e.clientX, e.clientY);
            let id = el.id || el.parentElement.id;
            if(id){ 
                this.props.dispatch({
                  type:"attachTodoToProject", 
                  load:{projectId:id,todoId:draggedTodo._id}
                });
            } 
        }else{      
            let items = this.state.todos;  

            if(items.length<=2)
               return; 

            let todo : Todo = {...items[oldIndex]};
 
            if(newIndex===0){
                console.log("newIndex===0")
                let first = items[newIndex];
                let newPriority = first.priority/2;
                todo.priority = newPriority;
                this.props.dispatch({type:"updateTodo",load:todo});
            }else if(newIndex===items.length-1){
                let last = items[newIndex];
                let newPriority = last.priority+1;
                todo.priority = newPriority; 
                this.props.dispatch({type:"updateTodo",load:todo});
            }else{
                let itemBefore = items[newIndex];
                let itemAfter = newIndex>oldIndex ? items[newIndex+1] : items[newIndex-1];
                let newPriority = (itemBefore.priority + itemAfter.priority)/2;
                todo.priority = newPriority;
                this.props.dispatch({type:"updateTodo",load:todo});
            }    
        } 
     }
 
        
     render(){   

        return <div style={{
            WebkitUserSelect:"none", 
            position:"relative"
        }}>  
            
            <Placeholder   
                helper={this.state.helper}
                currentIndex={this.state.currentIndex}
                show={this.state.showPlaceholder}
            /> 
            <SortableList   
                getElement={this.getTodoElement}
                container={this.props.rootRef} 
                items={this.state.todos}  
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
 
 


interface PlaceholderProps{
    helper:HTMLElement, 
    currentIndex:number,
    show:boolean 
}
 
interface PlaceholderState{} 

class Placeholder extends Component<PlaceholderProps,PlaceholderState>{

    constructor(props){
        super(props);
    }  

    render(){       
        if(!this.props.helper) 
            return null; 
 
        let rect = this.props.helper.getBoundingClientRect();
         
        let offset = this.props.currentIndex*rect.height;
 
        return !this.props.show ? null : 
        <div style={{   
            backgroundColor:"rgba(205,221,253,0.5)",
            zIndex:100,     
            //transition:this.props.show ? "transform 0.2s ease-in-out" : "", 
            height:"30px", 
            borderRadius:"5px",     
            width:"100%",    
            position:"absolute",  
            transform:`translateY(${offset}px)`
        }}>   
        </div>
    } 
 
} 