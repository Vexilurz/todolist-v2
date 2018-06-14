import 'react-tippy/dist/tippy.css'
import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';
import { Component } from "react";  
import Checked from 'material-ui/svg-icons/navigation/check';
import { 
    daysLeftMark, getMonthName, getCompletedWhen, different, 
    isNotEmpty, log, anyTrue, attachDispatchToProps 
} from '../../utils/utils'; 
import {  
    uniq, isEmpty, contains, isNil, not, multiply, remove, cond, ifElse,
    equals, any, complement, compose, defaultTo, path, prop, always,
    identity, when
} from 'ramda';
import 'draft-js/dist/Draft.css';

interface CheckboxProps{
    checked:boolean,
    onClick:Function  
}

export class Checkbox extends Component<CheckboxProps,{}>{
    ref:HTMLElement; 

    constructor(props){
        super(props); 
    } 



    shouldComponentUpdate(nextProps:CheckboxProps){
        return nextProps.checked!==this.props.checked;
    }



    componentDidMount(){
        if(this.ref){
           this.ref["preventDrag"] = true; 
        }
    }  


    
    componentWillReceiveProps(){
        if(this.ref){
           this.ref["preventDrag"] = true; 
        }
    }



    render(){
        return <div    
            ref={(e) => {this.ref=e;}} 
            onClick = {(e) => {
                e.stopPropagation(); 
                e.nativeEvent.stopImmediatePropagation();
                this.props.onClick();
            }}
            onMouseDown= {(e) => { 
                e.stopPropagation(); 
                e.nativeEvent.stopImmediatePropagation();
            }} 
            style={{   
                width:"14px",   
                borderRadius:"3px",  
                backgroundColor:this.props.checked ? "rgb(32, 86, 184)" : "",
                border:this.props.checked ? "" : "1px solid rgba(100,100,100,0.5)",
                height:"14px",
                boxSizing:"border-box",
                display:"flex",
                alignItems:"center"    
            }}  
        >      
            { this.props.checked ? <Checked style={{color:"white"}}/> : null }
        </div> 
    }
};



