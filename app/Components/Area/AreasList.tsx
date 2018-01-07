import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import SortableContainer from '../../sortable-hoc/sortableContainer';
import SortableElement from '../../sortable-hoc/sortableElement';
import SortableHandle from '../../sortable-hoc/sortableHandle';
import { arrayMove } from '../../sortable-hoc/utils';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import IconButton from 'material-ui/IconButton'; 
import { Project, Area } from '../../database';
import NewAreaIcon from 'material-ui/svg-icons/maps/layers';
import { stringToLength, byNotCompleted, byNotDeleted, daysRemaining, dateDiffInDays, assert, isArrayOfStrings, isArrayOfProjects, isArea, isProject } from '../../utils';
import { SortableList } from '../SortableList';
import PieChart from 'react-minimal-pie-chart';
import { uniq, allPass, remove, toPairs, intersection, isEmpty, contains, assoc, isNil, not, all } from 'ramda';
import { Category } from '../MainContainer';
import { isDev } from '../../app';


export let changeProjectsOrder = (dispatch:Function, listAfter:(Project | Area | Separator)[]) : void => {
    let projects = listAfter.filter( i => i.type==="project" ) as Project[];
    projects = projects.map((item:Project,index:number) => assoc("priority",index,item));

    assert(isArrayOfProjects(projects), `projects is not an array os projects ${JSON.stringify(projects)}`);
        
    dispatch({type:"updateProjects", load:projects});  
}



export let attachToArea = (dispatch:Function, closestArea:Area, selectedProject:Project) : void => {
     
    if(isDev()){
        assert(not(isNil(closestArea)),`closestArea undefined. attachToArea.`);
        assert(closestArea.type==="area",`closestArea is not of type Area. ${JSON.stringify(closestArea)}. attachToArea.`);
        assert(
            isArrayOfStrings(closestArea.attachedProjectsIds), 
            `closestArea.attachedProjectsIds is not array of strings ${closestArea.attachedProjectsIds}`
        );  
    }

    closestArea.attachedProjectsIds = [selectedProject._id,...closestArea.attachedProjectsIds];
    dispatch({type:"updateArea", load:closestArea});  
}  
     
     

export let removeFromArea = (dispatch:Function, fromArea:Area, selectedProject:Project) : void => {

    let idx = fromArea.attachedProjectsIds.findIndex((id:string) => id===selectedProject._id);  

    assert(
      idx!==-1,
      `selectedProject is not attached to fromArea. ${JSON.stringify(selectedProject)} ${JSON.stringify(fromArea)}`
    );

    assert( 
      selectedProject.type==="project",
      `selectedProject is not of type project.  ${JSON.stringify(selectedProject)}. removeFromArea.`
    );
       
    assert( 
      fromArea.type==="area",
      `fromArea is not of type Area. ${JSON.stringify(fromArea)}. removeFromArea.`
    );
     
    fromArea.attachedProjectsIds = remove(idx, 1, fromArea.attachedProjectsIds); 
    dispatch({type:"updateArea", load:fromArea});  
}



export let findClosestArea = (index:number, layout:any[]) : Area => {
    if(isEmpty(layout) || isNil(layout)){
       return null; 
    } 

    for(let i=index; i>=0; i--){
        if(layout[i]){
            if(layout[i].type==="area"){
               return {...layout[i]};
            }
        } 
    }     
            
    return null;
}   


export let isDetached = (index:number, layout:any[]) : boolean => {
    if(isEmpty(layout) || isNil(layout)){
       return false; 
    }  
 
    for(let i=index; i>=0; i--){
        if(layout[i]){
            if(layout[i].type==="separator"){
               return true;     
            } 
        }
    } 
           
    return false;
}

 

interface AreasListProps{   
    dispatch:Function,
    leftPanelWidth:number, 
    dragged:string, 
    selectedProjectId:string,
    selectedAreaId:string, 
    selectedCategory:Category, 
    areas:Area[],
    leftPanelRef:HTMLElement, 
    projects:Project[]    
}  

interface AreasListState{
    layout : (Project | Area | Separator)[]   
} 

interface Separator{ type:string }; 
 
type LayoutItem = Project | Area | Separator;  

export class AreasList extends Component<AreasListProps,AreasListState>{


    constructor(props){
        super(props); 
        this.state = {layout : []};  
    } 


