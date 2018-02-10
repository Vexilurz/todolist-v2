import './assets/fonts/index.css'; 
import './assets/quickentry.css'; 
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react";  
import spacing from 'material-ui/styles/spacing'; 
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import Refresh from 'material-ui/svg-icons/navigation/refresh'; 
import Moon from 'material-ui/svg-icons/image/brightness-3';
import Star from 'material-ui/svg-icons/toggle/star';
import Circle from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import CheckBoxEmpty from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import CheckBox from 'material-ui/svg-icons/toggle/check-box'; 
import BusinessCase from 'material-ui/svg-icons/places/business-center';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz'; 
import Layers from 'material-ui/svg-icons/maps/layers'; 
import Adjustments from 'material-ui/svg-icons/image/tune';
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none'; 
import Flag from 'material-ui/svg-icons/image/assistant-photo'; 
import NewProjectIcon from 'material-ui/svg-icons/image/timelapse';
import NewAreaIcon from 'material-ui/svg-icons/maps/layers'; 
import Plus from 'material-ui/svg-icons/content/add';
import Trash from 'material-ui/svg-icons/action/delete';
import Search from 'material-ui/svg-icons/action/search'; 
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Logbook from 'material-ui/svg-icons/av/library-books';
import Audiotrack from 'material-ui/svg-icons/image/audiotrack';
import Calendar from 'material-ui/svg-icons/action/date-range';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import { ipcRenderer, remote } from 'electron';
import TextField from 'material-ui/TextField'; 
import List from 'material-ui/svg-icons/action/list';
import { 
    cond, assoc, isNil, not, defaultTo, map, isEmpty, 
    uniq, remove, contains, append, adjust, 
    compose, flatten, concat, prop  
} from 'ramda';
let moment = require("moment");
import Popover from 'material-ui/Popover';
import Checked from 'material-ui/svg-icons/navigation/check';
import Inbox from 'material-ui/svg-icons/content/inbox';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
let uniqid = require("uniqid"); 
import AutosizeInput from 'react-input-autosize';
import Clear from 'material-ui/svg-icons/content/clear';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { Provider, connect } from "react-redux";
import Chip from 'material-ui/Chip';
import ResizeObserver from 'resize-observer-polyfill';
import { DateCalendar, DeadlineCalendar } from './Components/ThingsCalendar';
import { SortableContainer } from './sortable/CustomSortableContainer';

//document.body.style.overflow="auto";  
 
export let dateDiffInDays = (A : Date, B : Date) : number  => {
    let _MS_PER_DAY = 1000 * 60 * 60 * 24;

    let utc1 = Date.UTC(A.getFullYear(), A.getMonth(), A.getDate());

    let utc2 = Date.UTC(B.getFullYear(), B.getMonth(), B.getDate());
  
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}


let daysRemaining = (date:Date) : number => {
    return dateDiffInDays(new Date(), date); 
} 
    

let generateId = () => uniqid() + new Date().toJSON(); 

let wrapMuiThemeLight = (component) =>  {

    return <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        
        {component} 
    
    </MuiThemeProvider>

}   

injectTapEventPlugin();  

(() => {     
    let app=document.createElement('div'); 
    app.style.width="100%";
    app.style.height="100%";
    app.id='application';     
    document.body.appendChild(app);     
})(); 

ipcRenderer.once( 
    'loaded',     
    (event) => { 
        ReactDOM.render(   
            wrapMuiThemeLight(<QuickEntry />),
            document.getElementById('application')
        )     
    }
);   

interface QuickEntryState{
    category : string,
    title : string,  
    note : string, 
    checked : boolean,
    completed : Date,
    reminder : Date,
    deadline : Date,
    deleted : Date,
    attachedDate : Date, 
    attachedTags : string[],
    tag : string, 
    checklist : any[],
    showAdditionalTags : boolean, 
    showDateCalendar : boolean,  
    showTagsSelection : boolean,
    showChecklist : boolean,   
    showDeadlineCalendar : boolean
}   
  
interface  QuickEntryProps{}    
   
class QuickEntry extends Component<QuickEntryProps,QuickEntryState>{
    
