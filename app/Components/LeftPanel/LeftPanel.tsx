import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron';
import IconMenu from 'material-ui/IconMenu'; 
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { 
    attachDispatchToProps, generateEmptyProject, generateEmptyArea, 
    byNotCompleted, byNotDeleted, byTags, byCategory, byCompleted, 
    byDeleted, dateDiffInDays, hotFilter 
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
import NewAreaIcon from 'material-ui/svg-icons/action/tab';
import Popover from 'material-ui/Popover';
import { generateId, addProject, Project, Area, addArea, Todo } from '../../database';
import Clear from 'material-ui/svg-icons/content/clear';
import Remove from 'material-ui/svg-icons/content/remove'; 
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import FullScreen from 'material-ui/svg-icons/image/crop-square';
import { Store } from '../../App';
import { Data } from './../SortableList';
import { AreasList } from './../Area/AreasList';
import { ResizableHandle } from './../ResizableHandle';
import { LeftPanelMenu } from './LeftPanelMenu';
import { NewProjectAreaPopup } from './NewProjectAreaPopup';
import { allPass } from 'ramda';
 
 
interface ItemsAmount{
    inbox:number,
    today:number,
    hot:number 
}

 

let calculateAmount = (props:Store) : ItemsAmount => {

    let todayFilter = (i) => byCategory("today")(i) || byCategory("evening")(i);
 
    let inboxFilters = [byCategory("inbox"),byNotCompleted,byNotDeleted]; 
 
    let todayFilters = [todayFilter, byNotCompleted, byNotDeleted];
    
    let hotFilters = [todayFilter, byNotCompleted, byNotDeleted, hotFilter];
       
 
    return {    
        inbox:props.todos.filter( (t:Todo) => allPass(inboxFilters)(t) ).length,
        today:props.todos.filter( (t:Todo) => allPass(todayFilters)(t) ).length,
        hot:props.todos.filter( (t:Todo) => allPass(hotFilters)(t) ).length
    }  
  
}


  
interface LeftPanelState{
    width:number,
    fullWindowSize:boolean 
}
 
  

@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)   
export class LeftPanel extends Component<Store,LeftPanelState>{
    newProjectAnchor:HTMLElement;
        
    constructor(props){  
        super(props);   
        this.state = {
            width:window.innerWidth/4,
            fullWindowSize:true 
        }   
    };   
          
 
    onNewProjectClick = (e:any) => {
        this.props.dispatch({type:"addProject", load:generateEmptyProject()});
    };
            
        
    onNewAreaClick = (e:any) => {   
        this.props.dispatch({type:"addArea", load:generateEmptyArea()});
    };



    render(){    

        let {inbox,today,hot} : ItemsAmount = calculateAmount(this.props);
                  
        return  <div style={{
                    display: "flex",  
                    flexDirection: "column", 
                    width: this.props.leftPanelWidth, 
                    height: "100%",
                    position:"relative", 
                    backgroundColor: "rgb(248, 248, 248)"  
                }}>   
 
                    <ResizableHandle  
                        onDrag={(e,d) => this.props.dispatch({
                            type:"leftPanelWidth",
                            load:this.props.leftPanelWidth+d.deltaX
                        })}   
                    />  

                    <div> 
                        <LeftPanelMenu   
                            dispatch={this.props.dispatch}
                            inbox={inbox} 
                            today={today} 
                            hot={hot} 
                        />    
                    </div>
 
                    <div  className={"leftPanelScroll"}
                        id="areas" 
                        style={{
                            position:"relative", 
                            paddingTop:"10px",
                            paddingLeft:"10px", 
                            paddingBottom:"100px",
                            paddingRight:"10px"
                        }}   
                    >
                        <AreasList  
                          dispatch={this.props.dispatch}   
                          areas={this.props.areas}
                          projects={this.props.projects} 
                        />
                    </div> 

                    { 
                        !this.props.openNewProjectAreaPopup ? null :
                        <NewProjectAreaPopup 
                          anchor={this.newProjectAnchor}
                          open={this.props.openNewProjectAreaPopup}
                          close={() => this.props.dispatch({type:"openNewProjectAreaPopup",load:false})} 
                          onNewProjectClick={this.onNewProjectClick}
                          onNewAreaClick={this.onNewAreaClick}
                        />
                    }
                    
                    <div style={{    
                        display:"flex", 
                        alignItems:"center",  
                        position:"fixed",
                        width:this.props.leftPanelWidth,  
                        justifyContent:"space-between",  
                        bottom:"0px",  
                        height:"60px",
                        backgroundColor:"rgb(248, 248, 248)",
                        borderTop:"1px solid rgba(100, 100, 100, 0.2)"
                    }}>  

                        <div  
                            onClick = {() => {
                                if(!this.props.openNewProjectAreaPopup)
                                    this.props.dispatch({type:"openNewProjectAreaPopup",load:true})
                            }}
                            style={{display: "flex", padding: "5px", alignItems: "center", cursor: "pointer"}}
                        >     
                            <div 
                                style={{display: "flex", alignItems: "center", justifyContent: "center"}}
                                ref = {(e) => {this.newProjectAnchor=e}} 
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
                </div>   
        };    
};  
 







