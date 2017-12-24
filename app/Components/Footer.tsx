import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
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
    


    shouldComponentUpdate(nextProps:FooterProps){
 
        return true; 
      
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
                this.props.buttonsNamesToDispaly.indexOf("NewTodo")===-1 ? null :
                <IconButton  
                    onClick = {this.props.onNewTodoClick} 
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
                this.props.buttonsNamesToDispaly.indexOf("Heading")===-1 ? null :
                <IconButton  
                    onClick = {this.props.onHeadingClick} 
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
                this.props.buttonsNamesToDispaly.indexOf("Calendar")===-1 ? null :
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
                this.props.buttonsNamesToDispaly.indexOf("Arrow")===-1 ? null :
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
                this.props.buttonsNamesToDispaly.indexOf("Trash")===-1 ? null :
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
                this.props.buttonsNamesToDispaly.indexOf("Search")===-1 ? null :
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
                this.props.buttonsNamesToDispaly.indexOf("More")===-1 ? null :
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