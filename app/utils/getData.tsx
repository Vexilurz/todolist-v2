import { 
    isEmpty, last, isNil, contains, all, not, assoc, flatten, reduce, prop, evolve, uniq,
    toPairs, map, compose, allPass, cond, defaultTo, reject, when, ifElse, identity, and 
} from 'ramda';
import { isNotArray, isDate, isTodo, isString } from '../utils/isSomething';
import { 
    getTodos, removeTodo, addTodo, getProjects, 
    getAreas, queryToProjects, queryToAreas, initDB, 
    removeArea, removeProject, destroyEverything, addArea, addProject, 
    addTodos, addProjects, addAreas, getCalendars, getDatabaseObjects
} from '.././database';
import { Heading, LayoutItem, Calendar, Todo, Project, Area } from '.././types';
import { noteFromText } from './draftUtils';
import { convertProjectDates, convertAreaDates, convertTodoDates } from './utils';
import { updateCalendars } from '../Components/Calendar';
import { inPast, oneMinuteLater } from './time';
import { ipcRenderer } from 'electron';
import { generateIndicators } from './generateIndicators';



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
    


export let moveReminderFromPast : (todo:Todo) => Todo =  
    when(
        compose(inPast, prop('reminder')),
        t => assoc('reminder', oneMinuteLater(new Date()), t)
    ); 



let updateQuickEntryData = (data) => {
    let {projects,areas,todos,calendars} = data;

    let indicators = generateIndicators(projects,todos);

    ipcRenderer.send('updateQuickEntryData', {todos,projects,areas,indicators});

    return {projects, areas, todos, calendars};
};    



export let getData = (limit:Date,onError:Function,max:number) : Promise<{
    projects:Project[],
    areas:Area[],
    todos:Todo[],
    calendars:Calendar[]
}> => 
    getDatabaseObjects(onError,max)
    .then(
        compose(
            evolve({  
                projects:map(compose(assureCorrectNoteTypeProject,convertProjectDates)),
                areas:map(convertAreaDates),
                todos:map(compose(moveReminderFromPast,assureCorrectNoteTypeTodo,convertTodoDates)),  
            }),
            ([calendars,projects,areas,todos]) => ({calendars,projects,areas,todos})
        )
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
    .then(updateQuickEntryData);

