import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import IconButton from 'material-ui/IconButton'; 
import { Project, Area, Todo } from '../../database';
import NewAreaIcon from 'material-ui/svg-icons/content/content-copy';
import ArrowUp from 'material-ui/svg-icons/navigation/arrow-drop-up';
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import { byNotCompleted, byNotDeleted, typeEquals, isNotNil, anyTrue, attachDispatchToProps, different } from '../../utils/utils';
import PieChart from 'react-minimal-pie-chart';
import { 
    uniq, allPass, remove, intersection, reject, slice, prop, flatten,
    isEmpty, contains, assoc, isNil, not, merge, map, concat, ifElse, 
    addIndex, compose, cond, defaultTo, last, insertAll, prepend, find  
} from 'ramda'; 
import { Category } from '../MainContainer';
import { AutoresizableText } from '../AutoresizableText';
import { getProgressStatus } from '../Project/ProjectLink';
import { assert } from '../../utils/assert';
import { isArea, isProject, isNotArray } from '../../utils/isSomething';
import { arrayMove } from '../../utils/arrayMove';
import { SortableContainer } from '../CustomSortableContainer';
import { isDev } from '../../utils/isDev';
import { groupProjectsByArea } from './groupProjectsByArea';
import {  generateLayout } from './generateLayout';
const mapIndexed = addIndex(map);
const isSeparator = (item) => item.type==="separator"; 
      


export let removeFromArea = (dispatch:Function, fromArea:Area, selectedProject:Project) : void => {
    let idx = fromArea.attachedProjectsIds.findIndex((id:string) => id===selectedProject._id);  

    if(isDev()){
       assert(idx!==-1,`selectedProject is not attached to fromArea. ${selectedProject} ${fromArea}`);
       assert(selectedProject.type==="project",`selectedProject is not of type project.  ${selectedProject}. removeFromArea.`);
       assert(fromArea.type==="area",`fromArea is not of type Area. ${fromArea}. removeFromArea.`);
    }
     
    fromArea.attachedProjectsIds = remove(idx, 1, fromArea.attachedProjectsIds); 
    dispatch({type:"updateArea", load:fromArea});  
};

 

interface AreasListProps{   
    dispatch:Function,
    leftPanelWidth:number, 
    dragged:string, 
    completed:Todo[],
    todos:Todo[], 
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
            todos,
            areas,
            projects   
        } = nextProps;


        let leftPanelWidthChanged =  leftPanelWidth!==this.props.leftPanelWidth;
        let draggedChanged = dragged!==this.props.dragged;

        let selectedProjectIdChanged = selectedProjectId!==this.props.selectedProjectId;
        let selectedAreaIdChanged = selectedAreaId!==this.props.selectedAreaId;

        let todosChanged = todos!==this.props.todos;
        let areasChanged = areas!==this.props.areas;
        let projectsChanged = projects!==this.props.projects;
        

        return anyTrue([
            leftPanelWidthChanged, 
            draggedChanged,
            selectedProjectIdChanged,
            selectedAreaIdChanged,
            todosChanged,
            areasChanged,
            projectsChanged 
        ]); 
    }


    onCollapseContent = (area:Area) : void => { 
        let {dispatch} = this.props;
        let {hideContentFromAreasList} = area; 

        dispatch({
            type:"updateArea",
            load:{...area,hideContentFromAreasList:not(hideContentFromAreasList)}
        });
    };

 
    selectArea = (area:Area) : void => {
        let {dispatch} = this.props;
        let {hideContentFromAreasList} = area; 

        if(hideContentFromAreasList){
           this.onCollapseContent(area);
        }
 
        dispatch({type:"selectedAreaId",load:area._id}); 
        dispatch({type:"selectedTag",load:"All"});
        dispatch({type:"searchQuery",load:""});
    };
 

    selectProject = (p:Project) : void => {
        let {dispatch} = this.props;
        
        dispatch({type:"selectedProjectId",load:p._id});
        dispatch({type:"selectedTag",load:"All"});
        dispatch({type:"searchQuery",load:""});
    };


    getAreaElement = (a : Area, index : number, hideAreaPadding : boolean) : JSX.Element => {
        return <AreaElement 
            area={a}
            index={index} 
            hideAreaPadding={hideAreaPadding}
            leftPanelRef={this.props.leftPanelRef}
            selectArea={this.selectArea}
            onCollapseContent={this.onCollapseContent}
            leftPanelWidth={this.props.leftPanelWidth}
            selectedAreaId={this.props.selectedAreaId}
            selectedCategory={this.props.selectedCategory}
        />
    };
 

    getProjectElement = (p:Project, index:number) : JSX.Element => {
        return <ProjectElement 
            todos={this.props.todos}
            completed={this.props.completed}
            project={p}
            index={index}
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
     

    onSortMove = (oldIndex:number, event) : void => {} 


    onSortStart = (oldIndex:number, event:any) : void => {}


    byNotAttachedToCollapsedArea = (project:Project) : boolean => compose(
        ifElse(
            isNil,
            () => true,
            compose(
                not,
                prop('hideContentFromAreasList')
            )
        ),
        find((area:Area) => contains(project._id)(area.attachedProjectsIds)),
        prop('areas')
    )(this.props);


    onSortEnd = (oldIndex:number, newIndex:number, event) : void => {
        let {dispatch,projects,areas} = this.props;

        let {table,detached} = groupProjectsByArea(
            projects.filter(
                allPass([
                    byNotDeleted, 
                    byNotCompleted,
                    this.byNotAttachedToCollapsedArea
                ])
            ),
            areas.filter(byNotDeleted)
        );

        let layout = generateLayout(areas,{table,detached}); 
 
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
                                assoc("priority",index),
                                (ids) => assoc("attachedProjectsIds",ids,area),
                                reject((id) => contains(id)(layoutProjectsIds)),
                                (area) => area.attachedProjectsIds
                            )(area) 
                        ],
                        [
                            isProject, //if project, set new priority (change order according to items rearrangement)
                            assoc("priority",index)
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
        
 
        assert(layout.length===layoutAfterSort.length, `incorrect logic. Areas List.`);
        assert(layout[oldIndex]._id===layoutAfterSort[newIndex]._id, `incorrect order. Areas List.`);
    

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
                concat(  
                    defaultTo([])(
                        byArea[area._id]
                    )
                ),
                (area) => area.attachedProjectsIds
            )(area)
        );

 
        //4) Update projects/areas in store/database
        dispatch({type:"updateProjects", load:updatedProjects}); 
        dispatch({type:"updateAreas", load:updatedAreas});  
    };

       
    selectElements = (index:number,items:any[]) => {
        let selected = [index];
        let item = items[index];

        assert(not(isNil(item)),`item is Nil. selectElements. index ${index}`);

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

        let {table,detached} = groupProjectsByArea(
            projects.filter(
                allPass([
                    byNotDeleted,
                    byNotCompleted,
                    this.byNotAttachedToCollapsedArea
                ])
            ),
            areas.filter(byNotDeleted)
        );

        let layout = generateLayout(this.props.areas,{table,detached}); 
        let hideAreaPadding = true; 
        let detachedEmpty = isEmpty(detached);

        return <div   
            id="areas"
            style={{userSelect:"none",paddingRight:"15px",paddingLeft:"15px",paddingTop:"15px",paddingBottom:"80px"}}   
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
}


