import '../../assets/styles.css';  
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
    getTagsFromItems,
    byTags,
    isNotEmpty,
    different
} from '../../utils/utils'; 
import { Category, ChecklistItem, Todo, ObjectType, Area, Project, Heading, Store } from '../../types';
import { 
    reject, allPass, isNil, not, isEmpty, contains, flatten, prop, identity,
    compose, any, intersection, defaultTo, all, evolve, map, ifElse 
} from 'ramda';
import { filter } from 'lodash'; 
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import PieChart from 'react-minimal-pie-chart';
import { TodoInput } from './../TodoInput/TodoInput';
import { Tags } from './../Tags';
import { isArray, isString, isDate, isNotDate } from '../../utils/isSomething';
import { chooseIcon } from '../../utils/chooseIcon';
import { FadeBackgroundIcon } from './../FadeBackgroundIcon';
import { isDev } from '../../utils/isDev';
import { assert } from '../../utils/assert';
import { sortByCompletedOrNot } from './sortByCompletedOrNot';
import { getProjectHeading } from './getProjectHeading';
import { limitGroups } from './limitGroups';
import { getSuggestions } from './getSuggestions';



interface SearchProps extends Store{
    indicators : { 
        [key:string]:{
            active:number,
            completed:number,
            deleted:number
        }; 
    }
}



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

 

    suggestionToComponent = (projectWithTodos:{project:Project,todos:Todo[]}, index:number) => {
        let {areas, projects, dispatch} = this.props;
        let {project} = projectWithTodos;

        if(isEmpty(projectWithTodos.todos)){ return null }
         
        return <div key={`attached-${index}`}>
            <div>
            {
                getProjectHeading(
                    project,
                    defaultTo({completed:0, active:0})(this.props.indicators[project._id])
                )
            } 
            </div>
            {
                projectWithTodos
                .todos
                .sort((a:Todo,b:Todo) => a.priority-b.priority)
                .sort(sortByCompletedOrNot)
                .map(this.getTodoComponent)
            } 
        </div>  
    };  

    

    onEnter = ({ previousPosition, currentPosition }) => this.limitReached ? 
                                                         null : 
                                                         this.setState({limit:this.state.limit + 20});
 


    render(){
        let emptyTodos = compose(isEmpty, prop('todos'));
        let {todos, projects, areas, dispatch, selectedTags, groupTodos, selectedCategory} = this.props;         
        let suggestions = getSuggestions(todos,projects,areas,this.props.searchQuery,this.state.limit);
        let selectedTodos = flatten([suggestions.detached,suggestions.attached.map(i => i.todos)]);
        let tags = getTagsFromItems(selectedTodos);
        let empty = false;
        this.limitReached = suggestions.limitReached;
        let elements = ifElse(
            identity,
            () => {
                let attached = suggestions
                                .attached
                                .map( evolve({todos:todos => todos.filter(byTags(selectedTags))}) )
                                .map( (data:any,index) => this.suggestionToComponent(data,index) );

                let detached = suggestions
                                .detached
                                .sort((a:Todo,b:Todo) => a.priority-b.priority)
                                .sort(sortByCompletedOrNot)
                                .filter(byTags(selectedTags))
                                .map(this.getTodoComponent);   
            
                empty = isEmpty(attached) && isEmpty(detached);

                return <div>
                <div>{attached}</div>
                <div style={{paddingTop:"20px"}}>{detached}</div>
                </div>
            },
            
            () => {
                let items = selectedTodos
                .sort((a:Todo,b:Todo) => a.priority-b.priority)
                .sort(sortByCompletedOrNot)
                .filter(byTags(selectedTags));

                empty = isEmpty(items);

                return items.map(this.getTodoComponent); 
            }
        )(groupTodos);



        return <div id={`${selectedCategory}-list`}>   
            <div style={{ display:"flex", position:"relative", alignItems:"center", marginBottom:"20px"}}>   
                <div style={{ zoom:"0.8", display:"flex", alignItems:"center" }}>
                    {chooseIcon({width:"45px", height:"45px"}, selectedCategory)}
                </div> 
                <div style={{  
                    fontFamily: "sans-serif",   
                    fontSize: "xx-large",
                    whiteSpace: "nowrap",
                    overflowX: "hidden",
                    fontWeight: 600,
                    paddingLeft: "10px", 
                    cursor: "default" 
                }}>   
                    {`Search results${isEmpty(selectedTags) ? '' : '#'+selectedTags.join('/')}`} 
                </div>  
            </div> 
            <div className="no-print" style={{paddingTop:"15px", paddingBottom:"15px"}}>
                <Tags  
                    selectTags={tags => dispatch({type:"selectedTags", load:tags})}
                    tags={tags} 
                    selectedTags={selectedTags}
                    show={true}  
                />  
            </div> 
            { 
                empty ? 
                <div 
                    className="no-print" 
                    style={{
                        fontSize:"18px", userSelect:"none", cursor:"default", 
                        display:"flex", alignItems:"center", justifyContent:"center" 
                    }}
                >
                    No results were found...
                </div> : 
                null
            }
            <div>{elements}</div>
            <div className="no-print" style={{width:"100%", height:"1px"}}> 
                <Waypoint  
                    onEnter={this.onEnter} 
                    onLeave={({ previousPosition, currentPosition, event }) => {}}
                />
            </div>      
        </div>  
    }
}

