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
    getCompletedWhen
} from '../utils/utils';  
import { insideTargetArea } from '../utils/insideTargetArea';
import { RightClickMenu } from './RightClickMenu'; 
import { byTags, byCategory } from '../utils/utils'; 
import { TodoInput } from './TodoInput/TodoInput';
import { 
    allPass, isNil, prepend, isEmpty, findIndex, when, cond,
    compose, map, assoc, contains, remove, not, equals 
} from 'ramda';
import { Category, filter } from './MainContainer';
import { indexToPriority } from './Categories/Today'; 
import { SortableContainer } from './CustomSortableContainer';
import { isString, isCategory, isTodo } from '../utils/isSomething';
import { assert } from '../utils/assert';
import { arrayMove } from '../utils/arrayMove';
import { isDev } from '../utils/isDev';


let findRelatedAreas = (areas:Area[], todo:Todo) : Area[] => filter(
    areas,
    (a:Area) : boolean => contains(todo._id,a.attachedTodosIds),
    ""
); 


let findRelatedProjects = (projects:Project[], todo:Todo) : Project[] => filter(
    projects,
    (p:Project) : boolean => {  
        let attachedTodosIds = p.layout.filter(isString);
        return contains(todo._id,attachedTodosIds)
    },
    ""
); 


let removeTodoFromAreas = (dispatch:Function, areas:Area[], todo:Todo) : void => {
    let load = map(
        (area:Area) => compose(
            (attachedTodosIds) : Area => assoc("attachedTodosIds",attachedTodosIds,area),
            (idx:number) => when(
                (attachedTodosIds) => idx!==-1,
                (attachedTodosIds) => remove(idx, 1, attachedTodosIds)
            )(area.attachedTodosIds),
            findIndex((id:string) => id===todo._id),
            (area) => area.attachedTodosIds
        )(area),
        areas
    );

    dispatch({type:"updateAreas", load});   
};      

 
let removeTodoFromProjects = (dispatch:Function, projects:Project[], todo:Todo) : void => {
    let load = map(
        (project:Project) => compose(
            (layout) : Project => assoc("layout",layout,project),
            (idx:number) => when(
                (layout) => idx!==-1,
                (layout) => remove(idx, 1, layout)
            )(project.layout),
            findIndex((id:string) => id===todo._id),
            (project) => project.layout
        )(project),
        projects
    );
    
    dispatch({type:"updateProjects", load});
};


let dropTodoOnProject = ({
    dispatch, 
    areas,
    projects, 
    projectTarget,
    draggedTodo
}) : void => {

    let relatedProjects : Project[] = findRelatedProjects(projects,draggedTodo); 
    let relatedAreas : Area[] = findRelatedAreas(areas,draggedTodo); 

    let alreadyAttached : boolean = compose(
        contains(projectTarget._id),
        map((project) => project._id)
    )(relatedProjects);

    if(alreadyAttached){ return }
 
    removeTodoFromProjects(dispatch,relatedProjects,draggedTodo);
    removeTodoFromAreas(dispatch,relatedAreas,draggedTodo);

    dispatch({ 
        type:"attachTodoToProject", 
        load:{ 
          projectId:projectTarget._id,
          todoId:draggedTodo._id
        } 
    });
};  


let dropTodoOnArea = ({
    dispatch,   
    areas,
    projects, 
    areaTarget, 
    draggedTodo
}) : void => {

    let relatedProjects : Project[] = findRelatedProjects(projects,draggedTodo); 
    let relatedAreas : Area[] = findRelatedAreas(areas,draggedTodo); 

    let alreadyAttached : boolean = compose(
        contains(areaTarget._id),
        map((area) => area._id)
    )(relatedAreas);

    if(alreadyAttached){ return }

    removeTodoFromProjects(dispatch,relatedProjects,draggedTodo);
    removeTodoFromAreas(dispatch,relatedAreas,draggedTodo);

    dispatch({ 
        type:"attachTodoToArea",
        load:{
          areaId:areaTarget._id,
          todoId:draggedTodo._id
        } 
    })  
};


let dropTodoOnCategory = ({
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
                removeTodoFromProjects(dispatch,projects,draggedTodo);
                removeTodoFromAreas(dispatch,areas,draggedTodo);
                let todo : Todo = {
                    ...draggedTodo, 
                    category:"inbox", 
                    attachedDate:undefined,
                    deadline:undefined, 
                    deleted:undefined,
                    completedSet:null,
                    completedWhen:null,
                    checked:false 
                };

                dispatch({type:"updateTodo", load:todo});
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
                    completedWhen:null,
                    checked:false
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
                    completedWhen:null,
                    checked:false 
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
                    completedWhen:null,
                    checked:false 
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
                    checked:true, 
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

    let projectTarget : Project = projects.find( (p:Project) => p._id===id );
    let areaTarget : Area = areas.find( (a:Area) => a._id===id );
 
    if(projectTarget){
        dropTodoOnProject({
           dispatch,
           areas,
           projects, 
           projectTarget,
           draggedTodo
        });
    }else if(areaTarget){ 
        dropTodoOnArea({
           dispatch,
           areas,
           projects, 
           areaTarget,
           draggedTodo
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
                }) 
            }
        } 
    } 
};



interface TodosListProps{ 
    dispatch:Function, 
    projects:Project[],
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
 
