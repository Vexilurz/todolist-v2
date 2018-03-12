import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { connect } from "react-redux";
import { Todo, Project, Area } from '../../database';
import { ContainerHeader } from '../ContainerHeader';
import { byTags, getTagsFromItems, byDeleted, attachDispatchToProps} from '../../utils/utils';
import Restore from 'material-ui/svg-icons/navigation/refresh'; 
import { TodoInput } from '../TodoInput/TodoInput';
import { FadeBackgroundIcon } from '../FadeBackgroundIcon';
import { allPass, isEmpty, cond, flatten, not, contains, reject, compose } from 'ramda';
import { Category, filter } from '../MainContainer';
import { SimplePopup } from '../SimplePopup';
import { Store } from '../../app';
import { ProjectLinkTrash } from '../Project/ProjectLink';
import { AreaTrashLink } from '../Area/AreaLink';
import { chooseIcon } from '../../utils/chooseIcon';
import { isDate, isTodo, isProject, isArea, isString } from '../../utils/isSomething';


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


        let deletedAreas = filter(areas, allPass([byDeleted,byTags(selectedTag)])); 


        let deletedProjects = compose(
            reject(
                (project:Project) => deletedAreas.find( 
                    (area:Area) => contains(project._id)(area.attachedProjectsIds) 
                )
            ),
            (projects:Project[]) => filter(projects, allPass([byDeleted,byTags(selectedTag)]))
        )(projects);


        let deletedTodos = compose( 
            (deletedProjects:Project[]) => reject(
                (todo:Todo) => deletedProjects.find( 
                    (project:Project) => contains(todo._id)(project.layout) 
                ),
                todos
            ),
            (projects:Project[]) => filter(projects, allPass([byDeleted,byTags(selectedTag)]))
        )(projects);


        let tags = getTagsFromItems([...deletedTodos,...deletedProjects,...deletedAreas]); 
        let empty = isEmpty(deletedTodos) && isEmpty(deletedProjects) && isEmpty(deletedAreas);


        let items = [...deletedTodos,...deletedProjects,...deletedAreas].sort(sortByDeleted); 


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
                                    <ProjectLinkTrash { ...{project} as any }/>  
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
                                    <AreaTrashLink {...{area} as any}/>
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
} // extends Store{}   
interface TrashPopupState{}  

@connect(
    (store,props) => ({ showTrashPopup:store.showTrashPopup }), 
    attachDispatchToProps,
    null,
    {
        areStatesEqual: (nextStore:Store, prevStore:Store) => {
            return nextStore.showTrashPopup===prevStore.showTrashPopup;
        }
    }
)
export class TrashPopup extends Component<TrashPopupProps,TrashPopupState>{

    onCancel = () => { 
        this.props.dispatch({type:"showTrashPopup", load:false});
    }
      
    onOk = (e) => { 
        this.props.dispatch({type:"removeDeleted"});  
        this.props.dispatch({type:"selectedCategory", load:"inbox"});
        this.props.dispatch({type:"selectedTag", load:"All"});
        this.props.dispatch({type:"showTrashPopup", load:false});
    }   

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