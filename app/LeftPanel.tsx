import './assets/styles.css'; 
import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { 
  findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, 
  compose, append, contains, and, find, defaultTo, addIndex, split, filter, 
  clone, take, drop, reject, isNil, not, equals, assocPath, 
  sum, prop, all, groupBy, concat  
} from 'ramda';  
import { ipcRenderer } from 'electron';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { attachDispatchToProps } from "./utils"; 
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
import { NewProjectAreaPopover } from './Components/NewProjectAreaPopover';
import { ResizableHandle, Data } from './Components/ResizableHandle';
import { Store } from './App';
import { generateID, addProject, Project, Area, addArea } from './databaseCalls';



let generateEmptyProject = () => ({
        _id : generateID(), 
        attachedTodos:[],
        headings:[],   
        name : "New project",
        description : ""
    });


let generateEmptyArea = () => ({
        _id : generateID(),  
        attachedTodos : [], 
        attachedProjects : [],
        name : "New area",  
        description : ""
    });

  

 

@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)   
export class LeftPanel extends Component<Store,{}>{
        newProjectAnchor:HTMLElement;
            
        constructor(props){ 
            super(props);  
            this.state={
                width:window.innerWidth/4
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


        selectArea = (a:any) => (e) => {
            this.props.dispatch({
                type:"selectedArea",
                load:a
            }) 
            
        };
          

        selectProject = (p:any) => (e) => {
            this.props.dispatch({
                type:"selectedProject",
                load:p 
            })
        };
        

        render(){   
            let someday = this.props.todos.filter( v => v.category === "someday").length;
            let upcoming = this.props.todos.filter( v => v.category === "upcoming").length;
            let today = this.props.todos.filter( v => v.category === "today").length;
            let inbox = this.props.todos.filter( v => v.category === "inbox").length;

            let anytime = this.props.todos.length;
 
            return <div style={{
                display: "flex", 
                flexDirection: "column", 
                width: this.props.leftPanelWidth, 
                height: "100%",
                position:"relative", 
                backgroundColor: "rgba(189, 189, 189, 0.2)" 
            }}>       
            
                <ResizableHandle  
                    onDrag={(e,d:Data) => this.props.dispatch({
                        type:"leftPanelWidth",
                        load:this.props.leftPanelWidth+d.deltaX
                    })}   
                />   

            <div style={{display: "flex", padding: "10px"}}>    
 
                <div className="no-drag close"
                    onClick = {() => ipcRenderer.send("close", this.props.windowId)}
                    style={{  
                        width: "15px",
                        height: "15px",
                        borderRadius: "30px",
                        border: "1px solid grey",
                        cursor:"pointer",
                        marginRight: "10px"
                    }}
                > 
                </div>    

                <div className="no-drag reload"
                    onClick = {() => ipcRenderer.send("reload", this.props.windowId)}
                    style={{
                        width: "15px",
                        height: "15px",
                        borderRadius: "30px",
                        border: "1px solid grey",
                        cursor:"pointer",
                        marginRight: "10px"  
                    }}  
                >  
                </div>  
    
                <div className="no-drag hide"
                    onClick = {() => ipcRenderer.send("hide", this.props.windowId)} 
                    style={{     
                        width: "15px", 
                        height: "15px",
                        borderRadius: "30px",
                        border: "1px solid grey",
                        cursor:"pointer",
                        marginRight: "10px"  
                    }} 
                >
                </div>  
 
            </div>   
 
            <div style={{width:"100%"}}>
                <MenuList> 
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
                        {

                            upcoming===0 ? null :

                            <div style={{
                                fontFamily: "serif",
                                fontWeight: 700,
                                color: "rgba(100,100,100,0.6)"
                            }}>
                                {upcoming}
                            </div>
                    
                        }
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
                    <div style={{outline: "none",width:"100%",height:"30px"}}></div>
                </MenuList> 
            </div>   







            <div 
                style={{display: "flex", flexGrow: 1,  flexDirection: "column" }}
                id="projects"   
            >  
               
             {
                 this.props.projects.map((p) => 
                    <div 
                        onClick = {this.selectProject(p)}
                        className="hoverBorder" 
                        style={{  
                            marginLeft:"4px",
                            marginRight:"4px", 
                            height:"20px",
                            width:"95%",
                            display:"flex",
                            alignItems: "center" 
                        }}
                    >    
                            <IconButton    
                                iconStyle={{
                                    color:"rgba(109,109,109,0.4)",
                                    width:"18px",
                                    height:"18px"
                                }}  
                            >  
                                <Circle />  
                            </IconButton> 
                            <div style={{
                                fontFamily: "sans-serif",
                                fontWeight: 600, 
                                color: "rgba(100,100,100,0.7)",
                                fontSize:"15px",  
                                cursor: "default",
                                WebkitUserSelect: "none" 
                            }}>   
                                {p.name}
                            </div>  
                    </div>
                 )
             }

            </div>
 





            <div 
                style={{display: "flex", flexGrow: 1,  flexDirection: "column" }}
                id="areas"   
            >  
               
             {
                 this.props.areas.map((a) => 
                    <div 
                        onClick = {this.selectArea(a)}
                        className="hoverBorder" 
                        style={{  
                            marginLeft:"4px",
                            marginRight:"4px", 
                            height:"20px",
                            width:"95%",
                            display:"flex",
                            alignItems: "center"  
                        }}
                    >    
                            <IconButton    
                                iconStyle={{
                                    color:"rgba(109,109,109,0.4)",
                                    width:"18px",
                                    height:"18px"
                                }}  
                            >   
                                <NewAreaIcon />
                            </IconButton> 
                            <div style={{
                                fontFamily: "sans-serif",
                                fontWeight: 600, 
                                color: "rgba(100,100,100,0.7)",
                                fontSize:"15px",  
                                cursor: "default",
                                WebkitUserSelect: "none" 
                            }}>   
                                {a.name}
                            </div>  
                    </div>
                 )
             }

            </div>







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
                position: "sticky",
                width: "100%",
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
 
   
  

 