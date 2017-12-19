import './../assets/styles.css';  
import './../assets/calendarStyle.css';    
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, uniq,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, any,
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, 
    groupBy, concat, flatten, toPairs, adjust, prepend, fromPairs 
} from 'ramda';
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import CircularProgress from 'material-ui/CircularProgress'; 
import { Component } from "react"; 
import { createStore, combineReducers } from "redux"; 
import { Provider, connect } from "react-redux"; 
import DayPicker from 'react-day-picker';
   
 

  

/*
<Tags 
    selectTag={(tag) => this.setState({selectedTag:tag})}
    tags={this.props.tags}
    selectedTag={this.props.selectedTag}
    show={true}
/> 
*/


interface TagsProps{
    selectTag:(tag:string) => void,
    tags:string[],
    selectedTag:string,
    show:boolean
  } 
  
  export class Tags extends Component<TagsProps,{}>{
  

      constructor(props){
          super(props);
      }


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
                 <div style={{
                    display: 'flex',
                    flexWrap: 'wrap'
                 }}>  
                    { 
                        compose(      
                            map((tag:string) =>  
                                <div key={tag} style={{padding:"10px"}}>
                                    <div className="chip"    
                                        onClick={() => this.props.selectTag(tag)} 
                                        style={{
                                            width: "auto",
                                            height: "30px",
                                            alignItems: "center",
                                            display: "flex",
                                            cursor: "pointer",
                                            borderRadius: "100px", 
                                            backgroundColor: this.selectTagBackgroundColor(tag,this.props.selectedTag),
                                            color:this.selectTagFontColor(tag,this.props.selectedTag),                  
                                            fontWeight: 700, 
                                            fontFamily: "sans-serif"  
                                        }}  
                                    >  
                                        <div style={{padding:"10px"}}>{tag}</div> 
                                    </div> 
                                </div>   
                            ),
                            prepend("All")
                        )(this.props.tags) 
                    }
                 </div>
      }
  } 
  
  