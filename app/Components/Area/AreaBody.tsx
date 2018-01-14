
import '../../assets/styles.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Provider } from "react-redux";
import { Transition } from 'react-transition-group';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react";  
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Popover from 'material-ui/Popover';
import TrashIcon from 'material-ui/svg-icons/action/delete';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Repeat from 'material-ui/svg-icons/av/repeat';
import Inbox from 'material-ui/svg-icons/content/inbox';
import Duplicate from 'material-ui/svg-icons/content/content-copy';
import ShareIcon from 'material-ui/svg-icons/social/share';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import { TextField } from 'material-ui';
import AutosizeInput from 'react-input-autosize';
import { Todo, Project, Heading, LayoutItem, Area } from '../../database';
import { 
    uppercase, debounce, stringToLength, daysLeftMark, byNotCompleted, 
    byNotDeleted, generateDropStyle, insideTargetArea, hideChildrens, makeChildrensVisible, assert, isArrayOfProjects, isProject, isCategory, isString 
} from '../../utils';
import SortableHandle from '../../sortable-hoc/sortableHandle';
import { arrayMove } from '../../sortable-hoc/utils';
import { SortableList, Data } from '../SortableList';
import { TodoInput } from '../TodoInput/TodoInput';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import Checked from 'material-ui/svg-icons/navigation/check';
import PieChart from 'react-minimal-pie-chart';
import { getProjectLink } from '../Project/ProjectLink';
import { allPass, isNil, not, contains, isEmpty } from 'ramda';
import { TodosList, Placeholder } from '../TodosList';
import { Category } from '../MainContainer';
import { changeProjectsOrder, removeFromArea, attachToArea } from './AreasList';
import { isDev } from '../../app';
import { deleteProject } from '../Project/ProjectMenu';
import { ExpandableTodosList } from '../Categories/Next';


 

interface AreaBodyProps{ 
    area:Area, 
    areas:Area[], 
    projects:Project[],
    selectedTodoId:string, 
    selectedAreaId:string,
    selectedProjectId:string, 
    todos:Todo[],
    tags:string[],
    searched:boolean, 
    selectedCategory:Category, 
    selectedTag:string, 
    rootRef:HTMLElement,
    dispatch:Function
} 
 
 
   
interface AreaBodyState{
    placeholderHeight:number, 
    showPlaceholder:boolean,
    currentIndex:number
} 
 
 
 
export class AreaBody extends Component<AreaBodyProps,AreaBodyState>{

    ref:HTMLElement; 

    constructor(props){
        super(props); 
        this.state = {
            placeholderHeight:0,
            showPlaceholder:false,
            currentIndex:0
        } 
    }
    

    shouldComponentUpdate(nextProps:AreaBodyProps,nextState:AreaBodyState){
        let should = false;

        if(nextProps.area!==this.props.area)
            should = true;

        if(nextProps.areas!==this.props.areas)
            should = true;
        
        if(nextProps.projects!==this.props.projects)
            should = true;
        
        if(nextProps.selectedAreaId!==this.props.selectedAreaId)
            should = true;
        
        if(nextProps.selectedProjectId!==this.props.selectedProjectId)
            should = true;
        
        if(nextProps.todos!==this.props.todos)
            should = true;
        
        if(nextProps.tags!==this.props.tags)
            should = true;
        
        if(nextProps.searched!==this.props.searched)
            should = true;
        
        if(nextProps.selectedCategory!==this.props.selectedCategory)
            should = true;
        
        if(nextProps.selectedTag!==this.props.selectedTag) 
            should = true;
         
        return should; 
    }
 

