import '../../assets/styles.css';   
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react";  
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
 
     shouldComponentUpdate(nextProps:NewProjectAreaPopupProps){
        return nextProps.open!==this.props.open;
     }   
 
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