
import NewAreaIcon from 'material-ui/svg-icons/maps/layers';
import '../../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom';  
import { Provider } from "react-redux";
import { Transition } from 'react-transition-group';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
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
import { uppercase, debounce, assert, isArea } from '../../utils'; 
import PieChart from 'react-minimal-pie-chart';
import Checked from 'material-ui/svg-icons/navigation/check';
import { ProjectMenuPopover } from '../Project/ProjectMenu';
import { contains, isEmpty } from 'ramda';
import { TagsPopup } from '../TodoInput/TodoTags';
import { isDev } from '../../app';



interface AreaHeaderProps{
    name:string, 
    selectedAreaId:string,
    areas:Area[],
    projects:Project[],
    tags:string[],
    rootRef:HTMLElement, 
    todos:Todo[], 
    updateAreaName:(value:string) => void,
    attachTagToArea:(tag:string) => void, 
    dispatch:Function  
} 
  
 

interface AreaHeaderState{
    menuAnchor:HTMLElement,
    openMenu:boolean,
    showTagsPopup:boolean,
    name:string   
}  
   
  

export class AreaHeader extends Component<AreaHeaderProps,AreaHeaderState>{

    menuAnchor:HTMLElement;  
    inputRef:HTMLElement;  
  
    constructor(props){ 
         
        super(props);
        
        this.state = {
            menuAnchor:null,
            openMenu:false,
            showTagsPopup:false, 
            name:this.props.name   
        }; 
    }  

    componentDidMount(){
        if(this.inputRef && isEmpty(this.state.name)){
           this.inputRef.focus();  
        }

        if(this.menuAnchor){
           this.setState({menuAnchor:this.menuAnchor});
        }
    }

    componentWillReceiveProps(nextProps:AreaHeaderProps){
        if(nextProps.selectedAreaId!==this.props.selectedAreaId){
            this.setState({
                openMenu:false,
                showTagsPopup:false, 
                name:nextProps.name    
            }) 
        }
    }

    openMenu = () => {
        this.setState({openMenu:true});
    }
 
    closeMenu = () => { 
        this.setState({openMenu:false});
    } 
 
    onAddTags = () => {
        this.closeMenu(); 
        this.setState({showTagsPopup:true})
    }
 
    onDeleteArea = () => {
        this.closeMenu();  

        let area = this.props.areas.find( (a:Area) => a._id===this.props.selectedAreaId ); 

        assert(
            isArea(area), 
            `Area with selectedAreaId does not exist or not an area. 
             ${JSON.stringify(area)}.
             ${JSON.stringify(this.props.areas)}.
             ${this.props.selectedAreaId}.` 
        ) 

        let relatedTodosIds : string[] = area.attachedTodosIds;
           
        let relatedProjectsIds : string[] = area.attachedProjectsIds;

        let selectedProjects : Project[] = this.props.projects.filter(
            (p:Project) : boolean => contains(p._id)(relatedProjectsIds)
        );    

        let selectedTodos : Todo[] = this.props.todos.filter(
            (t:Todo) : boolean => contains(t._id)(relatedTodosIds)
        );   
        
        this.props.dispatch({
            type:"updateTodos", 
            load:selectedTodos.map((t:Todo) => ({...t,deleted:new Date()}))
        });

        this.props.dispatch({
            type:"updateProjects", 
            load:selectedProjects.map((p:Project) => ({...p,deleted:new Date()}))
        });
 
        this.props.dispatch({type:"updateArea", load:{...area,deleted:new Date()}});   
        
        this.props.dispatch({type:"selectedCategory",load:"inbox"});
    }
 
 
  
    updateAreaName = (event) => { 
        this.setState(
            {name:event.target.value},  
            () => this.props.updateAreaName(this.state.name) 
        ); 
    }
  
    render(){ 

     return <div>  
            <div style={{display:"flex", alignItems:"center"}}>
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
                        ref={e => {this.inputRef=e;}}
                        type="text"
                        name="form-field-name" 
                        minWidth={"170px"}
                        inputStyle={{  
                            boxSizing: "content-box", 
                            backgroundColor:"rgba(0,0,0,0)",   
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
                    }}/>
                </div>  
                {
                    !this.state.showTagsPopup ? null : 
                    <TagsPopup   
                        tags = {this.props.tags} 
                        attachTag = {this.props.attachTagToArea} 
                        rootRef = {this.props.rootRef}
                        close = {() => this.setState({showTagsPopup:false})}
                        open = {this.state.showTagsPopup}    
                        anchorEl = {this.menuAnchor} 
                        origin = {{vertical:"top", horizontal:"left"}} 
                        point = {{vertical:"top", horizontal:"right"}} 
                    /> 
                }
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

                {/*
                    <div   
                        onClick={this.props.onAddTags as any} 
                        className={"tagItem"} 
                        style={{ 
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
                */} 

                    
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

