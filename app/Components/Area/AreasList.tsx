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
import { stringToLength, remove, insert } from '../../utils';
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

 

    componentWillReceiveProps(nextProps){

        if(nextProps.areas!==this.props.areas){

            this.init();

        }else if(nextProps.projects!==this.props.projects){

            this.init(); 

        }

    }



    componentDidMount(){

        this.init();

    }



    init = () => {
        let group = this.groupProjectsByArea();
        let layout = this.generateLayout(group); 
        this.setState({layout}); 
    }



    selectArea = (a:Area) => (e) => {

        this.props.dispatch({type:"selectedAreaId",load:a._id}) 

    }



    selectProject = (p:Project) => (e) => {
        
        this.props.dispatch({ type:"selectedProjectId", load:p._id });

    }
         


    groupProjectsByArea = () => {

        let projects = this.props.projects;
        let areas = this.props.areas;
        let table : { [key: string]: Project[]; } = {};
        let detached : Project[] = []; 


        for(let i=0; i<areas.length; i++)
            table[areas[i]._id] = [];
        


        let attached;

        let project_id;

        let attachedProjectsIds;

        let key;


        for(let i=0; i<projects.length; i++){

            attached = false;

            project_id = projects[i]._id;


            for(let j=0; j<areas.length; j++){

                attachedProjectsIds = areas[j].attachedProjectsIds;

                if(attachedProjectsIds.indexOf(project_id) !== -1){

                    key = areas[j]._id;

                    table[key].push(projects[i]);

                    attached = true;

                }

            }

            if(!attached)
                detached.push(projects[i]);
             
        }

        return {table,detached};
    }
         
    

    generateLayout = (  
        { table, detached } : { table : { [key: string]: Project[]; }, detached:Project[] } 
    ) : LayoutItem[] => { 

        let areas = this.props.areas;

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
                        stringToLength(a.name,18) :
                        "New Area"
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
                            p.name.length>0 ? 
                            stringToLength(p.name,15) :
                            "New Project" 
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



    onSortEnd = ({oldIndex, newIndex, collection}, e) => {

        if(this.props.areas.length===0)
           return; 
        if(this.props.projects.length===0)
           return;    

        let layout = this.state.layout;
 
        let item : Project = layout[oldIndex] as Project;
  
        if(item.type!=="project")
           throw new Error(`Target is not a project. onSortEnd. ${item} ${JSON.stringify(layout)} `) 

  
        let fromAreaIndex = null;
        let toAreaIndex = null;
        let toAreaProjectsOffset = 0;
        let offset = 0;


        for(let i=oldIndex-1; i>=0; i--){ 
            if(layout[i].type==="area"){
                fromAreaIndex = i;
                break; 
            } 
        } 


        for(let i=newIndex-1; i>=0; i--){ 
            
            if(layout[i].type==="area"){
                toAreaIndex  = i;
                toAreaProjectsOffset = offset;
                offset = 0;
                break; 
            }else{
                offset+=1;
            }
            
        } 


        if(fromAreaIndex===null)
            throw new Error(`Area does not exist. fromArea. onSortEnd. ${fromAreaIndex} ${JSON.stringify(layout)} `) 
 
        if(toAreaIndex===null)
            throw new Error(`Area does not exist. toArea. onSortEnd. ${toAreaIndex} ${JSON.stringify(layout)} `) 
 

        let fromArea : Area = layout[fromAreaIndex] as Area;
        let toArea : Area = layout[toAreaIndex] as Area;   
  
 
        if(fromArea===undefined)
            throw new Error(`Area does not exist. fromArea. onSortEnd. ${fromArea} ${JSON.stringify(layout)} `); 
  
        if(toArea===undefined)
            throw new Error(`Area does not exist. toArea. onSortEnd. ${toArea} ${JSON.stringify(layout)} `); 


        let fromAreaAttachedProjectsIds : string[] = fromArea.attachedProjectsIds;
        let toAreaAttachedProjectsIds : string[] = toArea.attachedProjectsIds;
        
        

        let removeIndex = fromArea.attachedProjectsIds.indexOf(item._id);
        fromArea.attachedProjectsIds = remove(fromArea.attachedProjectsIds, removeIndex);
 
        let insertIndex = toAreaProjectsOffset; 
        toArea.attachedProjectsIds = insert(toArea.attachedProjectsIds, item._id, insertIndex);          
    


        let updatedAreas = [];



        for(let i=0; i<layout.length; i++)
            if(layout[i].type==="area")
               updatedAreas.push(layout[i]);


            
        this.props.dispatch({type:"areas",load:updatedAreas});

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













