export type ItemWithPriority = Area | Project | Todo | Heading; 



export type vcalPropsInitial = [string,Object,string,string];



export type rcal = {dates:Date[],ends:Date,name:string,rrule:any}[];



export interface vcalProps{
    name:string,
    object:Object,
    type:string,
    value:string
}



export interface CalendarEvent{ 
    name:string,
    start:Date, 
    end:Date, 
    description:string,
    type?:string
    sequenceEnd?:boolean, 
    sequenceStart?:boolean
}



export interface CalendarProps{ 
    name:string,
    description:string,
    timezone:string
} 



export interface AxiosError{
    name:string,
    message:string 
}



export type IcalData = {
    calendar : CalendarProps, 
    events : CalendarEvent[],
    error? : AxiosError
} 



export interface rrule{
    options:{
        byeaster:any,
        byhour:any,
        byminute:any,
        bymonth:any,
        bymonthday:any,
        bynmonthday:any,
        bynweekday:any,
        bysecond:any,
        bysetpos:any,
        byweekday:any,
        byweekno:any,
        byyearday:any,
        count:any,
        dtstart:Date,
        freq:number,
        interval:number,
        until:Date,
        wkst:0
    },
    origOptions:any
    timeset:any[]
    _cache:any
};



export interface Block{
    data:any,
    depth:number,
    entityRanges:any[],
    inlineStyleRanges:any[],
    key:string,
    text:string,
    type:string
}; 



export type section = 'QuickEntry' | 'CalendarEvents' | 'Advanced' | 'Tags';



export interface Store extends Config{
  showWhenCalendar : boolean, 
  whenTodo : Todo,
  whenCalendarPopupX : number, 
  whenCalendarPopupY : number,
  showLicense : boolean,
  progress : any, 
  scrolledTodo : Todo,
  selectedTodo : Todo, 
  showUpdatesNotification : boolean, 
  scheduledReminders : number[],
  limit : Date, 
  searchQuery : string,  
  openChangeGroupPopup : boolean,
  selectedSettingsSection : section, 
  openSettings : boolean,
  openSearch : boolean, 
  openTodoInputPopup : boolean, 
  openRightClickMenu : any, 
  openRepeatPopup : any, 
  showRepeatPopup : boolean,
  repeatTodo : Todo,
  repeatPopupX : number,
  repeatPopupY : number,
  showRightClickMenu : boolean, 
  openNewProjectAreaPopup : boolean,
  showProjectMenuPopover : boolean,
  showTrashPopup : boolean,
  selectedCategory : Category,
  selectedTag : string, 
  leftPanelWidth : number,
  closeAllItems : any, 
  dragged : string,
  selectedProjectId : string, 
  selectedAreaId : string,
  rightClickedTodoId : string,
  rightClickMenuX : number,
  rightClickMenuY : number,
  calendars : Calendar[],
  projects : Project[],
  areas : Area[],  
  todos : Todo[], 
  id? : number,
  clone? : boolean,
  dispatch? : Function
} 



export interface Config{
    nextBackupCleanup:Date,
    nextUpdateCheck:Date,
    firstLaunch:boolean, 
    defaultTags:string[],
    hideHint:boolean,
    shouldSendStatistics:boolean,
    showCalendarEvents:boolean,
    disableReminder:boolean,
    groupTodos:boolean,
    preserveWindowWidth:boolean, //when resizing sidebar
    enableShortcutForQuickEntry:boolean,
    quickEntrySavesTo:string, //inbox today next someday
    moveCompletedItemsToLogbook:string, //immediatelly
};



export interface RawDraftContentState{
    blocks:Block[],
    entityMap:any
};



export type Category = "inbox" | "today" | "upcoming" | "next" | "someday" | 
"logbook" | "trash" | "project" | "area" | "evening" | 
"deadline" | "search" | "group" | "search" | "reminder";



export type ObjectType = "heading" | "project" | "todo" | "area" | "calendar"; 



export interface Calendar{
    url:string, 
    name:string,
    description:string,
    timezone:string,
    active:boolean,
    events:any[],
    type:ObjectType, 
    _id:string
};  


 
export interface Heading{
  title : string, 
  priority : number,
  type : ObjectType,
  _id : string, 
  key : string 
};



export type LayoutItem = string | Heading;



export interface Project{
  _id : string,  
  type : ObjectType, 
  name : string,   
  priority : number,
  description : string, 
  layout : LayoutItem[], 
  created : Date, 
  deadline : Date,
  deleted : Date,
  completed : Date, 
  attachedTags : string[], 
  hide?:Category[],
  expand?:number,
  showCompleted?:boolean,
  showScheduled?:boolean
};

 
 
export interface Area{
  _id : string, 
  name : string,  
  type : ObjectType,
  priority : number,
  created : Date,
  deleted : Date, 
  description : string,
  attachedTags : string[], 
  attachedProjectsIds : string[], 
  hideContentFromAreasList? : boolean
};  



export interface RepeatOptions{
    interval : number,
    freq : 'week' | 'day' | 'month' | 'year',
    until : Date,
    count : number,
    selectedOption : 'on' | 'after' | 'never',
};



export interface Group{
   _id:string,  
   type:'never'|'on'|'after',
   options?:RepeatOptions,  
   last?:boolean
}; 
 


export interface ChecklistItem{
    text : string, 
    checked : boolean,
    idx : number,
    key : string,
    _id : string  
};   



export interface Todo{ 
  _id : string,
  category : Category, 
  type : ObjectType,
  title : string,
  priority : number,
  note : RawDraftContentState,  
  checklist : ChecklistItem[],
  reminder : Date,  
  deadline : Date,
  created : Date,
  deleted : Date, 
  attachedDate : Date,  
  attachedTags : string[], 
  completedSet : Date,
  completedWhen : Date, 
  group?:Group,
  completed?:Date 
}; 
  


export type Item = Area | Project | Todo; 



export interface Query<T>{
  total_rows: number, 
  offset: number,  
  rows: QueryResult<T>[]
};



export interface QueryResult<T>{
  doc:T,
  id:string, 
  key:string,
  value:Object 
};