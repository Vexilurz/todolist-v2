
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
import Button from 'material-ui-next/Button';
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
import { uppercase, debounce, stringToLength, diffDays, daysRemaining, daysLeftMark } from '../../utils';
import { arrayMove } from '../../sortable-hoc/utils';
import { SortableList, Data } from '../SortableList';
import { TodoInput } from '../TodoInput/TodoInput';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import Checked from 'material-ui/svg-icons/navigation/check';
import PieChart from 'react-minimal-pie-chart';


 

interface AreaBodyProps{ 
    area:Area, 
    projects:Project[],
    todos:Todo[],
    tags:string[],
    rootRef:HTMLElement,
    dispatch:Function
} 
 
 
   
interface AreaBodyState{
    selectedProjects : Project[],
    selectedTodos : Todo[] 
} 

 
 
export class AreaBody extends Component<AreaBodyProps,AreaBodyState>{
 
     

    constructor(props){
 
        super(props);

        this.state = {
            selectedProjects : [],
            selectedTodos : [] 
        }
         
    }
    


    shouldComponentUpdate(nextProps:AreaBodyProps, nextState:AreaBodyState){ 
        
        return true;    
    
    }     
 


    componentDidMount(){  
         
        this.setState({  
            selectedProjects : this.selectProjects(this.props),
            selectedTodos : this.selectTodos(this.props)
        }); 

    } 


         
    componentWillReceiveProps(nextProps:AreaBodyProps){
 
        this.setState({  
            selectedProjects : this.selectProjects(nextProps),
            selectedTodos : this.selectTodos(this.props)
        }); 

    } 
         
    selectProject = (p:Project) => (e) => {
        
        this.props.dispatch({ type:"selectedProjectId", load:p._id });

    }
      
 

    selectTodos = (props:AreaBodyProps) : Todo[] => { 
 
        let todosIds : string[] = props.area.attachedTodosIds;

        return props.todos.filter( (t:Todo) => todosIds.indexOf(t._id)!==-1 );
        
    }


    selectProjects = (props:AreaBodyProps) : any[] => { 
        
        let projectsIds : string[] = props.area.attachedProjectsIds;

        return props.projects.filter( (p:Project) => projectsIds.indexOf(p._id)!==-1 );
         
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

 

    getProjectLink = (value:Project, index:number) : JSX.Element => { 

        let days = diffDays(value.created,value.deadline);    
        
        let remaining = !value.completed ? 
                        daysRemaining(value.deadline) : 
                        days;      
      

        return  <div className="toggleFocus"  style={{position:"relative", padding:"10px"}}>  
            <div    
                onClick = {this.selectProject(value)} 
                id = {value._id}       
                style={{   
                    marginLeft:"4px",
                    marginRight:"4px", 
                    position:"relative", 
                    height:"20px",
                    width:"95%",
                    display:"flex",
                    alignItems: "center" 
                }}
            >        
                    <div>          
                        <div     
                            style={{
                                width: "16px",
                                height: "16px",
                                display: "flex",
                                borderRadius: "50px",
                                border: "3px solid rgb(10, 100, 240)",
                                justifyContent: "center",
                                position: "relative" 
                            }}
                        >   
                        </div>
                    </div>
                     
 
                    <div   
                        id = {value._id}   
                        style={{  
                            paddingLeft:"5px",
                            fontFamily: "sans-serif",
                            fontWeight: 600, 
                            color: "rgba(0, 0, 0, 1)",
                            fontSize: "18px", 
                            whiteSpace: "nowrap",
                            cursor: "default",
                            WebkitUserSelect: "none" 
                        }}
                    >    
                        {  value.name  }  
                    </div>       
  
                    <div style={{ 
                        position: "absolute",
                        right: "0px"
                    }}>{ daysLeftMark(false, value.deadline, false) }</div>
                      
            </div> 
        </div>   
    }   
 
 

    getElement = (value:any, index:number) : JSX.Element => { 
          
        switch(value.type){ 

            case "todo":

                return this.getTodoElement(value,index);
 
            case "project":    
             
                return this.getProjectLink(value,index);

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

        return <div>  
            <div style={{paddingTop:"20px", paddingBottom:"20px"}}> 
                <SortableList
                    getElement={this.getElement}
                    items={this.state.selectedProjects}
                    
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

            <div style={{paddingTop:"20px", paddingBottom:"20px"}}> 
                <SortableList
                    getElement={this.getElement}
                    items={this.state.selectedTodos}
                    
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
        </div>

    }

} 





