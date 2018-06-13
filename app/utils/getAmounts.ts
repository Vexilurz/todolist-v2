import { Todo, Store } from '../types';
import { getFilters } from './getFilters';
import { generateAmounts } from './generateAmounts';

 

export let getAmounts = (props:Store) : { 
    inbox:number,
    today:number,
    hot:number,
    next:number,
    someday:number,
    logbook:number,
    trash:number
} => {
    let filters : {
        inbox:((todo:Todo) => boolean)[],
        today:((todo:Todo) => boolean)[], 
        hot:((todo:Todo) => boolean)[],
        next:((todo:Todo) => boolean)[],
        someday:((todo:Todo) => boolean)[],
        upcoming:((todo:Todo) => boolean)[],
        logbook:((todo:Todo) => boolean)[],
        trash:((todo:Todo) => boolean)[]
    } = getFilters(props.projects);

    let amounts = generateAmounts(props.todos, filters);

    return amounts;
};