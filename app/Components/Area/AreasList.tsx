import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import SortableContainer from '../../sortable-hoc/sortableContainer';
import SortableElement from '../../sortable-hoc/sortableElement';
import SortableHandle from '../../sortable-hoc/sortableHandle';
import { arrayMove } from '../../sortable-hoc/utils';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import IconButton from 'material-ui/IconButton'; 
import { Project, Area } from '../../database';
import NewAreaIcon from 'material-ui/svg-icons/maps/layers';
import { stringToLength, byNotCompleted, byNotDeleted, daysRemaining, dateDiffInDays } from '../../utils';
import { SortableList } from '../SortableList';
import PieChart from 'react-minimal-pie-chart';
import { uniq, allPass, remove, toPairs, intersection, isEmpty, contains, assoc, isNil } from 'ramda';
import { Category } from '../MainContainer';


export let changeProjectsOrder = (dispatch:Function, listAfter:(Project | Area | Separator)[]) : void => {
    let projects = listAfter.filter( i => i.type==="project" ) as Project[];
    projects = projects.map((item:Project,index:number) => assoc("priority",index,item));

    for(let i=0; i<projects.length; i++){
        if(projects[i].type!=="project"){
            throw new Error(`Item is not a project ${JSON.stringify(projects[i])}`)
        }
    }  

    dispatch({type:"updateProjects", load:projects});  
}



export let attachToArea = (dispatch:Function, closestArea:Area, selectedProject:Project) : void => {
    
    if(!closestArea) 
        throw new Error(`closestArea undefined. attachToArea.`);

    if(closestArea.type!=="area")  
        throw new Error(`closestArea is not of type Area. ${JSON.stringify(closestArea)}. attachToArea.`);    

    closestArea.attachedProjectsIds = [selectedProject._id,...closestArea.attachedProjectsIds];
    dispatch({type:"updateArea", load:closestArea});  
}  
    
     

export let removeFromArea = (dispatch:Function, fromArea:Area, selectedProject:Project) : void => {

    let idx = fromArea.attachedProjectsIds.findIndex( 
        (id:string) => id===selectedProject._id 
    );  

    if(idx===-1){
        throw new Error(`
            selectedProject is not attached to fromArea.
            ${JSON.stringify(selectedProject)} 
            ${JSON.stringify(fromArea)}
        `)
    }

    if(selectedProject.type!=="project"){  
        throw new Error(`
            selectedProject is not of type project. 
            ${JSON.stringify(selectedProject)}. 
            removeFromArea.
        `);  
    }   

    if(fromArea.type!=="area"){  
        throw new Error(`
            fromArea is not of type Area. 
            ${JSON.stringify(fromArea)}. 
            removeFromArea.
        `);    
    }

    fromArea.attachedProjectsIds = remove(idx, 1, fromArea.attachedProjectsIds); 
    dispatch({type:"updateArea", load:fromArea});  
}




interface AreasListProps{   
    dispatch:Function,
    selectedProjectId:string,
    selectedAreaId:string, 
    selectedCategory:Category, 
    areas:Area[],
    projects:Project[]    
}  

interface AreasListState{}  

interface Separator{ type:string }; 
 
type LayoutItem = Project | Area | Separator;  

export class AreasList extends Component<AreasListProps,AreasListState>{


    constructor(props){
        
        super(props); 
    }


    groupProjectsByArea = (props:AreasListProps) : {
        table : { [key: string]: Project[]; }, 
        detached:Project[]  
    } => {
        
        let projects : Project[] = props.projects.filter( allPass([byNotDeleted,byNotCompleted]) );
        let areas : Area[] = props.areas.filter( byNotDeleted );
        let table = {};
        let detached : Project[] = [];

        for(let i=0; i<areas.length; i++)
            table[areas[i]._id] = [];
         

        for(let i=0; i<projects.length; i++){
            let projectId = projects[i]._id;
            let haveArea = false;

            for(let j=0; j<areas.length; j++){
                  
                let attachedProjectsIds : string[] = areas[j].attachedProjectsIds;
  
                if(contains(projectId,attachedProjectsIds)){
                   let key = areas[j]._id;
                   table[key].push(projects[i]);
                   haveArea=true;
                   break;
                }
            }
             
            if(!haveArea)
               detached.push(projects[i]);
        }  


        return {table,detached};
    }
         
    

