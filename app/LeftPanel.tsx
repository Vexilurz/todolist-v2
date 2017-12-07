import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, 
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, 
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, groupBy, concat 
} from 'ramda';
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import CircularProgress from 'material-ui/CircularProgress'; 
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import {fade} from 'material-ui/utils/colorManipulator';
import FlatButton from 'material-ui/FlatButton'; 
import spacing from 'material-ui/styles/spacing'; 
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AutoComplete from 'material-ui/AutoComplete';
import './assets/styles.css';  
import { ipcRenderer } from 'electron';
import Dialog from 'material-ui/Dialog';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Divider from 'material-ui/Divider';
import AppBar from 'material-ui/AppBar'; 
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import DropDownMenu from 'material-ui/DropDownMenu'; 
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton'; 
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import { Component } from "react"; 
import Paper from 'material-ui/Paper';
import { DraggableCore, DraggableEventHandler, DraggableData } from 'react-draggable';
import * as Draggable from 'react-draggable'; 
import { wrapMuiThemeLight, wrapMuiThemeDark, attachDispatchToProps} from "./utils"; 
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import { createStore, combineReducers } from "redux"; 
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
let uniqid = require("uniqid"); 

 

@connect((store,props) => store, attachDispatchToProps)   
export class LeftPanel extends Component<any,{}>{
        newProjectAnchor;
        
        constructor(props){ 
            super(props);  
            this.state={
                openPopover:false 
            } 
        }; 
 

        onNewProjectClick = (e:any) => {
            
        }

  
        onNewAreaClick = (e:any) => {
            
        }


        render(){ 
            return <div style={{
                display: "flex", 
                flexDirection: "column", 
                width: "26%",
                height: "100%",
                backgroundColor: "rgba(189, 189, 189, 0.2)" 
            }}>      
        
            <div 
            
            style={{ 
                display: "flex",
                padding: "10px"
            }}>   
 
            <div className="no-drag close"
                onClick = {() => ipcRenderer.send("close")}
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
                onClick = {() => ipcRenderer.send("reload")}
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
                onClick = {() => ipcRenderer.send("hide")} 
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
 
            <div  style={{width:"100%"}}>
                  
        <MenuList>
            <MenuItem 
            className="no-drag" 
            onClick={() => this.props.dispatch({
                type:"selectedCategory",
                load:"inbox"
            })}
            style={{
                paddingTop:"5px",
                paddingBottom:"5px", 
                paddingLeft:"5px", 
                paddingRight:"5px" 
            }}> 
                <ListItemIcon > 
                <Inbox style={{ color:"dodgerblue" }} />
                </ListItemIcon> 
                <ListItemText inset primary="Inbox" />
            </MenuItem>
            <div style={{width:"100%",height:"30px"}}></div>
            <MenuItem 
            onClick={() => this.props.dispatch({
                type:"selectedCategory",
                load:"today"
            })} 
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
                <div>1</div>
            </MenuItem>  

            <MenuItem 
            onClick={() => this.props.dispatch({
                type:"selectedCategory",
                load:"upcoming" 
            })}
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
            </MenuItem>
            <MenuItem 
            onClick={() => this.props.dispatch({
                type:"selectedCategory",
                load:"anytime"
            })}  
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
            </MenuItem> 
            <MenuItem 
            onClick={() => this.props.dispatch({
                type:"selectedCategory",
                load:"someday" 
            })} 
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
                <div>5</div>
            </MenuItem> 
            <div style={{width:"100%",height:"30px"}}></div>
            <MenuItem 
            onClick={() => this.props.dispatch({
                type:"selectedCategory",load:"logbook"
            })} 
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
                <div>3</div>
            </MenuItem> 
            <MenuItem 
            onClick={() => this.props.dispatch({
                type:"selectedCategory",load:"trash"
            })} 
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
            <div style={{width:"100%",height:"30px"}}></div>

         </MenuList> 
        </div>   





            <div style={{
                    display: "flex",
                    flexGrow: 1,
                    flexDirection: "column" 
                }}
                id="projects"
            >  
            
             <div 
                className="hoverBorder"
                key={uniqid()} 
                style={{
                    height:"20px",
                    width:"100%",
                    display:"flex",
                    alignItems: "center" 
                }}>  
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
                        New project 
                    </div>  
             </div>
                   
            </div>

      

            <NewProjectAreaPopover 
                anchor={this.newProjectAnchor}
                open={this.props.openNewProjectAreaPopover}
                close={ 
                    () => this.props.dispatch({
                        type:"openNewProjectAreaPopover",
                        load:false 
                    })
                }
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
                style={{       
                    display: "flex",  
                    alignItems: "center"    
                }}>  
                    <IconButton   
                    onClick = {() => this.props.dispatch({
                        type:"openNewProjectAreaPopover",
                        load:true 
                    })}    
                    iconStyle={{     
                        color:"rgb(79, 79, 79)",
                        width:"25px",
                        height:"25px"    
                    }}>       
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
 
 


