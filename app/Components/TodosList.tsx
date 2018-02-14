import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Todo, Project, Area } from '../database';
import { Component } from 'react';
import { 
    hideChildrens, 
    makeChildrensVisible, 
    generateDropStyle, 
    getTagsFromItems
} from '../utils/utils';  
import { insideTargetArea } from '../utils/insideTargetArea';
import { RightClickMenu } from './RightClickMenu'; 
import { byTags, byCategory } from '../utils/utils'; 
import { TodoInput } from './TodoInput/TodoInput';
import { 
    allPass, isNil, prepend, isEmpty, 
    compose, map, assoc, contains, remove, not, equals 
} from 'ramda';
import { Category } from './MainContainer';
import { indexToPriority } from './Categories/Today'; 
import { SortableContainer } from './CustomSortableContainer';
import { isString, isCategory, isTodo } from '../utils/isSomething';
import { assert } from '../utils/assert';
import { arrayMove } from '../utils/arrayMove';
import { isDev } from '../utils/isDev';



export let getPlaceholderOffset = (nodes, currentIndex) : number => {
    let placeholderOffset = 0;

    if(isEmpty(nodes)){ return placeholderOffset } 

    for(let i=0; i<currentIndex; i++){

        if(isNil(nodes[i])){ continue }   

        let target = nodes[i]["node"];

        if(typeof target.getBoundingClientRect === "function"){
            let box = target.getBoundingClientRect();  
            placeholderOffset = placeholderOffset+box.height;
        }
    }
    
    return placeholderOffset;
}



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
        if(idx!==-1){
           fromArea.attachedTodosIds = remove(idx, 1, fromArea.attachedTodosIds); 
        }  
        return fromArea; 
    })
    dispatch({type:"updateAreas", load});   
}      

 
let removeTodoFromProjects = (dispatch:Function, projects:Project[], todo:Todo) : void => {

    let load = projects.map((fromProject:Project) : Project => {
        let idx : number = fromProject.layout.findIndex((id:string) => id===todo._id);  
        if(idx!==-1){
           fromProject.layout = remove(idx, 1, fromProject.layout); 
        }
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
                        removeTodoFromProjects(dispatch,projects,draggedTodo);
                        removeTodoFromAreas(dispatch,areas,draggedTodo);
                        dispatch({ 
                            type:"updateTodo",
                            load:{
                                ...draggedTodo, 
                                category:"inbox", 
                                attachedDate:undefined,
                                deadline:undefined, 
                                deleted:undefined,
                                completed:undefined,
                                checked:false 
                            }  
                        });
                        break;
                   case "today":
                        dispatch({
                            type:"updateTodo",
                            load:{
                                ...draggedTodo, 
                                category:"today",
                                attachedDate:new Date(),
                                deleted:undefined,
                                completed:undefined,
                                checked:false
                            } 
                        });
                        break;
                   case "next":
                        dispatch({
                            type:"updateTodo",
                            load:{
                                ...draggedTodo, 
                                category:"next",
                                attachedDate:undefined,
                                deleted:undefined,
                                completed:undefined,
                                checked:false 
                            }
                        });
                        break;
                   case "someday":
                        dispatch({
                            type:"updateTodo",
                            load:{
                                ...draggedTodo, 
                                category:"someday",
                                deadline:undefined, 
                                deleted:undefined,
                                completed:undefined,
                                checked:false 
                            }
                        });
                        break;
                   case "trash":
                        dispatch({
                            type:"updateTodo",
                            load:{
                                ...draggedTodo, 
                                deleted:new Date()
                            }
                        });  
                        break; 
                   case "logbook":
                        dispatch({
                            type:"updateTodo",
                            load:{
                                ...draggedTodo, 
                                checked:true, 
                                completed:new Date(),
                                deleted:undefined
                            } 
                        }); 
                        break; 
                }    
            }
        } 
    } 
}



