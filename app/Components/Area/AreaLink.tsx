import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { Component } from "react";  
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import IconButton from 'material-ui/IconButton'; 
import { Project, Area, Todo } from '../../database';
import NewAreaIcon from 'material-ui/svg-icons/maps/layers';
import { stringToLength, chooseIcon } from '../../utils'; 
import Restore from 'material-ui/svg-icons/content/undo';
import { contains, isEmpty } from 'ramda';

   
export let getAreaLink = (
    a:Area, todos:Todo[], projects:Project[], index:number, dispatch:Function
) : JSX.Element => {
    let restoreArea = (a:Area) : void => { 

        let relatedTodosIds : string[] = a.attachedTodosIds;
        let relatedProjectsIds : string[] = a.attachedProjectsIds;

        let selectedProjects : Project[] = projects.filter((p:Project) : boolean => contains(p._id,relatedProjectsIds));    
        let selectedTodos : Todo[] = todos.filter((t:Todo) : boolean => contains(t._id,relatedTodosIds));   
        
        dispatch({type:"updateTodos",load:selectedTodos.map((t:Todo) => ({...t,deleted:undefined}))})
        dispatch({type:"updateProjects",load:selectedProjects.map((p:Project) => ({...p,deleted:undefined}))})
        dispatch({type:"updateArea", load:{...a,deleted:undefined}});
    }
            
    let openArea = (e) => {
        e.stopPropagation();  
        if(a.deleted){ return }
        dispatch({type:"selectedCategory",load:"area"});
        dispatch({type:"selectedAreaId",load:a._id});
    }

    return <li   
        onClick={this.openArea} 
        style={{width:"100%"}}
        key={index}
        className="listHeading"
    >   
        <div      
            id = {a._id}   
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
                {  
                    !a.deleted ? null :  
                    <div       
                        onClick={(e) => restoreArea(a)}  
                        style={{ 
                            display:"flex",
                            cursor:"default",
                            alignItems:"center",
                            height:"14px",
                            paddingLeft:"20px",
                            paddingRight:"5px"  
                        }} 
                    >  
                        <Restore style={{width:"20px", height:"20px"}}/> 
                    </div>  
                }  
                <div>
                    <IconButton  
                        style={{
                            width:"26px", height:"26px", padding: "0px",
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}    
                        iconStyle={{color:"lightblue", width:"26px", height:"26px"}}  
                    >    
                        <NewAreaIcon /> 
                    </IconButton>  
                </div> 
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
                { isEmpty(a.name) ? "New Area" : a.name }   
            </div>  
        </div>
    </li>
}
 
  