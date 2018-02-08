import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ipcRenderer, remote } from 'electron';
import { Component } from "react"; 
import { Provider, connect } from "react-redux";
import ClearArrow from 'material-ui/svg-icons/content/backspace';  
import FlatButton from 'material-ui/FlatButton';
import Clear from 'material-ui/svg-icons/content/clear';
import Advanced from 'material-ui/svg-icons/action/settings-applications';   
import General from 'material-ui/svg-icons/action/description';   
import Cloud from 'material-ui/svg-icons/file/cloud';   
import QuickEntry from 'material-ui/svg-icons/content/add-box';  
import CalendarEvents from 'material-ui/svg-icons/action/date-range';  
import Database from 'material-ui/svg-icons/device/storage';    
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import NewProjectIcon from 'material-ui/svg-icons/image/timelapse';
import TriangleLabel from 'material-ui/svg-icons/action/loyalty';
import Popover from 'material-ui/Popover';
import { 
    remove, isNil, not, isEmpty, compose, toPairs, map, findIndex,
    contains, last, cond, defaultTo, flatten, uniq, concat 
} from 'ramda';
let uniqid = require("uniqid");    
import { Observable } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx'; 
import { Subscriber } from "rxjs/Subscriber";
import { Subscription } from 'rxjs/Rx';
import { Checkbox } from '../TodoInput/TodoInput';
import { attachDispatchToProps, isString, debounce, isNewVersion, keyFromDate, checkForUpdates, uppercase, isArrayOfStrings, assert } from '../../utils';
import { Store, globalErrorHandler, updateConfig } from '../../app';
import { 
    generateId, Calendar, getCalendars, getProjects, getAreas, getTodos, Area, Project, 
    Todo, destroyEverything, initDB, addTodos, addProjects, addAreas, addCalendars 
} from '../../database';
import { isDate } from 'util';
import { SimplePopup } from '../SimplePopup';
import { getIcalData, IcalData, AxiosError } from '../Calendar';
import { fetchData, filter } from '../MainContainer';
import { UpdateInfo, UpdateCheckResult } from 'electron-updater';
const Promise = require('bluebird');   
const fs = remote.require('fs');
const path = require("path");
const os = remote.require('os'); 
const dialog = remote.dialog;

interface SettingsPopupProps extends Store{}
interface SettingsPopupState{}
@connect((store,props) =>  ({ ...store, ...props }), attachDispatchToProps)  
export class SettingsPopup extends Component<SettingsPopupProps,SettingsPopupState>{
    constructor(props){ super(props) }
    render(){
        let {openSettings,dispatch} = this.props;

        return <SimplePopup
           show={openSettings} 
           onOutsideClick={() => dispatch({type:"openSettings",load:false})}
        >
            <Settings {...{} as any}/> 
        </SimplePopup>    
    }  
}  

interface SettingsProps extends Store{}
export type section =  'General' | 'QuickEntry' | 'CalendarEvents' | 'Advanced' | 'Tags';
interface SettingsState{}

@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps) 
export class Settings extends Component<SettingsProps,SettingsState>{

    constructor(props){ super(props) }
    
