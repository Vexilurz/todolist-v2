
import '../../assets/styles.css';  
import '../../assets/calendarStyle.css';   
import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { Component } from "react"; 
import { 
    remove, isNil, not, isEmpty, compose, toPairs, map, findIndex, equals, ifElse, evolve,
    contains, last, cond, defaultTo, flatten, uniq, concat, all, identity, when, prop, applyTo 
} from 'ramda';
import { Checkbox } from '../TodoInput/Checkbox';
import { 
    checkForUpdates, getCompletedWhen, log,
    closeClonedWindows, correctFormat, selectFolder, selectJsonDatabase, sideEffect 
} from '../../utils/utils'; 
import { isNewVersion } from '../../utils/isNewVersion';
import { Area, Project, Todo, Calendar, Databases, actionSetDatabase, ImportAction, ImportActionLoad } from '../../types'; 
import { UpdateInfo, UpdateCheckResult } from 'electron-updater'; 
import { isArrayOfTodos, isNotNil } from '../../utils/isSomething';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { requestFromMain } from '../../utils/requestFromMain';
import { getData } from '../../utils/getData';
import { convertEventDate } from '../Calendar';
import { keyFromDate } from '../../utils/time';
import { ipcRenderer } from 'electron';  
import { pouchWorker } from '../../app';
import { fixIncomingData } from './../../utils/fixIncomingData';
import { workerSendAction } from '../../utils/workerSendAction';
import RefreshIndicator from 'material-ui/RefreshIndicator';
const Promise = require("bluebird");
const uniqid = require("uniqid");     
const path = require("path");

let completedSet : (todo:Todo) => boolean = compose(isNotNil,prop('completedSet')) as any;



interface AdvancedProps{
    limit:Date,
    lastImport:Date,
    secretKey:string,
    import:ImportActionLoad,
    enableShortcutForQuickEntry:boolean,
    shouldSendStatistics:boolean,
    moveCompletedItemsToLogbook:any,
    groupTodos:boolean,
    disableReminder:boolean,
    todos:Todo[],
    dispatch:Function
} 



interface AdvancedState{ 
    showPopup:boolean,
    message:string,
    progress:boolean,
    updateStatus:string 
}



export class AdvancedSettings extends Component<AdvancedProps,AdvancedState>{
    ref:HTMLElement;

    constructor(props){
        super(props);  
        this.state = {   
           showPopup:false,
           progress:false,
           message:'',
           updateStatus:``
        };       
    };
    
 

    updateState : (state:any) => Promise<void> = 
    (state) => new Promise(resolve => this.setState(state, () => resolve()));



    componentDidMount(){
        requestFromMain('getVersion',[],(event,version) => version)
        .then(
            (version) => this.updateState({updateStatus:`Current version is : ${version}.`}) 
        )
    }; 



    componentWillReceiveProps(nextProps){
        if(nextProps.lastImport!==this.props.lastImport){
           this.updateState({progress:false,message:`Data was successfully imported.`});
        }
    }



    onError = (error) => globalErrorHandler(error);

   

    export : (folder:string) => Promise<void> = (folder:string) => 
    this.updateState({progress:true})
    .then(() => getData(this.props.secretKey))
    .then(fixIncomingData)
    .then((database:Databases) => {
       let where = path.resolve(folder,`${keyFromDate(new Date())}-${uniqid()}.json`);
       return requestFromMain('saveDatabase',[{ database }, where], (event) => folder);
    }) 
    .then( 
        (folder:string) => this.updateState({
            progress:false,
            message:`Data was successfully exported to ${folder}.`
        }) 
    );        



    backup : () => Promise<string> = () => 
    getData(this.props.secretKey)
    .then( 
        (database:Databases) => requestFromMain('saveBackup', [ { database } ], (event, to) => to) 
    );  



    import : (pathToFile:string) => Promise<any> = (pathToFile:string) => 
    requestFromMain("readJsonFile", [pathToFile], (event,json) => json.database)
    .then(
        ifElse(
            correctFormat,
            database => this.updateState({progress:true,message:''}).then(() => database)
            .then(
                compose(
                    (database:Databases) => {
                        let action : ImportAction = {type:"import", load:{ database, pathToFile }};
                        this.props.dispatch(action);
                    },
                    fixIncomingData, 
                    sideEffect(closeClonedWindows)
                )
            ),
            () => this.updateState({message:"Incorrect format"})
        )
    );

     

