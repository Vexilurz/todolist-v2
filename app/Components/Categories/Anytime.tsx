import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { attachDispatchToProps, uppercase, insideTargetArea, chooseIcon, byTags, showTags, byNotCompleted, byNotDeleted, byCategory, allPass, getTagsFromItems, unique } from "../../utils"; 
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import { queryToTodos, getTodos, updateTodo, Todo, removeTodo, addTodo, Project, Area } from '../../database';
import Popover from 'material-ui/Popover';
import { Footer } from '../../Components/Footer';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Repeat from 'material-ui/svg-icons/av/repeat';
import { Store } from '../../App';
import Inbox from 'material-ui/svg-icons/content/inbox';
import Duplicate from 'material-ui/svg-icons/content/content-copy';
import ShareIcon from 'material-ui/svg-icons/social/share';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import { TextField } from 'material-ui';
import AutosizeInput from 'react-input-autosize';
import { TodosList } from '../TodosList';
import { ContainerHeader } from '../ContainerHeader';
import { Tags } from '../Tags';
import { getProjectLink } from '../Project/ProjectLink';
import { getAreaLink } from '../Area/AreaLink';
import { FadeBackgroundIcon } from '../FadeBackgroundIcon';
 





interface AnytimeProps{
    dispatch:Function,
    selectedTodoId:string,
    selectedTag:string,
    rootRef:HTMLElement,
    areas:Area[], 
    projects:Project[], 
    todos:Todo[],
    tags:string[]
}


interface AnytimeState{
    table:any,
    empty:boolean,
    tags:string[]   
} 
 


export class Anytime extends Component<AnytimeProps, AnytimeState>{

    constructor(props){
        super(props);
        this.state = {
            table : null,
            empty:false,
            tags:[]  
        } 
    }



 
    init = (props:AnytimeProps) => {

        var t0 = performance.now();
        let table = this.groupObjects(props);
        let tags = unique(
            getTagsFromItems([
                ...table["projects"],
                ...table["areas"],
                ...table["todos"]
            ]) 
        );
        var t1 = performance.now();
        console.log("Call to groupObjects (Anytime) took " + (t1 - t0) + " milliseconds.");
         
 
        this.setState({table, tags}); 
 
    } 
    

    componentDidMount(){

        this.init(this.props);
 
    }


    componentWillReceiveProps(nextProps:AnytimeProps){


        let updateTable = false;

        if(this.props.todos !== nextProps.todos){

            updateTable = true;

        }else if(this.props.projects !== nextProps.projects){

            updateTable = true;

        }else if(this.props.areas !== nextProps.areas){

            updateTable = true;

        }  
 
        if(updateTable){
           this.init(nextProps);
        }
           
           
    }


 
    groupObjects = (props:AnytimeProps) => { 

        let table = {};

        let filters = [
            byTags(props.selectedTag),
            byNotCompleted, 
            byNotDeleted   
        ];     

        let projects : Project[] = []; 
        let areas : Area[] = [];
        let todos : Todo[] = props.todos;
         
        table["projects"] = [];
        table["areas"] = [];
        table["todos"] = []; 


 
        for(let i=0;  i<props.projects.length; i++){
            let project = props.projects[i]; 
            if(allPass(filters,project)){
               table[project._id] = [];
               table["projects"].push(project); 
               projects.push(project);
            }
        }

   
        for(let i=0;  i<props.areas.length; i++){
            let area = props.areas[i];
            if(allPass(filters,area)){
               table[area._id] = [];
               table["areas"].push(area); 
               areas.push(area);
            }
        }



        table["detached"] = [];     
  
        for(let i = 0; i<todos.length; i++){

            if(!allPass(filters,todos[i]))
                continue;  

            table["todos"].push(todos[i]);     

            let attached = false;


            for(let j=0; j<projects.length; j++){
                let p = projects[j];
                if(p.attachedTodosIds.indexOf(todos[i]._id)!==-1){
                   table[p._id].push(todos[i]);
                   attached = true; 
                   break; 
                } 
            } 

            for(let k=0; k<areas.length; k++){
                let a = areas[k]; 
                if(a.attachedTodosIds.indexOf(todos[i]._id)!==-1){
                   table[a._id].push(todos[i]);
                   attached = true; 
                   break;
                }
            }   

            if(!attached)
               table["detached"].push(todos[i]); 
              
        }


        if(
            table["projects"].length===0  &&  
            table["areas"].length===0  &&  
            table["todos"].length===0
        ){

            this.setState({empty:true});
        
        }


        return table; 

    } 

 


