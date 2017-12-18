import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import NewAreaIcon from 'material-ui/svg-icons/action/tab';
  

interface AreaComponentProps{}

interface AreaComponentState{}
 

export class AreaComponent extends Component<AreaComponentProps,AreaComponentState>{

    constructor(props){
        super(props); 
    }
 

    render(){
        return <div>
            
        </div>
    }

} 


 

