import { adjust, cond, all, equals, isEmpty, contains, not, remove, uniq, isNil, defaultTo } from 'ramda';
import { isTodo, isBoolean, isDate, isString, isNumber, isCategory, isProject, isArea } from "./utils/isSomething";
import { typeEquals } from "./utils/utils";
import { Store, Category, Todo, section, Calendar, Area, Project } from "./types";


export let stateReducer = (state:Store, action:{ type:keyof Store, load:any}) : Store => {
    return cond([
            [ 
                typeEquals("key"),
                (action:{type:string, load:string}) : Store => {
                    return ({...state, key:action.load}); 
                }   
            ],   
            [ 
                typeEquals("salt"),
                (action:{type:string, load:string}) : Store => {
                    return ({...state, salt:action.load}); 
                }   
            ],   
            [ 
                typeEquals("defaultTags"),
                (action:{type:string,load:string[]}) : Store => {
                    return ({...state, defaultTags:action.load}); 
                }   
            ],   
            [ 
                typeEquals("quickEntrySavesTo"),
                (action:{type:string,load:string}) : Store => {
                    return ({...state, quickEntrySavesTo:action.load}); 
                }   
            ],  
            [ 
                typeEquals("enableShortcutForQuickEntry"),
                (action:{type:string,load:boolean}) : Store => {
                    return ({...state, enableShortcutForQuickEntry:action.load}); 
                }   
            ],  
            [ 
                typeEquals("disableReminder"),
                (action:{type:string,load:boolean}) : Store => {
                    return ({...state, disableReminder:action.load}); 
                }   
            ],  
            [ 
                typeEquals("moveCompletedItemsToLogbook"),
                (action:{type:string,load:string}) : Store => {
                    return ({...state, moveCompletedItemsToLogbook:action.load}); 
                }   
            ], 
            [ 
                typeEquals("groupTodos"),
                (action:{type:string,load:boolean}) : Store => {
                    return ({...state, groupTodos:action.load}); 
                }   
            ],  
            [ 
                typeEquals("nextBackupCleanup"),
                (action:{type:string,load:Date}) : Store => {
                    return ({...state, nextBackupCleanup:action.load}); 
                }   
            ],    
            [ 
                typeEquals("nextUpdateCheck"),
                (action:{type:string,load:Date}) : Store => {
                    return ({...state, nextUpdateCheck:action.load}); 
                }   
            ],  
            [ 
                typeEquals("hideHint"),
                (action:{type:string,load:boolean}) : Store => {
                    return ({...state, hideHint:action.load}); 
                }   
            ],  
            [ 
                typeEquals("lastSync"),
                (action:{type:string,load:Date}) : Store => {
                    return ({...state, lastSync:action.load}); 
                }   
            ], 
            [ 
                typeEquals("sync"),
                (action:{type:string,load:boolean}) : Store => {
                    return ({...state, sync:action.load}); 
                }  
            ], 
            [ 
                typeEquals("email"),
                (action:{type:string,load:string}) : Store => {
                    return ({...state, email:action.load}); 
                } 
            ],  
            [ 
                typeEquals('setCalendars'),  
                (action:{type:string,load:Calendar[]}):Store => {
                    return {
                        ...state, 
                        calendars:action.load
                    }
                }
            ],  
            [ 
                typeEquals("setTodos"),  
                (action:{type:string,load:Todo[]}) : Store => {

                    return {...state,todos:[...action.load] };
                }
            ], 
            [ 
                typeEquals("setProjects"),  

                (action:{type:string, load:Project[]}) : Store => {

                    return { ...state, projects:[...action.load] };
                }
            ], 
            [ 
                typeEquals("setAreas"),  

                (action:{type:string,load:Area[]}) : Store => { 

                    return { ...state, areas:[...action.load]  };
                }
            ], 
            [
                typeEquals('showCalendarEvents'),  
                (action:{type:string,load:boolean}) : Store => ({...state, showCalendarEvents:action.load}) 
            ], 
            [
                typeEquals("openWhenCalendar"),
                (
                    action:{
                        type:string, 
                        load:{
                            showWhenCalendar : boolean, 
                            whenTodo : Todo,
                            whenCalendarPopupX : number, 
                            whenCalendarPopupY : number,
                            showRightClickMenu : boolean
                        } 
                    }
                ) : Store => ({
                    ...state,
                    showWhenCalendar : action.load.showWhenCalendar, 
                    whenTodo : action.load.whenTodo,
                    whenCalendarPopupX : action.load.whenCalendarPopupX, 
                    whenCalendarPopupY : action.load.whenCalendarPopupY,
                    showRightClickMenu : action.load.showRightClickMenu
                })
            ],  
            [ 
                typeEquals("selectedTodo"),
                (action:{type:string,load:Todo}) : Store => {
                  return ({...state, selectedTodo:action.load}); 
                } 
            ],
            [
                typeEquals("scrolledTodo"),
                (action:{type:string,load:Todo}) : Store => {
                  return ({...state, scrolledTodo:action.load}); 
                } 
            ], 
            [ 
                typeEquals("showLicense"),
                (action:{type:string,load:boolean}) : Store => {
                  return ({...state,showLicense:action.load}); 
                }
            ],
            [
                typeEquals("progress"),
                (action:{type:string,load:any}) : Store => ({...state,progress:action.load}) 
            ],
            [
                typeEquals("showUpdatesNotification"),
                (action:{type:string,load:boolean}) : Store => { 
                  return ({...state,showUpdatesNotification:action.load});
                }
            ],
            [
                typeEquals("limit"),
                (action:{type:string,load:Date}) : Store => { 
                  return ({...state,limit:action.load}); 
                }
            ],
            [
                typeEquals("searchQuery"),
                (action:{type:string,load:string}) : Store => {
                  return ({...state,searchQuery:action.load}); 
                }
            ],
            [
                typeEquals("openChangeGroupPopup"),
                (action:{type:string,load:boolean}) : Store => {
                  return ({...state,openChangeGroupPopup:action.load}); 
                }
            ],
            [
                typeEquals("selectedSettingsSection"),
                (action:{type:string,load:section}) : Store => {
                  return ({...state,selectedSettingsSection:action.load}); 
                }
            ],
            [
                typeEquals("openSettings"),
                (action:{type:string,load:boolean}) : Store => {
                  return ({...state,openSettings:action.load}); 
                }
            ],
            [
                typeEquals("showRepeatPopup"),
                (action:{type:string,load:boolean}) : Store => {
                  return ({...state,showRepeatPopup:action.load}); 
                }
            ],
            [
                typeEquals("openRepeatPopup"),
                (action:{ 
                  type:string, 
                  load:{
                    showRepeatPopup:boolean,
                    repeatTodo:Todo,
                    repeatPopupX:number,
                    repeatPopupY:number} 
                }) : Store => {
                  
                  return ({ 
                      ...state,
                      showRepeatPopup:action.load.showRepeatPopup,
                      repeatTodo:action.load.repeatTodo,
                      repeatPopupX:action.load.repeatPopupX, 
                      repeatPopupY:action.load.repeatPopupY
                  }); 
                }
            ],
            [
                typeEquals("openTodoInputPopup"),
                (action:{type:string,load:boolean}) : Store => {
                  return ({...state,openTodoInputPopup:action.load}); 
                }
            ],
            [
                typeEquals("showTrashPopup"),
                (action:{type:string,load:boolean}) : Store => {
                  return ({...state,showTrashPopup:action.load}); 
                }
            ],
            [
                typeEquals("dragged"),
                (action:{type:string,load:string}) : Store => {
                  return ({...state,dragged:action.load}); 
                }
            ],
            [
                typeEquals("openSearch"),
                (action:{type:string,load:boolean}) : Store => {
                  return ({...state,openSearch:action.load}); 
                }
            ],
            [
                typeEquals("showProjectMenuPopover"),
                (action:{type:string,load:boolean}) : Store => ({...state,showProjectMenuPopover:action.load}) 
            ],
            [
                typeEquals("selectedCategory"),
                (action:{type:string,load:Category}) : Store => {
                    return ({...state,selectedCategory:action.load});  
                }
            ],
            [
                typeEquals("leftPanelWidth"),
                (action:{type:string,load:number}) : Store => {
                    return ({...state,leftPanelWidth:action.load}); 
                }
            ],
            [
                typeEquals("selectedTag"),
                (action:{type:string,load:string}) : Store => {
                    return ({...state,selectedTag:action.load}); 
                }
            ],
            [
                typeEquals("openNewProjectAreaPopup"),
                (action:{type:string,load:boolean}) : Store => ({...state,openNewProjectAreaPopup:action.load}) 
            ],
            [
                typeEquals("showRightClickMenu"),
                (action:{type:string,load:boolean}) : Store => ({...state,showRightClickMenu:action.load}) 
            ],
            [
                typeEquals("openRightClickMenu"),
                (action:{
                  type:string,
                  load:{
                    showRightClickMenu:boolean,
                    rightClickedTodoId:string,
                    rightClickMenuX:number,
                    rightClickMenuY:number
                  }
                }) : Store => {
                    
                    return ({
                      ...state,
                      showRightClickMenu:action.load.showRightClickMenu,
                      rightClickedTodoId:action.load.rightClickedTodoId,
                      rightClickMenuX:action.load.rightClickMenuX,
                      rightClickMenuY:action.load.rightClickMenuY
                    }); 
                }
            ],
            [
                typeEquals("closeAllItems"),
                (action:{type:string}) : Store => ({
                    ...state,
                    openSearch:false,
                    openRightClickMenu:false,
                    showProjectMenuPopover:false, 
                    openNewProjectAreaPopup:false,
                    showRightClickMenu:false, 
                }) 
            ], 
            [
                typeEquals("selectedProjectId"),
                (action:{type:string,load:string}) : Store => {
                    let project = state.projects.find((p) => p._id===action.load);
                    return ({...state,selectedCategory:"project",selectedProjectId:action.load});
                }   
            ],
            [
                typeEquals("selectedAreaId"),
                (action:{type:string,load:string}) : Store => {
                    let area = state.areas.find((a) => a._id===action.load);
                    return ({...state, selectedCategory:"area", selectedAreaId:action.load}); 
                }
            ], 
            [   
                () => true, 
                () : Store => undefined   
            ]
        ])(action);
};
