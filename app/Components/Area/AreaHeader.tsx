
import NewAreaIcon from 'material-ui/svg-icons/action/tab';
import '../../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom';  
import { Provider } from "react-redux";
import { Transition } from 'react-transition-group';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Popover from 'material-ui/Popover';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Repeat from 'material-ui/svg-icons/av/repeat';
import Inbox from 'material-ui/svg-icons/content/inbox';
import Duplicate from 'material-ui/svg-icons/content/content-copy';
import ShareIcon from 'material-ui/svg-icons/social/share';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import { TextField } from 'material-ui';
import AutosizeInput from 'react-input-autosize'; 
import { Todo, Project, Heading, Area } from '../../database';
import { uppercase, debounce, diffDays, daysRemaining } from '../../utils';
import { arrayMove } from '../../sortable-hoc/utils';
import PieChart from 'react-minimal-pie-chart';
import Checked from 'material-ui/svg-icons/navigation/check';
import { ProjectMenuPopover } from '../Project/ProjectMenu';




interface AreaHeaderProps{
    name:string, 
    selectedAreaId:string,
    areas:Area[],
    updateAreaName:(value:string) => void,
    dispatch:Function  
}
  
  

  
interface AreaHeaderState{
    menuAnchor:HTMLElement,
    openMenu:boolean,
    name:string   
} 
   
 

export class AreaHeader extends Component<AreaHeaderProps,AreaHeaderState>{

    menuAnchor:HTMLElement;  
  

    constructor(props){ 
         
        super(props);
        
        this.state = {
            menuAnchor:null,
            openMenu:false,
            name:this.props.name   
        }; 
   
    }  



    shouldComponentUpdate(nextProps, nextState){
        
        let should = false;  

        if(this.state.menuAnchor!==nextState.menuAnchor)
           should = true;

        if(this.state.openMenu!==nextState.openMenu)
           should = true;

        if(this.state.name!==nextState.name)
           should = true; 
             
        if(nextProps.name!==this.props.name)
           should = true;

        if(nextProps.selectedAreaId!==this.props.selectedAreaId)
           should = true;
          
        return should;    

    } 




    componentDidMount(){ 
  
        if(this.menuAnchor)
           this.setState({menuAnchor:this.menuAnchor});

    }



    openMenu = () => {

        this.setState({openMenu:true});

    }
 


    closeMenu = () => { 

        this.setState({openMenu:false});

    } 
 


    onAddTags = () => {

    }
 


    onDeleteArea = () => {

        let area = this.props.areas.find( (a:Area) => a._id===this.props.selectedAreaId ); 

        if(!area)
           return; 

        this.props.dispatch({type:"updateArea", load:{...area, deleted:new Date()}});
         
    }

 
  
    updateAreaName = (event) => { 

        this.setState(
            {name:event.target.value},  
            () => this.props.updateAreaName(this.state.name) 
        ); 
    
    }
  
    
     
    render(){ 
     
    
     return <div>  


            <div style={{display:"flex", alignItems: "center"}}>

 
                <div style={{    
                       width: "30px",
                       height: "30px",
                       position: "relative",
                       display: "flex",
                       justifyContent: "center",
                       alignItems: "center",
                       boxSizing: "border-box",
                       marginRight: "10px"
                }}> 
                    <NewAreaIcon style={{
                        color:"lightblue", 
                        width: "30px",
                        height: "30px"
                    }}/>    
                </div> 
                


                <div>
                    <AutosizeInput
                        type="text"
                        name="form-field-name" 
                        minWidth={"170px"}
                        inputStyle={{  
                            boxSizing: "content-box", 
                            height: "42px",
                            fontWeight: "bold", 
                            maxWidth:"450px",
                            fontFamily: "sans-serif",
                            border: "none",
                            fontSize: "26px",
                            outline: "none"  
                        }}     
                        value={this.state.name}
                        placeholder="New Area" 
                        onChange={this.updateAreaName} 
                    />  
                </div>   



                <div    
                    onClick={this.openMenu}  
                    style={{ 
                        marginLeft: "5px",
                        marginRight: "5px",
                        width: "32px",
                        height: "32px",
                        cursor: "pointer"
                    }}  
                    ref={ (e) => { this.menuAnchor=e; } }
                >
                        <ThreeDots style={{  
                            color:"rgb(179, 179, 179)",
                            width:"32px", 
                            height:"32px",
                            cursor: "pointer" 
                        }} />
                </div> 



                <AreaMenu
                    open={this.state.openMenu}
                    close={this.closeMenu}
                    onAddTags={this.onAddTags}
                    onDeleteArea={this.onDeleteArea}
                    anchorEl={this.state.menuAnchor}  
                />
                    


            </div>
        </div> 
    }

}
 

 


interface AreaMenuProps{
    open : boolean,
    close : Function,
    onAddTags : Function,
    onDeleteArea : Function,
    anchorEl : HTMLElement  
}    
 
interface AreaMenuState{}

   
export class AreaMenu extends Component<AreaMenuProps,AreaMenuState>{
 
    constructor(props){ 
        super(props); 
    }  



    render(){  
          
        return <Popover 
            className="nocolor"
            style={{
                marginTop:"20px", 
                backgroundColor:"rgba(0,0,0,0)",
                background:"rgba(0,0,0,0)",
                borderRadius:"10px"
            }}   
            open={this.props.open}
            anchorEl={this.props.anchorEl}   
            onRequestClose={this.props.close}  
            anchorOrigin={{vertical: "center", horizontal: "middle"}} 
            targetOrigin={{vertical: "top", horizontal: "middle"}} 
        >   
            <div  className={"darkscroll"}
                  style={{  
                    backgroundColor: "rgb(39, 43, 53)",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    borderRadius: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    cursor:"pointer" 
                  }} 
            >      
                    <div   
                        onClick={this.props.onAddTags as any} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <TriangleLabel style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Add tags  
                        </div>     
                    </div>
                

                    <div style={{
                        border:"1px solid rgba(200,200,200,0.1)",
                        marginTop: "5px",
                        marginBottom: "5px"
                    }}>
                    </div> 
                 
 
                    <div    
                        onClick={this.props.onDeleteArea as any} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <TrashIcon style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Delete Area
                        </div>     
                    </div>

            </div> 
        </Popover> 


    }

}

