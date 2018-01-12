import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Todo, Project, Area } from '../database';
import { Component } from 'react';
import { 
    insideTargetArea, 
    hideChildrens, 
    makeChildrensVisible, 
    generateDropStyle, 
    getTagsFromItems,  
    generateEmptyTodo,
    isString,
    isCategory,
    assert,
    isTodo
} from '../utils';  
import { RightClickMenu } from './RightClickMenu';
import SortableContainer from '../sortable-hoc/sortableContainer';
import SortableElement from '../sortable-hoc/sortableElement';
import SortableHandle from '../sortable-hoc/sortableHandle';
import { arrayMove } from '../sortable-hoc/utils';
import { byTags, byCategory } from '../utils'; 
import { SortableList } from './SortableList';
import { TodoInput } from './TodoInput/TodoInput';
import { allPass, isNil, prepend, isEmpty, compose, map, assoc, contains, remove, not, equals } from 'ramda';
import { Category } from './MainContainer';
import { isDev } from '../app';
import { calculateAmount } from './LeftPanel/LeftPanel';
import { indexToPriority } from './Categories/Today';



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
                                attachedDate:undefined,
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
    filters:( (t:Todo) => boolean )[],
    selectedTodoId:string, 
    searched:boolean, 
    projects:Project[],
    areas:Area[],
    selectedCategory:Category,
    isEmpty:(empty:boolean) => void,
    selectedTag:string,  
    selectedProjectId:string,
    selectedAreaId:string,  
    rootRef:HTMLElement,   
    todos:Todo[],  
    tags:string[],
    disabled?:boolean     
}    


  
interface TodosListState{
    nodes:HTMLElement[],
    currentIndex:number, 
    helper:HTMLElement, 
    showPlaceholder:boolean 
}
  

   
export class TodosList extends Component<TodosListProps, TodosListState>{

    constructor(props){ 
        super(props);

        this.state={
            nodes:[],
            currentIndex:0,     
            helper:null,
            showPlaceholder:false
        };  
    }   
     
    shouldComponentUpdate(nextProps:TodosListProps, nextState:TodosListState){

        if(
            this.props.todos!==nextProps.todos ||
            this.props.projects!==nextProps.projects ||
            this.props.areas!==nextProps.areas ||
            this.props.selectedTag!==nextProps.selectedTag ||
            this.props.todos!==nextProps.todos ||

            this.state.currentIndex!==nextState.currentIndex ||
            this.state.nodes!==nextState.nodes || 
            this.state.showPlaceholder!==nextState.showPlaceholder 
        ){  
            return true 
        }
           
        return false 
    }   
    
    getTodoElement = (value:Todo, index:number) => {
        return  <div style={{position:"relative"}}> 
                    <TodoInput   
                        id={value._id}
                        key={value._id}
                        projects={this.props.projects}  
                        dispatch={this.props.dispatch}  
                        selectedProjectId={this.props.selectedProjectId}
                        selectedAreaId={this.props.selectedAreaId} 
                        todos={this.props.todos}
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

        if(this.props.disabled){ return true }

        let nodes = [].slice.call(e.path);

        for(let i=0; i<nodes.length; i++)
            if(nodes[i].preventDrag){
               return true 
            }
          
        return false
    }  
     

    shouldCancelAnimation = (e) => {
        let {disabled, rootRef} = this.props;
 
        if(disabled || isNil(rootRef)){
            return
        }

        return e.pageX < rootRef.getBoundingClientRect().left;   
    }  


    


    onSortStart = ({node, index, collection}, e, helper) => { 
        let {todos,filters} = this.props;
        let box = helper.getBoundingClientRect();
        let selected = todos
                       .filter(allPass(filters))
                       .sort((a:Todo,b:Todo) => a.priority-b.priority); 

        this.setState(
            {showPlaceholder:true, helper},
            () => this.props.dispatch({type:"dragged",load:selected[index].type})
        ); 

        let offset = e.clientX - box.left;

        let el = generateDropStyle("nested"); 
        el.style.left=`${offset}px`;  
        el.style.visibility="hidden";
        el.style.opacity='0'; 
        
        helper.appendChild(el);  
    }
    
    
 
    onSortMove = (e, helper : HTMLElement, newIndex:number, oldIndex:number, nodes:HTMLElement[]) => {
        let x = e.clientX;  
        let y = e.clientY; 
        
        if(newIndex!==this.state.currentIndex){ 
           this.setState({currentIndex:newIndex,helper,nodes}); 
        }  

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

        let {todos, filters, dispatch, areas, projects} = this.props;
        let x = e.clientX; 
        let y = e.clientY;  

        let selected = todos
                       .filter(allPass(filters))
                       .sort((a:Todo,b:Todo) => a.priority-b.priority); 

        let draggedTodo = selected[oldIndex];

        if(isEmpty(draggedTodo.title)){ return }
  
        dispatch({type:"dragged",load:null}); 

        let leftpanel = document.getElementById("leftpanel");

        if(insideTargetArea(leftpanel,x,y) && isTodo(draggedTodo)){  

            onDrop(e,draggedTodo,dispatch,areas,projects) 

        }else{     
            if(oldIndex===newIndex){ return }

            this.changeOrder(oldIndex,newIndex,selected) 
        }    
    }  

     

    changeOrder = (oldIndex,newIndex,selected) => {
        let load = indexToPriority(arrayMove(selected,oldIndex,newIndex)); 
        this.props.dispatch({type:"updateTodos", load:load.filter(isTodo)});
    }
 
  
    
        
    render(){    
        let {todos, filters, selectedCategory} = this.props;
        let {helper,showPlaceholder, nodes, currentIndex} = this.state;
        let offset = getPlaceholderOffset(nodes,currentIndex);
        let height = helper ? helper.getBoundingClientRect().height : 0;
        let selected = todos
                       .filter(allPass(filters))
                       .sort((a:Todo,b:Todo) => a.priority-b.priority); 

        return <div style={{WebkitUserSelect:"none",position:"relative"}}>   
            <Placeholder   
                offset={offset} 
                height={height}  
                show={showPlaceholder}
            />    
            <SortableList    
                getElement={this.getTodoElement }
                container={this.props.rootRef} 
                items={selected}    
                shouldCancelStart={this.shouldCancelStart as any}    
                shouldCancelAnimation={this.shouldCancelAnimation as any}
                onSortEnd={this.onSortEnd as any}    
                onSortMove={this.onSortMove as any}  
                onSortStart={this.onSortStart as any}  
                lockToContainerEdges={false}
                distance={1}    
                useDragHandle={false}
                lock={false}
            />  
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