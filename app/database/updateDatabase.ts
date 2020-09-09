import { detectChanges } from './detectChanges';
import { pouchWorker } from './../app';
import { Project, Area, Todo, Calendar, Store, action, withId, Changes, DatabaseChanges, actionChanges } from '../types';
import { isDev } from '../utils/isDev';
import { 
    adjust, cond, all, isEmpty, contains, not, remove, uniq, assoc, reverse, flatten, 
    findIndex, splitAt, last, assocPath, isNil, and, complement, compose, values, 
    reject, concat, map, when, find, prop, ifElse, identity, path, equals, any,
    allPass, evolve, pick, defaultTo, pickBy, mapObjIndexed, forEachObjIndexed  
} from 'ramda'; 
import { 
    isTodo, isProject, isArea, isCalendar, isString, isArrayOfTodos, 
    isArrayOfProjects, isArrayOfAreas, isDate, isNumber, isNotNil 
} from '../utils/isSomething';
import { moveReminderFromPast } from '../utils/getData';
import { assert, assertC } from '../utils/assert';


let ignoredActions = [
    "setCalendars",
    "setTodos",
    "setProjects",
    "setAreas",
    "updateCalendar",
    "updateCalendars",
    "defaultTags",
    "quickEntrySavesTo",
    "enableShortcutForQuickEntry",
    "disableReminder",
    "moveCompletedItemsToLogbook",
    "groupTodos",
    "nextBackupCleanup",
    "nextUpdateCheck",
    "hideHint",
    "lastSync",
    "sync",
    "email",
    'showCalendarEvents',
    "openWhenCalendar",
    "selectedTodo",
    "scrolledTodo",
    "showLicense",
    "progress",
    "showUpdatesNotification",
    "limit",
    "searchQuery",
    "openChangeGroupPopup",
    "selectedSettingsSection",
    "openSettings",
    "showRepeatPopup",
    "openRepeatPopup",
    "openTodoInputPopup",
    "eraseDataStore",
    "showTrashPopup",
    "dragged",
    "openSearch",
    "showProjectMenuPopover",
    "selectedCategory",
    "leftPanelWidth",
    "selectedTags",
    "openNewProjectAreaPopup",
    "showRightClickMenu",
    "openRightClickMenu",
    "closeAllItems",
    "selectedProjectId",
    "selectedAreaId"
];
    

export let updateDatabase = (state:Store, load:action[]) => (newState:Store) : Store => { 
    
    let actionFromSync = (a:action) => a.kind==="sync";
    let actions = reject(a => contains(a.type)(ignoredActions) || actionFromSync(a))(load); 

    // ok so here is the problem
    // i have a loop in case sync actions mixed with user actions at this point
    // because actions will not be empty and infinite loop will be created : 
    // user changes data -> db changes -> sync -> db changes on different point -> as if user change data -> database changes 
    // ...etc...
    // this wont happen if actions will not be mixed 
    // assert --->>> all sync or none sync

    if(isDev() && any(actionFromSync)(load)){ 
       assertC(all(actionFromSync), `updateDatabase ${JSON.stringify(load)}`)(load); 
    }

    if(isEmpty(actions)){ return newState }

    let changes = detectChanges(state)(newState);

    if(isDev()){
       console.log('updateDatabase - changes', changes);
    }

    let items = compose(flatten,map(values),values)(changes);
 
    if(!isEmpty(changes) && !isEmpty(items)){ 
       let actionChanges : actionChanges = { type:"changes", load:changes, import:prop('import')(load[0]) };
       let actionChanges_json = JSON.parse(JSON.stringify(actionChanges));
       pouchWorker.postMessage(actionChanges_json);
    } 
    console.log('updateDatabase - return', newState);
    return newState; 
};          