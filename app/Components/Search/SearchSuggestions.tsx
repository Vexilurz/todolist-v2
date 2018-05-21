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
    byNotDeleted, findAttachedProject,
    getTagsFromItems, byTags, typeEquals
} from '../../utils/utils'; 
import { 
    Category, ChecklistItem, Todo, ObjectType, 
    Area, Project, Heading, Store, action 
} from '../../types';
import { 
    values, allPass, isNil, not, isEmpty, contains, flatten, prop, 
    compose, any, intersection, defaultTo, all, cond, always 
} from 'ramda';
import { filter } from 'lodash'; 
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import PieChart from 'react-minimal-pie-chart';
import { TodoInput } from './../TodoInput/TodoInput';
import { Tags } from './../Tags';
import { isArray, isString, isDate, isNotDate, isCategory } from '../../utils/isSomething';
import { chooseIcon } from '../../utils/chooseIcon';
import { FadeBackgroundIcon } from './../FadeBackgroundIcon';
import { isDev } from '../../utils/isDev';
import { assert } from '../../utils/assert';
import { sortByCompletedOrNot } from './sortByCompletedOrNot';
import { getProjectHeading } from './getProjectHeading';
import { getQuickFindSuggestions } from './getQuickFindSuggestions';
import { locateItem } from './locateItem'; 
import { getSearchItemType } from './getSearchItemType';



let ContinueSearchButton = (onClick:(e) => void, show:boolean) => !show ? null :
<div 
    onClick={this.onGetMoreResults} 
    style={{
        width:"100%",
        fontSize:"15px",
        userSelect:"none",
        cursor:"pointer",
        display:"flex",
        alignItems:"center",
        justifyContent:"flex-start" 
    }}
> 
    <div style={{
        paddingTop:"5px",
        paddingBottom:"5px",
        paddingLeft: "10px",
        paddingRight: "5px",
        display:"flex",
        alignItems:"center",
        justifyContent:"center"
    }}>
    <SearchIcon style={{color:"rgb(100, 100, 100)",height:"20px",width:"20px"}}/>   
    </div>  
    <div>Continue Search...</div>
</div> 



let NoResultsLabel = (show:boolean) => !show ? null : 
<div style={{
    fontSize:"15px",
    userSelect:"none",
    cursor:"default",
    width:"100%",
    display:"flex",
    alignItems:"center",
    justifyContent:"center" 
}}>No results were found...</div> 



let SearchAppearances = {
    "todo" : (todo:Todo) : JSX.Element => <div> </div>,
    "project" : (project:Project) => <div> </div>,
    "area" : (area:Area) => <div> </div>,
    "tag" : (tag:string) => <div> </div>,
    "category" : (category:string) => <div> </div>
};



interface SearchSuggestionsProps extends Store{
    filters:{
        inbox:((todo:Todo) => boolean)[],
        today:((todo:Todo) => boolean)[],
        hot:((todo:Todo) => boolean)[],
        next:((todo:Todo) => boolean)[],
        someday:((todo:Todo) => boolean)[],
        upcoming:((todo:Todo) => boolean)[],
        logbook:((todo:Todo) => boolean)[],
        trash:((todo:Todo) => boolean)[]
    },
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
            nextProps.projects!==this.props.projects ||
            nextProps.areas!==this.props.areas
        ){  
            this.limitReached = false;  
            this.setState({limit:this.initialLimit});  
        }else if(nextProps.searchQuery!==this.props.searchQuery){
            this.limitReached = false;  
            this.setState({limit:this.initialLimit}); 
        }
    }



    suggestionToComponent = (byProject:any, byArea:any) => (item:any, index:number) => {
        let {areas, projects, dispatch} = this.props;
        let type = getSearchItemType(item);
        let action = locateItem(this.props.filters); 
        let appearance = SearchAppearances[type](item);

        return <div key={`item-${index}`}>
            <div onClick={e => this.props.dispatch(action)}>
            {
                appearance
            }
            </div>
        </div>  
    };  
     

    
    onGetMoreResults = (e) => !this.limitReached ? this.setState({limit:this.state.limit + 5}) : null;
 


    render(){
        let {todos, projects, areas, dispatch, selectedTags, groupTodos, selectedCategory} = this.props;

        let suggestions = getQuickFindSuggestions(
            todos,
            projects,
            areas,
            getTagsFromItems(todos),
            this.props.searchQuery,
            this.state.limit
        );

        let empty = compose(all(isEmpty),values)(suggestions);

        let items = flatten([
            suggestions.areas,
            suggestions.projects,
            suggestions.todos.sort(sortByCompletedOrNot),
            suggestions.categories,
            suggestions.tags
        ]);

        return <div>  
            { NoResultsLabel(empty) }
            <div> 
            { 
                <div>
                    <div style={{paddingTop:"20px"}}>
                        {
                            items.map(
                               this.suggestionToComponent(suggestions.byProject,suggestions.byArea)
                            )
                        }
                    </div>
                </div>
            }
            </div>
            { ContinueSearchButton(this.onGetMoreResults, !empty) }     
        </div>  
    }
};


