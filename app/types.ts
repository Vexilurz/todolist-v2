
export interface ImportActionLoad{ 
    database:Databases, 
    pathToFile:string 
};



export interface ImportAction{
    type:"import",
    load:ImportActionLoad
};



export interface Option{ title:string, f:(e:any) => void };



export interface actionEncryptDatabase{ type:"encryptDatabase", load:string };



export interface actionSetKey{ type:"setKey", load:string };



export interface actionStartSync{ type:"startSync", load:string };



export interface actionStopSync{ type:"stopSync", load:void };



export interface actionChanges{ type:"changes", load:Changes };



export interface actionLoadDatabase{ type:"load", load:void };



export interface actionSetDatabase{ type:"set", load:Databases };



export interface Databases{
    todos:Todo[],
    projects:Project[],
    areas:Area[],
    calendars:Calendar[]
}; 



export interface PouchChange<T>{
    doc_write_failures:number,
    docs:T[],
    docs_read:number,
    docs_written:number,
    errors:any[],
    last_seq:number,
    ok:boolean,
    start_time:string
};



export interface PouchChanges{
    change:PouchChange<any>,
    direction:"push" | "pull"
};



export type ItemWithPriority = Area | Project | Todo | Heading; 



export interface action{
     type:string,
     load:any,
     kind?:string
};



export type Reducer = (state:Store, action:any) => Store;



export type vcalPropsInitial = [string,Object,string,string];



export type rcal = {dates:Date[],ends:Date,name:string,rrule:any}[];



export interface vcalProps{
    name:string,
    object:Object,
    type:string,
    value:string
};



export interface CalendarEvent{ 
    name:string,
    start:Date, 
    end:Date, 
    description:string,
    type?:string
    sequenceEnd?:boolean, 
    sequenceStart?:boolean
};



export interface CalendarProps{ 
    name:string,
    description:string,
    timezone:string
}; 



export interface AxiosError{
    name:string,
    message:string 
};



export type IcalData = {
    calendar : CalendarProps, 
    events : CalendarEvent[],
    error? : AxiosError
}; 



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



export type section = 'QuickEntry' | 'CalendarEvents' | 'Advanced' | 'Tags' | 'Sync';



export interface Store extends Config{
  import : ImportActionLoad,
  lastSync : Date,
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
  selectedTags : string[], 
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
}; 



export interface DatabaseChanges<T>{
    add:T[],
    remove:T[],
    update:T[]
};



export interface Changes{
    todos:DatabaseChanges<Todo>,
    projects:DatabaseChanges<Project>,
    areas:DatabaseChanges<Area>,
    calendars:DatabaseChanges<Calendar>
};



export interface withId{ _id:string };



export interface PouchError{
    error:string,//"unauthorized"
    reason:string,
    status:number,//401 unauthorized
    message:string,
    docId:string
};



export interface Cookie{
    domain:string,
    name:string,
    session:boolean,
    expirationDate:number
};



export type withOne = (onError:Function, db:any) => (doc:any) => Promise<any>;



export type withMany = (onError:Function, db:any) => (docs:any[]) => Promise<any>;


  
export interface Config{
    secretKey:string,
    salt:string, 
    email:string,
    sync:boolean,    
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
    moveCompletedItemsToLogbook:string, //immediately
};



export type Indicators = { 
    [key:string]:{
        active:number,
        completed:number,
        deleted:number
    }; 
};



export interface RawDraftContentState{
    blocks:Block[],
    entityMap:any
};



export interface RegisteredListener{  
    name : string, 
    callback : (event:any,...args:any[]) => void
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
    events:CalendarEvent[],
    type:ObjectType, 
    enc?:boolean,  
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
  description : RawDraftContentState, 
  layout : LayoutItem[], 
  created : Date, 
  deadline : Date,
  deleted : Date,
  completed : Date, 
  attachedTags : string[], 
  hide? : Category[],
  expand? : number,
  enc? : boolean, 
  showCompleted? : boolean,
  showScheduled? : boolean
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
  hideContentFromAreasList? : boolean,
  enc?:boolean 
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
  completed?:Date,
  enc?:boolean 
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