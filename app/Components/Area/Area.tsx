import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import { Area, Project, Todo } from '../../database'; 
import { AreaHeader } from './AreaHeader';
import { AreaBody } from './AreaBody';
import { debounce } from 'lodash';
import { Category, filter } from '../MainContainer';
import { isNil, contains, flatten, compose, map } from 'ramda'; 
import { isArea, isArrayOfTodos, isArrayOfProjects, isTodo, isString } from '../../utils/isSomething';
import { assert } from '../../utils/assert';
   
  
interface AreaComponentProps{
    area:Area,
    todos:Todo[], 
    scrolledTodo:Todo,
    areas:Area[],  
    selectedCategory:Category, 
    indicators:{ 
        [key:string]:{
            active:number,
            completed:number,
            deleted:number
        }; 
    },
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
    };



    updateAreaName = debounce((value:string) : void => this.updateArea({name:value}),150); 
 


    deleteArea = () => {
        let {area, projects, todos, dispatch} = this.props;

        assert(isArea(area),`area is not of type Area. onDeleteArea. ${area}`);
        
        if(isNil(area)){ return }

        //projects attached to area
        let selectedProjects : Project[] = filter(projects,(p) => contains(p._id)(area.attachedProjectsIds),""); 

        //todos attached to projects which attached to area to be removed
        let selectedTodos : Todo[] = compose(
            (ids:string[]) => filter(todos, (t) => contains(t._id)(ids), ""),
            flatten,
            map((p:Project) => p.layout.filter(isString))
        )(selectedProjects);
        
          
        assert(isArrayOfTodos(selectedTodos),`selectedTodos is not of type Todo[]. onDeleteArea. ${selectedTodos}`);
        assert(isArrayOfProjects(selectedProjects),`selectedProjects is not of type Project[]. onDeleteArea. ${selectedProjects}`);
        

        dispatch({
            type:"multiple",
            load:[
                { 
                    type:"updateTodos", 
                    load:selectedTodos.map( t => ({...t,reminder:null,deleted:new Date()}) ) 
                },
                { 
                    type:"updateProjects", 
                    load:selectedProjects.map( p => ({...p,deleted:new Date()}) ) 
                },
                { 
                    type:"updateArea", 
                    load:{...area,deleted:new Date()} 
                },
                { 
                    type:"selectedCategory", 
                    load:"inbox" 
                }
            ]
        }); 
    };



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
                indicators={this.props.indicators}
                groupTodos={this.props.groupTodos}
                selectedAreaId={this.props.selectedAreaId}
                scrolledTodo={this.props.scrolledTodo}
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



 

