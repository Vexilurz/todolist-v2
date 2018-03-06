import './assets/fonts/index.css'; 
import './assets/calendarStyle.css';  
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
import BusinessCase from 'material-ui/svg-icons/content/archive';
import Arrow from 'material-ui/svg-icons/navigation/arrow-forward';
import ThreeDots from 'material-ui/svg-icons/navigation/more-horiz'; 
import Adjustments from 'material-ui/svg-icons/image/tune';
import OverlappingWindows from 'material-ui/svg-icons/image/filter-none'; 
import Flag from 'material-ui/svg-icons/image/assistant-photo'; 
import NewProjectIcon from 'material-ui/svg-icons/image/timelapse';
import Plus from 'material-ui/svg-icons/content/add';
import Trash from 'material-ui/svg-icons/action/delete';
import Search from 'material-ui/svg-icons/action/search'; 
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Logbook from 'material-ui/svg-icons/av/library-books';
import Audiotrack from 'material-ui/svg-icons/image/audiotrack';
import Calendar from 'material-ui/svg-icons/action/date-range';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import { ipcRenderer, remote } from 'electron'; 
import AutosizeInput from 'react-input-autosize';
import { createStore } from "redux"; 
import { Provider, connect } from "react-redux";
import List from 'material-ui/svg-icons/action/list';
import { 
    cond, assoc, isNil, not, defaultTo, map, isEmpty, 
    uniq, remove, contains, append, adjust, 
    compose, flatten, concat, prop, equals  
} from 'ramda';
let moment = require("moment");
import Popover from 'material-ui/Popover';
import Alert from 'material-ui/svg-icons/alert/add-alert';
import Checked from 'material-ui/svg-icons/navigation/check';
import Inbox from 'material-ui/svg-icons/content/inbox';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
let uniqid = require("uniqid"); 
import Clear from 'material-ui/svg-icons/content/clear';
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import Chip from 'material-ui/Chip';
import DayPicker from 'react-day-picker'; 
import RaisedButton from 'material-ui/RaisedButton';
import { Config, getConfig } from './utils/config';
import { wrapMuiThemeLight } from './utils/wrapMuiThemeLight';
import { generateId } from './utils/generateId';
import { generateEmptyTodo } from './utils/generateEmptyTodo';
import { daysRemaining } from './utils/daysRemaining';
import { insideTargetArea } from './utils/insideTargetArea';
import { chooseIcon } from './utils/chooseIcon';
import { uppercase } from './utils/uppercase';
import { SortableContainer } from './Components/CustomSortableContainer';
import { arrayMove } from './utils/arrayMove';
import { ChecklistItem, Checklist } from './Components/TodoInput/TodoChecklist';
import { globalErrorHandler } from './utils/globalErrorHandler';
import { isString, isDate } from './utils/isSomething';
import { isToday } from './utils/utils';
import { isDev } from './utils/isDev';
import TextareaAutosize from 'react-autosize-textarea';
import { TodoTags } from './Components/TodoInput/TodoTags';
import { TagsPopup } from './Components/TodoInput/TagsPopup';
injectTapEventPlugin();  


window.onerror = function (msg, url, lineNo, columnNo, error) {
    let string = msg.toLowerCase();
    var message = [ 
        'Message: ' + msg,
        'URL: ' + url,
        'Line: ' + lineNo, 
        'Column: ' + columnNo,
        'Error object: ' + JSON.stringify(error) 
    ].join(' - ');
    globalErrorHandler(message); 
    if(isDev()){ return false }
    return true;
};


ipcRenderer.once( 
    'loaded',     
    (event) => {   
        let app=document.createElement('div'); 
        app.style.width="100%"; 
        app.style.height="100%";
        app.id='application';      
        document.body.appendChild(app);    
        getConfig().then(
            (config:Config) => ReactDOM.render(   
                wrapMuiThemeLight(
                    <Provider store={createStore((state, action) =>  state, {})}>   
                        <QuickEntry config={config}/>
                    </Provider>
                ),
                document.getElementById('application')
            )     
        )
    }
);   


