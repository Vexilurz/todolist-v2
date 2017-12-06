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
import {
  cyan500, cyan700,   
  pinkA200,
  grey100, grey300, grey400, grey500,
  white, darkBlack, fullBlack,
} from 'material-ui/styles/colors'; 
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
import { reducer } from "./reducer"; 
//icons
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
let uniqid = require("uniqid"); 
//import MenuItem from 'material-ui/MenuItem';
import { ListItemIcon, ListItemText } from 'material-ui-next/List';
import { MenuList, MenuItem } from 'material-ui-next/Menu';
import NewProjectIcon from 'material-ui/svg-icons/image/timelapse';
import NewAreaIcon from 'material-ui/svg-icons/action/tab';
import Popover from 'material-ui/Popover';


interface LeftPanelState{
    openPopover:boolean
} 
  
export class LeftPanel extends Component<any,LeftPanelState>{
        newProjectAnchor;
        
        constructor(props){ 
            super(props); 
            this.state={
                openPopover:false 
            } 
        }; 
 
        render(){ 
            return <div style={{
                display: "flex", 
                flexDirection: "column", 
                width: "26%",
                height: "100%",
                backgroundColor: "rgba(189, 189, 189, 0.2)" 
            }}>      
        
            <div 
            className="no-drag"
            style={{ 
                display: "flex",
                padding: "10px"
            }}>   
 
            <div className="close"
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

            <div className="reload"
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
  
            <div className="hide"
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
 
            <div className="no-drag" style={{width:"100%"}}>
                  
        <MenuList>
            <MenuItem 
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
            {
                compose( 
                    map(
                        (n) => <div 
                        className="hoverBorder"
                        key={String(n)} 
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
                              Placeholder #{n}
                           </div>  
                        </div>
                    ),
                    range(0)
                )(15)  
            } 
            </div>

            <Popover  
                style={{
                    backgroundColor:"rgba(0,0,0,0)",
                    background:"rgba(0,0,0,0)",
                    borderRadius:"10px"
                }}    
                open={this.state.openPopover}
                anchorEl={this.newProjectAnchor}
                onRequestClose={() => this.setState({openPopover:false})}
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
 
                <div className="newprojectitem" style={{display:"flex", alignItems: "flex-start", padding:"7px"}}> 
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

                <div className="newprojectitem" style={{display:"flex", alignItems: "flex-start", padding:"7px"}}> 
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
                    onClick = {() => this.setState({openPopover:true})}  
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
 



/*<Menu   
    menuItemStyle={{
        width:"100%"
    }}
    listStyle={{
        width:"100%"
    }}
    style={{
        width:"100%"
    }}  
    //desktop={true}   
    >
    <MenuItem style={{
        width:"100%"
    }}   primaryText="Inbox" leftIcon={<Inbox />} />
    <div style={{width:"100%",height:"30px"}}></div>
    <MenuItem primaryText="Today" leftIcon={<Star />} />
    <MenuItem primaryText="Upcoming" leftIcon={<Calendar />} />

    <MenuItem primaryText="Anytime" leftIcon={<Layers />} />
    <MenuItem primaryText="Someday" leftIcon={<BusinessCase />} />
    <div style={{width:"100%",height:"30px"}}></div>
    <MenuItem primaryText="Logbook" leftIcon={<Logbook />} />
    <MenuItem primaryText="Trash" leftIcon={<Trash />} />
    <div style={{width:"100%",height:"30px"}}></div>
</Menu>*/


