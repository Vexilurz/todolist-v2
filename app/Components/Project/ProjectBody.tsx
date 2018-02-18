
import '../../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Provider } from "react-redux";
import { Transition } from 'react-transition-group';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import { ipcRenderer } from 'electron'; 
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Popover from 'material-ui/Popover';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Repeat from 'material-ui/svg-icons/av/repeat';
import Inbox from 'material-ui/svg-icons/content/inbox';
import Duplicate from 'material-ui/svg-icons/content/content-copy';
import ShareIcon from 'material-ui/svg-icons/social/share';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import { TextField } from 'material-ui';
import AutosizeInput from 'react-input-autosize';
import { Todo, Project, Heading, LayoutItem, Area } from '../../database'; 
import { 
    byNotDeleted, byNotCompleted, generateDropStyle, hideChildrens, makeChildrensVisible, layoutOrderChanged, removeHeading 
} from '../../utils/utils'; 
import { ProjectHeading } from './ProjectHeading';  
import { TodoInput } from '../TodoInput/TodoInput';
import { RightClickMenu } from '../RightClickMenu';
import { equals, allPass, isEmpty, isNil, not, uniq, contains, drop, map, compose } from 'ramda';
import { onDrop, removeTodosFromProjects, removeTodosFromAreas, dropTodoOnCategory } from '../TodosList';
import { TodoCreationForm } from '../TodoInput/TodoCreation';
import { arrayMove } from '../../utils/arrayMove';
import { assert } from '../../utils/assert';
import { isTodo, isString, isHeading, isArrayOfTodos, isCategory } from '../../utils/isSomething';
import { insideTargetArea } from '../../utils/insideTargetArea';
import { generateEmptyTodo } from '../../utils/generateEmptyTodo';
import { generateId } from '../../utils/generateId';
import { SortableContainer } from '../CustomSortableContainer';
import { Category } from '../MainContainer';



interface ProjectBodyProps{ 
    items:(Heading|Todo)[], 
    groupTodos:boolean,
    updateLayoutOrder:(layout:LayoutItem[]) => void,
    updateHeading:(heading_id:string, newValue:string) => void,
    archiveHeading:(heading_id:string) => void,
    moveHeading:(heading_id:string) => void,  
    removeHeading:(heading_id:string) => void,
    showCompleted:boolean,
    selectedCategory:string, 
    todos:Todo[],  
    selectedTodo:Todo, 
    selectedTag:string,
    moveCompletedItemsToLogbook:string,
    areas:Area[],
    dragged:string, 
    projects:Project[], 
    selectedProjectId:string,
    selectedAreaId:string, 
    rootRef:HTMLElement,
    dispatch:Function
} 
  

 
interface ProjectBodyState{} 


 
export class ProjectBody extends Component<ProjectBodyProps,ProjectBodyState>{

    constructor(props){
        super(props);
    }  
    

    getElement = (value:Heading | Todo, index:number) : JSX.Element => { 
        
        switch(value.type){ 
            case "todo":
                    return  <div   
                        id = {value["_id"]}
                        key = {`${value["_id"]}-todo`}  
                        style = {{position:"relative",UserSelect:"none",WebkitUserSelect:"none"}}
                    >  
                        <TodoInput    
                            id={value["_id"]} 
                            key={value["_id"]} 
                            showCompleted={this.props.showCompleted}
                            selectedTodo={this.props.selectedTodo}
                            groupTodos={this.props.groupTodos}
                            moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                            projects={this.props.projects}
                            dispatch={this.props.dispatch}   
                            selectedProjectId={this.props.selectedProjectId}
                            selectedAreaId={this.props.selectedAreaId} 
                            todos={this.props.todos}
                            selectedCategory={this.props.selectedCategory as Category}
                            rootRef={this.props.rootRef}  
                            todo={value as Todo}
                        />     
                    </div> 
            case "heading":  
                    return  <div   
                        key={`${value["_id"]}-heading`} 
                        id={value["_id"]} 
                        style={{
                            position:"relative", 
                            paddingBottom:"10px", 
                            paddingTop:"5px",    
                            UserSelect:"none",  
                            WebkitUserSelect:"none"    
                        }}               
                    > 
                        <ProjectHeading  
                            heading={value as Heading}
                            rootRef={this.props.rootRef} 
                            onChange={this.props.updateHeading}
                            onArchive={this.props.archiveHeading}
                            onMove={this.props.moveHeading} 
                            onRemove={this.props.removeHeading}
                        /> 
                    </div> 
            default:  
                return null;
        }
    };


