import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, 
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, 
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, groupBy, concat 
} from 'ramda';
import '../assets/styles.css';  
import { Component } from "react"; 
import { DraggableCore, DraggableEventHandler, DraggableData } from 'react-draggable';
 

 
export interface Data{
    node: HTMLElement, 
    x: number, y: number, 
    deltaX: number, deltaY: number,
    lastX: number, lastY: number
};  

interface ResizableHandleProps{
  onDrag:(event, data : Data) => void
} 

export class ResizableHandle extends Component<ResizableHandleProps,{}>{
    ref;

    constructor(props){
        super(props);  
    }

    render(){

        return <DraggableCore
                    ref = {e => { this.ref = e;}}
                    allowAnyClick={false}
                    onStart={this.props.onDrag}
                    onDrag={this.props.onDrag}  
                    onStop={this.props.onDrag}    
                >   
                    <div style={{  
                        right:0,
                        top:0, 
                        zIndex:20000,
                        cursor:"e-resize",    
                        position:"absolute",  
                        backgroundColor:"rgba(0,0,0,0)",   
                        height:"100%",  
                        width:"5px",    
                        fontSize:"18px",   
                        color:"rgba(0,0,0,0)"
                    }}>      
                    </div> 
                </DraggableCore>
    }
} 