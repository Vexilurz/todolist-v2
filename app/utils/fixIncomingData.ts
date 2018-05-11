import { convertEventDate } from './../Components/Calendar';
import { map, cond, compose, evolve, identity, defaultTo } from 'ramda';
import { typeEquals, convertTodoDates, convertProjectDates, convertAreaDates, removeRev } from './utils';
import { setDefaultsTodo, setDefaultsProject, setDefaultsArea, setDefaultsCalendar } from './setDefaults';
import { assureCorrectCompletedTypeTodo, moveReminderFromPast, assureCorrectNoteTypeTodo, assureCorrectNoteTypeProject } from './getData';


export let fixIncomingData = 
    evolve({
        todos: compose(
            map( 
                //order matters here !
                compose(  
                    moveReminderFromPast, 
                    convertTodoDates,
                    assureCorrectCompletedTypeTodo, 
                    assureCorrectNoteTypeTodo,
                    setDefaultsTodo,
                    removeRev
                )  
            ),
            defaultTo([]) 
        ),
        projects:compose(
            map( 
                compose( 
                    convertProjectDates,
                    assureCorrectNoteTypeProject, 
                    setDefaultsProject,
                    removeRev
                )
            ),
            defaultTo([])
        ),
        areas:compose(
            map( 
                compose( 
                    convertAreaDates,
                    setDefaultsArea,
                    removeRev 
                ) 
            ),
            defaultTo([])
        ),
        calendars:compose(
            map( 
                compose(  
                    evolve({ events:map(convertEventDate) }),
                    setDefaultsCalendar,
                    removeRev 
                ) 
            ),
            defaultTo([]) 
        )
    });

