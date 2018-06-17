import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';   
import { Component } from "react";  
import { connect } from "react-redux";
import SearchIcon from 'material-ui/svg-icons/action/search'; 
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import { attachDispatchToProps, getTagsFromItems, different } from '../../utils/utils'; 
import { Category, Todo, Area, Project, Store } from '../../types';
import { isEmpty, flatten, defaultTo, toLower } from 'ramda';
import PieChart from 'react-minimal-pie-chart';
import { isNotNil } from '../../utils/isSomething';
import { chooseIcon } from '../../utils/chooseIcon';
import { sortByCompletedOrNot } from './sortByCompletedOrNot';
import { getQuickFindSuggestions } from './getQuickFindSuggestions';
import { locateItem } from './locateItem'; 
import { getSearchItemType } from './getSearchItemType';
import NewAreaIcon from 'material-ui/svg-icons/content/content-copy'; 
import { Checkbox } from '../TodoInput/Checkbox';
import { uppercase } from '../../utils/uppercase';
import { AutoresizableText } from '../../Components/AutoresizableText';

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



let SearchAppearances = (indicators:{
    [key:string]:{active:number,completed:number,deleted:number};
}) => ({
    "todo" : (todo:Todo) : JSX.Element => <div 
        className={'leftpanelmenuitem'} 
        style={{
            overflow:"hidden", 
            display:"flex", 
            padding:"2px",  
            alignItems:"center", 
            cursor:"pointer"
        }}
    >
        <div style={{paddingLeft:"2px"}}>
            <Checkbox 
                checked={isNotNil(todo.completedSet)} 
                onClick={() => {}}
            />
        </div>
        <div style={{width:"170px", paddingLeft:"7px"}}>
            <AutoresizableText
                text={uppercase(todo.title)}
                placeholder=""
                fontWeight="normal"
                fontSize={15}
                style={{}}
                placeholderStyle={{}}
            />
        </div>
    </div>,

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
                    placeholder=""
                    fontSize={15}
                    fontWeight="normal"
                    style={{}}
                    placeholderStyle={{}}
                />
            </div>
        </div>
    },
    "area" : (area:Area) => <div 
        className={'leftpanelmenuitem'} 
        style={{
            overflow:"hidden", 
            display:"flex",  
            padding:"2px", 
            alignItems:"center", 
            cursor:"pointer"
        }}
    >
        <div>
            <NewAreaIcon style={{width:"20px",height:"20px",color:"rgba(100, 100, 100, 0.7)"}}/> 
        </div>    
        <div style={{width:"170px", fontWeight:"bold", paddingLeft:"2px", paddingRight:"5px"}}>
            <AutoresizableText
                text={uppercase(area.name)}
                placeholder=""
                fontWeight="normal"
                fontSize={15}
                style={{}}
                placeholderStyle={{}}
            />
        </div>
    </div>,
    "tag" : (tag:string) => <div 
        className={'leftpanelmenuitem'} 
        style={{
            overflow:"hidden", 
            display:"flex",  
            padding:"2px", 
            alignItems:"center", 
            cursor:"pointer"
        }}
    >
        <div style={{width:"20px",height:"20px"}}>
            <TriangleLabel style={{width:"20px",height:"20px",color:"rgba(100, 100, 100, 0.7)"}}/> 
        </div>    
        <div style={{width:"170px",paddingLeft:"2px",paddingRight:"5px"}}>
            <AutoresizableText
                text={uppercase(tag)} 
                placeholder="" 
                fontWeight="normal"
                fontSize={15}
                style={{}}
                placeholderStyle={{}}
            />
        </div>
    </div>,
    "category" : (category:Category) => <div 
        className={'leftpanelmenuitem'} 
        style={{
            overflow:"hidden", 
            display:"flex", 
            padding:"2px", 
            alignItems:"center", 
            cursor:"pointer"
        }}
    >
        <div style={{display:"flex",alignItems:"center"}}>
            { chooseIcon({width:'20px',height:'20px'}, category) }
        </div>
        <div style={{fontWeight:"bold",paddingLeft:"1px",fontSize:"15px",paddingRight:"5px"}}>
            { uppercase(category) }
        </div>
    </div>
    
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
    indicators:{ 
        [key:string]:{active:number,completed:number,deleted:number}; 
    }
}



interface SearchSuggestionsState{ limit:number }



@connect((store,props) => ({...store,...props}), attachDispatchToProps)
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
    };



    suggestionToComponent = (byProject:any, byArea:any) => (item:any, index:number) => {
        let {areas, projects, dispatch} = this.props;
        let type = getSearchItemType(item);
        let action = locateItem(projects, this.props.filters)(item); 
        let appearance = SearchAppearances(this.props.indicators)[type](item);

        return <div key={`item-${index}`}>
            <div 
                onClick={
                    e => {
                        this.props.dispatch(action);
                        this.props.dispatch({type:"multiple",load:[
                            {type:"showMenu", load:false},
                            {type:"searchQuery", load:''}
                        ]});
                    }
                }
            >
            { appearance }
            </div>
        </div>   
    };  
     

    
    onGetMoreResults = (e) => !this.limitReached ? this.setState({limit:this.state.limit + 5}) : null;
 


    shouldComponentUpdate(nextProps,nextState){
        return different(nextState,this.state) || nextProps.searchQuery!==this.props.searchQuery;
    }



    render(){
        let {todos, projects, areas, dispatch, selectedTags, groupTodos, selectedCategory} = this.props;
        let suggestions = getQuickFindSuggestions(
            todos,projects,areas,
            getTagsFromItems(todos),
            toLower(this.props.searchQuery),
            this.state.limit
        );
        let items = flatten([
            suggestions.todos.sort(sortByCompletedOrNot),
            suggestions.tags,
            suggestions.categories,
            suggestions.projects
        ]);

        return <div style={{overflow:"hidden"}}>  
            { NoResultsLabel(isEmpty(items)) }
            <div> 
            { 
            <div>
                <div style={{paddingLeft:"10px",paddingRight:"10px"}}>
                    { 
                        items.map( 
                            this.suggestionToComponent(
                                suggestions.byProject,
                                suggestions.byArea
                            ) 
                        ) 
                    }
                </div>
            </div>
            }
            </div>
            { ContinueSearchButton(this.onGetMoreResults, !suggestions.limitReached) }     
        </div>  
    }
};


