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
import { Todo, Project, Heading } from '../../database';
import { 
    uppercase, debounce, daysRemaining, dateDiffInDays, getTagsFromItems, 
    byCategory, byNotCompleted, byNotDeleted, daysLeftMark, getMonthName 
} from '../../utils';
import { arrayMove } from '../../sortable-hoc/utils';
import { ProjectMenuPopover } from './ProjectMenu';
import PieChart from 'react-minimal-pie-chart';
import Checked from 'material-ui/svg-icons/navigation/check';
import { DeadlineCalendar } from '../ThingsCalendar';
import { isNil, compose, allPass, isEmpty } from 'ramda';
import { Tags } from '../Tags';
import { TagsPopup } from '../TodoInput/TodoTags';
import { getProgressStatus } from './ProjectLink';
let moment = require("moment");  

interface ProjectHeaderProps{
    rootRef:HTMLElement, 
    name:string, 
    selectedTag:string,
    todos:Todo[],  
    description:string,
    created:Date,
    deadline:Date, 
    completed:Date,  
    tags:string[], 
    updateProjectDeadline:(value:Date) => void,
    updateProjectName:(value:string) => void,
    updateProjectDescription:(value:string) => void,
    attachTagToProject:(tag:string) => void,
    progress:{done:number,left:number}, 
    dispatch:Function   
}
     

  
interface ProjectHeaderState{
    projectMenuPopoverAnchor:HTMLElement,
    name:string, 
    description:string,
    showTagsPopup:boolean,
    showDeadlineCalendar:boolean   
}
  
    

export class ProjectHeader extends Component<ProjectHeaderProps,ProjectHeaderState>{

    projectMenuPopoverAnchor:HTMLElement;  
    inputRef:HTMLElement;  

    constructor(props){ 
         
        super(props);

        this.state = {
            projectMenuPopoverAnchor:null,
            name:this.props.name,
            description:this.props.description,
            showDeadlineCalendar:false,
            showTagsPopup:false    
        }
    }   
 
   

    componentDidMount(){ 
        if(this.inputRef && isEmpty(this.state.name)){
           this.inputRef.focus();  
        } 
 
        if(this.projectMenuPopoverAnchor){
           this.setState({projectMenuPopoverAnchor:this.projectMenuPopoverAnchor});
        }
    }
     
   

    componentWillReceiveProps(nextProps:ProjectHeaderProps, nextState:ProjectHeaderState){

        if(this.props.name!==nextProps.name){
           this.setState({name:nextProps.name});
        }

        if(this.props.description!==nextProps.description){
           this.setState({description:nextProps.description});
        }
           
        if(!this.state.projectMenuPopoverAnchor && !!this.projectMenuPopoverAnchor){
            this.setState({projectMenuPopoverAnchor:this.projectMenuPopoverAnchor});
        }
    }    
    

    updateProjectName = (value : string) => {
        this.setState({name:value}, () => this.props.updateProjectName(value));
    }
 

    updateProjectDescription = (newValue : string) => {    
        this.setState({description:newValue}, () => this.props.updateProjectDescription(newValue));
    }
 
    openMenu = (e) => this.props.dispatch({type:"showProjectMenuPopover", load:true});
    
    closeDeadlineCalendar = (e) => {
        this.setState({showDeadlineCalendar:false}); 
    }

    onDeadlineCalendarClear = (e) => {
        this.setState({showDeadlineCalendar:false});  
    }

    onDeadlineCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        let remaining = daysRemaining(day);
            