    init = (props:AreasListProps) => {
        let {table,detached} = this.groupProjectsByArea(props);

        if(isDev()){

            assert(
               isArrayOfProjects(detached), 
               `detached is not an array of projects. AreasList. ${JSON.stringify(detached)}.`
            );   

            assert(
               all((a:Area) => isArrayOfProjects(table[a._id]), props.areas.filter(byNotDeleted)), 
               `Not all table cells are arrays of projects. AreasList. ${JSON.stringify(table)}`
            );
        } 
 
        let layout = this.generateLayout(props,{table,detached}); 

        this.setState({layout});  
    }   
  
    componentDidMount(){   
        this.init(this.props);
    } 

    componentWillReceiveProps(nextProps:AreasListProps){
        this.init(nextProps);  
    }
 
    
    groupProjectsByArea = (props:AreasListProps) : {
        table : { [key: string]: Project[]; }, 
        detached:Project[]  
    } => {
        let projects : Project[] = props.projects.filter( allPass([byNotDeleted,byNotCompleted]) );
        let areas : Area[] = props.areas.filter( byNotDeleted );
        let table = {};
        let detached : Project[] = [];

        for(let i=0; i<areas.length; i++){
            table[areas[i]._id] = [];
        } 
         
        for(let i=0; i<projects.length; i++){
            let projectId = projects[i]._id;
            let haveArea = false;

            for(let j=0; j<areas.length; j++){
                  
                let attachedProjectsIds : string[] = areas[j].attachedProjectsIds;
  
                if(contains(projectId,attachedProjectsIds)){
                   let key = areas[j]._id;
                   table[key].push(projects[i]);
                   haveArea = true;
                   break; 
                }
            }

            if(!haveArea){
               detached.push(projects[i])
            }
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
            leftPanelRef={this.props.leftPanelRef}
            dragged={this.props.dragged}
            selectArea={this.selectArea}
            leftPanelWidth={this.props.leftPanelWidth}
            selectedAreaId={this.props.selectedAreaId}
            selectedCategory={this.props.selectedCategory}
        />
    }
 

    getProjectElement = (p:Project, index:number) : JSX.Element => {
        return <ProjectElement 
            project={p}
            index={index}
            leftPanelRef={this.props.leftPanelRef}
            dragged={this.props.dragged}  
            selectProject={this.selectProject}
            leftPanelWidth={this.props.leftPanelWidth}
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

            if(nodes[i].id==="separator"){
                return true;
            }else if(nodes[i].className==="area"){
                return true; 
            }
        } 
  
        return false; 
    } 
    


    moveToClosestArea = (fromArea:Area, closestArea:Area, selectedProject:Project) : void => {

        let idx : number = fromArea.attachedProjectsIds.findIndex( (id:string) => id===selectedProject._id );
        
        if(isDev()){ 

            assert(isArea(fromArea),`fromArea is not of type Area. ${JSON.stringify(fromArea)}. moveToClosestArea.`);
            assert(isArea(closestArea),`closestArea is not of type Area. ${JSON.stringify(closestArea)}. moveToClosestArea.`);
            assert(isProject(selectedProject),`selectedProject is not of type Project. ${JSON.stringify(selectedProject)}. moveToClosestArea.`);
        
            assert(
                idx!==-1,
                `selectedProject is not attached to fromArea. 
                ${JSON.stringify(selectedProject)}. 
                ${JSON.stringify(fromArea)}.`
            ) 

            assert(
                isArrayOfStrings(fromArea.attachedProjectsIds), 
                `fromArea.attachedProjectsIds is not an array of strings. ${JSON.stringify(fromArea.attachedProjectsIds)}`
            )

            assert( 
                isArrayOfStrings(closestArea.attachedProjectsIds),
                `closestArea.attachedProjectsIds is not an array of strings. ${JSON.stringify(closestArea.attachedProjectsIds)}`
            )
        }
        
 
        fromArea.attachedProjectsIds = remove(idx, 1, fromArea.attachedProjectsIds); 
        closestArea.attachedProjectsIds = [selectedProject._id,...closestArea.attachedProjectsIds];

        this.props.dispatch({type:"updateAreas", load:[fromArea,closestArea]});  
    }
  
 

    onSortStart = ({node, index, collection}, e, helper) => {}

