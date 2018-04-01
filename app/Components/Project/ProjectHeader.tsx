import '../../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom';  
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react";  
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import { Todo, Project } from '../../types';
import { getTagsFromItems, daysLeftMark, getMonthName } from '../../utils/utils';
import { ProjectMenuPopover } from './ProjectMenu';
import PieChart from 'react-minimal-pie-chart';
import Checked from 'material-ui/svg-icons/navigation/check';
import { DeadlineCalendar } from '../ThingsCalendar'; 
import { isNil, isEmpty, not } from 'ramda';
import { Tags } from '../Tags';
import { TagsPopup } from '../TodoInput/TagsPopup';
import AutosizeInput from 'react-input-autosize';
import TextareaAutosize from 'react-autosize-textarea';



interface ProjectHeaderProps{
    updateProjectName:(value:string) => void,
    updateProjectDescription:(value:string) => void,
    updateProjectDeadline:(value:Date) => void,
    attachTagToProject:(tag:string) => void,
    indicator:{
        active:number,
        completed:number,
        deleted:number
    },
    project:Project,
    rootRef:HTMLElement, 
    selectedTag:string,
    todos:Todo[],  
    dispatch:Function   
}


  
interface ProjectHeaderState{
    showTagsPopup:boolean,
    showDeadlineCalendar:boolean,
    name:string,
    description:string  
}
  


export class ProjectHeader extends Component<ProjectHeaderProps,ProjectHeaderState>{
    projectMenuPopoverAnchor:HTMLElement;  
    inputRef:HTMLElement;  

    constructor(props){ 
        super(props);
        let {project} = this.props;
        this.state={
            showDeadlineCalendar:false,
            showTagsPopup:false,
            name:project.name,
            description:project.description    
        };   
    };   
 


    componentDidMount(){ 
        let {project} = this.props; 

        if(this.inputRef && isEmpty(project.name)){
           this.inputRef.focus();  
        }
    };



    componentWillReceiveProps(nextProps:ProjectHeaderProps,nextState:ProjectHeaderState){
        if(this.props.project.description!==nextProps.project.description){
           this.setState({description:nextProps.project.description}); 
        }

        if(this.inputRef && isEmpty(nextProps.project.name)){
           this.inputRef.focus();  
        }

        if(this.props.project.name!==nextProps.project.name){
           this.setState({name:nextProps.project.name}); 
        }
    };


    
    updateProjectName = (value) => this.setState({name:value}, () => this.props.updateProjectName(value));
 


    updateProjectDescription = (newValue) => this.setState(
        {description:newValue}, 
        () => this.props.updateProjectDescription(newValue)
    );
 


    openMenu = (e) => this.props.dispatch({type:"showProjectMenuPopover", load:true});
    


    closeDeadlineCalendar = (e) => this.setState({showDeadlineCalendar:false});



    onDeadlineCalendarClear = (e) => this.setState(
        {showDeadlineCalendar:false},
        () => this.props.updateProjectDeadline(null)
    );



    onDeadlineCalendarDayClick = (day:Date,modifiers:Object,e:any) => this.setState(
        {showDeadlineCalendar:false}, 
        () => this.props.updateProjectDeadline(day)
    );  
      
    