    generateLayout = (  
        props : AreasListProps, 
        { table, detached } : { table : { [key: string]: Project[]; }, detached:Project[] } 
    ) : LayoutItem[] => { 

        let areas : Area[] = props
                            .areas
                            .filter( byNotDeleted )
                            .sort((a:Area,b:Area) => a.priority-b.priority);
                             
        let layout : LayoutItem[] = [];

        for(let i = 0; i<areas.length; i++){
            let key : string = areas[i]._id;  

            let attachedProjects : Project[] = table[key].sort((a:Project,b:Project) => a.priority-b.priority);

            layout.push(areas[i]);
             
            for(let j=0; j<attachedProjects.length; j++)
                layout.push(attachedProjects[j]);
        }

        layout.push({type:"separator"});
         
        detached.sort((a:Project, b:Project) => a.priority-b.priority);

        for(let i=0; i<detached.length; i++)
            layout.push(detached[i]);
 
        return layout;
    } 
 

    selectArea = (a:Area) => {
        this.props.dispatch({type:"selectedAreaId",load:a._id}); 
    }


    selectProject = (p:Project) => {
        this.props.dispatch({type:"selectedProjectId",load:p._id});
    } 
          
 
    getAreaElement = (a : Area, index : number) : JSX.Element => {
        return <AreaElement 
            area={a}
            index={index} 
            selectArea={this.selectArea}
            selectedAreaId={this.props.selectedAreaId}
            selectedCategory={this.props.selectedCategory}
        />
    }
 

    getProjectElement = (p:Project, index:number) : JSX.Element => {
        return <ProjectElement 
            project={p}
            index={index}
            selectProject={this.selectProject}
            selectedProjectId={this.props.selectedProjectId}
            selectedCategory={this.props.selectedCategory}
        />
    }
     

    getElement = (value : LayoutItem, index : number) : JSX.Element => {

        let separator = <div id="separator" style={{outline: "none", width:"100%",height:"30px"}}></div>;

 
        switch(value.type){

            case "area":
                return this.getAreaElement(value as any,index);

            case "project":
                return this.getProjectElement(value as any,index);
 
            case "separator":
                return separator;
 
            default:
                return null;      

        }

    }



    shouldCancelStart = (e) => {
        
        let nodes = [].slice.call(e.path);

        for(let i=0; i<nodes.length; i++){ 

            if(nodes[i].id==="separator")
                return true;
            else if(nodes[i].className==="area")
                return true;    

        }
  
        return false; 

    } 
 


    findClosestArea = (index, layout) : Area => {

        for(let i=index; i>=0; i--)
            if(layout[i].type==="area")
               return {...layout[i]};     
                
        return null;

    }   



    isDetached = (index, layout) : boolean => {

        for(let i=index; i>=0; i--)
            if(layout[i].type==="separator")
               return true;     
              
        return false;

    }
  


    moveToClosestArea = (fromArea:Area, closestArea:Area, selectedProject:Project) : void => {
 
        if(fromArea.type!=="area")  
           throw new Error(`fromArea is not of type Area. ${JSON.stringify(fromArea)}. moveToClosestArea.`);    

        if(closestArea.type!=="area")  
           throw new Error(`closestArea is not of type Area. ${JSON.stringify(closestArea)}. moveToClosestArea.`);    

  
        let idx : number = fromArea.attachedProjectsIds.findIndex( (id:string) => id===selectedProject._id );
        
        if(idx===-1){
           throw new Error(`
              selectedProject is not attached to fromArea.
              ${JSON.stringify(selectedProject)} 
              ${JSON.stringify(fromArea)}
           `);  
        } 
 
        fromArea.attachedProjectsIds = remove(idx, 1, fromArea.attachedProjectsIds); 
        closestArea.attachedProjectsIds = [selectedProject._id,...closestArea.attachedProjectsIds];

        this.props.dispatch({type:"updateAreas", load:[fromArea,closestArea]});  
    }
  

