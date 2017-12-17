import '../assets/styles.css';  
import '../assets/calendarStyle.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import { ipcRenderer } from 'electron'; 
import IconButton from 'material-ui/IconButton';  
import { Component } from "react";  
import SortableContainer from '../sortable-hoc/sortableContainer';
import SortableElement from '../sortable-hoc/sortableElement';
import SortableHandle from '../sortable-hoc/sortableHandle';
import {arrayMove} from '../sortable-hoc/utils';
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
import {  Todo, updateTodo, addTodo, generateID, removeTodo } from '../databaseCalls';
let uniqid = require("uniqid");  
import Popover from 'material-ui/Popover';
import { Category } from '../MainContainer';
import { TextField } from 'material-ui'; 
import { ThingsCalendar } from './ThingsCalendar';
import { Data } from './ResizableHandle'; 
import { insideTargetArea, daysRemaining, replace, remove, todoChanged, uniq, daysLeftMark, generateTagElement, renderSuggestion } from '../utils';
import { SelectedCategoryLabel } from './SelectedCategoryLabel';
import { DeadlineLabel } from './DeadlineLabel';
let Autosuggest = require('react-autosuggest');
  

  




 

export interface ChecklistItem{
    text : string, 
    checked : boolean,
    idx : number,
    key? : string  
}  
 



export interface TodoInputState{
    formId : string, 
    checklist : ChecklistItem[], 
    showtagsPopover : boolean, 
    checked:boolean,
    completed:Date,
    currentTodo : string,  
    currentNote : string,
    attachedDate : Date,
    showCalendar : boolean,  
    currentTag : string,
    attachedTags : string[],
    open : boolean,
    reminder : any,
    newSelectedCategory : Category,
    deadline : Date,
    selectedTags : string[], 
    tagsInputDisplay:boolean,
    showSimpleCalendar:boolean
}  
  


 
export interface TodoInputProps{ 
    dispatch : Function, 
    tags : string[], 
    todo : Todo, 
    rootRef : HTMLElement,  
    id:string
}   
 
  

 

export class TodoInput extends Component<TodoInputProps,TodoInputState>{
    


    calendarOrigin:HTMLElement;

    calendarSimpleOrigin:HTMLElement;

    tagsPopoverOrigin:HTMLElement;

    ref:HTMLElement;

    transitionOffset:number;

    checklistBuffer:ChecklistItem[];



    constructor(props){

        super(props);  

        this.checklistBuffer = [...this.props.todo.checklist]; 
         
        this.transitionOffset = 40; 

        this.state={  
              
            open : false,
            formId : this.props.todo._id, 
            showCalendar : false,  
            showtagsPopover : false, 
            currentTag : '', 
            tagsInputDisplay : false, 
            selectedTags : this.props.tags,
            showSimpleCalendar:false,   
 

            completed : this.props.todo.completed,

            checklist : this.props.todo.checklist,

            newSelectedCategory : this.props.todo.category as Category, 

            checked : this.props.todo.checked,

            attachedDate : this.props.todo.attachedDate,

            currentTodo : this.props.todo.title, 
  
            currentNote : this.props.todo.note, 

            deadline : this.props.todo.deadline, 

            attachedTags : this.props.todo.attachedTags, 

            reminder : this.props.todo.reminder
            
        }     
    }   


    onError = (e) => console.log(e);
    

    componentDidMount(){ 

        window.addEventListener("click", this.onOutsideClick);  
     

        this.setState({checklist:this.checklistBuffer});
  

        if(this.state.currentTodo.length===0)   
           setTimeout(() => this.setState({open:true}), 10);   

    }      
      

   
    componentWillUnmount(){

        window.removeEventListener("click", this.onOutsideClick);

    }
    

     
    enableDragOfThisItem = () => {
        
            this.ref["preventDrag"] = false; 

    }
    


    preventDragOfThisItem = () => {

           this.ref["preventDrag"] = true; 

    }


