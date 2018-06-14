import 'react-tippy/dist/tippy.css'
import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react";  
import { isNil } from 'ramda';
import Restore from 'material-ui/svg-icons/content/undo';
import 'draft-js/dist/Draft.css';

interface RestoreButtonProps{
    deleted:boolean,
    open:boolean, 
    onClick:Function 
}
export class RestoreButton extends Component<RestoreButtonProps,{}>{
    constructor(props){
        super(props); 
    } 



    shouldComponentUpdate(nextProps:RestoreButtonProps){
        return nextProps.deleted!==this.props.deleted ||
               nextProps.open!==this.props.open; 
    }


 
    render(){ 
        let {deleted,open,onClick} = this.props;

        if(isNil(deleted)){ return null } 
        if(open){ return null }  

        return <div   
            style={{display:"flex",cursor:"pointer",alignItems:"center",height:"14px"}}           
            onClick={(e) => {
                e.stopPropagation(); 
                onClick(); 
            }}
        > 
            <Restore style={{width:"20px",height:"20px"}}/> 
        </div> 
    }
};
 