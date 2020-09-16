import './assets/fonts/index.css'; 
import './assets/calendarStyle.css';  
import './assets/quickentry.css'; 
import * as React from 'react';
import * as ReactDOM from 'react-dom';  
// import * as injectTapEventPlugin from 'react-tap-event-plugin';
import IconButton from 'material-ui/IconButton'; 
import { Component } from "react";  
import Moon from 'material-ui/svg-icons/image/brightness-3';
import Star from 'material-ui/svg-icons/toggle/star';
import Flag from 'material-ui/svg-icons/image/assistant-photo'; 
import CalendarIco from 'material-ui/svg-icons/action/date-range';
import Calendar from 'material-ui/svg-icons/action/date-range';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import { ipcRenderer } from 'electron'; 
import { createStore } from "redux"; 
import NewAreaIcon from 'material-ui/svg-icons/content/content-copy';
import List from 'material-ui/svg-icons/action/list';
import { 
    cond, isNil, not, defaultTo, isEmpty, uniq, remove, 
    compose, flatten, prop, equals, evolve, allPass, 
    ifElse, merge
} from 'ramda';
import Popover from 'material-ui/Popover';
import BusinessCase from 'material-ui/svg-icons/content/archive';
import Layers from 'material-ui/svg-icons/maps/layers'; 
import Checked from 'material-ui/svg-icons/navigation/check';
import Inbox from 'material-ui/svg-icons/content/inbox';
import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Rx';
import Chip from 'material-ui/Chip';
import DayPicker from 'react-day-picker'; 
import RaisedButton from 'material-ui/RaisedButton';
import { wrapMuiThemeLight } from './utils/wrapMuiThemeLight';
import { generateId } from './utils/generateId';
import { generateEmptyTodo } from './utils/generateEmptyTodo';
import { insideTargetArea } from './utils/insideTargetArea';
import { chooseIcon } from './utils/chooseIcon';
import { Checklist } from './Components/TodoInput/TodoChecklist';
import { globalErrorHandler } from './utils/globalErrorHandler';
import { isDate, isProject, isArea, isToday } from './utils/isSomething';
import { byNotDeleted, byNotCompleted, attachDispatchToProps, isNotEmpty, typeEquals } from './utils/utils';
import { isDev } from './utils/isDev';
import TextareaAutosize from 'react-autosize-textarea';
import { TodoTags } from './Components/TodoInput/TodoTags';
import { TagsPopup } from './Components/TodoInput/TagsPopup';
import { PieChart } from 'react-minimal-pie-chart';
import { AutoresizableText } from './Components/AutoresizableText';
import { stringToLength } from './utils/stringToLength';
import Editor from 'draft-js-plugins-editor';
import { EditorState  } from 'draft-js';
import { shell } from 'electron'; 
import { Provider, connect } from "react-redux";
import createLinkifyPlugin from 'draft-js-linkify-plugin';
import 'draft-js/dist/Draft.css';
import { noteToState, noteFromState } from './utils/draftUtils';
import { Todo, ChecklistItem, Project, Area, Category, Config } from './types';
import { groupProjectsByArea } from './Components/Area/groupProjectsByArea';
import { generateLayout } from './Components/Area/generateLayout';
import { getFilters } from './utils/getFilters';
import { requestFromMain } from './utils/requestFromMain';
let moment = require("moment");
// injectTapEventPlugin();  


