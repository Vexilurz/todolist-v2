
import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { 
    remove, isNil, not, isEmpty, compose, toPairs, map, findIndex, equals, ifElse, evolve,
    contains, last, cond, defaultTo, flatten, uniq, concat, all, identity, when, prop 
} from 'ramda';
import { Checkbox } from '../TodoInput/TodoInput';
import { 
    keyFromDate, checkForUpdates, getCompletedWhen, 
    log, removeRev, closeClonedWindows, correctFormat, selectFolder,
    selectJsonDatabase, isNotNil 
} from '../../utils/utils';
import { isNewVersion } from '../../utils/isNewVersion';
import { 
    Area, Project, Todo, destroyEverything, initDB, addTodos, 
    addProjects, addAreas, addCalendars, getDatabaseObjects, Calendar  
} from '../../database';
import { filter } from '../MainContainer';
import { UpdateInfo, UpdateCheckResult } from 'electron-updater';
import { updateConfig } from '../../utils/config';
import { isArrayOfTodos } from '../../utils/isSomething';
import { assert } from '../../utils/assert';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { requestFromMain } from '../../utils/requestFromMain';
import { getData } from '../../utils/getData';
import { convertEventDate } from '../Calendar';
let uniqid = require("uniqid");   
const Promise = require('bluebird');   
const path = require("path");



interface AdvancedProps{
    limit:Date,
    shouldSendStatistics:boolean,
    moveCompletedItemsToLogbook:any,
    groupTodos:boolean,
    disableReminder:boolean,
    todos:Todo[],
    dispatch:Function
} 



interface AdvancedState{ 
    showPopup:boolean,
    importMessage:string,
    exportMessage:string,
    updateStatus:string 
    importPath:string, 
    exportPath:string
}



export class AdvancedSettings extends Component<AdvancedProps,AdvancedState>{
    
    constructor(props){
        super(props);  

        this.state = {   
           showPopup:false,
           importMessage:'',
           exportMessage:'', 
           importPath:'',   
           exportPath:'',
           updateStatus:``
        };       
    };
    


    message = (place) => `Data was successfully imported. You can find a backup of your old database in ${place}.`;



    updateState : (state:any) => Promise<void> = 
    (state) => new Promise( resolve => this.setState(state, () => resolve()) );



    componentDidMount(){
        requestFromMain<any>('getVersion',[],(event,version) => version)
        .then(
            (version) => this.updateState({updateStatus:`Current version is : ${version}.`}) 
        )
    }; 



    replaceDatabaseObjects : (
        json:{
            database:{
                todos:Todo[], 
                projects:Project[], 
                areas:Area[], 
                calendars:Calendar[]
            }
        }
    ) => Promise<void> = 
    (json) => {
        let { todos, projects, areas, calendars } = json.database;
        let remRev = compose(map(removeRev), defaultTo([])); 

        return  closeClonedWindows()
                .then(() => destroyEverything())  
                .then(() => initDB()) 
                .then(() => Promise.all([  
                    addTodos(this.onError, remRev(todos)),      
                    addProjects(this.onError, remRev(projects)), 
                    addAreas(this.onError, remRev(areas)),
                    addCalendars(this.onError, remRev(calendars))
                ])) 
                .then(() => getData(this.props.limit,this.onError,1000000))  
                .then(
                    ({projects, areas, todos, calendars}) => this.setData({
                        projects:defaultTo([], projects), 
                        areas:defaultTo([], areas), 
                        todos:defaultTo([], todos), 
                        calendars:map(
                            evolve({ events:map(convertEventDate) }),
                            defaultTo([], calendars)
                        )
                    })  
                );
    };   



    setData = ({projects, areas, todos, calendars}) : void => {
        let {dispatch} = this.props;
        dispatch({
            type:"multiple",
            load:[
                {type:"setProjects", load:projects},
                {type:"setAreas", load:areas},
                {type:"setTodos", load:todos},
                {type:"setCalendars", load:calendars}
            ]
        }); 
    };

    

    onError = (error) => globalErrorHandler(error);

    

