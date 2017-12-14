import '../assets/styles.css';  
import '../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, uniq,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, any,
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, 
    groupBy, concat, flatten, toPairs, adjust, prepend, fromPairs 
} from 'ramda';
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import SortableContainer from '../sortable-hoc/sortableContainer';
import SortableElement from '../sortable-hoc/sortableElement';
import SortableHandle from '../sortable-hoc/sortableHandle';
import {arrayMove} from '../sortable-hoc/utils';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import IconButton from 'material-ui/IconButton'; 
import { Project, Area } from '../databaseCalls';
import NewAreaIcon from 'material-ui/svg-icons/action/tab';
import { ProjectsList } from './ProjectsList';
import { stringToLength } from '../utils';

 
interface AreasListProps{ 
    dispatch:Function,
    areas:Area[],
    projects:Project[]    
}  


interface AreasListState{

} 


export class AreasList extends Component<AreasListProps,AreasListState>{

    constructor(props){
        
        super(props);

    }


    selectArea = (a:Area) => (e) => {
        this.props.dispatch({
            type:"selectedArea",
            load:a
        }) 
    }
        
   
  
 
    render(){
 
        return  <div  
            style={{display: "flex", flexDirection: "column", padding:"10px"}}
            id="areas"    
        >  
        
            {
                this.props.areas.map((a) => 
                 
                    <div   
                        key={a._id}
                        style={{display:"flex", flexDirection:"column"}}
                    >
  

                        <div 
                            onClick = {this.selectArea(a)}
                            className="toggleFocus" 
                            style={{  
                                marginLeft:"4px",
                                marginRight:"4px", 
                                height:"20px",
                                width:"95%",
                                display:"flex",
                                alignItems: "center"  
                            }}
                        >     

                                <IconButton  
                                    style={{
                                        width:"28px",
                                        height:"28px",
                                        padding: "0px",
                                        display: "flex",
                                        alignItems: "center", 
                                        justifyContent: "center"
                                    }}    
                                    iconStyle={{
                                        color:"rgba(109,109,109,0.4)",
                                        width:"18px",
                                        height:"18px"
                                    }}  
                                >   
                                    <NewAreaIcon />
                                </IconButton> 

                                <div style={{
                                    fontFamily: "sans-serif",
                                    fontSize: "15px",    
                                    cursor: "default",
                                    paddingLeft: "5px", 
                                    WebkitUserSelect: "none",
                                    fontWeight: "bolder", 
                                    color: "rgba(100, 100, 100, 1)"
                                }}>   
                                    {stringToLength(a.name,18)} 
                                </div>  

                        </div>


                        <div>            
                            <ProjectsList 
                                dispatch={this.props.dispatch}
                                projects={
                                  this.props.projects.filter( (p:Project) => contains(p._id, a.attachedProjectsIds) ) 
                                } 
                            />           
                        </div>


                    </div>

                )
            }

         </div>

    }


}













