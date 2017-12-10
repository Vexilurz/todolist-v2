import '../assets/styles.css';  
import '../assets/calendarStyle.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, uniq,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, any,
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, 
    groupBy, concat, flatten, toPairs, adjust, prepend, fromPairs 
} from 'ramda';
import { ipcRenderer } from 'electron';
import { Component } from "react"; 

  
export class Area extends Component<any,any>{

    constructor(props){
        super(props); 
    }


    render(){
        return <div></div>;
    }

} 