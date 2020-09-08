import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { Component } from "react";  
import Checked from 'material-ui/svg-icons/navigation/check';
import { TextField } from 'material-ui'; 
import { adjust, append, isEmpty } from 'ramda';
import { SortableContainer } from '../CustomSortableContainer';
import { arrayMove } from '../../utils/arrayMove';
import { generateId } from '../../utils/generateId';
import { ChecklistItem } from '../../types';
import TextareaAutosize from 'react-autosize-textarea';
import { different } from '../../utils/utils';



interface ChecklistProps{
    checklist : ChecklistItem[],
    updateChecklist : (checklist:ChecklistItem[]) => void,
    closeChecklist : () => void   
}



interface ChecklistState{} 



export class Checklist extends Component<ChecklistProps,ChecklistState>{
    ref:HTMLElement; 
    inputRef:HTMLElement;

    constructor(props){
        super(props); 
    }

  
    
    shouldComponentUpdate(nextProps:ChecklistProps, nextState:ChecklistState){    
        let checklistChanged = different(nextProps.checklist, this.props.checklist);
        return checklistChanged;  
    }; 
 


    onChecklistItemChange = (key:string, newText:string) => {  
        let idx : number = this.props.checklist.findIndex((c:ChecklistItem) => c.key===key);
        
        if(idx!==-1){

            let updatedItem = {...this.props.checklist[idx]};
                
            updatedItem.text = newText; 

            let checklist = adjust(
                idx, 
                () => isEmpty(updatedItem.text) ? undefined : updatedItem,                 
                this.props.checklist
            );

            this.props.updateChecklist(checklist.filter( v => v ));  
        } 
    };    
   


    onChecklistItemCheck = (e, key:string) => {
        let idx = this.props.checklist.findIndex((c:ChecklistItem) => c.key===key);
            
        if(idx!==-1){
 
            let item = {...this.props.checklist[idx]};
            
            item.checked=!item.checked;

            let checklist = adjust(idx, () => item, this.props.checklist);

            this.props.updateChecklist(checklist);  
        }
    }; 



    selectElements = (index:number,items:any[]) => [index];



    onSortMove = (oldIndex:number, event) : void => {}; 


    
    onSortStart = (oldIndex:number, event:any) : void => {};



    onSortEnd = (oldIndex:number, newIndex:number, event) : void => {
        if(oldIndex===newIndex){ return }
             
        let updateIndex = (el:ChecklistItem,idx:number) => {
            el.idx=idx;
            return el; 
        };
 
        let moved = arrayMove([...this.props.checklist],oldIndex,newIndex);

        let checklist = moved.map(updateIndex).filter((el:ChecklistItem) => !isEmpty(el.text));  

        this.props.updateChecklist(checklist); 
    };  
      


    getCheckListItem = (value:ChecklistItem, index:number) => { 
        let style = {display:"flex", alignItems:"center", paddingTop:"4px"} as any;

        let checkedStyle = {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop:"2px", 
            paddingRight: "3px",
            paddingLeft: "3px"
        } as any;
             
        return <li 
          className="checklistItem"   
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
                    alignItems:"flex-start", 
                    display:"flex" 
                }} 
            >  
                <div  
                    style={value.checked ? checkedStyle : style} 
                    onClick={(e) => this.onChecklistItemCheck(e, value.key)}   
                > 
                    {
                        value.checked ? 
                        <Checked style={{width:18, height:18, color:"rgba(100,100,100,0.7)"}}/> :
                        <div style={{ 
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
                        }}>        
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
                    <TextareaAutosize 
                        placeholder=""
                        onChange={(event:any) => this.onChecklistItemChange(value.key,event.target.value)}
                        style={{ 
                            color:value.checked ? "rgba(100,100,100,0.7)" : "rgba(0,0,0,1)",  
                            fontSize:"16px",
                            textDecoration:value.checked ? "line-through" : "none",
                            resize:"none",
                            width:"100%",
                            padding:"0px",
                            cursor:"default",
                            position:"relative",
                            border:"none",  
                            outline:"none",
                            backgroundColor:"rgba(0, 0, 0, 0)"
                        }}
                        onClick={(e:any) => {
                            let value = e.target.value;
                            e.target.value = '';
                            e.target.focus();
                            e.target.value = value; 
                        }}   
                        onKeyDown={(event) => { 
                            if(event.which == 13 || event.keyCode == 13){
                                event.stopPropagation(); 
                            }     
                        }} 
                        value={value.text}
                    /> 
                </div>  
            </div>  
        </li>     
    }; 



    onBlankBlur = (event) => {
        if(event.target.value===''){ return } 

        let newItem = {
            checked:false,  
            text:event.target.value,  
            idx:this.props.checklist.length, 
            key:generateId(),
            _id:generateId()
        };
 
        let checklist = append(newItem)(this.props.checklist);
        this.props.updateChecklist(checklist); 
    };



    onBlankEnterPress = (event) => { 
        event.stopPropagation(); 

        if(event.which == 13 || event.keyCode == 13){

            if(event.target.value===''){ return };  
                 
            let newItem = { 
                checked:false,  
                text:event.target.value,  
                idx:this.props.checklist.length, 
                key:generateId(),
                _id:generateId()
            };

            let checklist = append(newItem)(this.props.checklist);
            this.props.updateChecklist(checklist); 

        }else if(event.which == 8 || event.keyCode == 8){

            if(event.target.value==='' && isEmpty(this.props.checklist)){
               this.props.closeChecklist(); 
            } 
        }     
    }; 



    componentDidMount(){
        if(this.inputRef){
           this.inputRef.focus();  
        } 
    }



    componentDidUpdate(prevProps:ChecklistProps){
        let checklistItemJustAdded = prevProps.checklist.length<this.props.checklist.length;

        if(this.inputRef && checklistItemJustAdded){
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
                                inputStyle={{color:"rgba(0,0,0,1)",fontSize:"16px",textDecoration:"none"}} 
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
};
