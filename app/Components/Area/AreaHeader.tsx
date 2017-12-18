import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import NewAreaIcon from 'material-ui/svg-icons/action/tab';

 


interface AreaHeaderProps{}

interface AreaHeaderState{}
  
export class AreaHeader extends Component<AreaHeaderProps,AreaHeaderState>{
 
    constructor(props){
        super(props);
    }
 

    render(){ 
        return <div>
            <NewAreaIcon style={{
                color:"lightblue", 
                width:"50px", 
                height:"50px"
            }}/>   
        </div>  
    }

}