    calendar:HTMLElement; 
    deadline:HTMLElement;
    tags:HTMLElement;
    ref:HTMLElement; 
    inputRef:HTMLElement; 
    ro:ResizeObserver; 
    
    constructor(props){

        super(props);  
 
        this.state={    
            tag : '',
            category : 'inbox', 
            title : '',
            note : '',  
            checked : false, 
            completed : undefined,
            reminder : undefined, 
            deadline : undefined, 
            deleted : undefined, 
            attachedDate : undefined, 
            attachedTags : [], 
            checklist : [], 
            showAdditionalTags : false, 
            showDateCalendar : false,  
            showTagsSelection : false, 
            showChecklist : false,  
            showDeadlineCalendar : false
        }       
    }

    onResize = (entries, observer) => {   
        const {left, top, width, height} = entries[0].contentRect;
        let wnd = remote.getCurrentWindow(); 
        wnd.setSize(600, document.body.scrollHeight); 
    }          
    
    initRo = () => {     
        this.ro = new ResizeObserver(this.onResize);    
        this.ro.observe(document.body);      
    }    
    
    componentDidMount(){  
        if(this.inputRef){  this.inputRef.focus()  }
        //this.initRo(); 
    }     
 
    closeParentContainer = () => { 
       
    }
    
    addTodo = () => {
        let todo = this.todoFromState();  

        if(!isEmpty(todo.title)){ 
            ipcRenderer.send("quick-entry",todo); 
        }
    } 

    stateFromTodo = (state,todo) => ({   
        ...state,
        category:todo.category, 
        title:todo.title,
        note:todo.note,  
        checked:todo.checked, 
        completed:todo.completed,
        reminder:todo.reminder, 
        deadline:todo.deadline, 
        deleted:todo.deleted, 
        attachedDate:todo.attachedDate, 
        attachedTags:todo.attachedTags, 
        checklist:todo.checklist  
    }) 

    todoFromState = () : any => ({
        _id : generateId(),
        category : this.state.category as any, 
        type : "todo",
        title : this.state.title,
        priority : 0,
        note : this.state.note,  
        checklist : this.state.checklist,
        reminder : this.state.reminder,  
        deadline : this.state.deadline, 
        created : new Date(),
        deleted : this.state.deleted, 
        attachedDate : this.state.attachedDate,  
        attachedTags : this.state.attachedTags, 
        completed : this.state.completed, 
        checked : this.state.checked
    }) 
    
    onAttachTag = (tag) => { 

        if(tag.length===0){ return }

        this.setState({tag:'', attachedTags:uniq([...this.state.attachedTags, tag])})
    }  

    onRemoveTag = (tag) => {

        let {attachedTags} = this.state;
        
        if(tag.length===0){ return }
        
        let idx = attachedTags.findIndex( v => v===tag );
 
        if(idx===-1){ return }

        this.setState({attachedTags:remove(idx,1,attachedTags)})
    } 

    onNoteChange = (event,newValue:string) : void => {
        this.setState({note:newValue})
    }

    onTitleChange = (event,newValue:string) : void => {
        this.setState({title:newValue})
    }

    onCheckBoxClick = () => {  
        let checked : boolean = !this.state.checked; 
        this.setState({checked:checked, completed:checked ? new Date() : null})
    } 


    onChecklistButtonClick = (e) => {
        this.setState({showChecklist:true}) 
    }
      

    onFlagButtonClick = (e) => {
        this.setState({showDeadlineCalendar:true})
    }


    closeDeadlineCalendar = (e) => {
        this.setState({showDeadlineCalendar:false})
    }
 

    onCalendarButtonClick = (e) => {
        this.setState({showDateCalendar:true})
    }
    

    closeDateCalendar = (e) => {
        this.setState({showDateCalendar:false})
    }

    
    onTagsButtonClick = (e) => {
        this.setState({showTagsSelection:true})
    }


    closeTagsSelection = (e) => {
        this.setState({showTagsSelection:false}) 
    }


