import { convertEventDate } from './../Components/Calendar';
import { map, cond, compose, evolve, identity, defaultTo } from 'ramda';
import { typeEquals, convertTodoDates, convertProjectDates, convertAreaDates, removeRev } from './utils';
import { setDefaultsTodo, setDefaultsProject, setDefaultsArea, setDefaultsCalendar } from './setDefaults';
import { assureCorrectCompletedTypeTodo, moveReminderFromPast, assureCorrectNoteTypeTodo, assureCorrectNoteTypeProject } from './getData';

 
export let fixIncomingData = 
    evolve({
        todos: compose(
            map( 
                compose( 
                    removeRev,
                    moveReminderFromPast, 
                    assureCorrectCompletedTypeTodo, 
                    assureCorrectNoteTypeTodo,
                    convertTodoDates,
                    setDefaultsTodo
                )
            ),
            defaultTo([])
        ),
        projects:compose(
            map( 
                compose( 
                    assureCorrectNoteTypeProject, 
                    convertProjectDates,
                    removeRev,
                    setDefaultsProject
                )
            ),
            defaultTo([])
        ),
        areas:compose(
            map( 
                compose( 
                    removeRev, 
                    convertAreaDates,
                    setDefaultsArea 
                ) 
            ),
            defaultTo([])
        ),
        calendars:compose(
            map( 
                compose( 
                    removeRev, 
                    evolve({ events:map(convertEventDate) }),
                    setDefaultsCalendar 
                ) 
            ),
            defaultTo([]) 
        )
    });