    render(){
        let {selectedSettingsSection, dispatch} = this.props;
        let height = window.innerHeight/1.7;
        let width = window.innerWidth/1.2;


        return <div style={{
            display:"flex", 
            flexDirection:"column", 
            height:height, 
            width:width,
            borderRadius:"5px",
            backgroundColor:"rgba(254, 254, 254, 1)",
            boxShadow:"0 0 18px rgba(0,0,0,0.5)", 
        }}> 
            <div style={{
                width:"100%",
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                flexDirection:"column",
                backgroundColor:"rgb(234, 235, 239)",
            }}>  
                <div style={{
                    padding:"5px",
                    width:"100%",
                    display:"flex",
                    fontWeight:"bold",
                    alignItems:"center",
                    color:"rgba(10,10,10,0.8)",
                    justifyContent:"center",
                    cursor:"default"  
                }}>
                    Settings
                </div> 
 
                <div style={{ 
                    display:"flex",
                    justifyContent:"space-around",
                    alignItems:"center",
                    width:"100%",
                    padding:"10px"  
                }}> 
                    <Section  
                        onClick={() => dispatch({type:"selectedSettingsSection", load:'General'})} 
                        icon={<General style={{color:"dimgray", height:18, width:18}}/>}
                        name={'General'}
                        selected={selectedSettingsSection==='General'}
                    /> 
                    <Section
                        onClick={() => dispatch({type:"selectedSettingsSection", load:'QuickEntry'})} 
                        icon={<QuickEntry style={{color:"rgba(100,100,100,0.8)", height:18, width:18}}/>}
                        name={'Quick Entry'}
                        selected={selectedSettingsSection==='QuickEntry'}
                    />
                    <Section
                        onClick={() => dispatch({type:"selectedSettingsSection", load:'CalendarEvents'})} 
                        icon={<CalendarEvents style={{color:"rgba(150,10,10,0.8)", height:18, width:18}}/>}
                        name={'Calendar Events'}
                        selected={selectedSettingsSection==='CalendarEvents'}
                    />
                    <Section
                        onClick={() => dispatch({type:"selectedSettingsSection", load:'Advanced'})} 
                        icon={<Advanced style={{color:"rgba(10,10,10,0.8)", height:18, width:18}}/>}
                        name={'Advanced'} 
                        selected={selectedSettingsSection==='Advanced'}
                    />  
                    <Section
                        onClick={() => dispatch({type:"selectedSettingsSection", load:'Tags'})} 
                        icon={<TriangleLabel style={{color:"rgba(10,10,10,0.8)", height:18, width:18}}/>}
                        name={'Tags'} 
                        selected={selectedSettingsSection==='Tags'} 
                    />  
                </div>     
            </div> 
            <div 
              className="scroll"  
              style={{flexGrow:0.7,display:"flex",width:"100%",cursor:"default"}}
            >  
            {
                cond([  
                    [ 
                        (selectedSettingsSection:string) : boolean => selectedSettingsSection==="General",  
                        () => <GeneralSettings />
                    ],  
                    [ 
                        (selectedSettingsSection:string) : boolean => selectedSettingsSection==="QuickEntry",  
                        () => <QuickEntrySettings />
                    ], 
                    [ 
                        (selectedSettingsSection:string) : boolean => selectedSettingsSection==="CalendarEvents",  
                        () => <CalendarEventsSettings {...{} as any} />
                    ], 
                    [  
                        (selectedSettingsSection:string) : boolean => selectedSettingsSection==="Advanced",  
                        () => <AdvancedSettings {...{} as any} />
                    ],
                    [
                        (selectedSettingsSection:string) : boolean => selectedSettingsSection==="Tags",  
                        () => <TagsSettings {...{} as any} />
                    ]
                ])(selectedSettingsSection) 
            }   
            </div>
        </div>
    } 
}

 

interface SectionProps{
    onClick:() => void,
    icon:JSX.Element,
    name:string,
    selected:boolean
}

class Section extends Component<SectionProps,{}>{

    render(){

        let {icon, name, onClick, selected} = this.props;
          
        return <div  
            className={selected ? '' : "settingsSection"}
            onClick={() => onClick()}
            style={{
                paddingTop:"4px",
                paddingBottom:"4px",
                paddingLeft:"8px",
                paddingRight:"8px",
                borderRadius:"5px",
                display:'flex',  
                backgroundColor:selected ? "rgba(100,100,100,0.1)" : '',
                alignItems:"center", 
                justifyContent:"center", 
                cursor:"pointer"  
            }}
        >
            <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}> 
                {icon}
            </div>
            <div style={{
              color:"black", fontSize:"14px", whiteSpace:"nowrap", display:"flex", alignItems:"center", 
              justifyContent:"center", textAlign:"center", paddingLeft:"2px"
            }}>   
                {name}  
            </div>
        </div>
    }   
}


 

  
interface GeneralSettingsProps{}

