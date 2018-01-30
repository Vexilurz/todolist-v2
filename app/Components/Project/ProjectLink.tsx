
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
import { Todo, Project, Heading, LayoutItem, Area } from '../../database';
import { 
    uppercase, debounce, stringToLength, daysRemaining, 
    daysLeftMark, chooseIcon, dateDiffInDays, assert, isProject, isArrayOfTodos, byNotDeleted, byCompleted  
} from '../../utils'; 
import { TodoInput, Checkbox, DueDate } from '../TodoInput/TodoInput';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import Checked from 'material-ui/svg-icons/navigation/check';
import PieChart from 'react-minimal-pie-chart';
import Restore from 'material-ui/svg-icons/content/undo';
import { isString } from 'util';
import { contains, isNil, allPass } from 'ramda';
import { isDev } from '../../app';
import { Category } from '../MainContainer';
import Hide from 'material-ui/svg-icons/action/visibility-off';
import One from 'material-ui/svg-icons/image/looks-one'; 





export let getProgressStatus = (todos:Todo[]) : {done:number,left:number} => {

    let done : number = todos.filter(byCompleted).length;
    let left : number = todos.length - done; 
     
    assert(done>=0, `Done - negative value. getProgressStatus.`);
    assert(left>=0, `Left - negative value. getProgressStatus.`);
    
    return {done,left}; 
}  

interface ProjectLinkProps{
    dispatch:Function,
    index:number,
    selectedCategory:Category,
    project:Project,
    todos:Todo[],
    simple?:boolean 
}

interface ProjectLinkState{
    open:boolean 
}

export class ProjectLink extends Component<ProjectLinkProps, ProjectLinkState>{
    actionsAnchor:HTMLElement;

    constructor(props){
        super(props); 
        this.state={open:false};
    }
     
    restoreProject = (p:Project) : void => { 
        let {dispatch, todos} = this.props;

        let relatedTodosIds : string[] = p.layout.filter(isString);

        let selectedTodos : Todo[] = todos.filter( (t:Todo) : boolean => contains(t._id)(relatedTodosIds) );  

        dispatch({
            type:"updateTodos", 
            load:selectedTodos.map((t:Todo) => ({...t,deleted:undefined}))
        });

        dispatch({
            type:"updateProject", 
            load:{...p,deleted:undefined}
        });
    }

    onHideFrom = () => {
        let {dispatch,index,project,todos,selectedCategory,simple} = this.props;
         
        let hide = isNil(project.hide) ? [selectedCategory] : 
                   contains(selectedCategory)(project.hide) ? project.hide :
                   [...project.hide,selectedCategory]; 
 
        dispatch({type:"updateProject", load:{...project,hide}});
        this.setState({open:false}); 
    }  

    onShowOnlyOne = () => {
        let {dispatch,index,project,todos,selectedCategory,simple} = this.props;
        
        let expand =  isNil(project.expand) ? 1 : 
                      project.expand===3 ? 1 :
                      3 

        dispatch({type:"updateProject", load:{...project,expand}});
        this.setState({open:false});  
    }

