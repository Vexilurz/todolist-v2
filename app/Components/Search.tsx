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
import * as Waypoint from 'react-waypoint';
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
    todoToKeywords,
    uppercase,
    isArray
} from '../utils';
import { Todo, removeTodo, updateTodo, generateId, ObjectType, Area, Project, Heading } from '../database';
import { Store, isDev } from '../app'; 
import { ChecklistItem } from './TodoInput/TodoChecklist';
import { allPass, isNil, not, isEmpty, contains, flatten, uniqBy, prop } from 'ramda';
import { Category, filter } from './MainContainer';
import { ProjectLink, getProgressStatus } from './Project/ProjectLink';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import PieChart from 'react-minimal-pie-chart';
let fast = require('fast.js');  

   
let getTodoLink = (
    todo:Todo, project:Project, index:number, dispatch:Function
) : JSX.Element => {  
 
     let onTodoLinkClick = (e) => { 
         e.stopPropagation();
         dispatch({type:"selectedTag", load:"All"});

         dispatch({type:"selectedTodoId", load:todo._id});
         dispatch({type:"searched", load:true}); 
         dispatch({type:"updateTodo", load:{...todo}}); 
         
         if(!isNil(todo.deleted)){
            dispatch({type:"selectedCategory", load:"trash"});
         }else if(!isNil(todo.completed)){   
            dispatch({type:"selectedCategory", load:"logbook"});
         }else if(!isNil(project)){
            dispatch({type:"selectedProjectId", load:project._id});
            dispatch({type:"selectedCategory", load:"project"});
         }else{
            dispatch({type:"selectedCategory", load:todo.category});
         }
     }  
    
     return <div 
        key={`${todo._id}-${index}`} 
        style={{position:"relative", paddingTop:"2px", paddingBottom:"2px"}}
     >  
        <div   
            className="leftpanelmenuitem" 
            onClick = {onTodoLinkClick}    
            id = {todo._id}       
            style={{      
                overflowX:"hidden",
                padding:"6px",
                position:"relative",
                width:"100%", 
                height:"25px",
                display:"flex", 
                alignItems:"center"
            }}    
        >             
            <div style={{display:"flex", alignItems:"center"}}> 
                {chooseIcon({width:"20px", height:"20px"}, todo.group ? "group" : todo.category)}
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
                {todo.title} 
            </div>    
        </div> 
    </div>   
}  



