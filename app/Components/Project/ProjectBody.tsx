
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
import { uppercase, debounce, byNotDeleted, generateEmptyTodo, byNotCompleted, generateDropStyle, insideTargetArea, hideChildrens, makeChildrensVisible, layoutOrderChanged } from '../../utils';
import { arrayMove } from '../../sortable-hoc/utils';
import { ProjectHeading } from './ProjectHeading';  
import { SortableList, Data } from '../SortableList';
import { TodoInput } from '../TodoInput/TodoInput';
import { RightClickMenu } from '../RightClickMenu';
import { equals, allPass, isEmpty } from 'ramda';
import { onDrop, Placeholder } from '../TodosList';


 


 

interface ProjectBodyProps{
    layout:LayoutItem[], 
    searched:boolean, 
    updateLayout:(layout:LayoutItem[]) => void,
    updateHeading:(heading_id:string, newValue:string) => void,
    archiveHeading:(heading_id:string) => void,
    moveHeading:(heading_id:string) => void,  
    removeHeading:(heading_id:string) => void,
    areas:Area[],
    projects:Project[], 
    selectedTodoId:string, 
    todos:Todo[], 
    tags:string[],
    rootRef:HTMLElement,
    dispatch:Function
} 
 

 
interface ProjectBodyState{
    showPlaceholder:boolean,
    currentIndex:number,
    items:(Heading|Todo)[], 
    helper:HTMLElement 
} 


 
export class ProjectBody extends Component<ProjectBodyProps,ProjectBodyState>{

     

    constructor(props){

        super(props);
 
        this.state={
            showPlaceholder:false,
            currentIndex:0,
            helper:null,
            items:this.selectItems(
                this.props.layout, 
                this.props.todos
            )
        }; 
    } 
  
    shouldComponentUpdate(nextProps:ProjectBodyProps, nextState:ProjectBodyState){ 
        return true; 
    }   

    componentDidMount(){
        let items = this.selectItems(this.props.layout,this.props.todos); 
        this.setState({items});
    }

    componentWillReceiveProps(nextProps:ProjectBodyProps){
        if(
            layoutOrderChanged(nextProps.layout,this.props.layout) ||
            this.props.todos!==nextProps.todos
        ){ 
            let items = this.selectItems(nextProps.layout, nextProps.todos);
            this.setState({items});
        } 
    }


    selectItems = (layout:LayoutItem[], todos:Todo[]) : (Todo | Heading)[] => { 
 
        let items = [];
        let filters = [byNotDeleted, byNotCompleted];
        let filteredTodos:Todo[] = todos.filter(allPass(filters));
    
        for(let i=0; i<layout.length; i++){ 
            let item : LayoutItem = layout[i];
 
            if(item===undefined || item===null){
               throw new Error(`Layout item undefined ${layout}. selectItems.`);  
            };

            if(typeof item === "string"){
               let todo : Todo = filteredTodos.find( (t:Todo) => t._id===item );
               
               if(todo){
                  items.push(todo); 
               }
            }else if(item.type==="heading"){
                items.push(item);
            }
        }
        return items; 
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
                            dispatch={this.props.dispatch}   
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

        let items = this.selectItems(this.props.layout,this.props.todos);  
        items = items.map(i => i.type==="todo" ? i._id : i) as any;
        let changed = arrayMove(items, oldIndex, newIndex); 
        this.props.updateLayout(changed);    
    }  
    
    showPlaceholder = () => this.setState({showPlaceholder:true});
    
    hidePlaceholder = () => this.setState({showPlaceholder:false});
    
    onSortStart = ({node, index, collection}, e, helper) => { 
        this.showPlaceholder();

        let item = this.state.items[index];

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

        let x = e.clientX; 
        let y = e.clientY+this.props.rootRef.scrollTop;  
        let items = this.state.items;   
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
            
        if(this.state.items[oldIndex].type==="todo"){
             
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
               let item = this.state.items[i];
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
        let empty = generateEmptyTodo("emptyTodo","project",0);
        let placeholderOffset = this.calculatePlaceholderOffset();
        let placeholderHeight = 30;
         
        return <div style={{WebkitUserSelect:"none", position:"relative"}}>  
            <div>  
                <TodoInput   
                    id={empty._id}
                    key={empty._id} 
                    dispatch={this.props.dispatch}    
                    searched={this.props.searched}
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
                items={this.state.items}
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







    
    
    
        
















