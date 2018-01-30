import '../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';   
import { ipcRenderer } from 'electron'; 
import IconButton from 'material-ui/IconButton';  
import { Component } from "react";  
import { Provider, connect } from "react-redux";
import Chip from 'material-ui/Chip';  
import Star from 'material-ui/svg-icons/toggle/star';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import CheckBoxEmpty from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import CheckBox from 'material-ui/svg-icons/toggle/check-box'; 
import BusinessCase from 'material-ui/svg-icons/places/business-center';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import Checked from 'material-ui/svg-icons/navigation/check';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz'; 
import Layers from 'material-ui/svg-icons/maps/layers';
import Adjustments from 'material-ui/svg-icons/image/tune';
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Plus from 'material-ui/svg-icons/content/add'; 
import Trash from 'material-ui/svg-icons/action/delete';
import SearchIcon from 'material-ui/svg-icons/action/search'; 
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Calendar from 'material-ui/svg-icons/action/date-range';
import Logbook from 'material-ui/svg-icons/av/library-books';
import Clear from 'material-ui/svg-icons/content/clear';
import List from 'material-ui/svg-icons/action/list';
import Reorder from 'material-ui/svg-icons/action/reorder';  
let uniqid = require("uniqid");  
import Popover from 'material-ui/Popover';
import { TextField } from 'material-ui'; 
import {  
    insideTargetArea, todoChanged, 
    daysLeftMark, generateTagElement, 
    attachDispatchToProps, chooseIcon, 
    stringToLength,  
    isItem,
    byNotDeleted, 
    findAttachedArea,
    findAttachedProject, 
    assert,
    isString,
    debounce,
    todoToKeywords
} from '../utils';
import { Todo, removeTodo, updateTodo, generateId, ObjectType, Area, Project, Heading } from '../database';
import { Store, isDev } from '../app'; 
import { ChecklistItem } from './TodoInput/TodoChecklist';
import { allPass, isNil, not, isEmpty, contains } from 'ramda';
import { Category } from './MainContainer';
import { ProjectLink } from './Project/ProjectLink';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import PieChart from 'react-minimal-pie-chart';
let fast = require('fast.js');  

   
let getTodoLink = (
    todo:Todo, areas:Area[], projects:Project[], index:number, dispatch:Function
) : JSX.Element => {  

     let onTodoLinkClick = (e) => { 
         e.stopPropagation();

         let attachedProject = findAttachedProject(projects)(todo);

         dispatch({type:"selectedTodoId", load:todo._id});
         dispatch({type:"searched", load:true}); 
         dispatch({type:"updateTodo", load:{...todo}}); 
                    
         if(todo.checked && todo.completed){   
            dispatch({type:"selectedCategory", load:"logbook"});
         }else if(!isNil(attachedProject)){
            dispatch({type:"selectedProjectId", load:attachedProject._id});
            dispatch({type:"selectedCategory", load:"project"});
         }else{
            dispatch({type:"selectedCategory", load:todo.category});
         }

         dispatch({type:"selectedTag", load:"All"});
     } 
    
     return <div 
        key={`${todo._id}-${index}`} 
        style={{position:"relative"}}
     >  
        <div   
            className="leftpanelmenuitem" 
            onClick = {onTodoLinkClick}    
            id = {todo._id}       
            style={{      
                padding:"6px",
                position:"relative",
                height:"25px",
                display:"flex", 
                alignItems:"center"
            }}   
        >             
                <div style={{height:"20px"}}> 
                    {chooseIcon({width:"20px", height:"20px"}, todo.category)}
                </div>  
                <div    
                    id={todo._id}   
                    style={{  
                      fontSize: "15px",
                      cursor: "default",
                      paddingLeft: "5px",
                      WebkitUserSelect: "none",
                      fontWeight: "bolder",
                      color: "rgba(0, 0, 0, 0.8)"
                    }}  
                >  
                    {stringToLength(todo.title, 25)}
                </div>    
        </div> 
    </div>   
}  




let getProjectHeading = (project) => {

    return <div   
        id = {project._id}        
        style={{    
            height:"30px",   
            paddingLeft:"6px", 
            paddingRight:"6px",  
            cursor:"default",
            width:"100%",
            display:"flex",  
            alignItems:"center" 
        }}
    >     
        <div style={{    
            marginLeft:"18px",
            width:"18px",
            height:"18px",
            position: "relative",
            borderRadius: "100px",
            display: "flex",
            justifyContent: "center",
            cursor:"default",
            alignItems: "center",
            border: "1px solid rgb(108, 135, 222)",
            boxSizing: "border-box" 
        }}> 
            <div style={{
                width: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center", 
                cursor:"default",
                justifyContent: "center",
                position: "relative" 
            }}>  
                <PieChart 
                    animate={false}    
                    totalValue={0}
                    data={[{      
                        value:0, 
                        key:1,  
                        color:"rgb(108, 135, 222)" 
                    }]}    
                    style={{  
                        color: "rgb(108, 135, 222)",
                        width: "12px",
                        height: "12px",
                        position: "absolute",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"  
                    }}
                />     
            </div>
        </div> 
        <div   
            id = {project._id}   
            style={{   
                fontFamily: "sans-serif",
                fontSize: "15px",    
                cursor: "pointer",
                paddingLeft: "5px", 
                WebkitUserSelect: "none",
                fontWeight: "bolder", 
                color: "rgba(0, 0, 0, 0.8)" 
            }}
        >    
            { project.name.length==0 ? "New Project" : project.name } 
        </div> 
    </div>
}



