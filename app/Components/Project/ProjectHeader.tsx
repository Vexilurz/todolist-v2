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
import Button from 'material-ui-next/Button';
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
    created:Date,
    deadline:Date,
    completed:Date,
    updateProjectName:(value:string) => void,
    updateProjectDescription:(value:string) => void,
    dispatch:Function  
}
  

  
interface ProjectHeaderState{
    projectMenuPopoverAnchor:HTMLElement 
}
  


export class ProjectHeader extends Component<ProjectHeaderProps,ProjectHeaderState>{

    projectMenuPopoverAnchor:HTMLElement;  
  

    constructor(props){ 
         
        super(props);
        this.state = {
            projectMenuPopoverAnchor:null 
        }
 
    }  

 

    componentDidMount(){

        if(this.projectMenuPopoverAnchor){
 
            this.setState({
                projectMenuPopoverAnchor:this.projectMenuPopoverAnchor
            })

        }

    }
 
 
 
    shouldComponentUpdate(nextProps:ProjectHeaderProps){
  
        return true;    

    }
 


    openMenu = (e) => this.props.dispatch({type:"showProjectMenuPopover", load:true})
   

    render(){
     
     let days = diffDays(this.props.created,this.props.deadline);    

     let remaining = daysRemaining(this.props.deadline);     
     
     return <div>  

            <ProjectMenuPopover 
                 {...{anchorEl:this.state.projectMenuPopoverAnchor} as any}
            />     
    

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
                        { 
                            this.props.completed===undefined ? null : 
                            <div style={{ width: "22px", height: "22px"}}> 
                                <Checked style={{ 
                                    color:"white", width: "22px",
                                    height: "22px",
                                    position: "absolute",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center" 
                                }}/>
                            </div>  
                        }
                        <PieChart
                            animate={true}   
                            //radius={50} 
                            totalValue={days}
                            data={[{ 
                                value:remaining,  
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
                        value={this.props.name}
                        placeholder="New Project"
                        onChange={event => this.props.updateProjectName(event.target.value)} 
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




            <TextField   
                id = {"project_notes"}
                hintText = "Notes"   
                defaultValue = {this.props.description}    
                multiLine = {true}  
                fullWidth = {true}   
                onChange = {(event, newValue:string) => this.props.updateProjectDescription(newValue)} 
                rows = {4}   
                inputStyle = {{color:"rgba(100,100,100,0.7)", fontSize:"15px"}}   
                underlineFocusStyle = {{borderColor: "rgba(0,0,0,0)"}}    
                underlineStyle = {{borderColor: "rgba(0,0,0,0)"}}   
            />  
    

 

        </div> 
    }

}
 



