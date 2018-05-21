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
    getTagsFromItems, byTags, typeEquals, isNotEmpty
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
import { isArray, isString, isDate, isNotDate, isCategory, isNotNil } from '../../utils/isSomething';
import { chooseIcon } from '../../utils/chooseIcon';
import { FadeBackgroundIcon } from './../FadeBackgroundIcon';
import { isDev } from '../../utils/isDev';
import { assert } from '../../utils/assert';
import { sortByCompletedOrNot } from './sortByCompletedOrNot';
import { getProjectHeading } from './getProjectHeading';
import { getQuickFindSuggestions } from './getQuickFindSuggestions';
import { locateItem } from './locateItem'; 
import { getSearchItemType } from './getSearchItemType';
import NewAreaIcon from 'material-ui/svg-icons/content/content-copy'; 
import { Checkbox } from '../TodoInput/Checkbox';
import { uppercase } from '../../utils/uppercase';
import { AutoresizableText } from '../../Components/AutoresizableText';
import Truncate from 'react-truncate';

let ContinueSearchButton = (onClick:(e) => void, show:boolean) => !show ? null :
<div 
    onClick={onClick} 
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
        paddingLeft: "13px",
        paddingRight: "0px",
        display:"flex",
        alignItems:"center",
        justifyContent:"center"
    }}>
    <SearchIcon style={{color:"rgb(100, 100, 100)",height:"20px",width:"20px"}}/>   
    </div>  
    <div style={{paddingLeft:"1px"}}>Continue Search...</div>
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
}}>
    No results were found...
</div> 



