import { Store } from "./App";


 
export let applicationStateReducer = (state:Store, action:{ type:keyof Store, load:any}) => {
    
       let newState = undefined;
   
    
       switch(action.type){  
   
           case "openSearch": 
               newState = {
                   ...state, 
                   showProjectMenuPopover:false, 
                   showRightClickMenu:false,
                   openSearch:action.load 
               }; 
               break;
   
           case "showProjectMenuPopover":
               newState = {
                   ...state, 
                   showProjectMenuPopover:action.load
               }; 
               break;
   
           case "windowId":
               newState = {
                   ...state,
                   windowId:action.load
               }; 
               break;
   
           case "clone":
               newState = {
                   ...state, 
                   clone:action.load
               }; 
               break;    
    
           case "selectedCategory":
               newState = {
                   ...state,
                   selectedTag:"All", 
                   openSearch:false, 
                   selectedCategory:action.load,
                   openNewProjectAreaPopup:false 
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
   
   
           case "openRightClickMenu":
               newState = {
                   ...state,
                   showRightClickMenu : action.load.showRightClickMenu,
                   rightClickedTodoId : action.load.rightClickedTodoId,
                   rightClickMenuX : action.load.rightClickMenuX,
                   rightClickMenuY : action.load.rightClickMenuY
               };  
               break;
   
   
           case "showRightClickMenu": 
               newState = {
                   ...state,
                   showRightClickMenu : action.load
               };
               break;
   
   
           case "selectedTodoId":
               newState = {
                   ...state,
                   selectedTodoId : action.load,
                   //openSearch : false
               }; 
               break;
   
   
           case "closeAllItems":
               newState = {
                   ...state,
                   openNewProjectAreaPopup : false,
                   showRightClickMenu : false,
                   selectedTodoId : null
               };  
               break;
   
   
           case "rightClickedTodoId" :
               newState = {
                   ...state,
                   rightClickedTodoId : action.load
               }; 
               break;
   
   
           case "rightClickMenuX" :
               newState = {
                   ...state,
                   rightClickMenuX : action.load
               }; 
               break;
   
   
           case "rightClickMenuY" :
               newState = {
                   ...state,
                   rightClickMenuY : action.load
               }; 
               break;
   
   
           case "selectedProjectId":
               newState = {
                   ...state, 
                   selectedCategory:"project", 
                   selectedTag:"All",
                   openSearch:false,
                   selectedProjectId:action.load
               };    
               break;
           
   
           case "selectedAreaId": 
               newState = { 
                   ...state, 
                   selectedCategory:"area", 
                   selectedTag:"All",
                   openSearch:false,
                   selectedAreaId:action.load
               };    
               break;
   
   
       }
   
   
       return  newState;
    
   
   }