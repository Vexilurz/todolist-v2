import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';   
import { Component } from "react";  
import { connect } from "react-redux";
import { attachDispatchToProps, byTags } from '../../utils/utils'; 
import { Todo, Store } from '../../types';
import { TodoInput } from './../TodoInput/TodoInput';
import { chooseIcon } from '../../utils/chooseIcon';
import { sortByCompletedOrNot } from '../Search/sortByCompletedOrNot';

interface TagProps extends Store{}
interface TagState{}
//@ts-ignore
@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)
export class Tag extends Component<TagProps,TagState>{ 

    constructor(props){ super(props); }    



    scrollTop = () => {
        let rootRef = document.getElementById("maincontainer");
        if(rootRef){ rootRef.scrollTop=0 }   
    }



    componentDidMount(){ this.scrollTop() }


    
    getTodoComponent = (todo:Todo,index:number) : JSX.Element => {
        return <div key={`todo-${index}`}>
            <TodoInput        
                id={todo._id} 
                key={todo._id} 
                moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                scrolledTodo={this.props.scrolledTodo}
                groupTodos={this.props.groupTodos}
                projects={this.props.projects}  
                dispatch={this.props.dispatch}  
                selectedProjectId={this.props.selectedProjectId}
                selectedAreaId={this.props.selectedAreaId} 
                selectedCategory={this.props.selectedCategory} 
                rootRef={document.getElementById("maincontainer")}  
                todo={todo} 
            />   
        </div>
    };



    render(){
        let {todos, selectedTags, selectedCategory} = this.props;  
        let items = todos
        .sort((a:Todo,b:Todo) => a.priority-b.priority)
        .sort(sortByCompletedOrNot)
        .filter(byTags(selectedTags));



        return <div id={`${selectedCategory}-list`}>   
            <div style={{display:"flex", position:"relative", alignItems:"center", marginBottom:"20px"}}>   
                <div style={{zoom:"0.8", display:"flex", alignItems:"center"}}>
                    {chooseIcon({width:"45px", height:"45px"}, selectedCategory)}
                </div> 
                <div style={{  
                    fontFamily:"sans-serif",   
                    fontSize:"xx-large",
                    whiteSpace:"nowrap",
                    overflowX:"hidden",
                    fontWeight:600,
                    paddingLeft:"10px", 
                    cursor:"default" 
                }}>   
                    {selectedTags[0]} 
                </div>  
            </div> 
            {items.map(this.getTodoComponent)}
        </div>  
    }
}

