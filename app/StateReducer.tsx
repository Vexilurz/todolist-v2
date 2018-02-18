import { Store } from "./app";
import { activateReminders } from "./Components/MainContainer";


 
export let applicationStateReducer = (state:Store, action:{ type:keyof Store, load:any}) => {
    
       let newState = undefined;
       
       switch(action.type){ 
            case "selectedTodo":
                newState = {  
                    ...state,
                    selectedTodo : action.load,
                };  
                break; 

            case "progress":
                newState = {  
                    ...state,
                    progress : action.load,
                };  
                break; 


            case "resetReminders":
                let scheduledReminders = activateReminders(state.scheduledReminders,state.todos);
                console.log(`scheduledReminders ${scheduledReminders}`); 
                newState = {  
                    ...state,
                    scheduledReminders,
                };  
                break;


            case "showUpdatesNotification":
                newState = {  
                    ...state,
                    showUpdatesNotification : action.load,
                };  
                break; 


            case "limit":
                newState = {  
                    ...state,
                    limit : action.load,
                };  
                break; 


            case "searchQuery":
                newState = {  
                    ...state,
                    searchQuery : action.load,
                };  
                break; 
                

            case "openChangeGroupPopup":
                newState = { 
                    ...state,
                    openChangeGroupPopup : action.load,
                };  
                break; 

 
            case "selectedSettingsSection":
                newState = { 
                    ...state,
                    selectedSettingsSection : action.load,
                };  
                break; 
 

            case "openSettings":
                newState = { 
                    ...state,
                    openSettings : action.load,
                };  
                break;

                
            case "showRepeatPopup":
                newState = {
                    ...state,
                    showRepeatPopup : action.load,
                }
                break; 


            case "openRepeatPopup":
                newState = { 
                    ...state,
                    showRepeatPopup : action.load.showRepeatPopup,
                    repeatTodo : action.load.repeatTodo,
                    repeatPopupX : action.load.repeatPopupX, 
                    repeatPopupY : action.load.repeatPopupY
                };  
                break; 


            case "openTodoInputPopup": 
                newState = { 
                    ...state, 
                    openTodoInputPopup:action.load 
                }; 
                break; 


            case "showCompleted": 
                newState = { 
                    ...state, 
                    showCompleted:action.load 
                }; 
                break;  

                  
            case "showTrashPopup":
                newState = { 
                    ...state,  
                    showTrashPopup:action.load 
                }; 
                break;     
                
            
            case "showScheduled": 
                newState = { 
                    ...state, 
                    showScheduled:action.load 
                }; 
                break; 
             
                
            case "dragged": 
                newState = {  
                    ...state,
                    dragged:action.load
                }
                break;   

             
           case "openSearch": 
               newState = {
                   ...state, 
                   openSearch:action.load 
               }; 
               break;

   
           case "showProjectMenuPopover":
               newState = {
                   ...state, 
                   showProjectMenuPopover:action.load
               }; 
               break;
               
    
           case "selectedCategory":
               newState = {
                   ...state,
                   selectedCategory:action.load
               }; 
               break;
   
   
           case "leftPanelWidth":
               newState = {
                   ...state,
                   leftPanelWidth:action.load
               };
               break;


           case "selectedTag":  
               newState = {
                   ...state,
                   selectedTag:action.load
               };
               break;
   
   
           case "openNewProjectAreaPopup":
               newState = {
                   ...state,
                   openNewProjectAreaPopup:action.load
               }; 
               break;

 
           case "showRightClickMenu":
               newState = {
                   ...state,
                   showRightClickMenu : action.load,
               };  
               break;     
               
   
           case "openRightClickMenu":
               newState = {
                   ...state,
                   showRightClickMenu : action.load.showRightClickMenu,
                   rightClickedTodoId : action.load.rightClickedTodoId,
                   rightClickMenuX : action.load.rightClickMenuX,
                   rightClickMenuY : action.load.rightClickMenuY
               };  
               break;

   
           case "closeAllItems":
               newState = {
                   ...state,
                   openSearch:false,
                   openRightClickMenu:false,
                   showProjectMenuPopover:false, 
                   openNewProjectAreaPopup:false,
                   showRightClickMenu:false, 
               };  
               break;
   
   
           case "selectedProjectId":
               newState = {
                   ...state, 
                   selectedCategory:"project", 
                   selectedProjectId:action.load
               };    
               break;
               

           case "selectedAreaId": 
               newState = { 
                   ...state, 
                   selectedCategory:"area", 
                   selectedAreaId:action.load
               };    
               break;
   
       } 
   
       return  newState;
}



