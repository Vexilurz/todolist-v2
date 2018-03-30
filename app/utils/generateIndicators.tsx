import { 
    cond, isNil, not, defaultTo, map, isEmpty, compose, contains, append, omit, concat,
    prop, equals, identity, all, when, evolve, ifElse, applyTo, reduce, add, groupBy 
} from 'ramda';
import {
    isTodo, isProject, isArea, isArrayOfAreas, 
    isArrayOfProjects, isArrayOfTodos, isArray, 
    isString, isFunction, isDate, isNotNil
} from '../utils/isSomething';
import { Project, Todo } from '../types';




export let generateIndicators : 
(projects:Project[], todos:Todo[]) => { [key:string]:{active:number,completed:number,deleted:number}; } = 
 
(projects:Project[], todos:Todo[]) => compose(
    map( 
        reduce(
            (acc,val) => cond([
                    [
                        t => isNotNil(t.deleted), 
                        t => evolve(
                                {
                                    deleted:add(1),
                                    trash:{
                                        completed:when(() => isNotNil(t.completedSet), add(1)), 
                                        active:when(() => isNil(t.completedSet), add(1)) 
                                    }
                                }, 
                                acc
                            )
                    ],  
                    [ 
                        t => isNotNil(t.completedSet), 
                        t => evolve({completed:add(1)}, acc) 
                    ],
                    [  
                        t => isNil(t.completedSet) && isNil(t.deleted), 
                        t => evolve({active:add(1)}, acc) 
                    ], 
                    [
                        t => true,
                        t => acc
                    ]  
            ])(val),
            { 
                active:0, 
                completed:0, 
                deleted:0,
                trash:{
                    completed:0,
                    active:0 
                }
            }
        )
    ), 

    omit(['detached']),
    applyTo(todos),
    groupBy, 
    cond,
    append([ () => true, () => 'detached' ]),
    map(p => [t => contains(t._id, p.layout), () => p._id])
)(projects); 