import '../../assets/styles.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';   
import { ipcRenderer } from 'electron'; 
import IconButton from 'material-ui/IconButton';  
import { Component } from "react";  
import { Provider, connect } from "react-redux";
import Chip from 'material-ui/Chip';  
import Star from 'material-ui/svg-icons/toggle/star';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import CheckBoxEmpty from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import CheckBox from 'material-ui/svg-icons/toggle/check-box'; 
import BusinessCase from 'material-ui/svg-icons/content/archive';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import Checked from 'material-ui/svg-icons/navigation/check';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz'; 
import Adjustments from 'material-ui/svg-icons/image/tune';
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import Plus from 'material-ui/svg-icons/content/add'; 
import Trash from 'material-ui/svg-icons/action/delete';
import SearchIcon from 'material-ui/svg-icons/action/search'; 
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Calendar from 'material-ui/svg-icons/action/date-range';
import Logbook from 'material-ui/svg-icons/av/library-books';
import Clear from 'material-ui/svg-icons/content/clear';
import List from 'material-ui/svg-icons/action/list';
import Reorder from 'material-ui/svg-icons/action/reorder';  
let uniqid = require("uniqid");  
import * as Waypoint from 'react-waypoint';
import Popover from 'material-ui/Popover';
import {  
    daysLeftMark, 
    generateTagElement, 
    attachDispatchToProps, 
    byNotDeleted, 
    findAttachedProject, 
    getTagsFromItems,
    byTags
} from '../../utils/utils'; 
import { stopPropagation } from '../../utils/stopPropagation';
import { Category, ChecklistItem, Todo, ObjectType, Area, Project, Heading, Store } from '../../types';
import { 
    allPass, isNil, not, isEmpty, contains, flatten, 
    prop, compose, any, intersection, defaultTo, all,
    when 
} from 'ramda';
import { filter, debounce } from 'lodash'; 
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import PieChart from 'react-minimal-pie-chart';
import { TodoInput } from './../TodoInput/TodoInput';
import { Tags } from './../Tags';
import { isArray, isString, isDate, isNotDate, isFunction, isNotNil } from '../../utils/isSomething';
import { chooseIcon } from '../../utils/chooseIcon';
import { FadeBackgroundIcon } from './../FadeBackgroundIcon';
import { isDev } from '../../utils/isDev';
import { assert } from '../../utils/assert';


interface SearchInputProps{
    onChange:(e:any) => void,
    clear:() => void,
    searchQuery:string,
    autofocus:boolean,
    setRef?:Function  
}  


interface SearchInputState{
    value:string
}  
 

export class SearchInput extends Component<SearchInputProps,SearchInputState>{
    ref:any;

    constructor(props){ 
        super(props);
        this.state={value:this.props.searchQuery};
    } 



    componentWillReceiveProps(nextProps){
        if(nextProps.searchQuery!==this.state.value){
           this.setState({value:nextProps.searchQuery});
        }
    }


 
    componentDidMount(){
        if(this.props.autofocus){
           this.focus();
        }

        if(this.props.setRef && this.ref){
           this.props.setRef(this.ref); 
        }
    }


    
    focus = () => {
        if(this.ref){ 
            let value = this.ref.value;
            this.ref.value = ''; 
            this.ref.blur()
            this.ref.focus();
            this.ref.value = value;  
        } 
    }; 



    shouldComponentUpdate(nextProps:SearchInputProps, nextState){
        return this.state.value!==nextState.value;
        //nextProps.searchQuery!==this.props.searchQuery;
    };



    onChange = debounce((e) => { this.props.onChange(e) },250);



    render(){  
        return <div 
            style={{   
                zIndex:30000,
                backgroundColor:"rgb(248, 248, 248)",
                borderRadius:"5px",
                position:"relative", 
                WebkitUserSelect:"none",  
                maxHeight:isEmpty(this.state.value) ? "0px" : "30px",
                overflow:"hidden"
                //overflowY:"visible"
            }}   
        >               
            <div style={{ 
                backgroundColor:"rgb(217, 218, 221)", 
                borderRadius:"5px",
                display:"flex",
                height:"30px",  
                alignItems:"center"
            }}>  
                <div style={{padding:"5px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <SearchIcon style={{color:"rgb(100, 100, 100)",height:"20px",width:"20px"}}/>   
                </div>   
                <input 
                    ref={e => {this.ref=e;}}
                    onKeyDown={stopPropagation}
                    style={{  
                        outline:"none",
                        border:"none", 
                        width:"100%", 
                        backgroundColor:"rgb(217,218,221)",
                        caretColor:"cornflowerblue"  
                    }} 
                    placeholder="Quick Find" 
                    type="text" 
                    name="search"  
                    value={this.state.value} 
                    onChange={e => {
                        e.persist();
                        this.setState({value:e.target.value}, () => this.onChange(e));
                    }}
                />
                <div style={{display:"flex",cursor:"pointer",alignItems:"center",paddingRight:"5px"}}>
                    <Clear  
                        onClick={this.props.clear} 
                        style={{color:"rgba(100, 100, 100,0.7)",height:"20px",width:"20px"}}
                    />
                </div> 
            </div>   
        </div>
    }
}
