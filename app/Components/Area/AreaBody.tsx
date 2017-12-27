
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
import { uppercase, debounce, stringToLength, daysRemaining, daysLeftMark, byNotCompleted, byNotDeleted } from '../../utils';
import { arrayMove } from '../../sortable-hoc/utils';
import { SortableList, Data } from '../SortableList';
import { TodoInput } from '../TodoInput/TodoInput';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import Checked from 'material-ui/svg-icons/navigation/check';
import PieChart from 'react-minimal-pie-chart';
import { getProjectLink } from '../Project/ProjectLink';
import { allPass } from 'ramda';
import { TodosList } from '../TodosList';


 

interface AreaBodyProps{ 
    area:Area, 
    projects:Project[],
    selectedTodoId:string, 
    todos:Todo[],
    tags:string[],
    selectedTag:string, 
    rootRef:HTMLElement,
    dispatch:Function
} 
 
 
   
interface AreaBodyState{} 
 
 
 
export class AreaBody extends Component<AreaBodyProps,AreaBodyState>{
 
     

    constructor(props){
 
        super(props);

        this.state = {};
         
    }
    
 

    shouldComponentUpdate(nextProps:AreaBodyProps, nextState:AreaBodyState){ 
        
        let should = false; 
        
        if(nextProps.area!==this.props.area) 
           should = true;

        if(nextProps.projects!==this.props.projects)
           should = true;

        if(nextProps.todos!==this.props.todos)
           should = true;  

        if(nextProps.tags!==this.props.tags)  
           should = true;


        return should;    
    
    }     
 


    selectTodos = (props:AreaBodyProps) : Todo[] => { 
 
        let todosIds : string[] = props.area.attachedTodosIds;
        let filters = [
            byNotCompleted,
            byNotDeleted,
            (t:Todo) => todosIds.indexOf(t._id)!==-1
        ]

        return props.todos.filter( allPass(filters) );
        
    }



    selectProjects = (props:AreaBodyProps) : Project[] => { 

        let projectsIds : string[] = props.area.attachedProjectsIds;
        let filters = [
            byNotCompleted,
            byNotDeleted,
            (p:Project) => projectsIds.indexOf(p._id)!==-1
        ]
 

        return props.projects.filter( allPass(filters) );
          
    }
         


    getTodoElement = (value:Todo, index:number) : JSX.Element => { 
        return  <div style={{position:"relative"}}> 
            <TodoInput   
                id={value["_id"]} 
                key = {value["_id"]} 
                dispatch={this.props.dispatch}   
                tags={this.props.tags} 
                rootRef={this.props.rootRef} 
                todo={value as Todo}
            />     
        </div> 
    }

 

    getElement = (value:any, index:number) : JSX.Element => { 
          
        switch(value.type){   

            case "todo":

                return this.getTodoElement(value, index);
          
            case "project":    
                
                return getProjectLink({width:"15px",height:"15px"}, value, index, this.props.dispatch);

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
    


    onSortEnd = ( data : Data, e : any ) => {
   
    } 

 

    onSortMove = ( e : any, helper : HTMLElement ) => {

    }



    onSortStart = ( data : Data, e : any, helper : HTMLElement) => {
          
    }

    
    
    render(){
 
        let selectedProjects = this.selectProjects(this.props).sort(( a:Project, b:Project ) => a.priority-b.priority); 
        let selectedTodos = this.selectTodos(this.props).sort(( a:Todo, b:Todo ) => a.priority-b.priority); 
            
        return <div>   
            <div style={{paddingTop:"20px", paddingBottom:"20px"}}> 
                <SortableList
                    getElement={this.getElement}
                    items={selectedProjects}
                    container={this.props.rootRef ? this.props.rootRef : document.body}
                    shouldCancelStart={this.shouldCancelStart} 
                    shouldCancelAnimation={this.shouldCancelAnimation}

                    onSortEnd={this.onSortEnd}
                    onSortMove={this.onSortMove}
                    onSortStart={this.onSortStart}

                    lockToContainerEdges={false}
                    distance={3}
                    useDragHandle={false}
                    lock={false} 
                /> 
            </div>      
 
            <div   
                className="unselectable" 
                id="todos" 
                style={{
                    paddingTop:"20px", 
                    paddingBottom:"20px"
                }} 
            >  
                <TodosList    
                    filters={[ ]}   
                    selectedTodoId={this.props.selectedTodoId} 
                    isEmpty={(empty:boolean) => {}}
                    dispatch={this.props.dispatch}    
                    selectedCategory={"area"}  
                    selectedTag={this.props.selectedTag}  
                    rootRef={this.props.rootRef}
                    todos={selectedTodos}  
                    tags={this.props.tags} 
                /> 
            </div>

        </div>

    }

} 






 