    selectProjects = (props:AreaBodyProps) : Project[] => { 
        let projectsIds : string[] = props.area.attachedProjectsIds;
        let filters = [
            byNotCompleted,
            byNotDeleted,
            (p:Project) => projectsIds.indexOf(p._id)!==-1
        ];
 
        let selected = props.projects.filter( allPass(filters) );

        assert(
            isArrayOfProjects(selected), 
            `selected is not an array of projects. selectProjects. AreaBody. ${JSON.stringify(selected)}`
        );
 
        return selected;
    }
      
 
    getProjectElement = (value:Project,index:number) : JSX.Element => {
        return <ProjectElement 
            project={value}
            todos={this.props.todos}
            index={index}
            dispatch={this.props.dispatch}
            searched={this.props.searched}
            selectedTag={this.props.selectedTag}
            rootRef={this.props.rootRef}
            selectedAreaId={this.props.selectedAreaId}
            selectedProjectId={this.props.selectedProjectId}
            selectedTodoId={this.props.selectedTodoId}
            tags={this.props.tags}  
            areas={this.props.areas}
            projects={this.props.projects}
        />
    }


    shouldCancelStart = (e) => {
        let nodes = [].slice.call(e.path);
        for(let i=0; i<nodes.length; i++){
            if(nodes[i].preventDrag)
                return true;
        }
        return false; 
    } 

       
    shouldCancelAnimation = (e) => {
        if(!this.props.rootRef)
            return true;
        let rect = this.props.rootRef.getBoundingClientRect();    
        let x = e.pageX;
        return x < rect.left;   
    }  
    

    onSortStart = ({node, index, collection}, e, helper) => { 
        let box = node.getBoundingClientRect();

        this.setState({
            showPlaceholder:true,
            placeholderHeight:box.height 
        });

        let selectedProjects = this.selectProjects(this.props)
        .sort((a:Project, b:Project) => a.priority-b.priority);

        let item = selectedProjects[index];

        assert(isProject(item), `item is not a project. ${JSON.stringify(item)}. onSortStart. AreaBody.`);
        
        this.props.dispatch({type:"dragged",load:item.type});
 
        let helperRect = helper.getBoundingClientRect();
        let offset = e.clientX - helperRect.left;
        let el = generateDropStyle("nested"); 
        el.style.left = `${offset}px`;  
        el.style.visibility = "hidden";
        el.style.opacity = '0'; 
        helper.appendChild(el);   
    }   


    onSortEnd = ({oldIndex, newIndex, collection}, e) => {

        this.setState({showPlaceholder:false}); 
        this.props.dispatch({type:"dragged",load:null}); 

        let selectedProjects = this.selectProjects(this.props)
        .sort((a:Project, b:Project) => a.priority-b.priority);

        let x = e.clientX+this.props.rootRef.scrollLeft; 
        let y = e.clientY+this.props.rootRef.scrollTop;  
        let leftpanel = document.getElementById("leftpanel");
        let target = selectedProjects[oldIndex];

        assert(isProject(target), `itarget is not a project. ${JSON.stringify(target)}. onSortEnd. AreaBody.`);
        assert(not(isNil(leftpanel)), `leftpanel is Nil. onSortEnd. AreaBody.`);
 
        if(insideTargetArea(leftpanel,x,y)){   

            let el = document.elementFromPoint(e.clientX, e.clientY);
            let id = el.id || el.parentElement.id;
            let areaTarget : Area = this.props.areas.find( (a:Area) => a._id===id );
         
            if(!isNil(areaTarget)){
                if(areaTarget.type==="area" && areaTarget._id!==this.props.area._id){
                    removeFromArea(this.props.dispatch, this.props.area, {...target});
                    attachToArea(this.props.dispatch, areaTarget, {...target}); 
                }    
            }

            let nodes = [].slice.call(e.path);
        
            for(let i=0; i<nodes.length; i++){
                if(nodes[i].id==="trash"){ 
                   deleteProject(this.props.dispatch, target, this.props.todos);
                }    
            }   

        }else{     
            if(oldIndex===newIndex)
               return; 
            let updated = arrayMove([...selectedProjects], oldIndex, newIndex);
            changeProjectsOrder(this.props.dispatch,updated);
        } 
    }   

   
 
