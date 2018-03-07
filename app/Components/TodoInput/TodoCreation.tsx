import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';  
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
import IconButton from 'material-ui/IconButton';   
import { Component } from "react";  
import Flag from 'material-ui/svg-icons/image/assistant-photo';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Calendar from 'material-ui/svg-icons/action/date-range';
import List from 'material-ui/svg-icons/action/list';
import { DateCalendar, DeadlineCalendar } from '.././ThingsCalendar';
import { isToday, getTime, setTime } from '../../utils/utils'; 
import { Todo, removeTodo, updateTodo, Project } from '../../database';
import { Checklist, ChecklistItem } from './TodoChecklist';
import { Category } from '../MainContainer'; 
import { TodoTags } from './TodoTags';
import { TagsPopup } from './TagsPopup';
import { TodoInputLabel } from './TodoInputLabel'; 
import { uniq, isEmpty, isNil, not, remove, cond, equals, any } from 'ramda';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { Observable } from 'rxjs/Rx';
import { TodoInputLabels, TodoInputTopLevel, TodoInputMiddleLevel } from './TodoInput';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { generateEmptyTodo } from '../../utils/generateEmptyTodo';
import { generateId } from '../../utils/generateId';
import { insideTargetArea } from '../../utils/insideTargetArea';
import { googleAnalytics } from '../../analytics';
import { isDate } from '../../utils/isSomething';
  

export interface TodoCreationFormState{  
    open : boolean,
    category : Category,
    title : string,  
    note : string,
    completedWhen : Date,
    completedSet : Date,
    reminder : Date,
    deadline : Date,
    deleted : Date,
    attachedDate : Date,  
    attachedTags : string[],
    tag : string, 
    translateX : number,
    display : string,
    opacity:number,
    checklist : ChecklistItem[],
    showTags : boolean,
    showDateCalendar : boolean,  
    showTagsSelection : boolean,
    showChecklist : boolean,   
    showDeadlineCalendar : boolean
}   

    
export interface TodoCreationFormProps{ 
    dispatch:Function,  
    selectedCategory:Category, 
    selectedProjectId:string,
    selectedAreaId:string,
    todos:Todo[],
    projects:Project[], 
    todo:Todo,  
    rootRef:HTMLElement
}    
 
  
export class TodoCreationForm extends Component<TodoCreationFormProps,TodoCreationFormState>{
    calendar:HTMLElement; 
    deadline:HTMLElement;
    tags:HTMLElement;
    ref:HTMLElement; 
    inputRef:HTMLElement; 
    subscriptions:Subscription[]; 
 
    constructor(props){
        super(props);  

        this.subscriptions = [];

        let {
            category, 
            title,  
            note, 
            completedWhen,
            completedSet,
            reminder,
            deadline,
            deleted,
            attachedDate, 
            attachedTags, 
            checklist 
        } = this.props.todo;

        this.state={   
            open:false,
            tag:'',
            category, 
            title,
            note,  
            display:"flex",
            translateX:0,
            opacity:1,
            completedWhen,
            completedSet,
            reminder, 
            deadline, 
            deleted, 
            attachedDate, 
            attachedTags, 
            checklist, 
            showDateCalendar:false,  
            showTagsSelection:false, 
            showTags:attachedTags.length>0, 
            showChecklist:checklist.length>0,  
            showDeadlineCalendar:false
        };       
    }


    onError = (error) => globalErrorHandler(error);
    
    
    componentDidMount(){  

        this.subscriptions.push(
            Observable.fromEvent(window,"click").subscribe(this.onOutsideClick)
        );

        this.resetCreationForm(false);
        this.preventDragOfThisItem(); 
    }          
 

    componentDidUpdate(prevProps:TodoCreationFormProps,prevState:TodoCreationFormState){
        let { open } = this.state; 
        this.preventDragOfThisItem();
    }   


    resetCreationForm = (open) => {
        let emptyTodo = generateEmptyTodo(generateId(), this.props.selectedCategory, 0); 
        let newState : TodoCreationFormState = {
            ...this.stateFromTodo(this.state,emptyTodo as any),
            open, 
            showDateCalendar:false,     
            showTagsSelection:false, 
            showTags:false,
            showChecklist:false,   
            showDeadlineCalendar:false 
        };
        this.setState(newState, () => { if(this.inputRef && open){ this.inputRef.focus(); }});     
    };   
 