    render(){
  
        return !this.state.table ? null :
                <div>
                    <ContainerHeader 
                        selectedCategory={"anytime"}  
                        dispatch={this.props.dispatch} 
                        tags={this.props.tags} 
                        selectedTag={this.props.selectedTag}
                    />   
                    
                    <FadeBackgroundIcon    
                        container={this.props.rootRef} 
                        selectedCategory={"anytime"}  
                        show={this.state.empty}
                    />   
 
                    <div style={{paddingTop:"20px", paddingBottom:"20px"}}>
                        <TodosList    
                            filters={[]}  
                            isEmpty={(empty:boolean) => {}}    
                            setSelectedTags={(tags:string[]) => {}}
                            dispatch={this.props.dispatch}     
                            selectedCategory={"anytime"} 
                            selectedTag={this.props.selectedTag}  
                            rootRef={this.props.rootRef}
                            todos={this.state.table["detached"]}  
                            tags={this.props.tags}  
                        /> 
                    </div>      
 
                    

                    <AnytimeProjectsList 
                        dispatch={this.props.dispatch}
                        selectedTag={this.props.selectedTag}
                        rootRef={this.props.rootRef}
                        tags={this.props.tags}
                        table={this.state.table}
                    /> 
                
                    <AnytimeAreasList 
                        dispatch={this.props.dispatch}
                        selectedTag={this.props.selectedTag}
                        rootRef={this.props.rootRef}
                        tags={this.props.tags}
                        table={this.state.table}
                    />
 
                    
                </div> 

    }

}
 











interface AnytimeProjectsListProps{
    dispatch:Function,
    selectedTag:string, 
    rootRef:HTMLElement,
    tags:string[],
    table:any
} 
 
interface AnytimeProjectsListState{}

class AnytimeProjectsList extends Component<AnytimeProjectsListProps,AnytimeProjectsListState>{


    constructor(props){
        super(props);
    }


    render(){

        return  <div style={{paddingTop:"20px", paddingBottom:"20px"}}> 
            {    
                this.props.table.projects.map(
                    (p:Project, index:number) : JSX.Element => {

                        return <div key={`project-${index}`} style={{padding:"10px"}}>

                            <div style={{padding:"10px"}}>{

                                getProjectLink({width: "15px", height: "15px"}, p, index, this.props.dispatch)

                            }</div> 

                            <ExpandableTodosList
                                dispatch={this.props.dispatch}   
                                selectedTag={this.props.selectedTag} 
                                rootRef={this.props.rootRef}
                                todos={this.props.table[p._id]} 
                                tags={this.props.tags}
                            />

                        </div>

                    }
                )
            } 
        </div>

    }

}












interface AnytimeAreasListProps{
    dispatch:Function,
    selectedTag:string, 
    rootRef:HTMLElement,
    tags:string[],
    table:any
}

interface AnytimeAreasListState{}

class AnytimeAreasList extends Component<AnytimeAreasListProps,AnytimeAreasListState>{


    constructor(props){
        super(props);
    }
 

    render(){

        return <div style={{paddingTop:"20px", paddingBottom:"20px"}}>
                {  
                    this.props.table.areas.map(
                        (a:Area, index:number) : JSX.Element => {

                            return <div key={`area${index}`} style={{padding:"10px"}}>

                                <div style={{padding:"10px"}}>
                                { 
                                    getAreaLink( 
                                        {width:"20px", height:"20px"}, 
                                        a, 
                                        index,  
                                        this.props.dispatch
                                    )
                                }</div> 
 
                                <ExpandableTodosList
                                    dispatch={this.props.dispatch}   
                                    selectedTag={this.props.selectedTag} 
                                    rootRef={this.props.rootRef}
                                    todos={this.props.table[a._id]} 
                                    tags={this.props.tags} 
                                />

                            </div>

                        }
                    )
                } 
        </div>  

    }

}

 







interface ExpandableTodosListProps{
    dispatch:Function,   
    selectedTag:string, 
    rootRef:HTMLElement, 
    todos:Todo[],
    tags:string[] 
} 
 


interface ExpandableTodosListState{
    expanded : boolean 
} 

 
 
export class ExpandableTodosList extends Component<ExpandableTodosListProps,ExpandableTodosListState>{

    constructor(props){
        
        super(props);

        this.state = {
            expanded : false,
        }

    }


    render(){ 

        let idx = this.state.expanded ? this.props.todos.length : 3; 
        let showExpandButton = this.props.todos.length > 3; 
          
        return <div>  
            <div>     
                <div style={{padding:"10px"}}>      
                    <TodosList       
                        filters={[]}  
                        isEmpty={(empty:boolean) => {}}  
                        setSelectedTags={(tags:string[]) => {}}
                        dispatch={this.props.dispatch}     
                        selectedCategory={"anytime"} 
                        selectedTag={this.props.selectedTag}  
                        rootRef={this.props.rootRef}
                        todos={this.props.todos.slice(0,idx)}  
                        tags={this.props.tags}  
                    /> 
                </div>  

  
                {   
                    !showExpandButton ? null :
                    <div style={{cursor: "pointer", height: "30px"}}>
                        {   
                            <div     
                                onClick={() => this.setState({expanded:!this.state.expanded})}
                                style={{
                                    width:"100%",
                                    height:"30px",
                                    fontSize:"14px",
                                    display:"flex",
                                    alignItems:"center",
                                    cursor:"pointer",  
                                    paddingLeft:"30px",
                                    color:"rgba(100, 100, 100, 0.6)"
                                }}
                            >     
                                { 
                                    !this.state.expanded ? 
                                    `Show ${ this.props.todos.length-3 } more items` :
                                    `Hide` 
                                } 
                            </div>
                        }
                    </div>
                }
            </div>
        </div>
 
    }

} 