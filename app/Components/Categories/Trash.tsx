import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Component } from "react";  
import { Category, Todo, Project, Store, Area } from '../../types';
import { ContainerHeader } from '../ContainerHeader';
import { byTags, getTagsFromItems, byDeleted, attachDispatchToProps} from '../../utils/utils';
import Restore from 'material-ui/svg-icons/navigation/refresh'; 
import { TodoInput } from '../TodoInput/TodoInput';
import { FadeBackgroundIcon } from '../FadeBackgroundIcon';
import { allPass, isEmpty, cond, flatten, not, contains, reject, compose, defaultTo, all, prop } from 'ramda';
import { filter } from 'lodash'; 
import { SimplePopup } from '../SimplePopup';
import { ProjectLinkTrash } from '../Project/ProjectLink';
import { AreaTrashLink } from '../Area/AreaLink';
import { chooseIcon } from '../../utils/chooseIcon';
import { isDate, isTodo, isProject, isArea, isString } from '../../utils/isSomething';
import { isDev } from '../../utils/isDev';
import { assert } from '../../utils/assert';


let sortByDeleted = (a:(Todo & Project & Area),b:(Todo & Project & Area)) => {
    let aTime = 0;
    let bTime = 0;

    if(isDate(b.deleted)){ 
       bTime = b.deleted.getTime(); 
    }

    if(isDate(a.deleted)){
       aTime = a.deleted.getTime(); 
    }

    return bTime-aTime; 
};


interface TrashProps{ 
    dispatch:Function,
    groupTodos:boolean,
    scrolledTodo:Todo,
    selectedCategory:Category,  
    moveCompletedItemsToLogbook:string, 
    showTrashPopup:boolean, 
    selectedProjectId:string,
    selectedAreaId:string, 
    selectedTag:string, 
    indicators:{ 
        [key:string]:{
            active:number,
            completed:number,
            deleted:number
        }; 
    },
    todos:Todo[],
    projects:Project[],
    areas:Area[],
    rootRef:HTMLElement     
}      

 
interface TrashState{}
 
export class Trash extends Component<TrashProps,TrashState>{ 
     
    constructor(props){ super(props) }  
   
 

    getDeletedTodoElement = (value:Todo, index:number) : JSX.Element => {  
         return <div 
            key={`deletedTodo-${index}`} 
            style={{
                position:"relative", 
                display:"flex", 
                alignItems:"center"
            }}   
         >  
            <div style={{width:"100%"}}>
                <TodoInput   
                    id={value._id} 
                    key = {value._id} 
                    projects={this.props.projects} 
                    scrolledTodo={this.props.scrolledTodo}  
                    selectedCategory={this.props.selectedCategory}
                    dispatch={this.props.dispatch}   
                    groupTodos={this.props.groupTodos}
                    moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                    selectedProjectId={this.props.selectedProjectId}
                    selectedAreaId={this.props.selectedAreaId} 
                    rootRef={this.props.rootRef} 
                    todo={value}
                />   
            </div>   
        </div>   
    };    
        

    onEmptyTrash = () => this.props.dispatch({type:"showTrashPopup", load:true});
     

