import { Store } from "./types";
import { defaultConfig } from "./defaultConfig";
import { nDaysFromNow } from "./utils/utils";  



export let defaultStoreItems : Store = {
    ...defaultConfig,

    sync:true,
    lastSync:new Date(),
    syncInterval:60 * 1000 * 5,

    showWhenCalendar : false, 
    whenTodo : null,
    whenCalendarPopupX : 0, 
    whenCalendarPopupY : 0,
    showLicense : false, 
    selectedTodo : null, 
    scrolledTodo : null,
    shouldSendStatistics : true,  
    hideHint : true,  
    progress : null,  
    scheduledReminders : [],  
    showUpdatesNotification : false, 
    limit:nDaysFromNow(200), 
    searchQuery : "", 
    openChangeGroupPopup : false,    
    selectedSettingsSection : "QuickEntry",
    openSettings : false,   
    openRepeatPopup : null, 
    showRepeatPopup : false,
    repeatTodo : null, 
    repeatPopupX : 0, 
    repeatPopupY : 0,
    showCalendarEvents : true,
    calendars:[],
    selectedCategory : "inbox",
    showTrashPopup : false, 
    openSearch : false, 
    dragged : null, 
    openTodoInputPopup : false, 
    selectedTag : "All",
    leftPanelWidth : window.innerWidth/3.7, 
    selectedProjectId : null,
    selectedAreaId : null,
    showProjectMenuPopover : false,
    closeAllItems : undefined,
    openRightClickMenu : undefined,
    openNewProjectAreaPopup : false,
    showRightClickMenu : false,
    rightClickedTodoId : null,
    rightClickMenuX : 0,
    rightClickMenuY : 0,
    projects : [],
    areas : [],  
    clone : false,
    todos : []
};      

