import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import NewAreaIcon from 'material-ui/svg-icons/maps/layers';
import { Area, Project, Todo } from '../../database'; 
import { AreaHeader } from './AreaHeader';
import { AreaBody } from './AreaBody';
import { debounce, assert, isArea } from '../../utils';
import { Category } from '../MainContainer';
import { uniq, isNil } from 'ramda'; 
   
  
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
 

    updateArea = (selectedArea:Area, updatedProps) : void => { 
        let type = "updateArea"; 
        let load = { ...selectedArea, ...updatedProps };

        assert(isArea(load), `Load is not an Area. ${JSON.stringify(load)}`);

        this.props.dispatch({type, load});
    }


    updateAreaName = debounce((area:Area, value:string) : void => this.updateArea(area, {name:value}), 50) 
  

    attachTagToArea = (area:Area, tag:string) => {
        let attachedTags = uniq([tag, ...area.attachedTags]); 
        this.updateArea(area, {attachedTags});
    } 
    
 
    render(){
       
        return <div>  
            <div> 
                <AreaHeader 
                    area={this.props.area} 
                    name={this.props.area.name}  
                    rootRef={this.props.rootRef}
                    areas={this.props.areas}    
                    attachTagToArea={(tag:string) => this.attachTagToArea(this.props.area,tag)}
                    projects={this.props.projects}
                    todos={this.props.todos} 
                    selectedAreaId={this.props.selectedAreaId}
                    updateAreaName={(value:string) => this.updateAreaName(this.props.area,value)}
                    dispatch={this.props.dispatch}  
                />   
            </div> 
            <div> 
                <AreaBody  
                    area={this.props.area}  
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
        </div> 
    }
} 



 