interface GeneralSettingsState{}

class GeneralSettings extends Component<GeneralSettingsProps,GeneralSettingsState>{

    constructor(props){
        super(props);
    }

    render(){
        return <div style={{
            display:"flex", 
            flexDirection:"column", 
            width:"100%",
            justifyContent:"space-around" 
        }}>
            <div style={{
                paddingLeft:"25px",  
                display:"flex",  
                flexGrow:1,
                flexDirection:"column",  
                justifyContent:"space-around"
            }}> 
                <div style={{display:"flex",alignItems:"center",width:"80%"}}>
                    <Checkbox checked={false} onClick={() => {}}/>
                    <div style={{paddingLeft:"10px"}}>Group to-dos in the Today list by project or area</div>
                </div> 

                <div style={{display:"flex",alignItems:"center",width:"80%"}}>
                    <Checkbox checked={true} onClick={() => {}}/>
                    <div style={{paddingLeft:"10px"}}>Preserve window width when resizing sidebar</div>
                </div>
            </div>
            <div 
                style={{
                    outline:"none",
                    position:"relative",
                    width:"100%",
                    borderBottom:"1px solid rgba(100,100,100,0.2)"
                }}
            >
            </div>  
            <div style={{display:"flex", flexGrow:0.7, width:"100%"}}>
                <div style={{ 
                    display:"flex", alignItems:"flex-end",  
                    width:"50%", flexDirection:"column",
                    justifyContent:"space-around", fontSize:"14px" 
                }}>      
                    <div>Move completed items to Logbook:</div>
                    <div>Dock count:</div>  
                </div>  
                <div style={{  
                    display:"flex", alignItems:"flex-start", 
                    width:"50%", flexDirection:"column",
                    justifyContent:"space-around" 
                }}> 
                    <div style={{paddingLeft:"20px"}}>     
                        <select 
                            style={{
                                backgroundColor:"white",
                                outline:"none",
                                borderRadius:"4px"
                            }}  
                            name="text" 
                            value={"immediately"}
                            onChange={(event) => this.setState({})}  
                        >  
                            <option value="immediately">Immediately</option> 
                        </select>   
                    </div>

                    <div style={{paddingLeft:"20px"}}>
                        <select   
                            style={{
                                backgroundColor:"white",
                                outline:"none",
                                borderRadius:"4px"
                            }}  
                            name="text"
                            value={"duetoday"}
                            onChange={(event) => this.setState({})}  
                        >   
                            <option value="duetoday">Due + Today</option> 
                        </select>
                    </div>  
                </div>
            </div>
        </div>
    }
} 



interface QuickEntrySettingsProps{}

interface QuickEntrySettingsState{}

class QuickEntrySettings extends Component<QuickEntrySettingsProps,QuickEntrySettingsState>{

    constructor(props){
        super(props);
    }

