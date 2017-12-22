import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import Popover from 'material-ui/Popover';
import { Footer } from '../../Components/Footer';
import { Tags } from '../../Components/Tags';
import { Transition } from 'react-transition-group';
import { TodosList } from '../../Components/TodosList';
import { Todo, Project, Area } from '../../database';
import { ContainerHeader } from '../ContainerHeader';
import { byTags, chooseIcon, insideTargetArea } from '../../utils';
import { getProjectLink } from '../Project/ProjectLink';
import { getAreaLink } from '../Area/AreaLink';
import Restore from 'material-ui/svg-icons/navigation/refresh'; 
import { TodoInput } from '../TodoInput/TodoInput';

 

interface TrashProps{ 
    dispatch:Function,
    tags:string[],
    selectedTag:string,
    todos:Todo[],
    projects:Project[],
    areas:Area[],
    rootRef:HTMLElement     
}      
    
 
interface TrashState{  
    showPopup : boolean,
    deletedTodos : Todo[],
    deletedProjects : Project[],
    deletedAreas : Area[] 
}

  
export class Trash extends Component<TrashProps,TrashState>{
     
    constructor(props){

        super(props);

        this.state = {
            showPopup : false,
            deletedTodos : [],
            deletedProjects :[],
            deletedAreas : [] 
        }; 
 
    }  



    componentDidMount(){
        this.selectDeletedTodos(this.props);
        this.selectDeletedProjects(this.props);
        this.selectDeletedAreas(this.props);   
    }



    selectDeletedTodos = (props:TrashProps) => this.setState({
        deletedTodos : props.todos.filter( (t:Todo) => t.deleted !==undefined )
    })



    selectDeletedProjects = (props:TrashProps) => this.setState({
        deletedProjects : props.projects.filter( (p:Project) => p.deleted !==undefined  )
    })


  
    selectDeletedAreas = (props:TrashProps) => this.setState({
        deletedAreas : props.areas.filter( (a:Area) => a.deleted !==undefined  )
    })

 
 
    componentWillReceiveProps(nextProps){

        this.selectDeletedTodos(nextProps);

        this.selectDeletedProjects(nextProps);

        this.selectDeletedAreas(nextProps); 

    }  
 


    onEmptyTrash = (e) => {

        if(!this.state.showPopup)
            this.setState({showPopup:true}); 

    }
     
 

    onCancel = (e) => this.setState({showPopup:false}) 
    

 
    onOk = (e) => this.setState( 
        {showPopup:false}, 
        () => this.props.dispatch({type:"removeAllTypes"})
    ) 
     
 

    restoreTodo = (t:Todo) : void => {
        this.props.dispatch({type:"updateTodo", load:{...t,deleted:undefined}})
    }



    restoreProject = (p:Project) : void => {
        this.props.dispatch({type:"updateProject", load:{...p,deleted:undefined}})
    }
 


    restoreArea = (a:Area) : void => { 
        this.props.dispatch({type:"updateArea", load:{...a,deleted:undefined}})
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
           
            <div 
                onClick={(e) => this.restoreProject(value)} 
                style={{
                    paddingRight:"5px",
                    cursor:"pointer",     
                    display:"flex",  
                    position:"relative", 
                    alignItems:"center"
                }}       
            > 
                <Restore style={{width:"20px", height:"20px"}}/> 
            </div>  
  
            <div style={{width:"100%"}}>
                { getProjectLink({width:"12px", height:"12px"}, value, index, () => {}) }
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
            <div 
                onClick={(e) => this.restoreArea(value)} 
                style={{
                    paddingRight:"5px",
                    cursor:"pointer",
                    display:"flex",  
                    position:"relative",
                    alignItems:"center" 
                }}     
            > 
                <Restore style={{width:"20px", height:"20px"}}/> 
            </div>   
 
            <div style={{width:"100%"}}>
                { getAreaLink({width:"20px",height:"20px"}, value, index, () => {}) }
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
            <div  
                onClick={(e) => this.restoreTodo(value)} 
                style={{
                    paddingRight:"5px",
                    paddingBottom: "8px", 
                    display:"flex",  
                    cursor:"pointer", 
                    position:"relative",
                    alignItems:"center" 
                }} 
            > 
                <Restore style={{width:"20px", height:"20px"}}/> 
            </div>  

            <div style={{width:"100%"}}>
                <TodoInput   
                    id={value._id}
                    key = {value._id} 
                    dispatch={this.props.dispatch}   
                    tags={this.props.tags} 
                    rootRef={this.props.rootRef} 
                    todo={value}
                />   
            </div>   
         </div>  

    } 
         
   

