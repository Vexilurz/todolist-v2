import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import ShowMenu from 'material-ui/svg-icons/navigation/unfold-more';  
import { uppercase } from '../../utils/uppercase';


interface ToggleTopMenuButtonProps{
    setRef:(e:any) => void,
    onClick:(e:any) => void,
    collapsed:boolean,
    toggled:boolean,
    title:string,
}


interface ToggleTopMenuButtonState{}


export class ToggleTopMenuButton extends Component<ToggleTopMenuButtonProps,ToggleTopMenuButtonState>{

    constructor(props){  
        super(props);  
    } 

    render(){
        return <div 
            onClick={this.props.onClick}
            ref={this.props.setRef}
            style={{
                padding:"5px",
                border:this.props.toggled ? 
                       "1px solid rgba(150,150,150,0)" : 
                       "1px solid rgba(150,150,150,0.1)",
                backgroundColor:this.props.toggled ? "rgba(100,100,100,0.1)" : "white",
                borderRadius:"5px",
                height:"15px",
                width:"100px",
                cursor:"pointer",
                position:"relative",
                display:"flex",
                alignItems:"center",
                justifyContent:"space-between"
            }}
        >
            <div style={{
                whiteSpace:"nowrap",
                overflow:"hidden",
                paddingLeft:"7px",
                fontSize:"15px", 
                userSelect:"none", 
                fontWeight:500, 
                color:"rgba(100,100,100,0.6)"
            }}>
                { uppercase(this.props.title) }
            </div>
            <ShowMenu style={{color:"rgba(100,100,100,0.5)", height:"18px", width:"18px"}}/>
        </div>
    }
}

