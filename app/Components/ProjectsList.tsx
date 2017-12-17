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
import { Project } from '../databaseCalls';
import { stringToLength } from '../utils';

 
interface  ProjectsListProps{  
    dispatch:Function,
    projects:Project[]  
}  


interface  ProjectsListState{

}


export class ProjectsList extends Component<ProjectsListProps,ProjectsListState>{

    constructor(props){
        
        super(props);

    }  


    selectProject = (p:Project) => (e) => {

        this.props.dispatch({ type:"selectedProjectId", load:p._id });

    }


    getProjectLink = (value, index:number) => { 

        if(typeof value.name !== "string"){
             
           console.log(value, index) 
           throw new Error("Project name is not a string. getProjectLink.");  
 
        }
         
        return <li style={{width:"100%"}}>   

            <div 
                onClick = {this.selectProject(value)} 
                id = {value._id}   
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
                        <Circle />  
                    </IconButton> 

                    <div 
                    id = {value._id}   
                    style={{  
                        paddingLeft:"5px",
                        fontFamily: "sans-serif",
                        fontWeight: 600, 
                        color: "rgba(100,100,100,0.7)",
                        fontSize:"15px",  
                        whiteSpace: "nowrap",
                        cursor: "default",
                        WebkitUserSelect: "none" 
                    }}>   
                        { 
                            !isEmpty(value.name) ? 
                             stringToLength(value.name,15) :
                             "New Project" 
                        }
                    </div>    
 
            </div> 

        </li>    

    }



    createSortableItem = (index) => SortableElement(({value}) => this.getProjectLink(value,index)); 
            


    getProjectsList = (items:Project[]) => { 
            
        return <ul style={{padding:0,margin:0}}>   
            {     
                items.map(       
                    (item:Project, index) => { 
                        let SortableItem = this.createSortableItem(index); 
                        return <SortableItem  key={`item-${item._id}`} index={index} value={item} />
                    }
                ) 
            }   
        </ul>
    
    }    
                
             
         
    createSortableList = () => {
    
        const SortableList = SortableContainer(({items}) => this.getProjectsList(items),{withRef:true});

        return <SortableList
            shouldCancelStart={() => false}
            lockToContainerEdges={true}  
            distance={1}   
            items={this.props.projects}   
            axis='y'   
            lockAxis={'y'} 
            onSortEnd={({oldIndex, newIndex}) => {

            }} 
            onSortStart={() => {}}
        />
    
    }  
    


    render(){

        return <div   
            style={{
                display: "flex",  
                padding: "10px",  
                position:"relative", 
                flexDirection: "column" 
            }}  
        >  
            { this.createSortableList() }
        </div>

    }


}













