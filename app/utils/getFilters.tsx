import { Todo, Project } from './../types';
import { contains, flatten, isNil } from 'ramda';
import { isString } from './isSomething';
import {    
    byDeleted, byNotDeleted, byCompleted, byNotCompleted, 
    byCategory, isDeadlineTodayOrPast, isTodayOrPast, byScheduled 
} from "./utils";  


export let getFilters = (projects:Project[]) : {
    inbox:((todo:Todo) => boolean)[],
    today:((todo:Todo) => boolean)[], 
    hot:((todo:Todo) => boolean)[],
    next:((todo:Todo) => boolean)[],
    someday:((todo:Todo) => boolean)[],
    upcoming:((todo:Todo) => boolean)[],
    logbook:((todo:Todo) => boolean)[],
    trash:((todo:Todo) => boolean)[]
} => ({
    inbox:[ 
        (() => { 
            let ids = flatten( projects.map(p => p.layout.filter(isString)) );
            return (t:Todo) => !contains(t._id)(ids); 
        })(), 
        (t:Todo) => isNil(t.attachedDate) && isNil(t.deadline), 
        byCategory("inbox"), 
        byNotCompleted,  
        byNotDeleted   
    ],
    today:[    
        (t:Todo) => isTodayOrPast(t.attachedDate) || isTodayOrPast(t.deadline), 
        (t:Todo) => t.category!=="someday",
        byNotCompleted,  
        byNotDeleted   
    ], 
    hot:[
        (todo:Todo) => isDeadlineTodayOrPast(todo.deadline),
        (t:Todo) => t.category!=="someday",
        byNotCompleted,  
        byNotDeleted  
    ],
    next:[ 
        (t:Todo) => isNil(t.attachedDate) && isNil(t.deadline),
        (t:Todo) => t.category!=="inbox" && t.category!=="someday",  
        byNotCompleted,   
        byNotDeleted    
    ],
    upcoming:[
        byScheduled,
        (t:Todo) => t.category!=="someday",
        byNotCompleted,  
        byNotDeleted   
    ],
    someday:[
        byCategory("someday"),
        (todo:Todo) => isNil(todo.deadline) && isNil(todo.attachedDate),
        byNotCompleted,   
        byNotDeleted 
    ],
    logbook:[byCompleted, byNotDeleted], 
    trash:[byDeleted]
});
