import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react";  
import { Todo, Project, Area } from '../../database';
import { TodosList } from '.././TodosList';
import { ContainerHeader } from '.././ContainerHeader';
import { 
    byTags, byCategory, byNotCompleted, byNotDeleted, attachEmptyTodo, byAttachedToProject, byAttachedToArea 
} from '../../utils/utils'; 
import { FadeBackgroundIcon } from '../FadeBackgroundIcon';
import { compose, filter, allPass, prepend, contains, not, isNil, isEmpty } from 'ramda';
import { TodoInput } from '../TodoInput/TodoInput';
import { TodoCreationForm } from '../TodoInput/TodoCreation';
import { Category } from '../MainContainer';
import { generateEmptyTodo } from '../../utils/generateEmptyTodo';
import { generateId } from '../../utils/generateId';

 
 
interface InboxProps{ 
    dispatch:Function,
    selectedProjectId:string, 
    groupTodos:boolean, 
    selectedAreaId:string,  
    moveCompletedItemsToLogbook:string,
    selectedTag:string,
    selectedCategory:Category, 
    areas:Area[],
    projects:Project[],  
    rootRef:HTMLElement,
    todos:Todo[]
} 
 
 

interface InboxState{}

   

export class Inbox extends Component<InboxProps, InboxState>{

    constructor(props){ super(props) }   

    componentDidMount(){
        this.props.dispatch({type:"inboxAmount",load:this.props.todos.length});
    }

    componentWillReceiveProps(nextProps:InboxProps){ 
        this.props.dispatch({type:"inboxAmount",load:nextProps.todos.length});
    }

    render(){  
        let {moveCompletedItemsToLogbook,selectedCategory} = this.props;
        let empty = generateEmptyTodo(generateId(),selectedCategory,0) as any;

        return <div id={`${selectedCategory}-list`} style={{WebkitUserSelect:"none"}}>  
            <ContainerHeader  
                selectedCategory={this.props.selectedCategory} 
                dispatch={this.props.dispatch}   
                tags={[]}   
                showTags={false} 
                selectedTag={this.props.selectedTag} 
            /> 
            <FadeBackgroundIcon    
                container={this.props.rootRef} 
                selectedCategory={this.props.selectedCategory}  
                show={isEmpty(this.props.todos)}
            />  
            <div     
                className="unselectable" 
                id="todos" 
                style={{marginBottom:"100px", marginTop:"50px"}} 
            >    
                <div className={`no-print`}>
                    <TodoCreationForm  
                        dispatch={this.props.dispatch}  
                        selectedCategory={this.props.selectedCategory} 
                        selectedProjectId={this.props.selectedProjectId}
                        selectedAreaId={this.props.selectedAreaId} 
                        todos={this.props.todos} 
                        projects={this.props.projects}
                        rootRef={this.props.rootRef} 
                        todo={empty} 
                    />  
                </div>
                <div>
                    <TodosList          
                        selectedAreaId={this.props.selectedAreaId}
                        selectedProjectId={this.props.selectedProjectId}
                        areas={this.props.areas}
                        groupTodos={this.props.groupTodos}
                        projects={this.props.projects}  
                        dispatch={this.props.dispatch}     
                        selectedCategory={this.props.selectedCategory} 
                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                        selectedTag={this.props.selectedTag}  
                        rootRef={this.props.rootRef}
                        todos={this.props.todos}   
                    />
                </div> 
            </div>
        </div> 
    }
} 