    render(){  
        let {
            todos, projects, areas, selectedProjectId, selectedCategory,
            dispatch, selectedAreaId, selectedTag, rootRef
        } = this.props;   


        let deletedAreas = filter(areas, byDeleted); 


        let deletedProjects = compose(
            reject(
                (project:Project) => deletedAreas.find( 
                    (area:Area) => contains(project._id)(area.attachedProjectsIds) 
                )
            ),
            (projects:Project[]) => filter(projects, byDeleted)
        )(projects);


        let deletedTodos = compose( 
            (deletedProjects:Project[]) => {
                let ids = flatten( deletedProjects.map(p => p.layout.filter(isString)) );
                return reject((todo:Todo) =>  contains(todo._id)(ids),todos);
            },
            (projects:Project[]) => filter(projects, byDeleted)
        )(projects);


        let tags = getTagsFromItems([...deletedTodos,...deletedProjects,...deletedAreas]); 
        let empty = isEmpty(deletedTodos) && isEmpty(deletedProjects) && isEmpty(deletedAreas);


        let items = [
            ...deletedTodos.filter(byTags(selectedTag)),
            ...deletedProjects,
            ...deletedAreas
        ].sort(sortByDeleted); 


        if(isDev()){
            if(selectedTag!=="All"){ 
                assert( 
                    all((todo:Todo) => contains(selectedTag)(todo.attachedTags),filter(items,isTodo)),
                    `missing tag. Trash. ${selectedTag}`
                ) 
            }

            let todosIds = flatten( deletedProjects.map( p => p.layout.filter(isString) ) );
            assert(
                all((todo:Todo) => !contains(todo._id,todosIds), deletedTodos), 
                `Error: Deleted todos from deleted projects.`
            );

            let projectsIds = flatten( deletedAreas.map( a => a.attachedProjectsIds ) );
            assert(
                all((project:Project) => !contains(project._id,projectsIds), deletedProjects), 
                `Error: Deleted projects from deleted areas.`
            );
        }


        return <div id={`${selectedCategory}-list`} style={{WebkitUserSelect:"none"}}> 
            <ContainerHeader  
                selectedCategory={selectedCategory}  
                dispatch={dispatch}  
                tags={tags} 
                selectedTag={selectedTag}
                showTags={true} 
            />    
            <FadeBackgroundIcon    
                container={rootRef} 
                selectedCategory={selectedCategory}  
                show={empty}
            />   
            <div className={`no-print`} style={{paddingTop:"20px", paddingBottom:"20px"}}>
                <div    
                    onClick={(e) => { 
                        e.stopPropagation();
                        e.preventDefault();
                        this.onEmptyTrash();
                    }} 
                    style={{    
                        width:"130px",
                        display:"flex",
                        alignItems:"center",
                        cursor:"pointer",
                        justifyContent:"center",
                        borderRadius:"5px",
                        height:"30px",
                        backgroundColor:"rgb(10, 100, 240)"  
                    }}
                >
                    <div style={{color:"white", fontSize:"15px"}}>  
                        Empty Trash  
                    </div>  
                </div>  
            </div>   
            <div style={{paddingTop:"20px", paddingBottom:"20px", position:"relative",  width:"100%"}}>
                {   
                    items.map((value:any,index:number) => 
                        cond([ 
                            [
                                isTodo, 
                                (todo:Todo) => <div
                                    key={todo._id}
                                    style={{position:"relative",marginTop:"5px",marginBottom:"5px"}}
                                >
                                    <TodoInput    
                                        id={todo._id}
                                        key={todo._id}
                                        projects={projects}  
                                        scrolledTodo={this.props.scrolledTodo}
                                        moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                                        dispatch={dispatch}  
                                        selectedProjectId={selectedProjectId}
                                        groupTodos={this.props.groupTodos}
                                        selectedAreaId={selectedAreaId} 
                                        selectedCategory={selectedCategory}
                                        rootRef={rootRef}  
                                        todo={todo}
                                    />     
                                </div>
                            ],
                            [
                                isProject, 
                                (project:Project) : JSX.Element => <div 
                                    key={`deletedProject-${index}`}  
                                    style={{position:"relative",display:"flex",alignItems:"center",marginLeft:"-5px"}}
                                >   
                                    <div style={{width:"100%"}}>
                                        <ProjectLinkTrash 
                                            project={project}
                                            indicator={defaultTo({completed:0, active:0})(this.props.indicators[project._id])}
                                            dispatch={this.props.dispatch}
                                            selectedCategory={this.props.selectedCategory}
                                        />  
                                    </div>   
                                </div>   
                            ],
                            [
                                isArea,
                                (area:Area) : JSX.Element => <div 
                                    key={`deletedArea-${index}`} 
                                    style={{position:"relative",display:"flex",alignItems:"center",marginLeft:"-5px"}}
                                >   
                                    <div style={{width:"100%"}}>
                                        <AreaTrashLink
                                            dispatch={this.props.dispatch}
                                            projects={this.props.projects}
                                            todos={this.props.todos}
                                            area={area}
                                        />
                                    </div>  
                                </div>    
                            ],
                            [
                                () => true, 
                                () => null
                            ]
                        ])(value)
                    )
                }
                </div>   
        </div> 
    }
} 
  
      

