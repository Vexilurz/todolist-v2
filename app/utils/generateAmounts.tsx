import { 
    cond, assoc, isNil, not, defaultTo, map, isEmpty, compose, contains, append, omit, 
    prop, equals, identity, all, when, evolve, ifElse, applyTo, reduce, add, groupBy, 
    //allPass 
} from 'ramda';
import {Project, Area, Todo} from '../database';
import { filter } from '../Components/MainContainer';



export let generateAmounts : (
    todos:Todo[],
    filters:{
        inbox:((todo:Todo) => boolean)[],//5
        today:((todo:Todo) => boolean)[],//5
        hot:((todo:Todo) => boolean)[],//5
        next:((todo:Todo) => boolean)[],//6
        someday:((todo:Todo) => boolean)[],//5
        logbook:((todo:Todo) => boolean)[],//3
        trash:((todo:Todo) => boolean)[]//1
    } 
) => {inbox:number,today:number,hot:number,next:number,someday:number,logbook:number,trash:number} =

    (todos,filters) => todos.reduce(
        (acc,val:Todo) => {
            if( 
                filters.inbox[0](val) &&
                filters.inbox[1](val) && 
                filters.inbox[2](val) && 
                filters.inbox[3](val) && 
                filters.inbox[4](val)  
            ){
                acc.inbox+=1;
            }else if( 
                filters.hot[0](val) &&
                filters.hot[1](val) &&
                filters.hot[2](val) &&
                filters.hot[3](val) 
            ){ 
                acc.hot+=1;
            }else if( 
                filters.today[0](val) &&
                filters.today[1](val) &&
                filters.today[2](val) &&
                filters.today[3](val) 
            ){
                acc.today+=1;
            }else if( 
                filters.next[0](val) &&
                filters.next[1](val) &&
                filters.next[2](val) &&
                filters.next[3](val) &&
                filters.next[4](val) 
            ){
                acc.next+=1; 
            }else if( 
                filters.someday[0](val) &&
                filters.someday[1](val) &&
                filters.someday[2](val) &&
                filters.someday[3](val) 
            ){
                acc.someday+=1;
            }else if(
                filters.logbook[0](val) &&
                filters.logbook[1](val) 
            ){
               acc.logbook+=1; 
            }else if( filters.trash[0](val) ){
               acc.trash+=1;
            }

            return acc;
        },
        { 
            inbox:0, 
            today:0,
            hot:0,
            next:0,
            someday:0,
            logbook:0,
            trash:0
        }
    );
