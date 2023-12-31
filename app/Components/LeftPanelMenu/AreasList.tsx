import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import IconButton from 'material-ui/IconButton'; 
import { Project, Area, Todo, Category } from '../../types';
import NewAreaIcon from 'material-ui/svg-icons/content/content-copy';
import ArrowUp from 'material-ui/svg-icons/navigation/arrow-drop-up';
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import { byNotCompleted, byNotDeleted, typeEquals, different } from '../../utils/utils';
import { PieChart } from 'react-minimal-pie-chart';
import { 
    uniq, allPass, remove, reject, slice, prop, flatten,
    isEmpty, contains, assoc, isNil, not, map, concat, ifElse, 
    addIndex, compose, cond, defaultTo, last, insertAll
} from 'ramda'; 
import { filter } from 'lodash';
import { AutoresizableText } from '../AutoresizableText';
import { assert } from '../../utils/assert';
import { isArea, isProject, isNotArray } from '../../utils/isSomething';
import { arrayMove } from '../../utils/arrayMove';
import { SortableContainer } from '../CustomSortableContainer';
import { isDev } from '../../utils/isDev';
import { groupProjectsByArea } from '../Area/groupProjectsByArea';
import { generateLayout } from '../Area/generateLayout';
import { uppercase } from '../../utils/uppercase';
import { ipcRenderer } from 'electron';
const mapIndexed = addIndex(map);
const isSeparator = (item) => item.type==="separator"; 



