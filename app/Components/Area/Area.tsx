import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import NewAreaIcon from 'material-ui/svg-icons/action/tab';
import { Area, Project, Todo } from '../../database';
import { AreaHeader } from './AreaHeader';
import { AreaBody } from './AreaBody';
import { debounce } from '../../utils';
  
 
interface AreaComponentProps{
    areas:Area[],
    selectedAreaId:string,
    dispatch:Function,  
    projects:Project[],
    todos:Todo[],
    tags:string[],
    rootRef:HTMLElement 
} 

 
 
interface AreaComponentState{
    area:Area 
}
 
 

export class AreaComponent extends Component<AreaComponentProps,AreaComponentState>{
     

    constructor(props){ 

        super(props); 
         
        this.state = {
            area:undefined
        };

    }
 

 
    selectArea = (props:AreaComponentProps) : void => {

        let area = props.areas.find( 
            (a:Area) => props.selectedAreaId===a._id
        );
 
        this.setState({area});
        
    }  


 
    componentDidMount(){
        
        this.selectArea(this.props); 

    }

  

    componentWillReceiveProps(nextProps:AreaComponentProps){
        
        let selectArea = false;

        if(nextProps.areas!==this.props.areas)
           selectArea = true;
            

        if(nextProps.selectedAreaId!==this.props.selectedAreaId)   
           selectArea = true;
          

        if(selectArea)      
           this.selectArea(nextProps);    
          
    }



    updateArea = (selectedArea:Area, updatedProps) : void => { 
         
        let type = "updateArea"; 
     
        let load = { ...selectedArea, ...updatedProps };

        this.props.dispatch({ type, load });

    }



    updateAreaName = debounce((value:string) : void => { 

        this.updateArea(this.state.area, {name:value});
    
    },200)
  
 
 
    render(){

        return !this.state.area ? null :
        <div> 
            <div>
                <AreaHeader
                    name={this.state.area.name}  
                    areas={this.props.areas}  
                    selectedAreaId={this.props.selectedAreaId}
                    updateAreaName={this.updateAreaName}
                    dispatch={this.props.dispatch} 
                /> 
            </div>
            <div> 
                <AreaBody 
                    area={this.state.area} 
                    projects={this.props.projects}
                    todos={this.props.todos}
                    tags={this.props.tags}
                    rootRef={this.props.rootRef}
                    dispatch={this.props.dispatch}
                />
            </div>  
        </div>

    }

} 



 

