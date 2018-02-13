import {isString,isCategory} from './isSomething';
import { assert } from './utile/assert'; 
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import Inbox from 'material-ui/svg-icons/content/inbox';
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
import NewProjectIcon from 'material-ui/svg-icons/image/timelapse';
import NewAreaIcon from 'material-ui/svg-icons/maps/layers'; 
import Plus from 'material-ui/svg-icons/content/add';
import Trash from 'material-ui/svg-icons/action/delete';
import Search from 'material-ui/svg-icons/action/search'; 
import List from 'material-ui/svg-icons/action/list'; 
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Logbook from 'material-ui/svg-icons/av/library-books';
import Audiotrack from 'material-ui/svg-icons/image/audiotrack';


export let chooseIcon = (
    size : { width:string, height:string }, 
    selectedCategory : Category
) => {

    assert(isString(size.width),`Width is not a string. ${size.width}. chooseIcon.`);
    assert(isString(size.height), `Height is not a string. ${size.height}. chooseIcon.`);
    assert(isCategory(selectedCategory), `selectedCategory is not a category. ${size.height}. chooseIcon.`);
   
    switch(selectedCategory){  

        case "inbox":
            return <Inbox style={{
                ...size,
                ...{ 
                    color:"dodgerblue", 
                    cursor:"default" 
                }
            }} /> 

        case "today":
            return <Star style={{
                ...size,
                ...{
                    color:"gold", 
                    cursor:"default" 
                }
            }}/>

        case "upcoming":
            return <CalendarIco style={{
                ...size,
                ...{  
                    color:"crimson", 
                    cursor:"default"
                }
            }}/>

        case "next":
            return <Layers style={{
                ...size,
                ...{
                    color:"darkgreen", 
                    cursor:"default"
                } 
            }}/>

        case "someday":
            return <BusinessCase  style={{
                ...size,
                ...{
                    color:"burlywood", 
                    cursor:"default"
                }
            }}/>  
 
        case "logbook":
            return <Logbook style={{
                ...size,    
                ...{
                    color:"limegreen", 
                    cursor:"default"
                }
            }}/>  

        case "trash":
            return <Trash style={{
                ...size,
                ...{
                    color:"darkgray", 
                    cursor:"default" 
                }
            }}/>

        case "evening":
            return <Moon style={{
                ...size,
                ...{  
                    transform:"rotate(145deg)", 
                    color:"cornflowerblue", 
                    cursor:"default" 
                }
            }}/>;    
 
        case "deadline":
            return <Flag style={{
                ...size,
                ...{   
                    color:"black",  
                    cursor:"default"  
                }
            }}/>
            
        case "area":
            return <NewAreaIcon style={{
                ...size,
                ...{
                    color:"lightblue"
                }
            }}/>       
 
        case "project":
            return <div>          
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

        case "group":
            return <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}> 
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
 
        default:
            return <Inbox style={{  
                ...size,
                ...{  
                    color:"dodgerblue", 
                    cursor:"default"
                }   
            }}/> 
    }
}


