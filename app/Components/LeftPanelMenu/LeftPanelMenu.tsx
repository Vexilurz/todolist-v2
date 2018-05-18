import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import IconMenu from 'material-ui/IconMenu'; 
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { Spinner } from '../Spinner';
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
import { ResizableHandle } from './../ResizableHandle';
import { NewProjectAreaPopup } from './NewProjectAreaPopup';
import { allPass, isNil, not, flatten, contains } from 'ramda';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { googleAnalytics } from '../../analytics';
import { isArrayOfStrings, isString } from '../../utils/isSomething';
import { isDev } from '../../utils/isDev';
import { SearchInput } from '../Search/SearchInput';
import { CategoryMenu } from './CategoryMenu';  
import { Footer } from './Footer';  
import { AreasList } from './AreasList';



interface LeftPanelMenuProps{
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



interface LeftPanelMenuState{}



export class LeftPanelMenu extends Component<LeftPanelMenuProps,LeftPanelMenuState>{
    anchor:HTMLElement;
    leftPanelRef:HTMLElement;  

    

    constructor(props){  
        super(props);   
    } 



    onError = (error) => globalErrorHandler(error);
    
    
 
    onNewProjectClick = (e:any) => {  
        let timeSeconds = Math.round( new Date().getTime() / 1000 );
        let {dispatch} = this.props;

        googleAnalytics.send(
            'event', 
            { 
               ec:'ProjectCreation', 
               ea:`Project Created ${new Date().toString()}`, 
               el:`Project Created`, 
               ev:timeSeconds  
            }
        ) 
        .catch(err => this.onError(err)) 

        let project = generateEmptyProject();

        dispatch({
            type:"multiple",
            load:[
                {type:"addProject", load:project},
                {type:"selectedProjectId", load:project._id},
                {type:"openNewProjectAreaPopup", load:false},
                {type:"selectedCategory", load:"project"}
            ]
        }); 
    };   
 

         
    onNewAreaClick = (e:any) => {    
        let timeSeconds = Math.round( new Date().getTime() / 1000 );
        let {dispatch} = this.props;

        googleAnalytics.send(  
            'event', 
            { 
               ec:'AreaCreation', 
               ea:`Area Created ${new Date().toString()}`, 
               el:'Area Created', 
               ev:timeSeconds 
            }
        ) 
        .catch(err => this.onError(err))  

        let area = generateEmptyArea();

        dispatch({
            type:"multiple",
            load:[
                {type:"addArea", load:area},
                {type:"selectedAreaId", load:area._id},
                {type:"openNewProjectAreaPopup", load:false},
                {type:"selectedCategory", load:"area"}
            ]
        }); 
    }; 



    onResizableHandleDrag = (e,d) => this.props.dispatch({
        type:"leftPanelWidth",
        load:this.props.leftPanelWidth+d.deltaX
    });
      


    openNewProjectAreaPopup = () => {
        let {openNewProjectAreaPopup,dispatch} = this.props;
        if(not(openNewProjectAreaPopup)){
           dispatch({type:"openNewProjectAreaPopup",load:true})
        } 
    };



    openSettings = (e) => {  
        e.stopPropagation();  
        this.props.dispatch({type:"openSettings",load:true}); 
    };



    openSyncSettings = () => {
        this.props.dispatch({
            type:"multiple",
            load:[
                {type:"openSettings",load:true},
                {type:"selectedSettingsSection", load:'Sync'}
            ]
        }); 
    };


     
    render(){      
        return <div style={{display:"flex", flexDirection:"row-reverse", height:window.innerHeight}}> 

            { not(this.props.collapsed) ? <ResizableHandle onDrag={this.onResizableHandleDrag}/> : null } 

            <div        
                id="leftpanel"
                ref={(e) => {this.leftPanelRef=e;}} 
                className="scroll"
                style={{ 
                    WebkitUserSelect:"none", 
                    transition: "width 0.2s ease-in-out", 
                    width:this.props.collapsed ? "0px" : `${this.props.leftPanelWidth}px`,
                    height:`100%`,      
                    backgroundColor:"rgb(248, 248, 248)"  
                }}      
            >   
                <div style={{padding:"15px"}}>
                    <SearchInput dispatch={this.props.dispatch} searchQuery={this.props.searchQuery}/>
                </div>    
                <CategoryMenu    
                    dragged={this.props.dragged}
                    dispatch={this.props.dispatch} 
                    selectedCategory={this.props.selectedCategory}
                    inbox={this.props.amounts.inbox} 
                    today={this.props.amounts.today} 
                    hot={this.props.amounts.hot} 
                    trash={this.props.amounts.trash}
                    logbook={this.props.amounts.logbook} 
                    id={this.props.id}
                />   

                <AreasList   
                    leftPanelWidth={this.props.leftPanelWidth}
                    dragged={this.props.dragged}  
                    dispatch={this.props.dispatch}   
                    indicators={this.props.indicators}
                    areas={this.props.areas}
                    selectedProjectId={this.props.selectedProjectId}
                    selectedAreaId={this.props.selectedAreaId}
                    selectedCategory={this.props.selectedCategory}
                    projects={this.props.projects}  
                    id={this.props.id}
                />

                <Footer  
                    width={ this.props.leftPanelWidth }  
                    collapsed={ this.props.collapsed }
                    openSettings={this.openSettings}
                    openSyncSettings={this.openSyncSettings}
                    openNewProjectAreaPopup={ this.openNewProjectAreaPopup }
                    setNewProjectAnchor={(e) => {this.anchor=e}}  
                /> 

                <NewProjectAreaPopup   
                    anchor={this.anchor}
                    open={this.props.openNewProjectAreaPopup}
                    close={() => this.props.dispatch({type:"openNewProjectAreaPopup",load:false})} 
                    onNewProjectClick={this.onNewProjectClick}
                    onNewAreaClick={this.onNewAreaClick}
                />  
            </div>    
        </div>    
    };    
};  
 