let getProjectHeading = (project:Project, todos:Todo[]) : JSX.Element => {

    let {done, left} = getProgressStatus(project, todos);
    
    return <div   
        id = {project._id}        
        style={{    
            height:"30px",   
            paddingLeft:"6px", 
            paddingRight:"6px",  
            cursor:"default",
            width:"100%",
            display:"flex",  
            alignItems:"center", 
            overflowX:"hidden", 
            borderBottom:"1px solid rgba(100, 100, 100, 0.6)"
        }}
    >     
        <div style={{     
            marginLeft:"1px",
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
                    totalValue={done+left}
                    data={[{      
                        value:done, 
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
                cursor: "default",
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
           dispatch({type:"searchQuery", load:""}); 
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
interface SearchState{ limit:number }

@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)
export class Search extends Component<SearchProps,SearchState>{ 

    constructor(props){
        super(props);
        this.state = {limit:20};
    }   

      
    compare = (searchQuery:string, keyword:string) : boolean => {
        const inputValue = searchQuery.trim().toLowerCase();
        const inputLength = inputValue.length;

        return inputLength === 0 ? false : 
               inputValue === keyword.toLowerCase().slice(0, inputLength)
    } 


    scrollTop = () => {
        let rootRef = document.getElementById("maincontainer");
        if(rootRef){ rootRef.scrollTop=0 }   
    }


    componentDidMount(){ this.scrollTop() }


    componentWillReceiveProps(nextProps:SearchProps){
        if(nextProps.searchQuery!==this.props.searchQuery){  
           this.setState({limit:20}, () => this.scrollTop()) 
        }
    }
    

    limitGroups = (n:number, todos:Todo[]) : Todo[] => {
        let table = {};
        let result = [];

        let sorted = todos.sort(
            (a:Todo,b:Todo) => {
                let A = a.attachedDate;
                let B = b.attachedDate;

                if(isNil(A) || isNil(B)){ return 0 };

                return A.getTime()-B.getTime();
            }
        ) 

        for(let i=0; i<sorted.length; i++){ 
            let todo = todos[i];

            if(isNil(todo.group)){ result.push(todo) }
            else{
                let groupId = todo.group._id;
                let entry = table[groupId];

                if(isNil(entry)){
                    table[groupId] = 1;
                    result.push(todo);
                }else{
                    if(entry<n){  
                       table[groupId] = table[groupId] + 1; 
                       result.push(todo);   
                    }
                } 
            }
        }
 
        return result;
    } 


    getSuggestions = () : {
        attached : { project:Project, todos:Todo[] }[],
        detached : Todo[] 
    } => { 
        let { todos, projects, areas, searchQuery } = this.props;
        let limitGroups = this.limitGroups(3, todos);  

        let table = {};
        let detached = [];
        let attached = []; 

        for(let i=0; i<limitGroups.length; i++){

            if( (attached.length + detached.length) > this.state.limit ){ break }
        
            let todo = limitGroups[i];
            let keywords = todoToKeywords(todo);

            for(let j=0; j<keywords.length; j++){

                if(this.compare( searchQuery, keywords[j] )){
                   let project = projects.find((p) => contains(todo._id)(p.layout as any)); 

                   if(isNil(project)){ detached.push(todo) }
                   else{ 
                       attached.push(todo);

                       if(isNil(table[project._id])){
                          table[project._id] = [todo]; 
                       }else if(isArray(table[project._id])){ 
                          table[project._id].push(todo); 
                       }  
                   }
                   
                   break
                } 

            }
        }

        return {
            attached : projects
                       .map((project:Project) => ({ project, todos:table[project._id] }))
                       .filter(({project,todos}) => isNil(todos) ? false : !isEmpty(todos)),

            detached  
        } 
    }   
 

    suggestionToComponent = (
        projectWithTodos:{project:Project,todos:Todo[]}, 
        index:number, 
        attachedTodos:Todo[]
    ) => {
        let {areas, projects, dispatch} = this.props;
        let {project} = projectWithTodos;
         
        return <div>
            <div>{getProjectHeading(project,attachedTodos)}</div>
            <div>
            {
                uniqBy(prop("_id"))(projectWithTodos.todos)
                .map(
                    (todo:Todo,index:number) : JSX.Element => 
                        <div key={`searched-todo-${index}`}>
                            {getTodoLink(todo, project, index, dispatch)}
                        </div> 
                )
            } 
            </div>
        </div>  
    } 


    onEnter = ({ previousPosition, currentPosition }) => this.setState({limit:this.state.limit + 20})
 

    render(){ 
        let {projects, todos, areas, dispatch} = this.props;

        let suggestions = this.getSuggestions();

        let ids = flatten(projects.map((p) => p.layout.filter(isString))) as string[];

        let attachedTodos = filter(todos, (todo:Todo) => contains(todo._id)(ids), "area");

        let noresults = {
            fontSize:"18px",
            userSelect:"none",
            cursor:"default",
            height:`${window.innerHeight/2}px`,
            display:"flex",
            alignItems:"center",
            justifyContent:"center" 
        };  
 
        return <div>   
            <div 
                style={{  
                   fontSize:"xx-large",
                   paddingBottom:"10px",
                   fontWeight: 600,
                   textAlign:"center",
                   userSelect:"none",
                   cursor:"default" 
                }} 
            >    
                {uppercase("Search results")}
            </div>

            {
                isEmpty(suggestions.attached) && 
                isEmpty(suggestions.detached) ? 

                <div style={noresults as any}>No results were found...</div> : 
                null
            }

            {         
                suggestions.attached.map(
                    ( projectWithTodos:{ project:Project, todos:Todo[] }, index ) => 
                        <div 
                           style={{paddingTop:"5px", paddingBottom:"5px"}} 
                           key={`attached-${index}`} 
                        >
                              {this.suggestionToComponent(projectWithTodos,index,attachedTodos)} 
                        </div>  
                )  
            } 
 
            <div style={{paddingTop:"20px"}}>
            {
                uniqBy(prop("_id"))(suggestions.detached)
                .map(
                    (todo:Todo,index:number) : JSX.Element => 
                        <div key={`detached-${index}`}>
                            {getTodoLink(todo, undefined, index, dispatch)}
                        </div> 
                ) 
            }
            </div>
            

            <div style={{width:"100%", height:"1px"}}> 
                <Waypoint  
                    onEnter={this.onEnter} 
                    onLeave={({ previousPosition, currentPosition, event }) => {}}
                />
            </div>      
        </div> 
    }
}

