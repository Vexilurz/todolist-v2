import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Todo, generateId, Project, Area } from '../database';
import { Component } from 'react';
import { 
    insideTargetArea, 
    hideChildrens, 
    makeChildrensVisible, 
    generateDropStyle, 
    getTagsFromItems,  
    generateEmptyTodo,
    isString,
    isCategory
} from '../utils';  
import { RightClickMenu } from './RightClickMenu';
import SortableContainer from '../sortable-hoc/sortableContainer';
import SortableElement from '../sortable-hoc/sortableElement';
import SortableHandle from '../sortable-hoc/sortableHandle';
import { arrayMove } from '../sortable-hoc/utils';
import { byTags, byCategory } from '../utils'; 
import { SortableList } from './SortableList';
import { TodoInput } from './TodoInput/TodoInput';
import { allPass, isNil, prepend, isEmpty, compose, map, assoc, contains, remove } from 'ramda';
import { Category } from './MainContainer';


let findRelatedAreas = (areas:Area[], t:Todo) : Area[] => {
    return areas.filter((a:Area) : boolean => {
        if(contains(t._id,a.attachedTodosIds))
           return true;
        return false;
    })
} 


let findRelatedProjects = (projects:Project[], t:Todo) : Project[] => {
    return projects.filter((p:Project) : boolean => {  
        let attachedTodosIds = p.layout.filter(isString);
        if(contains(t._id,attachedTodosIds))
           return true;
        return false;    
    }) 
}  


let removeTodoFromAreas = (dispatch:Function, areas:Area[], todo:Todo) : void => {

    let load = areas.map((fromArea:Area) : Area => {
        let idx : number = fromArea.attachedTodosIds.findIndex((id:string) => id===todo._id);  
        if(idx===-1){
           throw new Error(`attachedTodosIds does not include todo id. removeTodoFromAreas.`); 
        }
        fromArea.attachedTodosIds = remove(idx, 1, fromArea.attachedTodosIds); 
        console.log(`${todo.title} removed from ${fromArea.name}`);
        return fromArea; 
    })

    dispatch({type:"updateAreas", load});   
}  

 
let removeTodoFromProjects = (dispatch:Function, projects:Project[], todo:Todo) : void => {

    let load = projects.map((fromProject:Project) : Project => {
        let idx : number = fromProject.layout.findIndex((id:string) => id===todo._id);  
        if(idx===-1){
           throw new Error(`Project layout does not include todo id. removeTodoFromProjects.`); 
        }
        fromProject.layout = remove(idx, 1, fromProject.layout); 
        console.log(`${todo.title} removed from ${fromProject.name}`);
        return fromProject; 
    })
 
    dispatch({type:"updateProjects", load});
}


let dropTodoOnProject = (
    dispatch:Function, 
    areas:Area[],
    projects:Project[], 
    projectTarget:Project,
    draggedTodo:Todo
) : void => {
    console.log(`Drop on project ${projectTarget.name}`);

    let relatedProjects : Project[] = findRelatedProjects(projects,draggedTodo); 
    let relatedAreas : Area[] = findRelatedAreas(areas,draggedTodo); 

    for(let i=0; i<relatedProjects.length; i++)
        if(relatedProjects[i]._id===projectTarget._id)
           return; 
 
    removeTodoFromProjects(dispatch,relatedProjects,draggedTodo);
    removeTodoFromAreas(dispatch,relatedAreas,draggedTodo);

    dispatch({ 
        type:"attachTodoToProject", 
        load:{ 
          projectId:projectTarget._id,
          todoId:draggedTodo._id
        } 
    });
}  



let dropTodoOnArea = (
    dispatch:Function,   
    areas:Area[],
    projects:Project[], 
    areaTarget:Area, 
    draggedTodo:Todo 
) : void => {
    console.log(`Drop on area ${areaTarget.name}`);

    let relatedProjects : Project[] = findRelatedProjects(projects,draggedTodo); 
    let relatedAreas : Area[] = findRelatedAreas(areas,draggedTodo); 

    for(let i=0; i<relatedAreas.length; i++)
        if(relatedAreas[i]._id===areaTarget._id)
           return; 

    removeTodoFromProjects(dispatch,relatedProjects,draggedTodo);
    removeTodoFromAreas(dispatch,relatedAreas,draggedTodo);

    dispatch({ 
        type:"attachTodoToArea",
        load:{
            areaId:areaTarget._id,
            todoId:draggedTodo._id
        } 
    })  
} 
 