    export : (folder:string) => Promise<void> = 
    ifElse(   
        isNil,
        () => new Promise( resolve => resolve() ), 
        (folder:string) => getDatabaseObjects(this.onError,1000000).then(
            ([calendars,projects,areas,todos]) => requestFromMain<any>(
                'saveDatabase',
                [ 
                    { database : { todos, projects, areas, calendars } }, 
                    path.resolve(folder, `${keyFromDate(new Date())}-${uniqid()}.json`)
                ],
                (event) => event
            )
        )
    );      
   


    backup : () => Promise<string> = 
    () => getDatabaseObjects(
        this.onError,
        1000000
    ).then(
        ([calendars,projects,areas,todos]) => requestFromMain<any>(
            'saveBackup',
            [ { database : { todos, projects, areas, calendars } } ],
            (event, to) => to
        ) 
    );  



    import : (pathToFile:string) => Promise<void> = 
    ifElse(
        isNil,

        () => new Promise( resolve => resolve() ),

        (pathToFile:string) => requestFromMain<any>(
            "readJsonFile",
            [pathToFile],
            (event,json) => json
        ).then(
            ifElse(
                correctFormat,

                (json) => this.updateState({importMessage:'Loading...'})
                                .then( () => this.backup() )
                                .then( (to:string) => this.replaceDatabaseObjects(json).then(() => to))
                                .then( (to:string) => this.updateState({importMessage:this.message(to)}) )
                                .then( () => this.props.dispatch({type:"selectedCategory",load:"inbox"}) ),

                () => this.updateState({importMessage:"Incorrect format."})
            )
        )  
    );
    
     

    onSelectExportFolder : () => Promise<void> =
    () => selectFolder().then(
        ifElse(
            isNil,
            () => new Promise( resolve => resolve() ), 
            (folder:string) => this.updateState({exportPath:folder})
                                   .then(() => this.export(folder))
                                   .then(
                                        () => this.updateState({
                                            exportMessage:`Data was successfully exported to ${folder}.`
                                        })
                                    )
        )
    );  



    onSelectImportFile : () => Promise<void> = 
    () => selectJsonDatabase().then(
        ifElse(
            isNil, 
            () => new Promise( resolve => resolve() ),
            (path:string) => this.updateState({importPath:path}).then(() => this.import(path))
        )
    );
    


    checkUpdates : () => Promise<void> =
    () => this.updateState({updateStatus:"Loading..."})
               .then(() => checkForUpdates())  
               .then(
                   (updateCheckResult:UpdateCheckResult) => requestFromMain<any>(
                        'getVersion', 
                        [], 
                        (event,version) => version
                    ) 
                    .then(
                        (version) => {
                            let {updateInfo} = updateCheckResult;
                            let currentAppVersion = version; 
                            let canUpdate = isNewVersion(currentAppVersion,updateInfo.version);
            
                            if(canUpdate){  
                                this.props.dispatch({
                                    type:"multiple",
                                    load:[
                                        {type:"openSettings", load:false},  
                                        {type:"showUpdatesNotification", load:true}
                                    ]
                                }); 
                            }  

                            return this.updateState({
                                updateStatus:`Latest version is ${canUpdate ? updateInfo.version : 'already installed'}.`
                            }); 
                        }
                    )     
               );  

        


    shouldSendStatistics : () => Promise<void> = 
    () => updateConfig({
        shouldSendStatistics:not(this.props.shouldSendStatistics)
    }).then(
        config => this.props.dispatch({type:"updateConfig",load:config}) 
    );
        


    shouldGroup : () => Promise<void> = 
    () => updateConfig({
        groupTodos:not(this.props.groupTodos)
    }).then(
        config => this.props.dispatch({type:"updateConfig",load:config}) 
    );



    moveCompletedTo : (event:any) => Promise<void> = 
    (event) => updateConfig({
        moveCompletedItemsToLogbook:event.target.value
    }).then(
        (config) => {
            let completedSet : (todo:Todo) => boolean = compose(isNotNil,prop('completedSet'));
            let load = map(
                when(
                    completedSet,
                    (todo:Todo) => ({
                        ...todo, 
                        completedWhen:getCompletedWhen(config.moveCompletedItemsToLogbook,todo.completedSet)
                    })
                ),  
                this.props.todos
            );

            this.props.dispatch({
                type:"multiple",
                load:[
                    {type:"updateConfig",load:config},
                    {type:"updateTodos",load}
                ]
            }); 
        }
    ); 
    
 

