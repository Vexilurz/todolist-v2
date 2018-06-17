import './../assets/styles.css';  
import './../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react";   
import { Option } from './../types';
import { SimplePopup } from './SimplePopup';



interface OptionsPopupProps{
    title:string,
    message:string,
    options:Option[],
    onCancel:(e:any) => void,
    onClose:() => void
} 



interface OptionsPopupState{}



export class OptionsPopup extends Component<OptionsPopupProps,OptionsPopupState>{
    ref:HTMLElement; 

    constructor(props){
        super(props); 
    }   

    render(){ 
        return <SimplePopup
            show={true}
            onOutsideClick={this.props.onClose} 
        >   
            <div style={{
                backgroundColor:"rgba(0,0,0,0)",  
                zIndex:40000,  
                display:"flex",   
                alignItems:"center",  
                justifyContent:"center", 
                flexDirection:"column"   
            }}>  
                <div style={{   
                    borderRadius:"10px",
                    boxShadow:"0 0 18px rgba(0,0,0,0.5)", 
                    width:`${window.innerWidth/4}px`,   
                    minWidth:"180px",  
                    backgroundColor:"white" 
                }}> 
                    <div style={{display:"flex",alignItems:"center"}}>  
                        <div style={{  
                            display:"flex",
                            flexDirection:"column",
                            justifyContent:"flex-start",
                            padding:"10px",
                            width:"90%",
                            cursor:"default",
                            userSelect:"none" 
                        }}>
                            <div style={{ 
                                paddingBottom:"10px", 
                                fontWeight:"bold", 
                                fontSize:"15px", 
                                color:"rgba(0,0,0,1)",
                                textAlign:"center"
                            }}>    
                                {this.props.title}
                            </div>
                            <div style={{
                                fontSize:"14px",
                                color:"rgba(0,0,0,1)",
                                textAlign:"center",
                                wordWrap:"break-word"
                            }}>
                                {this.props.message}
                            </div>   
                        </div>
                    </div> 

                    <div style={{  
                        display:"flex",  
                        alignItems:"center", 
                        flexDirection:"column", 
                        justifyContent:"flex-end",
                        padding:"10px"
                    }}>
                        {
                            this.props.options.map( 
                                (option:Option, idx:number) => 
                                    <div key={`${option.title}-${idx}`} style={{padding: "2px"}}>
                                        <div     
                                            onClick={option.f} 
                                            style={{       
                                                width:"170px",
                                                display:"flex",
                                                alignItems:"center",
                                                cursor:"pointer",
                                                justifyContent:"center", 
                                                borderRadius:"5px",
                                                height:"25px",  
                                                backgroundColor:"rgb(10, 90, 250)"  
                                            }}  
                                        > 
                                                <div style={{color:"white", fontSize:"14px"}}>      
                                                    {option.title}
                                                </div>    
                                        </div>
                                    </div> 
                            )
                        }
                        <div style={{padding:"2px"}}>
                            <div     
                                onClick={this.props.onCancel} 
                                style={{      
                                    width:"170px", 
                                    display:"flex",
                                    alignItems:"center",
                                    cursor:"pointer",
                                    justifyContent:"center",
                                    borderRadius:"5px",
                                    height:"25px",  
                                    border:"1px solid rgba(100,100,100,0.2)",
                                    backgroundColor:"white" 
                                }}  
                            >   
                                <div style={{color:"rgba(0,0,0,0.9)", fontSize:"14px"}}>  
                                    Cancel
                                </div>    
                            </div>  
                        </div> 
                    </div> 
                </div>   
            </div>  
        </SimplePopup>    
    }
} 
 
   