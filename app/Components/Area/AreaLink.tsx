import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { Component } from "react";  
import { Project, Area, Todo, Store } from '../../types';
import NewAreaIcon from 'material-ui/svg-icons/content/content-copy';
import { attachDispatchToProps } from '../../utils/utils'; 
import Restore from 'material-ui/svg-icons/content/undo';
import { contains, isEmpty, compose, map, flatten } from 'ramda';
import { filter } from 'lodash';
import { assert } from '../../utils/assert';
import { isArrayOfTodos, isArrayOfProjects, isString } from '../../utils/isSomething';



interface AreaTrashLinkProps{
    dispatch:Function,
    projects:Project[],
    todos:Todo[],
    area:Area
} 


interface AreaTrashLinkState{}


export class AreaTrashLink extends Component<AreaTrashLinkProps,AreaTrashLinkState>{
    


    restoreArea = () : void => {  
        let {area, projects, todos, dispatch} = this.props;

        //projects attached to area
        let selectedProjects : Project[] = filter(projects,(p:Project) => contains(p._id)(area.attachedProjectsIds)); 

        //todos attached to projects which attached to area to be removed
        let selectedTodos : Todo[] = compose(
            (ids:string[]) => filter(todos, (t) => contains(t._id)(ids)),
            flatten,
            (selectedProjects) => selectedProjects.map((p:Project) => p.layout.filter(isString))
        )(selectedProjects);
         
        assert(isArrayOfTodos(selectedTodos),`selectedTodos is not of type Todo[]. restoreArea. ${selectedTodos}`);
        assert(isArrayOfProjects(selectedProjects),`selectedProjects is not of type Project[]. restoreArea. ${selectedProjects}`);
        
        dispatch({
            type:"multiple",
            load:[
                {
                    type:"updateTodos", 
                    load:selectedTodos.map(t => ({...t,deleted:undefined}))
                },
                {
                    type:"updateProjects", 
                    load:selectedProjects.map(p => ({...p,deleted:undefined}))
                },
                { 
                    type:"updateArea", 
                    load:{...area,deleted:undefined}
                }
            ]
        }); 
    };



    render(){
        let {area} = this.props;

        return <li style={{width:"100%"}} key={`area-link-key-${area._id}`}>    
            <div      
                id = {area._id}   
                style={{   
                    height:"30px",
                    width:"95%",
                    display:"flex", 
                    paddingLeft:"6px", 
                    paddingRight:"6px", 
                    alignItems:"center" 
                }}
            >       
                <div       
                    onClick={(e) => this.restoreArea()}  
                    style={{ 
                        display:"flex",
                        cursor:"pointer",
                        alignItems:"center", 
                        height:"14px",
                        paddingLeft:"20px",
                        paddingRight:"5px"  
                    }} 
                >  
                    <Restore style={{width:"20px", height:"20px"}}/> 
                </div>  
                <div style={{display:"flex",alignItems:"center"}}>
                    <NewAreaIcon
                        style={{
                           color:"rgb(159, 159, 159)", //"lightblue", 
                           width:"22px", 
                           height:"22px"
                        }}
                    /> 
                </div>
                <div style={{ 
                    overflowX:"hidden",
                    fontSize:"16px",
                    cursor:"default",
                    paddingLeft:"3px",
                    userSelect:"none"
                }}>    
                    { isEmpty(area.name) ? "New Area" : area.name }   
                </div>  
            </div>
        </li>
    }
};
 
  
