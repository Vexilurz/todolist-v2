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
import { stringToLength, remove, insert, unique, replace, swap, byNotCompleted, byNotDeleted, allPass, diffDays, daysRemaining } from '../../utils';
import { SortableList } from '../SortableList';
import PieChart from 'react-minimal-pie-chart';


interface AreasListProps{  
    dispatch:Function,
    areas:Area[],
    projects:Project[]    
}  


interface AreasListState{
    layout : LayoutItem[]  
}  


interface Separator{ type:string };

type LayoutItem = Project | Area | Separator;  

export class AreasList extends Component<AreasListProps,AreasListState>{

    constructor(props){
        
        super(props); 

        this.state = { layout : [] }; 
 
    }

       

    shouldComponentUpdate(nextProps:AreasListProps, nextState:AreasListState){ 

        let should = false;

        if(this.props.areas!==nextProps.areas) 
           should = true;

        if(this.props.projects!==nextProps.projects)
           should = true;    

        if(this.state.layout!==nextState.layout)   
           should = true;   
           
        return should;
    
    }

    

    componentWillReceiveProps(nextProps:AreasListProps,nextState:AreasListState){

        if(this.props.areas!==nextProps.areas) 
           this.init(nextProps); 

        if(this.props.projects!==nextProps.projects)
           this.init(nextProps); 
            
    } 

  

    componentDidMount(){

        this.init(this.props);

    }
    


    init = (props:AreasListProps) => {

        let group = this.groupProjectsByArea(props);

        let layout = this.generateLayout(props,group); 

        this.setState({layout:layout.filter( v => !!v )}); 

    }



    selectArea = (a:Area) => (e) => {

        this.props.dispatch({type:"selectedAreaId",load:a._id}) 

    }



    selectProject = (p:Project) => (e) => {
        
        this.props.dispatch({ type:"selectedProjectId", load:p._id });

    }
         


    groupProjectsByArea = (props:AreasListProps) => {
 
        let projects = props.projects.filter( p => !p.deleted );
        let areas = props.areas.filter( a => !a.deleted );



        let table : { [key: string]: Project[]; } = {};
        let detached : Project[] = []; 
     
        for(let i=0; i<areas.length; i++)
            table[areas[i]._id] = [];

        let attached;

        let project_id;

        let attachedProjectsIds;

        let key;

        let idx;

        for(let i=0; i<projects.length; i++){
                
            attached = false; 

            project_id = projects[i]._id;

            for(let j=0; j<areas.length; j++){
                  
                attachedProjectsIds = unique(areas[j].attachedProjectsIds);
                idx = attachedProjectsIds.indexOf(project_id);
 
                if(idx !== -1){
                   key = areas[j]._id;
                   table[key][idx] = projects[i];
                   attached = true;  
                }

            }

            if(!attached)
                detached.push(projects[i]);
             
        }  


        for(let i=0; i<areas.length; i++)
            table[areas[i]._id] = table[areas[i]._id].filter( v => !!v ); 
  
        return {table,detached:detached.sort((a,b) => a.priority-b.priority)};

    }
         
    

    generateLayout = (  
        props : AreasListProps, 
        { table, detached } : { table : { [key: string]: Project[]; }, detached:Project[] } 
    ) : LayoutItem[] => { 

        let areas = props.areas.filter( a => !a.deleted ).sort((a:Area,b:Area) => a.priority-b.priority);
            
     
        let layout : LayoutItem[] = [];

        for(let i = 0; i<areas.length; i++){
 
            let key : string = areas[i]._id;  

            let attachedProjects : Project[] = table[key].sort((a:Project,b:Project) => a.priority-b.priority);

            layout.push(areas[i]);
            
            for(let j=0; j<attachedProjects.length; j++)
                layout.push(attachedProjects[j]);

        }

        layout.push({type:"separator"});

        for(let i=0; i<detached.length; i++)
            layout.push(detached[i]);
  
        return layout;
 
    }
 


