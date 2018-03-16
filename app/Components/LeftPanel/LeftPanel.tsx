import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import IconMenu from 'material-ui/IconMenu'; 
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { 
    attachDispatchToProps, generateEmptyProject, generateEmptyArea, 
    byNotCompleted, byNotDeleted, byTags, byCategory, byCompleted, 
    byDeleted, byAttachedToProject, isTodayOrPast, isDeadlineTodayOrPast, byNotAttachedToCompletedProject, byNotAttachedToProject, anyTrue
} from "../../utils/utils";  
import { ipcRenderer } from 'electron';
import Adjustments from 'material-ui/svg-icons/image/tune';
import Plus from 'material-ui/svg-icons/content/add';  
import { Todo, Project, Area } from '../../database';
import { Store } from '../../app'; 
import { AreasList } from './../Area/AreasList';
import { ResizableHandle } from './../ResizableHandle';
import { LeftPanelMenu } from './LeftPanelMenu';
import { NewProjectAreaPopup } from './NewProjectAreaPopup';
import { allPass, isNil, not, flatten, contains } from 'ramda';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { filter, Category } from '../MainContainer';
import { SearchInput } from '../Search';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { googleAnalytics } from '../../analytics';
import { isArrayOfStrings, isString } from '../../utils/isSomething';
import { assert } from '../../utils/assert';
import { isDev } from '../../utils/isDev';
 

interface LeftPanelProps{
    dispatch:Function,
    selectedCategory:Category,

    leftPanelWidth:number,
    openNewProjectAreaPopup:boolean,

    projects:Project[],
    areas:Area[], 
    todos:Todo[], 

    searchQuery:string, 
    dragged:string, 
    selectedProjectId:string,
    selectedAreaId:string
}
interface LeftPanelState{ collapsed:boolean }


export class LeftPanel extends Component<LeftPanelProps,LeftPanelState>{
    anchor:HTMLElement;
    subscriptions:Subscription[];
    leftPanelRef:HTMLElement;  

    constructor(props){  
        super(props);   
        this.subscriptions = [];    
        this.state = { collapsed:false };      
    } 


    onError = (error) => globalErrorHandler(error);
    