    disableReminder : (event:any) => Promise<void> =
    (event) => updateConfig({
        disableReminder:not(this.props.disableReminder)
    }).then(
        (config) => {
            this.props.dispatch({type:"updateConfig",load:config}); 

            return Promise.all([
                requestFromMain<any>( 
                    'autolaunch',
                    [
                        config.enableShortcutForQuickEntry || 
                        not(config.disableReminder)
                    ],
                    (event) => event
                ),
                requestFromMain<any>(
                    'updateNotificationConfig',
                    [config],
                    (event) => event 
                )
            ]);
        } 
    );
    


    render(){   
        let {importPath, exportPath, updateStatus, exportMessage, importMessage} = this.state;
        let {shouldSendStatistics,moveCompletedItemsToLogbook,groupTodos,disableReminder} = this.props;
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

            <div style={{display:"flex", alignItems:"center"}}>
                <Checkbox checked={not(disableReminder)} onClick={this.disableReminder}/>
                <div style={{paddingLeft:"10px"}}>Enable reminder</div>
            </div> 

            <div style={{display:"flex",alignItems:"center",width:"80%"}}>
                <Checkbox checked={groupTodos} onClick={this.shouldGroup}/>
                <div style={{paddingLeft:"10px"}}>Group tasks by project or area</div>
            </div> 

            <div style={{display:"flex", width:"100%"}}>
                <div style={{ 
                    display:"flex", alignItems:"flex-end",  
                    flexDirection:"column", justifyContent:"space-around", 
                    fontSize:"14px" 
                }}>      
                    <div>Move completed items to Logbook:</div>
                </div>  
                <div style={{display:"flex",alignItems:"flex-start",flexDirection:"column",justifyContent:"space-around"}}> 
                    <div style={{paddingLeft:"20px"}}>     
                        <select 
                            style={{backgroundColor:"white",outline:"none",borderRadius:"4px"}}  
                            name="text" 
                            value={moveCompletedItemsToLogbook}
                            onChange={this.moveCompletedTo}  
                        >  
                            <option value="immediately">Immediately</option> 
                            <option value="min">After 5 min</option> 
                            <option value="hour">After 1 hour</option> 
                            <option value="day">After 1 day</option> 
                        </select>   
                    </div>
                </div>
            </div>
            <div style={{height:"1px",width:"100%",borderBottom:"1px solid rgb(200,200,200)"}}></div>   
            <div style={{display:"flex",fontSize:"15px",alignItems:"center",fontWeight:500,color:"black",userSelect:"none"}}>       
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
                    <div onClick={this.onSelectImportFile} style={buttonStyle}>   
                        <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px"}}>  
                            Import
                        </div>   
                    </div> 
                    <div onClick={this.onSelectExportFolder} style={buttonStyle}>   
                        <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px"}}>  
                            Export 
                        </div>   
                    </div> 
                </div> 
                <div style={{height:"1px",width:"100%",borderBottom:"1px solid rgb(200,200,200)"}}></div>  
                <div style={{display:"flex",justifyContent:"space-between"}}>
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

                <div style={{cursor:"pointer", height:"30px"}}>
                    {   
                        <div     
                            onClick={(e) => {
                                this.props.dispatch({ 
                                    type:"multiple",
                                    load:[
                                       //{type:"openSettings",load:false},
                                        {type:"showLicense",load:true}
                                    ]
                                });  
                            }}
                            style={{
                                width:"100%",
                                height:"30px",
                                fontSize:"14px",
                                display:"flex",
                                alignItems:"center",
                                cursor:"pointer",  
                                color:"rgba(100, 100, 100, 0.6)"
                            }}
                        >     
                            Open Source libraries used at tasklist
                        </div>
                    }
                </div>
            </div>
        </div>    
    }   
};  