    getAreaElement = (a : Area, index : number) : JSX.Element => {
        return <li className="area" style={{paddingTop:"40px"}} key={index}> 
            <div     
                onClick = {this.selectArea(a)}
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
                    color: "rgba(100, 100, 100, 1)" 
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

        let days = diffDays(p.created,p.deadline);    
        
        let remaining = daysRemaining(p.deadline);  

        return <li key={index}>  
            <div  
                onClick = {this.selectProject(p)} 
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
                                animate={true}    
                                totalValue={days}
                                data={[{  
                                    value:days-remaining,  
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
                            fontWeight: 600, 
                            color: "rgba(100,100,100,0.7)",
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
 


    shouldCancelAnimation = () => false



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
  

 
    onSortEnd = ({oldIndex, newIndex, collection}, e) : void => { 

        if(this.props.areas.length===0)
           return; 

        if(this.props.projects.length===0)
           return;   

        let selectedProject : Project = {...this.state.layout[oldIndex] as Project}; 
        let fromArea : Area = this.props.areas.find((a:Area) => a.attachedProjectsIds.indexOf(selectedProject._id)!==-1);
        let listAfter = arrayMove([...this.state.layout], oldIndex, newIndex);
        let closestArea : Area = this.findClosestArea(newIndex, listAfter);
        let detachedBefore = this.isDetached(oldIndex, this.state.layout);
        let detachedAfter = this.isDetached(newIndex, listAfter);
     
        if(detachedBefore && !detachedAfter){


            if(!closestArea)
               return;

            closestArea.attachedProjectsIds = [selectedProject._id,...closestArea.attachedProjectsIds];
            this.props.dispatch({type:"updateArea", load:closestArea});  


        }else if(!detachedBefore && detachedAfter){


            let projectIdIndex = fromArea.attachedProjectsIds.findIndex( 
                (id:string) => id===selectedProject._id 
            ); 

            fromArea.attachedProjectsIds = remove(fromArea.attachedProjectsIds, projectIdIndex); 
            this.props.dispatch({type:"updateArea", load:fromArea});  
 

        }else if(detachedBefore && detachedAfter){

 
            let from : any = this.state.layout[oldIndex];
            let to : any = this.state.layout[newIndex];

            if(from.type==="project" && to.type==="project") 
               this.props.dispatch({type:"swapProjects", load:{fromId:from._id,toId:to._id}});


        }else if(!detachedBefore && !detachedAfter){

            if(!fromArea || !closestArea)
               throw new Error(`${fromArea} ${closestArea} undefined.`);  

            if(fromArea._id!==closestArea._id){

                let projectIdIndex = fromArea.attachedProjectsIds.findIndex( (id:string) => id===selectedProject._id );
 
                if(projectIdIndex===-1)
                   throw new Error("fromArea do not contain selectedProject");

                fromArea.attachedProjectsIds = remove(fromArea.attachedProjectsIds, projectIdIndex); 

                let still = fromArea.attachedProjectsIds.findIndex( (id:string) => id===selectedProject._id );

                if(still!==-1)
                   throw new Error("project id still persist after removal"); 

                closestArea.attachedProjectsIds = [selectedProject._id,...closestArea.attachedProjectsIds];
                this.props.dispatch({type:"updateAreas", load:[fromArea,closestArea]});  

            }else if(fromArea._id===closestArea._id){

                let from : any = this.state.layout[oldIndex];
                let to : any = this.state.layout[newIndex];
    
                if(from.type==="project" && to.type==="project") 
                   this.props.dispatch({type:"swapProjects", load:{fromId:from._id,toId:to._id}});
     
 
            }


        }
  
    } 
   

 
    onSortMove = (e, helper : HTMLElement) => {} 
 


    onSortStart = ({node, index, collection}, e, helper) => {}


      
    render(){
        
        let container = document.getElementById("areas");

        return  <div  
            style={{
                display: "flex", flexDirection: "column", 
                padding:"10px", position:"relative"
            }}
        >  
           <SortableList 
                getElement={this.getElement}
                items={this.state.layout}   
                container={container ? container : document.body} 
                shouldCancelStart={this.shouldCancelStart}
                shouldCancelAnimation={this.shouldCancelAnimation}
   
                onSortEnd={this.onSortEnd} 
                onSortMove = {this.onSortMove}
                onSortStart={this.onSortStart}
  
                lockToContainerEdges={true}
                distance={3}   
                useDragHandle={false} 
                lock={true}
            />
            

         </div>

    }


}













