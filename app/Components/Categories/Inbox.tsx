import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react";  
import { Todo, Project, Area, generateId } from '../../database';
import { TodosList } from '.././TodosList';
import { ContainerHeader } from '.././ContainerHeader';
import { 
    byTags, byCategory, byNotCompleted, byNotDeleted, getTagsFromItems, 
    generateEmptyTodo, attachEmptyTodo, byAttachedToProject, byAttachedToArea 
} from '../../utils'; 
import { FadeBackgroundIcon } from '../FadeBackgroundIcon';
import { compose, filter, allPass, prepend, contains, not, isNil } from 'ramda';
import { TodoInput } from '../TodoInput/TodoInput';
import { isString } from 'util';

 
 
interface InboxProps{ 
    dispatch:Function,
    selectedTodoId:string, 
    selectedProjectId:string,
    selectedAreaId:string,  
    selectedTag:string,
    searched:boolean, 
    selectedCategory:string, 
    areas:Area[],
    projects:Project[],  
    rootRef:HTMLElement,
    todos:Todo[],
    tags:string[]
} 
 
 

interface InboxState{
    empty:boolean
}

  

export class Inbox extends Component<InboxProps, InboxState>{

    constructor(props){
        super(props);
        this.state={empty:false};
    }   

    render(){ 

        let empty = generateEmptyTodo(generateId(),"inbox",0);

        return <div style={{WebkitUserSelect:"none"}}>  
            <ContainerHeader  
                selectedCategory={"inbox"} 
                dispatch={this.props.dispatch}  
                tags={[]}  
                showTags={false} 
                selectedTag={this.props.selectedTag} 
            /> 
 
            <FadeBackgroundIcon    
                container={this.props.rootRef} 
                selectedCategory={"inbox"}  
                show={this.state.empty}
            />  
  
            <div    
                className="unselectable" 
                id="todos" 
                style={{marginBottom:"100px", marginTop:"50px"}} 
            >    
                 <TodoInput    
                    id={empty._id} 
                    key={"inbox-todo-creation-form"}  
                    searched={this.props.searched}
                    dispatch={this.props.dispatch}  
                    selectedCategory={"inbox"} 
                    selectedProjectId={this.props.selectedProjectId}
                    selectedAreaId={this.props.selectedAreaId} 
                    todos={this.props.todos} 
                    selectedTodoId={this.props.selectedTodoId}
                    tags={this.props.tags} 
                    projects={this.props.projects}
                    rootRef={this.props.rootRef}  
                    todo={empty}
                    creation={true}
                />  
                <TodosList    
                    filters={[   
                        (todo:Todo) => not(byAttachedToArea(this.props.areas)(todo)), 
                        (todo:Todo) => not(byAttachedToProject(this.props.projects)(todo)), 
                        (todo:Todo) => isNil(todo.attachedDate), 
                        (todo:Todo) => isNil(todo.deadline), 
                        byCategory("inbox"), 
                        byNotCompleted,  
                        byNotDeleted 
                    ]}       
                    selectedAreaId={this.props.selectedAreaId}
                    selectedProjectId={this.props.selectedProjectId}
                    searched={this.props.searched}
                    areas={this.props.areas}
                    projects={this.props.projects}  
                    selectedTodoId={this.props.selectedTodoId}
                    isEmpty={(empty:boolean) => this.setState({empty})}
                    dispatch={this.props.dispatch}    
                    selectedCategory={"inbox"} 
                    selectedTag={this.props.selectedTag}  
                    rootRef={this.props.rootRef}
                    todos={this.props.todos}   
                    tags={this.props.tags} 
                /> 
            </div>
        </div> 
    }
} 