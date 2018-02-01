
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
    daysLeftMark, chooseIcon, dateDiffInDays, assert, isProject, 
    isArrayOfTodos, byNotDeleted, byCompleted, attachDispatchToProps  
} from '../../utils'; 
import { TodoInput, Checkbox, DueDate } from '../TodoInput/TodoInput';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import Checked from 'material-ui/svg-icons/navigation/check';
import PieChart from 'react-minimal-pie-chart';
import Restore from 'material-ui/svg-icons/content/undo';
import { isString } from 'util';
import { contains, isNil, allPass, not, isEmpty } from 'ramda';
import { isDev, Store } from '../../app';
import { Category, filter } from '../MainContainer';
import Hide from 'material-ui/svg-icons/action/visibility-off';
import Count from 'material-ui/svg-icons/editor/format-list-numbered';


export let getProgressStatus = (
    project:Project, todos:Todo[], includeDeleted:boolean
) : {done:number,left:number} => {  
    
    let ids = project.layout.filter(isString);

    let filters = includeDeleted ? 
                  [(todo) => contains(todo._id)(ids)] :
                  [(todo) => contains(todo._id)(ids), byNotDeleted];

    let selected = filter(todos, allPass(filters), "getProgressStatus"); 
    let done : number = selected.filter(byCompleted).length;
    let left : number = selected.length - done; 
     
    assert(done>=0, `Done - negative value. getProgressStatus.`);
    assert(left>=0, `Left - negative value. getProgressStatus.`);
     
    return {done,left}; 
}  


interface ProjectLinkProps extends Store{
    project:Project,
    showMenu:boolean
}
 

interface ProjectLinkState{
    openMenu:boolean 
}   


@connect((store,props) => ({...store, ...props}), attachDispatchToProps) 
export class ProjectLink extends Component<ProjectLinkProps, ProjectLinkState>{
    actionsAnchor:HTMLElement;

    constructor(props){ 
        super(props); 
        this.state={openMenu:false};
    }
    

    restoreProject = (p:Project) : void => { 
        let {dispatch, todos} = this.props;
        let relatedTodosIds : string[] = p.layout.filter(isString);
        let selectedTodos : Todo[] = filter(todos, (t:Todo) : boolean => contains(t._id)(relatedTodosIds), "restoreProject");  

        dispatch({type:"updateTodos", load:selectedTodos.map((t:Todo) => ({...t,deleted:undefined}))})
        dispatch({type:"updateProject", load:{...p,deleted:undefined}})
    }


    onHideFrom = () => {
        let {dispatch,project,todos,selectedCategory} = this.props;
         
        let hide = isNil(project.hide) ? [selectedCategory] : 
                   contains(selectedCategory)(project.hide) ? project.hide :
                   [...project.hide,selectedCategory]; 
 
        dispatch({type:"updateProject", load:{...project,hide}})
        this.setState({openMenu:false}) 
    }  


    onShowOnlyOne = () => {
        let {dispatch,project,todos,selectedCategory} = this.props;
        
        let expand = isNil(project.expand) ? 1 : 
                     project.expand===3 ? 1 :
                     3; 

        dispatch({type:"updateProject", load:{...project,expand}})
        this.setState({openMenu:false}) 
    }


    openProject =  (e) => {
        let {dispatch,project,todos,selectedCategory} = this.props;
        e.stopPropagation();  

        if(not(isNil(project.deleted))){ return }
        if(not(isNil(project.completed))){ return } 
            
        dispatch({type:"selectedCategory", load:"project"});
        dispatch({type:"selectedProjectId", load:project._id});
    }

    
    render(){ 
        let { dispatch,project,todos,selectedCategory,showMenu } = this.props;
        let { done,left } = getProgressStatus(project, todos, false); 
        
        return <li  
            onClick={this.openProject}    
            style={{width:"100%", overflow:"hidden"}}   
            className={"listHeading"}
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
                <div style={{    
                    width:"18px",
                    height:"18px",
                    position:"relative",
                    borderRadius:"100px",
                    display:"flex",
                    justifyContent:"center",
                    alignItems:"center",
                    border:"1px solid rgb(108, 135, 222)",
                    boxSizing:"border-box" 
                }}> 
                    <div style={{
                        width:"18px",
                        height:"18px",
                        display:"flex",
                        alignItems:"center", 
                        justifyContent:"center",
                        position:"relative" 
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
                                color:"rgb(108, 135, 222)",
                                width:"12px",
                                height:"12px",
                                position:"absolute",
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center"  
                            }}
                        />     
                    </div>
                </div> 
                <div   
                    id = {project._id}   
                    style={{   
                        width:"80%", 
                        overflowX:"hidden", 
                        fontSize:"15px",    
                        paddingLeft:"5px", 
                        WebkitUserSelect:"none",
                        fontWeight:"bolder", 
                        color:"rgba(0, 0, 0, 0.8)" 
                    }}  
                >    
                    { isEmpty(project.name) ? "New Project" : project.name } 
                </div> 
                {
                    not(showMenu) ? null :
                    <div   
                        style={{
                            width:"30px",  
                            height:"30px",
                            flexGrow:1 as number,
                            paddingLeft:"5px",
                            paddingRight:"10px",
                            display:"flex", 
                            justifyContent:"flex-end",
                            cursor:"pointer"
                        }} 
                    > 
                        <div 
                            ref={ (e) => { this.actionsAnchor=e; } }
                            onClick = {(e) => { 
                                e.stopPropagation();
                                this.setState({openMenu:true}); 
                            }}  
                        >   
                            <ThreeDots style={{color:"dimgray",width:"30px",height:"30px",cursor:"pointer"}}/>
                        </div> 
                    </div>  
                }
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
                    scrollableContainer={document.body}
                    useLayerForClickAway={false}   
                    open={this.state.openMenu}
                    onRequestClose={() => this.setState({openMenu:false})}
                    targetOrigin={{vertical:'top', horizontal:'right'}}
                    anchorOrigin={{vertical:'center', horizontal:'left'}}
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
                            style={{display:"flex",height:"auto",alignItems:"center",padding:"5px"}} 
                        >  
                            <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                                <Count style={{color:"rgb(69, 95, 145)"}}/> 
                            </div>    
                            <div style={{color:"gainsboro",marginLeft:"5px",marginRight:"5px"}}>
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
        </li>  
    }
}
 