    render(){ 
        let {dispatch,index,project,todos,selectedCategory,simple} = this.props;
        let {done,left} = getProgressStatus(todos); //TODO 

        return <li  
            onClick={(e) => {
                e.stopPropagation(); 
                if(project.deleted){ return }   
                dispatch({type:"selectedCategory",load:"project"});
                dispatch({type:"selectedProjectId",load:project._id});
            }}    
            style={{width:"100%", overflow:"hidden"}}   
            key={`key-${project._id}`}  
            className={simple ? "leftpanelmenuitem" : "listHeading"}
        >     
        <div   
            id = {project._id}        
            style={{    
                height:"30px",   
                paddingLeft:"6px", 
                paddingRight:"6px",  
                cursor:"default",
                width:"100%",
                display:"flex",  
                alignItems:"center" 
            }}
        >     
                { 
                    !project.deleted ? null : 
                    <div       
                        onClick={(e) => this.restoreProject(project)}  
                        style={{ 
                            display:"flex", 
                            cursor:"pointer",
                            alignItems:"center",
                            height:"14px",
                            paddingLeft:"20px",
                            paddingRight:"5px"  
                        }} 
                    >  
                        <Restore style={{width:"20px", height:"20px"}}/> 
                    </div>  
                } 

                {
                    isNil(project.completed) ? 
                    <div style={{    
                        marginLeft:"18px",
                        width:"18px",
                        height:"18px",
                        position: "relative",
                        borderRadius: "100px",
                        display: "flex",
                        justifyContent: "center",
                        cursor:"default",
                        alignItems: "center",
                        border: "1px solid rgb(108, 135, 222)",
                        boxSizing: "border-box" 
                    }}> 
                        <div style={{
                            width: "18px",
                            height: "18px",
                            display: "flex",
                            alignItems: "center", 
                            cursor:"default",
                            justifyContent: "center",
                            position: "relative" 
                        }}>  
                            <PieChart 
                                animate={false}    
                                totalValue={done+left}
                                data={[{     
                                    value:done, 
                                    key:1,  
                                    color:"rgb(108, 135, 222)" 
                                }]}    
                                style={{  
                                    color: "rgb(108, 135, 222)",
                                    width: "12px",
                                    height: "12px",
                                    position: "absolute",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"  
                                }}
                            />     
                        </div>
                    </div> 
                    :
                    <div style={{paddingLeft:"20px",display:"flex",alignItems:"center"}}>
                        <Checkbox  
                            checked={!isNil(project.completed)}
                            onClick={(e) => {
                                if(!isNil(project.completed)){
                                    let type = "updateProject";
                                    this.props.dispatch({
                                        type:"updateProject", 
                                        load:{...project,completed:undefined}
                                    });
                                }  
                            }}
                        />
                        <div>
                          <DueDate
                            date={null}
                            selectedCategory={this.props.selectedCategory}
                            category={this.props.selectedCategory}
                            completed={project.completed}
                          />
                        </div>
                    </div> 
                } 

                <div   
                    id = {project._id}   
                    style={{   
                        fontFamily: "sans-serif",
                        fontSize: "15px",    
                        cursor: "pointer",
                        paddingLeft: "5px", 
                        WebkitUserSelect: "none",
                        fontWeight: "bolder", 
                        color: "rgba(0, 0, 0, 0.8)" 
                    }}
                >    
                    { project.name.length==0 ? "New Project" : project.name } 
                </div>

                 <div  
                    style={{
                        width: "30px",  
                        height: "30px",
                        flexGrow: 1 as number,
                        paddingLeft:"5px",
                        paddingRight:"10px",
                        display: "flex", 
                        justifyContent: "flex-end",
                        cursor: "pointer"
                    }} 
                > 
                    {
                        simple ? null :
                        <div 
                            ref={ (e) => { this.actionsAnchor=e; } }
                            onClick = {(e) => { 
                                e.stopPropagation();
                                this.setState({open:true}); 
                            }}  
                        >
                            <ThreeDots style={{  
                                color:"dimgray",
                                width:"30px", 
                                height:"30px", 
                                cursor: "pointer" 
                            }}/>
                        </div> 
                    }  
                </div>     
        </div>
        { 
        simple ? null :               
        <div>
            <Popover 
                className="nocolor"
                style={{
                    marginTop:"20px", 
                    backgroundColor:"rgba(0,0,0,0)",
                    background:"rgba(0,0,0,0)",
                    borderRadius:"10px"
                }}    
                scrollableContainer={document.body}
                useLayerForClickAway={false}   
                open={this.state.open}
                onRequestClose={() => this.setState({open:false})}
                targetOrigin={{ vertical: 'top', horizontal: 'right'}}
                anchorOrigin={{ vertical: 'center', horizontal: 'left'}}
                anchorEl={this.actionsAnchor} 
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
                      onClick={this.onHideFrom} 
                      className={"tagItem"} 
                      style={{ 
                         display:"flex",  
                         height:"auto",
                         alignItems:"center",
                         padding:"5px"
                      }} 
                    >    
                        <div style={{display:"flex", alignItems:"center", justifyContent:"center"}}>
                           <Hide style={{color:"rgb(69, 95, 145)"}}/>
                        </div>  
                        <div style={{color:"gainsboro",marginLeft:"5px",marginRight:"5px"}}>
                            Hide from {uppercase(selectedCategory)}
                        </div>        
                    </div> 
                 
                    <div   
                      onClick={this.onShowOnlyOne} 
                      className={"tagItem"} 
                      style={{ 
                         display:"flex", 
                         height:"auto",
                         alignItems:"center",
                         padding:"5px" 
                      }} 
                    >  
                        <div style={{display:"flex", alignItems:"center", justifyContent:"center"}}>
                           <One style={{color:"rgb(69, 95, 145)"}}/>
                        </div>  
                        <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                            Show {  
                                isNil(project.expand) ? 'one' : 
                                project.expand===3 ? 'one' :
                                'three'  
                            } todo
                        </div>       
                    </div>
                </div> 
            </Popover> 
        </div>
        }  
    </li>  
    }
}