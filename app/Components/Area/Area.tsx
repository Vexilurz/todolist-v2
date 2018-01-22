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
    areas:Area[],  
    selectedCategory:Category, 
    selectedAreaId:string,
    selectedTodoId:string, 
    searched:boolean, 
    selectedTag:string, 
    dispatch:Function,  
    selectedProjectId:string, 
    projects:Project[],
    todos:Todo[],
    tags:string[],
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


    updateAreaName = debounce(
        (area:Area, value:string) : void => { 
            this.updateArea(area, {name:value});
        },
        50
    ) 
  

    attachTagToArea = (area:Area, tag:string) => {
        let attachedTags = uniq([tag, ...area.attachedTags]); 
        this.updateArea(area, {attachedTags})
    } 
    
 
    render(){
        let area = this.props.areas.find((a:Area) => this.props.selectedAreaId===a._id);
        
        return isNil(area) ? null :
        <div>  
            <div> 
                <AreaHeader
                    name={area.name}  
                    tags={this.props.tags}
                    rootRef={this.props.rootRef}
                    areas={this.props.areas}    
                    attachTagToArea={(tag:string) => this.attachTagToArea(area,tag)}
                    projects={this.props.projects}
                    todos={this.props.todos} 
                    selectedAreaId={this.props.selectedAreaId}
                    updateAreaName={(value:string) => this.updateAreaName(area,value)}
                    dispatch={this.props.dispatch}  
                />   
            </div> 
            <div> 
                <AreaBody  
                    area={area} 
                    selectedTodoId={this.props.selectedTodoId}
                    selectedCategory={this.props.selectedCategory}
                    todos={this.props.todos} 
                    tags={this.props.tags} 
                    selectedAreaId={this.props.selectedAreaId}
                    selectedProjectId={this.props.selectedProjectId}
                    searched={this.props.searched}
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



 