export let onDrop = (
    e,
    draggedTodo:Todo,
    dispatch:Function,
    areas:Area[], 
    projects:Project[],  
) => {
    let el = document.elementFromPoint(e.clientX, e.clientY);
    let id = el.id || el.parentElement.id;

    let projectTarget : Project = projects.find( (p:Project) => p._id===id );
    let areaTarget : Area = areas.find( (a:Area) => a._id===id );
 
    if(projectTarget){

        dropTodoOnProject(
           dispatch,
           areas,
           projects, 
           projectTarget,
           draggedTodo
        );

    }else if(areaTarget){ 

        dropTodoOnArea(
           dispatch,
           areas,
           projects, 
           areaTarget,
           draggedTodo
        ); 

    }else{ 
    
        let nodes = [].slice.call(e.path);
        
        for(let i=0; i<nodes.length; i++){

            if(isCategory(nodes[i].id)){
                switch(nodes[i].id){ 
                   case "inbox":
                        dispatch({
                            type:"updateTodo",
                            load:{...draggedTodo, category:"inbox"}
                        });
                        break;
                   case "today":
                        dispatch({
                            type:"updateTodo",
                            load:{...draggedTodo, category:"today"}
                        });
                        break;
                   case "next":
                        dispatch({
                            type:"updateTodo",
                            load:{...draggedTodo, category:"next"}
                        });
                        break;
                   case "someday":
                        dispatch({
                            type:"updateTodo",
                            load:{...draggedTodo, category:"someday"}
                        });
                        break;
                   case "trash":
                        dispatch({
                            type:"updateTodo",
                            load:{...draggedTodo, deleted:new Date()}
                        });  
                        break; 
                   case "logbook":
                        dispatch({
                            type:"updateTodo",
                            load:{...draggedTodo, checked:true, completed:new Date()}
                        }); 
                        break; 
                }    
            }
        } 
    } 
}












interface TodosListProps{
    dispatch:Function,
    filters:( (t:Todo) => boolean )[],
    selectedTodoId:string, 
    searched:boolean, 
    projects:Project[],
    areas:Area[],
    selectedCategory:Category,
    isEmpty:(empty:boolean) => void,
    selectedTag:string,  
    rootRef:HTMLElement,   
    todos:Todo[],  
    tags:string[], 
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
        this.state={
            todos:[], 
            currentIndex:0, 
            helper:null, 
            showPlaceholder:false
        };  
    }   
        
    componentDidMount(){

        let todos = this.props 
                        .todos
                        .filter(allPass(this.props.filters)) 
                        .sort((a:Todo,b:Todo) => a.priority-b.priority);
                        
        if(typeof this.props.isEmpty==="function"){  
           this.props.isEmpty(todos.length===0);  
        }
        
        this.setState({todos});  
    }  



    componentWillReceiveProps(nextProps:TodosListProps, nextState:TodosListState){
     
        if(    
            this.props.areas!==nextProps.areas ||
            this.props.projects!==nextProps.projects || 
            this.props.todos!==nextProps.todos ||  
            this.props.selectedTag!==nextProps.selectedTag 
        ){  
            let todos = nextProps 
                        .todos    
                        .filter(allPass(nextProps.filters)) 
                        .sort((a:Todo,b:Todo) => a.priority-b.priority);
                
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
  
        if(this.props.projects!==nextProps.projects) 
           should=true;   

        if(this.props.areas!==nextProps.areas) 
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
                        projects={this.props.projects}  
                        dispatch={this.props.dispatch}  
                        selectedCategory={this.props.selectedCategory} 
                        selectedTodoId={this.props.selectedTodoId}
                        tags={this.props.tags} 
                        searched={this.props.searched}
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
        let draggedTodo = this.state.todos[index];
        
        if(isNil(draggedTodo)){
           throw new Error(`draggedTodo undefined. ${index}. onSortStart. TodosList.`);
        }

        this.props.dispatch({type:"dragged",load:draggedTodo.type});
         
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

        if(newIndex!==this.state.currentIndex)
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
        this.setState({showPlaceholder:false});

        let x = e.clientX; 
        let y = e.clientY+this.props.rootRef.scrollTop;  
        let draggedTodo = this.state.todos[oldIndex];

        if(isEmpty(draggedTodo.title)) 
           return;
  
        this.props.dispatch({type:"dragged",load:null}); 

        let leftpanel = document.getElementById("leftpanel");

        if(insideTargetArea(leftpanel,x,y)){   

            onDrop(
                e, 
                draggedTodo,
                this.props.dispatch,
                this.props.areas,
                this.props.projects, 
            ) 
           
        }else{     
            if(oldIndex===newIndex)
               return; 
                      
            this.changeOrder(oldIndex,newIndex); 
        }   
    }  

     

    changeOrder = (oldIndex,newIndex) => {
        let items = [...this.state.todos];  
        let updated = compose(
           (items:Todo[]) => items.map((item:Todo,index:number) => assoc("priority",index,item)), 
           (items) => arrayMove(items,oldIndex,newIndex)
        )(items);  
        this.props.dispatch({type:"updateTodos", load:updated});
    }
 

        
    render(){    
        let placeholderOffset = 0;

        if(this.state.helper){
            let rect = this.state.helper.getBoundingClientRect();
            placeholderOffset = this.state.currentIndex*rect.height;
        }


        return <div style={{WebkitUserSelect:"none",position:"relative"}}>   
            <Placeholder   
                offset={placeholderOffset}
                height={40} 
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
    offset:number,
    height:number,
    show:boolean 
}  
 
interface PlaceholderState{} 

export class Placeholder extends Component<PlaceholderProps,PlaceholderState>{

    constructor(props){
        super(props);
    }  

    render(){        
 
        return !this.props.show ? null : 
                <div style={{   
                    backgroundColor:"rgba(205,221,253,0.5)",
                    zIndex:100,     
                    height:`${this.props.height}px`, 
                    borderRadius:"5px",     
                    width:"100%",    
                    position:"absolute",  
                    transform:`translateY(${this.props.offset}px)`
                }}>   
                </div> 
    } 
}   