    render(){ 
        let {todos,project,rootRef} = this.props;
        let {showDeadlineCalendar,showTagsPopup} = this.state; 
        let done = this.props.indicator.completed;
        let left = this.props.indicator.active;  
        let tags = getTagsFromItems(todos); 
        let totalValue = (done+left)===0 ? 1 : (done+left);
        let currentValue = done;  

        return <div>  
            <ProjectMenuPopover 
                { 
                    ...{
                        project,   
                        anchorEl:this.projectMenuPopoverAnchor,
                        rootRef,   
                        openDeadlineCalendar:() => this.setState({showDeadlineCalendar:true}),    
                        openTagsPopup:() => this.setState({showTagsPopup:true}) 
                    } as any
                }     
            />    
            {      
                not(showDeadlineCalendar) ? null : 
                <DeadlineCalendar  
                    close={this.closeDeadlineCalendar}
                    onDayClick={this.onDeadlineCalendarDayClick} 
                    open={this.state.showDeadlineCalendar}  
                    deadline={project.deadline}
                    origin={{vertical:"top", horizontal:"left"}} 
                    point={{vertical:"top", horizontal:"right"}} 
                    anchorEl={this.projectMenuPopoverAnchor} 
                    onClear={this.onDeadlineCalendarClear}
                    rootRef={this.props.rootRef}
                /> 
            } 
            {
                not(showTagsPopup) ? null : 
                <TagsPopup  
                    close={() => this.setState({showTagsPopup:false})}
                    open={this.state.showTagsPopup}
                    attachTag={this.props.attachTagToProject}
                    origin={{vertical:"top", horizontal:"left"}}
                    rootRef={this.props.rootRef}
                    anchorEl={this.projectMenuPopoverAnchor}
                    point={{vertical:"top", horizontal:"right"}}
                    defaultTags={[]}
                    todos={[]}
                /> 
            } 
            <div style={{display:"flex", alignItems: "center"}}>
                <div style={{    
                    position:"relative",
                    borderRadius:"100px",
                    zoom:"0.8",
                    display:"flex",
                    transform: "rotate(270deg)",
                    justifyContent:"center",
                    alignItems:"center",
                    border:"2px solid rgba(108, 135, 222, 1)",
                    boxSizing:"border-box", 
                    marginRight:"10px"
                }}> 
                    <div style={{ 
                        width:"28px", 
                        height:"28px",
                        display:"flex", 
                        alignItems:"center",
                        justifyContent:"center",
                        position:"relative"
                    }}>   
                        <PieChart
                            animate={false}    
                            totalValue={totalValue}
                            data={[{value:currentValue,key:1,color:'rgba(108, 135, 222, 0.8)'}]}   
                            style={{  
                                width:22, 
                                height:22,
                                position:"absolute",
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center" 
                            }}
                        />     
                    </div>
                </div> 
                <div 
                    style={{overflowX:"hidden"}} 
                    className="unselectable"
                >
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
                    className={`no-print`}
                    style={{ 
                        marginLeft: "5px",
                        marginRight: "5px",
                        width: "32px",
                        height: "32px",
                        cursor: "pointer"
                    }} 
                    ref={(e) => { this.projectMenuPopoverAnchor=e; }}
                >
                    <ThreeDots style={{color:"rgb(179, 179, 179)",width:"32px",height:"32px",cursor: "pointer"}}/>
                </div>   
            </div> 
            {      
                isNil(project.deadline) ? null :         
                <div  
                    className="unselectable"
                    style={{ 
                        paddingTop:'15px', 
                        cursor:"default",
                        WebkitUserSelect:"none", 
                        display:"flex",  
                        alignItems:"center",  
                        height:"30px"
                    }}
                > 
                    <div style={{paddingRight:"5px", paddingTop:"5px"}}> 
                        <Flag style={{color:"black", cursor:"default", width:"20px", height:"20px"}}/>   
                    </div>   
                    <div style={{color:"black", fontSize:"15px", fontWeight:"bold", paddingRight:"20px"}}>
                        {`Deadline: ${getMonthName(project.deadline).slice(0,3)}. ${project.deadline.getDate()}`} 
                    </div> 
                    <div style={{paddingTop:"5px"}}> 
                        {daysLeftMark(false, project.deadline, 15)}
                    </div>    
                </div> 
            }    
            <div style={{paddingTop:"10px",paddingBottom:"10px"}} className={`no-print`}>        
                <TextareaAutosize
                    id={"project_notes"}
                    placeholder="Notes"
                    onChange={(event:any) => this.updateProjectDescription(event.target.value)} 
                    value={this.state.description}  
                    style={{
                        resize:"none",
                        marginTop:"-4px", 
                        width:"100%",
                        fontSize:"14px",
                        padding:"0px",
                        cursor:"default",  
                        position:"relative", 
                        border:"none",
                        outline:"none",
                        backgroundColor:"rgba(0, 0, 0, 0)",
                        color:"rgba(0, 0, 0, 0.87)" 
                    }}
                /> 
            </div>
            <div className={`no-print`}>  
                <Tags  
                    selectTag={(tag) => this.props.dispatch({type:"selectedTag", load:tag})}
                    tags={tags} 
                    selectedTag={this.props.selectedTag}
                    show={true}  
                /> 
            </div> 
        </div> 
    } 
}; 
 



