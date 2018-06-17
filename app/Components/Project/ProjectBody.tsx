
import '../../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { Category, Todo, Project, Heading, LayoutItem, Area } from '../../types'; 
import { generateDropStyle, removeHeading, typeEquals } from '../../utils/utils'; 
import { ProjectHeading } from './ProjectHeading';  
import { TodoInput } from '../TodoInput/TodoInput'; 
import { 
    isNil, contains, drop, map, compose, adjust, findIndex, cond, 
    prepend, equals, lt, lte, add, takeWhile, splitAt, insertAll, 
    last, prop, when, reject, ifElse 
} from 'ramda';
import { onDrop, removeTodosFromProjects, dropTodoOnCategory, findDropTarget } from '../TodosList';
import { TodoCreationForm } from '../TodoInput/TodoCreation';
import { arrayMove } from '../../utils/arrayMove';
import { assert } from '../../utils/assert';
import { isTodo, isString, isHeading, isArrayOfTodos, isCategory, isProject, isNotNil } from '../../utils/isSomething';
import { insideTargetArea } from '../../utils/insideTargetArea';
import { generateEmptyTodo } from '../../utils/generateEmptyTodo';
import { generateId } from '../../utils/generateId';
import { SortableContainer } from '../CustomSortableContainer';
import { isDev } from '../../utils/isDev';



interface ProjectBodyProps{ 
    items:(Heading|Todo)[], 
    groupTodos:boolean,
    project:Project,
    updateLayoutOrder:(layout:LayoutItem[]) => void,
    updateHeading:(heading_id:string, newValue:string) => void,
    removeHeading:(heading_id:string) => void,
    removeHeadingWithTasks:(heading_id:string) => void,
    filters:{
        inbox:((todo:Todo) => boolean)[],
        today:((todo:Todo) => boolean)[],
        hot:((todo:Todo) => boolean)[],
        next:((todo:Todo) => boolean)[],
        someday:((todo:Todo) => boolean)[],
        upcoming:((todo:Todo) => boolean)[],
        logbook:((todo:Todo) => boolean)[],
        trash:((todo:Todo) => boolean)[]
    },
    showCompleted:boolean,
    selectedCategory:string, 
    scrolledTodo:Todo, 
    selectedTodo:Todo,
    selectedTags:string[],
    moveCompletedItemsToLogbook:string,
    areas:Area[],
    dragged:string, 
    projects:Project[], 
    selectedProjectId:string,
    selectedAreaId:string, 
    rootRef:HTMLElement,
    dispatch:Function
} 
  

 
interface ProjectBodyState{
    sorting:boolean
} 


let insertEmpty = (items:(Todo|Heading)[]) : (Todo|Heading)[] => {
    let lastHeading = undefined;
    let result = [];

    for(let i=0; i<items.length; i++){
        let item = items[i];
        let nextItem = items[i+1];

        if(isHeading(item)){
           lastHeading={...item}; 
        }

        if(
            isTodo(item) && 
            isNotNil(lastHeading) && 
            (isHeading(nextItem) || isNil(nextItem))
        ){
            let empty = {type:"creation",heading:lastHeading,_id:generateId()};
            result.push(item);
            result.push(empty);
        }else if(
            isHeading(item) && 
            isHeading(nextItem)
        ){
            let empty = {type:"creation",heading:lastHeading,_id:generateId()};
            result.push(item);
            result.push(empty);
        }else if(
            isHeading(item) && 
            isNil(nextItem)
        ){
            let empty = {type:"creation",heading:lastHeading,_id:generateId()};
            result.push(item);
            result.push(empty);
        }else{
            result.push(item);
        }
    }

    return result;
};


 
export class ProjectBody extends Component<ProjectBodyProps,ProjectBodyState>{

    constructor(props){
        super(props);
        this.state={
            sorting:false
        }
    }  
    
    
 