    onSortMove = (e, helper : HTMLElement) => {} 

    onSortEnd = ({oldIndex, newIndex, collection}, e) : void => {  
        if(oldIndex===newIndex || isEmpty(this.state.layout))
           return;  

        let selectedProject : Project = {...this.state.layout[oldIndex] as Project}; 
        let fromArea : Area = this.props.areas.find((a:Area) => contains(selectedProject._id)(a.attachedProjectsIds));
        let listAfter = arrayMove([...this.state.layout], oldIndex, newIndex);
        let closestArea : Area = findClosestArea(newIndex, listAfter); 
        let detachedBefore = isDetached(oldIndex, this.state.layout);
        let detachedAfter = isDetached(newIndex, listAfter);

        if(detachedBefore && !detachedAfter){ 

            attachToArea(this.props.dispatch, closestArea, selectedProject);
        }else if(!detachedBefore && detachedAfter){

            removeFromArea(this.props.dispatch, fromArea, selectedProject); 
        }else if(!detachedBefore && !detachedAfter && fromArea._id!==closestArea._id){

            this.moveToClosestArea(fromArea, closestArea, selectedProject);
        }  
        
        changeProjectsOrder(this.props.dispatch,listAfter);
    } 
       
      
    render(){ 
        let container = document.getElementById("areas");

        return  <div  
            style={{
                display:"flex",
                flexDirection:"column",
                WebkitUserSelect:"none",
                position:"relative" 
            }} 
        >   
            <SortableList 
                getElement={this.getElement}
                items={this.state.layout}    
                container={container} 
                shouldCancelStart={this.shouldCancelStart}
                shouldCancelAnimation={() => false}
    
                onSortEnd={this.onSortEnd} 
                onSortMove = {this.onSortMove}
                onSortStart={this.onSortStart}
    
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
    dragged:string, 
    leftPanelWidth:number, 
    index:number,
    leftPanelRef:HTMLElement,
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
        let fontSize = 15; 
        let stringLength = 25;

        if(this.props.leftPanelRef){
           let box = this.props.leftPanelRef.getBoundingClientRect();
           stringLength = Math.round(box.width/10); 
        }  
        
        return <li 
            style={{WebkitUserSelect:"none"}} 
            className={"area"}  
            key={this.props.index} 
            onMouseOver={(e) => {
                if(e.buttons == 1 || e.buttons == 3){
                    if(
                       this.props.dragged==="project" ||
                       this.props.dragged==="todo"
                    ){   
                      this.setState({highlight:true}); 
                    } 
                } 
            }} 
            onMouseOut={(e) => {  
                if(this.state.highlight){
                   this.setState({highlight:false});
                }
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
                    fontSize: `${fontSize}px`,    
                    cursor: "default",
                    paddingLeft: "5px", 
                    WebkitUserSelect: "none",
                    fontWeight: "bolder", 
                    color: "rgba(0, 0, 0, 0.8)" 
                }}>    
                    {
                       this.props.area.name.length===0 ? 
                       "New Area" : stringToLength(this.props.area.name,stringLength) 
                    }   
                </div>  
            </div>
        </li>
    }
}




interface ProjectElementProps{
    project:Project,
    index:number,
    leftPanelRef:HTMLElement,
    leftPanelWidth:number,
    dragged:string,
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
        
        let stringLength = 25;
        let fontSize = 15; 

        if(this.props.leftPanelRef){ 
           let box = this.props.leftPanelRef.getBoundingClientRect();
           stringLength = Math.round(box.width/10); 
        } 

        return <li
            style={{WebkitUserSelect:"none"}}  
            key={this.props.index}
            onMouseOver={(e) => { 
                if(e.buttons === 1 || e.buttons === 3){ 
                    if(this.props.dragged==="todo"){
                       this.setState({highlight:true});  
                    }  
                }  
            }} 
            onMouseOut={(e) => { 
                if(this.state.highlight){
                   this.setState({highlight:false});
                }
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
                            fontSize:`${fontSize}px`,  
                            whiteSpace: "nowrap",
                            cursor: "default",
                            WebkitUserSelect: "none" 
                        }}
                    >   
                        { 
                            this.props.project.name.length==0 ? 
                            "New Project" : stringToLength(this.props.project.name,stringLength) 
                        } 
                    </div>    
            </div>
        </li> 
    }
}