interface QuickEntryState{
    category : string,
    title : string,  
    note : string, 
    deadline : Date,
    deleted : Date,
    attachedDate : Date, 
    attachedTags : string[],
    tag : string, 
    checklist : any[],
    defaultTags : string[],
    showTags : boolean, 
    showDateCalendar : boolean,  
    showTagsSelection : boolean,
    showChecklist : boolean,   
    showDeadlineCalendar : boolean
}   
  

interface QuickEntryProps{
    config:Config
}    
  

class QuickEntry extends Component<QuickEntryProps,QuickEntryState>{

    calendar:HTMLElement; 
    deadline:HTMLElement;
    tags:HTMLElement;
    ref:HTMLElement; 
    inputRef:HTMLElement; 
    checklist:HTMLElement; 
    defaultWidth:number;
    defaultHeight:number;
    subscriptions:Subscription[]; 


    constructor(props){
        super(props);  
        this.defaultWidth=500;
        this.defaultHeight=300;
        this.subscriptions=[];
        let {config} = this.props;
        let partialState = this.stateFromConfig(config);

        this.state = {    
            tag:'',
            category:'', 
            title:'',
            note:'',  
            deadline:undefined, 
            deleted:undefined, 
            attachedDate:undefined,
            defaultTags:[],  
            attachedTags:[],  
            checklist:[], 
            showDateCalendar:false,  
            showTagsSelection:false, 
            showTags:false, 
            showChecklist:false,  
            showDeadlineCalendar:false,
            ...partialState
        };       
    } 


    stateFromConfig = (config) => { 
        let { quickEntrySavesTo, defaultTags } = config;
        let category = isNil(quickEntrySavesTo) ? "inbox" : quickEntrySavesTo.toLowerCase();

        return cond([
            [equals("inbox"), () => ({category,deadline:undefined,attachedDate:undefined,defaultTags})],

            [equals("today"), () => ({category,attachedDate:new Date(),defaultTags})],

            [equals("next"), () => ({category,deadline:undefined,attachedDate:undefined,defaultTags})],

            [equals("someday"), () => ({category,deadline:undefined,attachedDate:undefined,defaultTags})],

            [() => true, () => ({})]
        ])(category);
    };


    componentDidMount(){
        this.subscriptions.push(
            Observable
            .fromEvent(ipcRenderer,"focus", (event) => event) 
            .subscribe((event) => this.inputRef ? this.inputRef.focus() : null),

            Observable
            .fromEvent(ipcRenderer,"config", (event,config) => config)
            .subscribe(compose( (state) => this.setState(state), this.stateFromConfig )) 
        )
    }


    componentWillUnmount(){ 
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions=[];
    }


    stateFromTodo = (state,todo) => ({   
        ...state,
        category:todo.category, 
        title:todo.title,
        note:todo.note,  
        reminder:todo.reminder, 
        deadline:todo.deadline, 
        deleted:todo.deleted, 
        attachedDate:todo.attachedDate, 
        attachedTags:todo.attachedTags, 
        checklist:todo.checklist  
    });
    

    todoFromState = () : any => ({
        _id:generateId(),
        category:this.state.category as any, 
        type:"todo",
        title:this.state.title,
        priority:0,
        note:this.state.note,  
        checklist:this.state.checklist,
        deadline:this.state.deadline, 
        created:new Date(),
        deleted:this.state.deleted, 
        attachedDate:this.state.category==="today" ? 
                     new Date() : 
                     this.state.attachedDate,  
        attachedTags:this.state.attachedTags
    }); 


    setSmallSize = () => {
        let window = remote.getCurrentWindow(); 
        if(window){
            window.setSize(this.defaultWidth, this.defaultHeight); 
        }
    };