    getElement = (value:Heading | Todo | any) : JSX.Element => { 
        let id = prop('_id',value);
        return cond([
            [
                typeEquals("todo"),
                (value:Todo) => <div   
                    id={id}
                    key={`${id}-todo`}  
                    style={{position:"relative",UserSelect:"none",WebkitUserSelect:"none"} as any}
                >  
                    <TodoInput     
                        id={id}  
                        key={id} 
                        showCompleted={this.props.showCompleted}
                        scrolledTodo={this.props.scrolledTodo}
                        groupTodos={this.props.groupTodos}
                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                        projects={this.props.projects}
                        dispatch={this.props.dispatch}   
                        selectedProjectId={this.props.selectedProjectId}
                        selectedAreaId={this.props.selectedAreaId} 
                        selectedCategory={this.props.selectedCategory as Category}
                        rootRef={this.props.rootRef}  
                        todo={value as Todo}
                    />     
                </div> 
            ],
            [
                typeEquals("heading"), 
                (value:Heading) => <div id={id} key={`${id}-heading`}>
                    <div  
                        style={{
                            position:"relative", 
                            //paddingBottom:"10px", 
                            paddingTop:"5px",    
                            UserSelect:"none",  
                            WebkitUserSelect:"none"    
                        } as any}               
                    > 
                        <ProjectHeading   
                            heading={value as Heading}
                            rootRef={this.props.rootRef} 
                            onChange={this.props.updateHeading}
                            onRemoveHeading={this.props.removeHeading}
                            onRemoveHeadingWithTasks={this.props.removeHeadingWithTasks}
                        /> 
                    </div> 
                </div> 
            ],
            [
                typeEquals("creation"), 
                ({heading,_id}) => {
                    let empty = generateEmptyTodo(_id,"project",0) as any;
                    return <div id={_id} key={`key-${_id}`} style={{display:this.state.sorting ? 'none' : 'block'}} className={`no-print`}>  
                        <TodoCreationForm  
                            dispatch={this.props.dispatch}  
                            selectedTodo={this.props.selectedTodo}
                            selectedCategory={this.props.selectedCategory as any} 
                            selectedProjectId={this.props.selectedProjectId}
                            selectedAreaId={this.props.selectedAreaId} 
                            todos={this.props.items.filter(isTodo) as Todo[]} 
                            projects={this.props.projects}
                            rootRef={this.props.rootRef} 
                            todo={empty} 
                            targetHeading={heading}
                        />   
                    </div> 
                }
            ],
            [ 
                () => true, () => null 
            ]
        ])(value);
    };



    shouldCancelStart = (e,item) => {
        if(item && item.type==="creation"){ return true; }

        let nodes = [].slice.call(e.path);
        for(let i=0; i<nodes.length; i++){
            if(nodes[i].preventDrag){ return true; }
        }

        return false; 
    };



    changeOrder = (oldIndex:number,newIndex:number) => { 
        let {items,project} = this.props;
        let from = items[oldIndex];
        let to = items[newIndex];
        let layout = [...project.layout];

        let fromIndex = layout.findIndex((item:any) => {
            if(isTodo(from)){ 
               return from._id===item; 
            }else if(isHeading(from as Heading)){ 
               return isString(item) ? false : from._id===item._id;
            }
        });

        let toIndex = layout.findIndex((item:any) => {
            if(isTodo(to)){ 
               return to._id===item; 
            }else if(isHeading(to as Heading)){ 
               return isString(item) ? false : to._id===item._id;
            }
        });

        let changed = arrayMove(layout, fromIndex, toIndex); 
        this.props.updateLayoutOrder(changed);    
    };  


    
    changeHeadingsOrder = (oldIndex:number,newIndex:number) => {
        let {items,project,updateLayoutOrder} = this.props;
        let layout = [...project.layout];
        let from : Heading = items[oldIndex] as Heading;
        
        if(isDev()){
           assert(isHeading(from as Heading),`item is not heading. ${from}. changeHeadingsOrder.`);
        }

        //heading + string[]
        let data = compose(  
            prepend(items[oldIndex]), 
            map(prop('_id')),
            takeWhile(isTodo),
            last,
            splitAt(oldIndex+1)
        )(items);


        if(data.length===1){
           this.changeOrder(oldIndex,newIndex);
           return; 
        }

        
        let toLayoutIndex : number = compose(
            ifElse(
                lte(items.length),
                () => -1, 
                compose(
                    (item) => layout.findIndex(equals(item)),
                    when(isTodo,prop('_id')),
                    (index) => items[index],
                )
            ),
            when(lt(oldIndex),add(data.length))
        )(newIndex); 
        

        compose( 
            updateLayoutOrder,
            reject(isNil),
            insertAll(toLayoutIndex,data), 
            map( 
                when(
                    (item) => contains(item,data), 
                    () => undefined
                ) 
            )
        )(layout);
    };

        

    onSortStart = (oldIndex:number) : void => {
        let {dispatch, items} = this.props;
        let item = items[oldIndex];

        this.setState({sorting:true});

        if(isDev()){
           assert(isString(item.type), `item is Nil. incorrect index. onSortStart. ProjectBody.`);
        }
        
        dispatch({type:"dragged",load:item.type});
    }; 
    


