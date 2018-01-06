
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
import { uppercase, debounce, byNotDeleted, generateEmptyTodo, byNotCompleted, generateDropStyle, insideTargetArea, hideChildrens, makeChildrensVisible, layoutOrderChanged } from '../../utils';
import { arrayMove } from '../../sortable-hoc/utils';
import { ProjectHeading } from './ProjectHeading';  
import { SortableList, Data } from '../SortableList';
import { TodoInput } from '../TodoInput/TodoInput';
import { RightClickMenu } from '../RightClickMenu';
import { equals, allPass, isEmpty, isNil } from 'ramda';
import { onDrop, Placeholder } from '../TodosList';
import { isDev } from '../../app';


 


 

interface ProjectBodyProps{
    items:(Heading|Todo)[], 
    updateLayout:(layout:LayoutItem[]) => void,
    updateHeading:(heading_id:string, newValue:string) => void,
    archiveHeading:(heading_id:string) => void,
    moveHeading:(heading_id:string) => void,  
    removeHeading:(heading_id:string) => void,
    searched:boolean,
    areas:Area[],
    projects:Project[], 
    selectedProjectId:string,
    selectedAreaId:string,  
    selectedTodoId:string, 
    todos:Todo[], 
    tags:string[],
    rootRef:HTMLElement,
    dispatch:Function
} 
 

 
interface ProjectBodyState{
    showPlaceholder:boolean,
    currentIndex:number,
    helper:HTMLElement 
} 


 
export class ProjectBody extends Component<ProjectBodyProps,ProjectBodyState>{

     

    constructor(props){

        super(props);
        
        this.state={
            showPlaceholder:false,
            currentIndex:0,
            helper:null
        }; 
    } 
  
    shouldComponentUpdate(nextProps:ProjectBodyProps, nextState:ProjectBodyState){ 
        return true; 
    }   

    getElement = (value:Heading | Todo, index:number) : JSX.Element => { 
        
        switch(value.type){ 
            case "todo":
                    return  <div   
                        key = {`${value["_id"]}-todo`}  
                        style={{position:"relative"}}
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
                        style={{position:"relative", marginBottom:"10px", marginTop:"5px"}}         
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

    shouldCancelAnimation = (e) => {
        if(!this.props.rootRef)
            return true;
        let rect = this.props.rootRef.getBoundingClientRect();   
        let x = e.pageX;
        return x < rect.left;   
    }  
 
    changeOrder = (oldIndex:number,newIndex:number) => { 
        if(oldIndex===newIndex)
           return; 

        let items = this.props.items;  
        items = items.map(i => i.type==="todo" ? i._id : i) as any;
        let changed = arrayMove(items, oldIndex, newIndex); 
        this.props.updateLayout(changed);    
    }  
    
    showPlaceholder = () => this.setState({showPlaceholder:true});
    
    hidePlaceholder = () => this.setState({showPlaceholder:false});
    
    onSortStart = ({node, index, collection}, e, helper) => { 
        this.showPlaceholder();
        let item = this.props.items[index];

        if(isNil(item)){
            if(isDev()){  
               throw new Error(`item undefined. ${index}. onSortStart. ProjectBody.`);
            }
        }
 
        this.props.dispatch({type:"dragged",load:item.type});

        if(item.type==="todo"){
           let helperRect = helper.getBoundingClientRect();
           let offset = e.clientX - helperRect.left;

           let el = generateDropStyle("nested"); 
           el.style.left=`${offset}px`;  
           el.style.visibility="hidden";
           el.style.opacity='0'; 
                
           helper.appendChild(el);  
        }
    }

    onSortEnd = ({oldIndex, newIndex, collection}, e) => {  
        this.hidePlaceholder();
        this.props.dispatch({type:"dragged",load:null});
        let x = e.clientX; 
        let y = e.clientY+this.props.rootRef.scrollTop;  
        let items = this.props.items;   
        let draggedItem : (Todo | Heading) = items[oldIndex];
        let leftpanel = document.getElementById("leftpanel");

        if(draggedItem.type==="heading"){
            
            this.changeOrder(oldIndex,newIndex); 

        }else if(draggedItem.type==="todo"){

            if(isEmpty(draggedItem.title)) 
               return;
  
            if(insideTargetArea(leftpanel,x,y)){   
               onDrop(
                    e, 
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

         
    onSortMove = (e, helper : HTMLElement, newIndex:number, oldIndex:number) => {
        let x = e.clientX; 
        let y = e.clientY+this.props.rootRef.scrollTop;   

        if(newIndex!==this.state.currentIndex)
           this.setState({currentIndex:newIndex,helper}); 
            
        if(this.props.items[oldIndex].type==="todo"){
              
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
    }


    calculatePlaceholderOffset = () : number => {
        let placeholderOffset = 0; 
        
        if(this.state.helper){ 
           let rect = this.state.helper.getBoundingClientRect();
           let headingHeight = 46;  
           let todoHeight = 40; 

           for(let i=0; i<this.state.currentIndex; i++){
               let item = this.props.items[i];
               if(item){
                 if(item.type==="todo"){
                    placeholderOffset+=todoHeight;
                 }else if(item.type==="heading"){
                    placeholderOffset+=headingHeight;  
                 } 
               } 
           }
        } 

        return placeholderOffset;
    }


    render(){  
        let empty = generateEmptyTodo(generateId(),"project",0);
        let placeholderOffset = this.calculatePlaceholderOffset();
        let placeholderHeight = 30;
         
        return <div style={{WebkitUserSelect:"none", position:"relative"}}>  
            <div>  
                <TodoInput   
                    id={empty._id}
                    key={empty._id} 
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
            <Placeholder    
                height={placeholderHeight} 
                offset={placeholderOffset}
                show={this.state.showPlaceholder}
            />     
            <SortableList 
                getElement={this.getElement}
                items={this.props.items}
                shouldCancelStart={this.shouldCancelStart}
                shouldCancelAnimation={this.shouldCancelAnimation}  
                container={this.props.rootRef ? this.props.rootRef : document.body}
                onSortEnd={this.onSortEnd}
                onSortMove={this.onSortMove as any}
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







    
    
    
        
