    initCtrlB = () => {
        this.subscriptions.push(
            Observable
            .fromEvent(ipcRenderer,"toggle",(event) => event)
            .subscribe(
                () => this.setState({collapsed:!this.state.collapsed})
            )
        ); 
    }; 
    
    
    componentDidMount(){ 
        this.initCtrlB(); 
    }  
         

    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = [];
    } 

 
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
        dispatch({type:"addProject", load:project});
        dispatch({type:"selectedProjectId", load:project._id});
        dispatch({type:"openNewProjectAreaPopup", load:false});
        dispatch({type:"selectedCategory", load:"project"});
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
        dispatch({type:"addArea", load:area});
        dispatch({type:"selectedAreaId", load:area._id});
        dispatch({type:"openNewProjectAreaPopup", load:false}); 
        dispatch({type:"selectedCategory", load:"area"});
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

     
    render(){      
        let {collapsed} = this.state; 
        let {areas, projects, todos, leftPanelWidth, dispatch, searchQuery} = this.props; 

 
        let inbox = filter(
            todos, 
            allPass([ 
                byNotAttachedToProject(projects), 
                (todo:Todo) => isNil(todo.attachedDate) && isNil(todo.deadline), 
                byCategory("inbox"), 
                byNotCompleted,  
                byNotDeleted   
            ])
        );

        let today = filter(
            todos, 
            allPass([  
                byNotAttachedToCompletedProject(projects), 
                (t:Todo) => isTodayOrPast(t.attachedDate) || isTodayOrPast(t.deadline), 
                (t:Todo) => t.category!=="someday",
                byNotCompleted,  
                byNotDeleted   
            ])
        ); 

        let hot = filter(
            today, 
            allPass([
                (todo:Todo) => isDeadlineTodayOrPast(todo.deadline),
                byNotAttachedToCompletedProject(projects),
                byNotCompleted,  
                byNotDeleted  
            ])
        ); 

        let logbook = filter(
            todos, 
            allPass([
                byNotAttachedToCompletedProject(projects),
                byCompleted, 
                byNotDeleted
            ])
        );

        let trash = filter(todos, byDeleted);  
        

        let ids = flatten(projects.map((p) => p.layout.filter(isString) as string[])) as any;
          
        if(isDev()){
           assert(isArrayOfStrings(ids),`ids is not an array of strings. AreasList.`); 
        }
    
        let areasFilters = [(todo:Todo) => contains(todo._id)(ids), byNotDeleted]; 
        let selected = filter(todos,allPass(areasFilters));
        let completed = filter(selected,byCompleted);

        
        return <div style={{display:"flex",flexDirection:"row-reverse",height:window.innerHeight}}> 
            { 
                not(collapsed) ?
                <ResizableHandle onDrag={this.onResizableHandleDrag}/> : 
                null 
            } 
            <div        
                id="leftpanel"
                ref={(e) => {this.leftPanelRef=e;}} 
                className="scroll"
                style={{ 
                    WebkitUserSelect:"none", 
                    transition: "width 0.2s ease-in-out", 
                    width:collapsed ? "0px" : `${leftPanelWidth}px`,
                    height:`100%`,      
                    backgroundColor:"rgb(248, 248, 248)"  
                }}      
            >   
                <SearchInput dispatch={dispatch} searchQuery={searchQuery}/>
                <LeftPanelMenu   
                    dragged={this.props.dragged}
                    dispatch={this.props.dispatch} 
                    selectedCategory={this.props.selectedCategory}
                    inbox={inbox.length} 
                    today={today.length} 
                    hot={hot.length} 
                    trash={trash.length}
                    logbook={logbook.length} 
                />   
                <AreasList   
                    leftPanelWidth={this.props.leftPanelWidth}
                    leftPanelRef={this.leftPanelRef} 
                    dragged={this.props.dragged}  
                    todos={selected} 
                    completed={completed}
                    dispatch={this.props.dispatch}   
                    areas={this.props.areas}
                    selectedProjectId={this.props.selectedProjectId}
                    selectedAreaId={this.props.selectedAreaId}
                    selectedCategory={this.props.selectedCategory}
                    projects={this.props.projects}  
                />
                <LeftPanelFooter  
                    width={ leftPanelWidth }  
                    collapsed={ collapsed }
                    openSettings={(e) => {  
                        e.stopPropagation();  
                        this.props.dispatch({type:"openSettings",load:true}); 
                    }}
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
 


interface LeftPanelFooterProps{
    width:number,
    collapsed:boolean,
    openNewProjectAreaPopup:(e:any) => void,
    setNewProjectAnchor:(e:any) => void,
    openSettings:(e:any) => void 
}



class LeftPanelFooter extends Component<LeftPanelFooterProps,{}>{
  
    constructor(props){
        super(props); 
    }
     

    shouldComponentUpdate(nextProps:LeftPanelFooterProps){
        let {width, collapsed} = nextProps;
        let widthChanged = width!==this.props.width;
        let collapsedChanged = collapsed!==this.props.collapsed;

        return anyTrue([widthChanged, collapsedChanged]);
    };

    
    render(){ 
        let { collapsed, openSettings, openNewProjectAreaPopup, width, setNewProjectAnchor } = this.props; 

        return <div style={{    
            transition: "width 0.2s ease-in-out", 
            width:collapsed ? "0px" : `${width}px`,
            display:"flex",  
            alignItems:"center",  
            position:"fixed",    
            overflowX: "hidden",
            justifyContent:"space-between",  
            bottom:"0px",   
            height:"60px",
            backgroundColor:"rgb(248, 248, 248)",
            borderTop:"1px solid rgba(100, 100, 100, 0.2)"
        }}>    
            <div  
                onClick={openNewProjectAreaPopup}
                style={{
                    display:"flex",
                    paddingLeft:"10px",
                    alignItems:"center",
                    cursor:"pointer"
                }}
            >     
                <div 
                    style={{
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center"}}
                    ref={setNewProjectAnchor}
                >
                    <Plus    
                        style = {{     
                            color:"rgb(79, 79, 79)",
                            width:"25px",
                            height:"25px",
                            paddingLeft: "5px",
                            paddingRight: "5px"     
                        }}
                    />
                </div>    
            </div>   
            <div
                style={{
                    display:"flex", 
                    paddingRight:"10px", 
                    alignItems:"center", 
                    cursor:"pointer"
                }}
            >     
                <IconButton    
                onClick = {(e) => openSettings(e)}  
                iconStyle={{   
                    color:"rgba(100, 100, 100, 1)",
                    width:"25px", 
                    height:"25px"   
                }}>        
                    <Adjustments /> 
                </IconButton>  
            </div> 
        </div> 
    }
}