    onDropMany = (event:any,heading:Heading,todos:Todo[]) => {
        if(isDev()){
           assert(isArrayOfTodos(todos), `onDropMany. todos is not of type array of todos.`);
           assert(isHeading(heading), `onDropMany. heading is not of type Heading.`);
        }

        let { projects, selectedProjectId, dispatch, moveCompletedItemsToLogbook, filters } = this.props;
        let selectedProjectIdx = findIndex((p:Project) => p._id===selectedProjectId, projects);
        let { project, category } = findDropTarget(event,projects);

        let updatedProjects = adjust(  
            (p:Project) => removeHeading(heading._id,p),
            selectedProjectIdx,
            removeTodosFromProjects(projects,todos)
        );

        if(isCategory(category)){ 

            let updatedTodos = todos.map(
                (todo:Todo) => dropTodoOnCategory({
                    draggedTodo:todo, 
                    projects:updatedProjects,
                    category, 
                    moveCompletedItemsToLogbook,
                    filters
                })
            );

            dispatch({
                type:"multiple",
                load:[{type:"updateProjects",load:updatedProjects},{type:"updateTodos",load:updatedTodos}]
            }); 
        }else if(isProject(project)){

            let idx = findIndex((p:Project) => project._id===p._id, updatedProjects);
            dispatch({ 
                type:"updateProjects", 
                load:adjust(
                    (p:Project) => ({ 
                        ...p, 
                        layout:[...project.layout, heading, ...todos.map((todo:Todo) => todo._id)]   
                    }),
                    idx, 
                    updatedProjects
                )
            });
        }
    };
    
 

    onSortEnd = (oldIndex:number, newIndex:number, event) : void => {
        let {moveCompletedItemsToLogbook,dispatch,projects,filters} = this.props;
        let leftpanel = document.getElementById("leftpanel");
        let actions = [{type:"dragged",load:null}];

        this.setState({sorting:false});

        let x = event.clientX;  
        let y = event.clientY;  
        let items = insertEmpty(this.props.items); // subset of layout, but maybe a full set

        // dragged item -> ( heading + todos  |  todo )
        let selectedItems = compose(
            map(index => items[index]),
            (items) => this.selectElements(oldIndex,items)
        )(items);

        // dragged item -> ( todo | heading )
        let draggedTodo : (Todo | Heading) = items[oldIndex]; 

        if(insideTargetArea(null,leftpanel,x,y)){

            if(isTodo(draggedTodo)){

                let updated : { projects:Project[], todo:Todo } = onDrop({
                    event, 
                    draggedTodo : draggedTodo as Todo, 
                    projects, 
                    config:{moveCompletedItemsToLogbook},
                    filters
                }); 

                if(updated.projects){
                   actions.push({type:"updateProjects", load:updated.projects});
                }
                
                if(updated.todo){
                   actions.push({type:"updateTodo", load:updated.todo});
                }

            }else if(isHeading(draggedTodo as Heading)){

                let heading = selectedItems[0];
                let todos = drop(1,selectedItems);
                this.onDropMany(event,heading,todos);  
            };

        }else{  
            if(isTodo(draggedTodo)){

               this.changeOrder(oldIndex,newIndex); 
            }else if(isHeading(draggedTodo as Heading)){

               this.changeHeadingsOrder(oldIndex,newIndex); 
            }
        };    

        dispatch({type:"multiple",load:actions}); 
    };
     


    selectElements = (index:number,items:any[]) => {
        let selected = [index];
        let item = items[index];

        if(isDev()){
           assert(isNotNil(item),`item is Nil. selectElements. index ${index}`);
        }

        if(isHeading(item)){   
            for(let i=index+1; i<items.length; i++){
                let item = items[i];

                if(isNil(item)){ break; } 
                else{
                    if(item.type==="todo"){ selected.push(i); }
                    else{ break; }  
                }
            }   
        } 
        return selected; 
    };   

    
    
    render(){  
        let {selectedCategory} = this.props;
        let decorators = [{
            area:document.getElementById("leftpanel"),
            decorator:generateDropStyle("nested"),
            id:"default"
        }];  
        let sortableItems = insertEmpty(this.props.items);
            
        return <div className="unselectable">   
            <div className={`no-print`}>  
                <TodoCreationForm  
                    dispatch={this.props.dispatch}  
                    selectedTodo={this.props.selectedTodo}
                    selectedCategory={selectedCategory as any} 
                    selectedProjectId={this.props.selectedProjectId}
                    selectedAreaId={this.props.selectedAreaId} 
                    todos={this.props.items.filter(isTodo) as Todo[]} 
                    projects={this.props.projects}
                    rootRef={this.props.rootRef} 
                    todo={generateEmptyTodo(generateId(),"project",0) as any} 
                />  
            </div> 
            <SortableContainer
                items={/*this.props.items*/sortableItems} 
                scrollableContainer={this.props.rootRef}
                selectElements={this.selectElements}  
                onSortStart={this.onSortStart} 
                onSortMove={(oldIndex:number, event) : void => {}}
                onSortEnd={this.onSortEnd}
                shouldCancelStart={(event:any,item) => this.shouldCancelStart(event,item)}  
                decorators={decorators}  
            >   
                {/*this.props.items*/sortableItems.map(item => this.getElement(item))}
            </SortableContainer> 
        </div> 
    }
} 

        
















