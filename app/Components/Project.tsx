import '../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, uniq,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, any,
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, 
    groupBy, concat, flatten, toPairs, adjust, prepend, fromPairs 
} from 'ramda';
import { Provider } from "react-redux";
import { Footer } from '../Components/Footer'; 
import { Transition } from 'react-transition-group';
import { Category } from '../MainContainer';
import { TodosList } from '../Components/TodosList';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { attachDispatchToProps, uppercase, insideTargetArea, chooseIcon, debounce } from "../utils"; 
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { queryToTodos, getTodos, updateTodo, Todo, removeTodo, generateID, addTodo,  Project } from '../databaseCalls';
import Popover from 'material-ui/Popover';
import Button from 'material-ui-next/Button';
import { Tags } from '../Components/Tags';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Repeat from 'material-ui/svg-icons/av/repeat';
import { Store } from '../App';
import Inbox from 'material-ui/svg-icons/content/inbox';
import Duplicate from 'material-ui/svg-icons/content/content-copy';
import ShareIcon from 'material-ui/svg-icons/social/share';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import { TextField } from 'material-ui';
import AutosizeInput from 'react-input-autosize';
 

export class ProjectComponent extends Component<any,any>{

    constructor(props){
        super(props);
    }


    render(){
        return <div>

            
        </div>;
    }

} 





interface ProjectHeaderProps{
    project : Project,
    dispatch : Function,  
}

  
interface ProjectHeaderState{
    showProjectMenuPopover:boolean 
}
 


export class ProjectHeader extends Component<ProjectHeaderProps,ProjectHeaderState>{

    moreAnchor:HTMLElement;  

    constructor(props){
        super(props);
        this.state = {
            showProjectMenuPopover:false
        }
    }
 

    setProjectName = (name : string) => {
        //update store
    }


    setProjectDescription = (e, value:string) => {
        //update store 
    }


    render(){
        return <div>
            <div style={{display:"flex"}}>


            <div>
                <div style={{ 
                    width:"30px",    
                    height:"30px", 
                    borderRadius:"100px",
                    border:"5px solid rgba(108, 135, 222, 0.8)",
                    boxSizing:"border-box",
                    marginRight:"10px" 
                }}> 
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
                    value={uppercase(this.props.project.name)}
                    placeholder="New Project"
                    onChange={debounce(this.setProjectName,500)} 
                /> 
            </div> 


            <div  
                onClick = {() => this.setState({showProjectMenuPopover:true})}  
                style={{
                    marginLeft: "5px",
                    marginRight: "5px",
                    width: "32px",
                    height: "32px",
                    cursor: "pointer"
                }}
                ref={ (e) => { this.moreAnchor=e; } }
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
                hintText = "Notes"   
                defaultValue = {this.props.project.description}    
                multiLine={true} 
                fullWidth = {true}   
                onChange={debounce(this.setProjectDescription,500)}
                inputStyle = {{fontWeight:600, color:"rgba(100,100,100,1)", fontSize:"15px"}}   
                underlineFocusStyle = {{borderColor: "rgba(0,0,0,0)"}}    
                underlineStyle = {{borderColor: "rgba(0,0,0,0)"}}  
            /> 
          
            <ProjectMenuPopover
                close={(e) => this.setState({showProjectMenuPopover:false})}
                open={this.state.showProjectMenuPopover}
                origin={{vertical: "center", horizontal: "middle"}}  
                anchorEl={this.moreAnchor}
                point={{vertical: "top", horizontal: "middle"}} 
                dispatch={this.props.dispatch}
            /> 

        </div>
    }

}








interface ProjectMenuPopoverProps{
    close : Function,
    open : boolean,
    origin : any,  
    anchorEl : HTMLElement,
    point : any,
    dispatch : Function
}  


export class ProjectMenuPopover extends Component<ProjectMenuPopoverProps,{}>{

    constructor(props){
        super(props); 
    }  


    onComplete = (e) => {
        
    }


    onWhen = (e) => {
        
    }


    onAddTags = (e) => {
        
    }


    onAddDeadline = (e) => {

    }


    onMove = (e) => {
        
    }


    onRepeat = (e) => {

    }


    onDuplicate = (e) => {

    }


    onDelete = (e) => {

    }


    onShare = (e) => {

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
            onRequestClose={() => this.props.close()}
            anchorOrigin={this.props.origin} 
            targetOrigin={this.props.point} 
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
                        onClick={this.onComplete} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <CheckCircle style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Complete project   
                        </div>     
                    </div>
                
 
 
                    <div  
                        onClick={this.onWhen} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <CalendarIco style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            When   
                        </div>     
                    </div>


                    <div   
                        onClick={this.onAddTags} 
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




 
                    <div  
                        onClick={this.onAddDeadline} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <Flag style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Add deadline 
                        </div>     
                    </div>
 




                    <div style={{
                        border:"1px solid rgba(200,200,200,0.1)",
                        marginTop: "5px",
                        marginBottom: "5px"
                    }}>
                    </div>






                    <div  
                        onClick={this.onMove} 
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
                        onClick={this.onRepeat} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <Repeat style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Repeat...  
                        </div>     
                    </div>

                    <div  
                        onClick={this.onDuplicate} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <Duplicate style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                             Duplicate project 
                        </div>     
                    </div>
                 

                    <div   
                        onClick={this.onDelete} 
                        className={"tagItem"} style={{
                            display:"flex", 
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >  
                        <TrashIcon style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Delete project  
                        </div>     
                    </div>

                    <div  
                        onClick={this.onShare} 
                        className={"tagItem"} style={{
                            display:"flex",  
                            height:"auto",
                            alignItems:"center",
                            padding:"5px"
                        }}
                    >      
                        <ShareIcon style={{color:"rgb(69, 95, 145)"}}/> 
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                          Share
                        </div>     
                    </div>
 
            </div> 
        </Popover> 


    }

}























interface ProjectHeadingProps{
    dispatch : Function 
}


  
interface ProjectHeadingState{
    showHeadingMenuPopover:boolean 
}


 
export class ProjectHeading extends Component<ProjectHeadingProps,ProjectHeadingState>{

    moreAnchor:HTMLElement;  

    constructor(props){
        super(props);
        this.state = {
            showHeadingMenuPopover:false
        }
    }
  

 
    render(){
        return <div>

            <div style={{display:"flex"}}>

            <div> 
                <div style={{display:"flex"}}>
                    <TextField   
                        hintText = "Heading"    
                        id={'id'}
                        defaultValue = {"Heading"} 
                        fullWidth = {true}   
                        onChange={() => {}}
                        inputStyle = {{fontWeight:600, color:"rgba(100,100,100,1)", fontSize:"16px"}}  
                        hintStyle = {{top:"3px", left:0, width:"100%", height:"100%"}}   
                        style = {{height:"28px"}}      
                        underlineFocusStyle = {{borderColor: "rgba(0,0,0,0)"}}    
                        underlineStyle = {{borderColor: "rgba(0,0,0,0)"}}  
                    /> 
                </div>  
            </div>
 
            <div   
                onClick = {() => {}}  
                style={{
                    marginLeft: "5px", 
                    marginRight: "5px",
                    width: "32px",
                    height: "32px",
                    cursor: "pointer"
                }}
                ref={ (e) => { this.moreAnchor=e; } }
            > 
                <ThreeDots style={{  
                    color:"rgb(179, 179, 179)",
                    width:"32px", 
                    height:"32px",
                    cursor: "pointer" 
                }} />
            </div> 


            </div>

        </div>
    }

}