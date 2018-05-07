import '../../assets/styles.css';   
import * as React from 'react';  
import * as ReactDOM from 'react-dom';  
import { Component } from "react"; 
import { Category } from '../../types';
import Moon from 'material-ui/svg-icons/image/brightness-3';
import Chip from 'material-ui/Chip';
import { chooseIcon } from '../../utils/chooseIcon';


interface TodoInputLabelProps{
    onRemove:Function,
    category:Category,
    content:JSX.Element 
} 


interface TodoInputLabelState{} 


export class TodoInputLabel extends Component<TodoInputLabelProps, TodoInputLabelState>{

    constructor(props){
        super(props); 
    }

 
    render(){
        let containerStyle : any = {
            display: "flex",
            alignItems: "center",
            color: "rgba(0,0,0,1)",
            fontWeight: "bold", 
            cursor: "default",
            marginLeft: "2px",
            marginRight: "2px",
            userSelect: "none"
        };
 
           
        return  <Chip 
                    onRequestDelete={this.props.onRemove}
                    onClick={(e) => {}}
                    style={{backgroundColor:"",background:"",transform:"scale(0.9,0.9)"}}  
                >
                    <div style={containerStyle}>
                        {chooseIcon({height: "25px", width: "25px"}, this.props.category)} 
                        {this.props.content}
                    </div>
                </Chip>
    }
  
}

