import 'react-tippy/dist/tippy.css'
import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import { debounce } from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import IconButton from 'material-ui/IconButton';   
import { Component } from "react";  
import Star from 'material-ui/svg-icons/toggle/star';
import BusinessCase from 'material-ui/svg-icons/content/archive';
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import Checked from 'material-ui/svg-icons/navigation/check';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Calendar from 'material-ui/svg-icons/action/date-range';
import List from 'material-ui/svg-icons/action/list';
import Popover from 'material-ui/Popover';
import ChecklistIcon from 'material-ui/svg-icons/action/assignment-turned-in'; 
import NotesIcon from 'material-ui/svg-icons/action/subject'; 
import { DateCalendar, DeadlineCalendar } from '.././ThingsCalendar';
import { 
    daysLeftMark, getMonthName, getCompletedWhen, different, 
    isNotEmpty, log, anyTrue, attachDispatchToProps 
} from '../../utils/utils'; 
import { Todo, Project, Group, ChecklistItem, Category, RawDraftContentState } from '../../types';
import { isEmpty, isNil } from 'ramda';
import {Tooltip} from 'react-tippy';
import 'draft-js/dist/Draft.css';
import { noteToState, noteFromState, getNotePlainText } from '../../utils/draftUtils';
import { getTime, setTime } from '../../utils/time';
import { RelatedProjectLabel } from './RelatedProjectLabel';
import { TodoInputLabels } from './TodoInputLabels';
let moment = require("moment"); 



interface AdditionalTagsProps{
    attachedTags:string[],
    open:boolean,
    selectedCategory:Category,
    rootRef:HTMLElement
}

interface AdditionalTagsState{
    showMoreTags:boolean
}

export class AdditionalTags extends Component<AdditionalTagsProps,AdditionalTagsState>{
    ref:HTMLElement;


    shouldComponentUpdate(nextProps:AdditionalTagsProps,nextState:AdditionalTagsState){
        let tagsChanged = different(this.props.attachedTags, nextProps.attachedTags);
        let showMoreTagsChanged = different(this.state.showMoreTags, nextState.showMoreTags);
        let openChanged = different(this.props.open, nextProps.open);

        
        return tagsChanged || showMoreTagsChanged || openChanged;
    }


    constructor(props){
        super(props); 
        this.state={ showMoreTags:false };
    }   
    

    getVisiblePortion = (attachedTags:string[]) : JSX.Element => {
        return <div 
        ref={e => {this.ref=e;}}
        style={{
            height:"25px",
            display:"flex",
            alignItems:"center",
            zIndex:1001,   
            justifyContent:"flex-start",
            zoom:0.8, 
            flexGrow:1    
        }}>
            <div   
                style={{paddingRight:"5px",display:"flex",position:"relative",alignItems:"center"}} 
                key={`AdditionalTags-${attachedTags[0]}`} 
            >     
                { 
                    attachedTags
                    .slice(0,3) 
                    .map((tag:string,index:number) => 
                        <div key={`${tag}-${index}`} style={{paddingRight:"2px"}}>
                            <div style={{  
                                height:"20px",
                                borderRadius:"15px",
                                display:'flex',
                                alignItems:"center",
                                justifyContent:"center",  
                                border:"1px solid rgba(200,200,200,0.5)" 
                            }}>  
                                <div style={{ 
                                    color:"rgba(200,200,200,1)", 
                                    fontSize:"13px", 
                                    cursor:"default",
                                    padding:"5px", 
                                    WebkitUserSelect:"none"
                                }}> 
                                    {tag} 
                                </div>  
                            </div>     
                        </div>
                    ) 
                }  
            </div> 
        </div>
    }


    tooltipContent = (moreTags:string[]) : JSX.Element => {
        return <div style={{
            zoom:0.8, 
            display:"flex",  
            flexWrap:"wrap",
            alignItems:"center",
            justifyContent:"center", 
            maxWidth:"150px", 
            background:"rgba(255,255,255,1)"
        }}>
            { 
                moreTags
                .map((tag:string,index:number) => 
                    <div 
                        key={`${tag}-${index}`} 
                        style={{padding:"2px"}}
                    >
                        <div style={{    
                            height:"20px",
                            borderRadius:"15px",
                            display:'flex', 
                            alignItems:"center",
                            justifyContent:"center",  
                            border:"1px solid rgba(200,200,200,0.5)" 
                        }}>  
                            <div style={{ 
                                color:"rgba(200,200,200,1)", 
                                fontSize:"13px", 
                                cursor:"default",
                                padding:"5px",   
                                WebkitUserSelect:"none"
                            }}> 
                                {tag} 
                            </div>  
                        </div>   
                    </div>
                ) 
            } 
        </div>
    };



    getTooltip = (moreTags:string[], attachedTags:string[]) => {
        return  <div style={{display:"flex"}}>
                {this.getVisiblePortion(attachedTags)}
                <Tooltip  
                    size={"small"}
                    disabled={isEmpty(moreTags)}
                    open={this.state.showMoreTags}
                    //onRequestClose={() => this.setState({showMoreTags:false})}
                    position="bottom"
                    animateFill={false}  
                    transitionFlip={false}
                    theme="light"   
                    unmountHTMLWhenHide={true}
                    trigger="manual"
                    //trigger="mouseenter"
                    duration={0}
                    animation="fade" 
                    html={this.tooltipContent(moreTags)}
                >
                <div  
                    onMouseEnter={() => this.setState({showMoreTags:true})}
                    onMouseLeave={() => this.setState({showMoreTags:false})}
                    style={{paddingRight:"2px", position:"relative"}}
                >
                    <div style={{  
                        height:"20px",
                        borderRadius:"15px",
                        display:'flex',
                        zoom: 0.8,
                        whiteSpace:"pre",
                        alignItems:"center", 
                        justifyContent:"center",  
                        border:"1px solid rgba(200,200,200,0.5)" 
                    }}>  
                        <div style={{ 
                            color:"rgba(200,200,200,1)", 
                            fontSize:"13px", 
                            cursor:"default",
                            padding:"5px", 
                            WebkitUserSelect:"none"
                        }}> 
                            {`. . .`} 
                        </div>  
                    </div>    
                </div>
                </Tooltip>
            </div>
        
    };



    render(){
        let {attachedTags,open,rootRef} = this.props;

        if(isNil(attachedTags)){ return null }  
        if(isEmpty(attachedTags)){ return null }
        if(open){ return null } 

        let moreTags = attachedTags.slice(3,attachedTags.length);
 
        return isEmpty(moreTags) ? 
               this.getVisiblePortion(attachedTags) :
               this.getTooltip(moreTags,attachedTags);
        
    }
};
