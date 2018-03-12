import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Todo, Project, Area } from '../database';
import { Component } from 'react';
import { getCompletedWhen, generateDropStyle } from '../utils/utils';  
import { insideTargetArea } from '../utils/insideTargetArea';
import { TodoInput } from './TodoInput/TodoInput';
import { isNil, isEmpty, findIndex, cond, find,
    compose, map, contains, remove, not, equals, all, 
    intersection, path, prop, adjust, reject
} from 'ramda';
import { Category } from './MainContainer';
import { indexToPriority } from './Categories/Today'; 
import { SortableContainer } from './CustomSortableContainer';
import { 
    isString, isCategory, isTodo, isArrayOfTodos, isArrayOfProjects, isArrayOfAreas, isProject, isArea 
} from '../utils/isSomething';
import { assert } from '../utils/assert';
import { arrayMove } from '../utils/arrayMove';
import { isDev } from '../utils/isDev';


export let removeTodoFromProjects = (projects:Project[], todo:Todo) : Project[] => {
    let load = [];

    if(isNil(todo)){ return load }

    for(let i=0; i<projects.length; i++){
        let project = projects[i];
        if(isNil(project)){ continue }

        let layout = project.layout;
        if(contains(todo._id)(layout)){  
            load.push({
              ...project,
              layout:layout.filter((item) => item!==todo._id) 
            });  
        }else{
            load.push(project);
        } 
    }  
    
    assert(all((p:Project) => not(contains(todo._id)(p.layout)), load), 'removeTodoFromProjects. incorrect logic.'); 
    assert(
        projects.length===load.length, 
        'removeTodoFromProjects. projects.length should be equal to load.length.'
    );
   
    return load;
}; 


export let removeTodosFromProjects =  (projects:Project[], todos:Todo[]) : Project[] => {
    let ids = todos.map( t => t._id );

    let updated = projects.map( 
        (p:Project) => ({ 
            ...p, 
            layout:reject(
                (item) => contains(item)(ids),
                p.layout
            ) 
        }) 
    );

    assert(
        all(
            (p:Project) => intersection(p.layout,ids).length===0 , 
            updated
        ), 
        'removeTodosFromProjects. incorrect logic.'
    ); 

    return updated;
};



export let dropTodoOnCategory = ({draggedTodo,projects,category,moveCompletedItemsToLogbook}) : Todo => 
        cond([
            [
                equals("inbox"),
                () : Todo => ({
                    ...draggedTodo, 
                    category:"inbox", 
                    attachedDate:undefined,
                    deadline:undefined, 
                    reminder:null,
                    deleted:undefined,
                    completedSet:null,
                    completedWhen:null,
                    completed:null
                }) 
            ],
            [
                equals("today"),
                () : Todo => ({
                    ...draggedTodo, 
                    category:"today",
                    attachedDate:new Date(),
                    deleted:undefined,
                    reminder:null,
                    completedSet:null,
                    completedWhen:null,
                    completed:null
                })
            ],
            [
                equals("next"),
                () : Todo => ({
                    ...draggedTodo, 
                    category:"next",
                    deadline:undefined,
                    attachedDate:undefined,
                    reminder:null,
                    deleted:undefined,
                    completedSet:null,
                    completedWhen:null,
                    completed:null
                })
            ],
            [
                equals("someday"),
                () : Todo => ({
                    ...draggedTodo, 
                    category:"someday",
                    attachedDate:undefined,
                    deadline:undefined, 
                    deleted:undefined,
                    completedSet:null,
                    completedWhen:null,
                    completed:null
                })
            ],
            [
                equals("trash"),
                () : Todo => ({...draggedTodo, reminder:null, deleted:new Date()})
            ],
            [
                equals("logbook"),
                () : Todo => ({
                    ...draggedTodo,
                    completedSet:new Date(),
                    reminder:null,
                    completedWhen:getCompletedWhen(moveCompletedItemsToLogbook,new Date()),
                    deleted:undefined
                })
            ],
            [   
                () => true, 
                () : Todo => ({...draggedTodo}) 
            ]
        ])(category);



export let findDropTarget = (event,projects:Project[]) : {project:Project,category:Category} => {
    let element = document.elementFromPoint(event.clientX, event.clientY);
    let id = path(['id'], element) || path(['parentElement', 'id'],element);
    let nodes = [].slice.call(event.path);
    let project = find((p:Project) => p._id===id, projects);
    let category : Category = compose(find(isCategory),map(prop('id')))(nodes);

    return {project,category};
};