    shouldCancelStart = (e) => {
        let nodes = [].slice.call(e.path);
        for(let i=0; i<nodes.length; i++){
            if(nodes[i].preventDrag)
                return true;
        }
        return false; 
    };


    changeOrder = (oldIndex:number,newIndex:number) => { 
        let items = this.props.items;  
        items = items.map(i => i.type==="todo" ? i._id : i) as any; 
        let changed = arrayMove(items, oldIndex, newIndex); 
        this.props.updateLayoutOrder(changed);    
    };  


    changeHeadingsOrder = (oldIndex:number,newIndex:number) => {

        let items = [...this.props.items];
         
        assert(isHeading(items[oldIndex] as Heading),`item is not heading. ${items[oldIndex]}. changeHeadingsOrder.`);

        let before = [];
        let after = [];

        let heading = items[oldIndex]; 
        let todos = [];

        for(let i=oldIndex+1; i<items.length; i++){
            if(items[i].type==="todo"){ 
               todos.push(items[i]);
            }else{ 
               break;
            }     
        }    

        if(isEmpty(todos)){
           this.changeOrder(oldIndex,newIndex);
           return;  
        }
        
        let todosIds = todos.map( t => t._id );
        let index = 0;
        if(newIndex<oldIndex)
            index = newIndex;
        else      
            index = newIndex + todos.length + 1;   
                   

        for(let i=0; i<items.length; i++){ 
            let item = items[i];

            if(item._id===heading._id || contains(item._id)(todosIds))
               continue; 
               
            if(i<index){ 
               before.push(item); 
            }else{
               after.push(item); 
            }
        }
        
        let updated = [ 
            ...before,
            heading, 
            ...todos,  
            ...after 
        ];  

        assert(heading._id===updated[newIndex]._id,`incorrect item placement. ${updated[newIndex]} changeHeadingsOrder.`); 

        let layoutItems = updated.map( i => isTodo(i) ? i._id : i as any); 
   
        this.props.updateLayoutOrder(layoutItems);    
    };

       
    onSortStart = (oldIndex:number, event:any) : void => {
        let {dispatch, items} = this.props;
        let item = items[oldIndex];

        assert(isString(item.type), `item is Nil. incorrect index. onSortStart. ProjectBody.`);
        
        dispatch({type:"dragged",load:item.type});
    }; 
    
    
    onSortMove = (oldIndex:number, event) : void => {}; 