        if(remaining>=0){
           this.props.updateProjectDeadline(day); 
           this.setState({showDeadlineCalendar:false});  
        }
    };   
 
    render(){ 
        let {todos} = this.props;
        let {done,left} = this.props.progress; 
        let tags = getTagsFromItems(todos); 
          
        return <div>  
            <ProjectMenuPopover 
                {
                 ...{
                        anchorEl:this.state.projectMenuPopoverAnchor,
                        rootRef:this.props.rootRef,   
                        openDeadlineCalendar:() => {
                            this.setState({showDeadlineCalendar:true}) 
                        },    
                        openTagsPopup:() => { 
                            this.setState({showTagsPopup:true}) 
                        }    
                    } as any  
                }     
            />   
            {      
                !this.state.showDeadlineCalendar ? null : 
                <DeadlineCalendar  
                    close = {this.closeDeadlineCalendar}
                    onDayClick = {this.onDeadlineCalendarDayClick} 
                    open = {this.state.showDeadlineCalendar}  
                    origin = {{vertical:"top", horizontal:"left"}} 
                    point = {{vertical:"top", horizontal:"right"}} 
                    anchorEl = {this.projectMenuPopoverAnchor} 
                    onClear = {this.onDeadlineCalendarClear}
                    rootRef = {this.props.rootRef}
                /> 
            } 
            {
                !this.state.showTagsPopup ? null : 
                <TagsPopup    
                    tags = {this.props.tags} 
                    attachTag = {this.props.attachTagToProject} 
                    close = {() => this.setState({showTagsPopup:false})}
                    open = {this.state.showTagsPopup}    
                    anchorEl = {this.projectMenuPopoverAnchor} 
                    origin = {{vertical:"top", horizontal:"left"}} 
                    point = {{vertical:"top", horizontal:"right"}} 
                    rootRef = {this.props.rootRef}
                />
            } 
            <div style={{display:"flex", alignItems: "center"}}>
                <div style={{    
                    width: "30px",
                    height: "30px",
                    position: "relative",
                    borderRadius: "100px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "2px solid rgba(108, 135, 222, 1)",
                    boxSizing: "border-box",
                    marginRight: "10px"
                }}> 
                    <div style={{ 
                        width: "28px", 
                        height: "28px",
                        display: "flex", 
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative"
                    }}>   
                        <PieChart
                            animate={true}    
                            totalValue={done+left}
                            data={[{  
                                value:done,  
                                key:1,   
                                color:'rgba(108, 135, 222, 0.8)'  
                            }]}   
                            style={{  
                                width:"22px", 
                                height:"22px",
                                position:"absolute",
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center" 
                            }}
                        />     
                    </div>
                </div> 
                <div>
                    <AutosizeInput
                        ref={e => {this.inputRef=e;}}
                        type="text"
                        name="form-field-name" 
                        minWidth={"170px"}
                        inputStyle={{  
                            boxSizing:"content-box", 
                            height:"42px",
                            backgroundColor:"rgba(0,0,0,0)",
                            fontWeight:"bold", 
                            maxWidth:"450px",
                            fontFamily:"sans-serif",
                            border:"none",
                            fontSize:"26px",
                            outline:"none"  
                        }}  
                        value={this.state.name}
                        placeholder="New Project"  
                        onChange={(e) => this.updateProjectName(e.target.value)} 
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
                    ref={ (e) => { this.projectMenuPopoverAnchor=e; } }
                >
                        <ThreeDots style={{  
                            color:"rgb(179, 179, 179)",
                            width:"32px", 
                            height:"32px",
                            cursor: "pointer" 
                        }} />
                </div>   
            </div> 
            {     
                isNil(this.props.deadline) ? null :        
                <div style={{ 
                    paddingTop:'15px', 
                    cursor:"default",
                    WebkitUserSelect:"none", 
                    display:"flex",  
                    alignItems:"center",  
                    height:"30px"
                }}> 
                    <div style={{paddingRight:"5px", paddingTop:"5px"}}> 
                        <Flag style={{        
                            color:"black",   
                            cursor:"default",  
                            width:"20px",   
                            height:"20px"
                        }}/>   
                    </div>   
                    <div style={{color:"black", fontSize:"15px", fontWeight:"bold", paddingRight:"20px"}}>
                        {`Deadline: ${getMonthName(this.props.deadline).slice(0,3)}. ${this.props.deadline.getDate()}`} 
                    </div> 
                    <div> 
                        {daysLeftMark(false, this.props.deadline, 15)}
                    </div>   
                </div> 
            }  
            <div>                
                <TextField      
                    id = {"project_notes"}  
                    hintText = "Notes"      
                    hintStyle={{top:"12px"}}
                    value = {this.state.description}    
                    multiLine = {true}  
                    fullWidth = {true}   
                    onChange = {(event, newValue:string) => this.updateProjectDescription(newValue)} 
                    rows = {1}    
                    inputStyle = {{color:"rgba(100,100,100,0.7)", fontSize:"15px"}}   
                    underlineFocusStyle = {{borderColor:"rgba(0,0,0,0)"}}    
                    underlineStyle = {{borderColor:"rgba(0,0,0,0)"}}   
                />   
            </div>
            <div style={{paddingTop:"20px", paddingBottom:"40px"}}>  
                <Tags  
                    selectTag={(tag) => this.props.dispatch({type:"selectedTag", load:tag})}
                    tags={tags} 
                    selectedTag={this.props.selectedTag}
                    show={true}  
                /> 
            </div> 
        </div> 
    } 
}
 



