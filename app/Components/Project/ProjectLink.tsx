import '../../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz'; 
import { Component } from "react"; 
import Popover from 'material-ui/Popover';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import { Todo, Project, Category, Store } from '../../types';
import { byNotDeleted, byCompleted, attachDispatchToProps, daysLeftMark } from '../../utils/utils'; 
import { Checkbox, DueDate } from '../TodoInput/TodoInput';
import PieChart from 'react-minimal-pie-chart';
import Restore from 'material-ui/svg-icons/content/undo'; 
import { contains, isNil, allPass, not, isEmpty } from 'ramda';
import Hide from 'material-ui/svg-icons/action/visibility-off';
import Count from 'material-ui/svg-icons/editor/format-list-numbered';
import { assert } from '../../utils/assert';
import { uppercase } from '../../utils/uppercase'; 
import { isDate, isString, isNotNil } from '../../utils/isSomething';
import { daysRemaining } from '../../utils/daysRemaining';
import { Provider, connect } from "react-redux";


interface ProjectLinkProps{
    project:Project,
    dispatch:Function,
    indicator:{active:number,completed:number,deleted:number},
    showMenu:boolean,
    selectedCategory:Category,
    underline?:boolean
}

interface ProjectLinkState{
    openMenu:boolean 
}   

export class ProjectLink extends Component<ProjectLinkProps,ProjectLinkState>{
    actionsAnchor:HTMLElement;


    constructor(props){ 
        super(props); 
        this.state={openMenu:false};
    }
    


    onHideFrom = () => {
        let {dispatch,project,selectedCategory} = this.props;
        let hide = project.hide;

        if(isNil(hide)){
            hide = [selectedCategory];
        }else if(not(contains(selectedCategory)(project.hide))){
            hide = [...project.hide,selectedCategory];
        }
        
        this.setState( {openMenu:false}, () => dispatch({type:"updateProject", load:{...project,hide}}) );
    };  



    onShowOnlyOne = () => {
        let {dispatch,project,selectedCategory} = this.props;
        
        let expand = isNil(project.expand) ? 1 : 
                     project.expand===3 ? 1 :
                     3; 

        this.setState( {openMenu:false}, () => dispatch({type:"updateProject", load:{...project,expand}}) ); 
    };



