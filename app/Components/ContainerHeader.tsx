import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { Tags } from './Tags';
import { Category } from './MainContainer';
import { chooseIcon } from '../utils/chooseIcon';
import { uppercase } from '../utils/uppercase';


export interface ContainerHeaderProps{
    selectedCategory:Category, 
    dispatch:Function, 
    tags:string[],
    showTags:boolean,
    selectedTag:string
}  

 

export interface ContainerHeaderState{}
 


export class ContainerHeader extends Component<ContainerHeaderProps,ContainerHeaderState>{
 
    constructor(props){
        super(props);
    } 

    render(){
       
        return <div style={{width:"100%",WebkitUserSelect:"none"}}> 
            <div style={{
                display:"flex", 
                position:"relative",
                alignItems:"center",
                marginBottom:"20px"  
            }}>  
                <div style={{zoom:"0.8", display:"flex", alignItems:"center"}}>  
                    {chooseIcon({width:"45px", height:"45px"}, this.props.selectedCategory)}
                </div>
                <div style={{  
                    fontFamily:"sans-serif",  
                    fontSize:"xx-large",
                    fontWeight:600,
                    paddingLeft:"10px",
                    WebkitUserSelect:"none", 
                    cursor:"default" 
                }}>    
                    {uppercase(this.props.selectedCategory)}
                </div> 
            </div>  
            <div className={`no-print`}>        
                <Tags  
                    selectTag={(tag) => this.props.dispatch({type:"selectedTag",load:tag})}
                    tags={this.props.tags} 
                    selectedTag={this.props.selectedTag} 
                    show={this.props.showTags} 
                />   
            </div>  
        </div> 
    } 
}