    todoFromState = () : Todo => ({
        _id : this.props.todo._id,  
        priority : this.props.todo.priority,
        attachedProjectsIds : this.props.todo.attachedProjectsIds,  
        status : this.props.todo.status,
        created : this.props.todo.created,  
        deleted : this.props.todo.deleted,
        completed : this.state.completed, 
        history : this.props.todo.history,    
        attachments : this.props.todo.attachments,
        type:"todo", 
        category :  this.state.newSelectedCategory,  
        title : this.state.currentTodo, 
        reminder : this.state.reminder, 
        checked : this.state.checked, 
        note : this.state.currentNote,
        checklist : this.state.checklist,  
        attachedTags : this.state.attachedTags,
        attachedDate : this.state.attachedDate,
        deadline : this.state.deadline 
    })

 

    onFieldsContainerClick = (e) => {   

        this.props.dispatch({type:"selectedTodoId", load:this.props.todo._id});
        
        if(!this.ref) 
            return; 

        this.preventDragOfThisItem();


        if(!this.state.open)
            this.setState({open:true});  

    } 
 

 
    onNotesChange = (event,newValue:string) => this.setState({currentNote:newValue})
    
 
 
    onNewTodoChange = (event,newValue:string) => this.setState({currentTodo:newValue})

    

    onOutsideClick = (e) => {

        if(this.ref===null || this.ref===undefined)
           return; 

        let rect = this.ref.getBoundingClientRect();

        let inside = false;

        let x = e.pageX;

        let y = e.pageY;
             
        let bottom = rect.bottom;
        
        let top = rect.top;
          

        if( x>rect.left && x<rect.right ) 

            if( y>rect.top && y<bottom )

                inside = true;  
              

        if(!inside){   

            if(this.state.open){
                  
                this.enableDragOfThisItem();

                this.setState(
                    
                    {open:false}, 
                       
                    () => {

                        this.props.dispatch({type:"selectedTodoId", load:null});
                         
                        let todo : Todo = this.todoFromState();   
                        
                        if(this.state.currentTodo.length===0 || todoChanged(this.props.todo,todo))
                           this.addTodoFromInput(todo);
                    }    

                ); 
            
            }

        }   

    }   
      



    updateTodo = (changedTodo:Todo) : void => {

        this.props.dispatch({type:"updateTodo",load:changedTodo});  

    }  
 



    removeTodo = (_id:string) : void => {

        this.props.dispatch({type:"removeTodo", load: _id});

    }   
    
    


    addTodoFromInput = (todo:Todo) : void => {
        
        if(this.state.currentTodo.length===0){

            removeTodo(todo._id); 

            this.removeTodo(todo._id);

        }else{  
 
            updateTodo(todo._id,todo,this.onError);

            this.updateTodo(todo); 

        }   
        
    } 
      

    appendChecklistIf = () => {

        let allNotEmpty = this.checklistBuffer.reduce((acc, val) => acc && val.text.length>0, true);
        
        if(allNotEmpty){

            this.checklistBuffer.push({
                checked:false, 
                text:'', 
                idx:this.checklistBuffer.length, 
                key: uniqid()
            });

            this.setState(
                {checklist:this.checklistBuffer}
            ); 

        } 

    }


    onCheckListEnterPress = (event) => {

        if (event.which == 13 || event.keyCode == 13) {

            this.setState(
        
                {checklist:this.checklistBuffer}, 

                this.appendChecklistIf

            );  

        }
    } 

 

    onChecklistItemBlur = (e) => {
         
        this.setState(
        
            {checklist:this.checklistBuffer}, 

            this.appendChecklistIf

        );  

    }



    onChecklistItemChange = (key:string, event, newText:string) => { 

            if(this.ref===null || this.ref===undefined)
               return; 

            let idx = this.checklistBuffer.findIndex((c:ChecklistItem) => c.key===key);
            
            if(idx!==-1){

                let updatedItem = this.checklistBuffer[idx];
                    
                updatedItem.text = newText;

                let checklist = replace(this.checklistBuffer, updatedItem, idx);
                
                this.checklistBuffer = checklist;

            }

    } 

    

    

