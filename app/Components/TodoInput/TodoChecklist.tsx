import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron'; 
import IconButton from 'material-ui/IconButton';  
import { Component } from "react";  
import SortableContainer from '../../sortable-hoc/sortableContainer';
import SortableElement from '../../sortable-hoc/sortableElement';
import SortableHandle from '../../sortable-hoc/sortableHandle';
import {arrayMove} from '../../sortable-hoc/utils';
import { Provider, connect } from "react-redux";
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
import { TextField } from 'material-ui'; 
import { ThingsCalendar } from '.././ThingsCalendar';
import { 
    insideTargetArea, daysRemaining, 
    todoChanged, daysLeftMark, 
    generateTagElement
} from '../../utils';
import { Category } from '.././MainContainer';
import { Todo, removeTodo, updateTodo, generateId } from '../../database';
import { SortableList } from '../SortableList';
import { replace, adjust } from 'ramda';






export interface ChecklistItem{
    text : string, 
    checked : boolean,
    idx : number,
    key : string  
}   
 

interface ChecklistProps{
    checklist : ChecklistItem[],
    updateChecklist : (checklist:ChecklistItem[]) => void,  
}

interface ChecklistState{} 

  

export class Checklist extends Component<ChecklistProps,ChecklistState>{

    checklist : ChecklistItem[]

    constructor(props){

        super(props); 

        this.checklist = [...this.props.checklist]; 

    }
 

    shouldComponentUpdate(nextProps:ChecklistProps){

        return nextProps.checklist!==this.props.checklist;
    
    }


    updateChecklist = () => {
        
        let allNotEmpty = this.checklist.reduce((acc, val) => acc && val.text.length>0, true);
        
        if(allNotEmpty){    

            this.checklist = [ 
                ...this.checklist,
                {
                    checked:false, 
                    text:'',  
                    idx:this.checklist.length, 
                    key:generateId()
                }
            ]; 

        } 

        this.props.updateChecklist(this.checklist);  
     
    }


    onChecklistItemChange = (key:string, event, newText:string) => {  
        
        let idx = this.checklist.findIndex((c:ChecklistItem) => c.key===key);
        
        if(idx!==-1){

            let updatedItem = {...this.checklist[idx]};
                
            updatedItem.text = newText; 

            this.checklist = adjust(() => updatedItem, idx, this.checklist)
            
        }   

    } 


    onChecklistItemCheck = (e, key:string) => {
        
        let idx = this.checklist.findIndex((c:ChecklistItem) => c.key===key);
            
        if(idx!==-1){

            let item = this.checklist[idx];
            
            item.checked=!item.checked;

            this.checklist = adjust(() => item, idx, this.checklist)
            
            this.updateChecklist(); 
                    
        } 

    }
  
        
    onCheckListEnterPress = (event) => {

        if (event.which == 13 || event.keyCode == 13) 
            this.updateChecklist(); 
             
    } 
         
        
    onChecklistItemBlur = (e) => {
            
        this.updateChecklist();  

    } 



    onSortEnd = ({oldIndex, newIndex, collection}, e) => {
        
        let updateIndex = (el:ChecklistItem,idx:number) => {
            el.idx=idx;
            return el; 
        };

        let moved = arrayMove([...this.props.checklist],oldIndex,newIndex);

        this.checklist = moved.map(updateIndex);  

        this.updateChecklist(); 
            
    }
        

    getCheckListItem = (value:ChecklistItem, index:number) => {
        
        const DragHandle = SortableHandle(() => 
            <Reorder style={{ 
                cursor: "default",
                marginRight: "5px",  
                color: "rgba(100, 100, 100, 0.17)"
            }}/>  
        );    

            
        return <li style={{width:"100%"}}>  

            <div className="toggleFocus"
                 style={{   
                    transition: "opacity 0.4s ease-in-out", 
                    opacity:1,
                    width:"100%", 
                    fontSize:"16px",
                    border:"1px solid rgba(150,150,150,0.1)",
                    borderRadius:"5px",
                    alignItems:"center", 
                    display:"flex",   
                 }} 
            >  
 
                <div>
                    <div  onClick={(e) => this.onChecklistItemCheck(e, value.key)}
                        style={{
                            backgroundColor:value.checked ? 'rgb(10, 100, 240)' : '',
                            width:"15px",  
                            height:"15px",
                            borderRadius:"50px",
                            display:"flex",
                            justifyContent:"center",
                            position:"relative", 
                            border:value.checked ? '' : "2px solid rgb(10, 100, 240)",
                            boxSizing:"border-box",
                            marginRight:"5px",
                            marginLeft:"5px" 
                        }}    
                    >        
                    </div>  
                </div>  
                 
                    <TextField  
                        id={value.key}
                        fullWidth={true}   
                        defaultValue={value.text}
                        hintStyle={{top:"3px", left:0, width:"100%", height:"100%"}}  
                        style={{height:"28px",cursor:"default"}}  
                        inputStyle={{color:"rgba(0,0,0,1)", fontSize:"16px"}}    
                        underlineFocusStyle={{borderColor: "rgba(0,0,0,0)"}}  
                        underlineStyle={{borderColor: "rgba(0,0,0,0)"}}   
                        onChange={(event, newText:string) => this.onChecklistItemChange(value.key, event, newText)}
                        onBlur={this.onChecklistItemBlur} 
                        onKeyPress={this.onCheckListEnterPress}
                    />     
    
                    <DragHandle />

            </div>  
        </li>     
    }

 

    render(){

        return <div 
            style={{marginTop:"5px",marginBottom:"15px"}}
            onClick={(e) => {e.stopPropagation();}}
        >   
            <SortableList 
                getElement={this.getCheckListItem}
                items={this.props.checklist}    
                container={document.body}
                shouldCancelStart={() => false}
                shouldCancelAnimation={() => false}
                onSortEnd={this.onSortEnd} 
                onSortMove = {(e, helper : HTMLElement) => { }}
                onSortStart={({node, index, collection}, e, helper) => { }}
                lockToContainerEdges={true}
                distance={0} 
                useDragHandle={true} 
                lock={true}
            />
        </div>

    }


}

 

