import '../../assets/styles.css';  
import * as React from 'react';
import { Project } from '../../types';
import { isEmpty } from 'ramda';
import PieChart from 'react-minimal-pie-chart';



export let getProjectHeading = (
    project:Project, 
    indicator:{
        active:number,
        completed:number,
        deleted:number
    }
) : JSX.Element => {
    let done = indicator.completed;
    let left = indicator.active;
    let totalValue = (done+left)===0 ? 1 : (done+left);
    let currentValue = done;

    return <div   
        id = {project._id}        
        style={{    
            height:"30px",   
            paddingLeft:"6px", 
            paddingRight:"6px",  
            cursor:"default",
            width:"100%",
            display:"flex",  
            alignItems:"center", 
            overflowX:"hidden", 
            borderBottom:"1px solid rgba(100, 100, 100, 0.6)"
        }}
    >     
        <div style={{     
            marginLeft:"1px",
            width:"18px",
            height:"18px",
            position: "relative",
            borderRadius: "100px",
            display: "flex",
            justifyContent: "center",
            transform: "rotate(270deg)",
            cursor:"default",
            alignItems: "center",
            border: "1px solid rgb(108, 135, 222)",
            boxSizing: "border-box" 
        }}> 
            <div style={{
                width: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center", 
                cursor:"default",
                justifyContent: "center",
                position: "relative" 
            }}>  
                <PieChart 
                    animate={false}    
                    totalValue={totalValue}
                    data={[{      
                        value:currentValue, 
                        key:1,  
                        color:"rgb(108, 135, 222)" 
                    }]}    
                    style={{  
                        color: "rgb(108, 135, 222)",
                        width: "12px",
                        height: "12px",
                        position: "absolute",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"  
                    }}
                />     
            </div>
        </div> 
        <div   
            id = {project._id}   
            style={{   
                fontFamily: "sans-serif",
                fontSize: "15px",    
                cursor: "default",
                paddingLeft: "5px", 
                WebkitUserSelect: "none",
                fontWeight: "bolder", 
                color: "rgba(0, 0, 0, 0.8)" 
            }}
        >    
            { isEmpty(project.name) ? "New Project" : project.name } 
        </div> 
    </div>
};

