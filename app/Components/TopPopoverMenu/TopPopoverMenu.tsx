import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import IconMenu from 'material-ui/IconMenu'; 
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { 
    attachDispatchToProps, generateEmptyProject, generateEmptyArea, 
    byNotCompleted, byNotDeleted, byTags, byCategory, byCompleted, 
    byDeleted, byAttachedToProject, isTodayOrPast, isDeadlineTodayOrPast, 
    anyTrue
} from "../../utils/utils";  
import { ipcRenderer } from 'electron';
import Adjustments from 'material-ui/svg-icons/image/tune';
import Plus from 'material-ui/svg-icons/content/add';  
import { Todo, Project, Area, Category, Store } from '../../types';
import { allPass, isNil, not, flatten, contains, isEmpty } from 'ramda';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { googleAnalytics } from '../../analytics';
import { isArrayOfStrings, isString } from '../../utils/isSomething';
import { isDev } from '../../utils/isDev';
import { SearchInput } from './../Search/SearchInput';
import Popover from 'material-ui/Popover';
import ShowMenu from 'material-ui/svg-icons/navigation/unfold-more';  
import { uppercase } from '../../utils/uppercase';
import { ToggleTopMenuButton } from './ToggleTopMenuButton';
import { CategoryPicker } from './CategoryPicker';
import { StaticAreasList } from './StaticAreasList';
import { SearchSuggestions } from '../Search/SearchSuggestions';



interface TopPopoverMenuProps{
    dispatch:Function,
    showMenu:boolean,
    selectedCategory:Category,
    leftPanelWidth:number,
    selectedTags:string[],
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
    collapsed:boolean,
    openNewProjectAreaPopup:boolean,
    projects:Project[],
    areas:Area[], 
    amounts:{
        inbox:number,
        today:number,
        hot:number,
        next:number,
        someday:number,
        logbook:number,
        trash:number
    },
    indicators : { 
        [key:string]:{
            active:number,
            completed:number,
            deleted:number
        }; 
    },
    searchQuery:string, 
    dragged:string, 
    selectedProjectId:string,
    selectedAreaId:string,
    id:number 
}



interface TopPopoverMenuState{}



export class TopPopoverMenu extends Component<TopPopoverMenuProps,TopPopoverMenuState>{
    anchor:HTMLElement;

    constructor(props){  
        super(props);   
    } 



    showMenu = (e) => {
        e.stopPropagation(); 
        e.nativeEvent.stopImmediatePropagation();
        this.props.dispatch({type:"showMenu",load:!this.props.showMenu});
    }; 



    onQueryChange = (e) => this.props.dispatch({type:"searchQuery", load:e.target.value}); 
      


    clear = () => this.props.dispatch({type:"searchQuery", load:""});



    getButtonTitle = () => {
        if(this.props.selectedCategory==="project"){
            let project = this.props.projects.find(p => p._id===this.props.selectedProjectId);

            if(project){
                return project.name;
            }else{
                return this.props.selectedCategory;
            }

        }else if(this.props.selectedCategory==="area"){
            let area = this.props.areas.find(p => p._id===this.props.selectedAreaId);

            if(area){
                return area.name;
            }else{
                return this.props.selectedCategory;
            }
        }else if(this.props.selectedCategory==="tag"){
            return this.props.selectedTags[0];
        }else{
            return this.props.selectedCategory;
        }
    };

    

    render(){      
        return <div style={{
            width:"100%",
            position:"fixed",
            zIndex:10000,
            top:0,
            display:"flex",
            justifyContent:"center" 
        }}> 
            <div>
                {
                    <div style={{display:!this.props.collapsed && !this.props.showMenu ? "none" : "inline-block"}}>
                    <ToggleTopMenuButton 
                        collapsed={this.props.collapsed}
                        toggled={this.props.showMenu} 
                        onClick={this.showMenu} 
                        setRef={(e) => { this.anchor=e; }} 
                        title={this.getButtonTitle()}       
                    />
                    </div>
                }
                <Popover  
                    style={{backgroundColor:"rgba(0,0,0,0)",background:"rgba(0,0,0,0)",borderRadius:"10px"}}     
                    open={this.props.showMenu}
                    useLayerForClickAway={false}
                    anchorEl={this.anchor}
                    onRequestClose={() => this.props.dispatch({type:"showMenu",load:false})}
                    anchorOrigin={{vertical:"bottom",horizontal:"middle"}}  
                    targetOrigin={{vertical:"top",horizontal:"middle"}}  
                >   
                    <div style={{width:`250px`}}>
                        <div style={{padding:"5px", backgroundColor:"rgb(248, 248, 248)"}}>
                        <SearchInput 
                            autofocus={true} 
                            onChange={this.onQueryChange} 
                            clear={this.clear} 
                            searchQuery={this.props.searchQuery}
                        />
                        </div>
                        <div>  
                            <div        
                                className="scrollAuto"
                                style={{ 
                                    maxHeight:`${window.innerHeight*0.7}px`,
                                    WebkitUserSelect:"none",   
                                    backgroundColor:"rgb(248, 248, 248)",
                                    paddingBottom:"5px"  
                                }}      
                            >   
                            {
                                isEmpty(this.props.searchQuery) ?
                                <div>
                                    <CategoryPicker 
                                        dragged={this.props.dragged} 
                                        dispatch={this.props.dispatch}
                                        selectedCategory={this.props.selectedCategory}
                                        inbox={this.props.amounts.inbox}
                                        today={this.props.amounts.today}
                                        hot={this.props.amounts.hot}
                                        logbook={this.props.amounts.logbook}
                                        trash={this.props.amounts.trash}
                                        id={this.props.id}
                                    />
                                    <StaticAreasList 
                                        dispatch={this.props.dispatch}
                                        leftPanelWidth={this.props.leftPanelWidth}
                                        dragged={this.props.dragged} 
                                        selectedProjectId={this.props.selectedProjectId} 
                                        selectedAreaId={this.props.selectedAreaId} 
                                        selectedCategory={this.props.selectedCategory} 
                                        areas={this.props.areas} 
                                        indicators={this.props.indicators} 
                                        projects={this.props.projects} 
                                        id={this.props.id} 
                                    />
                                </div>
                                :
                                <SearchSuggestions 
                                    {
                                        ...{ 
                                            indicators:this.props.indicators, 
                                            filters:this.props.filters 
                                        } as any
                                    }
                                />
                            }
                            </div>
                        </div>
                    </div>   
                </Popover>
            </div>
        </div>    
    };    
};  
 



