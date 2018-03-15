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
import BusinessCase from 'material-ui/svg-icons/content/archive';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import Checked from 'material-ui/svg-icons/navigation/check';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz'; 
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
import {  
    daysLeftMark, 
    generateTagElement, 
    attachDispatchToProps, 
    byNotDeleted, 
    findAttachedProject, 
    todoToKeywords,
    getTagsFromItems,
    byTags
} from '../utils/utils';
import { Todo, removeTodo, updateTodo,ObjectType, Area, Project, Heading } from '../database';
import { Store } from '../app'; 
import { ChecklistItem } from './TodoInput/TodoChecklist';
import { allPass, isNil, not, isEmpty, contains, flatten, prop, compose, any, intersection } from 'ramda';
import { Category, filter } from './MainContainer';
import { getProgressStatus } from './Project/ProjectLink';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import PieChart from 'react-minimal-pie-chart';
import { TodoInput } from './TodoInput/TodoInput';
import { Tags } from './Tags';
import { isArray, isString, isDate, isNotDate } from '../utils/isSomething';
import { chooseIcon } from '../utils/chooseIcon';
import { FadeBackgroundIcon } from './FadeBackgroundIcon';

let sortByCompletedOrNot = (a:Todo,b:Todo) => {
    if(isDate(a.completedSet) && isNotDate(b.completedSet)){
        return 1; 
    }else if(isDate(b.completedSet) && isNotDate(a.completedSet)){
        return -1; 
    }else{
        return 0;
    }
};


