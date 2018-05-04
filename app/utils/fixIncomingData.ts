import { convertEventDate } from './../Components/Calendar';
import { map, cond, compose, evolve, identity } from 'ramda';
import { typeEquals, convertTodoDates, convertProjectDates, convertAreaDates } from './utils';
import { setDefaultsTodo, setDefaultsProject, setDefaultsArea, setDefaultsCalendar } from './setDefaults';

export let fixIncomingData = 
    map(
        cond(
            [
                [typeEquals("todo"), compose(convertTodoDates, setDefaultsTodo)],
                [typeEquals("project"), compose(convertProjectDates, setDefaultsProject)],
                [typeEquals("area"), compose(convertAreaDates, setDefaultsArea)],
                [
                    typeEquals("calendar"), 
                    compose(
                        evolve({
                            events:map(convertEventDate)
                        }), 
                        setDefaultsCalendar
                    )
                ],
                [() => true, identity]
            ]
        )
    );
