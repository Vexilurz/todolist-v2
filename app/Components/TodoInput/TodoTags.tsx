import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron'; 
import IconButton from 'material-ui/IconButton';  
import { Component } from "react";  
import Chip from 'material-ui/Chip';  
import Star from 'material-ui/svg-icons/toggle/star';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import CheckBoxEmpty from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import CheckBox from 'material-ui/svg-icons/toggle/check-box'; 
import BusinessCase from 'material-ui/svg-icons/places/business-center';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import Checked from 'material-ui/svg-icons/navigation/check';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz'; 
import Layers from 'material-ui/svg-icons/maps/layers';
import Adjustments from 'material-ui/svg-icons/image/tune';
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Plus from 'material-ui/svg-icons/content/add';
import Trash from 'material-ui/svg-icons/action/delete';
import Search from 'material-ui/svg-icons/action/search'; 
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Calendar from 'material-ui/svg-icons/action/date-range';
import Logbook from 'material-ui/svg-icons/av/library-books';
import Clear from 'material-ui/svg-icons/content/clear';
import List from 'material-ui/svg-icons/action/list';
import Reorder from 'material-ui/svg-icons/action/reorder';  
let uniqid = require("uniqid");  
import Popover from 'material-ui/Popover';
import { Todo } from '../../database';
import { uppercase, insideTargetArea } from '../../utils';




interface TagsPopupProps{
    tags:string[], 
    close : Function,
    open : boolean,
    attachTag:(tag:string) => void,
    origin : any,  
    rootRef : HTMLElement, 
    anchorEl : HTMLElement,
    point : any
}  

 
 
export class TagsPopup extends Component<TagsPopupProps,{}>{
    
        ref:HTMLElement; 
        
        constructor(props){
            super(props);
        }


        componentDidMount(){ 
            document.body.addEventListener("click", this.onOutsideClick);
        }


        componentWillUnmount(){
            document.body.removeEventListener("click", this.onOutsideClick);
        } 


        onOutsideClick = (e) => {
            if(this.ref===null || this.ref===undefined)
                return; 

            let x = e.pageX;
            let y = e.pageY; 

            let inside = insideTargetArea(this.ref,x,y);
        
            if(!inside){
                this.props.close(); 
            }   
        }      
                
        render(){ 
            return <Popover  
                open={this.props.open}
                style={{
                    background:"rgba(39, 43, 53, 0)", 
                    backgroundColor:"rgb(39, 43, 53, 0)"
                }}
                anchorEl={this.props.anchorEl}
                onRequestClose={this.props.close}
                scrollableContainer={this.props.rootRef}
                useLayerForClickAway={false} 
                anchorOrigin={this.props.origin} 
                targetOrigin={this.props.point} 
                zDepth={0}        
            >      
                <div   
                    ref={(e) => { this.ref=e; }}
                    className={"darkscroll"}
                    onClick = {(e) => { 
                        e.stopPropagation();
                        e.preventDefault(); 
                    }} 
                    style={{borderRadius:"10px", width:"180px"}}
                > 
                    <div    
                        className={"darkscroll"}
                        style={{   
                            backgroundColor: "rgb(39, 43, 53)",
                            paddingRight: "10px",
                            paddingLeft: "10px",
                            paddingTop: "5px",
                            paddingBottom: "5px",
                            maxHeight:"150px",
                            cursor:"pointer",
                            overflowX:"hidden" 
                        }}
                    >    
                        { 
                            this.props.tags.map(
                                (tag:string) => {

                                    return <div   
                                        key={tag}  
                                        onClick={() => this.props.attachTag(tag)} 
                                        className={"tagItem"} 
                                        style={{
                                            display:"flex", 
                                            height:"auto",  
                                            width:"140px", 
                                            paddingLeft:"5px", 
                                            paddingRight:"10px"  
                                        }}
                                    >  
                                     
                                            <div style={{width:"24px",height:"24px"}}>
                                                <TriangleLabel style={{color:"gainsboro"}}/>
                                            </div> 
                                            <div style={{
                                                color:"gainsboro", 
                                                marginLeft:"5px", 
                                                marginRight:"5px",
                                                overflowX:"hidden",
                                                whiteSpace: "nowrap" 
                                            }}> 
                                                {tag}   
                                            </div>  

                                    </div>
                                     
                                }
                            )
                        } 
                    </div>  
                </div>  
            </Popover> 
        } 
      
    }
 


interface TodoTagsProps{
    tags:string[] 
}    

 
export class TodoTags extends Component<TodoTagsProps,{}>{

    constructor(props){
        super(props);
    }
  
    
    render(){

        return <div
            onClick={(e) => {e.stopPropagation();}} 
            style={{
                display:"flex", 
                paddingTop:"5px",
                paddingBottom:"5px",
                flexWrap:"wrap"
            }}
        >{      
            this.props.tags.map(
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
                    <div style={{
                        borderRadius:"15px", 
                        backgroundColor:"rgb(189,219,209)",
                        paddingLeft:"5px",
                        paddingRight:"5px"   
                    }}>
                        <div style={{
                            height:"20px",
                            padding:"4px", 
                            color:"rgb(115,167,152)",
                            fontWeight: 600 
                        }}> 
                            {uppercase(tag)} 
                        </div>
                    </div>
                </div> 
            ) 
        }</div>
    }
}
 