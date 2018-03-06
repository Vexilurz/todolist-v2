import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react";  
import Clear from 'material-ui/svg-icons/content/clear';
import { compose, uniq, flatten, concat, isNil, not, prop, isEmpty } from 'ramda';
import { uppercase } from '../../utils/uppercase';
import AutosizeInput from 'react-input-autosize';


interface TodoTagsProps{
    tags:string[],
    attachTag:(tag:string) => void,
    removeTag:(tag:string) => void,
    closeTags:() => void
}    

interface TodoTagsState{
    tag:string
}
 
export class TodoTags extends Component<TodoTagsProps,TodoTagsState>{

    constructor(props){
        super(props);
        this.state={ tag:'' };  
    } 
    
    
    onKeyPress = (e) => { 
        let {tags,closeTags,attachTag} = this.props;
        let {tag} = this.state;
        e.stopPropagation(); 

        if(e.which===13 || e.keyCode===13){
            attachTag(tag);
            this.setState({tag:''}); 
        }else if(e.which===8 || e.keyCode===8){
            if(tag==='' && isEmpty(tags)){ closeTags() } 
        }    
    };
    

    onRemoveTag = (tag:string) => () => {
        let {closeTags,tags,removeTag} = this.props;

        if(tags.length<=1){ 
           closeTags(); 
        }
        removeTag(tag);
    };
    
    
    render(){
        let {attachTag} = this.props;
        let {tag} = this.state;

        return <div
          onClick={(e) => {e.stopPropagation();}} 
          style={{display:"flex",paddingTop:"5px",paddingBottom:"5px",flexWrap:"wrap"}}
        >
            {      
                this.props.tags
                .sort((a:string,b:string) : number => a.localeCompare(b))
                .map( 
                    (tag:string, index:number) => 
                    <div  
                        key={`${tag}-${index}`} 
                        style={{ 
                            paddingLeft:"4px", 
                            paddingRight:"4px", 
                            paddingTop:"4px",  
                            cursor:"default",  
                            WebkitUserSelect:"none"
                        }}   
                    > 
                        <div 
                            style={{
                                borderRadius:"15px", 
                                backgroundColor:"rgb(189,219,209)",
                                paddingLeft:"5px",
                                paddingRight:"5px",
                                display:"flex"   
                            }}
                        >
                            <div 
                                style={{  
                                    height:"15px",
                                    display:"flex",
                                    alignItems:"center",
                                    padding:"4px", 
                                    color:"rgb(115,167,152)",
                                    fontWeight: 600    
                                }} 
                            > 
                                {uppercase(tag)} 
                            </div> 
                            <div  
                              style={{padding:"2px",alignItems:"center",display:"flex",cursor:"pointer"}} 
                              onClick={this.onRemoveTag(tag)}
                            >
                                <Clear style={{color:"rgba(100,100,100,0.5)",height:20,width:20}}/>
                            </div>
                        </div> 
                    </div> 
                )   
            }
            <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>   
                <AutosizeInput   
                    type="text"  
                    name="form-field-name-tag"   
                    minWidth={40}
                    style={{display:"flex", alignItems:"center", cursor:"default"}}            
                    inputStyle={{                
                        color:"black",  
                        fontSize:"16px",  
                        cursor:"default", 
                        caretColor:"cornflowerblue",  
                        boxSizing:"content-box", 
                        backgroundColor:"rgba(0,0,0,0)",
                        border:"none",  
                        outline:"none"   
                    }}  
                    placeholder=""  
                    value={this.state.tag}  
                    onKeyDown={this.onKeyPress} 
                    onChange={(event) => this.setState({tag:event.target.value})} 
                /> 
            </div>
        </div>
    }
}
 