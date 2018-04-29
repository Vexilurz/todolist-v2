import { 
    isEmpty, last, isNil, contains, all, not, assoc, flatten, reduce, prop, evolve, uniq,
    toPairs, map, compose, allPass, cond, defaultTo, reject, when, ifElse, identity, and 
} from 'ramda';
import { isNotArray, isDate, isTodo, isString, isNotNil } from '../utils/isSomething';
/*import { 
    getTodos, removeTodo, addTodo, getProjects, 
    getAreas, queryToProjects, queryToAreas, initDB, 
    removeArea, removeProject, destroyEverything, addArea, addProject, 
    addTodos, addProjects, addAreas, getCalendars, getDatabaseObjects
} from '.././database';*/
import { Heading, LayoutItem, Calendar, Todo, Project, Area } from '.././types';
import { noteFromText } from './draftUtils';
import { convertProjectDates, convertAreaDates, convertTodoDates, measureTimePromise } from './utils';
import { updateCalendars } from '../Components/Calendar';
import { inPast, oneMinuteLater } from './time';
import { ipcRenderer } from 'electron';


export let moveReminderFromPast : (todo:Todo) => Todo =  
    when(
        compose(inPast, prop('reminder')),
        (t:Todo) => assoc('reminder', oneMinuteLater(new Date()),t)
    ); 


let assureCorrectNoteTypeTodo : (todo:Todo) => Todo = 
    when(
        compose(isString, prop('note')),
        evolve({note:noteFromText})
    );


let assureCorrectNoteTypeProject : (project:Project) => Project = 
    when(
        compose(isString, prop('description')),
        evolve({description:noteFromText})
    );   
    

let updateQuickEntryData = (data) => {
    let {projects,areas,todos,calendars} = data;

    let indicators = {}; //TODO FIX!!! //generateIndicators(projects,todos);

    ipcRenderer.send('updateQuickEntryData', {todos,projects,areas,indicators});

    return {projects, areas, todos, calendars};
};    


let assureCorrectCompletedTypeTodo : (todo:Todo) => Todo =  
    when(
      compose(isNotNil, prop('completed')),
      (t:Todo) => ({...t, completedSet:t.completed, completedWhen:t.completed})
    ); 



export let getData =  (limit:Date,onError:Function,max:number) : Promise<{
    projects:Project[],
    areas:Area[],
    todos:Todo[],
    calendars:Calendar[]
}> => new Promise(
    resolve => resolve({projects:[],areas:[],todos:[],calendars:[]})
);
/*
    getDatabaseObjects(onError,max)
    .then(
        data => compose(
            evolve({  
                projects:map(
                    compose(
                        assureCorrectNoteTypeProject,
                        convertProjectDates
                    )
                ),
                areas:map(convertAreaDates),
                todos:map(
                    compose(
                        moveReminderFromPast, 
                        assureCorrectCompletedTypeTodo, 
                        assureCorrectNoteTypeTodo,
                        convertTodoDates
                    )
                ),  
            }),
            ([calendars,projects,areas,todos]) => ({calendars,projects,areas,todos})
        )(data)
    )  
    .then( 
        ({projects,areas,todos,calendars}) => updateCalendars(
            limit,
            calendars,
            onError
        ) 
        .then(
            (updated) => ({
                projects,
                areas,
                todos, 
                calendars:updated
            })
        ) 
    )
    .then(updateQuickEntryData)
*/

