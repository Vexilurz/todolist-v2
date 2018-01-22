import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import SortableElement from '../../sortable-hoc/sortableElement';
import SortableHandle from '../../sortable-hoc/sortableHandle';
import { arrayMove } from '../../sortable-hoc/utils';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import IconButton from 'material-ui/IconButton'; 
import { Project, Area, Todo } from '../../database';
import NewAreaIcon from 'material-ui/svg-icons/maps/layers';
import { stringToLength, byNotCompleted, byNotDeleted, daysRemaining, dateDiffInDays, assert, isArrayOfStrings, isArrayOfProjects, isArea, isProject } from '../../utils';
import { SortableList } from '../SortableList';
import PieChart from 'react-minimal-pie-chart';
import { uniq, allPass, remove, toPairs, intersection, isEmpty, contains, assoc, isNil, not, all, merge } from 'ramda';
import { Category } from '../MainContainer';
import { isDev } from '../../app';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import ResizeObserver from 'resize-observer-polyfill';
import { AutoresizableText } from '../AutoresizableText';
import { getProgressStatus } from '../Project/ProjectLink';
import { SortableContainer } from '../../sortable/CustomSortableContainer';




export let changeProjectsOrder = (dispatch:Function, listAfter:(Project | Area | Separator)[]) : void => {

    let projects = listAfter
                    .filter( i => i.type==="project" )
                    .map((item:Project,index:number) => assoc("priority",index,item));

    assert(isArrayOfProjects(projects), `projects is not an array os projects ${JSON.stringify(projects)}`);
        
    dispatch({type:"updateProjects", load:projects});  
}



export let attachToArea = (dispatch:Function, closestArea:Area, selectedProject:Project) : void => {
     
    assert(not(isNil(closestArea)),`closestArea undefined. attachToArea.`);
    assert(closestArea.type==="area",`closestArea is not of type Area. ${JSON.stringify(closestArea)}. attachToArea.`);
    assert(isArrayOfStrings(closestArea.attachedProjectsIds),`closestArea.attachedProjectsIds is not array of strings ${closestArea.attachedProjectsIds}`);  
    
    closestArea.attachedProjectsIds = [selectedProject._id,...closestArea.attachedProjectsIds];
    dispatch({type:"updateArea", load:closestArea});  
}  
     
     

export let removeFromArea = (dispatch:Function, fromArea:Area, selectedProject:Project) : void => {

    let idx = fromArea.attachedProjectsIds.findIndex((id:string) => id===selectedProject._id);  

    assert(idx!==-1,`selectedProject is not attached to fromArea. ${JSON.stringify(selectedProject)} ${JSON.stringify(fromArea)}`);
    assert(selectedProject.type==="project",`selectedProject is not of type project.  ${JSON.stringify(selectedProject)}. removeFromArea.`);
    assert(fromArea.type==="area",`fromArea is not of type Area. ${JSON.stringify(fromArea)}. removeFromArea.`);
     
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
    todos:Todo[], 
    dragged:string, 
    selectedProjectId:string,
    selectedAreaId:string, 
    selectedCategory:Category, 
    areas:Area[],
    leftPanelRef:HTMLElement, 
    projects:Project[]    
}  

interface AreasListState{} 

interface Separator{ type:string, _id:string }; 
 
type LayoutItem = Project | Area | Separator;  

export class AreasList extends Component<AreasListProps,AreasListState>{

    constructor(props){
        super(props);  
    } 

    shouldComponentUpdate(nextProps:AreasListProps){

        let {
            leftPanelWidth,
            dragged,
            selectedProjectId,
            selectedAreaId,
            selectedCategory,
            areas,
            todos,
            leftPanelRef,
            projects
        } = this.props; 

        if( 
            dragged!==nextProps.dragged ||
            todos!==nextProps.todos ||
            selectedProjectId!==nextProps.selectedProjectId ||
            selectedAreaId!==nextProps.selectedAreaId ||
            selectedCategory!==nextProps.selectedCategory ||
            areas!==nextProps.areas ||  
            projects!==nextProps.projects 
        ){
            return true;
        }  

        return false;  
    }

    selectArea = (a:Area) => {
        this.props.dispatch({type:"selectedAreaId",load:a._id}); 
        this.props.dispatch({type:"selectedCategory",load:"area"}); 
    }
 