    render(){
        return <div style={{
            width:"100%",
            display:"flex",
            paddingLeft:"25px",
            flexDirection:"column",
            alignItems:"flex-start",
            justifyContent:"space-around"
        }}>

            <div style={{width:"100%"}}>
                <div style={{display:"flex",alignItems:"center"}}>
                    <Checkbox checked={false} onClick={() => {}}/>
                    <div style={{paddingLeft:"10px"}}>Enable shortcut for Quick Entry</div>
                </div> 
                <div style={{
                    fontSize:"13px",
                    width:"80%",
                    color:"rgba(100,100,100,0.9)",
                    cursor:"default" 
                }}>
                    The Quick Entry window lets you enter new to-dos into Things from anywhere
                    without having to switch applications. Use the keyboard shortcut to make 
                    the window appear.
                </div>
            </div>

            <div 
                style={{
                    width:"350px",
                    display:"flex",
                    fontSize:"15px",
                    color:"rgba(10,10,10,0.8)",
                    fontWeight:"bold",
                }}   
            > 
                <div>Quick Entry saves to</div>
                <div style={{paddingLeft:"5px", paddingRight:"5px"}}>
                    <select   
                        style={{
                            backgroundColor:"white",  
                            outline:"none",
                            paddingLeft:"5px",
                            paddingRight:"5px",
                            borderRadius:"4px"
                        }}  
                        name="text" 
                        value={"inbox"}
                        onChange={(event) => this.setState({})}  
                    >   
                        <option value="inbox">Inbox</option> 
                    </select>
                </div>    
                <div>by default</div>
            </div>
        </div>
    }   
}



interface TagsSettingsProps extends Store{}
interface TagsSettingsState{}

@connect((store,props) => ({...store, ...props}), attachDispatchToProps)   
class TagsSettings extends Component<TagsSettingsProps,TagsSettingsState>{

    constructor(props){ super(props) }

    getTags = () : string[] => {
        let {todos,tags} = this.props; 
        return compose(
            uniq,
            flatten,
            concat(tags),
            () => map((t:Todo) => t.attachedTags)(todos)
        )() as string[]
    } 

    onRemoveTag = (tag:string) => () => {
        let {dispatch, todos} = this.props;
        let selectedTodos = filter(todos, (t:Todo) => contains(tag)(t.attachedTags), "");

        dispatch({
            type:"updateTodos", 
            load:selectedTodos.map((t:Todo) => {
              let idx = findIndex((todoTag:string) => todoTag===tag)(t.attachedTags);
              return ({...t,attachedTags:remove(idx,1,t.attachedTags)});
            })
        })
    }