    onSortEnd = ({oldIndex, newIndex, collection}, e) : void => { 

        if(oldIndex===newIndex)
           return; 

        if(this.props.areas.length===0)
           return; 

        if(this.props.projects.length===0)
           return;   

        let {table,detached} = this.groupProjectsByArea(this.props);
        let layout = this.generateLayout(this.props,{table,detached});    

        let selectedProject : Project = {...layout[oldIndex] as Project}; 
        let fromArea : Area = this.props.areas.find((a:Area) => a.attachedProjectsIds.indexOf(selectedProject._id)!==-1);
        let listAfter = arrayMove([...layout], oldIndex, newIndex);
        let closestArea : Area = this.findClosestArea(newIndex, listAfter);
        let detachedBefore = this.isDetached(oldIndex, layout);
        let detachedAfter = this.isDetached(newIndex, listAfter);
         
        if(detachedBefore && !detachedAfter){

            attachToArea(this.props.dispatch, closestArea, selectedProject);
        }else if(!detachedBefore && detachedAfter){

            removeFromArea(this.props.dispatch, fromArea, selectedProject); 
        }else if(detachedBefore && detachedAfter){
 
            changeProjectsOrder(this.props.dispatch,listAfter); 
        }else if(!detachedBefore && !detachedAfter){
 
            if(fromArea._id!==closestArea._id){

                this.moveToClosestArea(fromArea, closestArea, selectedProject);  
            }else if(fromArea._id===closestArea._id){

                changeProjectsOrder(this.props.dispatch,listAfter);
            }
        } 
    } 
   
 
      
    render(){ 
        let {table,detached} = this.groupProjectsByArea(this.props);
        let layout = this.generateLayout(this.props,{table,detached}); 
        let container = document.getElementById("areas");

   
        return  <div  
            style={{
                display:"flex",
                flexDirection:"column",
                position:"relative" 
            }} 
        >   
            <SortableList 
                getElement={this.getElement}
                items={layout}    
                container={container} 
                shouldCancelStart={this.shouldCancelStart}
                shouldCancelAnimation={() => false}
   
                onSortEnd={this.onSortEnd} 
                onSortMove = {(e, helper : HTMLElement) => {} }
                onSortStart={({node, index, collection}, e, helper) => {}}
    
                lockToContainerEdges={true}
                distance={5}   
                useDragHandle={false} 
                lock={true}
            /> 
         </div>
    }
}









interface AreaElementProps{
    area:Area,
    index:number,
    selectArea:Function,
    selectedAreaId:string,
    selectedCategory:Category
} 

interface AreaElementState{
    highlight:boolean
}

 

class AreaElement extends Component<AreaElementProps,AreaElementState>{

