import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import IconMenu from 'material-ui/IconMenu'; 
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { Spinner } from '../Spinner';
import { 
    attachDispatchToProps, generateEmptyProject, generateEmptyArea, 
    byNotCompleted, byNotDeleted, byTags, byCategory, byCompleted, 
    byDeleted, byAttachedToProject, isTodayOrPast, isDeadlineTodayOrPast, 
    anyTrue
} from "../../utils/utils";  
import { ipcRenderer } from 'electron';
import Adjustments from 'material-ui/svg-icons/image/tune';
import Plus from 'material-ui/svg-icons/content/add';  
import { Todo, Project, Area, Category, Store } from '../../types';
import { ResizableHandle } from './../ResizableHandle';
import { NewProjectAreaPopup } from './NewProjectAreaPopup';
import { allPass, isNil, not, flatten, contains } from 'ramda';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { googleAnalytics } from '../../analytics';
import { isArrayOfStrings, isString } from '../../utils/isSomething';
import { isDev } from '../../utils/isDev';



interface FooterProps{
    width:number,
    collapsed:boolean,
    openNewProjectAreaPopup:(e:any) => void,
    setNewProjectAnchor:(e:any) => void,
    openSettings:(e:any) => void,
    openSyncSettings:(e:any) => void 
}

interface FooterState{}

export class Footer extends Component<FooterProps,FooterState>{
  
    constructor(props){
        super(props); 
    }



    shouldComponentUpdate(nextProps:FooterProps){
        return nextProps.width!==this.props.width || 
               nextProps.collapsed!==this.props.collapsed;
    }
 

    
    render(){ 
        let { collapsed, openSettings, openNewProjectAreaPopup, width, setNewProjectAnchor } = this.props; 

        return <div style={{    
            transition: "width 0.2s ease-in-out", 
            width:collapsed ? "0px" : `${width}px`,
            display:"flex",  
            alignItems:"center",  
            position:"fixed",    
            overflowX: "hidden",
            justifyContent:"space-between",  
            bottom:"0px",   
            height:"60px",
            backgroundColor:"rgb(248, 248, 248)",
            borderTop:"1px solid rgba(100, 100, 100, 0.2)"
        }}>    
            <div  
                onClick={openNewProjectAreaPopup}
                style={{
                    display:"flex",
                    paddingLeft:"10px",
                    alignItems:"center",
                    cursor:"pointer"
                }}
            >     
                <div 
                    style={{
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center"
                    }}
                    ref={setNewProjectAnchor}
                >
                    <Plus    
                        style = {{     
                            color:"rgb(79, 79, 79)",
                            width:"25px",
                            height:"25px",
                            paddingLeft: "5px",
                            paddingRight: "5px"     
                        }}
                    />
                </div>    
            </div>   
            <div style={{flexGrow:1, display:"flex", justifyContent:"flex-end"}}> 
                <Spinner openSyncSettings={this.props.openSyncSettings}/> 
            </div>            
            <div style={{display:"flex", paddingRight:"10px", alignItems:"center", cursor:"pointer"}}>     
                <IconButton    
                    onClick={(e) => openSettings(e)}  
                    iconStyle={{color:"rgba(100, 100, 100, 1)", width:"25px", height:"25px"}}
                >        
                    <Adjustments /> 
                </IconButton>  
            </div> 
        </div> 
    }
};


