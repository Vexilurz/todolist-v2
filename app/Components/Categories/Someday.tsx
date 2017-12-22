import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { attachDispatchToProps, uppercase, insideTargetArea, chooseIcon } from "../../utils"; 
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { queryToTodos, getTodos, updateTodo, Todo, removeTodo, addTodo } from '../../database';
import Popover from 'material-ui/Popover';
import { Tags } from '../../Components/Tags';
import { Footer } from '../../Components/Footer';
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

  

 
interface SomedayProps{
    dispatch:Function,
    selectedTodoId:string,
    selectedTag:string,
    rootRef:HTMLElement,
    todos:Todo[],
    tags:string[]
} 
interface SomedayState{}



export class Someday extends Component<SomedayProps, SomedayState>{

    constructor(props){
        super(props);
    }

    render(){

        return <div>
             <ContainerHeader 
              selectedCategory={"someday"} 
              dispatch={this.props.dispatch} 
              tags={this.props.tags}
              selectedTag={this.props.selectedTag}
            /> 
   
            <div   
                className="unselectable" 
                id="todos" 
                style={{
                    marginBottom: "100px", 
                    marginTop:"50px" 
                }} 
            >    
                <TodosList 
                    dispatch={this.props.dispatch}  
                    selectedCategory={"someday"} 
                    selectedTag={this.props.selectedTag}  
                    rootRef={this.props.rootRef}
                    todos={this.props.todos}  
                    tags={this.props.tags} 
                /> 
            </div>

        </div>
    }

}