    render(){
        let tags = this.getTags();
        assert(isArrayOfStrings(tags),'tags is not of type string[]. TagsSettings.');
        
        return <div style={{width:"100%",display:"flex"}}>
        <div
            onClick={(e) => {e.stopPropagation();}} 
            style={{display:"flex",paddingTop:"5px",paddingBottom:"5px",flexWrap:"wrap"}}
        >
            {      
                tags
                .sort((a:string,b:string) : number => a.localeCompare(b))
                .map( 
                    (tag:string, index:number) => 
                        <div key={`${tag}-${index}`}>
                        <div style={{
                            borderRadius:"15px", 
                            backgroundColor:"rgb(189,219,209)",
                            paddingLeft:"5px",
                            paddingRight:"5px", 
                            display:"flex",
                            alignItems:"center",
                            height:"30px",
                            margin:"2px"
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
                              style={{padding:"2px",alignItems:"center",cursor:"pointer",display:"flex"}} 
                              onClick={this.onRemoveTag(tag)}
                            >
                                <Clear style={{color:"rgba(100,100,100,0.5)",height:20,width:20}}/>
                            </div>
                        </div>
                        </div> 
                )   
            }
        </div>
        </div>
    }   
}




interface CalendarEventsSettingsProps extends Store{}

interface CalendarEventsSettingsState{ url:string, error:string }


@connect((store,props) => ({...store, ...props}), attachDispatchToProps)   
class CalendarEventsSettings extends Component<CalendarEventsSettingsProps,CalendarEventsSettingsState>{

    constructor(props){
        super(props);
        this.state = { url:'', error:'' };
    }

    onError = (e) => globalErrorHandler(e)

    onUrlChange = (e) => this.setState({url:e.target.value, error:''})

    onUrlSubmit = (e) => {
        let { url, error } = this.state;
        let { calendars, dispatch, hideHint } = this.props;
        let urls = calendars.map( c => c.url );
 
        if(isEmpty(url)){ return null }
        if(contains(url)(urls)){ return null }

        let extension = last(url.split('.'));

        if(extension!=='ics'){    
           this.setState({error:"Incorrect format. Only ics extension supported."});
           return null;    
        }  
        
        if(url.startsWith("webcal")){
           url = url.replace("webcal","http");
        }
         
        getIcalData(url)
        .then( 
            (data:IcalData) => { 
                let {calendar,events,error} = data;
                
                if(!hideHint){ updateConfig(dispatch)({hideHint:true}) }  
                
                if(!isNil(error)){  
                   this.setState({error:error.message}, () => this.onError(error));
                   return null;  
                }
                
                let load : Calendar = {
                    url, 
                    active:true,
                    _id:generateId(),
                    name:calendar.name, 
                    description:calendar.description,
                    timezone:calendar.timezone,
                    events,
                    type:"calendar"
                } 

                dispatch({type:'addCalendar', load});

                this.setState({url:'', error:''});
            } 
        )   
    }
    
 
    onItemCheck = debounce(
        (calendar:Calendar) : void => this.props.dispatch({
            type:"updateCalendar", 
            load:{ ...calendar, active:!calendar.active }
        }), 
        50
    )     
   

    onShowCalendarEvents = debounce(
        (e) => {
            let {showCalendarEvents,dispatch} = this.props;
            dispatch({type:"showCalendarEvents", load:!showCalendarEvents});
        },
        50
    ) 
    
    
    onRemoveCalendar = (_id:string) => (e) => this.props.dispatch({ type:"removeCalendar", load:_id })
      

    render(){
        let {calendars,showCalendarEvents} = this.props; 
        let {error} = this.state;

        return  <div style={{width:"100%", paddingTop:"25px", paddingLeft:"25px"}}>
                <div style={{display:"flex", alignItems:"center"}}>
                    <Checkbox checked={showCalendarEvents} onClick={this.onShowCalendarEvents}/>
                    <div style={{paddingLeft:"10px"}}>Show Calendar Events in Today and Upcoming lists</div>
                </div>  
                <div style={{
                    display:"flex", 
                    paddingTop:"20px", 
                    paddingBottom:"20px",  
                    flexDirection:"column"
                }}>   
                    {
                        calendars
                        .map( 
                            (calendar,index) => <div 
                                key={index}
                                style={{
                                    display:"flex", 
                                    alignItems:"center", 
                                    padding:"10px",  
                                    justifyContent:"space-between",
                                    backgroundColor:index%2 ? "white" : "rgba(200,200,200,0.3)",
                                    overflowX:"hidden"
                                }}
                            >   
                                <div>
                                    <Checkbox 
                                        checked={calendar.active}   
                                        onClick={() => this.onItemCheck(calendar)} 
                                    />   
                                </div>
                                <div style={{
                                    paddingLeft:"10px", 
                                    whiteSpace:"nowrap", 
                                    width:"85%", 
                                    overflowX:"hidden"
                                }}>
                                    {calendar.name}
                                </div> 
                                <div  
                                style={{alignItems:"center", display:"flex", cursor:"pointer"}} 
                                onClick={this.onRemoveCalendar(calendar._id)}
                                >  
                                    <Clear 
                                        style={{
                                            color:"rgba(100,100,100,0.5)",
                                            height:30,
                                            width:30 
                                        }}
                                    /> 
                                </div>
                            </div> 
                        )
                    } 
                </div> 
                <div style={{display:"flex",alignItems:"center",paddingBottom:"20px",paddingRight:"10px"}}>
                    <div style={{width:"100%", paddingRight:"15px"}}> 
                        <input 
                            type="url"     
                            value={this.state.url}
                            placeholder="Input Calendar URL" 
                            style={{
                                backgroundColor:"white",
                                color:"rgba(100, 100, 100, 0.9)",   
                                outline:"none", 
                                textAlign:"center",
                                alignItems:"center",
                                display:"flex",
                                justifyContent:"center",
                                height:"30px",
                                width:"100%",  
                                borderRadius:"4px",  
                                border:"1px solid rgba(100,100,100,0.3)"
                            }}
                            onChange={this.onUrlChange}
                        />  
                    </div> 
                    <div     
                        onClick={this.onUrlSubmit}
                        style={{     
                            display:"flex",
                            alignItems:"center",
                            cursor:"pointer",
                            justifyContent:"center",
                            height:"20px",
                            borderRadius:"5px",
                            paddingLeft:"25px",
                            paddingRight:"25px",
                            paddingTop:"5px", 
                            paddingBottom:"5px",
                            backgroundColor:"rgba(81, 144, 247, 1)"  
                        }}  
                    >   
                        <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px"}}>  
                            Add Calendar 
                        </div>   
                    </div> 
                </div>  
                {
                    isEmpty(error) ? null :
                    <div style={{
                        paddingLeft:"30px",
                        paddingBottom:"10px",
                        fontSize:"15px",
                        color:"red",
                        userSelect:"none"
                    }}>   
                        {error}
                    </div> 
                }  
        </div>
    }
}



let selectFolder = () => new Promise(
    resolve => {
        dialog.showOpenDialog( 
            { 
                title:`Select data folder`,
                buttonLabel:'Select',
                properties:['openDirectory']
            },  
            (value) => {
                if(value)   
                   resolve(value[0]); 
                else
                   resolve(undefined);
            }
        )
    } 
)



let selectJsonDatabase = () => new Promise(
    resolve => {  
        dialog.showOpenDialog( 
            { 
                title:`Select database file`,
                buttonLabel:'Select',
                properties:['openFile'],
                filters:[{extensions: ["json"], name: ""}]
            },  
            (value) => { 
                if(value)    
                   resolve(value[0]); 
                else
                   resolve(undefined);
            }
        )
    } 
)



let closeClonedWindows = () => new Promise(resolve => {  
    ipcRenderer.removeAllListeners("closeClonedWindows");  
    ipcRenderer.send("closeClonedWindows");
    ipcRenderer.on("closeClonedWindows", (event) => resolve());
})


let writeJsonFile = (obj:any,pathToFile:string) : Promise<any> => 
    new Promise(
        resolve => {
            let json : string = JSON.stringify(obj);
            fs.writeFile(
                pathToFile, 
                json, 
                'utf8', 
                (err) => {
                    if (err){ resolve(err) }
                    else{ resolve() }
                } 
            );
        }
    )


 
let readJsonFile = (path:string) : Promise<any> => 
    new Promise(
        resolve => {
            fs.readFile(
                path, 
                'utf8', 
                (err, data) => {
                    if (err){ resolve(err) }
                    else{ resolve(JSON.parse(data)) }
                }
            );
        }
    )


let correctFormat = (json:any) : boolean => not(isNil(json.database));

let removeRev = (item) => {
    delete item["_rev"];
    item["_rev"] = undefined;
    return item;
};

interface AdvancedProps extends Store{}

interface AdvancedState{ 
    importMessage:string,
    exportMessage:string,
    updateStatus:string 
    importPath:string, 
    exportPath:string
}   
  
@connect((store,props) => ({ ...store, ...props }), attachDispatchToProps)  
class AdvancedSettings extends Component<AdvancedProps,AdvancedState>{
    backupFolder:string;
    backupFilename:string;
    limit:number;
     
    constructor(props){
        super(props);  
        this.backupFolder = path.resolve(os.homedir(), "Documents");
        this.backupFilename = `backup${uniqid()}.json`;
        this.limit = 1000000;

        this.state = {   
           importMessage:'',
           exportMessage:'', 
           importPath:'',   
           exportPath:'',
           updateStatus:`Current version is : ${remote.app.getVersion()}.`
        };       
    };

    updateState = (state) => new Promise( resolve => this.setState(state, () => resolve()) );

    getDatabaseObjects = () : Promise<[Calendar[],Project[],Area[],Todo[]]> => {
        return Promise.all([
            getCalendars(this.onError)(true, this.limit), 
            getProjects(this.onError)(true, this.limit),
            getAreas(this.onError)(true, this.limit),
            getTodos(this.onError)(true, this.limit) 
        ])  
    };

    replaceDatabaseObjects = (json) : Promise<void> => {
        let { todos, projects, areas, calendars } = json.database;

        return  closeClonedWindows()
                .then(() => destroyEverything())
                .then(() => initDB())
                .then(() => {  
                    return Promise.all([  
                        addTodos(this.onError, defaultTo([])(todos).map(removeRev)),      
                        addProjects(this.onError, defaultTo([])(projects).map(removeRev)), 
                        addAreas(this.onError, defaultTo([])(areas).map(removeRev)),
                        addCalendars(this.onError, defaultTo([])(calendars).map(removeRev))
                    ])   
                }) 
                .then(() => fetchData(this.props,this.limit,this.onError)) 
    };   
    
    onError = (error) => globalErrorHandler(error);

    export = (folder:string) => {   
        if(isNil(folder)){ return }
        let to:string = path.resolve(folder, `${keyFromDate(new Date())}-${uniqid()}.json`);
        return this.getDatabaseObjects()
        .then(
            ([calendars,projects,areas,todos]) => 
                writeJsonFile(
                    { database : { todos, projects, areas, calendars } },
                    to 
                )
                .then((err) => ({err,to}))
        )       
    };    

    import = (pathToFile:string) => {  
        if(isNil(pathToFile)){ return }
        let {dispatch} = this.props;
        let backupFolderExists : boolean = fs.existsSync(this.backupFolder);
        let message = (place) => `Data was successfully imported. You can find a backup of your old database in ${place}.`;
        let pathToBackup = backupFolderExists ? path.resolve( this.backupFilename, this.backupFolder) :
                                                path.resolve( this.backupFilename );
        
        dispatch({type:"selectedCategory",load:"inbox"});

        return readJsonFile(pathToFile)  
               .then((json) => { 
                    if(correctFormat(json)){
                        this.export(pathToBackup) 
                        .then(() => this.setState({importMessage:'Loading...'}))
                        .then(() => this.replaceDatabaseObjects(json))
                        .then(() => this.setState({importMessage:message(pathToBackup)}))
                    }else{
                        this.setState({importMessage:"Incorrect format."})
                    } 
               })   
    };
    
    onSelectExportFolder = () => { 
        selectFolder()
        .then(
           (folder:string) => {
                if(isNil(folder) || isEmpty(folder)){ return }

                this
                .updateState({exportPath:folder})
                .then(() => this.export(folder))
                .then(({err,to}) => {
                    if(isNil(err)){ 
                       this.updateState({exportMessage:`Data was successfully exported to ${to}.`})
                    }
                })
            }
        )
    }; 

    onSelectImportFile = () => {  
        selectJsonDatabase()
        .then(
            (path:string) => {
                if(isNil(path) || isEmpty(path)){ return }
                
                this.updateState({importPath:path}).then(() => this.import(path))
            }
        )
    };
      
    checkUpdates = debounce(() => { 
        let {dispatch} = this.props;
        this.setState({updateStatus:"Loading..."});
        checkForUpdates()  
        .then( 
           (updateCheckResult:UpdateCheckResult) => {  
                let {updateInfo} = updateCheckResult;
                let currentAppVersion = remote.app.getVersion(); 
                let canUpdate = isNewVersion(currentAppVersion,updateInfo.version);

                if(canUpdate){  
                   dispatch({type:"openSettings", load:false});  
                   dispatch({type:"showUpdatesNotification", load:true});
                }else{   
                   this.setState({updateStatus:"Latest version already installed."}); 
                }; 
            }      
        );  
    },100); 
     
    shouldSendStatistics = debounce(() => {
        let {shouldSendStatistics,dispatch} = this.props;
        updateConfig(dispatch)({shouldSendStatistics:!shouldSendStatistics}); 
    },50);
     
    render(){   
        let {importPath, exportPath, updateStatus, exportMessage, importMessage} = this.state;
        let {shouldSendStatistics} = this.props;
        let buttonStyle = {     
            display:"flex",
            alignItems:"center",
            cursor:"pointer",
            marginRight:"15px", 
            justifyContent:"center",
            width: "40px",
            height:"20px", 
            borderRadius:"5px",
            paddingLeft:"25px",
            paddingRight:"25px",
            paddingTop:"5px", 
            paddingBottom:"5px",
            backgroundColor:"rgba(81, 144, 247, 1)"  
        } as any;

        return <div style={{paddingTop:"25px",width:"90%",paddingLeft:"25px"}}>
            <div style={{display:"flex",flexDirection:"column",justifyContent:"space-around",height:"90%"}}> 
           
            <div style={{display:"flex", alignItems:"center"}}>
                <Checkbox checked={shouldSendStatistics} onClick={this.shouldSendStatistics}/>
                <div style={{paddingLeft:"10px"}}>Send anonymous usage statistics</div>
            </div> 

            <div style={{height:"1px",width:"100%",borderBottom:"1px solid rgb(200,200,200)"}}></div>   
            <div style={{ 
                display:"flex",
                fontSize:"15px",
                alignItems:"center",
                fontWeight:500,
                color:"black",
                userSelect:"none"
            }}>       
                Database Backup  
            </div> 
            { 
                isEmpty(importMessage) ? null :
                <div style={{
                    display: "flex",
                    fontSize: "14px",
                    alignItems: "center",
                    fontWeight: 500,
                    color: importMessage==="Incorrect format." ? "red" : "green",
                    userSelect: "none"
                }}>       
                    {importMessage}  
                </div>  
            } 
            { 
                isEmpty(exportMessage) ? null :
                <div style={{
                    display: "flex",
                    fontSize: "14px",
                    alignItems: "center",
                    fontWeight: 500,
                    color: "green",
                    userSelect: "none"
                }}>       
                    {exportMessage}  
                </div>  
            }   
                <div style={{display:"flex"}}>
                    <div     
                        onClick={this.onSelectImportFile}
                        style={buttonStyle}  
                    >   
                        <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px"}}>  
                            Import
                        </div>   
                    </div> 
                    <div     
                        onClick={this.onSelectExportFolder} 
                        style={buttonStyle}  
                    >   
                        <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px"}}>  
                            Export 
                        </div>   
                    </div> 
                </div> 

                <div style={{height:"1px",width:"100%",borderBottom:"1px solid rgb(200,200,200)"}}></div>  
                <div style={{display:"flex", justifyContent:"space-between"}}>
                    { 
                        isEmpty(updateStatus) ? null :
                        <div style={{
                            display: "flex",
                            fontSize: "14px",
                            alignItems: "center",
                            fontWeight: 500,
                            color: "green",
                            userSelect: "none"
                        }}>     
                            {updateStatus} 
                        </div>  
                    }     
                    <div     
                        onClick={this.checkUpdates} 
                        style={{     
                            display:"flex",
                            alignItems:"center",
                            cursor:"pointer",
                            justifyContent:"center",
                            height:"20px",
                            width:"100px",
                            borderRadius:"5px",
                            paddingLeft:"25px",
                            paddingRight:"25px",
                            paddingTop:"5px", 
                            paddingBottom:"5px",
                            backgroundColor:"rgba(81, 144, 247, 1)"  
                        }}   
                    >   
                        <div style={{color:"white",whiteSpace:"nowrap",fontSize:"16px"}}>  
                            Check for updates
                        </div>    
                    </div>    
                </div> 
            </div>
        </div>    
    }   
}  