    onRemoveSelectedCategoryLabel = () => {
        let { category } = this.state;
        let todayCategory = category==="today" || category==="evening";
        let somedayCategory = category==="someday";

        if(todayCategory){
            this.setState({category:'inbox', attachedDate:null, deadline:null})  
        }else if(somedayCategory){                            
            this.setState({category:'inbox'}) 
        }
    }     


    onDeadlineCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        let {attachedDate,category} = this.state;
        let deadlineToday = daysRemaining(day)===0;
            
        this.setState({
            deadline:day,
            category:deadlineToday ? "today" : category
        })
    }   

 
    onRemoveAttachedDateLabel = () => {
        let {category,deadline} = this.state;

        this.setState({
            attachedDate:null,
            category:isNil(deadline) ? "inbox" : category
        }) 
    }


    onCalendarClear = (e) => {
        let {category,deadline} = this.state;

        this.setState({  
            category:isNil(deadline) ? "inbox" : category,
            attachedDate:null, 
            reminder:null  
        })
    } 


    onDeadlineCalendarClear = (e:any) : void => {
        let { category, attachedDate } = this.state;
        
        this.setState({
            deadline:null,
            category:isNil(attachedDate) ? "inbox" : category,
        })
    }


    onCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        let {category} = this.state;

        this.setState({
            attachedDate:day, 
            category:daysRemaining(day)===0 ? "today" : category
        })   
    }

    
    onCalendarSomedayClick = (e) => {
        this.setState({category:"someday", attachedDate:null, deadline:null})
    }


    onCalendarTodayClick = (e) => {
        this.setState({category:"today", attachedDate:new Date()}) 
    }


    onCalendarThisEveningClick = (e) => {
        this.setState({category:"evening", attachedDate:new Date()}) 
    }


    onCalendarAddReminderClick = (reminder:Date) : void => {
        this.setState({reminder, attachedDate:reminder})
    }

    
    onWindowEnterPress = (e) => {   
        if(e.keyCode===13){ 
            this.addTodo(); 
            remote.getCurrentWindow().blur();  
        }  
    }       
   

    render(){  
        let {category,attachedDate} = this.state;
        let todayCategory : boolean = category==="evening" || category==="today"; 

        return <div  
            ref={(e) => { this.ref=e; }}  
            style={{                   
                display:"flex",
                overflowX:"hidden",  
                height:"100%",   
                justifyContent:"space-between",
                boxShadow:"1px 1px 1px 3px #ccc inset",
                position:"relative", 
                alignItems:"center", 
                flexDirection:"column",  
            }}   
        >          
            <div style={{
                display:"flex", height:"30px", alignItems:"center", 
                width:"100%", paddingLeft:"30px", margin:"10px"
            }}>
                <TextField   
                    ref={e => {this.inputRef=e;}}
                    onKeyDown={this.onWindowEnterPress}
                    id={`todo-input-shortcut`}
                    value={this.state.title} 
                    hintText="New To-Do" 
                    fullWidth={true}  
                    hintStyle={{ 
                        top:"3px", 
                        left:0,   
                        height:"30px"
                    }}      
                    onChange={this.onTitleChange} 
                    style={{
                        display:"flex", 
                        alignItems:"center",  
                        width:"100%", 
                        height:"30px",
                        cursor:"default"
                    }}       
                    inputStyle={{        
                        height:"30px",
                        color:"black", fontSize:"16px", 
                        cursor:"default", boxSizing:"content-box", 
                        backgroundColor:"rgba(0,0,0,0)",
                        border:"none", outline:"none"  
                    }} 
                    underlineFocusStyle={{borderColor:"rgba(0,0,0,0)"}} 
                    underlineStyle={{borderColor:"rgba(0,0,0,0)"}}   
                />  
            </div> 
            <div style={{
                transition:"opacity 0.2s ease-in-out",
                opacity:1,
                minHeight:"80px",
                width:"100%",
                marginLeft:"30px",
                paddingLeft:"25px", 
                paddingRight:"25px"  
            } as any}>        
                <TextField   
                    id={`always-note`}  
                    value={this.state.note} 
                    hintText="Notes"
                    multiLine={true}   
                    rows={1}
                    fullWidth={true}  
                    onChange={this.onNoteChange}  
                    onKeyDown={(e) => { if(e.keyCode===13){ e.stopPropagation(); } }}
                    inputStyle={{fontSize:"14px"}} 
                    underlineFocusStyle={{borderColor:"rgba(0,0,0,0)"}} 
                    underlineStyle={{borderColor:"rgba(0,0,0,0)"}}  
                />  
            </div> 
            {    
                !this.state.showChecklist ? null :  
                <div> 
                    <Checklist 
                        checklist={this.state.checklist}  
                        updateChecklist={(checklist:ChecklistItem[]) => this.setState({checklist})} 
                    /> 
                </div> 
            }   
            {  
                <TodoTags   
                    tags={this.state.attachedTags}
                    attachTag={this.onAttachTag}
                    removeTag={this.onRemoveTag}
                /> 
            }
        <div style={{ 
            display:"flex",
            alignItems:"center",
            width:"100%", 
            justifyContent:"flex-end",
            bottom:0, 
            padding:"5px", 
            right:0,
            zIndex:30001    
        }}>  
        { 
            <DateCalendar 
                close={this.closeDateCalendar}
                open={this.state.showDateCalendar}
                origin = {{vertical:"center", horizontal:"left"}} 
                point = {{vertical:"bottom", horizontal:"right"}}  
                anchorEl={this.calendar}
                rootRef = {document.body}
                reminder={this.state.reminder}  
                attachedDate={this.state.attachedDate}
                onDayClick = {this.onCalendarDayClick}
                onSomedayClick = {this.onCalendarSomedayClick}
                onTodayClick = {this.onCalendarTodayClick}
                onThisEveningClick = {this.onCalendarThisEveningClick}
                onAddReminderClick = {this.onCalendarAddReminderClick}
                onClear = {this.onCalendarClear} 
            />  
        } 
        {
            <TagsPopup   
                { 
                    ...{
                        attachTag:this.onAttachTag, 
                        close:this.closeTagsSelection,
                        open:this.state.showTagsSelection,  
                        anchorEl:this.tags,
                        todos:[],
                        defaultTags:[],
                        origin:{vertical:"center",horizontal:"left"}, 
                        point:{vertical:"bottom",horizontal:"right"}, 
                        rootRef:document.body 
                    } 
                }
            />
        }
        {
            <DeadlineCalendar   
                close={this.closeDeadlineCalendar}
                onDayClick={this.onDeadlineCalendarDayClick}
                open={this.state.showDeadlineCalendar}
                origin = {{vertical: "center", horizontal: "left"}} 
                point = {{vertical: "bottom", horizontal: "right"}} 
                anchorEl = {this.deadline}
                onClear={this.onDeadlineCalendarClear}
                rootRef = {document.body}
            />
        }
            { /*    
                <div ref={(e) => { this.calendar=e; }}>  
                    <IconButton 
                    onClick = {this.onCalendarButtonClick} 
                    iconStyle={{  
                        transition: "opacity 0.2s ease-in-out",
                        opacity: 1,
                        color:"rgb(207,206,207)",
                        width:"25px",   
                        height:"25px"  
                    }}>      
                        <Calendar />  
                    </IconButton> 
                </div> */ 
            } 
            {/*
                <div ref={(e) => { this.tags=e;}} > 
                    <IconButton   
                        onClick = {this.onTagsButtonClick}
                        iconStyle={{ 
                            transition: "opacity 0.2s ease-in-out",
                            opacity: 1,
                            color:"rgb(207,206,207)",
                            width:"25px",  
                            height:"25px" 
                        }} 
                    >         
                        <TriangleLabel />
                    </IconButton>    
                </div> */
            }
            {   
                /*this.state.showChecklist ? null :     
                <IconButton      
                    onClick = {this.onChecklistButtonClick}
                    iconStyle={{  
                        transition: "opacity 0.2s ease-in-out",
                        opacity:1,
                        color:"rgb(207,206,207)",
                        width:"25px", 
                        height:"25px" 
                    }}
                >         
                    <List />
                </IconButton>*/
            } 
            {    /*
                <div ref={(e) => {this.deadline=e;}}>  
                    <IconButton 
                        onClick = {this.onFlagButtonClick} 
                        iconStyle={{   
                            transition: "opacity 0.2s ease-in-out",
                            opacity:1,
                            color:"rgb(207,206,207)",
                            width:"25px", 
                            height:"25px" 
                        }}
                    >     
                        <Flag />  
                    </IconButton> 
                </div>  */
            }         
        </div> 

        <TodoInputPopupFooter
            onCancel={() => remote.getCurrentWindow().blur()}
            onSave={() => {
               this.addTodo();
               remote.getCurrentWindow().blur();  
            }}
        />  
    </div>  
  }
}
     

