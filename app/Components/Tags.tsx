import './../assets/styles.css';  
import './../assets/calendarStyle.css';    
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import CircularProgress from 'material-ui/CircularProgress'; 
import { Component } from "react"; 
import { createStore, combineReducers } from "redux"; 
import { Provider, connect } from "react-redux"; 
import DayPicker from 'react-day-picker';
import { append, prepend } from 'ramda';
   


interface TagsProps{
    selectTag:(tag:string) => void,
    tags:string[],
    selectedTag:string,
    show:boolean
  } 
  
export class Tags extends Component<TagsProps,{}>{

  
 

    selectTagBackgroundColor = (tag,selectedTag) => {

        if(this.props.selectedTag==="All" && tag==="All"){

            return "dimgray";

        }else if(this.props.selectedTag==="High" && tag==="High"){

            return "red";
            
        }else if(this.props.selectedTag === tag && tag!=="All" && tag!=="High"){

            return "cornflowerblue";

        }else if(this.props.selectedTag !== tag){

            return "white";

        }
    
    }
  

    selectTagFontColor = (tag,selectedTag) => {


        if(this.props.selectedTag==="All" && tag==="All"){
            
            return "white";

        }else if(this.props.selectedTag==="High" && tag==="High"){

            return "white";
            
        }else if(this.props.selectedTag === tag && tag!=="All" && tag!=="High"){

            return "white";

        }else if(this.props.selectedTag !== tag){

            return "dimgray";

        }
    }  
      
  
      render(){
         return !this.props.show ? null :
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>  
                    {    
                        ["All",...this.props.tags.sort((a:string,b:string) : number => a.localeCompare(b))]
                        .map((tag:string) =>  
                            <div key={tag} style={{padding:"4px"}}> 
                                <div className="chip"      
                                    onClick={() => this.props.selectTag(tag)} 
                                    style={{
                                        width:"auto",
                                        height:"25px", 
                                        alignItems:"center",   
                                        display:"flex",
                                        paddingLeft:"5px",
                                        paddingRight:"5px", 
                                        cursor:"pointer",
                                        borderRadius:"100px", 
                                        backgroundColor:this.selectTagBackgroundColor(tag,this.props.selectedTag),
                                        color:this.selectTagFontColor(tag,this.props.selectedTag),                  
                                        fontWeight:700 
                                    }}     
                                >   
                                    <div style={{padding:"4px"}}>{tag}</div> 
                                </div> 
                            </div>   
                        )
                    }
                </div>
      }
  } 
  
   