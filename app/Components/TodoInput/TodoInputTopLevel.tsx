import 'react-tippy/dist/tippy.css'
import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';   
import { Component } from "react";  
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import Checked from 'material-ui/svg-icons/navigation/check';
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import NotesIcon from 'material-ui/svg-icons/action/subject'; 
import { daysLeftMark } from '../../utils/utils'; 
import { Group, ChecklistItem, Category } from '../../types';
import { isEmpty, isNil, not } from 'ramda';
import { isDate, isNotNil } from '../../utils/isSomething';
import Alert from 'material-ui/svg-icons/alert/add-alert';
import TextareaAutosize from 'react-autosize-textarea';
import 'draft-js/dist/Draft.css';
import { RelatedProjectLabel } from './RelatedProjectLabel';
import { AdditionalTags } from './AdditionalTags';
import { RestoreButton } from './RestoreButton';
import { Checkbox } from './Checkbox';
import { DueDate } from './DueDate';


interface TodoInputTopLevelProps{ 
    onWindowEnterPress:Function,
    setInputRef:(e:any) => void  
    groupTodos:boolean,
    openCalendar:Function,
    onRestoreButtonClick:Function,
    onCheckBoxClick:Function,
    onTitleChange:Function, 
    open:boolean,
    selectedCategory:Category,
    relatedProjectName:string,
    flagColor:string,
    showDueDate:boolean,
    deleted:Date,
    completedSet:Date,
    category:Category,
    attachedDate:Date,
    completedWhen:Date,
    title:string,
    reminder:Date,
    checklist:ChecklistItem[],
    group:Group, 
    attachedTags:string[],
    haveNote:boolean, 
    deadline:Date,
    rootRef:HTMLElement,
    animatingSlideAway?:boolean   
}



interface TodoInputTopLevelState{}



export class TodoInputTopLevel extends Component<TodoInputTopLevelProps,TodoInputTopLevelState>{
    ref:HTMLElement;

