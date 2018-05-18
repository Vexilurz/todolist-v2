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
import { allPass, isNil, not, flatten, contains } from 'ramda';
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
    selectedCategory:Category,
    leftPanelWidth:number,
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



interface TopPopoverMenuState{
    showMenu:boolean
}



export class TopPopoverMenu extends Component<TopPopoverMenuProps,TopPopoverMenuState>{
    anchor:HTMLElement;

    constructor(props){  
        super(props);   
        this.state={ showMenu:false };
    } 

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
                <ToggleTopMenuButton 
                   toggled={this.state.showMenu} 
                   onClick={(e) => this.setState({showMenu:!this.state.showMenu})} 
                   setRef={(e) => { this.anchor=e; }} 
                   title={this.props.selectedCategory}       
                />
                <Popover  
                    style={{backgroundColor:"rgba(0,0,0,0)",background:"rgba(0,0,0,0)",borderRadius:"10px"}}     
                    open={this.state.showMenu}
                    anchorEl={this.anchor}
                    onRequestClose={() => this.setState({showMenu:false})}
                    useLayerForClickAway={false} 
                    anchorOrigin={{vertical:"bottom",horizontal:"middle"}}  
                    targetOrigin={{vertical:"top",horizontal:"middle"}}  
                >   
                    <div style={{width:`250px`}}>
                        <div style={{padding:"5px", backgroundColor:"rgb(248, 248, 248)"}}>
                        <SearchInput dispatch={this.props.dispatch} searchQuery={this.props.searchQuery}/>
                        </div>
                        <div> 
                            <div        
                                className="scrollAuto"
                                style={{ 
                                    maxHeight:`${window.innerHeight*0.8}px`,
                                    WebkitUserSelect:"none",   
                                    backgroundColor:"rgb(248, 248, 248)"  
                                }}      
                            >   

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

                                <SearchSuggestions {...{} as any}/>

                            </div>
                        </div>
                    </div>   
                </Popover>
            </div>
        </div>    
    };    
};  
 