interface AreasListProps{   
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
            indicators,
            projects 
        } = nextProps; 


        let should = leftPanelWidth!==this.props.leftPanelWidth ||
                     dragged!==this.props.dragged ||
                     selectedProjectId!==this.props.selectedProjectId ||
                     selectedAreaId!==this.props.selectedAreaId ||
                     selectedCategory!==this.props.selectedCategory ||
                     different(indicators,this.props.indicators) ||
                     nextProps.areas!==this.props.areas ||
                     nextProps.projects!==this.props.projects;
      
                     
        return should;                
    };



    onCollapseContent = (area:Area) : void => { 
        let {dispatch} = this.props;
        let {hideContentFromAreasList} = area; 

        dispatch({
            type:"updateArea",
            load:{...area,hideContentFromAreasList:not(hideContentFromAreasList)}
        });
    };


 
    selectArea = (area:Area) : void => {
        let {hideContentFromAreasList,name} = area; 

        if(hideContentFromAreasList){
           this.onCollapseContent(area);
        }
 
        
        this.props.dispatch({
            type:"multiple",
            load:[
                {type:"selectedAreaId",load:area._id}, 
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
                {type:"showProjectMenuPopover",load:false}, 
                {type:"selectedCategory",load:"project"},
                {type:"selectedTags",load:["All"]},
                {type:"searchQuery",load:""}
            ]
        })
    };
    


    getAreaElement = (a : Area, index : number, hideAreaPadding : boolean) : JSX.Element => {
        return <AreaElement 
            area={a}
            index={index} 
            hideAreaPadding={hideAreaPadding}
            selectArea={this.selectArea}
            onCollapseContent={this.onCollapseContent}
            leftPanelWidth={this.props.leftPanelWidth}
            selectedAreaId={this.props.selectedAreaId}
            selectedCategory={this.props.selectedCategory}
        />
    };
 


    getProjectElement = (p:Project, index:number) : JSX.Element => {
        return <ProjectElement 
            indicator={defaultTo({completed:0,active:0})(this.props.indicators[p._id])}
            project={p} 
            index={index}
            leftPanelWidth={this.props.leftPanelWidth}
            dragged={this.props.dragged}  
            selectProject={this.selectProject}
            selectedProjectId={this.props.selectedProjectId}
            selectedCategory={this.props.selectedCategory}
        />
    };
    
    
 
    getElement = (value : LayoutItem, index : number, hideAreaPadding : boolean) : JSX.Element => 
        cond([
            [
                typeEquals("area"),
                (value) => <div key={`key-${value._id}`} id={value._id}>
                    {this.getAreaElement(value as any, index, hideAreaPadding)}
                </div>
            ],
            [
                typeEquals("project"),
                (value) => <div key={`key-${value._id}`} id={value._id}>
                    {this.getProjectElement(value as any, index)}
                </div>
            ],
            [
                typeEquals("separator"),
                (value) => <div 
                    key={`key-${value._id}`} 
                    id={value._id} 
                    style={{outline:"none",width:"100%",height:"1px"}}
                >
                </div>
            ],
            [   () => true, () => null  ]
        ])(value); 



    shouldCancelStart = (e) => {
        let nodes = [].slice.call(e.path);

        for(let i=0; i<nodes.length; i++){ 
            if(nodes[i].id==="separator"){ 
               return true; 
            }
        } 
   
        return false; 
    }; 
     


    onSortMove = (oldIndex:number, event) : void => {}; 



    onSortStart = (oldIndex:number, event:any) : void => {};



    projectsAttachedToCollapsedAreaIDs = () : string[] => {
        let collapsedAreas = filter(this.props.areas, (area:Area) => area.hideContentFromAreasList);
        let ids = flatten( collapsedAreas.map( (area:Area) => area.attachedProjectsIds ) );
        return ids;
    };



    onSortEnd = (oldIndex:number, newIndex:number, event) : void => {
        let {dispatch} = this.props;
        let ids = this.projectsAttachedToCollapsedAreaIDs();

        let {table,detached} = groupProjectsByArea(
            this.props.projects.filter(
                allPass([
                    byNotDeleted, 
                    byNotCompleted,
                    (project:Project) => !contains(project._id)(ids)
                ])
            ),
            this.props.areas.filter(byNotDeleted)
        );

        let layout = generateLayout(this.props.areas,{table,detached}); 
 
        if(isEmpty(layout)){ return }

        //projects ids contained in current layout
        let layoutProjectsIds : string[] = layout.filter(isProject).map(p => p._id); 

        //indices
        let indices = this.selectElements(oldIndex,layout);
    
        //1) change projects & areas order, detach projects from areas 
        let layoutAfterSort = compose(
            mapIndexed( 
                (item,index:number) => cond( 
                    [
                        [
                            isArea, //if area, remove attached projects ids (contained in current layout)
                            (area:Area) => compose(
                                area => assoc("priority",index,area),
                                (ids) => assoc("attachedProjectsIds",ids,area),
                                reject((id) => contains(id)(layoutProjectsIds)),
                                (area) => area.attachedProjectsIds
                            )(area) 
                        ],
                        [
                            isProject, //if project, set new priority (change order according to items rearrangement)
                            project => assoc("priority",index,project)
                        ],
                        [
                            isSeparator,  
                            (separator) => separator
                        ]
                    ]
                )(item) 
            ),
            compose( 
                ifElse(
                    isArea, 
                    compose(
                        (collection) => compose(
                            insertAll(newIndex,collection), // insert (area + project[]) at new position
                            remove(oldIndex,indices.length) // remove (area + project[]) from initial layout
                        )(layout),
                        (lastIndex:number) => slice(oldIndex,lastIndex,layout), // preserve (area + project[])
                        () => last(indices) + 1, //move one forward
                    ),
                    (item) => arrayMove([...layout], oldIndex, newIndex)
                ), 
                prop(oldIndex) //get dragged item
            )
        )(layout);
        
        if(isDev()){
           assert(layout.length===layoutAfterSort.length, `incorrect logic. Areas List.`);
           assert(layout[oldIndex]._id===layoutAfterSort[newIndex]._id, `incorrect order. Areas List.`);
        }    

        //2) Based on new order, generate hash table of form { areaId : projectId[] }
        let target = undefined;
        let byArea = {}; 
        for(let i=0; i<layoutAfterSort.length; i++){
            let item = layoutAfterSort[i];

            if(isArea(item)){ 
                target = item._id; 
            }else if(isProject(item)){
                if(target){
                    if(isNotArray(byArea[target])){
                       byArea[target] = [item._id];
                    }else{
                       byArea[target].push(item._id); 
                    }
                }
            }
        };


        //3) Assign to each area attachedProjectsIds collected into coresponding cell in hash table
        let updatedProjects : Project[] = layoutAfterSort.filter(isProject);
        let updatedAreas : Area[] = layoutAfterSort.filter(isArea).map(
            (area:Area) => compose(  
                (ids) => assoc("attachedProjectsIds",ids,area),
                uniq,
                concat( defaultTo([], byArea[area._id]) ),
                (area) => area.attachedProjectsIds
            )(area)
        );

 
        //4) Update projects/areas in store/database
        dispatch({
            type:"multiple",
            load:[
                {type:"updateProjects", load:updatedProjects}, 
                {type:"updateAreas", load:updatedAreas}  
            ]
        }); 
    };


       
    selectElements = (index:number,items:any[]) => {
        let selected = [index];
        let item = items[index];

        if(isDev()){
           assert(!isNil(item),`item is Nil. selectElements. index ${index}`);
        }  

        if(isArea(item)){
            for(let i=index+1; i<items.length; i++){
                let next = items[i];
                if(isProject(next)){ selected.push(i) }
                else{ break }   
            }
        } 
  
        return selected; 
    };   
 


    render(){ 
        let scrollableContainer = document.getElementById("leftpanel");
        let {projects,areas} = this.props;
        let ids = this.projectsAttachedToCollapsedAreaIDs();
        let {table,detached} = groupProjectsByArea(
            projects.filter(
                allPass([
                    byNotDeleted,
                    byNotCompleted,
                    (project:Project) => !contains(project._id)(ids)
                ])
            ), 
            areas.filter(byNotDeleted)
        );

        let layout = generateLayout(this.props.areas,{table,detached}); 
        let hideAreaPadding = true; 
        let detachedEmpty = isEmpty(detached);

        return <div   
            id="areas"
            style={{userSelect:"none",paddingRight:"15px",paddingLeft:"20px",paddingTop:"15px",paddingBottom:"10px"}}   
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
                {
                    layout.map( 
                        (item,index) => {
                            let element = this.getElement(item,index,hideAreaPadding && detachedEmpty);
                            if(isArea(item as Area)){ hideAreaPadding = false; }  
                            return element;
                        }
                    )
                }
            </SortableContainer> 
         </div> 
    }
};



