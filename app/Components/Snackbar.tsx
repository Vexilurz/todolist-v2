import '../assets/styles.css';  
import '../assets/calendarStyle.css';  
import * as React from 'react';  
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import Popover from 'material-ui/Popover';
import { Transition } from 'react-transition-group';
import Restore from 'material-ui/svg-icons/navigation/refresh'; 
import { uniq, compose, contains, allPass, isNil, not, isEmpty } from 'ramda';
import { isString } from 'util';
import { insideTargetArea, attachDispatchToProps } from '../utils';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { Store } from '../app';
 

interface SnackbarProps extends Store{}  
interface SnackbarState{
    open:boolean 
}     
   
@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)
export class Snackbar extends Component<SnackbarProps,SnackbarState>{

    ref:HTMLElement; 

    constructor(props){ 
        super(props);
        this.state = {
            open : false
        } 
    }    
    
    componentDidMount(){
        this.setState({open:true})
    }    

    componentWillUnmount(){ } 
  
    installUpdate = () => { 
       setInterval(() => this.setState({open:!this.state.open}, () => console.log(this.state.open)), 1000)
    }

    cancelUpdate = () => { }

    render(){ 
        return <div style={{ 
            width:"100%",
            position:"fixed",
            zIndex:4000000,
            left:0,   
            top:0, 
            overflow:"hidden",
            transition:"max-height 0.5s ease-in-out",
            maxHeight:this.state.open ? "40px" : "0px", 
            justifyContent:"center",
            alignItems:"center",  
            backgroundColor:"#FFF9C4",
            display:"flex"
        }}> 
        <div style={{
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            paddingTop:"10px",
            width:"100%",
            position:"relative", 
            paddingBottom:"10px",
            overflow:"hidden", 
            transition:"max-height 0.5s ease-in-out",
            maxHeight:this.state.open ? "40px" : "0px"
        }}>
            <div       
                ref={(e) => { this.ref=e; }}
                onClick = {(e) => { 
                    e.stopPropagation();
                    e.preventDefault();
                }}   
                style={{
                    cursor:"default",
                    display:"flex",
                    alignItems:"center", 
                    userSelect:"none",
                    color:"rgba(100,100,100,1)",
                    fontWeight:500
                }}            
            >        
                An update is available!
            </div>
            <div style={{
                display:"flex",
                position:"absolute",
                right:0,
                alignItems:"center"
            }}>
            <div     
                onClick={this.installUpdate}
                style={{      
                    display:"flex",
                    marginLeft:"15px", 
                    marginRight:"15px",
                    alignItems:"center",
                    cursor:"pointer",
                    justifyContent:"center",
                    height:"20px",
                    paddingLeft:"25px",
                    paddingRight:"25px",
                    paddingTop:"5px", 
                    paddingBottom:"5px",
                    backgroundColor:"rgba(81, 144, 247, 1)"  
                }}    
            >   
                <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px"}}>  
                    Install 
                </div>   
            </div> 
            <div     
                onClick={this.cancelUpdate}
                style={{     
                    display:"flex",
                    marginLeft:"15px", 
                    marginRight:"15px",
                    alignItems:"center",
                    cursor:"pointer",
                    justifyContent:"center",
                    height:"20px",
                    paddingLeft:"25px",
                    paddingRight:"25px",
                    paddingTop:"5px", 
                    paddingBottom:"5px",
                    backgroundColor:"rgba(81, 144, 247, 1)"  
                }}  
            >    
                <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px"}}>  
                    Later
                </div>   
            </div> 
            </div> 
          </div> 
        </div>
    } 
} 