    onDropMany = (event:any,heading:Heading,todos:Todo[]) => { 
        assert(isArrayOfTodos(todos), `onDropMany. todos is not of type array of todos.`);
        assert(isHeading(heading), `onDropMany. heading is not of type Heading.`);
        let {projects, areas, selectedProjectId, dispatch, moveCompletedItemsToLogbook} = this.props;
        //currently selected project
        let project = projects.find((p:Project) => p._id===selectedProjectId);


        //find target
        let el = document.elementFromPoint(event.clientX, event.clientY);
        let id = el.id || el.parentElement.id;
        let projectTarget : Project = projects.find((p:Project) => p._id===id);
        let areaTarget : Area = areas.find((a:Area) => a._id===id);

    
        //remove todos under the heading from all projects & areas
        //let updatedProjects = removeTodosFromProjects(projects,todos);
        //let updatedAreas = removeTodosFromAreas(areas,todos);

        let selectedProject = {
            ...project,
            layout:project.layout.filter(
                (item:any) => isString(item) ? !contains(item)(todos.map(t => t._id)) :
                              item._id!==heading._id  
            )
        };
  
        //update projects & areas
        dispatch({type:"updateProject", load:selectedProject});
        
        //removeHeading(heading._id,project)});
        //dispatch({type:"updateProjects", load:updatedProjects});
        //dispatch({type:"updateAreas", load:updatedAreas}); 


        //let fromProject = updatedProjects.find(p => p._id===project._id);
        //dispatch({type:"updateProject", load:removeHeading(heading._id,fromProject)});
    
        if(projectTarget){ 
            dispatch({ 
                type:"updateProject", 
                load:{
                    ...projectTarget, 
                    layout:[ 
                        heading, 
                        ...todos.map((todo:Todo) => todo._id), 
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
                        ...areaTarget.attachedTodosIds, 
                        ...todos.map((todo:Todo) => todo._id)
                    ])
                }
            });  
        }else{   
            let nodes = [].slice.call(event.path); 
            
            for(let i=0; i<nodes.length; i++){
                if(isCategory(nodes[i].id)){
                    todos.forEach( 
                        (todo:Todo) => dropTodoOnCategory({
                            dispatch, 
                            draggedTodo:todo,
                            projects, 
                            areas, 
                            category:nodes[i].id,
                            moveCompletedItemsToLogbook
                        }) 
                    );
                    break;
                }
            } 
        } 
    };
    

    onSortEnd = (oldIndex:number, newIndex:number, event) : void => {
        let {moveCompletedItemsToLogbook,dispatch,areas,projects,selectedProjectId} = this.props;
        dispatch({type:"dragged",load:null});  
        let x = event.clientX;  
        let y = event.clientY;  
        let items = this.props.items;   
        let draggedTodo : (Todo | Heading) = items[oldIndex];
        let leftpanel = document.getElementById("leftpanel");
        let selectedItems = compose(
            map(index => items[index]),
            (items) => this.selectElements(oldIndex, items)
        )(items);

        if(insideTargetArea(null,leftpanel,x,y)){
            if(isTodo(draggedTodo)){
                onDrop({
                    event,
                    draggedTodo,
                    dispatch,
                    areas, 
                    moveCompletedItemsToLogbook,
                    projects  
                });
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
    };
     

    selectElements = (index:number,items:any[]) => {
        let selected = [index];
        let item = items[index];

        assert(!isNil(item),`item is Nil. selectElements. index ${index}`);

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
        let empty = generateEmptyTodo(generateId(),"project",0);
        
        let {selectedCategory} = this.props;

        let decorators = [{  
            area:document.getElementById("leftpanel"),  
            decorator:generateDropStyle("nested"),
            id:"default"
        }];    
            
        return <div className="unselectable">   
            <div className={`no-print`}>  
                <TodoCreationForm  
                    dispatch={this.props.dispatch}  
                    selectedCategory={selectedCategory as any} 
                    selectedProjectId={this.props.selectedProjectId}
                    selectedAreaId={this.props.selectedAreaId} 
                    todos={this.props.todos} 
                    projects={this.props.projects}
                    rootRef={this.props.rootRef} 
                    todo={empty as any} 
                />  
            </div>  
            <SortableContainer
                items={this.props.items}
                scrollableContainer={this.props.rootRef}
                selectElements={this.selectElements}  
                onSortStart={this.onSortStart} 
                onSortMove={this.onSortMove}
                onSortEnd={this.onSortEnd}
                shouldCancelStart={(event:any,item:any) => this.shouldCancelStart(event)}  
                decorators={decorators}  
            >   
                {this.props.items.map((item,index) => this.getElement(item,index))}
            </SortableContainer> 
        </div> 
    }
} 

        
