    onFieldsContainerClick = (e) => {    
        e.stopPropagation();     
        let {open} = this.state;
        let {dispatch} = this.props;
        this.preventDragOfThisItem();

        if(not(open)){    
            this.setState( 
                {open:true}, 
                () => { 
                    if(this.inputRef){
                        this.inputRef.focus(); 
                        dispatch({type:"showRepeatPopup", load:false}); 
                        dispatch({type:"showRightClickMenu", load:false});
                    } 
                }
            ); 
        }    
    };   
      
    
    onWindowEnterPress = (e) => {   
        if(e){ if(e.keyCode!==13){ return } }

        if(this.state.open){
            this.addTodo();
            this.resetCreationForm(true);
        }
    };        
    

    onOutsideClick = (e) => {
        let { rootRef, dispatch } = this.props;
        let { open } = this.state;

        if(isNil(this.ref)){ return }
        if(not(open)){ return }

        let x = e.pageX;
        let y = e.pageY; 

        let inside = insideTargetArea(rootRef,this.ref,x,y);
     
        if(not(inside)){  
            this.setState(
                {open:false}, 
                () => {
                   this.addTodo(); 
                   this.resetCreationForm(false); 
                }
            ); 
        }   
    };    


    addTodo = () => {
        let todo : Todo = this.todoFromState(); 
        if(isEmpty(todo.title)){ return };
        let {selectedCategory,dispatch,selectedProjectId,selectedAreaId} = this.props;
        let timeSeconds = Math.round(new Date().getTime() / 1000);

        googleAnalytics.send(  
            'event', 
            { 
                ec:'TodoCreation', 
                ea:`Todo Created ${new Date().toString()}`, 
                el:'Todo Created', 
                ev:timeSeconds 
            }
        )  
        .then(() => console.log('Todo created')) 
        .catch(err => this.onError(err)); 

        let todos = [...this.props.todos].sort((a:Todo,b:Todo) => a.priority-b.priority);
    
        if(not(isEmpty(todos))){ 
           todo.priority = todos[0].priority - 1; 
        }   
        
        dispatch({type:"addTodo", load:todo}); 

        if(selectedCategory==="project"){ 
            dispatch({  
                type:"attachTodoToProject", 
                load:{ projectId:selectedProjectId, todoId:todo._id }
            });    
        }else if(selectedCategory==="area"){
            dispatch({
                type:"attachTodoToArea", 
                load:{ areaId:selectedAreaId, todoId:todo._id }
            });  
        }
    };  


    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = []; 
    };

  
    stateFromTodo = (state:TodoCreationFormState,todo:Todo) : TodoCreationFormState => ({   
        ...state,
        category:todo.category, 
        title:todo.title,
        note:todo.note,  
        completedWhen:todo.completedWhen,
        completedSet:todo.completedSet,
        reminder:todo.reminder, 
        deadline:todo.deadline, 
        deleted:todo.deleted, 
        attachedDate:todo.attachedDate, 
        attachedTags:todo.attachedTags, 
        checklist:todo.checklist  
    }); 
    

    todoFromState = () : Todo => ({
        _id : this.props.todo._id,
        category : this.state.category, 
        type : "todo",
        title : this.state.title,
        priority : this.props.todo.priority,
        note : this.state.note,  
        checklist : this.state.checklist,
        reminder : this.state.reminder,  
        deadline : this.state.deadline,
        created : this.props.todo.created,
        deleted : this.state.deleted, 
        attachedDate : this.state.attachedDate,  
        attachedTags : this.state.attachedTags, 
        completedWhen:this.state.completedWhen,
        completedSet:this.state.completedSet,
        group:this.props.todo.group   
    }); 
     

    enableDragOfThisItem = () => {
        if(this.ref){
           this.ref["preventDrag"] = false;  
        }
    };

    
    preventDragOfThisItem = () => {
        if(this.ref){
           this.ref["preventDrag"] = true; 
        }
    };


    onAttachTag = (tag:string) => {
        if(isEmpty(tag)){ return };
        this.setState({tag:'', attachedTags:uniq([...this.state.attachedTags, tag])});
    };


    onRemoveTag = (tag:string) => {
        let {attachedTags} = this.state;
        if(tag.length===0){ return } 
        let idx = attachedTags.findIndex( v => v===tag );
        if(idx===-1){ return }
        this.setState({attachedTags:remove(idx,1,attachedTags)});
    };


    onNoteChange = (event) : void => this.setState({note:event.target.value});


    onTitleChange = (event) :void => this.setState({title:event.target.value});

   
    onRightClickMenu = (e) => {  
        let {open} = this.state;
        let {dispatch} = this.props;

        if(not(open)){ 
            dispatch({ 
                type:"openRightClickMenu",  
                load:{   
                   showRightClickMenu:true, 
                   rightClickedTodoId:this.props.todo._id, 
                   rightClickMenuX:e.clientX-this.props.rootRef.offsetLeft,
                   rightClickMenuY:e.clientY+this.props.rootRef.scrollTop 
                } 
            });     

            dispatch({type:"showRepeatPopup", load:false});
        }     
    };  

 
    onChecklistButtonClick = (e) => {
        e.stopPropagation();
        this.setState({showChecklist:true});
    }; 
      

    onFlagButtonClick = (e) => {
        e.stopPropagation();
        this.setState({showDeadlineCalendar:true});
    };


    closeDeadlineCalendar = () => { 
        this.setState({showDeadlineCalendar:false});
    }; 
 

    onCalendarButtonClick = (e) => {
        e.stopPropagation();
        this.setState({showDateCalendar:true});
    };
    

    onTagsButtonClick = (e) => { 
        e.stopPropagation();
        this.setState({showTagsSelection:true,showTags:true});
    };   


    closeTagsSelection = (e) => {
        this.setState({showTagsSelection:false});
    };


    onDeadlineCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        e.stopPropagation();
        this.setState({deadline:day}, () => this.closeDeadlineCalendar());
    };

 
    onDeadlineCalendarClear = (e:any) : void => {
        e.stopPropagation();
        let {selectedCategory} = this.props;
        this.setState(
            { 
                deadline:null, 
                category:selectedCategory 
            }, 
            () => this.closeDeadlineCalendar()
        );
    };  


    onCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        e.stopPropagation(); 

        let attachedDate = new Date(day.getTime());
        let reminder = this.state.reminder;

        if(isDate(reminder)){
           let time = getTime(reminder);
           attachedDate = setTime(attachedDate,time); 
           reminder = new Date(attachedDate.getTime());
        }
        
        this.setState({attachedDate,reminder,category:isToday(attachedDate) ? "today" : "next"});   
    };  
     

    onCalendarSomedayClick = (e) => {
        e.stopPropagation();
        this.setState({
            category:"someday",
            deadline:null,
            attachedDate:null,
            showDateCalendar:false
        });  
    };


    onCalendarTodayClick = (e) => {
        e.stopPropagation();

        let attachedDate = new Date();
        let reminder = this.state.reminder;

        if(isDate(reminder)){
           let time = getTime(reminder);
           attachedDate = setTime(attachedDate,time); 
           reminder = new Date(attachedDate.getTime());
        }

        this.setState({category:"today", attachedDate, reminder, showDateCalendar:false});
    }; 


    onCalendarThisEveningClick = (e) => {
        e.stopPropagation();

        let attachedDate = new Date();
        let reminder = this.state.reminder;

        if(isDate(reminder)){
           let time = getTime(reminder);
           attachedDate = setTime(attachedDate,time); 
           reminder = new Date(attachedDate.getTime());
        }

        this.setState({category:"evening", attachedDate, reminder, showDateCalendar:false});
    }; 


    onCalendarAddReminderClick = (reminder:Date) : void => this.setState({
        reminder, 
        attachedDate:reminder, 
        showDateCalendar:false
    });


    onRemoveReminderClick = () : void => this.setState({reminder:null});


    onCalendarClear = (e) => {
        e.stopPropagation();
        let {todo,selectedCategory} = this.props;
        this.setState({  
            category:selectedCategory as Category,
            attachedDate:null, 
            reminder:null,
            showDateCalendar:false  
        })  
    }; 
  

    render(){  
        let {selectedCategory} = this.props; 
        let {
            open, deleted, attachedDate, title, attachedTags, 
            note, deadline, showChecklist, completedWhen, checklist, showTags,
            category, completedSet, showDateCalendar, showTagsSelection   
        } = this.state;

        let attachedDateToday = isToday(attachedDate);
        let deadlineToday = isToday(deadline); 
        let todayCategory : boolean = attachedDateToday || deadlineToday;
        
        let daysLeft = 0;
        let flagColor = "rgba(100,100,100,0.7)";
        let canRepeat = false; 
 
        return  <div    
            onKeyDown={this.onWindowEnterPress}  
            onContextMenu={this.onRightClickMenu} 
            style={{    
                marginTop:"5px", 
                marginBottom:"5px",  
                width:"100%",   
                WebkitUserSelect:"none",
                display:this.state.display,     
                transform:`translateX(${this.state.translateX}%)`, 
                opacity:this.state.opacity,
                alignItems:"center",    
                justifyContent:"center" 
            }}   
        >     
        <div      
            ref={(e) => {this.ref=e;}}   
            style={{             
                width:"100%",   
                display:"inline-block", 
                transition:"box-shadow 0.2s ease-in-out, max-height 0.2s ease-in-out", 
                maxHeight:open ? "1000px" : "70px",
                boxShadow:open ? "rgba(156, 156, 156, 0.3) 0px 0px 20px" : "", 
                borderRadius:"5px", 
            }}     
        >        
            <div 
                className={open ? "" : "tasklist"}
                style={{    
                    paddingTop:open ? "20px":"5px",
                    paddingBottom:open ? "20px":"5px", 
                    paddingLeft:"20px", 
                    paddingRight:"20px",   
                    alignItems:"center", 
                    minHeight:"30px",
                    transition: "max-height 0.2s ease-in-out", 
                    caretColor:"cornflowerblue",   
                    display:"flex"
                }}        
                onClick={this.onFieldsContainerClick}  
            >          
                <div style={{display:"flex", flexDirection:"column", paddingTop:"4px", width:"100%"}}>
                        <TodoInputTopLevel 
                            onWindowEnterPress={this.onWindowEnterPress}
                            groupTodos={false}
                            setInputRef={e => {this.inputRef=e;}}
                            onRestoreButtonClick={() => {}}
                            onCheckBoxClick={() => {}}
                            onTitleChange={this.onTitleChange} 
                            open={open}  
                            selectedCategory={selectedCategory}
                            relatedProjectName={null}
                            flagColor={flagColor}   
                            deleted={this.state.deleted}
                            completedSet={this.state.completedSet}
                            completedWhen={this.state.completedWhen}
                            reminder={this.state.reminder}
                            checklist={this.state.checklist}
                            group={null} 
                            attachedTags={this.state.attachedTags}
                            category={category}
                            attachedDate={attachedDate}
                            deadline={deadline}
                            title={title}
                            note={note} 
                        />   
                    {    
                        not(open) ? null :    
                        <TodoInputMiddleLevel 
                            onNoteChange={this.onNoteChange}
                            onAttachTag={this.onAttachTag}
                            onRemoveTag={this.onRemoveTag}
                            updateChecklist={(checklist:ChecklistItem[]) => this.setState({checklist})}
                            closeChecklist={() => this.setState({showChecklist:false})}
                            closeTags={() => this.setState({showTags:false})}
                            open={open} 
                            showChecklist={showChecklist}
                            showTags={showTags}
                            _id={this.props.todo._id}
                            note={note}
                            checklist={checklist}
                            attachedTags={attachedTags}
                        />  
                    }
                </div>    
            </div>   


        {
            not(open) ? null :  
            <TodoInputLabels 
                onRemoveTodayLabel={() => {
                    let {selectedCategory, todo, dispatch} = this.props;
                    let {deadline,attachedDate} = this.state;

                    if(selectedCategory==="today"){ return }

                    if(isToday(deadline) && isToday(attachedDate)){
                       this.setState({category:selectedCategory, attachedDate:null, deadline:null});
                    }else if(isToday(deadline)){
                       this.setState({category:selectedCategory, deadline:null});
                    }else if(isToday(attachedDate)){
                       this.setState({category:selectedCategory, attachedDate:null});
                    }
                }}
                onRemoveUpcomingLabel={() => {
                    let {selectedCategory, todo, dispatch} = this.props;
                    let {attachedDate} = this.state;
                    if(selectedCategory==="today" && isToday(attachedDate)){ return }

                    if(isDate(deadline)){
                        this.setState({attachedDate:null});
                     }else{
                        this.setState({category:selectedCategory, attachedDate:null});
                     }
                }}
                onRemoveSomedayLabel={() => {
                    let {selectedCategory, todo, dispatch} = this.props;
                    if(selectedCategory==="someday"){ return }
                    this.setState({category:selectedCategory, attachedDate:null});
                }}
                onRemoveDeadlineLabel={() => {
                    let {deadline} = this.state;
                    if(isDate(attachedDate)){
                        this.setState({deadline:null});
                    }else{
                        this.setState({category:selectedCategory, deadline:null});
                    }
                }}
                todayCategory={isToday(attachedDate) || isToday(deadline)}
                open={open} 
                category={category}
                attachedDate={attachedDate}
                deadline={deadline}
            />
        }
        {        
            not(open) ? null :
            <div style={{
                display:"flex", 
                alignItems:"center",
                justifyContent:"flex-end",
                bottom:0, 
                padding:"5px",  
                right:0, 
                zIndex:30001    
            }}>  
            {     
                <div ref={(e) => {this.calendar=e;}}>  
                    <IconButton 
                        onClick = {this.onCalendarButtonClick} 
                        iconStyle={{   
                            transition: "opacity 0.2s ease-in-out",
                            opacity: this.state.open ? 1 : 0,
                            color:"rgb(207,206,207)",
                            width:25,   
                            height:25 
                        }}
                    >      
                        <Calendar /> 
                    </IconButton> 
                </div> 
            } 
            {
                <div ref={(e) => {this.tags=e;}} > 
                    <IconButton   
                        onClick = {this.onTagsButtonClick}
                        iconStyle={{ 
                            transition: "opacity 0.2s ease-in-out",
                            opacity: this.state.open ? 1 : 0,
                            color:"rgb(207,206,207)",
                            width:25,  
                            height:25  
                        }} 
                    >         
                        <TriangleLabel />
                    </IconButton>    
                </div> 
            }
            {   
                this.state.showChecklist ? null :     
                <IconButton      
                    onClick = {this.onChecklistButtonClick}
                    iconStyle={{ 
                        transition: "opacity 0.2s ease-in-out",
                        opacity: this.state.open ? 1 : 0,
                        color:"rgb(207,206,207)",
                        width:25, 
                        height:25
                    }} 
                >       
                    <List />
                </IconButton>  
            } 
            {     
                <div ref={(e) => {this.deadline=e;}}>  
                    <IconButton 
                        onClick = {this.onFlagButtonClick} 
                        iconStyle={{   
                            transition: "opacity 0.2s ease-in-out",
                            opacity: this.state.open ? 1 : 0,
                            color:"rgb(207,206,207)",
                            width:25, 
                            height:25 
                        }}
                    >     
                        <Flag />  
                    </IconButton> 
                </div>  
            }  
            <DateCalendar 
                close={() => this.setState({showDateCalendar:false})}
                open={showDateCalendar}
                origin={{vertical:"center",horizontal:"right"}} 
                point={{vertical:"center",horizontal:"right"}}  
                anchorEl={this.calendar}
                rootRef={this.props.rootRef}
                reminder={this.state.reminder} 
                attachedDate={this.state.attachedDate}
                onDayClick={this.onCalendarDayClick}
                onSomedayClick={this.onCalendarSomedayClick}
                onTodayClick={this.onCalendarTodayClick} 
                onRepeatTodo={null}
                onThisEveningClick={this.onCalendarThisEveningClick}
                onAddReminderClick={this.onCalendarAddReminderClick}
                onRemoveReminderClick={this.onRemoveReminderClick}
                onClear={this.onCalendarClear}  
            />  
            <TagsPopup
                {  
                    ...{
                        attachTag:this.onAttachTag,
                        close:this.closeTagsSelection,
                        open:this.state.showTagsSelection,   
                        anchorEl:this.tags,
                        origin:{vertical:"center",horizontal:"right"},
                        point:{vertical:"center",horizontal:"right"},
                        rootRef:this.props.rootRef
                    } as any
                } 
            /> 
            <DeadlineCalendar  
                close={this.closeDeadlineCalendar}
                onDayClick={this.onDeadlineCalendarDayClick}
                open={this.state.showDeadlineCalendar}
                origin={{vertical:"center",horizontal:"right"}} 
                point={{vertical:"center",horizontal:"right"}} 
                anchorEl={this.deadline}
                onClear={this.onDeadlineCalendarClear}
                rootRef={this.props.rootRef}
            />       
            </div>   
        }     
        </div>
    </div> 
    } 
}   
  
  