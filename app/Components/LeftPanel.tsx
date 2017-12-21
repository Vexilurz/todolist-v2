import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { attachDispatchToProps } from "../utils"; 
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
import { ListItemIcon, ListItemText } from 'material-ui-next/List';
import { MenuList, MenuItem } from 'material-ui-next/Menu';
import NewProjectIcon from 'material-ui/svg-icons/image/timelapse';
import NewAreaIcon from 'material-ui/svg-icons/action/tab';
import Popover from 'material-ui/Popover';
import { generateId, addProject, Project, Area, addArea } from '../database';
import Clear from 'material-ui/svg-icons/content/clear';
import Remove from 'material-ui/svg-icons/content/remove'; 
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import FullScreen from 'material-ui/svg-icons/image/crop-square';
import { Store } from '../App';
import { ResizableHandle } from './misc/ResizableHandle';
import { Data } from './SortableList';
import { AreasList } from './Area/AreasList';

 

let generateEmptyProject = () : Project => ({
    _id : generateId(), 
    type : "project", 
    name : "New project",
    description : "Project description...",
    layout : [], 
    deleted : undefined,
    created : new Date(), 
    deadline : null,
    completed : null, 
    attachedTodosIds : [], 
    attachedTags : []
});
 
 
  
let generateEmptyArea = () : Area => ({
    _id : generateId(),
    name : "New area",
    deleted : undefined, 
    type : "area",
    description : "Area description",
    attachedTags : [], 
    attachedTodosIds : [],  
    attachedProjectsIds : [],
});
  
 
  
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
            let newProject : Project = generateEmptyProject();
            addProject((e) => console.log(e), newProject);
             
            this.props.dispatch({type:"newProject", load:newProject});
        };
            
              
         
        onNewAreaClick = (e:any) => { 
            let newArea : Area = generateEmptyArea();
            addArea((e) => console.log(e), newArea); 
              
            this.props.dispatch({type:"newArea", load:newArea});
        };



        render(){    


            let someday = this.props.todos.filter( v => v.category === "someday" && !v.checked).length;


            let upcoming = this.props.todos.length;


            let today = this.props.todos.filter(
                v => !v.checked && (v.category === "today" || v.category === "evening")
            ).length; 
 
 
            let inbox = this.props.todos.filter( v => v.category === "inbox"  && !v.checked ).length;
  

            let anytime = this.props.todos.filter( v => !v.checked ).length;
 
                
  
            return   <div 
                        className="leftPanelScroll"
                        style={{
                            display: "flex",  
                            flexDirection: "column", 
                            width: this.props.clone ? "0px" : this.props.leftPanelWidth, 
                            height: "100%",
                            position:"relative", 
                            backgroundColor: "rgba(189, 189, 189, 0.2)"  
                        }}
                    >            
                                <ResizableHandle  
                                    onDrag={(e,d) => this.props.dispatch({
                                        type:"leftPanelWidth",
                                        load:this.props.leftPanelWidth+d.deltaX
                                    })}   
                                />   
  
                                <div 
                                    className="no-drag" 
                                    style={{ 
                                        zIndex: 2000,  
                                        position:"fixed", 
                                        top: "0px",
                                        left: "0px", 
                                        display: "flex",
                                        flexDirection: "row-reverse"
                                    }}
                                >  

                                    <IconButton 
                                        iconStyle={{color:"cadetblue",width:"20px",height:"20px"}}
                                        className="no-drag" 
                                        onTouchTap={() => ipcRenderer.send("hide",this.props.windowId)}
                                    >
                                        <Remove /> 
                                    </IconButton> 
 
 
                                    <IconButton 
                                        iconStyle={{color:"cadetblue",width:"20px",height:"20px"}}
                                        className="no-drag" 
                                        onTouchTap={() => {
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
                                        }}   
                                    >     
                                        <FullScreen />
                                    </IconButton>   


                                    <IconButton 
                                        iconStyle={{color:"cadetblue",width:"20px",height:"20px"}}
                                        className="no-drag" 
                                        onTouchTap={() => ipcRenderer.send("close", this.props.windowId)}
                                    >
                                        <Clear  /> 
                                    </IconButton>

                                </div>   




            <div style={{marginTop: "25px", width:"95%", padding:"10px"}}>
                <MenuList> 
                    <div style={{outline: "none", width:"100%",height:"30px"}}></div>
                    <MenuItem 
                        className="no-drag"  

                        onClick={() => this.props.dispatch({type:"selectedCategory",load:"inbox"})}

                        style={{
                            paddingTop:"5px",
                            paddingBottom:"5px", 
                            paddingLeft:"5px", 
                            paddingRight:"5px" 
                        }}
                    > 
                        <ListItemIcon >  
                        <Inbox style={{ color:"dodgerblue" }} />
                        </ListItemIcon> 
                        <ListItemText inset primary="Inbox" />
                        {

                            inbox===0 ? null :

                            <div style={{
                                fontFamily: "serif",
                                fontWeight: 700,
                                color: "rgba(100,100,100,0.6)"
                            }}>  
                                {inbox}
                            </div>
                    
                        } 
                    </MenuItem>
                    <div style={{
                        outline: "none",
                        width:"100%",
                        height:"30px"
                    }}>
                    </div> 
                    <MenuItem 

                    onClick={() => this.props.dispatch({type:"selectedCategory",load:"today"})} 

                    style={{
                        paddingTop:"5px",
                        paddingBottom:"5px",  
                        paddingLeft:"5px", 
                        paddingRight:"5px" 
                    }}>
                        <ListItemIcon >   
                        <Star style={{color:"darkgoldenrod"}}/>   
                        </ListItemIcon>
                        <ListItemText  inset primary="Today" />
                        {today===0 ? null : 
                        <div style={{
                            fontFamily: "serif",
                            fontWeight: 700,
                            color: "rgba(100,100,100,0.6)"
                        }}> 
                            {today}
                        </div>}
                    </MenuItem>  

                    <MenuItem 

                    onClick={() => this.props.dispatch({type:"selectedCategory",load:"upcoming"})}

                    style={{
                        paddingTop:"5px",
                        paddingBottom:"5px", 
                        paddingLeft:"5px", 
                        paddingRight:"5px" 
                    }}> 
                        <ListItemIcon>   
                            <Calendar style={{color:"crimson"}}/>
                        </ListItemIcon>
                        <ListItemText  inset primary="Upcoming" />
                        {/*

                            upcoming===0 ? null :

                            <div style={{
                                fontFamily: "serif",
                                fontWeight: 700,
                                color: "rgba(100,100,100,0.6)"
                            }}>
                                {upcoming}
                            </div>
                     
                        */}
                    </MenuItem>
                    <MenuItem 

                    onClick={() => this.props.dispatch({type:"selectedCategory", load:"anytime"})} 

                    style={{
                        paddingTop:"5px",
                        paddingBottom:"5px", 
                        paddingLeft:"5px", 
                        paddingRight:"5px" 
                    }}> 
                        <ListItemIcon > 
                        <Layers style={{color:"darkgreen"}}/>
                        </ListItemIcon> 
                        <ListItemText  inset primary="Anytime" />
                        {
                            anytime===0 ? null :

                            <div style={{
                                fontFamily: "serif",
                                fontWeight: 700,
                                color: "rgba(100,100,100,0.6)"
                            }}>
                                {anytime}
                            </div>

                        }
                    </MenuItem> 
                    <MenuItem  

                    onClick={() => this.props.dispatch({type:"selectedCategory", load:"someday"})} 

                    style={{ 
                        paddingTop:"5px",
                        paddingBottom:"5px", 
                        paddingLeft:"5px", 
                        paddingRight:"5px" 
                    }}> 
                        <ListItemIcon >      
                        <BusinessCase  style={{color:"burlywood"}}/> 
                        </ListItemIcon>
                        <ListItemText  inset primary="Someday" />
                        {
                            someday===0 ? null :  
                            <div style={{
                                fontFamily: "serif",
                                fontWeight: 700,
                                color: "rgba(100,100,100,0.6)"
                            }}>
                                {someday}
                            </div>
                        }  
                    </MenuItem> 
                    <div style={{outline: "none", width:"100%",height:"30px"}}></div>
                    <MenuItem 

                    onClick={() => this.props.dispatch({type:"selectedCategory",load:"logbook"})} 

                    style={{ 
                        paddingTop:"5px",
                        paddingBottom:"5px", 
                        paddingLeft:"5px", 
                        paddingRight:"5px" 
                    }}>  
                        <ListItemIcon> 
                        <Logbook style={{color:"limegreen"}}/> 
                        </ListItemIcon>
                        <ListItemText  inset primary="Logbook" /> 
                    </MenuItem> 
                    <MenuItem 

                    onClick={() => this.props.dispatch({type:"selectedCategory",load:"trash"})} 

                    style={{ 
                        paddingTop:"5px",
                        paddingBottom:"5px", 
                        paddingLeft:"5px", 
                        paddingRight:"5px" 
                    }}> 
                        <ListItemIcon>    
                        <Trash style={{color:"darkgray"}}/>
                        </ListItemIcon>
                        <ListItemText  inset primary="Trash" />
                    </MenuItem> 
                    <div style={{outline:"none", width:"100%", height:"30px"}}></div>
                </MenuList> 
            </div>   
  

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

            <NewProjectAreaPopover 
                anchor={this.newProjectAnchor}
                open={this.props.openNewProjectAreaPopover}
                close={() => this.props.dispatch({type:"openNewProjectAreaPopover",load:false})} 
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
                        onClick = {() => this.props.dispatch({type:"openNewProjectAreaPopover",load:true})}    
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
 
   




interface NewProjectAreaPopoverProps{
    anchor:HTMLElement,
    open:boolean,
    close:Function,
    onNewProjectClick: (e:any) => void,
    onNewAreaClick: (e:any) => void
 }
  
 
 export class NewProjectAreaPopover extends Component<NewProjectAreaPopoverProps,{}>{
 
     constructor(props){ 
         super(props);
     }
 
     render(){
         return <Popover  
         style={{
             backgroundColor:"rgba(0,0,0,0)",
             background:"rgba(0,0,0,0)",
             borderRadius:"10px"
         }}     
         open={this.props.open}
         anchorEl={this.props.anchor}
         onRequestClose={() => this.props.close()}
         anchorOrigin={{   
             vertical: "top",
             horizontal: "left"
         }}  
         targetOrigin={{      
             vertical: "bottom",
             horizontal: "left"
         }}  
     >   
         <div style={{  
             backgroundColor: "rgb(39, 43, 53)",
             padding: "5px 10px",
             borderRadius: "10px",
             maxHeight: "250px",
             width: "370px",
             cursor: "pointer" 
         }}>    
 
         <div 
         onClick = {this.props.onNewProjectClick}
         className="newprojectitem" 
         style={{
             display:"flex", 
             alignItems: "flex-start", 
             padding:"7px"
         }}> 
             <NewProjectIcon style={{color:"lightblue"}}/> 
             <div style={{
                 display: "flex",
                 flexDirection: "column",
                 alignItems: "flex-start",
                 paddingLeft: "5px",
                 paddingTop: "3px" 
             }}>    
                 <div style={{  
                     color: "aliceblue",
                     fontFamily: "sans-serif",
                     fontSize: "15px"
                 }}>
                     New Project
                 </div>
                 <p style={{
                     margin: "0px",
                     paddingTop: "10px",
                     color: "rgba(190,190,190,0.5)",
                     fontFamily: "sans-serif" 
                 }}>
                     Define a goal, 
                     then work towards it 
                     one to-do at a time.  
                 </p> 
             </div> 
         </div>
 
 
         <div style={{
                 border:"1px solid rgba(200,200,200,0.1)",
                 marginTop: "5px",
                 marginBottom: "5px"
         }}>
         </div> 
 
         <div   
         onClick = {this.props.onNewAreaClick}
         className="newprojectitem" 
         style={{
             display:"flex", 
             alignItems: "flex-start", 
             padding:"7px"
         }}> 
             <NewAreaIcon style={{color:"lightblue", width:"34px"}}/>
             <div style={{
                 display: "flex",
                 flexDirection: "column",
                 alignItems: "flex-start",
                 paddingLeft: "5px",
                 paddingTop: "3px" 
             }}>    
                 <div style={{  
                     color: "aliceblue",
                     fontFamily: "sans-serif", 
                     fontSize: "15px"
                 }}>
                     New Area
                 </div>
                 <p style={{
                     margin: "0px",
                     paddingTop: "10px",
                     color: "rgba(190,190,190,0.5)",
                     fontFamily: "sans-serif",
                     width:"85%"  
                 }}>
                     Group your projects and to-dos
                     based on different responsibilities,
                     such as Family or Work. 
                 </p> 
             </div> 
         </div>
          
         </div>   
     </Popover> 
     }
 
 }