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

    byTags = (todo:Todo) : boolean => { 
        if(this.props.selectedCategory==="inbox" || this.props.selectedCategory==="someday")
           return true;  

        if(isNil(todo))
            return false;
        if(this.props.selectedTag==="All") 
            return true;    

        return contains(this.props.selectedTag,todo.attachedTags);
    } 


    byCategory = (todo:Todo) : boolean => { 
       if(isNil(todo))
           return false; 

       if(this.props.selectedCategory==="anytime")
          return true;
              
       return todo.category===this.props.selectedCategory;
    } 

     
 
    render(){ 
        let todos = compose(  
            filter(this.byTags),
            filter(this.byCategory)
        )(this.props.todos)
 
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
                    todos={todos} 
                    tags={this.props.tags} 
                /> 
            </div> 
          } 
        </div>
    }


}



