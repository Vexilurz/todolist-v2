import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import SortableContainer from '../../sortable-hoc/sortableContainer';
import SortableElement from '../../sortable-hoc/sortableElement';
import SortableHandle from '../../sortable-hoc/sortableHandle';
import {arrayMove} from '../../sortable-hoc/utils';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import IconButton from 'material-ui/IconButton'; 
import { Project, Area } from '../../database';
import NewAreaIcon from 'material-ui/svg-icons/action/tab';
import { stringToLength, remove, insert, unique, replace, swap } from '../../utils';
import { SortableList } from '../SortableList';
 
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

    

    shouldComponentUpdate(nextProps){

        return true;

    }

 

    componentWillReceiveProps(nextProps:AreasListProps,nextState:AreasListState){

        //if(nextProps.areas!==this.props.areas){

            //this.init(nextProps);

        //}else if(nextProps.projects!==this.props.projects){

            this.init(nextProps); 

        //}else if(this.state.layout!==nextState.layout){

        //}

    } 



    componentDidMount(){

        this.init(this.props);

    }



    init = (props:AreasListProps) => {

        let group = this.groupProjectsByArea(props);

        let layout = this.generateLayout(props,group); 

        this.setState({layout}); 

    }



    selectArea = (a:Area) => (e) => {

        this.props.dispatch({type:"selectedAreaId",load:a._id}) 

    }



    selectProject = (p:Project) => (e) => {
        
        this.props.dispatch({ type:"selectedProjectId", load:p._id });

    }
         


    groupProjectsByArea = (props:AreasListProps) => {
 
        let projects = props.projects;
        let areas = props.areas;
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

        return {table,detached};
    }
         
    

    generateLayout = (  
        props : AreasListProps, 
        { table, detached } : { table : { [key: string]: Project[]; }, detached:Project[] } 
    ) : LayoutItem[] => { 

        let areas = props.areas;

        let layout : LayoutItem[] = [];

        for(let i = 0; i<areas.length; i++){

            let key : string = areas[i]._id;

            let attachedProjects : Project[] = table[key];

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
        return <li className="area" key={index}> 
            <div    
                onClick = {this.selectArea(a)}
                id = {a._id}   
                className="toggleFocus" 
                style={{ 
                    marginLeft:"4px", marginRight:"4px",   
                    width:"95%", display:"flex", alignItems: "center"
                }}
            >      
                <IconButton  
                    style={{
                        width:"28px", height:"28px", padding: "0px",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}    
                    iconStyle={{ color:"rgba(109,109,109,0.4)", width:"18px", height:"18px" }}  
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
        return <li key={index}> 
            <div  
                onClick = {this.selectProject(p)} 
                id = {p._id}       
                className="toggleFocus" 
                style={{  
                    marginLeft:"4px",
                    marginRight:"4px", 
                    paddingLeft:"5px", 
                    height:"20px",
                    width:"95%",
                    display:"flex",
                    alignItems: "center" 
                }}
            >     

                    <IconButton    
                        style={{
                            width:"28px",
                            height:"28px",
                            padding: "0px",
                            display: "flex",
                            alignItems: "center", 
                            justifyContent: "center"
                        }}  
                        iconStyle={{
                            color:"rgba(109,109,109,0.4)",
                            width:"18px",
                            height:"18px"
                        }}  
                    >  
                        <Circle />  
                    </IconButton> 

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
                    }}>   
                        { 
                            p.name.length==0 ? 
                            "New Project" :
                            stringToLength(p.name,15) 
                        } 
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


    isEmpty = () : boolean => {

        if(this.props.areas.length===0)
           return true; 

        if(this.props.projects.length===0)
           return true;   

        return false; 

    }
 

    findClosestArea = (index, layout) => {
        let steps = 0;

        for(let i=index; i>=0; i--)
            if(layout[i].type==="area")
               return {_id:layout[i]._id, steps:steps-1};
            else 
               steps+=1;     
                
        return {steps:0,_id:null}; 
    }  
 


    onSortEnd = ({oldIndex, newIndex, collection}, e) : void => { 

        if(this.isEmpty())
           return;   

        let selectedProject : Project = {...this.state.layout[oldIndex] as Project};   

        let listBefore = [...this.state.layout];
        let listAfter = arrayMove([...this.state.layout], oldIndex, newIndex);

 
        let closestAreaBefore : {_id:string, steps:number} = this.findClosestArea(oldIndex, listBefore);
        let closestAreaAfter : {_id:string, steps:number} = this.findClosestArea(newIndex, listAfter);
          
         
        //console.log(`index before ${closestAreaBefore.steps}`);
        //console.log(`index after ${closestAreaAfter.steps}`);
        

        if(closestAreaBefore._id===closestAreaAfter._id){ 
           //console.log(`area did not changed ${closestAreaBefore} ${closestAreaAfter}`)
           return; 
        }  
 

        let fromIdx = this.props.areas.findIndex( (a:Area) => a._id===closestAreaBefore._id );
        let toIdx = this.props.areas.findIndex( (a:Area) => a._id===closestAreaAfter._id );
 

        let fromArea = {...this.props.areas[fromIdx]};
        let toArea = {...this.props.areas[toIdx]};
 
 
        //console.log(`fromArea name ${fromArea.name}`);
        //console.log(`toArea name ${toArea.name}`);
         

        fromArea.attachedProjectsIds = remove(fromArea.attachedProjectsIds, closestAreaBefore.steps); 
        toArea.attachedProjectsIds = insert(toArea.attachedProjectsIds, selectedProject._id, closestAreaAfter.steps);
 
        let areas = [...this.props.areas];
 
        areas = replace(areas, toArea, toIdx);
        areas = replace(areas, fromArea, fromIdx);
 
    } 
  

  






    onSortMove = (e, helper : HTMLElement) => { 


    }
 


    onSortStart = ({node, index, collection}, e, helper) => { 
 

    }


 
     
    render(){
 
        return  <div  
            style={{
                display: "flex", flexDirection: "column", 
                padding:"10px", position:"relative"
            }}
        >  
           <SortableList 
                getElement={this.getElement}
                items={this.state.layout}  

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













