import '../../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz'; 
import { Component } from "react"; 
import Popover from 'material-ui/Popover';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import { Todo, Project } from '../../database';
import { byNotDeleted, byCompleted, attachDispatchToProps, daysLeftMark, isNotNil } from '../../utils/utils'; 
import { Checkbox, DueDate } from '../TodoInput/TodoInput';
import PieChart from 'react-minimal-pie-chart';
import Restore from 'material-ui/svg-icons/content/undo';
import { contains, isNil, allPass, not, isEmpty } from 'ramda';
import { Store } from '../../app';
import { filter, Category } from '../MainContainer';
import Hide from 'material-ui/svg-icons/action/visibility-off';
import Count from 'material-ui/svg-icons/editor/format-list-numbered';
import { assert } from '../../utils/assert';
import { uppercase } from '../../utils/uppercase';
import { isDate, isString } from '../../utils/isSomething';
import { daysRemaining } from '../../utils/daysRemaining';
import { Provider, connect } from "react-redux";


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
 


interface ProjectLinkProps{
    project:Project,
    todos:Todo[],
    dispatch:Function,
    showMenu:boolean,
    selectedCategory:Category,
    underline?:boolean
}

interface ProjectLinkState{
    openMenu:boolean 
}   

@connect(
    (store:Store,props:ProjectLinkProps):ProjectLinkProps => ({...props,todos:store.todos}), 
    attachDispatchToProps,
    null, 
    { areStatesEqual:(nextStore:Store, prevStore:Store) => nextStore.todos===prevStore.todos }   
)  
export class ProjectLink extends Component<ProjectLinkProps,ProjectLinkState>{
    actionsAnchor:HTMLElement;

    constructor(props){ 
        super(props); 
        this.state={openMenu:false};
    }
    


    restoreProject = (p:Project) : void => { 
        let {dispatch, todos} = this.props;
        let relatedTodosIds : string[] = p.layout.filter(isString) as any[];
        let selectedTodos : Todo[] = filter(todos, (t:Todo) : boolean => contains(t._id)(relatedTodosIds), "restoreProject");  

        dispatch({
            type:"multiple",
            load:[
                {type:"updateTodos", load:selectedTodos.map((t:Todo) => ({...t,deleted:undefined}))},
                {type:"updateProject", load:{...p,deleted:undefined}}
            ]
        });
    };



    onHideFrom = () => {
        let {dispatch,project,todos,selectedCategory} = this.props;
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

        dispatch({type:"updateProject", load:{...project,expand}});
        this.setState({openMenu:false}); 
    };



    openProject =  (e) => {
        let {dispatch,project,todos,selectedCategory} = this.props;
        e.stopPropagation();  

        if(not(isNil(project.deleted))){ return }
        if(not(isNil(project.completed))){ return } 

        dispatch({
            type:"multiple",
            load:[
                {type:"selectedCategory", load:"project"},
                {type:"selectedProjectId", load:project._id}
            ]
        });
    };


    
    render(){ 
        let { dispatch,project,todos,selectedCategory,showMenu } = this.props;
        let { done,left } = getProgressStatus(project, todos, false); 
        let totalValue = (done+left)===0 ? 1 : (done+left);
        let currentValue = done;

        let flagColor = "rgba(100,100,100,0.7)";
        let daysLeft = 0;  


        if(isDate(project.deadline)){      
           daysLeft = daysRemaining(project.deadline);        
           flagColor = daysLeft <= 1 ? "rgba(200,0,0,0.7)" : "rgba(100,100,100,0.7)";
        }     


        return <li  
            onClick={this.openProject}    
            style={{width:"100%"}}   
            className="upcomingListHeading"
        >      
        <div   
            id = {project._id}        
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
                        transform: "rotate(270deg)",
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
    }
}
 


interface ProjectLinkLogbookProps{ 
    project:Project, 
    dispatch:Function,
    todos:Todo[],
    selectedCategory:Category
}
interface ProjectLinkLogbookState{}   



@connect(
    (store:Store,props:ProjectLinkLogbookProps):ProjectLinkLogbookProps => ({...props,todos:store.todos}), 
    attachDispatchToProps,
    null, 
    { areStatesEqual:(nextStore:Store, prevStore:Store) => nextStore.todos===prevStore.todos }   
)  
export class ProjectLinkLogbook extends Component<ProjectLinkLogbookProps, ProjectLinkLogbookState>{

    constructor(props){ super(props) }


     
    uncomplete = (e) => {
        let {project} = this.props;
        this.props.dispatch({type:"updateProject",load:{...project,completed:undefined}});
    };



    render(){ 
        let { dispatch,project,todos,selectedCategory } = this.props;
        let { done, left } = getProgressStatus(project, todos, true); 
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
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                border:"1px solid rgb(159, 159, 159)",
                boxSizing:"border-box" 
            }}> 
                <div style={{
                    width:"18px",
                    height:"18px",
                    transform: "rotate(270deg)",
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
            <div    
                id={project._id}   
                style={{   
                    paddingLeft:"5px",
                    overflowX:"hidden"
                }}  
            >    
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
    todos:Todo[],
    selectedCategory:Category 
}
interface ProjectLinkTrashState{ openMenu:boolean }   

@connect(
    (store:Store,props:ProjectLinkTrashProps):ProjectLinkTrashProps => ({...props,todos:store.todos}), 
    attachDispatchToProps,
    null, 
    { areStatesEqual:(nextStore:Store, prevStore:Store) => nextStore.todos===prevStore.todos }   
)  
export class ProjectLinkTrash extends Component<ProjectLinkTrashProps, ProjectLinkTrashState>{
    actionsAnchor:HTMLElement;

    constructor(props){ 
        super(props); 
        this.state={openMenu:false};
    }
     

    restoreProject = (p:Project) : void => { 
        let {dispatch, todos} = this.props;
        let relatedTodosIds : string[] = p.layout.filter(isString) as any[];
        let selectedTodos : Todo[] = filter(todos, (t:Todo) : boolean => contains(t._id)(relatedTodosIds), "restoreProject");  

        dispatch({
            type:"multiple",
            load:[
               {type:"updateTodos", load:selectedTodos.map((t:Todo) => ({...t,deleted:undefined}))},
               {type:"updateProject", load:{...p,deleted:undefined}}
            ]
        }); 
    };
 
 
    render(){ 
        let { dispatch,project,todos,selectedCategory} = this.props;
        let { done, left } = getProgressStatus(project, todos, true); 
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
                    display:"flex",
                    justifyContent:"center",
                    alignItems:"center",
                    border:"1px solid rgb(108, 135, 222)",
                    boxSizing:"border-box" 
                }}> 
                    <div style={{
                        width:"18px",
                        height:"18px",
                        transform: "rotate(270deg)",
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
 