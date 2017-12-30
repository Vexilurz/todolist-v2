import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { attachDispatchToProps, uppercase, insideTargetArea, chooseIcon, byNotCompleted, byNotDeleted, getTagsFromItems, attachEmptyTodo } from "../../utils"; 
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { queryToTodos, getTodos, updateTodo, Todo, removeTodo, addTodo } from '../../database';
import Popover from 'material-ui/Popover';
import { Tags } from '../../Components/Tags';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Repeat from 'material-ui/svg-icons/av/repeat';
import { Store } from '../../App';
import Inbox from 'material-ui/svg-icons/content/inbox';
import Duplicate from 'material-ui/svg-icons/content/content-copy';
import ShareIcon from 'material-ui/svg-icons/social/share';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import { TextField } from 'material-ui';
import AutosizeInput from 'react-input-autosize';
import { ContainerHeader } from '.././ContainerHeader';
import { byTags, byCategory } from '../../utils';
import { TodosList } from '.././TodosList';
import { FadeBackgroundIcon } from '../FadeBackgroundIcon';
import { allPass, compose } from 'ramda';

  

 
interface SomedayProps{
    dispatch:Function,
    selectedCategory:string, 
    selectedTodoId:string,
    selectedTag:string,
    rootRef:HTMLElement,
    todos:Todo[],
    tags:string[]
} 


interface SomedayState{
    empty:boolean
} 


export class Someday extends Component<SomedayProps, SomedayState>{

    constructor(props){ 
        super(props);
        this.state={ 
            empty:false
        } 
    } 
 
    render(){

        let tags = compose(
            getTagsFromItems,
            (todos) => todos.filter(
                allPass([
                    byCategory("someday"),
                    byNotCompleted,  
                    byNotDeleted 
                ])  
            )
        )(this.props.todos); 
     
         
        return <div>
             <ContainerHeader 
                selectedCategory={"someday"} 
                dispatch={this.props.dispatch} 
                tags={tags}
                showTags={false} 
                selectedTag={this.props.selectedTag}
            />   
           
            <FadeBackgroundIcon    
                container={this.props.rootRef} 
                selectedCategory={"someday"}  
                show={this.state.empty}
            />    
    
            { 
                this.state.empty ? null :
                <div   
                    className="unselectable" 
                    id="todos" 
                    style={{
                        marginBottom: "100px", 
                        marginTop:"50px" 
                    }} 
                >    
                    <TodosList 
                        filters={[ 
                            byTags(this.props.selectedTag),
                            byCategory("someday"),
                            byNotCompleted, 
                            byNotDeleted 
                        ]}      
                        selectedTodoId={this.props.selectedTodoId} 
                        isEmpty={(empty:boolean) => this.setState({empty})} 
                        dispatch={this.props.dispatch}   
                        selectedCategory={"someday"}  
                        selectedTag={this.props.selectedTag}  
                        rootRef={this.props.rootRef}
                        todos={this.props.todos}  
                        tags={this.props.tags} 
                    /> 
                </div>  
            }   
        </div>
    }

}