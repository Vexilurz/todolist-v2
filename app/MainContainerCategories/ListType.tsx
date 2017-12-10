import '../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, uniq,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, any,
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, 
    groupBy, concat, flatten, toPairs, adjust, prepend, fromPairs 
} from 'ramda';
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import Popover from 'material-ui/Popover';
import Button from 'material-ui-next/Button'; 
import { Footer } from '../Components/Footer';
import { Tags } from '../Components/Tags';
import { Transition } from 'react-transition-group';
import { Category } from '../MainContainer';
import { TodosList } from '../Components/TodosList';
import { Todo } from '../databaseCalls';
  



interface ListTypeProps{
    dispatch:Function,
    selectedCategory:Category,
    showRightClickMenu:boolean,
    selectedTag:string,
    selectedTodoId:string,
    rootRef:HTMLElement,
    
    todos:Todo[],
    projects:any[],
    areas:any[],
    tags:string[],
    events:any[]
}
 

interface ListTypeState{}
 



  
export class ListType extends Component<ListTypeProps,ListTypeState>{

    constructor(props){ 
        super(props); 
        this.state={show:false}
    }
 

    openTodoInput = (e) => { 
        e.stopPropagation();
        if(this.props.rootRef) 
            this.props.rootRef.scrollTop = 0;  
 
    };    
 
     
    closeTodoInput = () => {
        if(this.props.rootRef) 
            this.props.rootRef.scrollTop = 0; 
    };    
     
 
    render(){ 
        return <div>
          {
            <div className="unselectable" id="todos" style={{
                marginBottom: "100px", marginTop:"50px"
            }}>
                <TodosList 
                    dispatch={this.props.dispatch}   
                    selectedCategory={this.props.selectedCategory}
                    selectedTodoId={this.props.selectedTodoId}
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