    setBigSize = () => {
        let window = remote.getCurrentWindow(); 
        if(window){
            window.setSize(this.defaultWidth, 400); 
        }
    };


    addTodo = () => isEmpty(this.state.title) ? 
                    null : 
                    ipcRenderer.send(
                        "quick-entry",
                        this.todoFromState(),
                        this.props.config
                    ); 
    

    onSave = () => {
        this.addTodo();
        this.clear(); 
    };
    

    clear = () => {
        let window = remote.getCurrentWindow();
        if(window){ window.blur(); }

        let emptyTodo = generateEmptyTodo(generateId(), this.state.category as any, 0);
        let newState : QuickEntryState = {
            ...this.stateFromTodo(this.state,emptyTodo),
            showDateCalendar:false,     
            showTagsSelection:false, 
            showTags:false, 
            showChecklist:false,   
            showDeadlineCalendar:false 
        };
        this.setState(newState);
    };

    
    onAttachTag = (tag) => { 
        if(isEmpty(tag)){ return }
        this.setState({tag:'', attachedTags:uniq([...this.state.attachedTags, tag])})
    };  


    onRemoveTag = (tag) => {
        if(isEmpty(tag)){ return }
        let {attachedTags} = this.state;
        let idx = attachedTags.findIndex( v => v===tag );
         if(idx===-1){ return }
        this.setState({attachedTags:remove(idx,1,attachedTags)})
    }; 


    onNoteChange = (event) : void => {
        this.setState({note:event.target.value})
    };


    onTitleChange = (event:any) : void => {
        this.setState({title:event.target.value})
    };  


    onChecklistButtonClick = (e) => {
        this.setState({showChecklist:true}) 
    };
      

    onFlagButtonClick = (e) => {
        this.setState({showDeadlineCalendar:true}, () => this.setBigSize())
    };


    closeDeadlineCalendar = () => {
        this.setState({showDeadlineCalendar:false}, () => this.setSmallSize())
    };
 

    onCalendarButtonClick = (e) => {
        this.setState({showDateCalendar:true}, () => this.setBigSize())
    };
     

    closeDateCalendar = () => {
        this.setState({showDateCalendar:false}, () => this.setSmallSize())
    };

    
    onTagsButtonClick = (e) => {
        this.setState({showTagsSelection:true, showTags:true})
    };


    closeTagsSelection = (e) => {
        this.setState({showTagsSelection:false}) 
    };


    onRemoveSelectedCategoryLabel = () => {
        let { category, attachedDate, deadline } = this.state;   
        this.setState({category:'inbox', attachedDate:null}); 
    };     


    onDeadlineCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        let {attachedDate,category} = this.state;
        let deadlineToday = daysRemaining(day)===0;
        this.setState(
            {deadline:day,category:deadlineToday ? "today" : category}, 
            () => this.closeDeadlineCalendar()
        );
    };   

 
    onRemoveAttachedDateLabel = () => {
        let {category,deadline} = this.state;
        this.setState({category:isNil(deadline) ? "inbox" : category, attachedDate:null}); 
    };


    onCalendarClear = (e) => {
        let {category,deadline} = this.state;
        this.setState({category:isNil(deadline) ? "inbox" : category, attachedDate:null}); 
    }; 


    onDeadlineCalendarClear = (e:any) : void => {
        let {category, attachedDate} = this.state;
        this.setState(
            {deadline:null, category:isNil(attachedDate) ? "inbox" : category},
            () => this.closeDeadlineCalendar()
        );
    };
 

    onCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        let {category} = this.state;
        this.setState(
            {attachedDate:day,category:daysRemaining(day)===0 ? "today" : category},
            () => this.closeDateCalendar()
        );   
    }; 

    
    onCalendarSomedayClick = (e) => { 
        this.setState(
            {
                category:"someday",
                attachedDate:null, 
                deadline:null
            }, 
            () => this.closeDateCalendar()
        );
    }; 


    onCalendarTodayClick = (e) => {
        this.setState({category:"today", attachedDate:new Date()}, () => this.closeDateCalendar()); 
    };


    onCalendarThisEveningClick = (e) => {
        this.setState({category:"evening", attachedDate:new Date()}, () => this.closeDateCalendar()); 
    };


    render(){  
        let {category,attachedDate,showChecklist,showTags} = this.state;
        let todayCategory : boolean = category==="evening" || category==="today"; 

        return <div style={{display:"flex",flexDirection:"column",width:"100%",height:"100%"}}>

        <div 
            ref={(e) => { this.ref=e; }} 
            style={{
                paddingTop:"25px",
                paddingLeft:"25px",
                paddingRight:"25px",
                paddingBottom:"75px"
            }}
        >    
 
            <div>
            <div style={{}}> 
                <TextareaAutosize 
                    placeholder="New Task"
                    innerRef={e => {this.inputRef=e;}}
                    onKeyDown={(event) => { 
                        if(event.which===13 || event.keyCode===13){
                           event.stopPropagation(); 
                           event.preventDefault();
                           this.onSave();
                        }      
                    }} 
                    value={this.state.title}
                    onChange={this.onTitleChange as any} 
                    style={{
                        resize:"none",
                        marginTop:"-4px",
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
                /> 
            </div> 

            <div style={{paddingTop:"10px"} as any}>  
                <TextareaAutosize
                    id={`always-note`}  
                    value={this.state.note} 
                    placeholder="Notes"
                    onChange={this.onNoteChange}
                    style={{
                        resize:"none",
                        marginTop:"-4px",
                        width:"100%",
                        fontSize:"14px",
                        padding:"0px",
                        cursor:"default", 
                        position:"relative", 
                        border:"none",
                        outline:"none",
                        backgroundColor:"rgba(0, 0, 0, 0)",
                        color:"rgba(0, 0, 0, 0.87)" 
                    }}
                    onKeyDown={(e) => { if(e.keyCode===13){ e.stopPropagation(); }}}
                /> 
            </div>

            <div className="scroll" style={{maxHeight:"50%"}}>    
            <div 
                ref={(e) => {this.checklist=e;}} 
                style={{height:"100%"}} 
            > 
                {    
                    not(showChecklist) ? null : 
                    <div> 
                    <Checklist  
                        checklist={this.state.checklist}   
                        closeChecklist={() => this.setState({showChecklist:false})}
                        updateChecklist={
                            (checklist:ChecklistItem[]) => {  
                                this.setState(
                                    {checklist}, 
                                    () => {
                                        if(this.checklist){ this.checklist.scrollTop=0; }
                                    }
                                )
                            }
                        } 
                    />  
                    </div>
                } 
                {  
                    not(showTags) ? null :
                    <div style={{display:"flex",alignItems:"center"}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                            <TriangleLabel />
                        </div>
                        <TodoTags 
                            attachTag={this.onAttachTag}
                            removeTag={this.onRemoveTag}
                            tags={this.state.attachedTags}
                            closeTags={() => this.setState({showTags:false})}
                        /> 
                    </div>
                } 
            </div> 
            </div> 
            </div> 
            


            <div style={{  
                display:"flex",
                alignItems:"center",
                width:"30%%", 
                position:"fixed",
                justifyContent:"flex-end",
                bottom:30, 
                padding:"5px", 
                right:10,  
                zIndex:30001    
            }}>  
            <div style={{display:"flex"}}>
            { 
                <DateCalendar  
                    close={this.closeDateCalendar}
                    open={this.state.showDateCalendar}
                    origin = {{vertical:"center", horizontal:"left"}} 
                    point = {{vertical:"bottom", horizontal:"right"}}  
                    anchorEl={this.calendar}
                    rootRef = {document.body}
                    attachedDate={this.state.attachedDate}
                    onDayClick = {this.onCalendarDayClick}
                    onSomedayClick = {this.onCalendarSomedayClick}
                    onTodayClick = {this.onCalendarTodayClick}
                    onThisEveningClick = {this.onCalendarThisEveningClick}
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
                            defaultTags:this.state.defaultTags,
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
                    origin={{vertical: "center", horizontal: "left"}} 
                    point={{vertical: "bottom", horizontal: "right"}} 
                    anchorEl={this.deadline}
                    onClear={this.onDeadlineCalendarClear}
                    rootRef={document.body}
                />
            }
            {   
                <div ref={(e) => { this.calendar=e; }}>  
                    <IconButton  
                      onClick = {this.onCalendarButtonClick} 
                      iconStyle={{  
                        transition:"opacity 0.2s ease-in-out",
                        opacity:1,
                        color:"rgb(207,206,207)",
                        width:"25px",   
                        height:"25px"  
                      }}
                    >      
                        <Calendar />   
                    </IconButton> 
                </div> 
            } 
            {
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
                </div> 
            }
            {   
                this.state.showChecklist ? null :     
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
                </IconButton>
            } 
            {    
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
                </div>  
            } 
            </div>        
            </div> 

            <div style={{width:"100%",position:"fixed",bottom:0,right:0}}>    
                <TodoInputPopupFooter
                    onCancel={this.clear}
                    onSave={this.onSave}
                    todayCategory={todayCategory}
                    category={this.state.category}
                    attachedDate={this.state.attachedDate}
                    deadline={this.state.deadline}
                    onRemoveTodayLabel={() => {
                        let {deadline,attachedDate} = this.state;
                        
                        if(isToday(deadline) && isToday(attachedDate)){
                            this.setState({category:"inbox", attachedDate:null, deadline:null});
                        }else if(isToday(deadline)){
                            this.setState({category:"inbox", deadline:null});
                        }else if(isToday(attachedDate)){
                            this.setState({category:"inbox", attachedDate:null});
                        }
                    }}
                    onRemoveUpcomingLabel={() => {
                        let {deadline,attachedDate} = this.state;
                        
                        if(isDate(deadline)){
                           this.setState({attachedDate:null});
                        }else{
                           this.setState({category:"inbox", attachedDate:null});
                        }
                    }}
                    onRemoveSomedayLabel={() => {
                        this.setState({category:"inbox", attachedDate:null});
                    }}
                    onRemoveDeadlineLabel={() => {
                        let {deadline,attachedDate} = this.state;
                        
                        if(isDate(attachedDate)){ 
                           this.setState({deadline:null});
                        }else{
                           this.setState({category:"inbox", deadline:null});
                        }
                    }}
                /> 
            </div> 
    </div> 
    </div>  
  } 
}


interface TodoInputPopupFooterProps{  
    onCancel:Function,
    onSave:Function,
    onRemoveTodayLabel:Function,
    onRemoveUpcomingLabel:Function,
    onRemoveSomedayLabel:Function,
    onRemoveDeadlineLabel:Function,
    todayCategory:boolean,
    category:string,
    attachedDate:Date,
    deadline:Date
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
        this.setState({selectorPopupOpened:false});
    }


    render(){
        let {selectorPopupOpened} = this.state;

        return <div style={{
            backgroundColor:"rgb(234, 235, 239)",
            display:"flex",
            overflowX:"hidden",
            justifyContent:"space-between",
            width:"100%"
        }}>     
                <div 
                    ref={e => {this.ref=e;}}
                    style={{
                        display:"flex", 
                        alignItems:"center",
                        justifyContent:"flex-start",
                        fontSize:"14px",
                        fontWeight:"bold",
                        color:"rgba(100,100,100,1)",
                        cursor:"default"   
                    }}  
                >  
                    <TodoInputLabels 
                        onRemoveTodayLabel={this.props.onRemoveTodayLabel}
                        onRemoveUpcomingLabel={this.props.onRemoveUpcomingLabel}
                        onRemoveSomedayLabel={this.props.onRemoveSomedayLabel}
                        onRemoveDeadlineLabel={this.props.onRemoveDeadlineLabel}
                        todayCategory={this.props.todayCategory}
                        open={true} 
                        category={this.props.category}
                        attachedDate={this.props.attachedDate}
                        deadline={this.props.deadline}
                    />
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




interface TodoInputLabelProps{
    onRemove:Function,
    category:string,
    content:JSX.Element 
} 

interface TodoInputLabelState{} 



class TodoInputLabel extends Component<TodoInputLabelProps, TodoInputLabelState>{

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
            userSelect: "none"
        };
 
           
        return  <Chip 
                    onRequestDelete={this.props.onRemove}
                    onClick={(e) => {}}
                    style={{
                        backgroundColor:"",
                        background:"",
                        display:"flex",
                        alignItems:"baseline"
                    }}   
                >
                    <div style={containerStyle}>
                        {
                            chooseIcon({height: "25px", width: "25px"}, this.props.category as any)
                        } 
                        {
                            this.props.content 
                        }
                    </div>
                </Chip>
    }
  
}



interface DateCalendarProps{ 
    close : Function,
    open : boolean,
    origin : any,  
    anchorEl : HTMLElement,
    rootRef : HTMLElement, 
    attachedDate : Date,
    point : any,  
    onDayClick : (day:Date, modifiers:Object, e:any) => void,
    onSomedayClick : (e:any) => void,  
    onTodayClick : (e:any) => void, 
    onThisEveningClick : (e:any) => void, 
    onClear : (e:any) => void
}           
  

interface DateCalendarState{}
  

class DateCalendar extends Component<DateCalendarProps,DateCalendarState>{
    subscriptions:Subscription[];
    ref:HTMLElement; 
    
    constructor(props){
        super(props);
        this.subscriptions = [];
    }


    componentDidMount(){ 
         
        this.subscriptions.push(
            Observable
                    .fromEvent(document.body,"click")
                    .subscribe(this.onOutsideClick)
        );
    }


    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = []; 
    } 
  

    onOutsideClick = (e) => {
        let {close} = this.props;
        if(isNil(this.ref)){ return }

        let x = e.pageX;
        let y = e.pageY; 

        let inside = insideTargetArea(null,this.ref,x,y);
    
        if(not(inside)){ close() }   
    }   
               
     
    render(){     
        let {close} = this.props;
        let hideRepeatButton = true;

        return <Popover 
            open={this.props.open}
            scrollableContainer={this.props.rootRef}
            useLayerForClickAway={false} 
            anchorEl={this.props.anchorEl} 
            style={{
                backgroundColor:"rgba(0,0,0,0)",
                background:"rgba(0,0,0,0)",  
                zIndex:40005,
                borderRadius:"20px",  
                transform:`scale(0.8,0.8)` 
            }}   
            canAutoPosition={true}
            onRequestClose={() => this.props.close()}
            anchorOrigin={this.props.origin}           
            targetOrigin={this.props.point}
        >    
            <div 
                ref={(e) => { this.ref=e; }}  
                onClick={(e) => {
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                }}  
                style={{     
                    display:"flex",
                    flexDirection:"column",  
                    backgroundColor:"rgb(39,43,53)",  
                    borderRadius: "20px",
                    overflowX:"hidden"  
                }}
            >    
                
                <div  
                style={{
                    color: "white",
                    textAlign: "center",
                    padding: "5px",
                    cursor: "default"
                }}> 
                    When
                </div>

                <div className="hoverDateType"
                    onClick={this.props.onTodayClick}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        color: "white",
                        marginLeft:"20px",
                        marginRight:"20px",
                        cursor: "default",
                        WebkitUserSelect:"none"  
                    }}  
                >
                    <Star style={{
                        color:"gold", 
                        width:"15px",
                        height:"15px",
                        cursor:"default" 
                    }}/> 
                    <div style={{marginLeft:"15px"}}>
                        Today
                    </div>
                </div>

                <div  
                    className="hoverDateType"
                    onClick={this.props.onThisEveningClick}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        color: "white",
                        marginLeft:"20px",
                        marginRight:"20px",
                        cursor: "default",
                        WebkitUserSelect:"none"  
                }}>
                    <Moon style={{ 
                        transform:"rotate(145deg)", 
                        color:"rgb(192,192,192)", 
                        width:"15px",
                        height:"15px",
                        cursor:"default" 
                    }}/> 
                    <div style={{marginLeft:"15px"}}>
                        This Evening
                    </div>
                </div>

                <div style={{
                    display: "flex",
                    justifyContent: "center" 
                }}> 
                    <DayPicker onDayClick={this.props.onDayClick} />
                </div> 
                     
                <div  
                    className="hoverDateType"
                    onClick={this.props.onSomedayClick}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginLeft:"20px",
                        marginRight:"20px",
                        color: "white",
                        cursor: "default",
                        WebkitUserSelect:"none"  
                    }}
                >
                    <BusinessCase style={{  
                        color:"burlywood", 
                        width:"15px",
                        height:"15px",
                        cursor:"default"  
                    }}/>
                    <div style={{marginLeft:"15px"}}>
                        Someday
                    </div>
                </div> 
                <div style={{
                    border:"1px solid rgba(200,200,200,0.1)",
                    marginTop:"10px", 
                    width:"100%",   
                    marginBottom:"10px"
                }}>
                </div>  
                <div> 
                    <div style={{width:"90%"}}>
                        <RaisedButton
                            onClick={this.props.onClear}
                            style={{
                                width:"100%", 
                                margin:"15px",  
                                color:"white",  
                                backgroundColor:"rgb(87, 87, 87)"
                            }} 
                            buttonStyle={{  
                                color:"white",  
                                backgroundColor:"rgb(87, 87, 87)"
                            }}
                        >
                            Clear 
                        </RaisedButton>
                    </div>
                </div>
            </div>   
        </Popover> 
    } 
}  

 


