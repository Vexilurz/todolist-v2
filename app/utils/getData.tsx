import { 
    isEmpty, last, isNil, contains, all, not, assoc, flatten, reduce, prop, evolve,uniq,
    toPairs, map, compose, allPass, cond, defaultTo, reject, when, ifElse, identity, and 
} from 'ramda';
import { isNotArray, isDate, isTodo, isString } from '../utils/isSomething';
import { 
    getTodos, updateTodo, Todo, removeTodo, addTodo, getProjects, 
    getAreas, queryToProjects, queryToAreas, Project, Area, initDB, 
    removeArea, removeProject, destroyEverything, addArea, addProject, 
    addTodos, addProjects, addAreas, Heading, LayoutItem, getCalendars, 
    Calendar, getDatabaseObjects
} from '.././database';
import { noteFromText } from './draftUtils';
import { convertProjectDates, convertAreaDates, convertTodoDates } from './utils';
import { updateCalendars } from '../Components/Calendar';


let noteIsString = compose(isString, prop('note'));
let assureCorrectNoteType : (todo:Todo) => Todo = when(noteIsString,evolve({note:noteFromText}));


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
                projects:map(convertProjectDates),
                areas:map(convertAreaDates),
                todos:map(compose(assureCorrectNoteType, convertTodoDates)),  
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
    );

