import {isString,isCategory} from './isSomething';
import { assert } from './../utils/assert'; 
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import Inbox from 'material-ui/svg-icons/content/inbox';
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import {cond,equals} from 'ramda';
import Star from 'material-ui/svg-icons/toggle/star';
import Moon from 'material-ui/svg-icons/image/brightness-3';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import CheckBoxEmpty from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import CheckBox from 'material-ui/svg-icons/toggle/check-box'; 
import BusinessCase from 'material-ui/svg-icons/content/archive';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz'; 
import Layers from 'material-ui/svg-icons/maps/layers'; 
import Adjustments from 'material-ui/svg-icons/image/tune';
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Flag from 'material-ui/svg-icons/image/assistant-photo'; 
import NewProjectIcon from 'material-ui/svg-icons/image/timelapse';
import NewAreaIcon from 'material-ui/svg-icons/content/content-copy'; 
import Plus from 'material-ui/svg-icons/content/add';
import Trash from 'material-ui/svg-icons/action/delete';
import Search from 'material-ui/svg-icons/action/search'; 
import List from 'material-ui/svg-icons/action/list'; 
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Logbook from 'material-ui/svg-icons/av/library-books';
import Audiotrack from 'material-ui/svg-icons/image/audiotrack';
import { Category } from '../Components/MainContainer';
import Alert from 'material-ui/svg-icons/alert/add-alert';
import SearchIcon from 'material-ui/svg-icons/action/search'; 



export let chooseIcon = (size : { width:string, height:string }, selectedCategory : Category) => 
    cond([
        [
            equals("inbox"),
            () => <Inbox style={{
                ...size,
                ...{ 
                    color:"dodgerblue", 
                    cursor:"default" 
                }
            }}/> 
        ],

        [
            equals("today"),
            () => <Star style={{
                ...size,
                ...{
                    color:"gold", 
                    cursor:"default" 
                }
            }}/>
        ],

        [
            equals("upcoming"),
            () => <CalendarIco style={{
                ...size,
                ...{  
                    color:"crimson", 
                    cursor:"default"
                }
            }}/>
        ],

        [
            equals("next"),
            () => <Layers style={{
                ...size,
                ...{
                    color:"darkgreen", 
                    cursor:"default"
                } 
            }}/>
        ],

        [
            equals("someday"),
            () => <BusinessCase style={{
                ...size,
                ...{
                    color:"burlywood", 
                    cursor:"default"
                }
            }}/> 
        ],

        [
            equals("logbook"),
            () => <Logbook style={{
                ...size,    
                ...{
                    color:"limegreen", 
                    cursor:"default"
                }
            }}/>  
        ],

        [
            equals("trash"),
            () => <Trash style={{
                ...size,
                ...{
                    color:"darkgray", 
                    cursor:"default" 
                }
            }}/>
        ],

        [
            equals("evening"),
            () => <Moon style={{
                ...size,
                ...{  
                    transform:"rotate(145deg)", 
                    color:"cornflowerblue", 
                    cursor:"default" 
                }
            }}/>
        ],

        [
            equals("deadline"),
            () => <Flag style={{
                ...size,
                ...{   
                    color:"black",  
                    cursor:"default"  
                }
            }}/>
        ],

        [
            equals("area"),
            () => <NewAreaIcon style={{
                ...size,
                ...{
                    color:"lightblue"
                }
            }}/> 
        ],

        [
            equals("project"),
            () => <div>          
                <div style={{
                    ...size,
                    ...{ 
                        display: "flex",
                        borderRadius: "50px",
                        border: "3px solid rgb(10, 100, 240)",
                        justifyContent: "center",
                        position: "relative" 
                    }  
                }}>   
                </div>
            </div>   
        ],

        [
            equals("group"),
            () => <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}> 
                <Refresh  
                    style={{     
                        width:18,   
                        height:18, 
                        marginLeft:"3px", 
                        color:"black", 
                        cursor:"default", 
                        marginRight:"5px"  
                    }} 
                /> 
            </div>   
        ],

        [
            equals("reminder"),
            () => <div style={{display:"flex", alignItems:"center", position:"relative"}}>
                <Alert style={{
                    display:"flex", 
                    alignItems:"center",
                    color:"white", 
                    width:20,  
                    height:20, 
                    WebkitUserSelect:"none"
                }}/>
                <div style={{
                    width:"8px",
                    height:"8px", 
                    top:"6px",
                    left:"6px",  
                    position:"absolute",
                    backgroundColor:"white"
                }}> 
                </div>
            </div>
        ],
        [
            equals("search"),
            () => <SearchIcon style={{...size, color:"rgb(100, 100, 100)"}}/>  
        ],
        [
            () => true, () => null
        ]
    ])(selectedCategory);

    



