import '../assets/styles.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, uniq,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, any,
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, 
    groupBy, concat, flatten, toPairs, adjust, prepend, fromPairs 
} from 'ramda';
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react";
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz'; 
import Plus from 'material-ui/svg-icons/content/add';
import Search from 'material-ui/svg-icons/action/search'; 
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Logbook from 'material-ui/svg-icons/av/library-books';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import Heading from 'material-ui/svg-icons/action/label-outline';

 
export type ButtonName = "NewTodo" | "Calendar" | "Arrow" | "Search" | "More" | "Trash" | "Heading";  


 
interface FooterProps{
    buttonsNamesToDispaly:ButtonName[],
    onNewTodoClick:Function, 
    onCalendarClick:Function, 
    onArrowClick:Function, 
    onSearchClick:Function, 
    onMoreClick:Function, 
    onTrashClick:Function,
    onHeadingClick:Function   
}

 

export class Footer extends Component<FooterProps,{}>{

    constructor(props){
      super(props);
    }    
  
    shouldComponentUpdate(nextProps){
      //may fail 
      return this.props.buttonsNamesToDispaly.length!==nextProps.buttonsNamesToDispaly.length; 
    } 
    
    render(){
        return <div style={{    
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            position: "absolute",
            bottom: 0,
            backgroundColor: "white", 
            width: "70%",
            height: "60px"      
        }}>

            {  
                !contains("NewTodo")(this.props.buttonsNamesToDispaly as any) ? null :
                <IconButton  
                    onClick = {this.props.onNewTodoClick}
                    tooltip="New To-Do"
                    tooltipPosition="top-center"
                    iconStyle={{ 
                        color:"rgb(79, 79, 79)", 
                        width:"25px", 
                        height:"25px"  
                    }}
                >      
                    <Plus />
                </IconButton> 

            }

 
{  
                !contains("Heading")(this.props.buttonsNamesToDispaly as any) ? null :
                <IconButton  
                    onClick = {this.props.onHeadingClick}
                    tooltip="New heading"
                    tooltipPosition="top-center" 
                    iconStyle={{ 
                        color:"rgb(79, 79, 79)", 
                        width:"25px", 
                        height:"25px"  
                    }}
                >      
                    <Heading />
                </IconButton> 

            }





            {  
                !contains("Calendar")(this.props.buttonsNamesToDispaly as any) ? null :
                <div>
                    <IconButton 
                        onClick = {this.props.onCalendarClick}
                        iconStyle={{ 
                            color:"rgb(79, 79, 79)",
                            width:"25px",  
                            height:"25px" 
                        }} 
                    >     
                        <CalendarIco />
                    </IconButton> 
                </div>
            }


            {
                !contains("Arrow")(this.props.buttonsNamesToDispaly as any) ? null :
                <IconButton 
                    onClick = {this.props.onArrowClick}
                    iconStyle={{ 
                        color:"rgb(79, 79, 79)",
                        width:"25px", 
                        height:"25px" 
                    }} 
                >     
                    <Arrow />
                </IconButton>  
            }
            

            {
                !contains("Trash")(this.props.buttonsNamesToDispaly as any) ? null :
                        <IconButton 
                            onClick = {this.props.onTrashClick}
                            iconStyle={{ 
                                color:"rgb(79, 79, 79)",
                                width:"25px", 
                                height:"25px" 
                            }}
                        >      
                            <TrashIcon />
                        </IconButton> 
            }  


            {
                !contains("Search")(this.props.buttonsNamesToDispaly as any) ? null :
                        <IconButton 
                            onClick = {this.props.onSearchClick}
                            iconStyle={{  
                                color:"rgb(79, 79, 79)",
                                width:"25px", 
                                height:"25px" 
                            }}
                        >     
                            <Search />
                        </IconButton> 
            }

  
            {
                !contains("More")(this.props.buttonsNamesToDispaly as any) ? null :
                        <IconButton 
                            onClick = {this.props.onMoreClick}
                            iconStyle={{  
                                color:"rgb(79, 79, 79)",
                                width:"25px", 
                                height:"25px" 
                            }}
                        >     
                            <ThreeDots />
                        </IconButton>  
            }
            
        </div>
    }

} 