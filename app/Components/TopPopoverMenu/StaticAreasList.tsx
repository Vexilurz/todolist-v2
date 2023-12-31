import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import { Project, Area, Category } from '../../types';
import NewAreaIcon from 'material-ui/svg-icons/content/content-copy';
import { byNotCompleted, byNotDeleted, typeEquals, isNotEmpty } from '../../utils/utils';
import { PieChart } from 'react-minimal-pie-chart';
import { ExpandableList } from '../../Components/ExpandableList';
import { allPass, isEmpty, compose, cond, defaultTo, when } from 'ramda'; 
import { AutoresizableText } from '../AutoresizableText';
import { isArea, isProject, isArray } from '../../utils/isSomething';
import { groupProjectsByArea } from '../Area/groupProjectsByArea';
import { generateLayout } from '../Area/generateLayout';
import { Separator } from './Separator';
import Checked from 'material-ui/svg-icons/navigation/check';



let wrapSeparator = (element) => <div> <div><Separator/></div> {element} </div>;



let wrapProjects = (elements) => {
    let list = [];
    let chunk = [];

    for(let i = 0; i < elements.length; i++){
        let item = elements[i];
        if(isProject(item)){
           chunk.push(item)
        }else{
            if(isNotEmpty(chunk)){
                list.push([...chunk])
                chunk = [];
            } 
            list.push(item); 
        }
    }

    if(isNotEmpty(chunk)){ 
       list.push([...chunk]) 
    }

    return list;
};



interface StaticAreasListProps{   
    dispatch:Function,
    leftPanelWidth:number, 
    dragged:string, 
    selectedProjectId:string,
    selectedAreaId:string, 
    selectedCategory:Category, 
    areas:Area[],
    indicators : { 
        [key:string]:{
            active:number,
            completed:number,
            deleted:number
        }; 
    },
    projects:Project[],
    id:number     
}  



interface StaticAreasListState{} 



export class StaticAreasList extends Component<StaticAreasListProps,StaticAreasListState>{

    constructor(props){
        super(props);  
    } 


 
    selectArea = (area:Area) : void => {
        
        this.props.dispatch({
            type:"multiple",
            load:[
                {type:"selectedAreaId",load:area._id}, 
                {type:"selectedProjectId",load:null},
                {type:"showMenu",load:false},
                {type:"showProjectMenuPopover",load:false}, 
                {type:"selectedCategory",load:"area"},
                {type:"selectedTags",load:["All"]},
                {type:"searchQuery",load:""}
            ]
        })
    };
 


    selectProject = (p:Project) : void => {

        this.props.dispatch({
            type:"multiple",
            load:[
                {type:"selectedProjectId",load:p._id},
                {type:"selectedAreaId",load:null}, 
                {type:"showMenu",load:false},
                {type:"showProjectMenuPopover",load:false}, 
                {type:"selectedCategory",load:"project"},
                {type:"selectedTags",load:["All"]},
                {type:"searchQuery",load:""}
            ]
        })
    };
    


    getAreaElement = (a:Area, index : number) : JSX.Element => {
        return <AreaElement 
            area={a}
            selectArea={this.selectArea}
            selectedAreaId={this.props.selectedAreaId}
            selectedCategory={this.props.selectedCategory}
        />
    };
 


    getProjectElement = (p:Project, index:number) : JSX.Element => {
        return <ProjectElement 
            indicator={defaultTo({completed:0,active:0})(this.props.indicators[p._id])}
            project={p} 
            selectProject={this.selectProject}
            selectedProjectId={this.props.selectedProjectId}
            selectedCategory={this.props.selectedCategory}
        />
    };
    
    
 
    getElement = (value, index : number, warp? : boolean) : JSX.Element => 
        cond([
            [
                typeEquals("area"),
                (value) => <div key={`key-${value._id}`} id={value._id}>
                { compose( when(() => warp, wrapSeparator), value => this.getAreaElement(value, index) )(value) }
                </div>
            ],
            [
                typeEquals("project"),
                (value) => <div key={`key-${value._id}`} id={value._id}>
                { this.getProjectElement(value, index) }
                </div>
            ],
            [   () => true, () => null  ]
        ])(value); 



    render(){ 
        let {projects,areas} = this.props;
        let {table,detached} = groupProjectsByArea(
            projects.filter(allPass([byNotDeleted,byNotCompleted])), 
            areas.filter(byNotDeleted)
        );
        let layout = generateLayout(this.props.areas,{table,detached}); 

        return <div style={{userSelect:"none",paddingLeft:"5px",paddingRight:"5px"}}>     
            {
                wrapProjects( layout )
                .map( 
                    (item,index) => {
                        if(isArray(item)){
                            return isEmpty(item) ? null :
                            <div key={`list-${index}`} style={{paddingLeft:"8px"}}>
                                <ExpandableList
                                    showAll={false}
                                    minLength={3} 
                                    buttonOffset={0}
                                    type={"projects"}    
                                >
                                    { item.map( (i,idx) => this.getElement(i,idx) ) }
                                </ExpandableList> 
                            </div>
                        }else if(isArea(item)){
                            return this.getElement(item,index, true);
                        }else{
                            return this.getElement(item,index);
                        }
                    }, 
                    []
                )
            }
         </div> 
    }
};



interface AreaElementProps{
    area:Area,
    selectArea:(area:Area) => void,
    selectedAreaId:string,
    selectedCategory:Category
} 