    constructor(props){
        super(props);
    } 


    
    getChecklistIndicator = (checklist:ChecklistItem[]) : {done:number, left:number, count:number} => {
        if(isNil(checklist) || isEmpty(checklist)){ return { done:0, left:0, count:0 } }

        return checklist.reduce(
            (indicator,item:ChecklistItem) => {
                indicator.count += 1;

                if(item.checked){
                    indicator.done += 1;
                }else{
                    indicator.left += 1;
                }

                return indicator;
            }, 
            { done:0, left:0, count:0 }
        )
    };


 
    render(){
        let {
            onRestoreButtonClick,
            onWindowEnterPress,
            onCheckBoxClick,
            open,
            selectedCategory,
            relatedProjectName,
            flagColor,  
            groupTodos, 
            animatingSlideAway,
            rootRef,
            deleted,
            completedSet,
            category,
            attachedDate,
            completedWhen,
            title,
            reminder,
            checklist,
            group, 
            attachedTags,
            deadline,
            haveNote
        } = this.props; 
        
        let indicator = this.getChecklistIndicator(checklist); 

        return <div 
            ref={e => { this.ref=e; }} 
            style={{display:"flex", alignItems:"flex-start", width:"100%"}}
        >  
            {  
                isNil(deleted) ? null :      
                <div
                    style={{paddingRight:"5px"}}
                    onClick={(e) => {e.stopPropagation();}} 
                    onMouseUp={(e) => {e.stopPropagation();}} 
                    onMouseDown={(e) => {e.stopPropagation();}}  
                > 
                    <RestoreButton  
                        deleted={isNotNil(deleted)}
                        open={open}   
                        onClick={onRestoreButtonClick}  
                    />    
                </div>   
            }    
            <div 
                onClick={(e) => {
                    e.stopPropagation(); 
                    e.nativeEvent.stopImmediatePropagation();
                }} 
                style={{paddingLeft:"5px",paddingRight:"5px"}}
            > 
                <Checkbox 
                    checked={animatingSlideAway ? true : isDate(completedSet)} 
                    onClick={onCheckBoxClick}
                />
            </div>   
            {
                open ? null :       
                <DueDate  
                    category={category} 
                    onClick={this.props.openCalendar}
                    date={attachedDate} 
                    completed={completedWhen} 
                    selectedCategory={selectedCategory}
                    showDueDate={this.props.showDueDate}
                />
            }
            <div 
                style={open ? {width:"100%", marginTop:"-4px"} : {minWidth:0, marginTop:"-4px"}} 
                key="form-field"
            >  
                {   
                    open ?      
                    <div> 
                        <TextareaAutosize 
                            placeholder="New Task"
                            innerRef={ref => this.props.setInputRef(ref)}
                            onChange={this.props.onTitleChange as any} 
                            style={{
                                resize:"none",
                                width:"100%",
                                fontSize:"inherit",
                                padding:"0px",
                                cursor:"default",
                                position:"relative",
                                border:"none",  
                                outline:"none",
                                backgroundColor:"rgba(0, 0, 0, 0)",
                                color:"rgba(0, 0, 0, 0.87)" 
                            }}
                            onKeyDown={(event) => { 
                                if( event.which===13 || event.keyCode===13 ){
                                    event.stopPropagation(); 
                                    event.preventDefault();
                                    onWindowEnterPress();
                                }      
                            }} 
                            value={title}
                        /> 
                    </div>
                    :
                    <div style={{cursor:"default"}}>  
                        <div style={{display:'flex'}}>  
                            <div style={{display:'flex',flexWrap:`wrap`}}>
                            {
                                isEmpty(title) ? 
                                <div style={{paddingRight:"4px", color:"rgba(100,100,100,0.4)"}}>New Task</div> 
                                : 
                                title
                                .split(' ')
                                .map((c:string,index:number) => 
                                    <div style={{paddingRight:"4px"}} key={`letter-${index}`}>{c}</div>
                                )
                            }
                            {    
                                isNil(group) ? null :
                                <div style={{display:"flex",alignItems:"center",paddingRight:"4px"}}> 
                                    <Refresh style={{     
                                        width:16,   
                                        height:16,   
                                        color:"rgba(200,200,200,1)", 
                                        cursor:"default"
                                    }}/>
                                </div>
                            }  
                            { 
                                isNil(reminder) ? null :
                                <div style={{
                                    paddingRight:"4px", 
                                    paddingTop:"2px",
                                    height:"18px",
                                    position:"relative"
                                }}>
                                    <Alert style={{width:15,height:15,color:"rgba(200,200,200,1)"}}/>
                                    <div style={{
                                        top:"8px",
                                        left:"5px",
                                        width:"5px",
                                        height:"7px",
                                        position:"absolute",
                                        backgroundColor:"rgba(200,200,200,1)"
                                    }}>
                                    </div>
                                </div>
                            }
                            {
                                isNil(checklist) || isEmpty(checklist) ? null :
                                <div style={{display:"flex", alignItems:"center"}}>
                                <div style={{
                                    display:"flex", 
                                    alignItems:"center", 
                                    height:"15px",
                                    borderRadius:"10px", 
                                    backgroundColor:"rgba(200,200,200,1)"
                                }}>
                                    <Checked style={{
                                        color:"white",
                                        height:"14px",
                                        width:"14px",
                                        paddingRight:"3px", 
                                        paddingLeft:"3px"
                                    }}/> 
                                    <div 
                                        style={{
                                            paddingRight:"3px",
                                            borderRadius:"15px", 
                                            height:"15px",
                                            fontSize:"8px",
                                            color:"white",
                                            display:"flex",
                                            alignItems:"center",
                                            justifyContent:"center"               
                                        }}
                                    >
                                        {`${indicator.done}/${indicator.count}`}
                                    </div>
                                </div>
                                </div>
                            }
                            {
                                not(haveNote) ? null :
                                <div style={{paddingRight:"4px",height:"18px"}}>  
                                    <NotesIcon style={{width:18,height:18,paddingTop:"2px",color:"rgba(200,200,200,1)"}}/>  
                                </div>
                            }
                            </div>
                        </div>  
                        <div style={{display:"flex"}}>
                            {
                                isNil(relatedProjectName) ? null : 
                                <RelatedProjectLabel 
                                    name={relatedProjectName} 
                                    groupTodos={groupTodos} 
                                    selectedCategory={selectedCategory}
                                />   
                            } 
                            {  
                                isEmpty(attachedTags) ? null :    
                                <AdditionalTags 
                                    selectedCategory={this.props.selectedCategory}
                                    open={open} 
                                    rootRef={this.ref} 
                                    attachedTags={attachedTags}
                                />  
                            }
                        </div>
                    </div>
                }
            </div>
            {        
                isNil(deadline) || open ? null : 
                <div style={{
                    display:"flex",
                    cursor:"default",
                    pointerEvents:"none",
                    alignItems:"center",
                    height:"20px",
                    flexGrow:1,
                    justifyContent:"flex-end"
                }}> 
                    <div style={{paddingRight:"5px"}}> 
                        <Flag style={{color:flagColor,cursor:"default",width:16,height:16}}/>      
                    </div>   
                        {daysLeftMark(open, deadline)}
                </div>  
            } 
        </div>
    } 
};