/*
Uncaught TypeError: Cannot read property 'getTime' of null
    at c.events.map (file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js:162076:100)
    at Array.map (native)
    at ramda_1.flatten.calendars.filter.map (file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js:162076:34)
    at Array.map (native)
    at objectsToHashTableByDate (file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js:162076:14)
    at Waypoint.Upcoming.onEnter (file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js:162115:33)
    at Waypoint._handleScroll (file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js:158743:30)
    at file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js:158593:18
    at file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js:158464:9
2app.js:12246 Error report submitted
app.js:163983 Backup saved to C:\Users\Lutz\19154e4c7df93a63a5ca46609b083b98d3c663df8dbfda09f47f22ab616e3775.json.
25app.js:163983 Backup saved to C:\Users\Lutz\19154e4c7df93a63a5ca46609b083b98d3c663df8dbfda09f47f22ab616e3775.json.
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at Array.exports.applicationStateReducer (app.js:160915)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteSingleItem (app.js:160354)
    at Object.invokeGuardedCallback (app.js:23502)
    at executeDispatch (app.js:17358)
    at Object.executeDispatchesInOrder (app.js:17378)
    at executeDispatchesAndRelease (app.js:12803)
app.js:12246 Error report submitted
app.js:12241  not_found missing 
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:12246 Error report submitted
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:163983 Backup saved to C:\Users\Lutz\19154e4c7df93a63a5ca46609b083b98d3c663df8dbfda09f47f22ab616e3775.json.
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:163983 Backup saved to C:\Users\Lutz\19154e4c7df93a63a5ca46609b083b98d3c663df8dbfda09f47f22ab616e3775.json.
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at ramda_1.cond (app.js:160682)
    at app.js:93950
    at app.js:8221
    at Array.exports.applicationObjectsReducer (app.js:160887)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteGroup (app.js:160360)
    at Object.invokeGuardedCallback (app.js:23502)
app.js:77252 Uncaught (in promise) TypeError: Cannot read property '_id' of null
    at db.allDocs.then.then (app.js:77252)
    at <anonymous>
app.js:12246 Error report submitted
app.js:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:7677)
    at exports.filter.ramda_1.allPass (app.js:14509)
    at app.js:93300
    at f1 (app.js:5189)
    at arrayFilter (app.js:57674)
    at Function.filter (app.js:66261)
    at Object.exports.filter (app.js:14428)
    at Object.exports.activateReminders (app.js:14508)
    at Array.exports.applicationStateReducer (app.js:160915)
    at app.js:164072
    at dispatch (app.js:159123)
    at ChangeGroupPopup.onDeleteSingleItem (app.js:160354)
    at Object.invokeGuardedCallback (app.js:23502)
    at executeDispatch (app.js:17358)
    at Object.executeDispatchesInOrder (app.js:17378)
    at executeDispatchesAndRelease (app.js:12803)
app.js:12246 Error report submitted
app.js:12241  not_found missing 
app.js:12246 Error report submitted
app.js:sourcemap:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:sourcemap:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:sourcemap:7677)
    at exports.filter.ramda_1.allPass (app.js:sourcemap:14509)
    at app.js:sourcemap:93300
    at f1 (app.js:sourcemap:5189)
    at arrayFilter (app.js:sourcemap:57674)
    at Function.filter (app.js:sourcemap:66261)
    at Object.exports.filter (app.js:sourcemap:14428)
    at Object.exports.activateReminders (app.js:sourcemap:14508)
    at Array.exports.applicationStateReducer (app.js:sourcemap:160915)
    at app.js:sourcemap:164072
    at dispatch (app.js:sourcemap:159123)
    at ChangeGroupPopup.onDeleteSingleItem (app.js:sourcemap:160354)
    at Object.invokeGuardedCallback (app.js:sourcemap:23502)
    at executeDispatch (app.js:sourcemap:17358)
    at Object.executeDispatchesInOrder (app.js:sourcemap:17378)
    at executeDispatchesAndRelease (app.js:sourcemap:12803)
app.js:sourcemap:12246 Error report submitted
app.js:sourcemap:12241  not_found missing 
app.js:sourcemap:12246 Error report submitted
app.js:sourcemap:163983 Backup saved to C:\Users\Lutz\19154e4c7df93a63a5ca46609b083b98d3c663df8dbfda09f47f22ab616e3775.json.
app.js:sourcemap:78540 Todo created
app.js:sourcemap:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:sourcemap:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:sourcemap:7677)
    at exports.filter.ramda_1.allPass (app.js:sourcemap:14509)
    at app.js:sourcemap:93300
    at f1 (app.js:sourcemap:5189)
    at arrayFilter (app.js:sourcemap:57674)
    at Function.filter (app.js:sourcemap:66261)
    at Object.exports.filter (app.js:sourcemap:14428)
    at Object.exports.activateReminders (app.js:sourcemap:14508)
    at Array.exports.applicationStateReducer (app.js:sourcemap:160915)
    at app.js:sourcemap:164072
    at dispatch (app.js:sourcemap:159123)
    at Object.RightClickMenu.onDeleteToDo [as onClick] (app.js:sourcemap:163553)
    at onClick (app.js:sourcemap:163760)
    at Object.invokeGuardedCallback (app.js:sourcemap:23502)
    at executeDispatch (app.js:sourcemap:17358)
    at Object.executeDispatchesInOrder (app.js:sourcemap:17378)
app.js:sourcemap:12246 Error report submitted
app.js:sourcemap:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:sourcemap:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:sourcemap:7677)
    at exports.filter.ramda_1.allPass (app.js:sourcemap:14509)
    at app.js:sourcemap:93300
    at f1 (app.js:sourcemap:5189)
    at arrayFilter (app.js:sourcemap:57674)
    at Function.filter (app.js:sourcemap:66261)
    at Object.exports.filter (app.js:sourcemap:14428)
    at Object.exports.activateReminders (app.js:sourcemap:14508)
    at Array.exports.applicationStateReducer (app.js:sourcemap:160915)
    at app.js:sourcemap:164072
    at dispatch (app.js:sourcemap:159123)
    at Object.TodoInput.onCalendarAddReminderClick [as onAddReminder] (app.js:sourcemap:26629)
    at Object.onClick (app.js:sourcemap:123513)
    at EnhancedButton._this.handleTouchTap (app.js:sourcemap:11504)
    at Object.invokeGuardedCallback (app.js:sourcemap:23502)
    at executeDispatch (app.js:sourcemap:17358)
app.js:sourcemap:12246 Error report submitted
5app.js:sourcemap:163983 Backup saved to C:\Users\Lutz\19154e4c7df93a63a5ca46609b083b98d3c663df8dbfda09f47f22ab616e3775.json.
app.js:sourcemap:78540 Todo created
app.js:sourcemap:163983 Backup saved to C:\Users\Lutz\19154e4c7df93a63a5ca46609b083b98d3c663df8dbfda09f47f22ab616e3775.json.
app.js:sourcemap:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:sourcemap:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:sourcemap:7677)
    at exports.filter.ramda_1.allPass (app.js:sourcemap:14509)
    at app.js:sourcemap:93300
    at f1 (app.js:sourcemap:5189)
    at arrayFilter (app.js:sourcemap:57674)
    at Function.filter (app.js:sourcemap:66261)
    at Object.exports.filter (app.js:sourcemap:14428)
    at Object.exports.activateReminders (app.js:sourcemap:14508)
    at Array.exports.applicationStateReducer (app.js:sourcemap:160915)
    at app.js:sourcemap:164072
    at dispatch (app.js:sourcemap:159123)
    at Object.TodoInput.onCalendarAddReminderClick [as onAddReminder] (app.js:sourcemap:26629)
    at Object.onClick (app.js:sourcemap:123513)
    at EnhancedButton._this.handleTouchTap (app.js:sourcemap:11504)
    at Object.invokeGuardedCallback (app.js:sourcemap:23502)
    at executeDispatch (app.js:sourcemap:17358)
app.js:sourcemap:12246 Error report submitted
app.js:sourcemap:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:sourcemap:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:sourcemap:7677)
    at exports.filter.ramda_1.allPass (app.js:sourcemap:14509)
    at app.js:sourcemap:93300
    at f1 (app.js:sourcemap:5189)
    at arrayFilter (app.js:sourcemap:57674)
    at Function.filter (app.js:sourcemap:66261)
    at Object.exports.filter (app.js:sourcemap:14428)
    at Object.exports.activateReminders (app.js:sourcemap:14508)
    at Array.exports.applicationStateReducer (app.js:sourcemap:160915)
    at app.js:sourcemap:164072
    at dispatch (app.js:sourcemap:159123)
    at Object.TodoInput.onCalendarAddReminderClick [as onAddReminder] (app.js:sourcemap:26629)
    at Object.onClick (app.js:sourcemap:123513)
    at EnhancedButton._this.handleTouchTap (app.js:sourcemap:11504)
    at Object.invokeGuardedCallback (app.js:sourcemap:23502)
    at executeDispatch (app.js:sourcemap:17358)
app.js:sourcemap:12246 Error report submitted
app.js:sourcemap:12241 Message: Uncaught TypeError: date.getTime is not a function - URL: file:///C:/Program%20Files/Anatoly%20Strashkevich/tasklist/resources/app.asar/production/app.js - Line: 23527 - Column: 7 - Error object: {}
app.js:sourcemap:23527 Uncaught TypeError: date.getTime is not a function
    at Object.exports.isDate (app.js:sourcemap:7677)
    at exports.filter.ramda_1.allPass (app.js:sourcemap:1450 9) 
    at app.js:sourcemap:93300
    at f1 (app.js:sourcemap:5189)
    at arrayFilter (app.js:sourcemap:57674)
    at Function.filter (app.js:sourcemap:66261)
    at Object.exports.filter (app.js:sourcemap:14428)
    at Object.exports.activateReminders (app.js:sourcemap:14508)
    at Array.exports.applicationStateReducer (app.js:sourcemap:160915)
    at app.js:sourcemap:164072
    at dispatch (app.js:sourcemap:159123)
    at Object.TodoInput.onCalendarAddReminderClick [as onAddReminder] (app.js:sourcemap:26629)
    at Object.onClick (app.js:sourcemap:123513)
    at EnhancedButton._this.handleTouchTap (app.js:sourcemap:11504)
    at Object.invokeGuardedCallback (app.js:sourcemap:23502)
    at executeDispatch (app.js:sourcemap:17358)
app.js:sourcemap:12246 Error report submitted
2app.js:163983 Backup saved to C:\Users\Lutz\19154e4c7df93a63a5ca46609b083b98d3c663df8dbfda09f47f22ab616e3775.json.

*/