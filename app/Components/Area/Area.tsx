import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import NewAreaIcon from 'material-ui/svg-icons/maps/layers';
import { Area, Project, Todo } from '../../database'; 
import { AreaHeader } from './AreaHeader';
import { AreaBody } from './AreaBody';
import { debounce } from 'lodash';
import { Category, filter } from '../MainContainer';
import { uniq, isNil, contains } from 'ramda'; 
import { isArea, isArrayOfTodos, isArrayOfProjects } from '../../utils/isSomething';
import { assert } from '../../utils/assert';
   
  
interface AreaComponentProps{
    area:Area,
    todos:Todo[], 
    areas:Area[],  
    selectedCategory:Category, 
    groupTodos:boolean, 
    selectedAreaId:string,
    selectedTag:string, 
    moveCompletedItemsToLogbook:string,
    dispatch:Function,  
    selectedProjectId:string,  
    projects:Project[],
    rootRef:HTMLElement 
} 

 
interface AreaComponentState{}
 
 
export class AreaComponent extends Component<AreaComponentProps,AreaComponentState>{
    
    constructor(props){ 
        super(props); 
    }  


    updateArea = (updatedProps) : void => { 
        let {area,dispatch} = this.props;
        let load = { ...area, ...updatedProps };

        assert(isArea(load), `Load is not an Area. ${load}`);

        dispatch({type:"updateArea", load});
    }


    updateAreaName = debounce((value:string) : void => this.updateArea({name:value}),150); 
 

    deleteArea = () => {
        let {area, projects, todos, dispatch} = this.props;
        
        
        let relatedTodosIds : string[] = area.attachedTodosIds;
        let relatedProjectsIds : string[] = area.attachedProjectsIds;
        let selectedProjects : Project[] = filter(projects, (p) => contains(p._id)(relatedProjectsIds), "");   
        let selectedTodos : Todo[] = filter(todos, (t) => contains(t._id)(relatedTodosIds), "");  
        

        assert(isArea(area),`area is not of type Area. onDeleteArea. ${area}`);

        assert(
            isArrayOfTodos(selectedTodos),
            `selectedTodos is not of type Todo[]. onDeleteArea. ${selectedTodos}`
        );

        assert(
            isArrayOfProjects(selectedProjects), 
            `selectedProjects is not of type Project[]. onDeleteArea. ${selectedProjects}`
        );
        
        
        dispatch({ type:"updateTodos", load:selectedTodos.map((t:Todo) : Todo => ({...t,reminder:null,deleted:new Date()})) });
        dispatch({ type:"updateProjects", load:selectedProjects.map((p:Project) => ({...p,deleted:new Date()})) });
        dispatch({ type:"updateArea", load:{...area,deleted:new Date()} });     
        dispatch({ type:"selectedCategory", load:"inbox" });
        dispatch({type:"resetReminders"}); 
    }



    render(){
        let {area,selectedCategory} = this.props;

        return isNil(area) ? null : 
        <div id={`${selectedCategory}-list`}>  
            <AreaHeader 
                name={area.name}  
                selectedAreaId={this.props.selectedAreaId}
                updateAreaName={this.updateAreaName}
                deleteArea={this.deleteArea}
            />   
            <AreaBody  
                area={area}  
                selectedCategory={this.props.selectedCategory}
                todos={this.props.todos} 
                groupTodos={this.props.groupTodos}
                selectedAreaId={this.props.selectedAreaId}
                selectedProjectId={this.props.selectedProjectId}
                moveCompletedItemsToLogbook={this.props.moveCompletedItemsToLogbook}
                selectedTag={this.props.selectedTag}
                areas={this.props.areas}
                projects={this.props.projects}
                rootRef={this.props.rootRef} 
                dispatch={this.props.dispatch}
            />  
        </div> 
    }
} 



 

