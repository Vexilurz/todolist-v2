
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
    byNotDeleted, generateDropStyle, insideTargetArea, hideChildrens, makeChildrensVisible, assert, isArrayOfProjects, isProject 
} from '../../utils';
import { arrayMove } from '../../sortable-hoc/utils';
import { SortableList, Data } from '../SortableList';
import { TodoInput } from '../TodoInput/TodoInput';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import Checked from 'material-ui/svg-icons/navigation/check';
import PieChart from 'react-minimal-pie-chart';
import { getProjectLink } from '../Project/ProjectLink';
import { allPass, isNil, not } from 'ramda';
import { TodosList, Placeholder } from '../TodosList';
import { Category } from '../MainContainer';
import { changeProjectsOrder, removeFromArea, attachToArea } from './AreasList';
import { isDev } from '../../app';


 

interface AreaBodyProps{ 
    area:Area, 
    areas:Area[], 
    projects:Project[],
    selectedTodoId:string, 
    todos:Todo[],
    tags:string[],
    searched:boolean, 
    selectedCategory:Category, 
    selectedTag:string, 
    rootRef:HTMLElement,
    dispatch:Function
} 
 
 
   
interface AreaBodyState{
    showPlaceholder:boolean,
    currentIndex:number,
    selectedProjects:Project[]
} 
 
 
 
export class AreaBody extends Component<AreaBodyProps,AreaBodyState>{

    ref:HTMLElement; 

    constructor(props){
        super(props);
        this.state = {
            showPlaceholder:false,
            currentIndex:0,
            selectedProjects:this.selectProjects(this.props)
                                 .sort(( a:Project, b:Project ) => a.priority-b.priority)
        } 
    }
    
    
    componentDidMount(){
        let selectedProjects = this.selectProjects(this.props)
                                   .sort(( a:Project, b:Project ) => a.priority-b.priority);
        this.setState({selectedProjects});
    } 

    componentWillReceiveProps(nextProps:AreaBodyProps,nextState:AreaBodyState){
        let selectedProjects = this.selectProjects(nextProps)
                                   .sort(( a:Project, b:Project ) => a.priority-b.priority);
        this.setState({selectedProjects});
    }
 
    selectTodos = (props:AreaBodyProps) : Todo[] => { 
        let todosIds : string[] = props.area.attachedTodosIds;
        let filters = [
            byNotCompleted,
            byNotDeleted,
            (t:Todo) => todosIds.indexOf(t._id)!==-1
        ];

        return props.todos.filter( allPass(filters) );
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
         
    getTodoElement = (value:Todo, index:number) : JSX.Element => { 
        return  <div style={{position:"relative"}}> 
            <TodoInput   
                id={value["_id"]} 
                key = {value["_id"]} 
                selectedCategory={this.props.selectedCategory}
                selectedTodoId={this.props.selectedTodoId}
                dispatch={this.props.dispatch}      
                projects={this.props.projects}
                searched={this.props.searched}
                tags={this.props.tags} 
                rootRef={this.props.rootRef} 
                todo={value as Todo}
            />      
        </div> 
    } 



    getElement = (value:any, index:number) : JSX.Element => { 
          
        switch(value.type){   
            case "todo":
                return this.getTodoElement(value, index);
            case "project":    
                return getProjectLink(value, this.props.todos, this.props.dispatch, index);
            default: 
                return null; 
        }  
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

        this.setState({showPlaceholder:true});
        let item = this.state.selectedProjects[index];

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

        let x = e.clientX+this.props.rootRef.scrollLeft; 
        let y = e.clientY+this.props.rootRef.scrollTop;  
        let leftpanel = document.getElementById("leftpanel");
        let target = this.state.selectedProjects[oldIndex];

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
        }else{     
            if(oldIndex===newIndex)
               return; 
            let updated = arrayMove([...this.state.selectedProjects], oldIndex, newIndex);
            changeProjectsOrder(this.props.dispatch,updated);
        } 
    }   

   
 
    onSortMove = (e, helper : HTMLElement, newIndex:number) => {
        if(!this.props.rootRef)
           return; 

        let x = e.clientX+this.props.rootRef.scrollLeft;  
        let y = e.clientY+this.props.rootRef.scrollTop;   

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
        let placeholderHeight = 37;
       
        return <div ref={(e) => { this.ref=e; }}>    
            <div style={{ paddingTop:"20px", paddingBottom:"20px" }}> 
                <Placeholder    
                    offset={this.state.currentIndex*placeholderHeight}
                    height={placeholderHeight}
                    show={this.state.showPlaceholder}
                />  
                <SortableList
                    getElement={this.getElement}
                    items={this.state.selectedProjects}
                    container={this.props.rootRef ? this.props.rootRef : document.body}
                    shouldCancelStart={this.shouldCancelStart} 
                    shouldCancelAnimation={this.shouldCancelAnimation}

                    onSortEnd={this.onSortEnd}
                    onSortMove={this.onSortMove}
                    onSortStart={this.onSortStart}

                    lockToContainerEdges={false}
                    distance={3}
                    useDragHandle={false}
                    lock={false} 
                /> 
            </div> 
        </div>
    }
} 






  