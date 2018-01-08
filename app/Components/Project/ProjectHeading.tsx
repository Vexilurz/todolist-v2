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
import { Todo, Project, Heading, LayoutItem } from '../../database';
import { uppercase, debounce } from '../../utils';
import { arrayMove } from '../../sortable-hoc/utils';

 

interface ProjectHeadingProps{
    heading : Heading,
    rootRef : HTMLElement, 
    onChange : (heading_id:string, newValue:string) => void,
    onArchive : (heading_id:string) => void,
    onMove : (heading_id:string) => void,  
    onRemove : (heading_id:string) => void
}

 

interface ProjectHeadingState{
    open:boolean
}
 
   
  
export class ProjectHeading extends Component<ProjectHeadingProps,ProjectHeadingState>{

    actionsAnchor:HTMLElement; 

    constructor(props){ 
        super(props);
        this.state = { 
            open:false
        }
    } 

    render(){
        return <div>
        <div   
            className="projectHeading" 
            style={{ 
                display:"flex",
                height:"30px",
                alignItems:"center",
                justifyContent:"space-between"
            }} 
        >      
            <div style={{width:"100%", paddingLeft:"10px", WebkitUserSelect: "none"}}>  
                <div style={{display:"flex", WebkitUserSelect: "none"}}>   
                    <TextField   
                        hintText = "Heading"     
                        id = {this.props.heading.key} 
                        defaultValue = {uppercase(this.props.heading.title)} 
                        fullWidth = {true}   
                        onChange = {(event, newValue:string) => this.props.onChange(this.props.heading._id, newValue)}
                        inputStyle = {{
                            fontWeight:600, color:"rgba(10,110,205,1)", 
                            fontSize:"16px",  WebkitUserSelect: "none"
                        }}  
                        hintStyle = {{
                            top:"3px", left:0, width:"100%", 
                            height:"100%", WebkitUserSelect:"none"
                        }}   
                        style = {{height:"30px", WebkitUserSelect: "none"}}      
                        underlineFocusStyle = {{borderColor:"rgba(0,0,0,0)"}}    
                        underlineStyle = {{borderColor:"rgba(0,0,0,0)"}}  
                    /> 
                </div>  
            </div> 

            <div   
                onClick = {() => this.setState({open:true})}  
                style={{
                    marginLeft: "5px", 
                    marginRight: "5px", 
                    width: "30px",
                    height: "30px",
                    cursor: "pointer"
                }}
                ref={ (e) => { this.actionsAnchor=e; } }
            > 
                <ThreeDots style={{  
                    color:"dodgerblue",
                    width:"30px", 
                    height:"30px",
                    cursor: "pointer" 
                }} />
            </div> 

        </div>


        <div>

            <Popover 
                className="nocolor"
                style={{
                    marginTop:"20px", 
                    backgroundColor:"rgba(0,0,0,0)",
                    background:"rgba(0,0,0,0)",
                    borderRadius:"10px"
                }}    
                scrollableContainer={this.props.rootRef}
                useLayerForClickAway={false}  
                open={this.state.open}
                onRequestClose={() => this.setState({open:false})}
                origin={{vertical: "center", horizontal: "middle"}}  
                anchorEl={this.actionsAnchor} 
                point={{vertical: "top", horizontal: "middle"}} 
            >   
                <div    
                    className={"darkscroll"}
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
                        onClick={() => this.props.onArchive(this.props.heading._id) as any} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <Duplicate style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Archive
                        </div>     
                    </div>
                    

                    <div  
                        onClick={() => this.props.onMove(this.props.heading._id) as any} 
                        className={"tagItem"} style={{
                            display:"flex",  
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >   
                        <Arrow style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Move 
                        </div>     
                    </div> 

                    <div   
                        onClick={() => this.props.onRemove(this.props.heading._id)  as any} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <TrashIcon style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Remove 
                        </div>     
                    </div>
                </div> 
            </Popover> 
        </div>    
        </div>
    }
}