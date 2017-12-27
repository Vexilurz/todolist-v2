
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
import { Todo, Project, Heading, LayoutItem } from '../../database';
import { uppercase, debounce, byNotDeleted, changePriority } from '../../utils';
import { arrayMove } from '../../sortable-hoc/utils';
import { ProjectHeading } from './ProjectHeading'; 
import { SortableList, Data } from '../SortableList';
import { TodoInput } from '../TodoInput/TodoInput';
import { RightClickMenu } from '../RightClickMenu';





let layoutOrderChanged = (before:LayoutItem[], after:LayoutItem[]) : boolean => {

    if(before.length!==after.length)
       return true;

    for(let i=0; i<before.length; i++){
        let beforeItem : LayoutItem = before[i];
        let afterItem : LayoutItem = after[i];

        if(typeof beforeItem !== typeof afterItem)
           return true;

        if(typeof beforeItem === "string"){

            if(beforeItem !== afterItem)
               return true;
            else 
               continue;

        }else if(beforeItem.type==="heading"){
 
            if(beforeItem["_id"] !== afterItem["_id"])
               return true;
            else  
               continue;    

        }

    }


    return false;   

}

 

interface ProjectBodyProps{
    layout:LayoutItem[],
    updateLayout:(layout:LayoutItem[]) => void,
    updateHeading: (heading_id:string, newValue:string) => void,
    archiveHeading: (heading_id:string) => void,
    moveHeading: (heading_id:string) => void,  
    removeHeading: (heading_id:string) => void,
    todos:Todo[],
    tags:string[],
    rootRef:HTMLElement,
    dispatch:Function
} 
 

 
interface ProjectBodyState{} 


 
export class ProjectBody extends Component<ProjectBodyProps,ProjectBodyState>{

     

    constructor(props){

        super(props);

        this.state = {};

    }

    
        
    shouldComponentUpdate(nextProps:ProjectBodyProps, nextState:ProjectBodyState){ 

        let should = false;
 
        if(layoutOrderChanged(nextProps.layout,this.props.layout))
           should = true;
 
        if(nextProps.todos !== this.props.todos) 
           should = true;

        if(nextProps.tags !== this.props.tags)
           should = true; 
 
 
        return should; 
     
    }   



    selectItems = (layout:LayoutItem[], todos:Todo[]) : (Todo | Heading)[] => { 
 
        let items = [];
        let filteredTodos : Todo[] = todos.filter(byNotDeleted);
   
        for(let i=0; i<layout.length; i++){
            let item : LayoutItem = layout[i];
 
            if(item===undefined || item===null)
               continue; 

            if(typeof item === "string"){
               let todo : Todo = filteredTodos.find( (t:Todo) => t._id===item );
 
               if(todo!==undefined && todo!==null){

                    if(todo.type==="todo")
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
                                    tags={this.props.tags} 
                                    rootRef={this.props.rootRef} 
                                    todo={value as Todo}
                                />     
                            </div> 

            case "heading":    
              
                    return  <div   
                                key={`${value["_id"]}-heading`} 
                                style={{ 
                                    position:"relative", 
                                    paddingTop:"10px", 
                                    paddingBottom: "10px"
                                }}         
                            > 
                                <ProjectHeading  
                                    heading={value as Heading}
                                    onChange={this.props.updateHeading}
                                    onArchive={this.props.archiveHeading}
                                    onMove={this.props.moveHeading} 
                                    onRemove={this.props.removeHeading}
                                />
                            </div> 

            default:

                return null

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
    


    onSortEnd = ( data : Data, e : any ) => { 

        let items = this.selectItems(
            this.props.layout, 
            this.props.todos
        )  
 
        let changed = changePriority(data.oldIndex, data.newIndex,items) as (Heading | Todo)[]; 
        let layout = changed.map( 
            (i:Heading | Todo) : LayoutItem => i.type==="todo" ? i._id : i as LayoutItem
        ); 
 
        this.props.updateLayout(layout);      
  
    } 
 
 

    onSortMove = ( e : any, helper : HTMLElement ) => {

    }



    onSortStart = ( data : Data, e : any, helper : HTMLElement) => {
         
    }



    render(){
        
        let items = this
                    .selectItems(
                        this.props.layout, 
                        this.props.todos
                    )  
                    .sort(   
                        ( a:(Todo | Heading), b:(Todo | Heading) ) => a.priority-b.priority
                    );   
    

        return <div>  
            <SortableList 
                getElement={this.getElement}
                items={items}
                
                shouldCancelStart={this.shouldCancelStart}
                shouldCancelAnimation={this.shouldCancelAnimation}  

                container={this.props.rootRef ? this.props.rootRef : document.body}
                onSortEnd={this.onSortEnd}
                onSortMove={this.onSortMove}
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







    
    
    
        
