    onChecklistItemCheck = (e, key:string) => {

        if(this.ref===null || this.ref===undefined)
           return; 
 
        let idx = this.checklistBuffer.findIndex((c:ChecklistItem) => c.key===key);
         
        if(idx!==-1){

            let updatedItem = this.checklistBuffer[idx];
            
            updatedItem.checked=!updatedItem.checked;

            let checklist = replace(this.checklistBuffer, updatedItem, idx);   
             
            this.checklistBuffer = checklist; 
            
            this.setState({checklist:this.checklistBuffer});

        } 

    }
 


    attachTag = (tag) => {
        
        if(tag.length===0) 
            return;

        let tags = this.state.attachedTags;

        if(!Array.isArray(tags))
            tags = []; 

        tags.push(tag);

        this.setState({currentTag:'', attachedTags:uniq(tags), showtagsPopover:false, tagsInputDisplay:false});
    }



    
    onTagFieldEnterPress = (event) => {  

        if(event.key==="Enter"){

            this.attachTag(this.state.currentTag);

        } 
         
    }  
     


    onTagFieldBlur = (event) => {  

        this.attachTag(this.state.currentTag);

    } 



    getCheckListItem = (value:ChecklistItem, index:number) => {

        const DragHandle = SortableHandle(() => 
            <Reorder style={{ 
                        cursor: "default",
                        marginRight: "5px",  
                        color: "rgba(100, 100, 100, 0.17)"
                    }}
            />  
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
                <div  onClick={(e) => this.onChecklistItemCheck(e, value.key)}
                    style={{
                        backgroundColor:value.checked ? 'rgba(108, 135, 222, 0.8)' : '',
                        width:"15px", 
                        height:"14px",
                        borderRadius:"50px",
                        border:value.checked ? '' : "3px solid rgba(108, 135, 222, 0.8)",
                        boxSizing:"border-box",
                        marginRight:"5px",
                        marginLeft:"5px" 
                    }}  
                >        
                </div>  

                    <TextField  
                        id={value.key}
                        fullWidth={true}   
                        defaultValue={value.text}
                        hintStyle={{top:"3px", left:0, width:"100%", height:"100%"}}  
                        style={{height:"28px",cursor:"default"}}  
                        inputStyle={{fontWeight:600, color:"rgba(100,100,100,1)", fontSize:"16px"}}   
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


 
    createSortableItem = (index) => SortableElement(({value}) => this.getCheckListItem(value,index)) 
     


    getCheckList = (items:ChecklistItem[]) => { 
        
        return <ul style={{padding:0,margin:0}}>   
            {     
                items.map(      
                 (item:ChecklistItem, index) => { 
                    let SortableItem = this.createSortableItem(index); 
                    return <SortableItem  key={`item-${item.key}`} index={index} value={item} />
                  }
                ) 
            }   
        </ul>

    }    
        
     

    createSortableChecklist = () => {

        const SortableList = SortableContainer(({items}) => this.getCheckList(items),{withRef:true});

        return <SortableList
            shouldCancelStart={() => false}
            lockToContainerEdges={true}  
            distance={0}   
            items={this.state.checklist}   
            useDragHandle={true} 
            axis='y'   
            lockAxis={'y'} 
            onSortEnd={({oldIndex, newIndex}) => {

                let updateIndex = (el:ChecklistItem,idx:number) => {
                    el.idx=idx;
                    return el; 
                };

                let moved = arrayMove([...this.state.checklist],oldIndex,newIndex);

                let updated = moved.map(updateIndex);  

                this.checklistBuffer = [...updated]; 

                this.setState({checklist:updated}); 
                
            }} 
            onSortStart={() => {}}
        />

    }  
 


    onCheckBoxClick = (e) => {  

        if(!this.state.open){

            let checked = !this.state.checked;
 
            this.setState( 
                 
                {
                    checked, 
                    completed:checked ? new Date() : null
                }, 
                 
                () => {

                    let todo : Todo = this.todoFromState();   
    
                    if(this.state.currentTodo.length===0 || todoChanged(this.props.todo,todo))
                       this.addTodoFromInput(todo);
 
                } 
                
            ); 
 
        } 
 
    }

 

    onRightClickMenu = (e) => {

        if(!this.state.open){ 

            this.props.dispatch({
                type:"openRightClickMenu",  
                load:{ 
                    showRightClickMenu:true,
                    rightClickedTodoId:this.props.todo._id, 
                    rightClickMenuX:e.clientX-this.props.rootRef.offsetLeft, 
                    rightClickMenuY:e.clientY-this.props.rootRef.offsetTop+this.props.rootRef.scrollTop
                }
            });   

        }
 
    }
    


    onCheckListIconClick = (e) => {

        if(this.checklistBuffer.length===0){

            let firstItem = {checked:false, text:'', idx:0, key: uniqid()};

            this.checklistBuffer=[firstItem];

            this.setState({checklist:this.checklistBuffer}); 

        }

    }      

 
    onAutoSuggestInputChange = (event, { newValue }) => {
        this.setState({
            currentTag:newValue
        });
    }


    onFlagIconClick = (e) => this.setState({showSimpleCalendar:true})



    onTagsIconClick = (e) => this.setState({showtagsPopover:true})


    
    onCalendarIconClick = (e) => this.setState({showCalendar:true})



    closeCalendar = (e) => this.setState({showCalendar:false})



    onCloseTagsClick = (e) => this.setState({showtagsPopover:false})



    onCalendarDayClick = (day:Date,modifiers:Object,e:any) => {

        this.setState({
            showCalendar:false, attachedDate:day
        }) 

    }



    onCalendarSomedayClick = (e) => {

        this.setState({ 
            showCalendar:false, 
            newSelectedCategory:"someday"
        })

    }
    


    onCalendarTodayClick = (e) => {

        this.setState({ 
            showCalendar:false, 
            newSelectedCategory:"today",
            attachedDate:new Date()
        })

    } 
    


    onCalendarThisEveningClick = (e) => {

        this.setState({
            showCalendar:false, 
            newSelectedCategory:"evening",
            attachedDate:new Date()
        })

    }  
     


    onRemoveSelectedCategoryLabel = () => {

        this.setState({
            newSelectedCategory:this.props.todo.category as Category,
            attachedDate:null 
        })
 
    }  



    onCalendarAddReminderClick = (e) => {

        //this.setState({ 
        //    showCalendar:false, reminder:{} 
        //})

    }
    
    

    onCalendarClear = (e) => {

        this.setState({ 
            showCalendar:false,
            newSelectedCategory:this.props.todo.category as Category,
            attachedDate:null
        })

    }



    getSuggestionValue = (tag:string) => tag;
      


    getSuggestions = value => {
        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;
         
        return inputLength === 0 ? this.props.tags : this.props.tags.filter(tag =>
            tag.toLowerCase().slice(0, inputLength) === inputValue
        );
    }



    onSuggestionsFetchRequested = ({ value, reason }) => {
        this.setState({
          selectedTags: this.getSuggestions(value),
          tagsInputDisplay: true
        }); 
    }
    
 

    onSuggestionsClearRequested = () => {
        this.setState({ 
            selectedTags: [],
            tagsInputDisplay: false 
        });
    }


    selectButtonsToDisplay = () => {

        let buttonsNamesToDisplay : any = [
            "Calendar",
            "Tag",
            "Flag",
            "Add" 
        ]; 

        
        return buttonsNamesToDisplay;

    }
 

    render(){  
        
        let buttonsNamesToDisplay = this.selectButtonsToDisplay(); 

        return  <div  
            onClick={(e) => {e.stopPropagation();}}
            id={this.props.id}  
            onContextMenu={this.onRightClickMenu}
            style={{    
                width:"100%",     
                display:"flex",   
                alignItems:"center",   
                justifyContent:"center"
            }} 
        >  
  

  
 
        <div 
            ref={(e) => { this.ref=e; }} 
            style={{           
                transition: "box-shadow 0.4s ease-in-out, max-height 0.4s ease-in-out, transform 0.4s ease-in-out", 
                maxHeight:this.state.open ? "1000px" : "30px",
                width:"100%",        
                boxShadow:this.state.open ? "rgba(156, 156, 156, 0.3) 0px 0px 20px" : "", 
                borderRadius:"5px", 
                marginBottom:this.state.open ? "90px" : "10px", 
                transform:`translateY(${this.state.open ? this.transitionOffset : 0}px)`    
            }}
        >      
              
              
                <div   
                    className={this.state.open ? "" : "tasklist"}
                    style={{    
                        paddingLeft:"20px", 
                        paddingRight:"20px",  
                        transition: "max-height 0.4s ease-in-out", 
                        maxHeight:this.state.open ? "1000px" : "30px",
                        paddingTop:this.state.open?"20px":"0px",
                        paddingBottom:this.state.open?"20px":"0px",
                        caretColor:"cornflowerblue",
                        display:"flex"  
                    }}
                >       
 
                    <div style={{width:"5%", paddingTop:"8px"}}>
                        <div 
                        onClick = {this.onCheckBoxClick} 
                        style={{   
                            width: "14px",
                            border: this.state.checked ? '' : "2px solid rgba(200,200,200,0.7)",
                            borderRadius: "3px",
                            backgroundColor: this.state.checked ? "rgb(32,86,184)" : '', 
                            height: "14px",    
                            boxSizing: "border-box",   
                            display: "flex", 
                            alignItems: "center"
                        }}>   
                            { this.state.checked ? <Checked style={{color:"white"}}/> : null }
                        </div> 
                    </div>   

                    <div 
                        style={{   
                            display:"flex",
                            flexDirection:"column",
                            width:"90%", 
                            overflow:"hidden"
                        }}   
                        onClick={this.onFieldsContainerClick}
                    >   
                   
                        <div style={{display:"flex"}}>
                            <TextField   
                                hintText = "New To-Do"   
                                id={this.props.todo._id}
                                defaultValue = {this.state.currentTodo} 
                                fullWidth = {true}   
                                onChange={this.onNewTodoChange}
                                inputStyle = {{
                                    fontWeight:600, 
                                    color:"rgba(100,100,100,1)", 
                                    fontSize:"16px",
                                    cursor:"default"
                                }}  
                                hintStyle = {{top:"3px", left:0, width:"100%", height:"100%"}}   
                                style = {{height:"28px"}}      
                                underlineFocusStyle = {{borderColor: "rgba(0,0,0,0)"}}    
                                underlineStyle = {{borderColor: "rgba(0,0,0,0)"}}  
                            /> 
 
                            { daysLeftMark(this.state.open, this.state.deadline, false) }

                        </div>  

                            <div style={{
                                transition: "opacity 0.5s ease-in-out",
                                opacity:this.state.open ? 1 : 0
                            }}>      
                                  
                                <TextField 
                                    id={ `${this.props.todo._id}note`  }
                                    defaultValue={this.state.currentNote} 
                                    hintText="Notes"
                                    fullWidth={true}  
                                    hintStyle={{ 
                                        top: "3px", left: 0,  
                                        width:"100%", height:"100%"
                                    }}     
                                    onChange={this.onNotesChange}
                                    style={{
                                        height:"28px", 
                                        marginBottom:"15px", 
                                        marginTop:"15px",
                                        cursor:"default"
                                    }}    
                                    inputStyle={{
                                        fontFamily:"sans-serif",
                                        fontSize:"14px"   
                                    }} 
                                    underlineFocusStyle={{borderColor: "rgba(0,0,0,0)"}} 
                                    underlineStyle={{borderColor: "rgba(0,0,0,0)"}}   
                                />  
                                   <div 
                                        style={{marginTop:"5px",marginBottom:"15px"}}
                                        onClick={(e) => {e.stopPropagation();}}
                                   > 
                                      {this.createSortableChecklist()}  
                                   </div>
                                {    

                                    this.state.attachedTags.length===0 ? null : 
 
                                    <div  
                                        style={{
                                            display:"flex", 
                                            alignItems:"center", 
                                            justifyContent:"flex-start", 
                                            flexWrap:"wrap"
                                        }}  
                                    >    
                                        {this.state.attachedTags.map(generateTagElement)} 
                                    { 
                                    <Autosuggest
                                        suggestions={this.state.selectedTags}
                                        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                                        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                                        getSuggestionValue={this.getSuggestionValue}
                                        onSuggestionSelected={(event, {suggestion, suggestionValue}) => {
                                            this.attachTag(suggestionValue);
                                        }}  
                                        renderSuggestion={renderSuggestion}  
                                        shouldRenderSuggestions={(v) => true}
                                        //alwaysRenderSuggestions={true}  
                                        theme={{suggestionsList:"suggestionsList"}}
                                        renderSuggestionsContainer={  
                                            ({containerProps, children, query}) => 
                                                <div    
                                                    {... containerProps}  
                                                    style={{
                                                        zIndex:200,
                                                        backgroundColor: "rgb(39, 43, 53)",
                                                        borderRadius: "10px", 
                                                        padding:this.state.tagsInputDisplay &&  
                                                                this.state.selectedTags.length===0 ? "2px 2px" : "",
                                                        position: "absolute", 
                                                        maxHeight: "100px",  
                                                        width: "140px", 
                                                        cursor: "pointer" 
                                                    }}
                                                >  
                                                <div    
                                                    className={"darkscroll"}
                                                    style={{
                                                        overflowX: "hidden", 
                                                        maxHeight: "100px", 
                                                        maxWidth: "140px"
                                                    }}
                                                >
                                                { children }
                                                </div>   
                                                </div>  
                                        }      
                                        inputProps={{
                                            style:{  
                                                borderTop: "none",
                                                borderLeft: "none", 
                                                borderRight: "none",
                                                borderBottom: "1px solid rgb(171, 212, 199)",
                                                boxSizing: "content-box", 
                                                color: "rgb(100, 100, 100)",
                                                height: "25px",
                                                fontWeight: "bold",   
                                                width: "140px",
                                                fontFamily: "sans-serif",
                                                fontSize: "16px",
                                                outline: "none"
                                            },
                                            onKeyPress: (event) => {
                                                if (event.which == 13 || event.keyCode == 13) {
                                                    this.attachTag(this.state.currentTag);
                                                }  
                                            },
                                            placeholder: '', 
                                            value:this.state.currentTag,
                                            onChange:this.onAutoSuggestInputChange
                                        }}
                                    />
                                    } 
                                    </div>
                                }    
                            </div> 

                    </div>   
                </div>   

 
                {  

                    ["evening","today","someday"].indexOf(this.state.newSelectedCategory)===-1 ? null :

                    <div style={{
                        transition: "opacity 0.5s ease-in-out",
                        opacity:this.state.open ? 1 : 0
                    }}>            
                        <SelectedCategoryLabel
                          onRemove={this.onRemoveSelectedCategoryLabel}
                          selectedCategory={this.state.newSelectedCategory}
                        />   
                    </div>  
  
                }  
 
 
                { 

                    !this.state.deadline ? null :

                    <div style={{
                        transition : "opacity 0.5s ease-in-out",
                        opacity : this.state.open ? 1 : 0
                    }}>
                        <DeadlineLabel
                            onRemoveDeadline={() => this.setState({deadline:null})}
                            deadline={this.state.deadline} 
                        /> 
                    </div> 
  
                }
 
  
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    bottom: 0, 
                    padding: "5px", 
                    right: 0  
                }}>   

                    <ThingsCalendar
                        close = {this.closeCalendar}   
                        open = {this.state.showCalendar}
                        anchorEl = {this.calendarOrigin} 
                        origin = {{vertical: "center", horizontal: "right"}} 
                        point = {{vertical: "center", horizontal: "right"}} 
                        simple = {false}   
                        onDayClick = {this.onCalendarDayClick}  
                        onSomedayClick = {this.onCalendarSomedayClick}   
                        onTodayClick = {this.onCalendarTodayClick} 
                        onThisEveningClick = {this.onCalendarThisEveningClick}
                        onAddReminderClick = {this.onCalendarAddReminderClick}
                        onClear = {this.onCalendarClear}
                    /> 
   

                    <ThingsCalendar  
                        close = {() => this.setState({showSimpleCalendar:false})}    
                        open = {this.state.showSimpleCalendar}    
                        anchorEl = {this.calendarSimpleOrigin} 
                        origin = {{vertical: "center", horizontal: "right"}} 
                        point = {{vertical: "center", horizontal: "right"}} 
                        simple = {true}     
                        onDayClick = {(day:Date,modifiers:Object,e:any) => {

                            let remaining = daysRemaining(day);
                             
                            if(remaining>0){

                                this.setState({ showSimpleCalendar:false, deadline:day }) 

                            }

                        }}   
                        onClear = {(e) => {

                            this.setState({ showSimpleCalendar:false, deadline:null }) 

                        }}
                    /> 


                    <TagsPopover   
                        tags={this.props.tags}
                        attachTag={this.attachTag}
                        close = {this.onCloseTagsClick}
                        open = {this.state.showtagsPopover}   
                        anchorEl = {this.tagsPopoverOrigin} 
                        origin = {{vertical: "center", horizontal: "right"}} 
                        point = {{vertical: "center", horizontal: "right"}} 
                    />
                    {     
                        buttonsNamesToDisplay.indexOf("Calendar")===-1 ? null : 

                        <div ref={(e) => { this.calendarOrigin=e; }}>  
                            <IconButton 
                            onClick = {this.onCalendarIconClick} 
                            iconStyle={{  
                                transition: "opacity 0.5s ease-in-out",
                                opacity: this.state.open ? 1 : 0,
                                color:"rgb(207,206,207)",
                                width:"25px",   
                                height:"25px"  
                            }}>      
                                <Calendar /> 
                            </IconButton> 
                        </div> 

                    } 
                    {
                        buttonsNamesToDisplay.indexOf("Tag")===-1 ? null :  

                        <div ref={(e) => { this.tagsPopoverOrigin=e;}} > 
                            <IconButton   
                                onClick = {this.onTagsIconClick}
                                iconStyle={{ 
                                    transition: "opacity 0.5s ease-in-out",
                                    opacity: this.state.open ? 1 : 0,
                                    color:"rgb(207,206,207)",
                                    width:"25px",  
                                    height:"25px" 
                                }} 
                            >         
                                <TriangleLabel />
                            </IconButton>    
                        </div>
                    }
                    {   
                        buttonsNamesToDisplay.indexOf("Add")===-1 ? null :  

                        <IconButton      
                            onClick = {this.onCheckListIconClick}
                            iconStyle={{ 
                                transition: "opacity 0.5s ease-in-out",
                                opacity: this.state.open ? 1 : 0,
                                color:"rgb(207,206,207)",
                                width:"25px", 
                                height:"25px" 
                            }}
                        >      
                            <List />
                        </IconButton> 
                    } 
                    {    
                        buttonsNamesToDisplay.indexOf("Flag")===-1 ? null :  

                        <div ref={(e) => { this.calendarSimpleOrigin=e; }}>  
                            <IconButton 
                                onClick = {this.onFlagIconClick} 
                                iconStyle={{  
                                    transition: "opacity 0.5s ease-in-out",
                                    opacity: this.state.open ? 1 : 0,
                                    color:"rgb(207,206,207)",
                                    width:"25px", 
                                    height:"25px" 
                                }}
                            >     
                                <Flag />  
                            </IconButton> 
                        </div> 
                    } 
                </div>   
        </div>
        </div> 
        
    } 
}  
 
 




 



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
                open={this.props.open}
                style={{background:"rgba(39, 43, 53, 0)", backgroundColor:"rgb(39, 43, 53, 0)"}}
                anchorEl={this.props.anchorEl}
                onRequestClose={() => this.props.close()}
                anchorOrigin={this.props.origin} 
                targetOrigin={this.props.point} 
                zDepth={0}
            >     
                <div className={"darkscroll"}
                        style={{  
                            borderRadius:"10px",  
                            width:"140px"
                        }}> 
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
 