    onSelectExportFolder : () => Promise<void> = () => 
    selectFolder()
    .then(
        ifElse( isNil, () => new Promise( resolve => resolve() ), d => this.export(d)  )
    );  



    onSelectImportFile : () => Promise<void> = () => 
    selectJsonDatabase()
    .then(
        ifElse( isNil, () => new Promise( resolve => resolve() ), d => this.import(d) )
    );

    
 
    checkUpdates : () => Promise<void> = () => 
    this.updateState({updateStatus:"Loading..."})
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



    shouldSendStatistics = () => this.props.dispatch({
        type:"shouldSendStatistics",
        load:!this.props.shouldSendStatistics
    }); 



    shouldGroup = () =>  this.props.dispatch({
        type:"groupTodos",
        load:!this.props.groupTodos
    }); 



    moveCompletedTo = (event) => this.props.dispatch({
        type:"multiple",
        load:[
            {type:"moveCompletedItemsToLogbook",load:event.target.value},
            {
                type:"updateTodos",
                load:map(
                    when(
                        completedSet,
                        (todo:Todo) => ({
                            ...todo, 
                            completedWhen:getCompletedWhen(event.target.value,todo.completedSet)
                        })
                    ),  
                    this.props.todos
                )
            }
        ]
    }); 

 

    disableReminder = (event) => {     
        let next = !this.props.disableReminder;
        let load = [{type:"disableReminder", load:next}]; 
        let enableReminder = !next;
        let shouldAutolaunch = this.props.enableShortcutForQuickEntry || enableReminder;  

        if(enableReminder){ load.push({type:"moveReminderFromPast", load:null}); }

        ipcRenderer.send('autolaunch', shouldAutolaunch);

        this.props.dispatch({type:"multiple", load});
    };

    

    render(){   
        let {updateStatus, message} = this.state;
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

        return <div ref={e => {this.ref=e;}} style={{paddingTop:"25px",width:"90%",paddingLeft:"25px"}}>
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
                isEmpty(message) ? null :
                <div style={{
                    display: "flex",
                    fontSize: "14px",
                    alignItems: "center",
                    fontWeight: 500,
                    color: message==="Incorrect format." ? "red" : "green",
                    userSelect: "none"
                }}>       
                    {message}  
                </div>  
            }  
                <div style={{display:"flex"}}>
                    {
                        this.state.progress ? 
                        <div
                            style={{
                                display: "flex",
                                marginRight: "5px", 
                                justifyContent: "center",
                                width: "40px",
                                height: "20px",
                                borderRadius: "5px",
                                padding: "5px 25px",
                                alignItems: "center",
                                backgroundColor: "rgba(200, 200, 200, 0.3)"
                            }}
                        >
                            <RefreshIndicator 
                                size={25}
                                left={0}
                                top={0}
                                status="loading"
                                style={{
                                    display:'inline-block', 
                                    position:'relative',
                                    boxShadow:'none',
                                    backgroundColor:'rgba(255,255,255,0)'
                                }}
                            />
                        </div>
                        :
                        <div onClick={this.onSelectImportFile} style={buttonStyle}>   
                            <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px"}}>  
                                Import
                            </div>   
                        </div> 
                    }
                    {
                        this.state.progress ? 
                        <div
                            style={{
                                display: "flex",
                                marginRight: "5px",
                                justifyContent: "center",
                                width: "40px",
                                height: "20px",
                                borderRadius: "5px",
                                padding: "5px 25px",
                                alignItems: "center",
                                backgroundColor: "rgba(200, 200, 200, 0.3)"
                            }}
                        >
                            <RefreshIndicator 
                                size={25}
                                left={0}
                                top={0}
                                status="loading"
                                style={{
                                    display:'inline-block', 
                                    position:'relative',
                                    boxShadow:'none',
                                    backgroundColor:'rgba(255,255,255,0)'
                                }}
                            />
                        </div>
                        :
                        <div onClick={this.onSelectExportFolder} style={buttonStyle}>   
                            <div style={{color:"white", whiteSpace:"nowrap", fontSize:"16px"}}>  
                                Export 
                            </div>   
                        </div> 
                    }
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