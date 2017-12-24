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
import { uppercase, debounce, diffDays, daysRemaining } from '../../utils';
import { arrayMove } from '../../sortable-hoc/utils';
import { ProjectMenuPopover } from './ProjectMenu';
import PieChart from 'react-minimal-pie-chart';
import Checked from 'material-ui/svg-icons/navigation/check';



interface ProjectHeaderProps{
    name:string, 
    description:string,
    created:string,
    deadline:string,
    completed:string,
    updateProjectName:(value:string) => void,
    updateProjectDescription:(value:string) => void,
    dispatch:Function  
}
   

  
interface ProjectHeaderState{
    projectMenuPopoverAnchor:HTMLElement,
    name:string,
    description:string  
}
  
  

export class ProjectHeader extends Component<ProjectHeaderProps,ProjectHeaderState>{

    projectMenuPopoverAnchor:HTMLElement;  
  
    constructor(props){ 
         
        super(props);

        this.state = {
            projectMenuPopoverAnchor:null,
            name:this.props.name,
            description:this.props.description  
        }
 
    }   
 
 

    componentDidMount(){

        if(this.projectMenuPopoverAnchor)
           this.setState({projectMenuPopoverAnchor:this.projectMenuPopoverAnchor});
 
    }
    
   

    componentWillReceiveProps(nextProps:ProjectHeaderProps, nextState:ProjectHeaderState){

        if(this.props.name!==nextProps.name)
           this.setState({name:nextProps.name});


        if(this.props.description!==nextProps.description)
           this.setState({description:nextProps.description});
           
 
        if(!this.state.projectMenuPopoverAnchor && !!this.projectMenuPopoverAnchor)
            this.setState({projectMenuPopoverAnchor:this.projectMenuPopoverAnchor});
  
    }    
    
      
 
    shouldComponentUpdate(nextProps:ProjectHeaderProps, nextState:ProjectHeaderState){

        let should = false; 
 
        if(this.state.projectMenuPopoverAnchor!==nextState.projectMenuPopoverAnchor)
           should = true;

        if(this.props.name!==nextProps.name)
            should = true;
        if(this.props.description!==nextProps.description)
            should = true;   

        if(this.state.name!==nextState.name)
            should = true; 
            
        if(this.state.description!==nextState.description)
            should = true;      

        if(this.props.created!==nextProps.created)
            should = true;
        if(this.props.deadline!==nextProps.deadline)
            should = true;
        if(this.props.completed!==nextProps.completed)
            should = true;
  

        return should;    

    }
    
    

    updateProjectName = (value : string) => {
        this.setState({name:value}, () => this.props.updateProjectName(value));
    }
 


    updateProjectDescription = (newValue : string) => {    
        this.setState({description:newValue}, () => this.props.updateProjectDescription(newValue));
    }
 
 

    openMenu = (e) => this.props.dispatch({type:"showProjectMenuPopover", load:true})
   


    render(){ 
     
        let days = diffDays(new Date(this.props.created),new Date(this.props.deadline));    

        let remaining = daysRemaining(new Date(this.props.deadline));     
      
        return <div>  

            <ProjectMenuPopover {...{anchorEl:this.state.projectMenuPopoverAnchor} as any} />  
              
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
                            totalValue={days}
                            data={[{  
                                value:this.props.completed ? days : (days-remaining),  
                                key:1,   
                                color:'rgba(108, 135, 222, 0.8)'  
                            }]}   
                            style={{ 
                                width: "22px", 
                                height: "22px",
                                position: "absolute",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center" 
                            }}
                        />     
                    </div>
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
            <div style={{paddingTop:"10px"}}>                
                <TextField      
                    id = {"project_notes"} 
                    hintText = "Notes"      
                    hintStyle={{top:"12px"}}
                    value = {this.state.description}    
                    multiLine = {true}  
                    fullWidth = {true}   
                    onChange = {(event, newValue:string) => this.updateProjectDescription(newValue)} 
                    rows = {3}   
                    inputStyle = {{color:"rgba(100,100,100,0.7)", fontSize:"15px"}}   
                    underlineFocusStyle = {{borderColor: "rgba(0,0,0,0)"}}    
                    underlineStyle = {{borderColor: "rgba(0,0,0,0)"}}   
                />  
            </div>
        </div> 
    }

}
 



