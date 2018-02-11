import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
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
import { 
    daysRemaining, 
    todoChanged, daysLeftMark, 
    generateTagElement,
    arrayMove
} from '../../utils';
import { insideTargetArea } from '../../insideTargetArea';
import { Category } from '.././MainContainer';
import { Todo, removeTodo, updateTodo, generateId } from '../../database'; 
import { replace, adjust, append, prepend, isEmpty } from 'ramda';
import { SortableContainer } from '../../sortable/CustomSortableContainer';


let shouldUpdateChecklist = (
    checklistBefore:ChecklistItem[],
    checklistAfter:ChecklistItem[]
) : boolean => {

    let should = false;

    if(checklistBefore.length!==checklistAfter.length){
       should = true; 
       return should; 
    }


    for(let i=0; i<checklistBefore.length; i++){
        let before = checklistBefore[i];
        let after = checklistAfter[i];

        if(before.checked!==after.checked){
           should = true; 
        }else if(before.idx!==after.idx){
           should = true; 
        }else if(before.key!==after.key){
           should = true; 
        }
    }

    
    return should;
}

 

export interface ChecklistItem{
    text : string, 
    checked : boolean,
    idx : number,
    key : string,
    _id : string  
}   
 

interface ChecklistProps{
    checklist : ChecklistItem[],
    updateChecklist : (checklist:ChecklistItem[]) => void   
}

interface ChecklistState{} 

  
 
export class Checklist extends Component<ChecklistProps,ChecklistState>{

    ref:HTMLElement; 
    inputRef:HTMLElement;

    constructor(props){
        super(props); 
    }

  
    shouldComponentUpdate(nextProps:ChecklistProps, nextState:ChecklistState){
         
        let checklistChanged = shouldUpdateChecklist(nextProps.checklist, this.props.checklist);

        return checklistChanged;  
    } 
 

    onChecklistItemChange = (key:string, event, newText:string) => {  
        let idx : number = this.props.checklist.findIndex((c:ChecklistItem) => c.key===key);
        
        if(idx!==-1){

            let updatedItem = {...this.props.checklist[idx]};
                
            updatedItem.text = newText; 

            let checklist = adjust(() => updatedItem, idx, this.props.checklist);

            this.props.updateChecklist(checklist);  
        } 
    }    
   

    onChecklistItemCheck = (e, key:string) => {
        let idx = this.props.checklist.findIndex((c:ChecklistItem) => c.key===key);
            
        if(idx!==-1){
 
            let item = {...this.props.checklist[idx]};
            
            item.checked=!item.checked;

            let checklist = adjust(() => item, idx, this.props.checklist);

            this.props.updateChecklist(checklist);  
        }
    } 


    selectElements = (index:number,items:any[]) => [index];


    onSortMove = (oldIndex:number, event) : void => {} 

    
    onSortStart = (oldIndex:number, event:any) : void => {}


    onSortEnd = (oldIndex:number, newIndex:number, event) : void => {

        if(oldIndex===newIndex){ return }
             
        let updateIndex = (el:ChecklistItem,idx:number) => {
            el.idx=idx;
            return el; 
        };
 
        let moved = arrayMove([...this.props.checklist],oldIndex,newIndex);

        let checklist = moved.map(updateIndex).filter((el:ChecklistItem) => !isEmpty(el.text));  

        this.props.updateChecklist(checklist); 
    }  
      
    
    getCheckListItem = (value:ChecklistItem, index:number) => { 

        let style = {
            display:"flex",alignItems:"center"
        } as any;

        let checkedStyle = {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingRight: "3px",
            paddingLeft: "3px"
        } as any;
            
        return <li 
          className={'checklistItem'}    
          id={value._id} 
          key={value.key} 
          style={{width:"100%"}}    
        >  
            <div   
                style={{   
                    WebkitUserSelect:"none",
                    transition: "opacity 0.4s ease-in-out", 
                    opacity:1,
                    width:"100%", 
                    fontSize:"16px",
                    borderRadius:"5px",
                    alignItems:"center", 
                    display:"flex" 
                }} 
            >  
                <div  
                    style={value.checked ? checkedStyle : style} 
                    onClick={(e) => this.onChecklistItemCheck(e, value.key)}   
                > 
                    {
                        value.checked ? <Checked style={{width:18, height:18, color:"rgba(100,100,100,0.7)"}}/> :
                        <div
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
                    }    
                </div> 
                <div    
                    style={{   
                        display:"flex",
                        justifyContent:"space-around",
                        width:"100%",    
                        alignItems:"center"
                    }} 
                >    
                    <TextField     
                        id={value.key} 
                        fullWidth={true}   
                        defaultValue={value.text}
                        hintStyle={{top:"3px", left:0, width:"100%", height:"100%"}}  
                        style={{height:"28px",cursor:"default"}}  
                        inputStyle={{
                            color:value.checked ? "rgba(100,100,100,0.7)" : "rgba(0,0,0,1)",  
                            fontSize:"16px",
                            textDecoration:value.checked ? "line-through" : "none"
                        }}    
                        underlineFocusStyle={{borderColor: "rgba(0,0,0,0)"}}   
                        underlineStyle={{borderColor: "rgba(0,0,0,0)"}}   
                        onClick={(e) => e.target.focus()}  
                        onChange={(event, newText:string) => this.onChecklistItemChange(value.key, event, newText)}
                        onKeyDown={(event) => { 
                            if(event.which == 13 || event.keyCode == 13){
                                event.stopPropagation(); 
                            }      
                        }} 
                    />  
                </div>  
            </div>  
        </li>     
    } 


