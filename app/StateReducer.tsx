import { Store } from "./app";
import { Category } from "./Components/MainContainer";
import { adjust, cond, all, equals, isEmpty, contains, not, remove, uniq, isNil } from 'ramda';
import { isTodo, isBoolean, isDate, isString, isNumber, isCategory, isProject, isArea } from "./utils/isSomething";
import { assert } from "./utils/assert";
import { typeEquals } from "./utils/utils";
import { Todo } from "./database";
import { section } from "./Components/Settings/settings";

 
export let applicationStateReducer = (state:Store, action:{ type:keyof Store, load:any}) : Store => 
        cond([
            [
              typeEquals("selectedTodo"),
              (action:{type:string,load:Todo}) : Store => {
                assert(isTodo(action.load), `Error: selectedTodo. applicationStateReducer. ${action.load}`); 
                return ({...state,selectedTodo:action.load}); 
              }
            ],

            [ 
              typeEquals("showLicense"),
              (action:{type:string,load:boolean}) : Store => {
                assert(isBoolean(action.load), `Error: showLicense. applicationStateReducer. ${action.load}`); 
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
                assert(isBoolean(action.load), `Error: showUpdatesNotification. applicationStateReducer. ${action.load}`); 
                return ({...state,showUpdatesNotification:action.load});
              }
            ],

            [
              typeEquals("limit"),
              (action:{type:string,load:Date}) : Store => {
                assert(isDate(action.load), `Error: limit. applicationStateReducer. ${action.load}`); 
                return ({...state,limit:action.load}); 
              }
            ],

            [
              typeEquals("searchQuery"),
              (action:{type:string,load:string}) : Store => {
                assert(isString(action.load), `Error: searchQuery. applicationStateReducer. ${action.load}`); 
                return ({...state,searchQuery:action.load}); 
              }
            ],

            [
              typeEquals("openChangeGroupPopup"),
              (action:{type:string,load:boolean}) : Store => {
                assert(isBoolean(action.load), `Error: openChangeGroupPopup. applicationStateReducer. ${action.load}`); 
                return ({...state,openChangeGroupPopup:action.load}); 
              }
            ],

            [
              typeEquals("selectedSettingsSection"),
              (action:{type:string,load:section}) : Store => {
                assert(isString(action.load), `Error: selectedSettingsSection. applicationStateReducer. ${action.load}`);
                return ({...state,selectedSettingsSection:action.load}); 
              }
            ],

            [
              typeEquals("openSettings"),
              (action:{type:string,load:boolean}) : Store => {
                assert(isBoolean(action.load), `Error: openSettings. applicationStateReducer. ${action.load}`);
                return ({...state,openSettings:action.load}); 
              }
            ],

            [
              typeEquals("showRepeatPopup"),
              (action:{type:string,load:boolean}) : Store => {
                assert(isBoolean(action.load), `Error: showRepeatPopup. applicationStateReducer. ${action.load}`);
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
                
                assert(isBoolean(action.load.showRepeatPopup), `Error: showRepeatPopup. applicationStateReducer. ${action.load}`);
                assert(isNumber(action.load.repeatPopupX), `Error: repeatPopupX. applicationStateReducer. ${action.load}`);
                assert(isNumber(action.load.repeatPopupY), `Error: repeatPopupY. applicationStateReducer. ${action.load}`);            
                
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
                assert(isBoolean(action.load), `Error: openTodoInputPopup. applicationStateReducer. ${action.load}`);
                return ({...state,openTodoInputPopup:action.load}); 
              }
            ],

            [
              typeEquals("showCompleted"),
              (action:{type:string,load:boolean}) : Store => {
                assert(isBoolean(action.load), `Error: showCompleted. applicationStateReducer. ${action.load}`);
                return ({...state,showCompleted:action.load}); 
              }
            ],

            [
              typeEquals("showTrashPopup"),
              (action:{type:string,load:boolean}) : Store => {
                assert(isBoolean(action.load), `Error: showTrashPopup. applicationStateReducer. ${action.load}`);
                return ({...state,showTrashPopup:action.load}); 
              }
            ],
            [
              typeEquals("showScheduled"),
              (action:{type:string,load:boolean}) : Store => {
                return ({...state,showScheduled:action.load}); 
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
                  assert(isCategory(action.load), `Error: selectedCategory. applicationStateReducer. ${action.load}`);
                  return ({...state,selectedCategory:action.load});  
              }
            ],

            [
              typeEquals("leftPanelWidth"),
              (action:{type:string,load:number}) : Store => {
                  assert(isNumber(action.load), `Error: leftPanelWidth. applicationStateReducer. ${action.load}`); 
                  return ({...state,leftPanelWidth:action.load}); 
              }
            ],

            [
              typeEquals("selectedTag"),
              (action:{type:string,load:string}) : Store => {
                  assert(isString(action.load), `Error: selectedTag. applicationStateReducer. ${action.load}`); 
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
                  
                  assert(isBoolean(action.load.showRightClickMenu), `Error: showRightClickMenu. applicationStateReducer. ${action.load}`);
                  assert(isString(action.load.rightClickedTodoId), `Error: rightClickedTodoId. applicationStateReducer. ${action.load}`);
                  assert(isNumber(action.load.rightClickMenuX), `Error: rightClickMenuX. applicationStateReducer. ${action.load}`);
                  assert(isNumber(action.load.rightClickMenuY), `Error: rightClickMenuY. applicationStateReducer. ${action.load}`);            
          
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
                  assert(isProject(project), `Error: selectedProjectId. applicationStateReducer. ${action.load}`);
                  return ({...state,selectedCategory:"project",selectedProjectId:action.load});
              }   
            ],

            [
              typeEquals("selectedAreaId"),
              (action:{type:string,load:string}) : Store => {
                  let area = state.areas.find((a) => a._id===action.load);
                  assert(isArea(area), `Error: selectedAreaId. applicationStateReducer. ${action.load}`);
                  return ({...state, selectedCategory:"area", selectedAreaId:action.load}); 
              }
            ], 

            [ () => true, () : Store => undefined ]

        ])(action);