    render(){ 

        return <div>
            <div> 
                <ContainerHeader  
                    selectedCategory={"trash"}  
                    dispatch={this.props.dispatch} 
                    tags={this.props.tags} 
                    selectedTag={this.props.selectedTag}
                /> 
            </div>   
  

            <div style={{paddingTop:"20px", paddingBottom:"20px"}}>
                <div    
                    onClick={this.onEmptyTrash}
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
            

            <div style={{paddingTop:"20px", paddingBottom:"20px"}}>
                {this.state.deletedTodos.map(this.getDeletedTodoElement)}
            </div>    

            <div style={{paddingTop:"10px", paddingBottom:"10px"}}>
                {this.state.deletedProjects.map(this.getDeletedProjectElement)}  
            </div>  
 
            <div style={{paddingTop:"10px", paddingBottom:"10px"}}>
                {this.state.deletedAreas.map(this.getDeletedAreaElement)} 
            </div>  

            {
                !this.state.showPopup ? null :
                <TrashPopup
                 dispatch={this.props.dispatch} 
                 container={this.props.rootRef} 
                 onCancel={this.onCancel}
                 onOk={this.onOk}
                />
            } 

        </div>
         
    }

} 
 
  

interface TrashPopupProps{
    dispatch:Function,
    container:HTMLElement, 
    onCancel : (e) => void,
    onOk : (e) => void   
} 



interface TrashPopupState{
    width : number,
    x : number,
    y : number 
}  
 
  

class TrashPopup extends Component<TrashPopupProps,TrashPopupState>{

    ref:HTMLElement; 
    timeout:any;  
 
    constructor(props){

        super(props);

        this.state = { 
            width : 400, 
            x : 0,
            y : 0 
        }; 

    }  



    onOutsideClick = (e) => {
        
        if(this.ref===null || this.ref===undefined)
            return; 

        let rect = this.ref.getBoundingClientRect();

        let x = e.pageX;
        
        let y = e.pageY; 
         
        let inside : boolean = insideTargetArea(this.ref)(x, y);

        if(!inside)
            this.props.onCancel(null); 
              
    }  
 


    updatePosition = (props:TrashPopupProps) : void => { 
        
        if(!props.container)
            return; 

        let fixedOffsetTop = 200;
        let rect = props.container.getBoundingClientRect();
        let x = rect.width/2 - this.state.width/2; 
        let y = fixedOffsetTop + props.container.scrollTop;
 
        this.setState({x,y});  
  
    }
         


    componentDidMount(){

        this.updatePosition(this.props);

        this.timeout = setTimeout(() => window.addEventListener("click", this.onOutsideClick), 300);  
        

    }  



    componentWillUnmount(){
        
        clearTimeout(this.timeout as any);

        window.removeEventListener("click", this.onOutsideClick);

    } 
 


    componentWillReceiveProps(nextProps){

       if(this.props.container!==nextProps.container)
          this.updatePosition(nextProps); 

    }
  

 
    render(){
 
     return <div   
                ref={(e) => { this.ref=e; }}
                onClick = {(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}  
                style={{   
                    padding: "10px", 
                    boxShadow: "0 0 18px rgba(0,0,0,0.5)", 
                    margin: "5px",
                    borderRadius: "5px",
                    zIndex: 30000, 
                    width: `${this.state.width}px`,  
                    height: "auto",    
                    position: "absolute",
                    backgroundColor: "rgba(238,237,239,1)",
                    left:`${this.state.x}px`, 
                    top:`${this.state.y}px`,   
                }}          
            >   
            <div style={{display:"flex", flexDirection:"column"}}>   
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
                            Are you sure you want to remove the items in the Trash permanently
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
                            onClick={this.props.onCancel} 
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
                            onClick={this.props.onOk}
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
            </div>
    } 
}