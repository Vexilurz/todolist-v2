import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';   
import { Component } from "react"; 
import { DraggableCore } from 'react-draggable';
 
 
 
export interface Data{
    node: HTMLElement, 
    x: number, y: number, 
    deltaX: number, deltaY: number,
    lastX: number, lastY: number
};  

interface ResizableHandleProps{
  onDrag:(event, data : Data) => void
  onStart:(event, data : Data) => void
  onStop:(event, data : Data) => void
} 

export class ResizableHandle extends Component<ResizableHandleProps,{}>{
    ref;

    shouldComponentUpdate(nextProps){
        return false;
    }
 
    constructor(props){
        super(props);  
    }

    render(){

        return <DraggableCore
                    ref = {e => { this.ref = e;}}
                    allowAnyClick={false}
                    onStart={(event, data : Data) => {
                        this.props.onStart(event,data);
                        this.props.onDrag(event,data);
                    }}
                    onDrag={this.props.onDrag}  
                    onStop={(event, data : Data) => {
                        this.props.onStop(event,data);
                        this.props.onDrag(event,data);
                    }}    
                >   
                    <div style={{  
                       touchAction: "none",
                       WebkitUserSelect:"none",
                       zIndex: 20000, 
                       cursor: "e-resize",
                       position: "relative",
                       backgroundColor: "rgba(0, 0, 0, 0)",
                       height: "100%",
                       width: "10px",
                       fontSize: "18px",
                       color: "rgba(0, 0, 0, 0)"
                    }}>      
                    </div> 
                </DraggableCore>
    }
} 