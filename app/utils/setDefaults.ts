import { generateEmptyCalendar } from './generateEmptyCalendar';
import { generateEmptyArea, generateEmptyProject } from './utils';
import { Todo, Project, Area, Calendar } from './../types';
import { generateEmptyTodo } from './generateEmptyTodo';
import { generateId } from './generateId';
 

let setDefaults = (getTemplate:Function) => (next:any) => ({...getTemplate(),...next});

export let setDefaultsTodo : (todo:Todo) => Todo = setDefaults(
    () => generateEmptyTodo(generateId(), "inbox", 0)
);

export let setDefaultsProject : (project:Project) => Project = setDefaults(
    () => generateEmptyProject()
);

export let setDefaultsArea : (area:Area) => Area = setDefaults(
    () => generateEmptyArea()
);

export let setDefaultsCalendar : (calendar:Calendar) => Calendar = setDefaults(
    () => generateEmptyCalendar()
);