interface AreaElementProps{
    area:Area,
    leftPanelWidth:number, 
    index:number,
    hideAreaPadding:boolean,
    selectArea:(area:Area) => void,
    onCollapseContent:(area:Area) => void,
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



    onMouseEnter = (e) => this.setState({highlight:true});  
      


    onMouseLeave = (e) => this.setState({highlight:false});
    


    render(){      
        let {
            area, 
            selectedAreaId, 
            selectedCategory, 
            selectArea, 
            index, 
            hideAreaPadding, 
            onCollapseContent
        } = this.props;
        let selected = (area._id===selectedAreaId) && selectedCategory==="area";
        let {hideContentFromAreasList} = area;
 
        return <li   
            ref={e => {this.ref=e;}} 
            style={{WebkitUserSelect:"none",width:"100%"}} 
            className={"area"}  
            key={`area-${index}`}   
            onMouseEnter={this.onMouseEnter} 
            onMouseLeave={this.onMouseLeave} 
        >     
            <div style={{outline:"none", width:"100%", height:hideAreaPadding ? "0px" : "20px"}}></div>  
            <div     
                onClick={e => {e.stopPropagation(); selectArea(area);}}
                id={area._id} 
                className={selected ? "" : "leftpanelmenuitem"}  
                style={{  
                    borderRadius:selected ? "5px" : "0px", 
                    backgroundColor:selected ? "rgba(228,230,233,1)" : "",  
                    height:"25px", 
                    display:"flex",  
                    alignItems:"center" 
                }}
            >      
                <div style={{height:"24px",paddingLeft:"0px",width:"24px", marginLeft:"1px"}}>
                    <NewAreaIcon style={{width:"24px",height:"24px",color:'rgba(100, 100, 100,0.8)'}}/>
                </div>
                <div style={{ 
                    width:'calc(90% - 18px)',
                    paddingLeft:"4px",
                    fontFamily: "sans-serif",
                    fontSize:`18px`,  
                    whiteSpace: "nowrap",
                    cursor: "default",
                    WebkitUserSelect: "none"
                }}>  
                    <AutoresizableText
                        text={area.name}
                        placeholder="New Area" 
                        fontSize={18}
                        fontWeight="normal"
                        style={{}}
                        offset={2}
                        placeholderStyle={{}}
                    />
                </div>  
                { 
                    not(hideContentFromAreasList) && not(this.state.highlight) ? null :
                    <div style={{position:"absolute", right:"5px", width:"20px"}}>
                    <IconButton  
                        onClick={(e) => { 
                            e.stopPropagation();
                            onCollapseContent(area); 
                            this.onMouseLeave(null); 
                        }}  
                        style={{ 
                            width:"22px",  
                            height:"22px", 
                            padding:"0px",
                            display:"flex",  
                            alignItems:"center",  
                            justifyContent:"center"   
                        }}    
                        iconStyle={{color:"rgba(150,150,150,1)",width:"22px",height:"22px"}}   
                    >      
                        <div style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
                            {
                                hideContentFromAreasList ?
                                <ArrowDown style={{color:"rgba(150,150,150,1)",width:"22px",height:"22px"}}/> :
                                <ArrowUp style={{color:"rgba(150,150,150,1)",width:"22px",height:"22px"}}/> 
                            }
                        </div>
                    </IconButton> 
                    </div>
                }
            </div> 
        </li>
    }
};
 


