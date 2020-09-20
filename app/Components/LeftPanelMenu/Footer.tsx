import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { Spinner } from '../Spinner';
import Adjustments from 'material-ui/svg-icons/image/tune';
import Plus from 'material-ui/svg-icons/content/add';  
import Exclamation from 'material-ui/svg-icons/notification/priority-high'; 
import Logbook from 'material-ui/svg-icons/av/library-books';
import Trash from 'material-ui/svg-icons/action/delete';




interface FooterProps{
    width:number,
    drag:boolean,
    collapsed:boolean,
    sync:boolean,
    dispatch:Function,    
    openNewProjectAreaPopup:(e:any) => void,
    setNewProjectAnchor:(e:any) => void,
    openSettings:(e:any) => void,
    openSyncSettings:(e:any) => void,
    logbook:number,
    trash:number 
}



interface FooterState{}

 

export class Footer extends Component<FooterProps,FooterState>{
  
    constructor(props){
        super(props); 
    }

    //todo: this is copy/paste from CategoryMenu.tsx
    onClick = (title:string) => () => {
        
        this.props.dispatch({
            type:"multiple",
            load:[
                {type:"selectedCategory",load:title},
                {type:"showProjectMenuPopover",load:false}, 
                {type:"searchQuery",load:""},
                {type:"selectedTags",load:["All"]} 
            ]
        }); 
    }

    render(){ 
        let {collapsed, openSettings, openNewProjectAreaPopup, width, setNewProjectAnchor, drag} = this.props; 

        return <div style={{    
            transition:drag ? "":"width 0.2s ease-in-out", 
            width:collapsed ? "0px":`${width}px`, 
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
                style={{display:"flex",paddingLeft:"10px",alignItems:"center",cursor:"pointer"}}
            >     
                <div 
                    style={{display:"flex",alignItems:"center",justifyContent:"center"}}
                    ref={setNewProjectAnchor}
                >
                    <Plus 
                        style={{     
                            color:"rgb(79,79,79)",
                            width:"25px",
                            height:"25px",
                            paddingLeft: "5px",
                            paddingRight: "5px"     
                        }} 
                    />
                </div>    
            </div>     
            {
                this.props.logbook===0 ? null :
                <IconButton    
                    onClick={this.onClick("logbook")}  
                    iconStyle={{color:"darkgray",width:"25px",height:"25px"}}
                >        
                    <Logbook style={{color:"darkgray"}}/> 
                </IconButton> 
            }
            {
                this.props.trash===0 ? null :
                <IconButton    
                onClick={this.onClick("trash")}  
                iconStyle={{color:"darkgray",width:"25px",height:"25px"}}
                >        
                    <Trash style={{color:"darkgray"}}/> 
                </IconButton>
            }               
            <div style={{display:"flex",paddingRight:"10px",alignItems:"center",cursor:"pointer"}}>     
                <IconButton    
                    onClick={(e) => openSettings(e)}  
                    iconStyle={{color:"rgba(100, 100, 100, 1)",width:"25px",height:"25px"}}
                >        
                    <Adjustments />  
                </IconButton>  
            </div> 
        </div> 
    }
};


