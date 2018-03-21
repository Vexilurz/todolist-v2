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
import { ipcRenderer } from 'electron'; 
import AutosizeInput from 'react-input-autosize';
import { createStore } from "redux"; 
import NewAreaIcon from 'material-ui/svg-icons/content/content-copy';
import List from 'material-ui/svg-icons/action/list';
import { 
    cond, assoc, isNil, not, defaultTo, map, isEmpty, when,
    uniq, remove, contains, append, adjust, complement, identity,
    compose, flatten, concat, prop, equals, evolve, allPass  
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
import { getConfig } from './utils/config';
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
import { isString, isDate, isProject, isArea } from './utils/isSomething';
import { isToday, byNotDeleted, byNotCompleted, attachDispatchToProps, isNotEmpty } from './utils/utils';
import { isDev } from './utils/isDev';
import TextareaAutosize from 'react-autosize-textarea';
import { TodoTags } from './Components/TodoInput/TodoTags';
import { TagsPopup } from './Components/TodoInput/TagsPopup';
import PieChart from 'react-minimal-pie-chart';
import { AutoresizableText } from './Components/AutoresizableText';
import { stringToLength } from './utils/stringToLength';
import Editor from 'draft-js-plugins-editor';
import { shell } from 'electron'; 
import { Provider, connect } from "react-redux";
import {
    convertToRaw,
    convertFromRaw,
    CompositeDecorator,
    ContentState,
    EditorState,
    RichUtils
} from 'draft-js';
import createLinkifyPlugin from 'draft-js-linkify-plugin';
import 'draft-js/dist/Draft.css';
import { 
    noteToState, noteFromState, RawDraftContentState, getNotePlainText,
} from './utils/draftUtils';
import { requestFromMain } from './utils/requestFromMain';
import { groupProjectsByArea } from './Components/Area/groupProjectsByArea';
import { generateLayout } from './Components/Area/generateLayout';
import { App } from './app';
injectTapEventPlugin();  



const linkifyPlugin = createLinkifyPlugin({
    component:(props) => {
      const {contentState, ...rest} = props;
      return <a {...rest} style={{cursor:"pointer"}} onClick={() => shell.openExternal(rest.href)}/>
    }
});



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
    (event, id:number) => {   
        let app=document.createElement('div'); 
        app.style.width=`${window.innerWidth}px`; 
        app.style.height=`${window.innerHeight}px`;
        app.id='application';      
        document.body.appendChild(app);
        
        let store = createStore(
            (state, action) => when(
                () => action.type==="data",
                (state) => ({
                    ...state,
                    projects:action.load.projects, 
                    areas:action.load.areas, 
                    todos:action.load.todos, 
                    defaultTags:action.load.defaultTags
                })
            )(state),  
            {
                projects:[], 
                areas:[], 
                todos:[], 
                indicators:{},
                defaultTags:[]
            }
        );

        getConfig()
        .then( 
            compose(
              (el) => ReactDOM.render(el,app),  
              wrapMuiThemeLight,
              config => <Provider store={store}><QuickEntry {...{config} as any}/></Provider>
            )   
        );
    }
);   



interface QuickEntryState{
    project:any,
    category:string,
    title:string,  
    editorState:any,
    deadline:Date,
    deleted:Date,
    attachedDate:Date, 
    attachedTags:string[],
    tag:string, 
    checklist:any[],
    showTags:boolean, 
    showDateCalendar:boolean,  
    showTagsSelection:boolean,
    showChecklist:boolean,   
    showDeadlineCalendar:boolean
};   
  


interface QuickEntryProps{
    config:any,
    projects:any[],
    areas:any[],
    todos:any[],
    indicators : { 
        [key:string]:{
            active:number,
            completed:number,
            deleted:number
        }; 
    },
    defaultTags:string[],
    dispatch?:Function
};    



