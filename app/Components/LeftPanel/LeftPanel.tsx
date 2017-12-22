import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron';
import IconMenu from 'material-ui/IconMenu'; 
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { attachDispatchToProps, generateEmptyProject, generateEmptyArea } from "../../utils"; 
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
import { generateId, addProject, Project, Area, addArea } from '../../database';
import Clear from 'material-ui/svg-icons/content/clear';
import Remove from 'material-ui/svg-icons/content/remove'; 
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import FullScreen from 'material-ui/svg-icons/image/crop-square';
import { Store } from '../../App';
import { Data } from './../SortableList';
import { AreasList } from './../Area/AreasList';
import { ResizableHandle } from './../ResizableHandle';
import { LeftPanelMenu } from './LeftPanelMenu';
import { WindowControlButtons } from './WindowControlButtons';
import { NewProjectAreaPopup } from './NewProjectAreaPopup';

 

  
interface LeftPanelState{
    width:number,
    fullWindowSize:boolean 
}
 
  

@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)   
export class LeftPanel extends Component<Store,LeftPanelState>{
        newProjectAnchor:HTMLElement;
            
        constructor(props){ 
            super(props);  
            this.state={
                width:window.innerWidth/4,
                fullWindowSize:true 
            } 
        };  
          

 
        onNewProjectClick = (e:any) => {
            this.props.dispatch({type:"newProject", load:generateEmptyProject()});
        };
            
              
         
        onNewAreaClick = (e:any) => { 
            this.props.dispatch({type:"newArea", load:generateEmptyArea()});
        };


 
        toggleWindowSize = () => {
            this.setState(
                {fullWindowSize:!this.state.fullWindowSize}, 
                () => {
                    ipcRenderer.send(
                        "size",
                        this.props.windowId,
                        this.state.fullWindowSize
                    );    
                }
            ) 
        };



        render(){    



 
            //account deleted   TODO  
            let someday = this.props.todos.filter( v => v.category === "someday" && !v.checked).length;
 
            let upcoming = this.props.todos.length;
 
            let today = this.props.todos.filter(
                v => !v.checked && (v.category === "today" || v.category === "evening")
            ).length; 
 
            let inbox = this.props.todos.filter( v => v.category === "inbox"  && !v.checked ).length;
  
            let anytime = this.props.todos.filter( v => !v.checked ).length;
                 





            return  <div 
                        className="leftPanelScroll"
                        style={{
                            display: "flex",  
                            flexDirection: "column", 
                            width: this.props.clone ? "0px" : this.props.leftPanelWidth, 
                            height: "100%",
                            position:"relative", 
                            backgroundColor: "rgb(240, 240, 240)"  
                        }}
                    > 

                    <ResizableHandle  
                        onDrag={(e,d) => this.props.dispatch({
                            type:"leftPanelWidth",
                            load:this.props.leftPanelWidth+d.deltaX
                        })}   
                    />  

                    <WindowControlButtons 
                        windowId={this.props.windowId}
                        toggleWindowSize={this.toggleWindowSize}
                        leftPanelWidth={this.props.leftPanelWidth}
                    /> 

                    <LeftPanelMenu 
                        dispatch={this.props.dispatch}
                        inbox={0}
                        today={0}
                        upcoming={0}
                        anytime={0}
                        someday={0} 
                        logbook={0}
                        trash={0}
                    />
 
                    {
                        this.props.areas.length===0 ? null:
                        <div id="areas" style={{position:"relative", padding:"10px"}}>
                            <AreasList  
                                dispatch={this.props.dispatch}
                                areas={this.props.areas}
                                projects={this.props.projects} 
                            />
                        </div> 
                    }

                    <NewProjectAreaPopup 
                        anchor={this.newProjectAnchor}
                        open={this.props.openNewProjectAreaPopup}
                        close={() => this.props.dispatch({type:"openNewProjectAreaPopup",load:false})} 
                        onNewProjectClick={this.onNewProjectClick}
                        onNewAreaClick={this.onNewAreaClick}
                    />
        
                
                    <div style={{    
                        display: "flex", 
                        alignItems: "center",  
                        position: "fixed",
                        width : this.props.leftPanelWidth,  
                        justifyContent: "space-around",  
                        bottom: "0px", 
                        height: "60px",
                        backgroundColor: "rgba(235, 235, 235, 1)",
                        borderTop: "1px solid rgba(100, 100, 100, 0.2)"
                    }}>   

                        <div  
                            ref = {(e) => {this.newProjectAnchor=e}}
                            style={{display: "flex", alignItems: "center"}}
                        >    
                            <IconButton     
                                onClick = {() => this.props.dispatch({type:"openNewProjectAreaPopup",load:true})}    
                                iconStyle={{     
                                    color:"rgb(79, 79, 79)",
                                    width:"25px",
                                    height:"25px"    
                                }}
                            >       
                                <Plus />  
                            </IconButton>
                            <div style={{
                                fontFamily: "sans-serif",
                                fontWeight: 600, 
                                color: "rgba(100,100,100,0.7)",
                                fontSize:"15px",  
                                cursor: "default",
                                WebkitUserSelect: "none" 
                            }}> 
                                New List 
                            </div>    
                        </div>  


                        <div style={{ }}>   
                            <IconButton   
                            onClick = {() => console.log("")} 
                            iconStyle={{  
                                color:"rgb(79, 79, 79)",
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
 