interface TodosListProps{ 
    dispatch:Function, 
    projects:Project[],
    areas:Area[],
    groupTodos:boolean,
    moveCompletedItemsToLogbook:string, 
    selectedCategory:Category,
    selectedTag:string,  
    selectedProjectId:string,
    selectedAreaId:string,  
    rootRef:HTMLElement,   
    todos:Todo[],  
    disabled?:boolean     
}    


  
interface TodosListState{}
  
 
   
export class TodosList extends Component<TodosListProps, TodosListState>{

    constructor(props){ 
        super(props); 
    }   
      
    
    getTodoElement = (value:Todo, index:number) => {
        return <div   
            key={`${value._id}todo`} 
            id={value._id}  
            style={{position:"relative"}}
        > 
            <TodoInput        
                id={value._id} 
                key={value._id} 
                moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                groupTodos={this.props.groupTodos}
                projects={this.props.projects}  
                dispatch={this.props.dispatch}  
                selectedProjectId={this.props.selectedProjectId}
                selectedAreaId={this.props.selectedAreaId} 
                todos={this.props.todos}
                selectedCategory={this.props.selectedCategory} 
                rootRef={this.props.rootRef}  
                todo={value}
            />     
        </div> 
    }
       

    shouldCancelStart = (e) => {

        if(this.props.disabled){ return true }

        let nodes = [].slice.call(e.path);

        for(let i=0; i<nodes.length; i++){
            if(nodes[i].preventDrag){ return true }
        }
          
        return false
    }  
     

    onSortStart = (oldIndex:number,event:any) : void => { 
        let {dispatch} = this.props;
        dispatch({type:"dragged",load:"todo"}); 
    }


    onSortMove = (oldIndex:number,event:any) => {}

    
    onSortEnd = (oldIndex:number,newIndex:number,event:any,item?:any) => { 

        let {todos, dispatch, areas, projects} = this.props;
        let x = event.clientX; 
        let y = event.clientY;   
        let selected = todos.sort((a:Todo,b:Todo) => a.priority-b.priority); 
 
        dispatch({type:"dragged",load:null}); 

        let draggedTodo = item;
        
        assert(
            item._id===selected[oldIndex]._id, 
            `
                incorrect index. 
                ${newIndex} 
                ${JSON.stringify(item)} 
                ${JSON.stringify(selected)} 
                onSortEnd. TodosList.
            ` 
        )

        assert(isTodo(draggedTodo), `draggedTodo is not of type Todo ${JSON.stringify(draggedTodo)}. TodosList.`);

        if(isEmpty(draggedTodo.title)){ return }
  
        let leftpanel = document.getElementById("leftpanel");

        if(insideTargetArea(null,leftpanel,x,y) && isTodo(draggedTodo)){  
 
            onDrop(event,draggedTodo,dispatch,areas,projects) 

        }else{     
            if(oldIndex===newIndex){ return }
            this.changeOrder(oldIndex,newIndex,selected) 
        }    
    }   
    
    
    changeOrder = (oldIndex,newIndex,selected) => {
        let load = arrayMove(selected,oldIndex,newIndex); 
        this.props.dispatch({type:"updateTodos", load:indexToPriority(load).filter(isTodo)});
    }
 
  
        
    render(){    
        let {todos, selectedCategory} = this.props;

        let decorators = [{  
            area:document.getElementById("leftpanel"),  
            decorator:generateDropStyle("nested"),
            id:"default"
        }];    

        let selected = todos.sort((a:Todo,b:Todo) => a.priority-b.priority); 
        
        return <div style={{WebkitUserSelect:"none",position:"relative"}}>   
                <SortableContainer
                    items={selected}
                    scrollableContainer={this.props.rootRef}
                    selectElements={(index:number,items:any[]) => [index]}
                    shouldCancelStart={(event:any,item:any) => this.shouldCancelStart(event)}  
                    decorators={decorators}
                    onSortStart={this.onSortStart}   
                    onSortMove={this.onSortMove} 
                    onSortEnd={this.onSortEnd}  
                >   
                    {selected.map((todo:Todo,index) => this.getTodoElement(todo, index))} 
                </SortableContainer> 
        </div>  
    }   
}    
 
