import { Config } from "./types";
import { defaultTags } from './defaultTags';

export const defaultConfig : Config = { 
    email:null, 
    sync:false,
    nextUpdateCheck:new Date(),
    nextBackupCleanup:new Date(),
    firstLaunch:true,
    hideHint:false,
    defaultTags:defaultTags,  
    shouldSendStatistics:true,
    showCalendarEvents:true,
    groupTodos:false,
    preserveWindowWidth:true, //when resizing sidebar
    enableShortcutForQuickEntry:true,
    disableReminder:false,
    quickEntrySavesTo:"inbox", //inbox today next someday
    moveCompletedItemsToLogbook:"immediately"
};