export let onDrop = ({event,draggedTodo,config,projects}) : { projects:Project[], todo:Todo } => { 
    let { moveCompletedItemsToLogbook } = config;
    let { project, category } = findDropTarget(event,projects);
    let updatedProjects = removeTodoFromProjects(projects,draggedTodo);

    if(isCategory(category)){
        return {
            projects:updatedProjects,
            todo:dropTodoOnCategory({
                draggedTodo, 
                projects:updatedProjects,
                category, 
                moveCompletedItemsToLogbook
            })
        };
    }else if(isProject(project)){
        let idx = findIndex((p:Project) => project._id===p._id, updatedProjects);

        return {
            projects:adjust(
                (p:Project) => ({ ...p, layout:[draggedTodo._id,...p.layout] }),
                idx, 
                updatedProjects
            ),
            todo:null
        };
    }else{
        return {} as any;
    }
};



interface TodosListProps{ 
    dispatch:Function, 
    projects:Project[],
    sortBy:(a:Todo,b:Todo) => number,  
    scrolledTodo:Todo,
    areas:Area[],
    groupTodos:boolean, 
    moveCompletedItemsToLogbook:string, 
    selectedCategory:Category,
    selectedTag:string,  
    selectedProjectId:string,
    selectedAreaId:string,  
    rootRef:HTMLElement,   
    todos:Todo[],  
    disabled?:boolean,
    reorderLayout?:boolean     
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
                scrolledTodo={this.props.scrolledTodo}
                moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                groupTodos={this.props.groupTodos}
                projects={this.props.projects}  
                dispatch={this.props.dispatch}  
                selectedProjectId={this.props.selectedProjectId}
                selectedAreaId={this.props.selectedAreaId}  
                selectedCategory={this.props.selectedCategory} 
                rootRef={this.props.rootRef}   
                todo={value}
            />     
        </div> 
    };
       

    shouldCancelStart = (e) => {

        if(this.props.disabled){ return true }

        let nodes = [].slice.call(e.path);

        for(let i=0; i<nodes.length; i++){
            if(nodes[i].preventDrag){ 
                return true 
            }
        }
          
        return false
    };  
     

    onSortStart = (oldIndex:number,event:any) : void => { 
        let {dispatch} = this.props;
        dispatch({type:"dragged",load:"todo"}); 
    };

    
    onSortMove = (oldIndex:number,event:any) => {};
    
    
    onSortEnd = (oldIndex:number,newIndex:number,event:any,item?:any) => { 

        let {todos, dispatch, areas, sortBy, projects,moveCompletedItemsToLogbook} = this.props;
        let x = event.clientX; 
        let y = event.clientY;   
        let selected = todos.sort(sortBy);


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
 
            let updated : { projects:Project[],todo:Todo } = onDrop({
                event, 
                draggedTodo, 
                projects, 
                config:{moveCompletedItemsToLogbook}
            }); 

            if(updated.projects){
               dispatch({type:"updateProjects", load:updated.projects});
            }

            if(updated.todo){
               dispatch({type:"updateTodo", load:updated.todo});
            }
 
        }else{     
            if(oldIndex===newIndex){ return }
            this.changeOrder(oldIndex,newIndex,selected) 
        }      
    };   
     
    
    changeOrder = (oldIndex,newIndex,selected) => {
        let {reorderLayout,projects,dispatch} = this.props;

        if(reorderLayout){
            let target = projects.find((p:Project) => all((t) => contains(t._id)(p.layout),selected));
            if(isProject(target)){
               let layout = [...target.layout]; 
               let from : Todo = selected[oldIndex];
               let to : Todo = selected[newIndex]; 

               let fromIndex = layout.findIndex( i => i===from._id);  
               let toIndex = layout.findIndex( i => i===to._id);

               if(fromIndex!==-1 && toIndex!==-1){
                   dispatch({
                       type:"updateProject",
                       load:{ 
                           ...target,
                           layout:arrayMove(layout,fromIndex,toIndex)
                       }
                   })
               } 
            }

        }else{

            dispatch({
                type:"updateTodos", 
                load:compose(
                    (load) => load.filter(isTodo),
                    indexToPriority,
                    (selected) => arrayMove(selected,oldIndex,newIndex),
                    (selected) => [...selected] 
                )(selected)
            });
        }
    };  
 
        
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
 
