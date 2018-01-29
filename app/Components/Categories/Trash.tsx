import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import Popover from 'material-ui/Popover';
import { Tags } from '../../Components/Tags';
import { Transition } from 'react-transition-group';
import { TodosList } from '../../Components/TodosList';
import { Todo, Project, Area } from '../../database';
import { ContainerHeader } from '../ContainerHeader';
import { byTags, chooseIcon, insideTargetArea, getTagsFromItems, byDeleted, Item, attachDispatchToProps } from '../../utils';
import { getAreaLink } from '../Area/AreaLink';
import Restore from 'material-ui/svg-icons/navigation/refresh'; 
import { TodoInput } from '../TodoInput/TodoInput';
import { FadeBackgroundIcon } from '../FadeBackgroundIcon';
import { uniq, compose, contains, allPass, not } from 'ramda';
import { isString } from 'util';
import { Category } from '../MainContainer';
import { SimplePopup } from '../SimplePopup';
import { Store } from '../../app';
import { ProjectLink } from '../Project/ProjectLink';

 

interface TrashProps{ 
    dispatch:Function,
    selectedCategory:Category,  
    showTrashPopup:boolean, 
    tags:string[],
    selectedProjectId:string,
    selectedAreaId:string, 
    searched:boolean, 
    selectedTodoId:string,  
    selectedTag:string,
    todos:Todo[],
    projects:Project[],
    areas:Area[],
    rootRef:HTMLElement     
}      

interface TrashState{}
 
export class Trash extends Component<TrashProps,TrashState>{
     

    constructor(props){
        super(props);
    }  


    shouldComponentUpdate(nextProps:TrashProps){
        let should = false;


        if(   
            this.props.tags!==nextProps.tags ||
            this.props.searched!==nextProps.searched ||
            this.props.selectedTag!==nextProps.selectedTag ||
            this.props.todos!==nextProps.todos ||
            this.props.projects!==nextProps.projects ||
            this.props.areas!==nextProps.areas ||
            this.props.rootRef!==nextProps.rootRef 
        ){
            should = true; 
        }


        return should;
    }
 

    getDeletedProjectElement = (value:Project, index:number) : JSX.Element => {
        return <div 
            key={`deletedProject-${index}`}  
            style={{
               position:"relative", 
               display:"flex", 
               alignItems:"center"
            }}
        >   
            <div style={{width:"100%"}}>
                <ProjectLink
                    dispatch={this.props.dispatch}
                    index={index}
                    selectedCategory={this.props.selectedCategory as Category}
                    project={value}
                    todos={this.props.todos}
                    simple={true}
                />   
            </div>   
        </div>    
    }
   

    getDeletedAreaElement = (value:Area, index:number) : JSX.Element => { 
        return <div 
            key={`deletedArea-${index}`} 
            style={{
                position:"relative", 
                display:"flex", 
                alignItems:"center"
            }}
        >  
            <div style={{width:"100%"}}>
                { 
                    getAreaLink(
                      value, 
                      this.props.todos, 
                      this.props.projects, 
                      index, 
                      this.props.dispatch
                    ) 
                }
            </div>  
        </div>   
    } 
 

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
                    selectedCategory={this.props.selectedCategory}
                    selectedTodoId={this.props.selectedTodoId} 
                    dispatch={this.props.dispatch}   
                    tags={this.props.tags} 
                    selectedProjectId={this.props.selectedProjectId}
                    selectedAreaId={this.props.selectedAreaId} 
                    todos={this.props.todos} 
                    searched={this.props.searched}
                    rootRef={this.props.rootRef} 
                    todo={value}
                />   
            </div>   
        </div>  
    }    
        
      
    selectDeleted = () : {
        deletedTodos : Todo[], 
        deletedProjects : Project[], 
        deletedAreas : Area[], 
        empty : boolean,
        tags : string[] 
    } => { 
        let {selectedTag, todos, projects, areas} = this.props;

        let filters = [byDeleted,byTags(selectedTag)]; 

        let deletedProjects = projects.filter(allPass(filters));
        let deletedAreas = areas.filter(allPass(filters)); 
        let deletedTodos = todos.filter(allPass(filters));

        let tags = compose(
            getTagsFromItems, 
            (items : Item[]) => items.filter(byDeleted)  
        )([
            ...todos, 
            ...projects,  
            ...areas
        ]); 

        
        let empty : boolean = deletedTodos.length===0 && 
                              deletedProjects.length===0 && 
                              deletedAreas.length===0;  
          
        return {deletedTodos, deletedProjects, deletedAreas, empty, tags};  
    } 
 

    onEmptyTrash = () => {
        this.props.dispatch({type:"showTrashPopup", load:true});
    }
     
    
    render(){  
        let {
            todos,  
            projects, 
            areas,
            selectedProjectId,
            searched, 
            dispatch,
            selectedTodoId, 
            selectedAreaId,
            selectedTag, 
            rootRef
        } = this.props; 
 
        let {
            deletedTodos, 
            deletedProjects, 
            deletedAreas, 
            empty, 
            tags
        } = this.selectDeleted();
        
 
        return <div style={{WebkitUserSelect:"none"}}> 
            <div> 
                <ContainerHeader  
                    selectedCategory={"trash"}  
                    dispatch={dispatch} 
                    tags={tags} 
                    selectedTag={selectedTag}
                    showTags={true} 
                /> 
            </div>     

            <FadeBackgroundIcon    
                container={rootRef} 
                selectedCategory={"trash"}  
                show={empty}
            />               

            <div style={{paddingTop:"20px", paddingBottom:"20px"}}>
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
             
            <div style={{
                paddingTop:"20px", 
                paddingBottom:"20px",
                position:"relative", 
                width:"100%"
            }}>
                { 
                    deletedTodos.map(
                        (value:Todo,index) => <div
                            key={value._id}
                            style={{
                                position:"relative", 
                                marginTop:"5px",
                                marginBottom:"5px"
                            }}
                        >
                            <TodoInput   
                                id={value._id}
                                key={value._id}
                                projects={projects}  
                                dispatch={dispatch}  
                                selectedProjectId={selectedProjectId}
                                selectedAreaId={selectedAreaId} 
                                todos={this.props.todos}
                                selectedCategory={"trash"} 
                                selectedTodoId={selectedTodoId}
                                tags={tags} 
                                searched={searched}
                                rootRef={rootRef}  
                                todo={value}
                            />     
                        </div>
                    )
                }
            </div>    

            <div style={{paddingTop:"10px", paddingBottom:"10px"}}>
                {deletedProjects.map(this.getDeletedProjectElement)}  
            </div>  
 
            <div style={{paddingTop:"10px", paddingBottom:"10px"}}>
                {deletedAreas.map(this.getDeletedAreaElement)} 
            </div>  
        </div> 
    }
} 
 
      

interface TrashPopupProps extends Store{}   
interface TrashPopupState{}  

@connect((store,props) => ({...store, ...props}), attachDispatchToProps)
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