    openProject =  (e) => {
        e.stopPropagation();   

        if(isNotNil(this.props.project.deleted) || isNotNil(this.props.project.completed)){ return } 

        this.props.dispatch({
            type:"multiple",
            load:[
                {type:"selectedCategory", load:"project"},
                {type:"selectedProjectId", load:this.props.project._id}
            ]
        });
    };


    
    render(){ 
        let {dispatch,project,indicator,selectedCategory,showMenu} = this.props;
        let done = indicator.completed;
        let left = indicator.active;
        let totalValue = (done+left)===0 ? 1 : (done+left);
        let currentValue = done;

        let flagColor = "rgba(100,100,100,0.7)";
        let daysLeft = 0;  


        if(isDate(project.deadline)){      
           daysLeft = daysRemaining(project.deadline);        
           flagColor = daysLeft <= 1 ? "rgba(200,0,0,0.7)" : "rgba(100,100,100,0.7)";
        }     


        return <div
            style={{
                width:"100%",
                paddingBottom:this.props.underline ? "10px" : "0px"
            }}  
        >
        <li  
            onClick={this.openProject}    
            style={{width:"100%"}}   
            className={
                this.props.underline ? 
                "upcomingListHeadingBorder" : 
                "upcomingListHeading"
            }
        >      
        <div   
            id={project._id}        
            style={{    
                height:"30px",   
                paddingRight:"6px",  
                paddingLeft:"19px",
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
                    transform:"rotate(270deg)",
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
                            totalValue={totalValue}
                            data={[{
                                value:currentValue, 
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
                    id={project._id}   
                    style={{   
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
                    isNil(project.deadline) ? null :
                    selectedCategory!=="upcoming" ? null :
                    <div style={{
                        height: "30px",
                        paddingRight:"45px",
                        display:"flex",
                        flexGrow:1,
                        cursor:"default",
                        justifyContent:"flex-end"
                    }}>  
                        <div ref={(e) => { this.actionsAnchor=e; }} onClick={(e) => { e.stopPropagation(); }}>   
                            <Flag style={{
                                paddingRight:"5px", 
                                paddingTop:"5px", 
                                color:flagColor,
                                width:"20px",
                                height:"20px", 
                                cursor:"default" 
                            }}/>
                        </div> 
                        {daysLeftMark(false,project.deadline)}
                    </div>  
                }
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
                            style={{paddingRight:"27px"}}
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
                        className="darkscroll"
                        style={{  
                          backgroundColor:"rgb(39, 43, 53)",
                          paddingRight:"10px",
                          paddingLeft:"10px",
                          borderRadius:"10px", 
                          paddingTop:"5px",
                          paddingBottom:"5px",
                          cursor:"pointer" 
                        }} 
                    >    
                        <div  
                            onClick={this.onHideFrom} 
                            className="tagItem"
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
                            className="tagItem"
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
        </div>
    }
}
 



interface ProjectLinkLogbookProps{ 
    project:Project, 
    dispatch:Function,
    indicator:{active:number,completed:number,deleted:number},
    selectedCategory:Category
}
interface ProjectLinkLogbookState{}   
export class ProjectLinkLogbook extends Component<ProjectLinkLogbookProps, ProjectLinkLogbookState>{

    constructor(props){ super(props) }

     
    uncomplete = (e) => this.props.dispatch({type:"updateProject",load:{...this.props.project,completed:undefined}});
    

    render(){ 
        let { dispatch,project,indicator,selectedCategory } = this.props;
        let done = indicator.completed;
        let left = indicator.active;
        let totalValue = (done+left)===0 ? 1 : (done+left);
        let currentValue = done;
 

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
            <div style={{paddingLeft:"19px",display:"flex",alignItems:"center"}}>
                <Checkbox  
                    checked={isNotNil(project.completed)}
                    onClick={(e) => {
                        if(isNotNil(project.completed)){
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

            <div style={{display:"flex",justifyContent:"flex-start",alignItems:"center"}}>
            <div style={{     
                width:"18px", 
                height:"18px",
                position:"relative",
                borderRadius:"100px",
                transform: "rotate(270deg)",
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                border:"1px solid rgb(159, 159, 159)",
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
                        totalValue={totalValue}
                        data={[{
                            value:currentValue, 
                            key:1,  
                            color:"rgb(159, 159, 159)" 
                        }]}    
                        style={{  
                            color:"rgb(159, 159, 159)",
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
            <div id={project._id} style={{paddingLeft:"5px",overflowX:"hidden"}}>    
                { isEmpty(project.name) ? "New Project" : project.name } 
            </div> 
            </div>
        </div>   
        </li>  
    }
};
 




interface ProjectLinkTrashProps{ 
    project:Project,
    dispatch:Function,
    indicator:{active:number,completed:number,deleted:number},
    selectedCategory:Category 
}

interface ProjectLinkTrashState{ openMenu:boolean }  

export class ProjectLinkTrash extends Component<ProjectLinkTrashProps, ProjectLinkTrashState>{
    actionsAnchor:HTMLElement;

    constructor(props){ 
        super(props); 
        this.state={openMenu:false};
    }
     

    restoreProject = (p:Project) : void => this.props.dispatch({type:"restoreProject",load:p._id}); 
    
 
    render(){ 
        let { dispatch,project,selectedCategory, indicator} = this.props;
        let done = indicator.completed;
        let left = indicator.active;
        let totalValue = (done+left)===0 ? 1 : (done+left);
        let currentValue = done;

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
                    transform: "rotate(270deg)",
                    display:"flex",
                    justifyContent:"center",
                    alignItems:"center",
                    marginLeft:"2px", 
                    border:"1px solid rgb(159, 159, 159)",
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
                            totalValue={totalValue}
                            data={[{
                                value:currentValue, 
                                key:1,  
                                color:"rgb(159, 159, 159)" 
                            }]}    
                            style={{  
                                color:"rgb(159, 159, 159)",
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
                <div id={project._id} style={{paddingLeft:"5px",overflowX:"hidden"}}>    
                    { isEmpty(project.name) ? "New Project" : project.name } 
                </div> 
            </div>    
        </li>  
    }
}; 
 