    selectProject = (p:Project) => {
        this.props.dispatch({type:"selectedProjectId",load:p._id});
        this.props.dispatch({type:"selectedCategory",load:"project"}); 
    }


    groupProjectsByArea = () : {
        table : { [key: string]: Project[]; }, 
        detached:Project[]  
    } => {
        let projects : Project[] = this.props.projects.filter( allPass([byNotDeleted,byNotCompleted]) );
        let areas : Area[] = this.props.areas.filter( byNotDeleted );
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
        { table, detached } : { table : { [key: string]: Project[]; }, detached:Project[] } 
    ) : LayoutItem[] => { 

        let areas : Area[] = this.props
                                 .areas
                                 .filter(byNotDeleted)
                                 .sort((a:Area,b:Area) => a.priority-b.priority);
                             
        let layout : LayoutItem[] = [];

        for(let i = 0; i<areas.length; i++){
            let key : string = areas[i]._id;  

            let attachedProjects : Project[] = table[key].sort((a:Project,b:Project) => a.priority-b.priority);

            layout.push(areas[i]);
             
            for(let j=0; j<attachedProjects.length; j++)
                layout.push(attachedProjects[j]);
        }

        layout.push({type:"separator", _id:"separator"});
         
        detached.sort((a:Project, b:Project) => a.priority-b.priority);

        for(let i=0; i<detached.length; i++)
            layout.push(detached[i]);
 
        return layout; 
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
            dragged={this.props.dragged}  
            selectProject={this.selectProject}
            todos={this.props.todos} 
            selectedProjectId={this.props.selectedProjectId}
            selectedCategory={this.props.selectedCategory}
        />
    }
     

