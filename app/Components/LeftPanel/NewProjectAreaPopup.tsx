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
             backgroundColor:"rgb(238, 237, 239)", //"rgb(39, 43, 53)",
             padding: "5px 10px",
             borderRadius: "10px",
             maxHeight: "250px",
             width: "370px",
             cursor: "pointer" 
         }}>    
 
         <div 
         onClick = {this.props.onNewProjectClick}
         className="newprojectitem" 
         style={{
             display:"flex",
             alignItems:"flex-start",
             padding:"7px",
             color:"black"//"aliceblue",
         }}>   
             <NewProjectIcon style={{color:"rgb(69, 95, 145)"}} /> 
             <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                paddingLeft: "5px",
                paddingTop: "3px" 
             }}>    
                 <div style={{fontFamily:"sans-serif",fontSize:"16px"}}>
                    New Project
                 </div>
                 <p style={{
                    margin:"0px",
                    fontSize:"14px",
                    paddingTop:"10px",
                    fontFamily:"sans-serif"
                 }}>
                    Define a goal, 
                    then work towards it 
                    one task at a time.  
                 </p> 
             </div> 
         </div>
         <div style={{
            border:"1px solid rgba(200,200,200,0.5)",
            marginTop:"5px",
            marginBottom:"5px"
         }}>
         </div> 
         <div   
            onClick = {this.props.onNewAreaClick}
            className="newprojectitem" 
            style={{display:"flex",alignItems: "flex-start",padding:"7px"}}
         > 
            <NewAreaIcon style={{color:"rgb(69, 95, 145)",width:"40px",height:"25px"}}/> 
            <div style={{
                display: "flex",
                flexDirection: "column",
                color:"black",//"aliceblue",
                alignItems: "flex-start",
                paddingLeft: "5px",
                paddingTop: "3px" 
            }}>    
                <div style={{
                    fontFamily:"sans-serif",
                    fontSize:"16px"
                }}> 
                    New Area
                </div>
                <p style={{
                    margin:"0px",
                    paddingTop:"10px",
                    fontSize:"14px",
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