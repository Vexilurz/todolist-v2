import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { Component } from "react";  
import { Project, Area, Todo } from '../../database';
import NewAreaIcon from 'material-ui/svg-icons/content/content-copy';
import { attachDispatchToProps } from '../../utils/utils'; 
import Restore from 'material-ui/svg-icons/content/undo';
import { contains, isEmpty, compose, map, flatten } from 'ramda';
import { Store } from '../../app';
import { connect } from "react-redux";
import { filter } from '../MainContainer';
import { assert } from '../../utils/assert';
import { isArrayOfTodos, isArrayOfProjects, isString } from '../../utils/isSomething';

interface AreaLinkProps extends Store{area : Area}
interface AreaLinkState{} 


@connect((store,props) => ({...store, ...props}), attachDispatchToProps) 
export class AreaLink extends Component<AreaLinkProps,AreaLinkState>{
    
    openArea = (e) => {
        let {area,dispatch} = this.props;
        e.stopPropagation();  
        dispatch({type:"selectedCategory", load:"area"});
        dispatch({type:"selectedAreaId", load:area._id});
    }

    render(){
        let {area} = this.props;

        return <li   
            onClick={this.openArea} 
            style={{width:"100%"}}
            key={`area-link-key-${area._id}`}
            className="listHeading"
        >    
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
                <div style={{display:"flex",alignItems:"center"}}>
                    <NewAreaIcon style={{color:"lightblue", width:"22px", height:"22px"}}/> 
                </div>
                <div style={{
                    overflowX:"hidden",
                    fontSize:"15px",     
                    cursor:"default",
                    paddingLeft:"5px", 
                    WebkitUserSelect:"none",
                    fontWeight:"bolder", 
                    color:"rgba(0, 0, 0, 0.8)" 
                }}>    
                    { isEmpty(area.name) ? "New Area" : area.name }   
                </div>  
            </div>
        </li>
    }
}
  


interface AreaTrashLinkProps extends Store{area : Area}
interface AreaTrashLinkState{}


@connect((store,props) => ({...store, ...props}), attachDispatchToProps) 
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
            type:"updateTodos", 
            load:selectedTodos.map((t:Todo) : Todo => ({...t,deleted:undefined}))
        });

        dispatch({
            type:"updateProjects", 
            load:selectedProjects.map((p:Project) : Project => ({...p,deleted:undefined}))
        });

        dispatch({type:"updateArea", load:{...area,deleted:undefined}});
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
                    <NewAreaIcon style={{color:"lightblue", width:"22px", height:"22px"}}/> 
                </div>
                <div style={{
                    overflowX:"hidden",
                    fontSize:"15px",     
                    cursor:"default",
                    paddingLeft:"5px", 
                    WebkitUserSelect:"none",
                    fontWeight:"bolder", 
                    color:"rgba(0, 0, 0, 0.8)" 
                }}>    
                    { isEmpty(area.name) ? "New Area" : area.name }   
                </div>  
            </div>
        </li>
    }
}
 
  