let getProjectHeading = (project:Project, todos:Todo[]) : JSX.Element => {

    let {done, left} = getProgressStatus(project, todos, false);
    let totalValue = (done+left)===0 ? 1 : (done+left);
    let currentValue = done;

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
                transform: "rotate(270deg)",
                alignItems: "center", 
                cursor:"default",
                justifyContent: "center",
                position: "relative" 
            }}>  
                <PieChart 
                    animate={false}    
                    totalValue={totalValue}
                    data={[{      
                        value:currentValue, 
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
            { isEmpty(project.name) ? "New Project" : project.name } 
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

/*
    shouldComponentUpdate(nextProps){
        return nextProps.searchQuery!==this.props.searchQuery;
    }   
*/   

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
                <div style={{padding:"5px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <SearchIcon style={{color:"rgb(100, 100, 100)",height:"20px",width:"20px"}}/>   
                </div>   
                <input 
                    style={{  
                      outline:"none",
                      border:"none", 
                      width:"100%", 
                      backgroundColor:"rgb(217,218,221)",
                      caretColor:"cornflowerblue"  
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
    limitReached:boolean;


    constructor(props){
        super(props);
        this.limitReached = false; 
        this.state = {limit:20};
    }    


    scrollTop = () => {
        let rootRef = document.getElementById("maincontainer");
        if(rootRef){ rootRef.scrollTop=0 }   
    }


    componentDidMount(){ this.scrollTop() }


    componentWillReceiveProps(nextProps:SearchProps){
        if(
            nextProps.todos!==this.props.todos ||
            nextProps.projects!==this.props.projects
        ){  
            this.limitReached = false;  
            this.setState({limit:20});  
        }else if(nextProps.searchQuery!==this.props.searchQuery){
            this.limitReached = false;  
            this.setState({limit:20}, () => this.scrollTop()); 
        }
    }
     
    /**
     * Limit search results from Repeat groups to n items from each group.
     * We sort todos by date, and then we walk through sorted todos,
     * collecting items for each group until n limit is exceeded for this particular group.
     */
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
    }; 



    getSuggestions = (todos:Todo[], projects:Project[], areas:Area[]) : {
        attached : { project:Project, todos:Todo[] }[],
        detached : Todo[] 
    } => { 
        let { searchQuery } = this.props;
        let limitGroups = this.limitGroups(3, todos);  
        let cutBy = (by:String, words:string[]) => words.map(word => word.substring(0,by.length));
        let table = {};
        let detached = []; 
        let attached = []; 
        let limitReached = true;
        let match = (searchKeywords:string[],keywords:string[]) => 
            any(
                (searchKeyword:string) => contains(searchKeyword)(cutBy(searchKeyword,keywords))
            )(searchKeywords); 



        for(let i=0; i<limitGroups.length; i++){

            if((attached.length + detached.length) > this.state.limit){ 
                limitReached = false;
                break; 
            }
        
            let todo = limitGroups[i];
            let keywords = todoToKeywords(todo); //lowercased and trimmed words from todo title + attachedTags
            let searchKeywords = searchQuery
                                 .trim()
                                 .toLowerCase()
                                 .split(' ')
                                 .filter(compose(not,isEmpty)); 
            
            if(match( searchKeywords , keywords )){
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
            } 
        }

        this.limitReached = limitReached;
         
        return {    
            attached:projects
                     .map((project:Project) => ({project, todos:table[project._id]}))
                     .filter(({project,todos}) => isNil(todos) ? false : !isEmpty(todos)),
            detached  
        } 
    };   


    
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

 

    suggestionToComponent = (
        projectWithTodos:{project:Project,todos:Todo[]}, 
        index:number, 
        attachedTodos:Todo[]
    ) => {
        let {areas, projects, dispatch} = this.props;
        let {project} = projectWithTodos;
         
        return <div key={`attached-${index}`}>
            <div>{getProjectHeading(project,attachedTodos)}</div>
            {
                projectWithTodos
                .todos
                .sort(sortByCompletedOrNot)
                .map(this.getTodoComponent)
            } 
        </div>  
    };  

    

    onEnter = ({ previousPosition, currentPosition }) => this.limitReached ? 
                                                         null : 
                                                         this.setState({limit:this.state.limit + 20});
 


    render(){
        let {todos, projects, areas, dispatch, selectedTag, groupTodos, selectedCategory} = this.props; 
        let noresults = { 
            fontSize:"18px",
            userSelect:"none",
            cursor:"default",
            height:`${window.innerHeight/2}px`,
            display:"flex",
            alignItems:"center",
            justifyContent:"center" 
        };  
      
        let selectedTodos = filter(todos, allPass([byNotDeleted,byTags(selectedTag)]));
        let selectedProjects = filter(projects, byNotDeleted);
        let selectedAreas = filter(areas, byNotDeleted);
        let suggestions = this.getSuggestions(selectedTodos,selectedProjects,selectedAreas);

        let ids = flatten(selectedProjects.map((p) => p.layout.filter(isString))) as string[];

        let attachedTodos = compose(
           (todos) => todos.sort(sortByCompletedOrNot),
           (todos) => filter(todos, (todo:Todo) => contains(todo._id)(ids))
        )(selectedTodos);

        let searchedTodos = flatten([suggestions.detached, suggestions.attached.map(i => i.todos)]);
        let tags = getTagsFromItems(searchedTodos); 

        return <div id={`${selectedCategory}-list`}>   
            <div style={{ display:"flex", position:"relative", alignItems:"center", marginBottom:"20px"}}>   
                <div style={{ zoom:"0.8", display:"flex", alignItems:"center" }}>
                    {chooseIcon({width:"45px", height:"45px"}, selectedCategory)}
                </div> 
                <div style={{  
                    fontFamily: "sans-serif",   
                    fontSize: "xx-large",
                    fontWeight: 600,
                    paddingLeft: "10px", 
                    cursor:"default" 
                }}>   
                    Search results 
                </div>  
            </div> 
            <div className="no-print" style={{paddingTop:"15px", paddingBottom:"15px"}}>
                <Tags  
                    selectTag={(tag) => dispatch({type:"selectedTag", load:tag})}
                    tags={tags} 
                    selectedTag={selectedTag}
                    show={true}  
                />  
            </div> 
            { 
                isEmpty(suggestions.attached) && 
                isEmpty(suggestions.detached) ? 
                <div className="no-print" style={noresults as any}>No results were found...</div> : 
                null
            }
            <div> 
            { 
                not(groupTodos) ?
                searchedTodos.sort(sortByCompletedOrNot).map(this.getTodoComponent) :
                <div>
                    <div> 
                        {
                            suggestions
                            .attached
                            .map((data,index) => this.suggestionToComponent(data,index,attachedTodos))
                        } 
                    </div>
                    <div style={{paddingTop:"20px"}}>
                        {
                            suggestions.detached 
                            .sort(sortByCompletedOrNot)
                            .map(this.getTodoComponent)   
                        }
                    </div>
                </div>
            }
            </div>
            <div className="no-print" style={{width:"100%", height:"1px"}}> 
                <Waypoint  
                    onEnter={this.onEnter} 
                    onLeave={({ previousPosition, currentPosition, event }) => {}}
                />
            </div>      
        </div>  
    }
}

