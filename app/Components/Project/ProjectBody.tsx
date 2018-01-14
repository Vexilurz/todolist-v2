
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
import { Todo, Project, Heading, LayoutItem, Area, generateId } from '../../database';
import { uppercase, debounce, byNotDeleted, generateEmptyTodo, byNotCompleted, generateDropStyle, insideTargetArea, hideChildrens, makeChildrensVisible, layoutOrderChanged, assert, isTodo, isString } from '../../utils';
import { arrayMove } from '../../sortable-hoc/utils';
import { ProjectHeading } from './ProjectHeading';  
import { SortableList, Data } from '../SortableList';
import { TodoInput } from '../TodoInput/TodoInput';
import { RightClickMenu } from '../RightClickMenu';
import { equals, allPass, isEmpty, isNil, not, uniq, contains } from 'ramda';
import { onDrop, Placeholder } from '../TodosList';
import { isDev } from '../../app'; 
import { SortableContainer } from '../../sortable/CustomSortableContainer';



interface ProjectBodyProps{
    items:(Heading|Todo)[], 
    updateLayoutOrder:(layout:LayoutItem[]) => void,
    updateHeading:(heading_id:string, newValue:string) => void,
    archiveHeading:(heading_id:string) => void,
    moveHeading:(heading_id:string) => void,  
    removeHeading:(heading_id:string) => void,
    searched:boolean,
    selectedTag:string,
    showScheduled : boolean,
    showCompleted : boolean,
    areas:Area[],
    dragged:string, 
    projects:Project[], 
    selectedProjectId:string,
    selectedAreaId:string,  
    selectedTodoId:string, 
    todos:Todo[], 
    tags:string[],
    rootRef:HTMLElement,
    dispatch:Function
} 
 

 
interface ProjectBodyState{} 


 
export class ProjectBody extends Component<ProjectBodyProps,ProjectBodyState>{

    constructor(props){
        super(props);
    }  
    


    shouldComponentUpdate(nextProps:ProjectBodyProps,nextState:ProjectBodyState){
        let should = false;

        if(layoutOrderChanged(this.props.items,nextProps.items)){
           should = true;  
        }

        if(this.props.showScheduled!==nextProps.showScheduled)
           should = true; 
        if(this.props.showCompleted!==nextProps.showCompleted)
           should = true;  
        
        if(this.props.searched!==nextProps.searched)
           should = true; 
        if(this.props.areas!==nextProps.areas)
           should = true; 
        if(this.props.selectedProjectId!==nextProps.selectedProjectId)
           should = true; 
        if(this.props.selectedTodoId!==nextProps.selectedTodoId)
           should = true; 
        if(this.props.todos!==nextProps.todos)
           should = true; 
        if(this.props.tags!==nextProps.tags)
           should = true; 
        if(this.props.selectedTag!==nextProps.selectedTag)
           should = true;  

        return should;     
    }
  


    getElement = (value:Heading | Todo, index:number) : JSX.Element => { 
        
        switch(value.type){ 
            case "todo":
                    return  <div   
                        id = {value["_id"]}
                        key = {`${value["_id"]}-todo`}  
                        style={{
                            position:"relative",
                            UserSelect:"none",
                            WebkitUserSelect:"none"
                        }}
                    >  
                        <TodoInput    
                            id={value["_id"]} 
                            key={value["_id"]} 
                            projects={this.props.projects}
                            dispatch={this.props.dispatch}   
                            selectedProjectId={this.props.selectedProjectId}
                            selectedAreaId={this.props.selectedAreaId} 
                            todos={this.props.todos}
                            searched={this.props.searched}
                            tags={this.props.tags} 
                            selectedTodoId={this.props.selectedTodoId} 
                            selectedCategory={"project"}
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
    }


    shouldCancelStart = (e) => {
        let nodes = [].slice.call(e.path);
        for(let i=0; i<nodes.length; i++){
            if(nodes[i].preventDrag)
                return true;
        }
        return false; 
    }


    changeOrder = (oldIndex:number,newIndex:number) => { 
        let items = this.props.items;  
        items = items.map(i => i.type==="todo" ? i._id : i) as any;
        let changed = arrayMove(items, oldIndex, newIndex); 
        this.props.updateLayoutOrder(changed);    
    }  


    changeHeadingsOrder = (oldIndex:number,newIndex:number) => {

        let items = [...this.props.items];
         
        assert(
            items[oldIndex].type==="heading", 
            `item is not heading. ${JSON.stringify(items[oldIndex])}. changeHeadingsOrder. `
        )

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

        assert(
            heading._id===updated[newIndex]._id, 
            `incorrect item placement. ${JSON.stringify(updated[newIndex])} changeHeadingsOrder.`
        ); 

        let layoutItems = updated.map( i => isTodo(i) ? i._id : i as any); 
   
        this.props.updateLayoutOrder(layoutItems);    
    }

    
       
    onSortStart = (oldIndex:number, event:any) : void => {
        let {dispatch, items} = this.props;
        let item = items[oldIndex];

        assert(isString(item.type), `item is Nil. incorrect index. onSortStart. ProjectBody.`);
        
        dispatch({type:"dragged",load:item.type});
    } 
         
    onSortMove = (oldIndex:number, event) : void => {
        
    } 
    
    onSortEnd = (oldIndex:number, newIndex:number, event) : void => {
        this.props.dispatch({type:"dragged",load:null}); 
        let x = event.clientX;  
        let y = event.clientY;  
        let items = this.props.items;   
        let draggedItem : (Todo | Heading) = items[oldIndex];
        let leftpanel = document.getElementById("leftpanel");

        if(draggedItem.type==="heading"){ 
            
            this.changeHeadingsOrder(oldIndex,newIndex);  
        }else if(draggedItem.type==="todo"){

            if(isEmpty(draggedItem.title))  
               return;
  
            if(insideTargetArea(leftpanel,x,y)){    
               onDrop(
                    event, 
                    draggedItem as Todo,
                    this.props.dispatch,
                    this.props.areas,
                    this.props.projects, 
               )  
            }else{   
               this.changeOrder(oldIndex,newIndex); 
            }   
        }
    }

    

    selectElements = (index:number,items:any[]) => {
        let selected = [index];
        let item = items[index];

        assert(!isNil(item),`item is Nil. selectElements. index ${index}`);

        if(item.type==="heading"){
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
    }   

    
    render(){  
        let empty = generateEmptyTodo(generateId(),"project",0);

        let shouldDecorate = (() => {
            let lp = document.getElementById("leftpanel");
            return (x,y) => insideTargetArea(lp,x,y)
        })();

        let decorators = [{  
            condition:shouldDecorate,  
            decorator:generateDropStyle("nested")
        }];    
           
        return <div className="unselectable">   
            <div>  
                <TodoInput    
                    id={empty._id}
                    key={"project-todo-creation-form"} 
                    dispatch={this.props.dispatch}    
                    searched={this.props.searched}
                    projects={this.props.projects} 
                    selectedProjectId={this.props.selectedProjectId} 
                    selectedAreaId={this.props.selectedAreaId} 
                    todos={this.props.todos}
                    selectedCategory={"project"}   
                    selectedTodoId={this.props.selectedTodoId} 
                    tags={this.props.tags}  
                    rootRef={this.props.rootRef}  
                    todo={empty}
                    creation={true}
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

        
