interface AreaElementProps{
    area:Area,
    leftPanelWidth:number, 
    index:number,
    hideAreaPadding:boolean,
    leftPanelRef:HTMLElement,
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


    shouldComponentUpdate(nextProps:AreaElementProps,nextState:AreaElementState){
        let {
            area,
            leftPanelWidth, 
            index,
            hideAreaPadding, 
            selectedAreaId
        } = nextProps;
        let {highlight} = nextState;

        let areaChanged = area!==this.props.area;
        let leftPanelWidthChanged = leftPanelWidth!==this.props.leftPanelWidth;
        let indexChanged = index!==this.props.index;
        let hideAreaPaddingChanged = hideAreaPadding!==this.props.hideAreaPadding;
        let selectedAreaIdChanged = selectedAreaId!==this.props.selectedAreaId;
        let highlightChanged = highlight!==this.state.highlight;

        return anyTrue([
            highlightChanged,
            areaChanged, 
            leftPanelWidthChanged, 
            indexChanged, 
            hideAreaPaddingChanged,
            selectedAreaIdChanged
        ]);
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

        let {highlight} = this.state;
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
            <div style={{outline:"none",width:"100%",height:hideAreaPadding ? "0px" : "20px"}}></div>  
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
                    height:"25px", 
                    display:"flex",  
                    alignItems:"center" 
                }}
            >      
                <IconButton  
                    style={{ 
                        width:"20px", 
                        height:"20px", 
                        padding:"0px",
                        display:"flex", 
                        alignItems:"center", 
                        justifyContent:"center"
                    }}    
                    iconStyle={{ 
                        color:"rgba(109,109,109,0.7)", 
                        width:"20px", 
                        height:"20px" 
                    }}   
                >      
                    <NewAreaIcon style={{width:"20px",height:"20px"}}/> 
                </IconButton>  
                <div style={{ 
                    width:"100%",
                    fontFamily:"sans-serif",
                    fontSize:"15px",    
                    cursor:"default", 
                    paddingLeft:"5px", 
                    WebkitUserSelect:"none",
                    fontWeight:"bolder", 
                    color:"rgba(0, 0, 0, 0.8)" 
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
                { 
                    not(highlight) ? null :
                    <IconButton  
                        onClick={(e) => {
                            e.stopPropagation();
                            onCollapseContent(area);
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
                }
            </div> 
        </li>
    }
}
 
 




interface ProjectElementProps{
    project:Project,
    index:number,
    dragged:string,
    completed:Todo[],
    selectProject:Function,
    selectedProjectId:string,
    selectedCategory:Category,
    todos:Todo[]
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
    

    shouldComponentUpdate(nextProps:ProjectElementProps,nextState:ProjectElementState){
        let {
            project,
            todos,
            index,
            dragged,
            selectedProjectId,
            completed
        } = nextProps;
        let {highlight} = nextState;
       
        let highlightChanged = highlight!==this.state.highlight;
        let projectChanged = project!==this.props.project;
       
        //et indexChanged = index!==this.props.index;
        //let draggedChanged = dragged!==this.props.dragged;
        let selectedProjectIdChanged = selectedProjectId!==this.props.selectedProjectId;


        let todosChanged = true;
        
        if(todos.length!==this.props.todos.length){
            todosChanged = true;
        }else if(completed.length!==this.props.completed.length){
            todosChanged = true;
        }
        

        let should = anyTrue([ 
            highlightChanged,  
            projectChanged, 
            todosChanged, 
            //indexChanged,
            //draggedChanged, 
            selectedProjectIdChanged 
        ]);


        return should
    };

    
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
        let {project, selectedProjectId, selectedCategory, todos} = this.props;
        let selected = project._id===selectedProjectId && selectedCategory==="project";
        let {done, left} = getProgressStatus(project, todos, false);
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
                    paddingLeft:"4px",   
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
                                data={[{     
                                    value:currentValue,   
                                    key:1,    
                                    color:"rgba(159, 159, 159, 1)" 
                                }]}    
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

 






 