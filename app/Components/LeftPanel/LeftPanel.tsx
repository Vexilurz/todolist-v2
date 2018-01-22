import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import IconMenu from 'material-ui/IconMenu'; 
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { 
    attachDispatchToProps, generateEmptyProject, generateEmptyArea, 
    byNotCompleted, byNotDeleted, byTags, byCategory, byCompleted, 
    byDeleted, dateDiffInDays, byAttachedToProject, byAttachedToArea, isDate, daysRemaining, isToday, assert 
} from "../../utils";  
import { Provider, connect } from "react-redux";
import Menu from 'material-ui/Menu';
import Star from 'material-ui/svg-icons/toggle/star';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import CheckBoxEmpty from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import CheckBox from 'material-ui/svg-icons/toggle/check-box'; 
import BusinessCase from 'material-ui/svg-icons/places/business-center';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz'; 
import Layers from 'material-ui/svg-icons/maps/layers';
import Adjustments from 'material-ui/svg-icons/image/tune';
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Plus from 'material-ui/svg-icons/content/add';  
import Inbox from 'material-ui/svg-icons/content/inbox';
import Trash from 'material-ui/svg-icons/action/delete';
import Search from 'material-ui/svg-icons/action/search'; 
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Calendar from 'material-ui/svg-icons/action/date-range';
import Logbook from 'material-ui/svg-icons/av/library-books'; 
import NewProjectIcon from 'material-ui/svg-icons/image/timelapse';
import Popover from 'material-ui/Popover';
import { addProject, Project, Area, addArea, Todo } from '../../database';
import Clear from 'material-ui/svg-icons/content/clear';
import Remove from 'material-ui/svg-icons/content/remove'; 
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import FullScreen from 'material-ui/svg-icons/image/crop-square';
import { Store, isDev } from '../../app'; 
import { AreasList } from './../Area/AreasList';
import { ResizableHandle } from './../ResizableHandle';
import { LeftPanelMenu } from './LeftPanelMenu';
import { NewProjectAreaPopup } from './NewProjectAreaPopup';
import { allPass, isNil, not } from 'ramda';
import { QuickSearch } from '../Search';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';

const ctrlKeyCode = 17;
const bKeyCode = 66;
 
interface ItemsAmount{
    inbox:number,
    today:number,
    hot:number,
    trash:number,
    logbook:number  
}

  
 

export let calculateAmount = (areas:Area[], projects:Project[], todos:Todo[]) : ItemsAmount => {
 
    let isDeadlineTodayOrPast = (deadline:Date) : boolean => isNil(deadline) ? 
                                                             false : 
                                                             daysRemaining(deadline)<=0;
        
     let isTodayOrPast = (date:Date) : boolean => 
         isNil(date) ?    
         false :  
         daysRemaining(date)<=0; 
 
    let todayFilters = [   
        (t:Todo) => isTodayOrPast(t.attachedDate) || isTodayOrPast(t.deadline), 
        byNotCompleted,  
        byNotDeleted   
    ];    

    let hotFilters = [
        (todo:Todo) => isDeadlineTodayOrPast(todo.deadline),
        byNotCompleted,  
        byNotDeleted  
    ];
    
    let inboxFilters = [  
        (todo:Todo) => not(byAttachedToArea(areas)(todo)), 
        (todo:Todo) => not(byAttachedToProject(projects)(todo)), 
        (todo:Todo) => isNil(todo.attachedDate), 
        (todo:Todo) => isNil(todo.deadline), 
        byCategory("inbox"),  
        byNotCompleted,    
        byNotDeleted 
    ]; 
 
    let trashFilters = [byDeleted];

    let logbookFilters = [byCompleted, byNotDeleted]; 
        
    return {      
       inbox:todos.filter((t:Todo) => allPass(inboxFilters)(t)).length,
       today:todos.filter((t:Todo) => allPass(todayFilters)(t)).length,
       hot:todos.filter((t:Todo) => allPass(hotFilters)(t)).length,
       trash:todos.filter((t:Todo) => allPass(trashFilters)(t)).length, 
       logbook:todos.filter((t:Todo) => allPass(logbookFilters)(t)).length
    }   
} 
 

  
interface LeftPanelState{ 
    collapsed:boolean 
}
 

@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)   
export class LeftPanel extends Component<Store,LeftPanelState>{
    anchor:HTMLElement;
    subscriptions:Subscription[];
    leftPanelRef:HTMLElement;  
        
