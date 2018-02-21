import '../../assets/styles.css';   
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';  
import { Component } from "react";  
import { Provider, connect } from "react-redux";
import Menu from 'material-ui/Menu';
import Star from 'material-ui/svg-icons/toggle/star';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import CheckBoxEmpty from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import CheckBox from 'material-ui/svg-icons/toggle/check-box'; 
import BusinessCase from 'material-ui/svg-icons/content/archive';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz'; 
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
import NewAreaIcon from 'material-ui/svg-icons/content/content-copy';
import Popover from 'material-ui/Popover'; 
  


interface NewProjectAreaPopupProps{
    anchor:HTMLElement,
    open:boolean,
    close:Function,
    onNewProjectClick: (e:any) => void,
    onNewAreaClick: (e:any) => void
}
  

 
export class NewProjectAreaPopup extends Component<NewProjectAreaPopupProps,{}>{
 
     constructor(props){ 
         super(props);
     }
 
     render(){
         return <Popover  
         style={{backgroundColor:"rgba(0,0,0,0)",background:"rgba(0,0,0,0)",borderRadius:"10px"}}     
         open={this.props.open}
         anchorEl={this.props.anchor}
         onRequestClose={() => this.props.close()}
         scrollableContainer={document.body}
         useLayerForClickAway={false} 
         anchorOrigin={{vertical: "top", horizontal: "left"}}  
         targetOrigin={{vertical: "bottom", horizontal: "left"}}  
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
         style={{display:"flex",alignItems:"flex-start",padding:"7px"}}> 
             <NewProjectIcon style={{color:"lightblue"}}/> 
             <div style={{
                 display: "flex",
                 flexDirection: "column",
                 alignItems: "flex-start",
                 paddingLeft: "5px",
                 paddingTop: "3px" 
             }}>    
                 <div style={{color:"aliceblue",fontFamily:"sans-serif",fontSize:"15px"}}>
                     New Project
                 </div>
                 <p style={{margin:"0px",paddingTop:"10px",color:"aliceblue",fontFamily:"sans-serif"}}>
                     Define a goal, 
                     then work towards it 
                     one task at a time.  
                 </p> 
             </div> 
         </div>
         <div style={{border:"1px solid rgba(200,200,200,0.1)",marginTop:"5px",marginBottom:"5px"}}></div> 
         <div   
         onClick = {this.props.onNewAreaClick}
         className="newprojectitem" 
         style={{display:"flex",alignItems: "flex-start",padding:"7px"}}> 
             <NewAreaIcon style={{color:"lightblue", width:"40px", height:"25px"}}/> 
             <div style={{
                 display: "flex",
                 flexDirection: "column",
                 alignItems: "flex-start",
                 paddingLeft: "5px",
                 paddingTop: "3px" 
             }}>    
                 <div style={{color:"aliceblue",fontFamily:"sans-serif",fontSize:"15px"}}> 
                     New Area
                 </div>
                 <p style={{
                     margin:"0px",
                     paddingTop:"10px",
                     color:"aliceblue",
                     fontFamily:"sans-serif",
                     width:"85%"  
                 }}>
                     Group your projects and tasks
                     based on different responsibilities,
                     such as Family or Work. 
                 </p> 
             </div> 
         </div>
          
         </div>   
     </Popover> 
    } 
}