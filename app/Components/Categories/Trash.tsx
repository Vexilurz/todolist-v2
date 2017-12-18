import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer } from 'electron';
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import Popover from 'material-ui/Popover';
import Button from 'material-ui-next/Button'; 
import { Footer } from '../../Components/Footer';
import { Tags } from '../../Components/Tags';
import { Transition } from 'react-transition-group';
import { TodosList } from '../../Components/TodosList';
import { Todo } from '../../database';
   
  
export class Trash extends Component<any,any>{

    constructor(props){
        super(props);
    }


    render(){  
        return <div></div>;
    }

} 