@connect((store,props) => ({...store,config:props.config}), attachDispatchToProps)  
class QuickEntry extends Component<QuickEntryProps,QuickEntryState>{
    calendar:HTMLElement; 
    deadline:HTMLElement;
    tags:HTMLElement;
    inputRef:HTMLElement; 
    checklist:HTMLElement; 
    subscriptions:Subscription[]; 

    constructor(props){
        super(props); 
        this.subscriptions=[];
        let {config} = this.props;
        let partialState = this.stateFromConfig(config);

        this.state={    
            project:null,
            tag:'',
            category:'', 
            title:'', 
            editorState:noteToState(null),
            deadline:undefined, 
            deleted:undefined, 
            attachedDate:undefined,
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


    tagsFromTodos = (todos:any[]) => flatten(todos.map((todo) => todo.attachedTags));


    resize = () => {
        let target = document.getElementById('application');
        let checklist = document.getElementById('checklist');
        
        target.style.width=`${window.innerWidth}px`; 
        target.style.height=`${window.innerHeight}px`;

        checklist.style.height=`${window.innerHeight/2}px`;
    };


    componentDidMount(){
        this.resize(); 

        this.subscriptions.push(
            Observable
            .fromEvent(window,"resize", (event) => event) 
            .subscribe(this.resize),

            Observable
            .fromEvent(ipcRenderer,"focus", (event) => event) 
            .subscribe((event) => this.inputRef ? this.inputRef.focus() : null),

            Observable
            .fromEvent(ipcRenderer,"config", (event,config) => config) 
            .subscribe(compose( (state) => this.setState(state), this.stateFromConfig )),
            
            Observable
            .fromEvent(ipcRenderer,"data",(event,todos,projects,areas,indicators) => ({todos,projects,areas,indicators}))
            .subscribe(
                compose(
                    ({todos,projects,areas,indicators}) => this.props.dispatch({
                        type:"data",    
                        load:{  
                            projects, 
                            areas, 
                            todos, 
                            indicators,
                            defaultTags:compose(
                                uniq,
                                append(this.props.defaultTags),
                                map(prop('attachedTags'))
                            )(todos) 
                        }
                    }),
                    evolve({
                        todos:(todos) => todos.filter(byNotDeleted),
                        projects:(projects) => projects.filter(allPass([byNotDeleted,byNotCompleted])),
                        areas:(areas) => areas.filter(byNotDeleted)
                    })
                )
            )
        );
    }

    componentWillUnmount(){ 
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions=[];
    }


    stateFromTodo = (state,todo) : QuickEntryState => ({   
        ...state,
        category:todo.category, 
        title:todo.title,
        editorState:noteToState(todo.note),
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
        note:noteFromState(this.state.editorState),  
        checklist:this.state.checklist,
        deadline:this.state.deadline, 
        created:new Date(),
        deleted:this.state.deleted, 
        attachedDate:this.state.category==="today" ? new Date() : this.state.attachedDate,  
        attachedTags:this.state.attachedTags
    }); 




    setSmallSize = () : Promise<void> => 
        requestFromMain<any>(
            'QEsetSmallSize',
            [],
            (event) => event
        );


    setBigSize = () : Promise<void> => 
        requestFromMain<any>(
            'QEsetBigSize',
            [],
            (event) => event
        );

 
    addTodo = () => {
       let todo = this.todoFromState(); 
       let {project} = this.state;
       let {config} = this.props;

       if(isNotEmpty(this.state.title)){
          ipcRenderer.send("quick-entry",todo,project,config); 
       } 
    };
    

    onSave = () => {
        this.addTodo();
        this.clear(); 
    };
 

    blur = () => requestFromMain<any>('QEblur',[],(event) => event);


    hide = () => requestFromMain<any>('QEhide',[],(event) => event);
    

    clear = () => {
        this.blur();
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


    onNoteChange = (editorState) : void => this.setState({editorState}); 


    onTitleChange = (event:any) : void => this.setState({title:event.target.value});  


    onChecklistButtonClick = (e) => this.setState({showChecklist:true});

      
    onFlagButtonClick = (e) => this.setState({showDeadlineCalendar:true}, () => this.setBigSize());


    closeDeadlineCalendar = () => this.setState({showDeadlineCalendar:false}, () => this.setSmallSize());

 
    onCalendarButtonClick = (e) => this.setState({showDateCalendar:true}, () => this.setBigSize());

    
    closeDateCalendar = () => this.setState({showDateCalendar:false}, () => this.setSmallSize());


    onTagsButtonClick = (e) => this.setState({showTagsSelection:true, showTags:true});


    closeTagsSelection = (e) => this.setState({showTagsSelection:false});


    categoryFromState = () : string => {
        let {project,category,deadline,attachedDate} = this.state;

        if(isDate(deadline) || isDate(attachedDate) || isProject(project)){
            if(isToday(deadline) || isToday(attachedDate)){
                return "today"; 
            }else{ 
                return "next";
            }
        }else{
            return "inbox"; 
        }
    };


    onCalendarClear = () => {
        this.setState(
            {attachedDate:null}, 
            () => this.setState({category:this.categoryFromState()})
        ); 
    }; 


    onDeadlineCalendarClear = () : void => {
        this.setState(
            {deadline:null},
            () => {
                this.setState({category:this.categoryFromState()});
                this.closeDeadlineCalendar();
            }
        );
    };
 

    onCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        this.setState(
            {attachedDate:day},
            () => {
                this.setState({category:this.categoryFromState()});
                this.closeDateCalendar();
            }
        );   
    }; 


    onDeadlineCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        this.setState(
            {deadline:day}, 
            () => {
                this.setState({category:this.categoryFromState()});
                this.closeDeadlineCalendar();
            }
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


    onCancel = () => {
        this.clear();
        this.hide(); 
    };


    render(){  
        let {category,attachedDate,showChecklist,showTags} = this.state;
        let todayCategory : boolean = category==="evening" || category==="today"; 

        return <div style={{
            display:"flex",
            flexDirection:"column",
            paddingTop:"25px", 
            paddingLeft:"25px",
            paddingRight:"5px"
        }}>  
            <div> 
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
            <Editor
                editorState={this.state.editorState}
                onChange={this.onNoteChange}
                plugins={[linkifyPlugin]} 
                keyBindingFn={(e) => { if(e.keyCode===13){ e.stopPropagation(); } }}
                placeholder="Notes"
            />
            </div>
                <div 
                ref={(e) => {this.checklist=e;}} 
                className="scroll"
                id="checklist"
                style={{
                    height:`${window.innerHeight/2.5}px`
                }}>   
                    {     
                        not(showChecklist) ? null :  
                        <div style={{position:"relative"}}>  
                            <Checklist  
                                checklist={this.state.checklist}   
                                closeChecklist={() => this.setState({showChecklist:false})}
                                updateChecklist={
                                    (checklist:ChecklistItem[]) => this.setState(
                                        {checklist}, 
                                        () => { if(this.checklist){ this.checklist.scrollTop=0; } }
                                    )
                                } 
                            />  
                        </div>
                    } 
                    {   
                        not(showTags) ? null :
                        <div style={{display:"flex",alignItems:"center",position:"relative"}}>
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

            <div style={{  
                display:"flex",
                alignItems:"center",
                width:"30%", 
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
                not(this.state.showTagsSelection) ? null :
                <TagsPopup  
                    attachTag={this.onAttachTag} 
                    close={this.closeTagsSelection}
                    open={this.state.showTagsSelection}  
                    anchorEl={this.tags}
                    defaultTags={this.props.defaultTags}
                    origin={{vertical:"center",horizontal:"left"}} 
                    point={{vertical:"bottom",horizontal:"right"}} 
                    rootRef={document.body} 
                    todos={[]}
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
                    project={this.state.project}
                    indicators={this.props.indicators}
                    todos={this.props.todos}
                    projects={this.props.projects}
                    areas={this.props.areas}
                    openDeadlineCalendar={this.onFlagButtonClick}
                    openCalendar={this.onCalendarButtonClick} 
                    onCancel={this.onCancel}
                    onSave={this.onSave}
                    todayCategory={todayCategory}
                    category={this.state.category}
                    attachedDate={this.state.attachedDate}
                    deadline={this.state.deadline}
                    onRemoveTodayLabel={() => this.onCalendarClear()}
                    onRemoveUpcomingLabel={() => this.onCalendarClear()}
                    onRemoveSomedayLabel={() => this.onCalendarClear()}
                    onRemoveDeadlineLabel={() => this.onDeadlineCalendarClear()}
                    onSelectInboxCategory={() => this.setState({
                        project:null,
                        category:'inbox',
                        deadline:undefined, 
                        attachedDate:undefined,
                        showDateCalendar:false,  
                        showTagsSelection:false, 
                        showDeadlineCalendar:false
                    })}
                    onSelectProject={(project) => this.setState({project,category:'next'})}
                /> 
            </div> 
    </div>  
  } 
}


interface TodoInputPopupFooterProps{  
    onCancel:Function,
    onSave:Function,
    openDeadlineCalendar:Function,
    openCalendar:Function,
    indicators:{ 
        [key:string]:{
            active:number,
            completed:number,
            deleted:number
        }; 
    },
    onRemoveTodayLabel:Function,
    onRemoveUpcomingLabel:Function,
    onRemoveSomedayLabel:Function,
    onRemoveDeadlineLabel:Function,
    onSelectInboxCategory:() => void,
    onSelectProject:(project:any) => void,
    todayCategory:boolean,
    category:string,
    attachedDate:Date,
    deadline:Date,
    project:any,
    areas:any[],
    projects:any[],
    todos:any[]
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
        let {
            category,
            attachedDate,
            deadline,
            project,
            todos
        } = this.props;

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
                        fontSize:"14px",
                        fontWeight:"bold",
                        color:"rgba(100,100,100,1)",
                        cursor:"default"   
                    }}  
                >  
                    { selectButtonContent({category,project,attachedDate,deadline,todos}) } 
                </div> 
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
                        openDeadlineCalendar={this.props.openDeadlineCalendar}
                        openCalendar={this.props.openCalendar}
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
                <SelectorPopup
                    selectInbox={this.props.onSelectInboxCategory}        
                    selectProject={this.props.onSelectProject}
                    category={this.props.category}
                    project={this.props.project}
                    indicators={this.props.indicators}
                    open={selectorPopupOpened} 
                    anchorEl={this.ref}
                    rootRef={document.body}
                    areas={this.props.areas}
                    close={this.closeSelectorPopup}
                    projects={this.props.projects}
                    todos={this.props.todos}
                />
        </div>
    }
}




interface TodoInputLabelProps{
    onClick:Function,
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
                  onClick={(e) => this.props.onClick()}
                  style={{backgroundColor:"",background:"",display:"flex",alignItems:"baseline"}}   
                >
                    <div style={containerStyle}>
                        {chooseIcon({height: "25px", width: "25px"}, this.props.category as any)} 
                        {this.props.content}
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
                <div style={{
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
                        marginLeft: "20px",
                        marginRight: "20px",
                        marginBottom:"2px",
                        padding:"2px",
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
                        cursor: "default",
                        marginLeft: "20px",
                        padding:"2px",
                        marginRight: "20px",
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
                        color: "white",
                        cursor: "default",
                        marginLeft: "20px",
                        marginRight: "20px",
                        WebkitUserSelect:"none",
                        padding:"2px"  
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
    openDeadlineCalendar:Function,
    openCalendar:Function,
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
        let {
            todayCategory,
            open,
            category,
            attachedDate,
            deadline,

            openDeadlineCalendar,
            openCalendar,

            onRemoveTodayLabel,
            onRemoveUpcomingLabel,
            onRemoveSomedayLabel,
            onRemoveDeadlineLabel
        } = this.props;

        return <div style={{display:"flex",flexDirection:"row",paddingRight:"10px"}}> 
        {    
            not(todayCategory) ? null :
            <div style={{ 
                transition:"opacity 0.4s ease-in-out",
                opacity:open ? 1 : 0,
                paddingLeft:"5px"  
            }}>      
                <TodoInputLabel 
                    onClick={() => openCalendar()}
                    onRemove={onRemoveTodayLabel}
                    category={category}
                    content={  
                        true ? null :
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
                    onClick={() => openCalendar()}
                    onRemove={onRemoveSomedayLabel}
                    category={category}
                    content={  
                        true ? null :
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
                    onClick={() => openCalendar()}
                    onRemove={onRemoveUpcomingLabel}
                    category={"upcoming"}
                    content={  
                        true ? null :
                        <div style={{marginLeft:"15px", color:"black"}}>
                            When : {moment(attachedDate).format('MMMM D')} 
                        </div>    
                    }  
                />    
            </div>    
        } 
        {  
            isNil(deadline) ? null : 
            <div style={{transition:"opacity 0.4s ease-in-out", opacity:open?1:0}}>
                <TodoInputLabel  
                    onClick={() => openDeadlineCalendar()}
                    onRemove={onRemoveDeadlineLabel}
                    category={"deadline"} 
                    content={ 
                        true ? null :
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



interface SelectorPopupProps{
    open:boolean
    anchorEl:HTMLElement,
    indicators : { 
        [key:string]:{
            active:number,
            completed:number,
            deleted:number
        }; 
    },
    close:Function,
    projects:any[],
    rootRef:HTMLElement, 
    todos:any[],
    areas:any[],
    selectInbox:() => void,    
    selectProject:(project:any) => void,
    category:any,
    project:any 
}


interface SelectorPopupState{}
 

class SelectorPopup extends Component<SelectorPopupProps,SelectorPopupState>{
    ref:HTMLElement;
    subscriptions:Subscription[];

    constructor(props){
        super(props);
        this.subscriptions=[];         
    }



    getAreaElement = (a:any) => { 
        let {selectProject,close,todos,project} = this.props;

        return <div    
            key = {`${a._id}-area`}
            onClick = {(e) => { }}
            id = {`${a._id}-popup`} 
            style={{       
                borderRadius:"2px", 
                color:"white",
                height:"25px",  
                paddingLeft:"4px", 
                display:"flex",
                alignItems:"center" 
            }} 
        >     
                <div> <NewAreaIcon style={{width:"20px", color:"white", height:"20px"}}/> </div>
                <div    
                    id = {`${a._id}-popup-text`}   
                    style={{  
                        width:"100%",
                        paddingLeft:"5px",
                        fontFamily: "sans-serif",
                        fontSize:`15px`,  
                        whiteSpace: "nowrap",
                        cursor: "default",
                        color:"white",  
                        WebkitUserSelect: "none" 
                    }}
                >    
                    <AutoresizableText
                        text={a.name}
                        placeholder="New Area"
                        fontSize={15}
                        style={{}}
                        offset={45} 
                        placeholderStyle={{}}
                    />
                </div>  
        </div>
    };



    getProjectElement = (p:any) => { 
        let {selectProject,close,todos,project} = this.props;
        let indicator = defaultTo({completed:0, active:0})(this.props.indicators[project._id]);
        let done = indicator.completed;
        let left = indicator.active;
        let totalValue = (done+left)===0 ? 1 : (done+left);
        let currentValue = done;

        return <div    
            key = {`${p._id}-project`}
            onClick = {(e) => {
                let {selectProject,close} = this.props;
                selectProject(p);
                close(); 
            }}
            id = {`${p._id}-popup`} 
            className="hoverDateType" 
            style={{       
                borderRadius:"2px", 
                color:"white",
                height:"25px",  
                paddingLeft:"30px", 
                display:"flex",
                alignItems:"center" 
            }} 
        >     
                <div style={{    
                    transform: "rotate(270deg)", 
                    width: "18px",
                    height: "18px",
                    position: "relative",
                    borderRadius: "100px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "1px solid rgb(170, 170, 170)",
                    boxSizing: "border-box" 
                }}> 
                    <div style={{
                        width: "18px",
                        height: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative" 
                    }}>  
                        <PieChart 
                            animate={false}    
                            totalValue={totalValue}
                            data={[{     
                                value:currentValue,  
                                key:1,    
                                color:"white" 
                            }]}    
                            style={{ 
                                color:"white",
                                width:"12px", 
                                height:"12px",
                                position:"absolute",
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center"  
                            }}    
                        />       
                    </div>
                </div> 
                <div    
                    id = {`${p._id}-popup-text`}   
                    style={{  
                        width:"100%",
                        paddingLeft:"5px",
                        fontFamily: "sans-serif",
                        fontSize:`15px`,  
                        whiteSpace: "nowrap",
                        cursor: "default",
                        color:"white",  
                        WebkitUserSelect: "none" 
                    }}
                >    
                    <AutoresizableText
                        text={p.name}
                        placeholder="New Project"
                        fontSize={15}
                        style={{}}
                        offset={45} 
                        placeholderStyle={{}}
                    />
                </div>     
                {   
                    isNil(project) ? null :
                    project._id!==p._id ? null : 
                    <Checked style={{  
                        color:"white",
                        paddingRight:"5px",
                        paddingLeft:"5px",
                    }}/> 
                }  
        </div>
    };



    componentDidMount(){
        let {close} = this.props;
        this.subscriptions.push(
            Observable
                    .fromEvent(document.body,"click")
                    .subscribe((event:any) => 
                        insideTargetArea(null,this.ref,event.clientX,event.clientY) ? 
                        null :
                        close() 
                    ) 
        );  
    }



    componentWillUnmount(){
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions = []; 
    } 



    render(){
        let {open,anchorEl,close,projects,todos,rootRef,project,category} = this.props;

        let {table,detached} = groupProjectsByArea(
            projects.filter(
                allPass([
                    byNotDeleted, 
                    byNotCompleted
                ])
            ),
            this.props.areas.filter(byNotDeleted)
        );

        let layout = generateLayout(this.props.areas,{table,detached}, true); 
    
        return <div> 
            <Popover  
                open={open}
                style={{
                    zIndex:200005,
                    background:"rgba(39, 43, 53, 0)", 
                    backgroundColor:"rgb(39, 43, 53, 0)"
                }}
                anchorEl={anchorEl} 
                canAutoPosition={true}  
                onRequestClose={() => {}} 
                scrollableContainer={rootRef}
                useLayerForClickAway={false} 
                anchorOrigin={{vertical: "center", horizontal: "left"}} 
                targetOrigin={{vertical: "bottom", horizontal: "left"}} 
            >      
                <div    
                    ref={(e) => { this.ref=e; }} 
                    className={"darkscroll"}
                    onClick = {(e) => {e.stopPropagation();}}
                    style={{borderRadius:"10px", width:"240px"}}
                > 
                    <div    
                        className={"darkscroll"}
                        style={{   
                            backgroundColor:"rgb(39, 43, 53)",
                            paddingRight:"10px",
                            paddingLeft:"10px",
                            paddingTop:"5px",
                            paddingBottom:"5px",
                            maxHeight:"150px",
                            overflowX:"hidden" 
                        }}  
                    >     
                            <div style={{display:"flex",alignItems:"center",paddingTop:"5px",paddingBottom:"5px"}}>
                                <div  
                                    className="hoverDateType" 
                                    onClick={() => {
                                        let {selectInbox,close} = this.props;
                                        selectInbox();
                                        close();
                                    }}
                                    style={{
                                        height:"25px",
                                        display:"flex",
                                        alignItems:"center",
                                        width:"100%",
                                        borderRadius:"2px"
                                    }} 
                                >
                                    <div style={{display:"flex", alignItems:"center"}}>
                                        <Inbox style={{  
                                            paddingLeft:"5px",
                                            width:"18px",
                                            height:"18px",
                                            color:"white", 
                                            cursor:"default"
                                        }}/> 
                                    </div>
                                    <div  
                                        style={{
                                            width:"100%", 
                                            fontSize:"15px",
                                            paddingRight:"5px", 
                                            paddingLeft:"5px", 
                                            cursor:"default",
                                            color:"white", 
                                            WebkitUserSelect:"none" 
                                        }}
                                    >   
                                        Inbox 
                                    </div>
                                    <div style={{flexGrow:1,justifyContent:"flex-end",alignItems:"center"}}>
                                        <div style={{height:"20px"}}>

                                            {
                                                category!=="inbox" ? null :
                                                <Checked style={{
                                                    color:"white",
                                                    height:18,
                                                    width:18,  
                                                    paddingRight:"5px",
                                                    paddingLeft:"5px",
                                                }}/> 
                                            }
                                        </div>  
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                outline: "none",
                                color: "rgba(255, 255, 255, 1)",
                                width: "100%",
                                borderBottom: "1px solid rgba(255,255,255,0.2)"
                            }}>
                            </div> 
                            { 
                                layout
                                .map( 
                                    cond([
                                        [isProject,this.getProjectElement],
                                        [isArea,this.getAreaElement],
                                        [() => true, () => null]
                                    ])                                    
                                )
                            }
                    </div>  
                </div>  
            </Popover> 
        </div>
    }    
};



let selectButtonContent = ({category, project, attachedDate, deadline, todos}) => { 

    if(category==="inbox" && isNil(attachedDate) && isNil(project) && isNil(deadline)){
        return <div   
            style={{
                cursor:"pointer",
                display:"flex",
                paddingLeft:"5px",
                height:"25px", 
                alignItems:"center"
            }}
        >
            <Inbox style={{width:"18px",height:"18px",color:"rgba(100,100,100,1)"}}/>
            <div style={{paddingRight:"5px",paddingLeft:"5px",WebkitUserSelect:"none"}}>  
                Inbox
            </div> 
        </div>;

    }else if(isProject(project)){ 
        let indicator = defaultTo({completed:0, active:0})(this.props.indicators[project._id]);
        let done = indicator.completed;
        let left = indicator.active;

        let totalValue = (done+left)===0 ? 1 : (done+left);
        let currentValue = done; 

        return <div style={{paddingLeft:"15px",cursor:"pointer",display:"flex",height:"25px",alignItems:"center"}}>
            <div style={{    
                transform:"rotate(270deg)", 
                width:"18px",
                height:"18px",
                position: "relative",
                borderRadius: "100px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: "1px solid rgb(170, 170, 170)",
                boxSizing: "border-box" 
            }}> 
                <div style={{
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative" 
                }}>  
                    <PieChart 
                        animate={false}    
                        totalValue={totalValue}
                        data={[{value:currentValue, key:1, color:"grey"}]}    
                        style={{ 
                            color:"grey",
                            width:"12px", 
                            height:"12px",
                            position:"absolute",
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center"  
                        }}    
                    />       
                </div>
            </div> 
            <div style={{paddingRight:"5px",paddingLeft: "5px",WebkitUserSelect:"none",width:"100%"}}>   
                {isEmpty(project.name) ? "New Project" : stringToLength(project.name,10)}    
            </div>    
        </div>;  
    }else{
        return <div  
            style={{
                cursor:"pointer",
                display:"flex",
                paddingLeft:"15px", 
                height:"25px", 
                alignItems:"center"
            }}
        >
            <CalendarIco 
                style={{
                    width:"18px",
                    height:"18px",
                    color:"rgba(100,100,100,1)", 
                    cursor:"default"
                }}  
            />
            <div style={{ 
                paddingRight:"5px", 
                paddingLeft:"5px", 
                WebkitUserSelect:"none"
            }}>  
                Scheduled
            </div>
        </div>;
    }
};
