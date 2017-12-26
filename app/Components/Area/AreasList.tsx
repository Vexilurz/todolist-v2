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
import NewAreaIcon from 'material-ui/svg-icons/action/tab';
import { stringToLength, byNotCompleted, byNotDeleted, daysRemaining, dateDiffInDays } from '../../utils';
import { SortableList } from '../SortableList';
import PieChart from 'react-minimal-pie-chart';
import { uniq, allPass, remove } from 'ramda';


interface AreasListProps{   
    dispatch:Function,
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

        for(let i=0; i<projects.length; i++){
                
            let attached = false; 

            let projectId = projects[i]._id;

            for(let j=0; j<areas.length; j++){
                  
                let attachedProjectsIds : string[] = areas[j].attachedProjectsIds;
                let idx : number = attachedProjectsIds.indexOf(projectId);
 
                if(idx !== -1){
                   let key = areas[j]._id;
                   table[key].push(projects[i]);
                   let attached = true;  
                }

            }

            if(!attached)
                detached.push(projects[i]);
             
        }  

        return {table,detached};

    }
         
    

    generateLayout = (  
        props : AreasListProps, 
        { table, detached } : { table : { [key: string]: Project[]; }, detached:Project[] } 
    ) : LayoutItem[] => { 

        let areas : Area[] = props.areas.filter( byNotDeleted ).sort((a:Area,b:Area) => a.priority-b.priority);
        let layout : LayoutItem[] = [];

        for(let i = 0; i<areas.length; i++){
            let key : string = areas[i]._id;  

            let attachedProjects : Project[] = table[key].sort((a:Project,b:Project) => a.priority-b.priority);

            layout.push(areas[i]);
            
            for(let j=0; j<attachedProjects.length; j++)
                layout.push(attachedProjects[j]);
        }

        layout.push({type:"separator"});

        detached.sort((a:Project,b:Project) => a.priority-b.priority);

        for(let i=0; i<detached.length; i++)
            layout.push(detached[i]);
 
        return layout;

    }
 


    shouldComponentUpdate(nextProps:AreasListProps){ 

        let should = false;

        if(this.props.areas!==nextProps.areas)
            should = true;
        if(this.props.projects!==nextProps.projects)
            should = true;
            
        return should;
         
    }



    selectArea = (a:Area) => {

        this.props.dispatch({type:"selectedAreaId",load:a._id}) 

    }



    selectProject = (p:Project) => {
         
        this.props.dispatch({type:"selectedProjectId",load:p._id});

    }
         


    getAreaElement = (a : Area, index : number) : JSX.Element => {
        return <li className="area" style={{paddingTop:"40px"}} key={index}> 
            <div     
                onClick = {(e) => this.selectArea(a)}
                id = {a._id}   
                className="leftpanelmenuitem"  
                style={{  
                    height:"25px",
                    width:"95%",
                    display:"flex", 
                    alignItems: "center" 
                }}
            >      
                <IconButton  
                    style={{
                        width:"18px", height:"18px", padding: "0px",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}    
                    iconStyle={{ color:"rgba(109,109,109,0.7)", width:"18px", height:"18px" }}  
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
                        a.name.length===0 ? 
                        "New Area" : 
                        stringToLength(a.name,18) 
                    }   
                </div>  
            </div>
        </li>
    }
 


    getProjectElement = (p:Project, index:number) : JSX.Element => {

        let days = dateDiffInDays(p.created,p.deadline);    
        
        let remaining = daysRemaining(p.deadline);  
 
        return <li key={index}>  
            <div  
                onClick = {(e) => this.selectProject(p)} 
                id = {p._id}        
                className="leftpanelmenuitem" 
                style={{  
                    height:"25px",
                    width:"95%",
                    display:"flex",
                    alignItems: "center" 
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
                                    value:p.completed ? days : (days-remaining), 
                                    key:1,  
                                    color:"rgba(159, 159, 159, 1)" 
                                }]}    
                                style={{ 
                                    color: "rgba(159, 159, 159, 1)",
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
 
                    <div   
                        id = {p._id}   
                        style={{  
                            paddingLeft:"5px",
                            fontFamily: "sans-serif",
                            fontSize:"15px",  
                            whiteSpace: "nowrap",
                            cursor: "default",
                            WebkitUserSelect: "none" 
                        }}
                    >   
                        { p.name.length==0 ? "New Project" : stringToLength(p.name,15) } 
                    </div>    
 
            </div>
        </li> 
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
  


    attachToArea = (closestArea:Area, selectedProject:Project) : void => {

        if(!closestArea) 
            throw new Error(`closestArea undefined. attachToArea.`);

        if(closestArea.type!=="area")  
           throw new Error(`closestArea is not of type Area. ${closestArea}. attachToArea.`);    

        closestArea.attachedProjectsIds = [selectedProject._id,...closestArea.attachedProjectsIds];
        this.props.dispatch({type:"updateArea", load:closestArea});  
         
    }  



    removeFromArea = (fromArea:Area, selectedProject:Project) : void => {

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

        if(selectedProject.type!=="project")  
            throw new Error(`selectedProject is not of type project. ${selectedProject}. removeFromArea.`);    

        if(fromArea.type!=="area")  
            throw new Error(`fromArea is not of type Area. ${fromArea}. removeFromArea.`);    
 
 
        fromArea.attachedProjectsIds = remove(idx, 1, fromArea.attachedProjectsIds); 
        this.props.dispatch({type:"updateArea", load:fromArea});  

    }



    swapProjects = (layout:LayoutItem[], oldIndex:number, newIndex:number) : void => {

        let from : Project = layout[oldIndex] as Project;
        let to : Project = layout[newIndex] as Project;


        if(from.type!=="project")  
           throw new Error(`from is not of type project. ${from}. swapProjects.`);    

        if(to.type!=="project")   
           throw new Error(`to is not of type project. ${to}. swapProjects.`);    

 
        this.props.dispatch({type:"changeProjectsPriority", load:{fromId:from._id,toId:to._id}});

    }


  
    moveToClosestArea = (fromArea:Area, closestArea:Area, selectedProject:Project) : void => {
 
        if(fromArea.type!=="area")  
           throw new Error(`fromArea is not of type Area. ${fromArea}. moveToClosestArea.`);    

        if(closestArea.type!=="area")  
           throw new Error(`closestArea is not of type Area. ${closestArea}. moveToClosestArea.`);    

  
        let idx : number = fromArea.attachedProjectsIds.findIndex( (id:string) => id===selectedProject._id );
        
        if(idx===-1){
            throw new Error(`
                 selectedProject is not attached to fromArea.
                 ${JSON.stringify(selectedProject)} 
                 ${JSON.stringify(fromArea)}
            `)
        }
 

        fromArea.attachedProjectsIds = remove(idx, 1, fromArea.attachedProjectsIds); 
        closestArea.attachedProjectsIds = [selectedProject._id,...closestArea.attachedProjectsIds];

        this.props.dispatch({type:"updateAreas", load:[fromArea,closestArea]});  

    }
  
      

    onSortEnd = ({oldIndex, newIndex, collection}, e) : void => { 

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

            this.attachToArea(closestArea, selectedProject);

        }else if(!detachedBefore && detachedAfter){

            this.removeFromArea(fromArea, selectedProject); 
 
        }else if(detachedBefore && detachedAfter){

            this.swapProjects(layout, oldIndex, newIndex);

        }else if(!detachedBefore && !detachedAfter){

            if(fromArea._id!==closestArea._id){

                this.moveToClosestArea(fromArea, closestArea, selectedProject);    

            }else if(fromArea._id===closestArea._id){
 
                this.swapProjects(layout, oldIndex, newIndex);
 
            }

        }
  
    } 
   
 
      
    render(){ 
        let {table,detached} = this.groupProjectsByArea(this.props);
        let layout = this.generateLayout(this.props,{table,detached}); 
        let container = document.getElementById("areas");
  
        return  <div  
            style={{
                display: "flex",flexDirection: "column", 
                padding:"10px", position:"relative" 
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













