import '../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, 
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, 
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, groupBy, concat, flatten, ifElse, uniq 
} from 'ramda';
import { Component } from "react";  
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Popover from 'material-ui/Popover';



  
interface TagsPopoverProps{
    tags:string[], 
    close : Function,
    open : boolean,
    attachTag:(tag:string) => void,
    origin : any,  
    anchorEl : HTMLElement,
    point : any
}  

export class TagsPopover extends Component<any,any>{
     
        constructor(props){
            super(props); 
        }  

    
        render(){ 
            return <Popover 
                className="nocolor"
                style={{
                    backgroundColor:"rgba(0,0,0,0)",
                    background:"rgba(0,0,0,0)",
                    borderRadius:"10px"
                }}   
                open={this.props.open}
                anchorEl={this.props.anchorEl}
                //anchorReference={anchorReference}
                //anchorPosition={{ top: positionTop, left: positionLeft }}
                onRequestClose={() => this.props.close()}
                anchorOrigin={this.props.origin} 
                targetOrigin={this.props.point} 
                //transformOrigin={this.props.point}
            >   
                <div  
                className={"darkscroll"}
                style={{  
                    backgroundColor: "rgb(39, 43, 53)",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    borderRadius: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    maxHeight:"150px",
                    cursor:"pointer" 
                }}>   
                   { 
                    map((tag:string) => 
                        <div  
                            key={tag}
                            onClick={() => this.props.attachTag(tag)} 
                            className={"tagItem"} style={{display:"flex", height:"auto"}}
                        >  
                            <TriangleLabel style={{color:"gainsboro"}}/> 
                            <div style={{color:"gainsboro", marginLeft:"5px", marginRight:"5px"}}>
                                {tag}   
                            </div>     
                        </div>
                    )(this.props.tags)
                    } 
                </div>  
            </Popover> 
        } 
      
    }