interface TodoInputPopupFooterProps{  
    onCancel:Function,
    onSave:Function,
}


interface TodoInputPopupFooterState{
    selectorPopupOpened:boolean 
}



class TodoInputPopupFooter extends Component<TodoInputPopupFooterProps,TodoInputPopupFooterState>{
    
    ref:HTMLElement;

    constructor(props){
        super(props);
        this.state={selectorPopupOpened:false}
    }


    closeSelectorPopup = () => {
        this.setState({selectorPopupOpened:false})
    }


    render(){
        let { selectorPopupOpened } = this.state;


        return <div style={{
            backgroundColor:"rgb(234, 235, 239)",
            display:"flex",
            overflowX:"hidden",
            justifyContent:"space-between",
            width:"100%"
        }}>     
                <div 
                    ref = {e => {this.ref=e;}}
                    onClick={() => this.setState({selectorPopupOpened:true})}
                    style={{
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"flex-start",
                        width:"90px",
                        fontSize:"14px",
                        fontWeight:"bold",
                        color:"rgba(100,100,100,1)",
                        cursor:"default"   
                    }}  
                >  
                    
                </div>  
                <div style={{  
                    display:"flex",  
                    alignItems:"center", 
                    justifyContent:"flex-end",
                    flexGrow:1, 
                    padding:"5px" 
                }}>
                    <div style={{padding:"2px"}}>
                        <div    
                            onClick={() => this.props.onCancel()} 
                            style={{       
                                width:"90px",
                                display:"flex",
                                alignItems:"center",
                                cursor:"pointer", 
                                justifyContent:"center",
                                borderRadius:"5px",
                                height:"25px",   
                                backgroundColor:"rgba(179,182,189,1)"  
                            }}  
                        > 
                            <div style={{color:"white", fontSize:"16px"}}>      
                                Cancel 
                            </div>  
                        </div>   
                    </div> 
                    <div style={{padding:"2px"}}>
                        <div     
                            onClick={() => this.props.onSave()}
                            style={{     
                                width:"90px",
                                display:"flex",
                                alignItems:"center",
                                cursor:"pointer",
                                justifyContent:"center",
                                borderRadius:"5px",
                                height:"25px",  
                                backgroundColor:"rgba(81, 144, 247, 1)"  
                            }}
                        >  
                            <div style={{color:"white", fontSize:"16px"}}>  
                                Save
                            </div>   
                        </div> 
                    </div>
                </div> 
         
        </div>
    }
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



function arrayMove(arr, previousIndex, newIndex) {
    const array = arr.slice(0);
    if (newIndex >= array.length) {
      let k = newIndex - array.length;
      while (k-- + 1) {
        array.push(undefined);
      }
    }
    array.splice(newIndex, 0, array.splice(previousIndex, 1)[0]);
    return array;
} 


interface Todo{ 
    _id : string,
    category : string, 
    type : string,
    title : string,
    priority : number,
    note : string,  
    checklist : ChecklistItem[],
    reminder : Date,  
    deadline : Date,
    created : Date,
    deleted : Date, 
    attachedDate : Date,  
    attachedTags : string[], 
    completed : Date, 
    checked : boolean,
    group?:any
}; 

interface TagsPopupProps{
    close : Function,
    open : boolean,
    attachTag:(tag:string) => void,
    origin : any,  
    todos:Todo[],
    defaultTags:string[],
    rootRef : HTMLElement, 
    anchorEl : HTMLElement,
    point : any 
}   

export class TagsPopup extends Component<TagsPopupProps,{}>{
        ref:HTMLElement;
        subscriptions:Subscription[];

