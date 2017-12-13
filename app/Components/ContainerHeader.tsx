import '../assets/styles.css';  
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { findIndex, map, assoc, range, remove, merge, isEmpty, curry, cond, uniq,
    compose, append, contains, and, find, defaultTo, addIndex, split, filter, any,
    clone, take, drop, reject, isNil, not, equals, assocPath, sum, prop, all, 
    groupBy, concat, flatten, toPairs, adjust, prepend, fromPairs 
} from 'ramda';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz';
import { ipcRenderer } from 'electron';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react"; 
import { attachDispatchToProps, uppercase, insideTargetArea, chooseIcon, showTags } from "../utils"; 
import { connect } from "react-redux";
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Popover from 'material-ui/Popover';
import Button from 'material-ui-next/Button'; 
import TrashIcon from 'material-ui/svg-icons/action/delete';
import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Repeat from 'material-ui/svg-icons/av/repeat';
import Duplicate from 'material-ui/svg-icons/content/content-copy';
import ShareIcon from 'material-ui/svg-icons/social/share';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import { TextField } from 'material-ui';
import AutosizeInput from 'react-input-autosize';
import Clear from 'material-ui/svg-icons/content/clear';
import Remove from 'material-ui/svg-icons/content/remove'; 
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import FullScreen from 'material-ui/svg-icons/image/crop-square';
import { Tags } from './Tags';
import { Category } from '../MainContainer';



export interface ContainerHeaderProps{
    selectedCategory:Category, 
    dispatch:Function, 
    tags:string[],
    selectedTag:string
}  



export interface ContainerHeaderState{

}
 


export class ContainerHeader extends Component<ContainerHeaderProps,ContainerHeaderState>{
 
    constructor(props){
        super(props);
    } 

    render(){
       
        return <div>
            <div style={{ width: "100%"}}> 
            <div style={{
                display:"flex", 
                position:"relative",
                alignItems:"center",
                marginBottom:"20px"
            }}>  

                <div>{chooseIcon(this.props.selectedCategory)}</div>

                <div style={{  
                    fontFamily: "sans-serif",  
                    fontSize: "xx-large",
                    fontWeight: 600,
                    paddingLeft: "10px",
                    WebkitUserSelect: "none",
                    cursor:"default" 
                }}>   
                    {uppercase(this.props.selectedCategory)}
                </div> 
            
            </div>

            <Tags  
                selectTag={(tag) => this.props.dispatch({type:"selectedTag",load:tag})}
                tags={this.props.tags}
                selectedTag={this.props.selectedTag}
                show={showTags(this.props.selectedCategory)} 
            /> 
        </div>  
        </div>

    } 

}