interface TodoInputLabelsProps{
    onRemoveTodayLabel:Function,
    onRemoveUpcomingLabel:Function,
    onRemoveSomedayLabel:Function,
    onRemoveDeadlineLabel:Function,
    todayCategory:boolean,
    open:boolean,
    category:string,
    attachedDate:Date,
    deadline:Date 
}


interface TodoInputLabelsState{}
 
 
class TodoInputLabels extends Component<TodoInputLabelsProps,TodoInputLabelsState>{

    constructor(props){
        super(props);
    }


    render(){  
        let {todayCategory,open,category,attachedDate,deadline} = this.props;

        return <div style={{display:"flex",flexDirection:"row",paddingRight:"10px"}}> 
        {    
            not(todayCategory) ? null :
            <div style={{ 
                transition:"opacity 0.4s ease-in-out",
                opacity:open ? 1 : 0,
                paddingLeft:"5px"  
            }}>      
                <TodoInputLabel 
                    onRemove={this.props.onRemoveTodayLabel}
                    category={category}
                    content={  true ? null :
                        <div style={{marginLeft:"15px"}}>
                            { category==="evening" ? "This Evening" : "Today" }   
                        </div>   
                    }  
                />   
            </div>  
        }  
        {   
            category!=="someday" ? null :
            <div style={{ 
                transition:"opacity 0.4s ease-in-out",
                opacity:open ? 1 : 0,
                paddingLeft:"5px"  
            }}>      
                <TodoInputLabel 
                    onRemove={this.props.onRemoveSomedayLabel}
                    category={category}
                    content={  true ? null :
                        <div style={{marginLeft:"15px"}}>
                            {"Someday"}   
                        </div>   
                    }  
                />   
            </div>  
        }   
        { 
            isNil(attachedDate) || todayCategory ? null :
            <div style={{
                transition: "opacity 0.4s ease-in-out",
                opacity:open ? 1 : 0
            }}>    
                <TodoInputLabel 
                    onRemove={this.props.onRemoveUpcomingLabel}
                    category={"upcoming"}
                    content={  true ? null :
                        <div style={{marginLeft:"15px", color:"black"}}>
                            When : {moment(attachedDate).format('MMMM D')} 
                        </div>    
                    }  
                />    
            </div>    
        } 
        { 
            isNil(deadline) ? null : 
            <div style={{
                transition : "opacity 0.4s ease-in-out",
                opacity : open ? 1 : 0
            }}>
                <TodoInputLabel  
                    onRemove={this.props.onRemoveDeadlineLabel}
                    category={"deadline"} 
                    content={ true ? null :
                        <div style={{marginLeft:"15px", color:"black"}}>
                            Deadline: {moment(deadline).format('MMMM D')}
                        </div>
                    }
                />      
            </div>  
        } 
        </div>
    }
}

 

 
 
