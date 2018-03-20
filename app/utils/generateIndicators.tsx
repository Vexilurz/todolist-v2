import { 
    cond, assoc, isNil, not, defaultTo, map, isEmpty, compose, contains, append, omit,
    prop, equals, identity, all, when, evolve, ifElse, applyTo, reduce, add, groupBy 
} from 'ramda';
import {
    isTodo, isProject, isArea, isArrayOfAreas, 
    isArrayOfProjects, isArrayOfTodos, isArray, 
    isString, isFunction, isDate
} from '../utils/isSomething';
import { Project, Todo } from '../database';

export let generateIndicators : 
(projects:Project[], todos:Todo[]) => { [key:string]:{active:number,completed:number,deleted:number}; } = 
 
(projects:Project[], todos:Todo[]) => compose(
    map( 
        reduce(
            (acc,val) => cond(
                [
                    [ 
                        t => isDate(t.deleted), 
                        t => evolve({deleted:add(1)}, acc) 
                    ],
                    [ 
                        t => isDate(t.completedSet), 
                        t => evolve({completed:add(1)}, acc) 
                    ],
                    [ 
                        t => true, 
                        t => evolve({active:add(1)}, acc) 
                    ]
                ]
            )(val),  
            { active:0, completed:0, deleted:0 }
        )
    ), 

    omit(['detached']),
    applyTo(todos),
    groupBy, 
    cond,
    append([ () => true, () => 'detached' ]),
    map(p => [t => contains(t._id, p.layout), () => p._id])
)(projects); 