import { Store } from "./app";


 
export let applicationStateReducer = (state:Store, action:{ type:keyof Store, load:any}) => {
    
       let newState = undefined;
   
       switch(action.type){ 
            
            case "openTodoInputPopup": 
                newState = { 
                    ...state, 
                    openTodoInputPopup:action.load 
                }; 
                break; 

           case "searched": 
                newState = {
                    ...state, 
                    searched:action.load 
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
                   selectedCategory:action.load
               }; 
               break;
   
   
           case "leftPanelWidth":
               newState = {
                   ...state,
                   leftPanelWidth:action.load
               };
               break;
   
   
           case "currentleftPanelWidth":
                newState = {
                    ...state, 
                    currentleftPanelWidth:action.load
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
   
   
           case "selectedTodoId":
               newState = {
                   ...state,
                   selectedTodoId : action.load,
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