    constructor(props){  
        super(props);   
        this.subscriptions = [];    
        this.state = { 
            collapsed:false 
        }     
    }   
    
    
    componentDidMount(){

        let ctrlBPress = Observable
                         .fromEvent(window,"keydown")
                         .filter((e:any) => e.keyCode===ctrlKeyCode)
                         .switchMap(
                            () => Observable
                                .fromEvent(window, "keydown")
                                .filter((e:any) => e.keyCode===bKeyCode)
                                .takeUntil(
                                    Observable
                                    .fromEvent(window,"keyup")
                                    .filter((e:any) => e.keyCode===ctrlKeyCode)
                                )
                         ).subscribe(
                            () => this.setState({collapsed:!this.state.collapsed})
                         )
        

        this.subscriptions.push(ctrlBPress)
    }  
         

    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = [];
    } 

 
    onNewProjectClick = (e:any) => {
        let project = generateEmptyProject();
        this.props.dispatch({type:"addProject", load:project});
        this.props.dispatch({type:"selectedProjectId", load:project._id});
        this.props.dispatch({type:"openNewProjectAreaPopup", load:false});
        this.props.dispatch({type:"selectedCategory", load:"project"});
    }   
 
         
    onNewAreaClick = (e:any) => {   
        let area = generateEmptyArea();
        this.props.dispatch({type:"addArea", load:area});
        this.props.dispatch({type:"selectedAreaId", load:area._id});
        this.props.dispatch({type:"openNewProjectAreaPopup", load:false}); 
        this.props.dispatch({type:"selectedCategory", load:"area"});
    }


    onResizableHandleDrag = (e,d) => {
        this.props.dispatch({
            type:"leftPanelWidth",
            load:this.props.leftPanelWidth+d.deltaX
        })
    }
      

    openNewProjectAreaPopup = () => {
        if(!this.props.openNewProjectAreaPopup){
            this.props.dispatch({type:"openNewProjectAreaPopup",load:true})
        } 
    } 

  
    render(){      
        let {collapsed} = this.state;
        let {areas,projects,todos,leftPanelWidth} = this.props; 
        let {inbox,today,hot,trash,logbook} : ItemsAmount = calculateAmount(areas,projects,todos);

                   
        return  <div style={{display: "flex",flexDirection: "row-reverse", height:window.innerHeight}}> 
                {   collapsed ? null : <ResizableHandle onDrag={this.onResizableHandleDrag}/>   }
                <div       
                    id="leftpanel"
                    ref={(e) => { this.leftPanelRef=e; }}
                    className="scroll"
                    style={{ 
                        WebkitUserSelect:"none", 
                        transition: "width 0.2s ease-in-out", 
                        width:collapsed ? "0px" : `${leftPanelWidth}px`,
                        height:`100%`,      
                        backgroundColor:"rgb(248, 248, 248)"  
                    }}      
                >         

                    <QuickSearch {...{} as any}/> 

                    <LeftPanelMenu   
                        dragged={this.props.dragged}
                        dispatch={this.props.dispatch} 
                        selectedCategory={this.props.selectedCategory}
                        inbox={inbox} 
                        today={today} 
                        hot={hot} 
                        trash={trash}
                        logbook={logbook}
                    />  

                    <AreasList  
                        leftPanelWidth={this.props.leftPanelWidth}
                        leftPanelRef={this.leftPanelRef}
                        dragged={this.props.dragged} 
                        todos={this.props.todos} 
                        dispatch={this.props.dispatch}   
                        areas={this.props.areas}
                        selectedProjectId={this.props.selectedProjectId}
                        selectedAreaId={this.props.selectedAreaId}
                        selectedCategory={this.props.selectedCategory}
                        projects={this.props.projects} 
                    />

                    <LeftPanelFooter  
                        width={leftPanelWidth}  
                        collapsed={collapsed}
                        openNewProjectAreaPopup={this.openNewProjectAreaPopup}
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
}



class LeftPanelFooter extends Component<LeftPanelFooterProps,{}>{
  
    constructor(props){
        super(props); 
    }
     
    render(){ 
        let { collapsed } = this.props; 

        return <div style={{    
            transition: "width 0.2s ease-in-out", 
            width:collapsed ? "0px" : `${this.props.width}px`,
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
                onClick = {this.props.openNewProjectAreaPopup}
                style={{display:"flex", padding:"5px", alignItems:"center", cursor:"pointer"}}
            >     
                <div 
                    style={{display:"flex", alignItems:"center", justifyContent:"center"}}
                    ref = {this.props.setNewProjectAnchor}
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
                <div style={{
                    color: "rgba(100, 100, 100, 1)",
                    fontSize: "15px",
                    cursor: "pointer",
                    WebkitUserSelect: "none" 
                }}>   
                    New List 
                </div>    
            </div>   

            <div>     
                <IconButton    
                onClick = {() => {}}  
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