interface AreaElementState{} 



class AreaElement extends Component<AreaElementProps,AreaElementState>{
    ref:HTMLElement;

    constructor(props){
        super(props);
    }  

    render(){      
        let {
            area, 
            selectedAreaId, 
            selectedCategory, 
            selectArea, 
        } = this.props;
        let selected = (area._id===selectedAreaId) && selectedCategory==="area";
 
        return <li   
            ref={e => {this.ref=e;}} 
            style={{WebkitUserSelect:"none",width:"100%"}} 
            className={"area"}  
        >     
            <div     
                onClick={(e) => {
                    e.stopPropagation(); 
                    selectArea(area);
                }}
                id={area._id} 
                className={selected ? "" : "leftpanelmenuitem"}  
                style={{  
                    borderRadius:selected ? "5px" : "0px", 
                    backgroundColor:selected ? "rgba(228,230,233,1)" : "",  
                    height:"20px", 
                    display:"flex",  
                    paddingTop:"3px",
                    paddingBottom:"3px",
                    paddingLeft:"8px",
                    alignItems:"center" 
                }}
            >      
                <div><NewAreaIcon style={{color:"rgba(109, 109, 109, 0.7)", width:"18px", height:"18px"}}/></div> 
                <div style={{ 
                    display:'flex',
                    width:'calc(90% - 18px)',
                    fontFamily:"sans-serif",
                    fontSize:"15px",    
                    cursor:"default", 
                    paddingLeft:"3px", 
                    WebkitUserSelect:"none",
                    fontWeight:"bolder", 
                    color:"rgba(0, 0, 0, 0.8)" 
                }}>  
                    <AutoresizableText
                        text={area.name}
                        placeholder="New Area" 
                        fontSize={15}
                        fontWeight="bolder"
                        style={{}}
                        offset={selected ? 6 : 3}
                        placeholderStyle={{}}
                    />
                    {   
                        this.props.area._id===this.props.selectedAreaId &&
                        selectedCategory==="area" ?
                        <div style={{
                            position:"absolute",
                            right:"10px",
                            height:"15px",
                            width:"15px"
                        }}>
                            <Checked style={{color:"rgb(56, 115, 207)", width:"15px", height:"15px"}}/>
                        </div>
                        :
                        null
                    }   
                </div>  
            </div>  
        </li>
    }
};
 


interface ProjectElementProps{
    project:Project,
    selectProject:Function,
    selectedProjectId:string,
    selectedCategory:Category,
    indicator:{
        active:number,
        completed:number,
        deleted:number
    }
}



interface ProjectElementState{} 


 
class ProjectElement extends Component<ProjectElementProps,ProjectElementState>{
    
    constructor(props){
        super(props);
    }   
    


    render(){
        let {project, selectedProjectId, selectedCategory, indicator} = this.props;
        let selected = (project._id===selectedProjectId) && (selectedCategory==="project");
        let done = indicator.completed;
        let left = indicator.active;
        let totalValue = (done+left)===0 ? 1 : (done+left);
        let currentValue = done;
        
        return <li style={{WebkitUserSelect:"none",width:"100%"}}>    
            <div  
                onClick={(e) => this.props.selectProject(this.props.project)} 
                id={this.props.project._id}
                className={selected ? "" : "leftpanelmenuitem"}  
                style={{     
                    overflow:"hidden",
                    height:"20px",  
                    paddingBottom:"3px",
                    paddingTop:"3px",
                    display:"flex",
                    width:"100%",
                    alignItems:"center"  
                }} 
            >     
                    <div style={{    
                        transform:"rotate(270deg)", 
                        width:"16px",
                        height:"16px",
                        position:"relative",
                        borderRadius:"100px",
                        display:"flex",
                        justifyContent:"center",
                        alignItems:"center",
                        border:"1px solid rgb(170, 170, 170)",
                        boxSizing:"border-box" 
                    }}> 
                        <div style={{
                            width:"16px",
                            height:"16px",
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            position:"relative" 
                        }}>  
                            <PieChart 
                                animate={false}    
                                totalValue={totalValue}
                                data={[{value:currentValue, key:1, color:"rgba(159, 159, 159, 1)"}]}    
                                style={{   
                                    color:"rgba(159, 159, 159, 1)",
                                    width:12,   
                                    height:12,
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
                            width:'calc(90% - 16px)',
                            paddingLeft:"5px",
                            display:"flex",
                            fontFamily:"sans-serif",
                            fontSize:`15px`,  
                            whiteSpace:"nowrap", 
                            cursor:"default",
                            WebkitUserSelect: "none" 
                        }}
                    >    
                        <AutoresizableText
                            text={project.name} 
                            placeholder="New Project"
                            fontWeight="normal"
                            fontSize={15}
                            style={{}}
                            offset={selected ? 6 : 3}
                            placeholderStyle={{}}
                        />
                        {   
                            this.props.project._id===this.props.selectedProjectId && 
                            selectedCategory==="project" ?
                            <div style={{
                                position:"absolute",
                                right:"10px",
                                height:"15px",
                                width:"15px"
                            }}>
                                <Checked style={{color:"rgb(56, 115, 207)", width:"15px", height:"15px"}}/>
                            </div>
                            :
                            null
                        }
                    </div>    
            </div>
        </li>  
    }
};

 






 