        constructor(props){  
            super(props); 
            this.subscriptions = []; 
        }   

        componentDidMount(){ 
            let click = Observable.fromEvent(document.body,"click").subscribe(this.onOutsideClick);
            this.subscriptions.push(click);
        }   

        componentWillUnmount(){
            this.subscriptions.map(s => s.unsubscribe());
            this.subscriptions = []; 
        } 

        onOutsideClick = (e) => {
            if(this.ref===null || this.ref===undefined)
                return; 

            let x = e.pageX;
            let y = e.pageY; 

            let inside = insideTargetArea(null,this.ref,x,y);
        
            if(!inside){ this.props.close() }   
        }      

        getTags = () => {
            let {todos, defaultTags} = this.props;

            return compose( 
                uniq,
                flatten,
                concat(defaultTags),
                (todos) => todos.map(prop("attachedTags"))
            )(todos as any)
        }
                
        render(){ 
            let tags = this.getTags();

            return <Popover  
                open={this.props.open}
                style={{
                    zIndex:40005,
                    background:"rgba(39, 43, 53, 0)", 
                    backgroundColor:"rgb(39, 43, 53, 0)"
                }}
                anchorEl={this.props.anchorEl}
                canAutoPosition={true}
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
                            tags
                            .sort((a:string,b:string) : number => a.localeCompare(b))
                            .map(
                                (tag:string) => {

                                    return <div   
                                        key={tag}  
                                        onClick={(e) => {
                                            e.stopPropagation();  
                                            this.props.attachTag(tag)
                                        }} 
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
 


let insideTargetArea = (scrollableContainer:HTMLElement,target:HTMLElement,x:number,y:number) : boolean => {

    if(target===null || target===undefined){ return false }

    let {left,right,top,bottom} = target.getBoundingClientRect();
    let scrolledLeft = left;
    let scrolledTop = top;
    
    if(x>scrolledLeft && x<right){
        if(y>scrolledTop && y<bottom){ return true }
    }
        
    return false
}
    


interface TodoTagsProps{
    tags:string[],
    attachTag:(tag:string) => void,
    removeTag:(tag:string) => void,
}    

interface TodoTagsState{
    tag:string
}
 
export class TodoTags extends Component<TodoTagsProps,TodoTagsState>{

    constructor(props){
        super(props);
        this.state={ tag:'' };  
    } 
    
    
    onEnterPress = (e) => { 

        if(e.keyCode!==13){ return }
        
        e.stopPropagation(); 

        let {attachTag} = this.props;
        let {tag} = this.state;
        attachTag(tag);
        this.setState({tag:''}); 
    }
    

    onRemoveTag = (tag:string) => () => {
        let {removeTag} = this.props;
        removeTag(tag);
    }
    
    
    render(){
        let {attachTag} = this.props;
        let {tag} = this.state;

        return <div
            onClick={(e) => {e.stopPropagation();}} 
            style={{
                display:"flex", 
                paddingTop:"5px",
                paddingBottom:"5px",
                flexWrap:"wrap" 
            }}
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
                        <div style={{
                            borderRadius:"15px", 
                            backgroundColor:"rgb(189,219,209)",
                            paddingLeft:"5px",
                            paddingRight:"5px",
                            display:"flex"   
                        }}>
                            <div style={{  
                                height:"15px",
                                display:"flex",
                                alignItems:"center",
                                padding:"4px", 
                                color:"rgb(115,167,152)",
                                fontWeight: 600    
                            }}> 
                                {uppercase(tag)} 
                            </div> 
                            <div  
                              style={{padding:"2px",alignItems:"center",display:"flex"}} 
                              onClick={this.onRemoveTag(tag)}
                            >
                                <Clear style={{color:"rgba(100,100,100,0.5)",height:20,width:20}}/>
                            </div>
                        </div> 
                    </div> 
                )   
            }
            <div
                style={{ 
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center"
                }}
            >   
                <AutosizeInput   
                    type="text"  
                    name="form-field-name-tag"   
                    minWidth={40}
                    style={{ 
                        display:"flex", 
                        alignItems:"center",      
                        cursor:"default"  
                    }}            
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
                    onKeyDown={this.onEnterPress} 
                    onChange={(event) => this.setState({tag:event.target.value})} 
                /> 
            </div>
        </div>
    }
}
 

let uppercase = (str:string) : string => { 
    if(str.length===0)
       return str; 
    
    return str.substring(0,1).toUpperCase() + str.substring(1,str.length);
}
 



interface TodoInputLabelProps{
    onRemove:Function,
    category:string,
    content:JSX.Element 
} 

interface TodoInputLabelState{} 



export class TodoInputLabel extends Component<TodoInputLabelProps, TodoInputLabelState>{

    constructor(props){
        super(props); 
    }

 
    render(){
        let containerStyle : any = {
            display: "flex",
            alignItems: "center",
            color: "rgba(0,0,0,1)",
            fontWeight: "bold", 
            cursor: "default",
            marginLeft: "20px",
            marginRight: "20px",
            userSelect: "none"
        };
 
           
        return  <Chip 
                    onRequestDelete={this.props.onRemove}
                    onClick={(e) => {}}
                    style={{
                        backgroundColor:"",
                        background:"",
                        transform:"scale(0.9,0.9)" 
                    }}  
                >
                    <div style={containerStyle}>
                        {
                            chooseIcon({height: "25px", width: "25px"}, this.props.category)
                        } 
                        {
                            this.props.content 
                        }
                    </div>
                </Chip>
    }
  
}

let chooseIcon = (
    size : { width:string, height:string }, 
    selectedCategory : string
) => {

    switch(selectedCategory){  

        case "inbox":
            return <Inbox style={{
                ...size,
                ...{ 
                    color:"dodgerblue", 
                    cursor:"default" 
                }
            }} /> 

        case "today":
            return <Star style={{
                ...size,
                ...{
                    color:"gold", 
                    cursor:"default" 
                }
            }}/>

        case "upcoming":
            return <CalendarIco style={{
                ...size,
                ...{  
                    color:"crimson", 
                    cursor:"default"
                }
            }}/>

        case "next":
            return <Layers style={{
                ...size,
                ...{
                    color:"darkgreen", 
                    cursor:"default"
                } 
            }}/>

        case "someday":
            return <BusinessCase  style={{
                ...size,
                ...{
                    color:"burlywood", 
                    cursor:"default"
                }
            }}/>  
 
        case "logbook":
            return <Logbook style={{
                ...size,    
                ...{
                    color:"limegreen", 
                    cursor:"default"
                }
            }}/>  

        case "trash":
            return <Trash style={{
                ...size,
                ...{
                    color:"darkgray", 
                    cursor:"default" 
                }
            }}/>

        case "evening":
            return <Moon style={{
                ...size,
                ...{  
                    transform:"rotate(145deg)", 
                    color:"cornflowerblue", 
                    cursor:"default" 
                }
            }}/>;    
 
        case "deadline":
            return <Flag style={{
                ...size,
                ...{   
                    color:"black",  
                    cursor:"default"  
                }
            }}/>
            
        case "area":
            return <NewAreaIcon style={{
                ...size,
                ...{
                    color:"lightblue"
                }
            }}/>       
 
        case "project":
            return <div>          
                <div style={{
                    ...size,
                    ...{ 
                        display: "flex",
                        borderRadius: "50px",
                        border: "3px solid rgb(10, 100, 240)",
                        justifyContent: "center",
                        position: "relative" 
                    }  
                }}>   
                </div>
            </div>    

        case "group":
            return <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}> 
                <Refresh  
                    style={{     
                       width:18,   
                       height:18, 
                       marginLeft:"3px", 
                       color:"black", 
                       cursor:"default", 
                       marginRight:"5px"  
                    }} 
                /> 
            </div>    
 
        default:
            return <Inbox style={{  
                ...size,
                ...{  
                    color:"dodgerblue", 
                    cursor:"default"
                }   
            }}/> 
    }
}