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
    getTagsFromItems,
    getCompletedWhen,
    removeHeading
} from '../utils/utils';  
import { insideTargetArea } from '../utils/insideTargetArea';
import { RightClickMenu } from './RightClickMenu'; 
import { byTags, byCategory } from '../utils/utils'; 
import { TodoInput } from './TodoInput/TodoInput';
import { 
    allPass, isNil, prepend, isEmpty, findIndex, when, cond,
    compose, map, assoc, contains, remove, not, equals, all, 
    ifElse, uniq, flatten, intersection
} from 'ramda';
import { Category, filter } from './MainContainer';
import { indexToPriority } from './Categories/Today'; 
import { SortableContainer } from './CustomSortableContainer';
import { isString, isCategory, isTodo, isArrayOfTodos, isArrayOfProjects, isArrayOfAreas } from '../utils/isSomething';
import { assert } from '../utils/assert';
import { arrayMove } from '../utils/arrayMove';
import { isDev } from '../utils/isDev';


export let removeTodoFromAreas = (areas:Area[], todo:Todo) : Area[] => {
    let load = [];

    if(isNil(todo)){ return load }

    for(let i=0; i<areas.length; i++){
        let area = areas[i];
        if(isNil(area)){ continue }

        let attachedTodosIds = area.attachedTodosIds;
        let idx = attachedTodosIds.findIndex((id:string) => id===todo._id);

        if(idx!==-1){  
            load.push({
              ...area,
              attachedTodosIds:remove(idx, 1, attachedTodosIds)
            });
        }
    }  
    
    assert(all((a:Area) => not(contains(todo._id)(a.attachedTodosIds)), load), 'removeTodoFromAreas. incorrect logic.'); 
    return load;
};      


export let removeTodoFromProjects = (projects:Project[], todo:Todo) : Project[] => {
    let load = [];

    if(isNil(todo)){ return load }

    for(let i=0; i<projects.length; i++){
        let project = projects[i];
        if(isNil(project)){ continue }

        let layout = project.layout;
        if(isNil(layout) || isEmpty(layout)){ continue }

        if(contains(todo._id)(layout)){  
            load.push({
              ...project,
              layout:layout.filter((item) => item!==todo._id) 
            });
        } 
    } 
    
    assert(all((p:Project) => not(contains(todo._id)(p.layout)), load), 'removeTodoFromProjects. incorrect logic.');
    return load;
}; 


export let removeTodosFromProjects =  (projects:Project[], todos:Todo[]) : Project[] => {
    let result = projects;
    for(let i=0; i<todos.length; i++){
        result = removeTodoFromProjects(result, todos[i]);
    };
    return result;
};


export let removeTodosFromAreas =  (areas:Area[], todos:Todo[]) : Area[] => {
    let result = areas;
    for(let i=0; i<todos.length; i++){
        result = removeTodoFromAreas(result, todos[i]);
    };
    return result;
};



export let dropTodoOnCategory = ({
    dispatch, 
    draggedTodo,
    projects,
    areas, 
    category,
    moveCompletedItemsToLogbook
}) : void => {
    cond([
        [
            equals("inbox"),
            () => {
                dispatch({
                    type:"updateTodo", 
                    load:{
                        ...draggedTodo, 
                        category:"inbox", 
                        attachedDate:undefined,
                        deadline:undefined, 
                        deleted:undefined,
                        completedSet:null,
                        completedWhen:null
                    }
                }); 
            }
        ],
        [
            equals("today"),
            () => {
                let todo : Todo = {
                    ...draggedTodo, 
                    category:"today",
                    attachedDate:new Date(),
                    deleted:undefined,
                    completedSet:null,
                    completedWhen:null
                };

                dispatch({type:"updateTodo",load:todo});
            }
        ],
        [
            equals("next"),
            () => {
                let todo : Todo = {
                    ...draggedTodo, 
                    category:"next",
                    attachedDate:undefined,
                    deleted:undefined,
                    completedSet:null,
                    completedWhen:null
                };

                dispatch({type:"updateTodo", load:todo});
            }
        ],
        [
            equals("someday"),
            () => {
                let todo : Todo = {
                    ...draggedTodo, 
                    category:"someday",
                    deadline:undefined, 
                    deleted:undefined,
                    completedSet:null,
                    completedWhen:null
                };

                dispatch({type:"updateTodo",load:todo});
            }
        ],
        [
            equals("trash"),
            () => {
                let todo : Todo = {
                    ...draggedTodo, 
                    reminder:null,
                    deleted:new Date()
                };

                dispatch({type:"updateTodo",load:todo});  
                dispatch({type:"resetReminders"}); 
            }
        ],
        [
            equals("logbook"),
            () => {
                let todo : Todo = {
                    ...draggedTodo,
                    completedSet:new Date(),
                    completedWhen:getCompletedWhen(moveCompletedItemsToLogbook,new Date()),
                    deleted:undefined
                }; 

                dispatch({type:"updateTodo",load:todo}); 
            }
        ]
    ])(category);
};
 