interface ProjectLinkLogbookProps extends Store{ project:Project }
interface ProjectLinkLogbookState{}   

@connect((store,props) => ({...store, ...props}), attachDispatchToProps) 
export class ProjectLinkLogbook extends Component<ProjectLinkLogbookProps, ProjectLinkLogbookState>{

    constructor(props){ super(props) }

    uncomplete = (e) => {
        let {project} = this.props;
        this.props.dispatch({type:"updateProject",load:{...project,completed:undefined}});
    }

    render(){ 
        let { dispatch,project,todos,selectedCategory } = this.props;

        return <li style={{width:"100%", overflow:"hidden"}}>      
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
                <div style={{paddingLeft:"5px"}}> 
                    <DueDate
                        date={null}
                        selectedCategory={this.props.selectedCategory}
                        category={this.props.selectedCategory}
                        completed={project.completed}
                    />
                </div>
            </div> 
            <div   
                id = {project._id}   
                style={{   
                    width:"80%", 
                    overflowX:"hidden", 
                    fontSize:"15px",    
                    WebkitUserSelect:"none",
                    fontWeight:"bolder", 
                    color:"rgba(0, 0, 0, 0.8)" 
                }}  
            >    
                { isEmpty(project.name) ? "New Project" : project.name } 
            </div> 
        </div>   
        </li>  
    }
}



interface ProjectLinkTrashProps extends Store{ project:Project }
interface ProjectLinkTrashState{ openMenu:boolean }   

@connect((store,props) => ({...store, ...props}), attachDispatchToProps) 
export class ProjectLinkTrash extends Component<ProjectLinkTrashProps, ProjectLinkTrashState>{
    actionsAnchor:HTMLElement;

    constructor(props){ 
        super(props); 
        this.state={openMenu:false};
    }
    

    restoreProject = (p:Project) : void => { 
        let {dispatch, todos} = this.props;
        let relatedTodosIds : string[] = p.layout.filter(isString);
        let selectedTodos : Todo[] = filter(todos, (t:Todo) : boolean => contains(t._id)(relatedTodosIds), "restoreProject");  

        dispatch({type:"updateTodos", load:selectedTodos.map((t:Todo) => ({...t,deleted:undefined}))})
        dispatch({type:"updateProject", load:{...p,deleted:undefined}})
    }

    render(){ 
        let { dispatch,project,todos,selectedCategory} = this.props;
        let { done, left } = getProgressStatus(project, todos, true); 

        return <li style={{width:"100%", overflow:"hidden"}}>      
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

                <div style={{    
                    width:"18px",
                    height:"18px",
                    position:"relative",
                    borderRadius:"100px",
                    display:"flex",
                    justifyContent:"center",
                    alignItems:"center",
                    border:"1px solid rgb(108, 135, 222)",
                    boxSizing:"border-box" 
                }}> 
                    <div style={{
                        width:"18px",
                        height:"18px",
                        display:"flex",
                        alignItems:"center", 
                        justifyContent:"center",
                        position:"relative" 
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
                                color:"rgb(108, 135, 222)",
                                width:"12px",
                                height:"12px",
                                position:"absolute",
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center"  
                            }}
                        />     
                    </div>
                </div> 

                <div   
                    id = {project._id}   
                    style={{   
                        width:"80%", 
                        overflowX:"hidden", 
                        fontSize:"15px",    
                        paddingLeft:"5px", 
                        WebkitUserSelect:"none",
                        fontWeight:"bolder", 
                        color:"rgba(0, 0, 0, 0.8)" 
                    }}  
                >    
                    { isEmpty(project.name) ? "New Project" : project.name } 
                </div> 
            </div>    
        </li>  
    }
}