window.onerror = function (msg:any, url, lineNo, columnNo, error){
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



const linkifyPlugin = createLinkifyPlugin({
    component:(props) => {
      const {contentState, ...rest} = props;
      return <a {...rest} style={{cursor:"pointer"}} onClick={() => shell.openExternal(rest.href)}/>
    }
});

  

let reducer = (state:QuickEntryProps, action) => cond([
    [
        typeEquals("data"), 
        (action:{type:string,load:any}) : QuickEntryProps => ({...state,...action.load})
    ],
    [
        typeEquals("config"), 
        (action:{type:string,load:Config}) : QuickEntryProps => ({
            ...state,
            config:action.load,
            defaultTags:prop('defaultTags',action.load)
        })
    ],
    [
        () => true, 
        () : QuickEntryProps => ({...state})
    ]
])(action);



let initQuickEntry = () => {  
    let app=document.createElement('div'); 
    app.style.width=`${window.innerWidth}px`; 
    app.style.height=`${window.innerHeight}px`;
    app.id='application';      
    document.body.appendChild(app);
    
    requestFromMain("getConfig", [], (event, config) => config)
    .then(  
        compose(
            el => ReactDOM.render(el,app), 
            store => <Provider store={store}>{
                wrapMuiThemeLight(<QuickEntry {...{} as any}/>)
            }</Provider>, 
            (initialState:QuickEntryProps) => createStore(reducer,initialState),
            (config:Config) : QuickEntryProps => ({
                config, 
                projects:[], 
                todos:[],
                areas:[], 
                defaultTags:prop('defaultTags',config),
                indicators:{},
                dispatch:null
            })
        )
    );
};
 


ipcRenderer.once('loaded', initQuickEntry);



interface QuickEntryState{
    project:Project,
    category:Category,
    title:string,  
    editorState:any,
    deadline:Date,
    deleted:Date,
    attachedDate:Date, 
    attachedTags:string[],
    tag:string, 
    checklist:ChecklistItem[],
    showTags:boolean, 
    showDateCalendar:boolean,  
    showTagsSelection:boolean,
    showChecklist:boolean,   
    showDeadlineCalendar:boolean
};   
  


interface QuickEntryProps{
    config:Config,
    projects:Project[],
    areas:Area[],
    todos:Todo[],
    indicators : { 
        [key:string]:{
            active:number,
            completed:number,
            deleted:number
        }; 
    },
    defaultTags:string[],
    dispatch:Function
};    



@connect((store:QuickEntryProps,props) : QuickEntryProps => ({...store}), attachDispatchToProps)  
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

        let partialState = this.stateFromConfig(this.props.config);

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



    resize = () => {
        let target = document.getElementById('application');
        let checklist = document.getElementById('checklist');
        
        target.style.width=`${window.innerWidth}px`; 
        target.style.height=`${window.innerHeight}px`;

        checklist.style.height=`${window.innerHeight/2}px`;
    };



    stateFromConfig = (config:{ quickEntrySavesTo:string, defaultTags:string[] }) : QuickEntryState => { 
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



    tagsFromTodos = (todos:Todo[]) => flatten(todos.map((todo:Todo) => todo.attachedTags));



    setSmallSize = () : void => ipcRenderer.send('QEsetSmallSize');



    setBigSize = (size:number) : void => ipcRenderer.send('QEsetBigSize',size);



    componentWillReceiveProps(nextProps:QuickEntryProps){ 
        if(this.props.config!==nextProps.config){
           this.setState(this.stateFromConfig(nextProps.config)); 
        }
        
        if(this.props.projects!==nextProps.projects){
            if(isProject(this.state.project)){
                let project = nextProps.projects.find(p => p._id===this.state.project._id);   
     
                if(isNil(project)){ 
                   this.setState({...this.stateFromConfig(nextProps.config), project:null}); 
                }
            }
        }
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
                .subscribe(
                    (config:{ 
                        quickEntrySavesTo:string, 
                        defaultTags:string[] 
                    }) => this.props.dispatch({ type:"config", load:config })
                ),
            
            Observable
                .fromEvent(ipcRenderer, "data", (event,data) => data)
                .subscribe(
                    compose( 
                        ({todos,projects,areas,indicators}) => this.props.dispatch({
                            type:"data",    
                            load:{  
                                projects, 
                                areas, 
                                indicators,
                                todos
                            }
                        }),
                        evolve({
                            projects:(projects) => projects.filter(allPass([byNotDeleted,byNotCompleted])),
                            areas:(areas) => areas.filter(byNotDeleted)
                        })
                    ) as (value: any) => void
                )
        );
    }



    componentWillUnmount(){ 
        this.subscriptions.map(s => s.unsubscribe());
        this.subscriptions=[];
    }



    stateFromTodo = (state,todo:Todo) : QuickEntryState => ({   
        ...state,
        category:todo.category, 
        title:todo.title,
        editorState:EditorState.createEmpty(),
        reminder:todo.reminder, 
        deadline:todo.deadline, 
        deleted:todo.deleted, 
        attachedDate:todo.attachedDate, 
        attachedTags:todo.attachedTags, 
        checklist:todo.checklist  
    });
    


    todoFromState = () : Todo => ({
        _id:generateId(),
        category:this.state.category as Category, 
        type:"todo", 
        title:this.state.title,
        priority:0,
        note:noteFromState(this.state.editorState),  
        checklist:this.state.checklist,
        deadline:this.state.deadline, 
        created:new Date(),
        completedSet:null,
        completedWhen:null,
        reminder:null,
        deleted:this.state.deleted, 
        attachedDate:this.state.category==="today" ? new Date() : this.state.attachedDate,  
        attachedTags:this.state.attachedTags
    }); 



    addTodo = () => {
       let todo = this.todoFromState(); 
       let {project} = this.state;

       if(isNotEmpty(this.state.title)){
          ipcRenderer.send("quick-entry",todo,project); 
       } 
    };
    


    onSave = () => {
        this.addTodo();
        this.clear(); 
        this.hide(); 
    };

    

    blur = () : void => ipcRenderer.send('QEblur'); 



    hide = () : void => ipcRenderer.send('QEhide'); 
    


    clear = () => {
        this.blur();
        let emptyTodo = generateEmptyTodo(generateId(), this.state.category as any, 0);
        let newState : QuickEntryState = {
            ...this.stateFromTodo(this.state,emptyTodo as Todo),
            showDateCalendar:false,     
            showTagsSelection:false, 
            showTags:false, 
            showChecklist:false,   
            showDeadlineCalendar:false,
            project:null, 
            ...this.stateFromConfig(this.props.config) 
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



    onNoteChange = (editorState:any) : void => this.setState({editorState}); 



    onTitleChange = (event:any) : void => this.setState({title:event.target.value});  



    onChecklistButtonClick = (e) => this.setState({showChecklist:true});

      

    onFlagButtonClick = (e) => {
        this.setBigSize(400);
        setTimeout(() => this.setState({showDeadlineCalendar:true}), 200);
    };
    
    

    onCalendarButtonClick = (e) => {
        this.setBigSize(500);
        setTimeout(() => this.setState({showDateCalendar:true}), 200);
    };

    

    closeDeadlineCalendar = () => this.setState({showDeadlineCalendar:false}, () => this.setSmallSize());

    

    closeDateCalendar = () => this.setState({showDateCalendar:false}, () => this.setSmallSize());



    onTagsButtonClick = (e) => this.setState({showTagsSelection:true, showTags:true});



    closeTagsSelection = (e) => this.setState({showTagsSelection:false});



    categoryFromState = () : Category => {
        let {project, category, deadline, attachedDate} = this.state;
 
        if(
            isDate(deadline) || 
            isDate(attachedDate)
        ){
            if(
               isToday(deadline) || 
               isToday(attachedDate)
            ){
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
            {
                attachedDate:null
            }, 
            () => this.setState({category:this.categoryFromState()})
        ); 
    }; 



    onDeadlineCalendarClear = () : void => {
        this.setState(
            {
                deadline:null
            },
            () => {
                this.setState({category:this.categoryFromState()});
                this.closeDeadlineCalendar();
            }
        );
    };
 


    onCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        this.setState(
            {
                attachedDate:day
            },
            () => {
                this.setState({category:this.categoryFromState()});
                this.closeDateCalendar();
            }
        );   
    }; 

    

    onDeadlineCalendarDayClick = (day:Date,modifiers:Object,e:any) => {
        this.setState(
            {
                deadline:day
            }, 
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
                    ref={e => {this.inputRef=e;}}
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
                    onChange={this.onNoteChange } 
                    plugins={[linkifyPlugin]} 
                    //@ts-ignore
                    keyBindingFn={(e) => { if(e.keyCode===13){ e.stopPropagation(); } }}
                    placeholder="Notes"
                />  
            </div>
                <div 
                    ref={(e) => {this.checklist=e;}} 
                    className="scroll"
                    id="checklist"
                    style={{height:`${window.innerHeight/2.5}px`}}
                >   
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
                    origin={{vertical:"center",horizontal:"left"}} 
                    point={{vertical:"bottom",horizontal:"right"}} 
                    rootRef={document.body} 
                    //defaultTags={[]}
                    //todos={[]}
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
                    deadline={this.state.deadline}
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
                    todoFromState={this.todoFromState()}
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
    onSelectProject:(project:Project) => void,
    todayCategory:boolean,
    category:Category,
    attachedDate:Date,
    deadline:Date,
    project:Project,
    areas:Area[],
    projects:Project[],
    todoFromState:Todo
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
            indicators,
            project,
            todoFromState
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
                { selectButtonContent(project,indicators,todoFromState) } 
            </div> 
                <div  
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
                transform:"scale(0.8,0.8)"  
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
                    backgroundColor:"white", //"rgb(39,43,53)",   
                    //boxShadow:"0 0 18px rgba(0,0,0,0.5)", 
                    borderRadius: "20px",
                    overflowX:"hidden"  
                }}
            >    
                <div style={{
                    color: "black",
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
                        color: "black",
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
                        color: "black",
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
                    <DayPicker 
                        { 
                            ...ifElse(
                                () => isDate(this.props.attachedDate),
                                merge({selectedDays:[this.props.attachedDate]}),
                                merge({})
                            )({onDayClick:this.props.onDayClick})
                        }
                    />
                </div> 
                     
                <div  
                    className="hoverDateType"
                    onClick={this.props.onSomedayClick}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        color: "black",
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
                                backgroundColor:"rgb(157, 157, 157)"
                            }} 
                            buttonStyle={{   
                                color:"white",  
                                backgroundColor:"rgb(157, 157, 157)"
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
    deadline : Date,
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
                backgroundColor:"white", //"rgb(39,43,53)", 
                borderRadius: "20px"
            }}>    
                <div style={{
                    color: "black",
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
                    <DayPicker
                    {
                        ...ifElse(
                            () => isDate(this.props.deadline),
                            merge({selectedDays:[this.props.deadline]}),
                            merge({})
                        )({onDayClick:this.props.onDayClick})
                    }
                    /> 
                </div> 
                <RaisedButton
                    onClick={this.props.onClear}
                    style={{
                        margin:"15px",  
                        color:"white",
                       backgroundColor:"rgb(157, 157, 157)"
                    }} 
                    buttonStyle={{  
                        color:"white",
                        backgroundColor:"rgb(157, 157, 157)"
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
    projects:Project[],
    rootRef:HTMLElement, 
    areas:Area[],
    selectInbox:() => void,    
    selectProject:(project:Project) => void,
    category:Category,
    project:Project 
}


interface SelectorPopupState{}
 

class SelectorPopup extends Component<SelectorPopupProps,SelectorPopupState>{
    ref:HTMLElement;
    subscriptions:Subscription[];

    constructor(props){
        super(props);
        this.subscriptions=[];         
    }



    getAreaElement = (a:Area) => { 
        let {selectProject,close,project} = this.props;

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
                <div> <NewAreaIcon style={{width:"14px",height:"14px",color:"rgb(69, 95, 145)"}}/> </div>
                <div    
                    id = {`${a._id}-popup-text`}   
                    style={{  
                        width:"100%",
                        paddingLeft:"5px",
                        fontFamily:"sans-serif",
                        fontSize:"14px",   
                        fontWeight:"bolder",
                        color:"rgba(0, 0, 0, 0.8)",
                        whiteSpace:"nowrap",
                        cursor:"default",
                        WebkitUserSelect:"none" 
                    }}
                >    
                    <AutoresizableText
                        text={a.name}
                        placeholder="New Area"
                        fontSize={14}
                        fontWeight={"bolder"}
                        style={{}}
                        placeholderStyle={{}}
                    />
                </div>  
        </div>
    };   



    getProjectElement = (p:Project) => { 
        let {selectProject,close,project} = this.props;
        let indicator = defaultTo({completed:0, active:0})(this.props.indicators[p._id]);
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
                    width: "14px",
                    height: "14px",
                    position: "relative",
                    borderRadius: "100px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "1px solid rgb(69, 95, 145)",
                    boxSizing: "border-box" 
                }}>   
                    <div style={{
                        width: "12px",
                        height: "12px",
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
                                color:"rgb(69, 95, 145)"
                            }]}    
                            style={{ 
                                color:"white",
                                width:"10px", 
                                height:"10px",
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
                        fontSize:`14px`,  
                        whiteSpace: "nowrap",
                        cursor: "default",
                        color:"black",  
                        WebkitUserSelect: "none" 
                    }}
                >    
                    <AutoresizableText
                        text={p.name}
                        placeholder="New Project"
                        fontSize={14}
                        style={{}}
                        fontWeight={'normal'} 
                        placeholderStyle={{}}
                    />
                </div>     
                {   
                    isNil(project) ? null :
                    project._id!==p._id ? null : 
                    <Checked style={{  
                        color:"black",
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
        let {open,anchorEl,close,projects,rootRef,project,category} = this.props;

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
                    background:"rgba(0, 0, 0, 0)", 
                    backgroundColor:"rgb(0, 0, 0, 0)"
                }}
                anchorEl={anchorEl} 
                canAutoPosition={true}  
                onRequestClose={() => {}} 
                scrollableContainer={rootRef}
                useLayerForClickAway={false} 
                anchorOrigin={{vertical: "top", horizontal: "left"}} 
                targetOrigin={{vertical: "bottom", horizontal: "left"}} 
            >      
                <div    
                    ref={(e) => { this.ref=e; }} 
                    onClick = {(e) => {e.stopPropagation();}}
                    style={{borderRadius:"10px", width:"240px"}}
                > 
                    <div    
                        className={"scroll"}
                        style={{   
                            backgroundColor:"rgba(238,237,239,1)",
                            paddingRight:"10px",
                            paddingLeft:"10px",
                            paddingTop:"5px",
                            paddingBottom:"5px",
                            maxHeight:"150px",
                            overflowX:"hidden" 
                        }}  
                    >     
                            <div style={{display:"flex", alignItems:"center", paddingTop:"5px", paddingBottom:"5px"}}>
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
                                            height:"15px",
                                            width:"15px",
                                            marginTop:"1px",
                                            color:"rgb(69, 95, 145)", 
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
                                            color:"black", 
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
                                                    color:"black",
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
                                color: "rgba(155, 155, 155, 1)",
                                width: "100%",
                                borderBottom: "1px solid rgba(155,155,155,0.2)"
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



let selectButtonContent = (
    project:Project, 
    indicators:{ 
        [key:string]:{
            active:number,
            completed:number,
            deleted:number
        }; 
    },
    todo:Todo
) : JSX.Element => { 

    let {inbox,today,hot,next,someday,upcoming} = getFilters([]);

    if(allPass(inbox)(todo) && isNil(project)){

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
        </div>

    }else if(allPass(next)(todo) && isNil(project)){

        return <div  
            style={{
                cursor:"pointer",
                display:"flex",
                paddingLeft:"15px", 
                height:"25px", 
                alignItems:"center"
            }}
        >
            <Layers
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
                Next
            </div>
        </div>

    }else if(allPass(someday)(todo) && isNil(project)){

        return <div  
            style={{
                cursor:"pointer",
                display:"flex",
                paddingLeft:"15px", 
                height:"25px", 
                alignItems:"center"
            }}
        >
            <BusinessCase
                style={{
                    width:"18px",
                    height:"18px",
                    color:"rgba(100,100,100,1)", 
                    cursor:"default"
                }}  
            />
            <div style={{paddingRight:"5px", paddingLeft:"5px", WebkitUserSelect:"none"}}>  
                Someday
            </div>
        </div>

    }else if(
        (
            allPass(today)(todo) || 
            allPass(hot)(todo) || 
            allPass(upcoming)(todo)
        )
        &&
        isNil(project)
    ){

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
            <div style={{paddingRight:"5px",paddingLeft:"5px",WebkitUserSelect:"none"}}>  
                Upcoming
            </div>
        </div>

    }else if(isProject(project)){ 

        let indicator = defaultTo({completed:0, active:0})(indicators[project._id]);
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
        </div>  

    }else{
        return null;
    }
};
