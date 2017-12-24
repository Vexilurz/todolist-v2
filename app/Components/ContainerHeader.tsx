import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { attachDispatchToProps, uppercase, chooseIcon, showTags } from "../utils"; 
import { Tags } from './Tags';
import { Category } from './MainContainer';

 

export interface ContainerHeaderProps{
    selectedCategory:Category, 
    dispatch:Function, 
    tags:string[],
    selectedTag:string
}  

 

export interface ContainerHeaderState{}
 


export class ContainerHeader extends Component<ContainerHeaderProps,ContainerHeaderState>{
 
    constructor(props){
        super(props);
    } 

    render(){
       
        return <div>
            <div style={{ width: "100%"}}> 
            <div style={{
                display:"flex", 
                position:"relative",
                alignItems:"center",
                marginBottom:"20px"  
            }}>  

                <div>  
                    {chooseIcon({width:"50px", height:"50px"},this.props.selectedCategory)}
                </div>

                <div style={{  
                    fontFamily: "sans-serif",  
                    fontSize: "xx-large",
                    fontWeight: 600,
                    paddingLeft: "10px",
                    WebkitUserSelect: "none",
                    cursor:"default" 
                }}>    
                    {uppercase(this.props.selectedCategory==="anytime" ? "next" : this.props.selectedCategory)}
                </div> 
            
            </div> 

            <Tags  
                selectTag={(tag) => this.props.dispatch({type:"selectedTag",load:tag})}
                tags={this.props.tags} 
                selectedTag={this.props.selectedTag}
                show={showTags(this.props.selectedCategory)} 
            /> 
        </div>  
        </div>

    } 

}