interface TrashPopupProps{
    dispatch:Function, 
    showTrashPopup:boolean
}   
interface TrashPopupState{}  


export class TrashPopup extends Component<TrashPopupProps,TrashPopupState>{

    onCancel = () => this.props.dispatch({type:"showTrashPopup", load:false});
    
      
    onOk = (e) => this.props.dispatch({
        type:"multiple",
        load:[
            {type:"removeDeleted"},  
            {type:"selectedCategory", load:"inbox"},
            {type:"selectedTag", load:"All"},
            {type:"showTrashPopup", load:false}
        ]
    });
    

    render(){ 
        return <SimplePopup      
            show={this.props.showTrashPopup}
            onOutsideClick={this.onCancel}
        > 
        <div style={{
            display:"flex",
            padding:"10px",
            flexDirection:"column",
            boxShadow:"0 0 18px rgba(0,0,0,0.5)",
            borderRadius:"10px",
            backgroundColor:"rgb(238, 237, 239)"
        }}>   
            <div style={{display:"flex", alignItems:"center"}}>  
                <div style={{
                    display: "flex", 
                    alignItems: "center",
                    justifyContent: "center",
                    padding:"10px"  
                }}>  
                    { chooseIcon({width:"80px", height:"80px"}, "inbox") }  
                </div>
                <div style={{ 
                    display:"flex",
                    flexDirection:"column",
                    justifyContent:"flex-start",
                    padding:"10px" 
                }}>
                    <div style={{
                        paddingBottom:"10px", 
                        fontWeight:"bold", 
                        fontSize:"15px", 
                        color:"rgba(0,0,0,1)"
                    }}>   
                        Empty Trash  
                    </div>
                    <div style={{fontSize:"14px", color:"rgba(0,0,0,1)"}}>
                        Are you sure you want to remove the items in the Trash permanently ?
                    </div>
                </div>
            </div>
            <div style={{  
                display:"flex",  
                alignItems: "center", 
                justifyContent: "flex-end",
                padding: "10px"
            }}>
                <div style={{padding: "10px"}}>
                    <div    
                        onClick={this.onCancel} 
                        style={{       
                            width:"90px",
                            display:"flex",
                            alignItems:"center",
                            cursor:"pointer",
                            justifyContent:"center",
                            borderRadius:"5px",
                            height:"25px",  
                            border:"1px solid rgba(100,100,100,0.7)",
                            backgroundColor:"white"  
                        }}  
                    > 
                        <div style={{color:"rgba(0,0,0,0.9)", fontSize:"16px"}}>      
                            Cancel
                        </div>  
                    </div>
                </div> 
                <div style={{padding: "10px"}}>
                    <div     
                        onClick={this.onOk}
                        style={{      
                            width:"90px",
                            display:"flex",
                            alignItems:"center",
                            cursor:"pointer",
                            justifyContent:"center",
                            borderRadius:"5px",
                            height:"25px",  
                            border:"1px solid rgba(100,100,100,0.5)",
                            backgroundColor:"rgb(10, 90, 250)"  
                        }}
                    > 
                        <div style={{color:"white", fontSize:"16px"}}>  
                            OK
                        </div>   
                    </div> 
                </div>
            </div>
        </div>   
        </SimplePopup> 
    }
}