    constructor(props){
        super(props);
        this.state={
            highlight:false
        }; 
    }  

 
    render(){      
           
        let selected = this.props.area._id===this.props.selectedAreaId && this.props.selectedCategory==="area";
                  
        return <li 
            className={"area"} 
            key={this.props.index} 
            onMouseOver={(e) => {
                if(e.buttons == 1 || e.buttons == 3){
                    this.setState({highlight:true}); 
                } 
            }} 
            onMouseOut={(e) => { 
                this.setState({highlight:false});
            }}  
        >   
            <div style={{outline:"none",width:"100%",height:"20px"}}></div>  
            <div     
                onClick = {(e) => this.props.selectArea(this.props.area)}
                id = {this.props.area._id} 
                className={selected ? "" : "leftpanelmenuitem"}  
                style={{  
                    borderRadius: this.state.highlight || selected ? "5px" : "0px", 
                    backgroundColor: this.state.highlight ? "rgba(0,200,0,0.3)" :
                                     selected ? "rgba(228,230,233,1)" : 
                                     "",  
                    height:"25px",
                    width:"95%",
                    display:"flex",  
                    alignItems: "center" 
                }}
            >      
                <IconButton  
                    style={{
                        width:"26px", height:"26px", padding: "0px",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}    
                    iconStyle={{ color:"rgba(109,109,109,0.7)", width:"26px", height:"26px" }}  
                >   
                    <NewAreaIcon /> 
                </IconButton> 
                
                <div style={{
                    fontFamily: "sans-serif",
                    fontSize: "15px",    
                    cursor: "default",
                    paddingLeft: "5px", 
                    WebkitUserSelect: "none",
                    fontWeight: "bolder", 
                    color: "rgba(0, 0, 0, 0.8)" 
                }}>    
                    {
                        this.props.area.name.length===0 ? 
                        "New Area" : stringToLength(this.props.area.name,20) 
                    }   
                </div>  
            </div>
        </li>
    }
}




interface ProjectElementProps{
    project:Project,
    index:number,
    selectProject:Function,
    selectedProjectId:string,
    selectedCategory:Category
}

interface ProjectElementState{
    highlight:boolean
}
 
class ProjectElement extends Component<ProjectElementProps,ProjectElementState>{

    constructor(props){
        super(props);
        this.state={
            highlight:false
        }; 
    }  

    

    render(){
        let days = !isNil(this.props.project.deadline) ? dateDiffInDays(this.props.project.created,this.props.project.deadline) : 0;      
        let remaining = !isNil(this.props.project.deadline) ? daysRemaining(this.props.project.deadline) : 0;  
        let selected = this.props.project._id===this.props.selectedProjectId && this.props.selectedCategory==="project";


        return <li
            key={this.props.index}
            onMouseOver={(e) => {
                if(e.buttons == 1 || e.buttons == 3){ 
                    this.setState({highlight:true}); 
                } 
            }} 
            onMouseOut={(e) => { 
                this.setState({highlight:false});
            }}  
        >    
            <div  
                onClick = {(e) => this.props.selectProject(this.props.project)} 
                id = {this.props.project._id}
                className={selected ? "" : "leftpanelmenuitem"} 
                style={{     
                    borderRadius: this.state.highlight || selected ? "5px" : "0px", 
                    backgroundColor: this.state.highlight ? "rgba(0,200,0,0.3)" :
                                     selected ? "rgba(228,230,233,1)" : 
                                     "",  
                    height:"25px",  
                    paddingLeft:"4px", 
                    width:"95%",
                    display:"flex",
                    alignItems:"center" 
                }} 
            >     
                    <div style={{    
                        width: "18px",
                        height: "18px",
                        position: "relative",
                        borderRadius: "100px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "1px solid rgb(170, 170, 170)",
                        boxSizing: "border-box" 
                    }}> 
                        <div style={{
                            width: "18px",
                            height: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative" 
                        }}>  
                            <PieChart 
                                animate={false}    
                                totalValue={days}
                                data={[{    
                                    value:this.props.project.completed ? days : (days-remaining), 
                                    key:1,  
                                    color:"rgba(159, 159, 159, 1)" 
                                }]}    
                                style={{ 
                                    color:"rgba(159, 159, 159, 1)",
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
                        id = {this.props.project._id}   
                        style={{  
                            paddingLeft:"5px",
                            fontFamily: "sans-serif",
                            fontSize:"15px",  
                            whiteSpace: "nowrap",
                            cursor: "default",
                            WebkitUserSelect: "none" 
                        }}
                    >   
                        { 
                            this.props.project.name.length==0 ? 
                            "New Project" : stringToLength(this.props.project.name,15) 
                        } 
                    </div>   
            </div>
        </li> 
    }
}