interface DeadlineCalendarProps{   
    close : Function,
    open : boolean,
    origin : any,  
    anchorEl : HTMLElement,
    point : any,    
    onDayClick : (day: Date, modifiers: Object, e : any) => void,
    onClear : (e:any) => void,
    rootRef : HTMLElement 
}   
  

interface DeadlineCalendarState{} 
  
class DeadlineCalendar extends Component<DeadlineCalendarProps,DeadlineCalendarState>{

    ref:HTMLElement;

    constructor(props){
        super(props);
    }    


    componentDidMount(){ 
        document.body.addEventListener("click", this.onOutsideClick);
    }

 
    componentWillUnmount(){
        document.body.removeEventListener("click", this.onOutsideClick);
    } 
  

    onOutsideClick = (e) => {
        if(isNil(this.ref)){ return }

        let x = e.pageX;
        let y = e.pageY; 

        let inside = insideTargetArea(null,this.ref,x,y);
    
        if(not(inside)){
            this.props.close(); 
        }   
    }   
               
      
    render(){  
        return <Popover 
            scrollableContainer={this.props.rootRef}
            useLayerForClickAway={false} 
            open={this.props.open}
            anchorEl={this.props.anchorEl}
            canAutoPosition={true} 
            style={{
                backgroundColor:"rgba(0,0,0,0)",
                background:"rgba(0,0,0,0)",  
                zIndex:40005, 
                borderRadius:"20px",  
                transform:`scale(0.8,0.8)`
            }}   
            onRequestClose={() => this.props.close()}
            anchorOrigin={this.props.origin} 
            targetOrigin={this.props.point}
        >   
            <div 
            onClick={(e) => {e.stopPropagation();}}  
            ref={(e) => { this.ref=e; }}   
            style={{     
                display:"flex",
                overflowX:"hidden",
                flexDirection:"column",  
                backgroundColor:"rgb(39,43,53)", 
                borderRadius: "20px"
            }}>    
                <div style={{
                    color: "white",
                    textAlign: "center",
                    padding: "5px",
                    cursor: "default"
                }}> 
                    Deadline
                </div>
                <div style={{
                    display: "flex",
                    justifyContent: "center" 
                }}> 
                    <DayPicker onDayClick={this.props.onDayClick} />
                </div> 
                <RaisedButton
                    onClick={this.props.onClear}
                    style={{
                        margin:"15px",  
                        color:"white", 
                        backgroundColor:"rgb(49,53,63)"
                    }} 
                    buttonStyle={{  
                        color:"white",  
                        backgroundColor:"rgb(49,53,63)"
                    }}
                >
                    Clear 
                </RaisedButton>
            </div>  
        </Popover> 
    } 
}  

