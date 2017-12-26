import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import { Component } from "react";  
import { Todo } from '../../database';
import { TodosList } from '.././TodosList';
import { ContainerHeader } from '.././ContainerHeader';
import { byTags, byCategory, byNotCompleted, byNotDeleted, getTagsFromItems } from '../../utils';
import { FadeBackgroundIcon } from '../FadeBackgroundIcon';
import { compose, filter, allPass } from 'ramda';

 
 
interface InboxProps{
    dispatch:Function,
    selectedTodoId:string, 
    selectedTag:string,
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


    shouldComponentUpdate(nextProps:InboxProps,nextState:InboxState){

        let should = false;

        if(this.props.selectedTodoId!==nextProps.selectedTodoId)
           should = true;

        if(this.props.selectedTag!==nextProps.selectedTag)
           should = true; 

        if(this.props.rootRef!==nextProps.rootRef)
           should = true;

        if(this.props.todos!==nextProps.todos)
           should = true;

        if(this.props.tags!==nextProps.tags)
           should = true;

        return should; 
        
    }
 

    render(){
    
        let tags = compose(
            getTagsFromItems,
            (todos) => todos.filter(
                allPass([
                    byCategory("inbox"),
                    byNotCompleted,  
                    byNotDeleted 
                ])  
            )
        )(this.props.todos);


        return <div>  
            <ContainerHeader 
              selectedCategory={"inbox"} 
              dispatch={this.props.dispatch}  
              tags={tags}
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
                style={{
                    marginBottom: "100px", 
                    marginTop:"50px" 
                }} 
            >  
                <TodosList   
                    filters={[  
                        byTags(this.props.selectedTag),
                        byCategory("inbox"),
                        byNotCompleted,  
                        byNotDeleted 
                    ]}   
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