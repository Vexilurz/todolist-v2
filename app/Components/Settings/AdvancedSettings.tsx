
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
    checkForUpdates, getCompletedWhen, log, removeRev, 
    closeClonedWindows, correctFormat, selectFolder, selectJsonDatabase 
} from '../../utils/utils'; 
import { isNewVersion } from '../../utils/isNewVersion';
import { Area, Project, Todo, Calendar } from '../../types'; 
import { UpdateInfo, UpdateCheckResult } from 'electron-updater'; 
import { updateConfig } from '../../utils/config';
import { isArrayOfTodos, isNotNil } from '../../utils/isSomething';
import { assert } from '../../utils/assert';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { requestFromMain } from '../../utils/requestFromMain';
import { getData } from '../../utils/getData';
import { convertEventDate } from '../Calendar';
import { keyFromDate } from '../../utils/time';
import { ipcRenderer } from 'electron'; 
import { pouchWorker } from '../../app';
const Promise = require("bluebird");
const uniqid = require("uniqid");     
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
    (state) => new Promise(resolve => this.setState(state, () => resolve()));



    componentDidMount(){
        requestFromMain('getVersion',[],(event,version) => version)
        .then(
            (version) => this.updateState({updateStatus:`Current version is : ${version}.`}) 
        )
    }; 



    setData = ({projects, areas, todos, calendars}) : void => {
        let {dispatch} = this.props;
        dispatch({
            type:"multiple",
            load:[
                {type:"setProjects", load:projects},
                {type:"setAreas", load:areas},
                {type:"setTodos", load:todos},
                {type:"setCalendars", load:calendars},
                {type:"selectedCategory",load:"inbox"}
            ]
        }); 
    };

    

    onError = (error) => globalErrorHandler(error);

   

    export : (folder:string) => void = 
    ifElse(   
        isNil,
        identity, 
        (folder:string) => pouchWorker.postMessage({
            type:"dump",
            load:path.resolve(folder, `${keyFromDate(new Date())}-${uniqid()}.json`)
        }) 
    );      
   


    backup = () => pouchWorker.postMessage({type:"backup", load:null}); 



    import : (pathToFile:string) => Promise<any> = 
    ifElse(
        isNil,
        () => new Promise(resolve => resolve()),
        (pathToFile:string) => requestFromMain("readJsonFile",[pathToFile],(event,json) => json).then(
            ifElse(
                correctFormat,
                (json) => {
                    let remRev = compose(map(removeRev), defaultTo([])); 
                    let database = compose(
                        evolve({todos:remRev,projects:remRev,areas:remRev,calendars:remRev}),
                        data => ({
                            projects:defaultTo([], data.projects), 
                            areas:defaultTo([], data.areas), 
                            todos:defaultTo([], data.todos), 
                            calendars:map( evolve({ events:map(convertEventDate) }), defaultTo([], data.calendars) )
                        })
                    )(json.database);
                   
                    closeClonedWindows();

                    pouchWorker.postMessage({type:"set", load:database});

                    this.setData(database); 
                },
                () => this.updateState({importMessage:"Incorrect format."})
            )
        )  
    );
    
     

    onSelectExportFolder : () => Promise<void> = () => 
    selectFolder()
    .then(
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



    onSelectImportFile : () => Promise<void> = () => 
    selectJsonDatabase()
    .then(
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
                   (updateCheckResult:UpdateCheckResult) => requestFromMain(
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



    shouldSendStatistics : () => Promise<void> = () => 
    updateConfig({
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
    
 

    disableReminder : (event:any) => void = (event) => 
    updateConfig({disableReminder:not(this.props.disableReminder)})
    .then(
        (config) => {
            let enableReminder = !config.disableReminder;
            let load = [{type:"updateConfig",load:config}];

            if(enableReminder){
               load.push({type:"moveReminderFromPast", load:null});
            }

            this.props.dispatch({type:"multiple",load}); 

            ipcRenderer.send('autolaunch', config.enableShortcutForQuickEntry || not(config.disableReminder));
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