    getElement = (value : LayoutItem, index : number) : JSX.Element => { 

        switch(value.type){
            case "area":
                return <div key={`key-${value._id}`} id={value._id}>{this.getAreaElement(value as any,index)}</div>;
            case "project":
                return <div key={`key-${value._id}`} id={value._id}>{this.getProjectElement(value as any,index)}</div>;
            case "separator":
                return <div key={`key-${value._id}`} id={value._id} style={{outline: "none", width:"100%",height:"30px"}}></div>;
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

        let idx : number = fromArea.attachedProjectsIds.findIndex((id:string) => id===selectedProject._id);
        
        if(isDev()){ 
           assert(isArea(fromArea),`fromArea is not of type Area.${JSON.stringify(fromArea)}. moveToClosestArea.`);
           assert(isArea(closestArea),`closestArea is not of type Area. ${JSON.stringify(closestArea)}. moveToClosestArea.`);
           assert(isProject(selectedProject),`selectedProject is not of type Project. ${JSON.stringify(selectedProject)}. moveToClosestArea.`);
           assert(idx!==-1,`selectedProject is not attached to fromArea.${JSON.stringify(selectedProject)}.${JSON.stringify(fromArea)}.`); 
           assert(isArrayOfStrings(fromArea.attachedProjectsIds),`fromArea.attachedProjectsIds is not an array of strings. ${JSON.stringify(fromArea.attachedProjectsIds)}`);
           assert(isArrayOfStrings(closestArea.attachedProjectsIds),`closestArea.attachedProjectsIds is not an array of strings.${JSON.stringify(closestArea.attachedProjectsIds)}`);
        }
        
        fromArea.attachedProjectsIds = remove(idx, 1, fromArea.attachedProjectsIds); 
        closestArea.attachedProjectsIds = [selectedProject._id,...closestArea.attachedProjectsIds];
        this.props.dispatch({type:"updateAreas", load:[fromArea,closestArea]});  
    }
 

    selectElements = (index:number,items:any[]) => [index];
 
    
    onSortMove = (oldIndex:number, event) : void => {} 


    onSortStart = (oldIndex:number, event:any) : void => {}


    onSortEnd = (oldIndex:number, newIndex:number, event) : void => {

        let {table,detached} = this.groupProjectsByArea();
        let layout = this.generateLayout({table,detached}); 

        if(isEmpty(layout)){ return }

        let selectedProject : Project = {...layout[oldIndex] as Project}; 
        let fromArea : Area = this.props.areas.find((a:Area) => contains(selectedProject._id)(a.attachedProjectsIds));
        let listAfter = arrayMove([...layout], oldIndex, newIndex);
        let closestArea : Area = findClosestArea(newIndex, listAfter); 
        let detachedBefore = isDetached(oldIndex, layout);
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
        let scrollableContainer = document.getElementById("leftpanel");
        let {table,detached} = this.groupProjectsByArea();
        let layout = this.generateLayout({table,detached}); 

        return  <div  
            id="areas"
            style={{  
              userSelect:"none",
              paddingRight:"15px",
              paddingLeft:"15px",
              paddingBottom:"80px"  
            }}   
        >     
            <SortableContainer
                items={layout}
                scrollableContainer={scrollableContainer}
                selectElements={this.selectElements}   
                onSortStart={this.onSortStart} 
                onSortMove={this.onSortMove}
                onSortEnd={this.onSortEnd}
                shouldCancelStart={(event:any,item:any) => this.shouldCancelStart(event)}  
                decorators={[]}   
                lock={true}
                hidePlaceholder={true}
            >   
                {layout.map((item,index) => this.getElement(item,index))}
            </SortableContainer> 
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
    ref:HTMLElement;

    constructor(props){
        super(props);
        this.state={highlight:false}; 
    }  

    onMouseOver = (e) => {
        let {dragged} = this.props;
  
        if(e.buttons == 1 || e.buttons == 3){
            if(dragged==="project" || dragged==="todo" || dragged==="heading"){  
                this.setState({highlight:true}); 
            } 
        } 
    }  

    onMouseOut = (e) => {  
        if(this.state.highlight){
           this.setState({highlight:false});
        } 
    } 
    
    render(){      
        let {area, selectedAreaId, selectedCategory, index, dragged} = this.props;   
        let selected = area._id===selectedAreaId && selectedCategory==="area";
        
        return <li  
            ref={e => {this.ref=e;}} 
            style={{WebkitUserSelect:"none",width:"100%"}} 
            className={"area"}  
            key={index} 
            onMouseOver={this.onMouseOver} 
            onMouseOut={this.onMouseOut} 
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
                    display:"flex",  
                    alignItems: "center" 
                }}
            >      
                <IconButton  
                    style={{ 
                        width:"26px", 
                        height:"26px", 
                        padding:"0px",
                        display:"flex", 
                        alignItems:"center", 
                        justifyContent:"center"
                    }}    
                    iconStyle={{ 
                        color:"rgba(109,109,109,0.7)", 
                        width:"26px", 
                        height:"26px" 
                    }}   
                >      
                    <NewAreaIcon /> 
                </IconButton> 
                
                <div style={{
                    width:"100%",
                    fontFamily: "sans-serif",
                    fontSize: `15px`,    
                    cursor: "default", 
                    paddingLeft: "5px", 
                    WebkitUserSelect: "none",
                    fontWeight: "bolder", 
                    color: "rgba(0, 0, 0, 0.8)" 
                }}>  
                    <AutoresizableText
                        text={area.name}
                        placeholder="New Area"
                        fontSize={15}
                        offset={45}
                        style={{}}
                        placeholderStyle={{}}
                    />
                </div>  
            </div> 
        </li>
    }
}
 
 




interface ProjectElementProps{
    project:Project,
    todos:Todo[],
    index:number,
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


    onMouseOver = (e) => {  
        let {dragged} = this.props; 
        if(e.buttons === 1 || e.buttons === 3){   
            if(dragged==="todo" || dragged==="heading"){
               this.setState({highlight:true});  
            }  
        }  
    } 


    onMouseOut = (e) => { 
        if(this.state.highlight){
           this.setState({highlight:false});
        }
    } 
     

    render(){
        let {project, selectedProjectId, selectedCategory, todos} = this.props;
        let selected = project._id===selectedProjectId && selectedCategory==="project";
        let {done, left} = getProgressStatus(project,todos);
          
        return <li  
            style={{WebkitUserSelect:"none",width:"100%"}}  
            key={this.props.index}
            onMouseOver={this.onMouseOver} 
            onMouseOut={this.onMouseOut}   
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
                                totalValue={done+left}
                                data={[{     
                                    value:done,  
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
                            width:"100%",
                            paddingLeft:"5px",
                            fontFamily: "sans-serif",
                            fontSize:`15px`,  
                            whiteSpace: "nowrap",
                            cursor: "default",
                            WebkitUserSelect: "none" 
                        }}
                    >    
                        <AutoresizableText
                            text={project.name}
                            placeholder="New Project"
                            fontSize={15}
                            style={{}}
                            offset={45} 
                            placeholderStyle={{}}
                        />
                    </div>    
            </div>
        </li>  
    }
}

 






