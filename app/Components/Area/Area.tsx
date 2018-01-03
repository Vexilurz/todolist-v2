import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import NewAreaIcon from 'material-ui/svg-icons/maps/layers';
import { Area, Project, Todo } from '../../database'; 
import { AreaHeader } from './AreaHeader';
import { AreaBody } from './AreaBody';
import { debounce } from '../../utils';
import { Category } from '../MainContainer';
import { uniq } from 'ramda';
  
 
interface AreaComponentProps{
    areas:Area[],  
    selectedCategory:Category, 
    selectedAreaId:string,
    selectedTodoId:string, 
    searched:boolean, 
    selectedTag:string, 
    dispatch:Function,  
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
        this.props.dispatch({ type, load });
    }



    updateAreaName = (area:Area) => debounce(
        (value:string) : void => { 
            this.updateArea(area, {name:value});
        },
        50
    ) 
  

    attachTagToArea = (area:Area) => (tag:string) => {
        let attachedTags = uniq([tag, ...area.attachedTags]); 
        this.updateArea(area, {attachedTags})
    } 
    
 
    render(){
        let area = this.props.areas.find( 
            (a:Area) => this.props.selectedAreaId===a._id
        );
 
        return !area ? null :
        <div>  
            <div>
                <AreaHeader
                    name={area.name}  
                    tags={this.props.tags}
                    rootRef={this.props.rootRef}
                    areas={this.props.areas}    
                    attachTagToArea={this.attachTagToArea(area)}
                    projects={this.props.projects}
                    todos={this.props.todos} 
                    selectedAreaId={this.props.selectedAreaId}
                    updateAreaName={this.updateAreaName(area)}
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



 