    onBlankBlur = (event) => {
        if(event.target.value==='')
           return;  

        let newItem = {
            checked:false,  
            text:event.target.value,  
            idx:this.props.checklist.length, 
            key:generateId(),
            _id:generateId()
        };
 
        let checklist = append(newItem)(this.props.checklist);
        this.props.updateChecklist(checklist); 
    }


    onBlankEnterPress = (event) => { 
        if(event.which == 13 || event.keyCode == 13){
            event.stopPropagation();
 
            if(event.target.value==='')
               return;  
                 
            let newItem = { 
                checked:false,  
                text:event.target.value,  
                idx:this.props.checklist.length, 
                key:generateId(),
                _id:generateId()
            };

            let checklist = append(newItem)(this.props.checklist);
            this.props.updateChecklist(checklist); 
        }     
    } 


    componentDidMount(){
        if(this.inputRef){
           this.inputRef.focus();  
        } 
    }

    
    componentDidUpdate(){
        if(this.inputRef){
           this.inputRef.focus();  
        }  
    }


    render(){  
 
        return <div  
            ref={e => {this.ref=e;}}
            style={{
                marginTop:"5px",
                marginBottom:"15px", 
                position:"relative",
                WebkitUserSelect:"none" 
            }}
            onClick={(e) => {e.stopPropagation();}}  
        >    
            <SortableContainer
              items={this.props.checklist}
              scrollableContainer={document.body}
              selectElements={this.selectElements}   
              onSortStart={this.onSortStart} 
              onSortMove={this.onSortMove}
              onSortEnd={this.onSortEnd}
              shouldCancelStart={(event:any,item:any) => false}  
              decorators={[]}   
              lock={true}
            >   
                {this.props.checklist.map((item,index) => this.getCheckListItem(item,index))}
            </SortableContainer> 
            
            {   
                <div
                    style={{   
                        transition: "opacity 0.4s ease-in-out", 
                        opacity:1,
                        width:"100%", 
                        fontSize:"16px",
                        borderRadius:"5px",
                        alignItems:"center", 
                        display:"flex",   
                    }} 
                >  
                    <div> 
                        <div
                            style={{
                                backgroundColor:'',
                                width:"15px",  
                                height:"15px",
                                borderRadius:"50px",
                                display:"flex",
                                justifyContent:"center",
                                position:"relative", 
                                border:"2px solid rgb(10, 100, 240)",
                                boxSizing:"border-box",
                                marginRight:"5px",
                                marginLeft:"5px" 
                            }}    
                        >        
                        </div>  
                    </div>   
                        <div     
                            key={generateId()}
                            style={{   
                                display:"flex",
                                justifyContent:"space-around",
                                width:"100%",    
                                alignItems:"center"
                            }}  
                        >    
                            <TextField     
                                ref={e => {this.inputRef=e;}}  
                                id={generateId()} 
                                key={generateId()}
                                fullWidth={true}   
                                defaultValue={''}
                                hintStyle={{top:"3px", left:0, width:"100%", height:"100%"}}  
                                style={{height:"28px", cursor:"default"}}  
                                inputStyle={{
                                    color:"rgba(0,0,0,1)",    
                                    fontSize:"16px",
                                    textDecoration:"none"
                                }} 
                                underlineFocusStyle={{borderColor:"rgba(0,0,0,0)"}}  
                                underlineStyle={{borderColor:"rgba(0,0,0,0)"}}   
                                onBlur={this.onBlankBlur}  
                                onKeyDown={this.onBlankEnterPress} 
                            />  
                        </div>  
                </div>   
            }
        </div>
    }
}
