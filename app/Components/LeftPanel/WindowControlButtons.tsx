import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import Clear from 'material-ui/svg-icons/content/clear';
import Remove from 'material-ui/svg-icons/content/remove'; 
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import FullScreen from 'material-ui/svg-icons/image/crop-square';
 


interface WindowControlButtonsProps{
    windowId:number,
    leftPanelWidth:number,     
    toggleWindowSize:(e) => void 
} 
   


export class WindowControlButtons extends Component<WindowControlButtonsProps,{}>{


    render(){
        return <div 
            className="no-drag" 
            style={{ 
                zIndex: 2000,   
                position:"fixed",   
                width:`${this.props.leftPanelWidth}px`,
                top: "0px",
                left: "0px", 
                backgroundColor: "rgb(240, 240, 240)",  
                display: "flex",
                flexDirection: "row-reverse",
                alignItems: "center",
                justifyContent: "flex-end"
            }}   
        >  
      
        <IconButton 
            iconStyle={{color:"cadetblue",width:"20px",height:"20px"}}
            className="no-drag" 
            onTouchTap={() => ipcRenderer.send("hide",this.props.windowId)}
        >
            <Remove /> 
        </IconButton> 
    
    
        <IconButton 
            iconStyle={{color:"cadetblue",width:"20px",height:"20px"}}
            className="no-drag" 
            onTouchTap={this.props.toggleWindowSize}   
        >     
            <FullScreen />
        </IconButton>   
    
    
        <IconButton 
            iconStyle={{color:"cadetblue",width:"20px",height:"20px"}}
            className="no-drag" 
            onTouchTap={() => ipcRenderer.send("close", this.props.windowId)}
        >
            <Clear  /> 
        </IconButton>
    
    </div>  
  }
}

 



