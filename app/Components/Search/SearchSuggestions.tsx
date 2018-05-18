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
import { getSuggestions } from './getSuggestions';
import * as Waypoint from 'react-waypoint';
import Popover from 'material-ui/Popover';
import {  
    daysLeftMark, generateTagElement, attachDispatchToProps, 
    byNotDeleted, findAttachedProject, todoToKeywords,
    getTagsFromItems, byTags
} from '../../utils/utils'; 
import { Category, ChecklistItem, Todo, ObjectType, Area, Project, Heading, Store } from '../../types';
import { allPass, isNil, not, isEmpty, contains, flatten, prop, compose, any, intersection, defaultTo, all } from 'ramda';
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


interface SearchSuggestionsProps extends Store{
    indicators : { 
        [key:string]:{
            active:number,
            completed:number,
            deleted:number
        }; 
    }
}



interface SearchSuggestionsState{ limit:number }



@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)
export class SearchSuggestions extends Component<SearchSuggestionsProps,SearchSuggestionsState>{ 
    limitReached:boolean;
    initialLimit:number;

    constructor(props){
        super(props);
        this.initialLimit = 10;
        this.limitReached = false; 
        this.state = {limit:this.initialLimit};
    }


    componentWillReceiveProps(nextProps:SearchSuggestionsProps){
        if(
            nextProps.todos!==this.props.todos ||
            nextProps.projects!==this.props.projects
        ){  
            this.limitReached = false;  
            this.setState({limit:this.initialLimit});  
        }else if(nextProps.searchQuery!==this.props.searchQuery){
            this.limitReached = false;  
            this.setState({limit:this.initialLimit}); 
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

 

    suggestionToComponent = (
        projectWithTodos:{project:Project,todos:Todo[]}, 
        index:number, 
        attachedTodos:Todo[]
    ) => {
        let {areas, projects, dispatch} = this.props;
        let {project} = projectWithTodos;
         
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
                .sort(sortByCompletedOrNot)
                .map(this.getTodoComponent)
            } 
        </div>  
    };  
     

    
    onGetMoreResults = (e) => !this.limitReached ? this.setState({limit:this.state.limit + 5}) : null;
 


    search = () => {
        let {todos, projects, areas, dispatch, selectedTags, groupTodos, selectedCategory} = this.props; 
        let selectedTodos = filter(todos, allPass([byNotDeleted,byTags(selectedTags)]));
        let selectedProjects = filter(projects, byNotDeleted);
        let selectedAreas = filter(areas, byNotDeleted);
        let suggestions = getSuggestions(
            selectedTodos,
            selectedProjects,
            selectedAreas,
            this.props.searchQuery,
            this.state.limit
        );

        this.limitReached = suggestions.limitReached;
        let ids = flatten(selectedProjects.map((p) => p.layout.filter(isString))) as string[];

        let attachedTodos = compose(
            todos => todos.sort(sortByCompletedOrNot),
            todos => filter(todos, (todo:Todo) => contains(todo._id)(ids))
        )(selectedTodos);

        let searchedTodos = flatten([suggestions.detached, suggestions.attached.map(i => i.todos)]);

        return { suggestions, attachedTodos, searchedTodos };
    }; 



    render(){
        let { suggestions, searchedTodos, attachedTodos } = this.search();
        let tags = getTagsFromItems(searchedTodos); 



        return <div>  
            { 
                isEmpty(suggestions.attached) && 
                isEmpty(suggestions.detached) ? 
                <div style={{
                    fontSize:"15px",
                    userSelect:"none",
                    cursor:"default",
                    width:"100%",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center" 
                }}>No results were found...</div> : 
                null
            }
            <div> 

            { 
                not(this.props.groupTodos) ?
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


            <div 
                onClick={this.onGetMoreResults} 
                style={{
                    width:"100%",
                    fontSize:"15px",
                    userSelect:"none",
                    cursor:"default",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"flex-start" 
                }}
            > 
                <div style={{padding:"5px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <SearchIcon style={{color:"rgb(100, 100, 100)",height:"20px",width:"20px"}}/>   
                </div>  
                <div>Continue Search...</div>
            </div>      
        </div>  
    }

};