interface SearchInputProps{
    dispatch:Function,
    searchQuery:string  
}  


interface SearchInputState{}  
 

export class SearchInput extends Component<SearchInputProps,SearchInputState>{
 

    constructor(props){ 
        super(props)
    } 
    
    onChange = (e) => { 
        let {dispatch} = this.props; 
        
        if(isEmpty(e.target.value)){
            dispatch({type:"searchQuery", load:null});
            dispatch({type:"selectedCategory", load:"inbox"});
        }else{ 
            dispatch({type:"searchQuery", load:e.target.value});
            dispatch({type:"selectedCategory", load:"search"});
        }       
    }
      
    render(){  
        return <div 
            style={{   
                zIndex:30000,
                borderRadius:"5px",
                position:"relative",
                WebkitUserSelect:"none",  
                maxHeight:"30px",
                overflowY:"visible",
                padding:"10px"  
            }}  
        >       
            <div style={{
                backgroundColor:"rgb(217, 218, 221)", 
                borderRadius:"5px",
                display:"flex",
                height:"30px",  
                alignItems:"center"
            }}>  
                <div style={{
                    padding:"5px",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center"
                }}>
                    <SearchIcon 
                        style={{   
                            color:"rgb(100, 100, 100)",
                            height:"20px",
                            width:"20px"
                        }}
                    />   
                </div>   
                <input 
                    style={{  
                        outline: "none",
                        border: "none", 
                        width: "100%", 
                        backgroundColor: "rgb(217,218,221)",
                        caretColor: "cornflowerblue"  
                    }} 
                    placeholder="Quick Find" 
                    type="text" 
                    name="search"  
                    value={this.props.searchQuery} 
                    onChange={this.onChange}
                />
            </div>   
        </div>
    }
}




interface SearchProps extends Store{}
interface SearchState{}

@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)
export class Search extends Component<SearchProps,SearchState>{ 
    limit:number;

    constructor(props){
        super(props);
        this.limit = 100;
    }   

      
    compare = (searchQuery:string, keyword:string) : boolean => {
        const inputValue = searchQuery.trim().toLowerCase();
        const inputLength = inputValue.length;

        return inputLength === 0 ? false : 
               inputValue === keyword.toLowerCase().slice(0, inputLength)
    } 


    getSuggestions = () : { project:Project, todos:Todo[] }[] => {
        let suggestions = [];
        let byProject = []; 
        let {todos, projects, areas, searchQuery} = this.props;

        for(let i=0; i<todos.length; i++){
            if( suggestions.length > this.limit ){ break }

            let todo = todos[i];
            let keywords = todoToKeywords(todo);

            for(let j=0; j<keywords.length; j++){
                if(this.compare(searchQuery, keywords[j])){ suggestions.push(todo) }
            }
        }

        for(let i=0; i<projects.length; i++){
            let project = projects[i];
            let ids = project.layout.filter(isString) as string[];
            let content : Todo[] = fast.filter(suggestions, (todo:Todo) => contains(todo._id)(ids)); 

            if(!isEmpty(content)){ byProject.push({project,todos:content}) }
        } 
 
        return byProject;  
    }   
 

    suggestionToComponent = (projectWithTodos:{project:Project,todos:Todo[]}, index:number) => {
        let {areas, projects, dispatch} = this.props;
        let {project,todos} = projectWithTodos;
         
        return <div>
            <div>{getProjectHeading(project)}</div>
            <div>
            {
                todos.map(
                    (todo:Todo,index:number) : JSX.Element => 
                        <div key={`suggestion-${index}`}>
                            {getTodoLink(todo, areas, projects, index, dispatch)}
                        </div>
                )
            }
            </div>
        </div>  
    } 
 

    render(){ 
        let suggestions = this.getSuggestions();
        return <div> 
        {         
            suggestions.map(
                (
                    projectWithTodos:{ project:Project, todos:Todo[] },
                    index
                ) => <div key={`suggestion-${index}`}>{this.suggestionToComponent(projectWithTodos, index)}</div> 
            ) 
        }        
        </div> 
    }
}

