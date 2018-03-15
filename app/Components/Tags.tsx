import './../assets/styles.css';  
import './../assets/calendarStyle.css';    
import * as React from 'react'; 
import * as ReactDOM from 'react-dom';  
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import CircularProgress from 'material-ui/CircularProgress'; 
import { Component } from "react"; 
import { createStore, combineReducers } from "redux"; 
import DayPicker from 'react-day-picker';
import { append, prepend, contains, not, isEmpty } from 'ramda';
   


interface TagsProps{
    selectTag:(tag:string) => void,
    tags:string[],
    selectedTag:string,
    show:boolean
} 
export class Tags extends Component<TagsProps,{}>{

    componentWillReceiveProps(nextProps:TagsProps){
        if(!contains(nextProps.selectedTag)(nextProps.tags)){
            nextProps.selectTag("All") 
        } 
    }  

  
    render(){
         let { show, tags, selectTag, selectedTag } = this.props; 
          
         return not(show) ? null :
                isEmpty(tags) ? null :
                <div 
                style={{  
                    display:'flex', 
                    flexWrap:'wrap',
                    WebkitUserSelect:"none",
                    paddingBottom:"20px" 
                }}>  
                    {    
                        ["All",...tags.sort((a:string,b:string) : number => a.localeCompare(b))]
                        .map((tag:string) =>  
                            <div key={tag} style={{padding:"4px"}}> 
                                <div className="chip"       
                                    onClick={() => { 
                                        if(tag===selectedTag){ selectTag("All") }
                                        else{ selectTag(tag) } 
                                    }} 
                                    style={{ 
                                        width:"auto",
                                        height:"20px", 
                                        alignItems:"center",   
                                        display:"flex",
                                        paddingLeft:"5px",
                                        paddingRight:"5px",  
                                        cursor:"pointer",
                                        borderRadius:"100px", 
                                        backgroundColor:tag===selectedTag ? "dimgray" : "white",
                                        color:tag===selectedTag ? "white" : "dimgray",                  
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
  
   