let SearchAppearances = (
    indicators: { [key:string]:{active:number,completed:number,deleted:number}; }
) => ({
    "todo" : (todo:Todo) : JSX.Element => {
        return <div className={'leftpanelmenuitem'} style={{overflow:"hidden", display:"flex", padding:"2px",  alignItems:"center", cursor:"pointer"}}>
            <div style={{paddingLeft:"2px"}}>
                <Checkbox checked={isNotNil(todo.completed)} onClick={() => { }}/>
            </div>
            <div style={{width:"170px", paddingLeft:"7px"}}>
            <AutoresizableText
                text={uppercase(todo.title)}
                width={0}
                placeholder=""
                fontSize={15}
                style={{}}
                offset={0} 
                placeholderStyle={{}}
            />
            </div>
        </div>
    },
    "project" : (project:Project) => {
        let indicator = defaultTo({completed:0, active:0})(indicators[project._id]);
        let done = indicator.completed;
        let left = indicator.active;
        let totalValue = (done+left)===0 ? 1 : (done+left);
        let currentValue = done;

        return <div className={'leftpanelmenuitem'} style={{overflow:"hidden", display:"flex",  padding:"2px", alignItems:"center", cursor:"pointer"}}>
            <div style={{     
                width:"18px",
                height:"18px",
                position:"relative",
                transform:"rotate(270deg)",
                borderRadius:"100px",
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                border:"1px solid rgba(100, 100, 100, 0.7)",
                boxSizing:"border-box" 
            }}> 
                <div style={{
                    width:"18px",
                    height:"18px",
                    display:"flex",
                    alignItems:"center", 
                    justifyContent:"center",
                    position:"relative" 
                }}>  
                    <PieChart 
                        animate={false}    
                        totalValue={totalValue}
                        data={[{value:currentValue, key:1, color:"rgba(100, 100, 100, 0.7)"}]}    
                        style={{  
                            color:"rgba(100, 100, 100, 0.7)",
                            width:"12px",
                            height:"12px",
                            position:"absolute",
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center"  
                        }}
                    />     
                </div>
            </div> 
            <div style={{width:"170px", paddingLeft:"5px", paddingRight:"5px"}}>
            <AutoresizableText
                text={uppercase(project.name)}
                width={0}
                placeholder=""
                fontSize={15}
                style={{}}
                offset={0} 
                placeholderStyle={{}}
            />
            </div>
        </div>
    },
    "area" : (area:Area) => {
        return <div className={'leftpanelmenuitem'} style={{overflow:"hidden", display:"flex",  padding:"2px", alignItems:"center", cursor:"pointer"}}>
            <div>
                <NewAreaIcon style={{width:"20px",height:"20px",color:"rgba(100, 100, 100, 0.7)"}}/> 
            </div>    
            <div style={{width:"170px", fontWeight:"bold", paddingLeft:"2px", paddingRight:"5px"}}>
            <AutoresizableText
                text={uppercase(area.name)}
                width={0}
                placeholder=""
                fontSize={15}
                style={{}}
                offset={0} 
                placeholderStyle={{}}
            />
            </div>
        </div>
    },
    "tag" : (tag:string) => {
        return <div className={'leftpanelmenuitem'} style={{overflow:"hidden", display:"flex",  padding:"2px", alignItems:"center", cursor:"pointer"}}>
            <div style={{width:"20px", height:"20px"}}>
                <TriangleLabel style={{width:"20px",height:"20px",color:"rgba(100, 100, 100, 0.7)"}}/> 
            </div>    
            <div style={{width:"170px", paddingLeft:"2px", paddingRight:"5px"}}>
            <AutoresizableText
                text={uppercase(tag)} 
                width={0}
                placeholder="" 
                fontSize={15}
                style={{}}
                offset={0} 
                placeholderStyle={{}}
            />
            </div>
        </div> 
    },
    "category" : (category:Category) =>  {
        return <div className={'leftpanelmenuitem'} style={{overflow:"hidden", display:"flex", padding:"2px", alignItems:"center", cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center"}}>
               { chooseIcon({width:'20px',height:'20px'}, category) }
            </div>
            <div style={{fontWeight:"bold",paddingLeft:"1px",fontSize:"15px",paddingRight:"5px"}}>
               { uppercase(category) }
            </div>
        </div>
    }
});



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



@connect((store,props) => ({...store,...props}), attachDispatchToProps)
export class SearchSuggestions extends Component<SearchSuggestionsProps,SearchSuggestionsState>{ 
    limitReached:boolean;
    initialLimit:number;



    constructor(props){
        super(props);
        this.initialLimit = 3;
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
    };



    suggestionToComponent = (byProject:any, byArea:any) => (item:any, index:number) => {
        let {areas, projects, dispatch} = this.props;
        let type = getSearchItemType(item);
        let action = locateItem(this.props.filters)(item); 
        let appearance = SearchAppearances(this.props.indicators)[type](item);

        return <div key={`item-${index}`}>
            <div onClick={e => this.props.dispatch(action)}>
            {
                appearance
            }
            </div>
        </div>   
    };  
     

    
    onGetMoreResults = (e) => !this.limitReached ? this.setState({limit:this.state.limit + 3}) : null;
 


    render(){
        let {todos, projects, areas, dispatch, selectedTags, groupTodos, selectedCategory} = this.props;


        let suggestions = getQuickFindSuggestions(
            todos, projects, areas,
            getTagsFromItems(todos),
            this.props.searchQuery,
            this.state.limit
        );


        let items = flatten([
            suggestions.areas,
            suggestions.tags,
            suggestions.categories,
            suggestions.projects,
            suggestions.todos.sort(sortByCompletedOrNot)
        ]);


        return <div style={{overflow:"hidden"}}>  
            { NoResultsLabel(isEmpty(items)) }
            <div> 
            { 
                <div>
                    <div style={{paddingLeft:"10px",paddingRight:"10px"}}>
                    { items.map( this.suggestionToComponent(suggestions.byProject,suggestions.byArea) ) }
                    </div>
                </div>
            }
            </div>
            { ContinueSearchButton(this.onGetMoreResults, isNotEmpty(items)) }     
        </div>  
    }
};