    onSortMove = (e, helper : HTMLElement, newIndex:number) => {
        if(!this.props.rootRef)
           return; 

        let x = e.clientX;   
        let y = e.clientY;   

        if(newIndex!==this.state.currentIndex && this.ref){
           this.setState({currentIndex:newIndex});   
        }

        let container = document.getElementById("areas");
        let nested = document.getElementById("nested");

        if(insideTargetArea(container,x,y)){
            hideChildrens(helper);  
            nested.style.visibility=""; 
            nested.style.opacity='1';    
        }else{ 
            makeChildrensVisible(helper);  
            nested.style.visibility="hidden";
            nested.style.opacity='0';  
        } 
    } 
    
    render(){  
        let selectedProjects = this.selectProjects(this.props)
        .sort((a:Project, b:Project) => a.priority-b.priority);
        
        return <div ref={(e) => {this.ref=e;}}>    
            <div style={{paddingTop:"20px", paddingBottom:"20px"}}> 
                <SortableList 
                    getElement={this.getProjectElement}
                    items={selectedProjects}
                    container={this.props.rootRef ? this.props.rootRef : document.body}
                    shouldCancelStart={this.shouldCancelStart} 
                    shouldCancelAnimation={this.shouldCancelAnimation}
                    useDragHandle={true}  
                    onSortEnd={this.onSortEnd}
                    onSortMove={this.onSortMove}
                    onSortStart={this.onSortStart}
                    lockToContainerEdges={false}
                    distance={5} 
                    lock={false} 
                /> 
            </div> 
        </div>
    }
} 




interface ProjectElementProps{
    project:Project,
    index:number,
    todos:Todo[],
    dispatch:Function,
    searched:boolean,  
    selectedTag:string, 
    rootRef:HTMLElement,  
    selectedAreaId:string,  
    selectedProjectId:string,  
    selectedTodoId:string,  
    tags:string[],  
    areas:Area[],  
    projects:Project[]   
}

interface ProjectElementState{
    canDrag:boolean
}

class ProjectElement extends Component<ProjectElementProps,ProjectElementState>{
    ref:HTMLElement; 

    constructor(props){ 
        super(props);
        this.state={
           canDrag:true
        }
    } 


    onToggleList = (showAllItems:boolean) => {
        if(showAllItems){
            this.setState({canDrag:false});
        }else{ 
            this.setState({canDrag:true}); 
        }
    }  


    render(){
        let {project,todos,index,dispatch,
            searched,   
            selectedTag, 
            rootRef,  
            selectedAreaId,  
            selectedProjectId,  
            selectedTodoId,  
            tags,  
            areas,  
            projects,
        } = this.props

        const DragHandle = SortableHandle(
            () => <div>
                {getProjectLink(project, todos, dispatch, index)}
            </div>
        );    

        let attachedTodosIds = project.layout.filter(isString) as string[];
        let selected = this.props.todos.filter((t:Todo) => 
            contains(t._id)(attachedTodosIds) && 
            byNotCompleted(t) &&
            byNotDeleted(t) 
        );  
 

        return isEmpty(todos) ? null :
        <div 
        ref={e => {this.ref=e;}}
        style={{
            display:"flex", 
            flexDirection:"column" 
        }}>
            {
                this.state.canDrag ? 
                <DragHandle /> :
                getProjectLink(project, todos, dispatch, index)
            }
            <div>
                <ExpandableTodosList
                    dispatch={dispatch}   
                    searched={this.props.searched}
                    selectedTag={this.props.selectedTag}  
                    rootRef={this.props.rootRef}
                    onToggleList={this.onToggleList}
                    selectedAreaId={this.props.selectedAreaId}
                    selectedProjectId={this.props.selectedProjectId}
                    selectedTodoId={this.props.selectedTodoId} 
                    todos={selected} 
                    tags={this.props.tags} 
                    areas={this.props.areas}
                    projects={this.props.projects}
                /> 
            </div>
        </div>
    }
}




  