interface ProjectElementProps{
    project:Project,
    index:number,
    dragged:string,
    leftPanelWidth:number,
    selectProject:Function,
    selectedProjectId:string,
    selectedCategory:Category,
    indicator:{active:number,completed:number,deleted:number}
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
               this.setState({highlight:true})  
            }  
        }  
    }; 



    onMouseOut = (e) => { 
        if(this.state.highlight){
           this.setState({highlight:false})
        }
    }; 
     


    render(){
        let {project, selectedProjectId, selectedCategory, indicator} = this.props;
        let selected = (project._id===selectedProjectId) && (selectedCategory==="project");
        let done = indicator.completed;
        let left = indicator.active;
        let totalValue = (done+left)===0 ? 1 : (done+left);
        let currentValue = done;
        
        return <li   
            style={{WebkitUserSelect:"none",width:"100%"}}  
            key={this.props.index} 
            onMouseOver={this.onMouseOver}  
            onMouseOut={this.onMouseOut}   
        >    
            <div  
                onClick={(e) => this.props.selectProject(this.props.project)} 
                id={this.props.project._id}
                className={selected ? "" : "leftpanelmenuitem"}  
                style={{     
                    borderRadius:this.state.highlight || selected ? "5px" : "0px", 
                    backgroundColor:this.state.highlight ? "rgba(0,200,0,0.3)" :
                                    selected ? "rgba(228,230,233,1)" : 
                                    "",   
                    height:"25px",  
                    paddingLeft:"3px",   
                    display:"flex",
                    alignItems:"center"
                }} 
            >     
                    <div style={{    
                        transform: "rotate(270deg)", 
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
                                totalValue={totalValue}
                                data={[{value:currentValue,key:1,color:"rgba(159, 159, 159, 1)"}]}    
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
                            width:'calc(90% - 18px)',
                            paddingLeft:"8px",
                            fontFamily: "sans-serif",
                            fontSize:`18px`,  
                            whiteSpace: "nowrap",
                            cursor: "default",
                            WebkitUserSelect: "none" 
                        }}  
                    >    
                        <AutoresizableText
                            text={project.name}
                            placeholder="New Project"
                            fontSize={18}
                            offset={2}
                            fontWeight="normal"
                            style={{}}
                            placeholderStyle={{}} 
                        />
                    </div>    
            </div>
        </li>  
    }
};

 






 