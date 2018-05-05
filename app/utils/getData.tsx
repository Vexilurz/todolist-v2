import { 
    isEmpty, last, isNil, contains, all, not, assoc, flatten, reduce, prop, evolve, uniq,
    toPairs, map, compose, allPass, cond, defaultTo, reject, when, ifElse, identity, and 
} from 'ramda';
import { isNotArray, isDate, isTodo, isString, isNotNil } from '../utils/isSomething';
import { Observable, Subscription } from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { Heading, LayoutItem, Calendar, Todo, Project, Area, Databases, action, actionLoadDatabase } from '.././types';
import { noteFromText } from './draftUtils';
import { convertProjectDates, convertAreaDates, convertTodoDates, measureTimePromise, typeEquals } from './utils';
import { updateCalendars } from '../Components/Calendar';
import { inPast, oneMinuteLater } from './time';
import { ipcRenderer } from 'electron';
import { pouchWorker } from '../app';
import { globalErrorHandler } from './globalErrorHandler';
import { workerSendAction } from './workerSendAction';

export let moveReminderFromPast : (todo:Todo) => Todo =  
    when(
        compose(inPast, prop('reminder')),
        (t:Todo) => assoc('reminder', oneMinuteLater(new Date()),t)
    ); 



export let assureCorrectNoteTypeTodo : (todo:Todo) => Todo = 
    when(
        compose(isString, prop('note')),
        evolve({note:noteFromText})
    );



export let assureCorrectNoteTypeProject : (project:Project) => Project = 
    when(
        compose(isString, prop('description')),
        evolve({description:noteFromText})
    );   
    


export let updateQuickEntryData = (data) => {
    let {projects,areas,todos,calendars} = data;

    let indicators = {}; 

    ipcRenderer.send('updateQuickEntryData', {todos,projects,areas,indicators});

    return {projects, areas, todos, calendars};
};    



export let assureCorrectCompletedTypeTodo : (todo:Todo) => Todo =  
    when(
      compose(isNotNil, prop('completed')),
      (t:Todo) => ({...t, completedSet:t.completed, completedWhen:t.completed})
    ); 



export let getData = (key:string) : Promise<Databases> => {
    let actionLoadDatabase : actionLoadDatabase = {type:"load",load:key};
    return workerSendAction(pouchWorker)(actionLoadDatabase);
}