export let onDrop = ({
    event,
    draggedTodo,
    dispatch,
    areas,  
    moveCompletedItemsToLogbook,
    projects  
}) => {
    let el = document.elementFromPoint(event.clientX, event.clientY);
    let id = el.id || el.parentElement.id;
    let projectTarget : Project = projects.find((p:Project) => p._id===id);
    let areaTarget : Area = areas.find((a:Area) => a._id===id);
 
    dispatch({type:"updateProjects", load:removeTodoFromProjects(projects,draggedTodo)});
    dispatch({type:"updateAreas", load:removeTodoFromAreas(areas,draggedTodo)});

    if(projectTarget){
        dispatch({
            type:"updateProject", 
            load:{
                ...projectTarget,
                layout:[ 
                    draggedTodo._id, 
                    ...projectTarget.layout 
                ]
            }
        }); 
    }else if(areaTarget){  
        dispatch({
            type:"updateArea", 
            load:{
                ...areaTarget,
                attachedTodosIds:uniq([
                    draggedTodo._id,
                    ...areaTarget.attachedTodosIds, 
                ])
            }
        }); 
    }else{ 
        let nodes = [].slice.call(event.path);
        for(let i=0; i<nodes.length; i++){
            if(isCategory(nodes[i].id)){
                dropTodoOnCategory({
                    dispatch, 
                    draggedTodo,
                    projects,
                    areas, 
                    category:nodes[i].id,
                    moveCompletedItemsToLogbook
                });  
            }
        } 
    } 
};


interface TodosListProps{ 
    dispatch:Function, 
    projects:Project[],
    sortBy:(a:Todo,b:Todo) => number,  
    selectedTodo:Todo,
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
                selectedTodo={this.props.selectedTodo}
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

        let {todos, dispatch, areas, projects,moveCompletedItemsToLogbook} = this.props;
        let x = event.clientX; 
        let y = event.clientY;   
        let selected = todos.sort((a:Todo,b:Todo) => a.priority-b.priority); 
 
        dispatch({type:"dragged",load:null}); 

        let draggedTodo = item;
        
        assert(
            item._id===selected[oldIndex]._id, 
            `incorrect index. ${newIndex} ${item} ${selected} onSortEnd. TodosList.` 
        );

        assert(isTodo(draggedTodo), `draggedTodo is not of type Todo ${draggedTodo}. TodosList.`);

        if(isEmpty(draggedTodo.title)){ return }
  
        let leftpanel = document.getElementById("leftpanel");

        if(insideTargetArea(null,leftpanel,x,y) && isTodo(draggedTodo)){  
 
            onDrop({event,draggedTodo,dispatch,areas,projects,moveCompletedItemsToLogbook}) 

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
        let {todos, selectedCategory, sortBy} = this.props;

        let decorators = [{  
            area:document.getElementById("leftpanel"),  
            decorator:generateDropStyle("nested"),
            id:"default"
        }];       

        let selected = todos.sort(sortBy);  
        
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
 
