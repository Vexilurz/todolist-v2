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



 
export class LeftPanel extends Component<any,any>{
     
        constructor(props){ 
            super(props); 
        };
      
        render(){ 
            return <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                width: "26%",
                height: "100%",
                backgroundColor: "rgba(189, 189, 189, 0.2)" 
            }}>   
        
            <div className="no-drag">
                { 
                    [
                     "close",
                     "reload",
                     "hide"
                    ].map(
                            (type) => <IconButton  
                                key={uniqid()}   
                                onClick = {() => ipcRenderer.send(type)}
                                tooltip = {type} 
                                iconStyle={{
                                    color:"rgba(159,159,159,0.5)", 
                                    width:"20px",
                                    height:"20px"
                                }}
                            >
                                <Circle /> 
                            </IconButton>
                        )
                }
            </div>  
 
            <div style={{width:"100%"}}>
                
        <MenuList>
            <MenuItem style={{
                paddingTop:"5px",
                paddingBottom:"5px", 
                paddingLeft:"5px", 
                paddingRight:"5px" 
            }}> 
                <ListItemIcon > 
                <Inbox />
                </ListItemIcon>
                <ListItemText inset primary="Inbox" />
            </MenuItem>
            <div style={{width:"100%",height:"30px"}}></div>
            <MenuItem style={{
                paddingTop:"5px",
                paddingBottom:"5px", 
                paddingLeft:"5px", 
                paddingRight:"5px" 
            }}>
                <ListItemIcon >  
                <Star />  
                </ListItemIcon>
                <ListItemText  inset primary="Today" />
                <div>1</div>
            </MenuItem> 
            <MenuItem style={{
                paddingTop:"5px",
                paddingBottom:"5px", 
                paddingLeft:"5px", 
                paddingRight:"5px" 
            }}> 
                <ListItemIcon > 
                <Calendar />
                </ListItemIcon>
                <ListItemText  inset primary="Upcoming" />
            </MenuItem>
            <MenuItem style={{
                paddingTop:"5px",
                paddingBottom:"5px", 
                paddingLeft:"5px", 
                paddingRight:"5px" 
            }}> 
                <ListItemIcon > 
                <Layers />
                </ListItemIcon>
                <ListItemText  inset primary="Anytime" />
            </MenuItem> 
            <MenuItem style={{
                paddingTop:"5px",
                paddingBottom:"5px", 
                paddingLeft:"5px", 
                paddingRight:"5px" 
            }}> 
                <ListItemIcon > 
                <BusinessCase /> 
                </ListItemIcon>
                <ListItemText  inset primary="Someday" />
                <div>5</div>
            </MenuItem> 
            <div style={{width:"100%",height:"30px"}}></div>
            <MenuItem style={{
                paddingTop:"5px",
                paddingBottom:"5px", 
                paddingLeft:"5px", 
                paddingRight:"5px" 
            }}>  
                <ListItemIcon > 
                <Logbook /> 
                </ListItemIcon>
                <ListItemText  inset primary="Logbook" />
                <div>3</div>
            </MenuItem>
            <MenuItem style={{
                paddingTop:"5px",
                paddingBottom:"5px", 
                paddingLeft:"5px", 
                paddingRight:"5px" 
            }}> 
                <ListItemIcon >  
                <Trash />
                </ListItemIcon>
                <ListItemText  inset primary="Trash" />
            </MenuItem>
            <div style={{width:"100%",height:"30px"}}></div>

         </MenuList> 
        </div>   
 
            {
                compose(
                    map(
                        (n) => <div 
                        key={uniqid()} 
                        style={{
                            height:"20px",
                            width:"100%",
                            display:"flex",
                            alignItems: "center" 
                        }}>  
                           <IconButton    
                                key={uniqid()}   
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
                )(5) 
            }
            
             
            <div style={{  
                display: "flex",
                alignItems: "center",
                position: "sticky",
                bottom:0, 
                height: "60px",
                backgroundColor: "rgba(235, 235, 235, 1)",
                borderTop: "1px solid rgba(100, 100, 100, 0.2)"
            }}>   
                <div style={{     
                    display: "flex",  
                    alignItems: "center",
                    width: "270px" 
                }}>  
                    <IconButton   
                    onClick = {() => console.log("Add new list")} 
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

                <div style={{ 
                    position: "absolute",
                    right: "10px",
                    top: "0px" 
                }}>   
                    <IconButton   
                    onClick = {() => console.log("")} 
                    iconStyle={{  
                        padding: "5px",
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


